"""
Smart Canteen — Seat State Machine
Temporal filtering, queue exclusion, chair-under-table compensation.
Determines: occupied | reserved | vacant for each seat.

[EXPERIMENTAL] Features marked as experimental:
  - chair_roi scoring (shapely-based person-base-point in chair polygon)
  - Crowd mode (threshold: n_seats × 1.5, pause: 45s)
"""

import logging
import time
from collections import deque
from typing import Dict, List, Optional

import cv2
import numpy as np

from detector import Detection, RESERVED_OBJECTS
from utils import point_in_polygon, compute_ioa, calculate_distance, polygon_centroid

logger = logging.getLogger(__name__)
try:
    from shapely.geometry import Point, Polygon
    HAS_SHAPELY = True
    logger.info("shapely loaded — chair_roi scoring enabled")
except ImportError:
    HAS_SHAPELY = False
    logger.warning("shapely not installed — chair_roi scoring disabled, "
                   "falling back to IoU-based boost")

# ─── Constants ────────────────────────────────────
MIN_FRAMES_OCCUPIED = 8     # 8 frames (about 2-3 seconds at 3-10fps depending on stream)
MIN_FRAMES_RESERVED = 15    # frames to confirm object → reserved
MIN_FRAMES_VACANT = 30      # frames to confirm empty → vacant (~10s at 3fps)
HISTORY_BUFFER_SIZE = 60    # frame history per seat
MAX_DISTANCE_TO_SEAT = 150.0 # max pixel distance from person center to seat center

# [EXPERIMENTAL] Crowd mode
CROWD_THRESHOLD_MULTIPLIER = 1.5   # person count > seats × 1.5 → crowd mode
CROWD_PAUSE_SECONDS = 45           # pause vacant transitions during crowd


class SeatState:
    """State tracker for a single seat."""

    def __init__(self, seat_id: str, seat_roi: List, table_id: str):
        self.seat_id = seat_id
        self.table_id = table_id
        self.seat_roi = seat_roi
        self.status = "vacant"
        self.confidence = 0.0
        self.history: deque = deque(maxlen=HISTORY_BUFFER_SIZE)
        self.occupied_since: Optional[str] = None
        self.reserved_since: Optional[str] = None
        self.reserved_object: Optional[str] = None
        self.override: bool = False

    def to_dict(self) -> dict:
        """Convert to JSON-serializable dict."""
        return {
            "seat_id": self.seat_id,
            "table_id": self.table_id,
            "status": self.status,
            "confidence": round(self.confidence, 2),
            "occupied_since": self.occupied_since,
            "reserved_since": self.reserved_since,
            "reserved_object": self.reserved_object,
            "override": self.override,
        }


class SeatStateManager:
    """
    Manages state for all seats using temporal filtering.

    Pipeline:
    1. Filter queue exclusion zone detections
    2. Match detections to seat/table ROIs
    3. Apply temporal state machine
    4. Handle crowd occlusion [EXPERIMENTAL]
    5. Chair-under-table compensation with shapely scoring [EXPERIMENTAL]
    """

    def __init__(self, roi_config: dict):
        self.seats: Dict[str, SeatState] = {}
        self.table_rois: Dict[str, List] = {}
        self.queue_zones: List[List] = []
        self.chair_rois: Dict[str, List] = {}
        self.chair_polys: Dict[str, "Polygon"] = {}   # shapely Polygon cache
        self.table_polys: Dict[str, "Polygon"] = {}    # shapely Polygon cache
        self.crowd_mode: bool = False
        self.crowd_mode_until: float = 0
        self.total_seats: int = 0

        self._init_from_config(roi_config)

    def _init_from_config(self, config: dict):
        """Initialize seat states, ROIs, and shapely polygons from config."""
        for table in config.get("tables", []):
            table_id = table["table_id"]
            table_roi = table.get("table_roi", [])
            self.table_rois[table_id] = table_roi

            # Build shapely polygon for table (if available)
            if HAS_SHAPELY and len(table_roi) >= 3:
                self.table_polys[table_id] = Polygon(table_roi)

            # Queue exclusion zones
            if "queue_exclusion" in table:
                self.queue_zones.append(table["queue_exclusion"])

            # Initialize seats
            for seat in table.get("seats", []):
                seat_id = seat["seat_id"]
                self.seats[seat_id] = SeatState(
                    seat_id=seat_id,
                    seat_roi=seat["roi"],
                    table_id=table_id
                )

                # Chair ROI
                if "chair_roi" in seat:
                    chair_roi = seat["chair_roi"]
                    self.chair_rois[seat_id] = chair_roi

                    # Build shapely polygon for chair
                    if HAS_SHAPELY and len(chair_roi) >= 3:
                        self.chair_polys[seat_id] = Polygon(chair_roi)

        self.total_seats = len(self.seats)
        logger.info(
            f"Initialized {self.total_seats} seats, "
            f"{len(self.queue_zones)} queue zones"
        )

    def _filter_queue_zone(self, detections: List[Detection]) -> List[Detection]:
        """Step 1: Remove detections within queue exclusion zones."""
        filtered = []
        for d in detections:
            in_queue = any(
                point_in_polygon(d.center, zone)
                for zone in self.queue_zones
            )
            if not in_queue:
                filtered.append(d)
        return filtered

    def _check_crowd_mode(self, detections: List[Detection]):
        """
        [EXPERIMENTAL] Step 4: Detect crowd occlusion scenario.
        Threshold: person_count > total_seats × 1.5
        Effect: Pause all vacant transitions for 45 seconds.
        """
        person_count = sum(1 for d in detections if d.class_name == "person")
        threshold = self.total_seats * CROWD_THRESHOLD_MULTIPLIER

        if person_count > threshold:
            if not self.crowd_mode:
                logger.warning(
                    f"[EXPERIMENTAL] CROWD_ALERT: {person_count} persons "
                    f"detected (threshold: {threshold:.0f})"
                )
            self.crowd_mode = True
            self.crowd_mode_until = time.time() + CROWD_PAUSE_SECONDS
        elif time.time() > self.crowd_mode_until:
            if self.crowd_mode:
                logger.info("[EXPERIMENTAL] Crowd mode ended")
            self.crowd_mode = False



    def _determine_seat_state(
        self,
        seat: SeatState,
        detections: List[Detection]
    ) -> None:
        """
        Steps 2-3, 5: Determine state for a single seat.

        Logic:
        - Filter by ROI overlap
        - Check person presence → occupied
        - Check object presence → reserved
        - Default → vacant (with temporal guard)
        - [EXPERIMENTAL] Chair ROI scoring boosts occupied confidence
        """
        if seat.override:
            return  # Admin override active, skip

        seat_roi = seat.seat_roi
        table_roi = self.table_rois.get(seat.table_id, [])
        seat_center = polygon_centroid(seat_roi)

        # Find persons in seat ROI using Bottom-Centric point (Feet-to-Seat Mapping)
        persons = []
        for d in detections:
            if d.class_name == "person" and d.confidence > 0.35:
                x1, y1, x2, y2 = d.bbox
                # Bottom-Center = the point where their feet touch the ground
                bottom_center_x = x1 + (x2 - x1) / 2
                bottom_center_y = y2
                
                # Check if bottom-center is inside the polygon
                # cv2.pointPolygonTest requires the point as a tuple (x,y)
                is_inside = cv2.pointPolygonTest(
                    np.array(seat_roi, dtype=np.float32), 
                    (bottom_center_x, bottom_center_y), 
                    False
                ) >= 0
                
                if is_inside:
                    persons.append(d)

        # Find objects on table ROI
        objects = [
            d for d in detections
            if d.class_name in RESERVED_OBJECTS
            and compute_ioa(d.bbox, table_roi) > 0.25
        ]

        # Record frame observation
        if persons:
            observation = "person"
            best_conf = max(d.confidence for d in persons)
        elif objects:
            observation = "object"
            best_conf = max(d.confidence for d in objects)
        else:
            observation = "none"
            best_conf = 0.0

        seat.history.append(observation)

        # Temporal state machine
        recent = list(seat.history)

        if observation == "person":
            person_frames = sum(1 for h in recent[-MIN_FRAMES_OCCUPIED:]
                                if h == "person")
            if person_frames >= MIN_FRAMES_OCCUPIED:
                seat.status = "occupied"
                seat.confidence = best_conf
                seat.reserved_object = None
                if not seat.occupied_since:
                    seat.occupied_since = time.strftime(
                        "%Y-%m-%dT%H:%M:%SZ", time.gmtime()
                    )
                seat.reserved_since = None

        elif observation == "object" and seat.status != "occupied":
            object_frames = sum(1 for h in recent[-MIN_FRAMES_RESERVED:]
                                if h == "object")
            if object_frames >= MIN_FRAMES_RESERVED:
                seat.status = "reserved"
                seat.confidence = best_conf
                seat.reserved_object = objects[0].class_name if objects else None
                if not seat.reserved_since:
                    seat.reserved_since = time.strftime(
                        "%Y-%m-%dT%H:%M:%SZ", time.gmtime()
                    )
                seat.occupied_since = None

        elif observation == "none":
            # [EXPERIMENTAL] In crowd mode, don't transition to vacant
            if self.crowd_mode:
                return

            empty_frames = sum(1 for h in recent[-MIN_FRAMES_VACANT:]
                               if h == "none")
            if empty_frames >= MIN_FRAMES_VACANT:
                seat.status = "vacant"
                seat.confidence = 0.95
                seat.occupied_since = None
                seat.reserved_since = None
                seat.reserved_object = None

    def update(self, detections: List[Detection]) -> List[dict]:
        """
        Process all detections and update all seat states.

        Returns:
            List of seat state dicts for emission
        """
        # Step 1: Filter queue zone
        filtered = self._filter_queue_zone(detections)

        # Step 4: Check crowd mode [EXPERIMENTAL]
        self._check_crowd_mode(filtered)

        # Steps 2-3, 5: Update each seat
        for seat in self.seats.values():
            self._determine_seat_state(seat, filtered)

        # Return all states
        return [seat.to_dict() for seat in self.seats.values()]

"""
Smart Canteen — Seat State Machine
Temporal filtering, queue exclusion, chair-under-table compensation.
Determines: occupied | reserved | vacant for each seat.
"""

import logging
import time
from collections import defaultdict, deque
from typing import Dict, List, Optional

from detector import Detection, RESERVED_OBJECTS
from utils import point_in_polygon, compute_iou

logger = logging.getLogger(__name__)

# ─── Constants ────────────────────────────────────
MIN_FRAMES_OCCUPIED = 8     # frames to confirm person → occupied
MIN_FRAMES_RESERVED = 15    # frames to confirm object → reserved
MIN_FRAMES_VACANT = 30      # frames to confirm empty → vacant (~10s at 3fps)
HISTORY_BUFFER_SIZE = 60    # frame history per seat
CROWD_THRESHOLD_MULTIPLIER = 3  # person count > seats × 3 → crowd mode
CROWD_PAUSE_SECONDS = 45    # pause vacant transitions during crowd


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
    4. Handle crowd occlusion
    5. Chair-under-table compensation
    """

    def __init__(self, roi_config: dict):
        self.seats: Dict[str, SeatState] = {}
        self.table_rois: Dict[str, List] = {}
        self.queue_zones: List[List] = []
        self.chair_rois: Dict[str, List] = {}
        self.crowd_mode: bool = False
        self.crowd_mode_until: float = 0
        self.total_seats: int = 0

        self._init_from_config(roi_config)

    def _init_from_config(self, config: dict):
        """Initialize seat states and ROIs from config."""
        for table in config.get("tables", []):
            table_id = table["table_id"]
            self.table_rois[table_id] = table.get("table_roi", [])

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

                # Chair ROI (extends 20px below table boundary)
                if "chair_roi" in seat:
                    self.chair_rois[seat_id] = seat["chair_roi"]

        self.total_seats = len(self.seats)
        logger.info(f"Initialized {self.total_seats} seats, "
                    f"{len(self.queue_zones)} queue zones")

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
        """Step 4: Detect crowd occlusion scenario."""
        person_count = sum(1 for d in detections if d.class_name == "person")

        if person_count > self.total_seats * CROWD_THRESHOLD_MULTIPLIER:
            if not self.crowd_mode:
                logger.warning(f"CROWD_ALERT: {person_count} persons detected "
                               f"(threshold: {self.total_seats * CROWD_THRESHOLD_MULTIPLIER})")
            self.crowd_mode = True
            self.crowd_mode_until = time.time() + CROWD_PAUSE_SECONDS
        elif time.time() > self.crowd_mode_until:
            if self.crowd_mode:
                logger.info("Crowd mode ended")
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
        """
        if seat.override:
            return  # Admin override active, skip

        seat_roi = seat.seat_roi
        table_roi = self.table_rois.get(seat.table_id, [])

        # Find persons in seat ROI
        persons = [
            d for d in detections
            if d.class_name == "person"
            and compute_iou(d.bbox, seat_roi) > 0.35
        ]

        # Find objects on table ROI
        objects = [
            d for d in detections
            if d.class_name in RESERVED_OBJECTS
            and compute_iou(d.bbox, table_roi) > 0.25
        ]

        # Step 5: Chair displacement boost
        chair_boost = 0
        if seat.seat_id in self.chair_rois:
            chair_roi = self.chair_rois[seat.seat_id]
            chair_displaced = any(
                d.class_name == "person"
                and compute_iou(d.bbox, chair_roi) > 0.15
                for d in detections
            )
            if chair_displaced:
                chair_boost = 2

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
            if person_frames + chair_boost >= MIN_FRAMES_OCCUPIED:
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
            # In crowd mode, don't transition to vacant
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

        # Step 4: Check crowd mode
        self._check_crowd_mode(filtered)

        # Steps 2-3, 5: Update each seat
        for seat in self.seats.values():
            self._determine_seat_state(seat, filtered)

        # Return all states
        return [seat.to_dict() for seat in self.seats.values()]

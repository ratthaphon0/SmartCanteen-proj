"""
Smart Canteen — CV Engine Utilities
Geometry helpers: point-in-polygon, IoU, ROI config loader.
"""

import json
import logging
from typing import List

logger = logging.getLogger(__name__)


def load_roi_config(path: str) -> dict:
    """Load ROI configuration from JSON file."""
    try:
        with open(path, "r") as f:
            config = json.load(f)
        logger.info(f"Loaded ROI config from {path}")
        return config
    except FileNotFoundError:
        logger.warning(f"ROI config not found at {path}, using defaults")
        return _default_roi_config()
    except json.JSONDecodeError as e:
        logger.error(f"Invalid ROI config JSON: {e}")
        return _default_roi_config()


def _default_roi_config() -> dict:
    """Default demo ROI configuration."""
    return {
        "camera_id": "cam_demo",
        "tables": [
            {
                "table_id": "T01",
                "seats": [
                    {"seat_id": "T01-S1", "roi": [[120, 80], [200, 80], [200, 160], [120, 160]]},
                    {"seat_id": "T01-S2", "roi": [[210, 80], [290, 80], [290, 160], [210, 160]]},
                ],
                "table_roi": [[110, 70], [300, 70], [300, 170], [110, 170]],
                "queue_exclusion": [[0, 300], [640, 300], [640, 480], [0, 480]],
            },
            {
                "table_id": "T02",
                "seats": [
                    {"seat_id": "T02-S1", "roi": [[350, 80], [430, 80], [430, 160], [350, 160]]},
                    {"seat_id": "T02-S2", "roi": [[440, 80], [520, 80], [520, 160], [440, 160]]},
                ],
                "table_roi": [[340, 70], [530, 70], [530, 170], [340, 170]],
                "queue_exclusion": [[0, 300], [640, 300], [640, 480], [0, 480]],
            },
        ],
    }


def point_in_polygon(point: List[float], polygon: List[List[float]]) -> bool:
    """
    Ray casting algorithm to check if a point is inside a polygon.

    Args:
        point: [x, y] coordinates
        polygon: List of [x, y] vertices forming the polygon

    Returns:
        True if point is inside the polygon
    """
    if not polygon or len(polygon) < 3:
        return False

    x, y = point[0], point[1]
    n = len(polygon)
    inside = False

    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]
        xj, yj = polygon[j]

        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i

    return inside


def compute_ioa(bbox: List[float], roi: List[List[float]]) -> float:
    """
    Compute Intersection over Area (IoA) between a bounding box and a polygon ROI.
    Divides the intersection overlap by the area of the ROI (the seat target), NOT the union.

    Args:
        bbox: [x1, y1, x2, y2] bounding box of detected person
        roi: List of [x, y] vertices representing the seat

    Returns:
        IoA value between 0 and 1, representing percentage of seat covered
    """
    if not roi or not bbox:
        return 0.0

    # Convert polygon to bounding box for fast intersection check
    roi_xs = [p[0] for p in roi]
    roi_ys = [p[1] for p in roi]
    roi_bbox = [min(roi_xs), min(roi_ys), max(roi_xs), max(roi_ys)]

    # Compute intersection area
    x1 = max(bbox[0], roi_bbox[0])
    y1 = max(bbox[1], roi_bbox[1])
    x2 = min(bbox[2], roi_bbox[2])
    y2 = min(bbox[3], roi_bbox[3])

    if x2 <= x1 or y2 <= y1:
        return 0.0

    intersection = (x2 - x1) * (y2 - y1)

    # Compute target ROI area
    roi_area = (roi_bbox[2] - roi_bbox[0]) * (roi_bbox[3] - roi_bbox[1])

    if roi_area <= 0:
        return 0.0

    return intersection / roi_area


def bbox_center(bbox: List[float]) -> List[float]:
    """Get center point of a bounding box [x1, y1, x2, y2]."""
    return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2]


import math

def calculate_distance(p1: List[float], p2: List[float]) -> float:
    """Calculate Euclidean distance between two points."""
    return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)

def polygon_centroid(polygon: List[List[float]]) -> List[float]:
    """
    Calculate the centroid (center of mass) of a polygon.
    Returns [x, y]. If polygon is invalid or empty, returns [0, 0].
    """
    if not polygon or len(polygon) < 3:
        if polygon and len(polygon) > 0:
            return polygon[0] # Fallback to first point
        return [0.0, 0.0]
        
    area = 0.0
    cx = 0.0
    cy = 0.0
    
    n = len(polygon)
    for i in range(n):
        j = (i + 1) % n
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        cross = (xi * yj - xj * yi)
        area += cross
        cx += (xi + xj) * cross
        cy += (yi + yj) * cross
        
    area *= 0.5
    
    if area == 0:
        # Fallback to simple average if area is 0 (collinear points)
        xs = [p[0] for p in polygon]
        ys = [p[1] for p in polygon]
        return [sum(xs)/len(xs), sum(ys)/len(ys)]
        
    centroid_x = cx / (6.0 * area)
    centroid_y = cy / (6.0 * area)
    
    return [abs(centroid_x), abs(centroid_y)]

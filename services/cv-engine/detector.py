"""
Smart Canteen — YOLOv8 Detector Wrapper
Handles model loading, inference, and NMS filtering.
"""

import logging
from dataclasses import dataclass, field
from typing import List, Optional

import numpy as np

logger = logging.getLogger(__name__)

# Object classes relevant for canteen detection
PERSON_CLASS = "person"
RESERVED_OBJECTS = ["backpack", "handbag", "bottle", "bowl", "cup", "laptop", "cell phone"]
ALL_TARGET_CLASSES = [PERSON_CLASS] + RESERVED_OBJECTS


@dataclass
class Detection:
    """Single detection result."""
    class_name: str
    confidence: float
    bbox: List[float]         # [x1, y1, x2, y2]
    center: List[float] = field(default_factory=list)

    def __post_init__(self):
        if not self.center:
            x1, y1, x2, y2 = self.bbox
            self.center = [(x1 + x2) / 2, (y1 + y2) / 2]


class SeatDetector:
    """YOLOv8 wrapper for seat/person/object detection."""

    def __init__(
        self,
        model_size: str = "yolov8n",
        confidence: float = 0.45,
        iou_threshold: float = 0.45,
        model_path: Optional[str] = None
    ):
        self.model_size = model_size
        self.confidence = confidence
        self.iou_threshold = iou_threshold
        self.model = None

        self._load_model(model_path)

    def _load_model(self, model_path: Optional[str] = None):
        """Load YOLOv8 model."""
        try:
            from ultralytics import YOLO

            if model_path:
                self.model = YOLO(model_path)
            else:
                # Use pretrained COCO model
                self.model = YOLO(f"{self.model_size}.pt")

            logger.info(f"Model loaded: {self.model_size} "
                        f"(conf={self.confidence}, iou={self.iou_threshold})")

        except ImportError:
            logger.warning("ultralytics not installed — using mock detector")
            self.model = None
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.model = None

    def detect(self, frame: np.ndarray) -> List[Detection]:
        """
        Run YOLOv8 inference on a frame.

        Args:
            frame: Preprocessed frame (640x640)

        Returns:
            List of Detection objects for target classes only
        """
        if self.model is None:
            return self._mock_detect()

        # Run inference
        results = self.model(
            frame,
            conf=self.confidence,
            iou=self.iou_threshold,
            verbose=False
        )

        detections = []
        for result in results:
            boxes = result.boxes
            if boxes is None:
                continue

            for i in range(len(boxes)):
                class_id = int(boxes.cls[i])
                class_name = self.model.names[class_id]

                # Only keep target classes
                if class_name not in ALL_TARGET_CLASSES:
                    continue

                conf = float(boxes.conf[i])
                bbox = boxes.xyxy[i].tolist()

                # Apply different confidence thresholds
                # Persons: 0.45, Objects: 0.35
                min_conf = self.confidence if class_name == PERSON_CLASS else 0.35
                if conf < min_conf:
                    continue

                detections.append(Detection(
                    class_name=class_name,
                    confidence=conf,
                    bbox=bbox
                ))

        return detections

    def _mock_detect(self) -> List[Detection]:
        """Mock detector for testing without model."""
        return [
            Detection(
                class_name="person",
                confidence=0.92,
                bbox=[150, 100, 250, 300]
            ),
            Detection(
                class_name="backpack",
                confidence=0.78,
                bbox=[350, 120, 420, 200]
            ),
        ]

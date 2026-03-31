"""
Smart Canteen — CV Engine Main
Stream processor entrypoint: camera capture → detection → state logic → emit to Redis
"""

import asyncio
import json
import logging
import os
import time
from typing import Optional

import cv2
import numpy as np
import redis.asyncio as redis

from detector import SeatDetector
from seat_logic import SeatStateManager
from utils import load_roi_config

# ─── Configuration ────────────────────────────────
CAMERA_SOURCE = os.getenv("CAMERA_SOURCE", "0")  # RTSP URL or device index
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
API_WS_URL = os.getenv("API_WS_URL", "ws://localhost:8000/ws/seats")
MODEL_SIZE = os.getenv("MODEL_SIZE", "yolov8n")
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.45"))
EMIT_INTERVAL = 2.0  # seconds between state emissions
FRAME_SIZE = (640, 640)

# ─── Logging ──────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [CV-ENGINE] %(levelname)s %(message)s"
)
logger = logging.getLogger(__name__)


class CVEnginePipeline:
    """Main CV processing pipeline for seat detection."""

    def __init__(self):
        self.detector: Optional[SeatDetector] = None
        self.state_manager: Optional[SeatStateManager] = None
        self.redis_client: Optional[redis.Redis] = None
        self.roi_config: dict = {}
        self.running: bool = False

    async def initialize(self):
        """Load model, ROI config, and connect to Redis."""
        logger.info("Initializing CV Engine Pipeline...")

        # Load ROI configuration
        self.roi_config = load_roi_config("/app/roi_config.json")
        logger.info(f"Loaded ROI config: {len(self.roi_config.get('tables', []))} tables")

        # Initialize YOLOv8 detector
        self.detector = SeatDetector(
            model_size=MODEL_SIZE,
            confidence=CONFIDENCE_THRESHOLD
        )
        logger.info(f"Loaded model: {MODEL_SIZE}")

        # Initialize state manager
        self.state_manager = SeatStateManager(self.roi_config)

        # Connect to Redis
        self.redis_client = redis.from_url(REDIS_URL, decode_responses=True)
        await self.redis_client.ping()
        logger.info("Connected to Redis")

    def preprocess_frame(self, frame: np.ndarray) -> np.ndarray:
        """
        Step 1: Frame preprocessing
        - Gaussian blur to reduce false detections
        - Resize to model input size
        """
        # Apply Gaussian blur (kernel 3x3)
        blurred = cv2.GaussianBlur(frame, (3, 3), 0)

        # Resize to model input size
        resized = cv2.resize(blurred, FRAME_SIZE)

        return resized

    async def process_frame(self, frame: np.ndarray) -> dict:
        """Process a single frame through the detection pipeline."""
        # Step 1: Preprocess
        processed = self.preprocess_frame(frame)

        # Step 2: Run YOLOv8 detection
        detections = self.detector.detect(processed)

        # Step 3-5: Update seat states via state manager
        seat_states = self.state_manager.update(detections)

        return seat_states

    async def emit_state(self, seat_states: dict):
        """
        Step 6: Publish seat states to Redis channel
        with TTL of 10 seconds per key.
        """
        if not self.redis_client:
            return

        payload = {
            "event": "seat_update",
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "camera_id": self.roi_config.get("camera_id", "unknown"),
            "seats": seat_states
        }

        # Publish to Redis channel
        await self.redis_client.publish("seat:updates", json.dumps(payload))

        # Also set as key with TTL for direct access
        await self.redis_client.setex(
            f"seat:state:{self.roi_config.get('camera_id', 'default')}",
            10,  # TTL 10 seconds
            json.dumps(payload)
        )

    async def run_camera_loop(self):
        """Main camera capture → process → emit loop."""
        # Parse camera source (int for device index, str for RTSP)
        try:
            source = int(CAMERA_SOURCE)
        except ValueError:
            source = CAMERA_SOURCE

        cap = cv2.VideoCapture(source)
        if not cap.isOpened():
            logger.error(f"Cannot open camera source: {CAMERA_SOURCE}")
            logger.info("Running in demo mode with synthetic frames...")
            await self.run_demo_mode()
            return

        logger.info(f"Camera opened: {CAMERA_SOURCE}")
        self.running = True
        last_emit = 0

        try:
            while self.running:
                ret, frame = cap.read()
                if not ret:
                    logger.warning("Frame capture failed, retrying...")
                    await asyncio.sleep(0.1)
                    continue

                # Process frame
                seat_states = await self.process_frame(frame)

                # Emit at configured interval
                now = time.time()
                if now - last_emit >= EMIT_INTERVAL:
                    await self.emit_state(seat_states)
                    last_emit = now

                # Small delay to prevent CPU overload
                await asyncio.sleep(0.033)  # ~30 FPS max

        finally:
            cap.release()
            logger.info("Camera released")

    async def run_demo_mode(self):
        """Demo mode: emit synthetic seat states for testing."""
        logger.info("Running in DEMO mode — generating synthetic seat data")
        self.running = True

        demo_seats = [
            {"seat_id": "T01-S1", "table_id": "T01", "status": "vacant",
             "confidence": 0.95, "camera_source": "demo"},
            {"seat_id": "T01-S2", "table_id": "T01", "status": "occupied",
             "confidence": 0.92, "camera_source": "demo"},
            {"seat_id": "T02-S1", "table_id": "T02", "status": "reserved",
             "confidence": 0.88, "reserved_object": "backpack", "camera_source": "demo"},
            {"seat_id": "T02-S2", "table_id": "T02", "status": "vacant",
             "confidence": 0.96, "camera_source": "demo"},
        ]

        while self.running:
            await self.emit_state(demo_seats)
            logger.info(f"Emitted demo state for {len(demo_seats)} seats")
            await asyncio.sleep(EMIT_INTERVAL)

    async def shutdown(self):
        """Graceful shutdown."""
        self.running = False
        if self.redis_client:
            await self.redis_client.close()
        logger.info("CV Engine shutdown complete")


async def main():
    """Entrypoint."""
    pipeline = CVEnginePipeline()

    try:
        await pipeline.initialize()
        await pipeline.run_camera_loop()
    except KeyboardInterrupt:
        logger.info("Shutting down...")
    finally:
        await pipeline.shutdown()


def test_camera():
    """Quick camera test function for Docker health check."""
    try:
        source = int(CAMERA_SOURCE)
    except ValueError:
        source = CAMERA_SOURCE

    cap = cv2.VideoCapture(source)
    if cap.isOpened():
        ret, frame = cap.read()
        cap.release()
        if ret:
            print(f"✅ Camera OK — Frame shape: {frame.shape}")
            return True
    print("❌ Camera not available — will use demo mode")
    return False


if __name__ == "__main__":
    asyncio.run(main())

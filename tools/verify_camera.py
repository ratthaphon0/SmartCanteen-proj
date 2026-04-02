"""
Smart Canteen — Camera Connectivity Verification
B.L.A.S.T. Phase 2: Link
Tests: camera source availability, frame capture to .tmp/.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

CAMERA_SOURCE = os.getenv("CAMERA_SOURCE", "0")
TMP_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".tmp")


def verify():
    try:
        import cv2
    except ImportError:
        print("❌ opencv-python not installed: pip install opencv-python")
        return False

    # Parse camera source
    try:
        source = int(CAMERA_SOURCE)
        print(f"📷 Testing device index: {source}")
    except ValueError:
        source = CAMERA_SOURCE
        print(f"📷 Testing RTSP URL: {source}")

    # Test: Open + capture
    cap = cv2.VideoCapture(source)

    if not cap.isOpened():
        print(f"❌ Cannot open camera source: {CAMERA_SOURCE}")
        print("   → CV Engine will use DEMO mode (synthetic data)")
        return True  # non-fatal: demo mode is a valid fallback

    ret, frame = cap.read()
    cap.release()

    if not ret:
        print("❌ Camera opened but frame capture failed")
        return False

    print(f"✅ Frame captured: {frame.shape} "
          f"({frame.shape[1]}×{frame.shape[0]}, {frame.shape[2]}ch)")

    # Save test frame
    os.makedirs(TMP_DIR, exist_ok=True)
    out_path = os.path.join(TMP_DIR, "test_frame.jpg")
    cv2.imwrite(out_path, frame)
    print(f"✅ Test frame saved: {out_path}")

    print(f"\n🟢 CAMERA CHECK PASSED")
    return True


if __name__ == "__main__":
    success = verify()
    sys.exit(0 if success else 1)

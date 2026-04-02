# SOP: CV Pipeline — Seat Detection Flow

> **Component:** `services/cv-engine/`
> **Owner:** Engineer A (AI/CV)
> **Status:** Experimental (chair_roi + crowd mode)

---

## Goal

Detect seat occupancy status (vacant / occupied / reserved) from camera frames using YOLOv8 and publish real-time states to Redis for downstream consumption.

## Data Flow

```
Camera (RTSP/Device)
  │
  ▼
Frame Capture (cv2.VideoCapture)
  │
  ▼
Preprocess (Gaussian blur + resize 640×640)
  │
  ▼
YOLOv8n Inference (conf=0.45, iou=0.45)
  │  Target classes: person, backpack, handbag, bottle, bowl, cup, laptop, cell phone
  │
  ▼
Queue Exclusion Filter (remove detections in queue zones)
  │
  ▼
Seat State Machine (per-seat temporal filtering)
  │  ├── Person in seat ROI → "occupied" (after 8 frames)
  │  ├── Object in table ROI → "reserved" (after 15 frames)
  │  ├── Neither → "vacant" (after 30 frames, ~10s at 3fps)
  │  └── Chair ROI boost → +5 occupancy score if person base in chair zone [EXPERIMENTAL]
  │
  ▼
Crowd Mode Check [EXPERIMENTAL]
  │  Threshold: person_count > total_seats × 1.5
  │  Effect: Pause all vacant transitions for 45s
  │
  ▼
Redis Publish
  ├── Channel: seat:updates (JSON payload)
  └── Key: seat:state:{camera_id} (TTL 10s)
```

## Inputs

| Input | Source | Format |
|-------|--------|--------|
| Camera frame | RTSP URL or `/dev/video0` | BGR numpy array |
| ROI config | `/app/roi_config.json` | JSON with table/seat/chair polygons |
| Model weights | `models/yolov8n.pt` | Ultralytics format |

## Output Payload

```json
{
  "event": "seat_update",
  "timestamp": "ISO-8601",
  "camera_id": "cam_zone_a",
  "seats": [
    {
      "seat_id": "T01-S1",
      "table_id": "T01",
      "status": "occupied",
      "confidence": 0.92,
      "occupied_since": "ISO-8601",
      "reserved_since": null,
      "reserved_object": null,
      "override": false
    }
  ]
}
```

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Camera unavailable | Falls back to demo mode (synthetic data) |
| Model not loaded | Uses `_mock_detect()` with 2 fake detections |
| Crowd occlusion | Crowd mode pauses vacant transitions for 45s |
| Person standing near table | chair_roi scoring differentiates sit vs. stand |
| Admin override | `seat.override=True` → skip CV state updates |
| Redis down | `emit_state()` silently fails, logs error |

## Configuration

| Env Var | Default | Description |
|---------|---------|-------------|
| `CAMERA_SOURCE` | `0` | RTSP URL or device index |
| `MODEL_SIZE` | `yolov8n` | YOLOv8 variant |
| `CONFIDENCE_THRESHOLD` | `0.45` | Minimum detection confidence |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection |
| `API_WS_URL` | `ws://api:8000/ws/seats` | Direct API WebSocket (reserved for future use) |

## Dependencies

- `ultralytics` (YOLOv8)
- `opencv-python` (frame capture/processing)
- `redis[hiredis]` (pub/sub)
- `shapely` (polygon geometry for chair_roi)
- `numpy`

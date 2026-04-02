# 🧠 gemini.md — Smart Canteen Master State (B.L.A.S.T.)
> **Last Updated:** 2026-04-02T19:50:00+07:00
> **Phase:** 3 — Architect (Core Logic & Decoupling)
> **Status:** Execution completed for Link & Architect phases. Wait for user to run tests.

---

## 📌 Project Identity

| Field           | Value                                              |
|-----------------|----------------------------------------------------|
| **Project**     | Smart Canteen — AI-Powered Canteen Management      |
| **OS**          | Zorin OS (Linux)                                   |
| **Stack**       | FastAPI · YOLOv8 · React (Vite) · Docker Compose   |
| **Database**    | PostgreSQL 16 · Redis 7                            |
| **Infra**       | Nginx reverse proxy · GitHub Actions CI/CD         |
| **Team Size**   | 3 engineers (CV/AI, Backend, Frontend)             |
| **Repo**        | `/home/asxif/proj/SmartCanteen-proj`               |

---

## 🏗️ Architecture Map

```
┌──────────────────────────────────────────────────────────────┐
│  HARDWARE LAYER                                              │
│  Cam A (overview) │ Cam B (side-angle) │ IoT (display)       │
├──────────────────────────────────────────────────────────────┤
│  CV ENGINE (services/cv-engine/)                             │
│  Camera → Preprocess → YOLOv8n → Seat State Machine → Redis │
│  Emit interval: 2s │ Confidence: 0.45 │ Frame: 640×640      │
├──────────────────────────────────────────────────────────────┤
│  BACKEND (services/api/)                                     │
│  FastAPI [:8000] │ WebSocket /ws/seats                       │
│  Routers: seats, orders, queue, stalls                       │
│  Redis subscriber → WebSocket broadcast to clients           │
├──────────────────────────────────────────────────────────────┤
│  FRONTEND (services/frontend/)                               │
│  React (Vite) [:3001→:80] │ FloorMap │ UserApp │ StallPanel  │
├──────────────────────────────────────────────────────────────┤
│  NOTIFICATION (services/notification/)                       │
│  Redis subscriber → FCM push │ Channels: notification:push,  │
│  order:status                                                │
├──────────────────────────────────────────────────────────────┤
│  INFRA                                                       │
│  Nginx [:8080/:8443] │ PostgreSQL 16 │ Redis 7               │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Schemas

### Seat Update Payload (Redis `seat:updates`)
```json
{
  "event": "seat_update",
  "timestamp": "2026-04-02T12:50:00Z",
  "camera_id": "cam_zone_a",
  "seats": [
    {
      "seat_id": "T01-S1",
      "table_id": "T01",
      "status": "vacant | occupied | reserved",
      "confidence": 0.95,
      "occupied_since": null,
      "reserved_since": null,
      "reserved_object": null,
      "override": false
    }
  ]
}
```

### Order Status Payload (Redis `order:status`)
```json
{
  "order_id": "ORD-001",
  "user_id": "USR-001",
  "stall_id": "STALL-01",
  "queue_token": "A-001",
  "status": "pending | preparing | ready | completed | cancelled"
}
```

### Notification Push Payload (Redis `notification:push`)
```json
{
  "user_id": "USR-001",
  "title": "อาหารพร้อมแล้ว! 🔔",
  "body": "คิว A-001 — มารับได้เลย!",
  "order_id": "ORD-001"
}
```

---

## 🔗 Service Connectivity Map

| From            | To              | Protocol       | Channel / Endpoint                |
|-----------------|-----------------|----------------|-----------------------------------|
| CV Engine       | Redis           | Pub/Sub        | `seat:updates`                    |
| CV Engine       | Redis           | SET+TTL        | `seat:state:{camera_id}` (10s)   |
| API (seats.py)  | Redis           | Subscribe      | `seat:updates` → WebSocket       |
| API             | PostgreSQL      | asyncpg        | SQLAlchemy async engine + `SeatSyncer` batch write |
| API             | Redis           | Pub/Sub        | `order:status`, `notification:push` |
| Frontend        | API             | REST           | `/api/seats`, `/api/orders`, etc. |
| Frontend        | API             | WebSocket      | `ws://api:8000/ws/seats`          |
| Notification    | Redis           | Subscribe      | `notification:push`, `order:status` |
| Notification    | FCM             | HTTPS POST     | `https://fcm.googleapis.com/fcm/send` |
| Nginx           | API + Frontend  | HTTP Proxy     | `:8080` → routes                  |

---

## 🔐 Environment Variables (.env)

| Variable          | Service       | Description                        | Status       |
|-------------------|---------------|------------------------------------|--------------|
| `DB_PASS`         | API, Postgres | Database password                  | ✅ Set        |
| `SECRET_KEY`      | API           | JWT signing key                    | ✅ Set        |
| `ALLOWED_ORIGINS` | API           | CORS origins                       | ✅ Set        |
| `CAMERA_SOURCE`   | CV Engine     | RTSP URL or device index           | ✅ Set        |
| `MODEL_SIZE`      | CV Engine     | YOLOv8 model variant               | ✅ Set        |
| `API_URL`         | Frontend      | Backend API URL                    | ✅ Set        |
| `WS_URL`          | Frontend      | WebSocket URL                      | ✅ Set        |
| `FCM_SERVER_KEY`  | Notification  | Firebase Cloud Messaging key       | ⚠️ Placeholder |

---

## 📏 Rules (Law)

1. **Data-First:** Define the payload schema before writing any tool.
2. **SOP-First:** Update `architecture/*.md` before changing `tools/*.py`.
3. **No Guessing:** Read stack traces. Patch. Test. Document in architecture.
4. **Ephemeral vs. Permanent:** `.tmp/` is trash. Cloud/DB is truth.
5. **gemini.md is law.** Only update when schemas, rules, or architecture change.

---

## 📝 Changelog

| Date       | Change                                      |
|------------|---------------------------------------------|
| 2026-04-02 | B.L.A.S.T. initialized. Phase 1: Blueprint. |
| 2026-04-02 | Phase 2 & 3: Standardized port `3000`, added `SeatSyncer` background db persistence, implemented `chair_roi` scoring, and decoupled `seat_id` from orders. |

# SOP: End-to-End Data Flow

> **Scope:** All 4 services + infra
> **Last Updated:** 2026-04-02

---

## System Data Flow Diagram

```
┌───────────────┐     ┌─────────────┐     ┌──────────────────┐
│   Camera/RTSP │────▶│  CV Engine  │────▶│  Redis (Pub/Sub) │
│   /dev/video0 │     │  YOLOv8n    │     │  seat:updates    │
└───────────────┘     └─────────────┘     └────────┬─────────┘
                                                   │
                              ┌─────────────────────┤
                              │                     │
                              ▼                     ▼
                    ┌─────────────────┐   ┌──────────────────┐
                    │  API (FastAPI)  │   │ Notification Wkr │
                    │  Redis Sub →    │   │ Redis Sub →      │
                    │  ├ WebSocket    │   │ FCM Push         │
                    │  └ DB Persist   │   │                  │
                    │     (batched)   │   │ Channels:        │
                    │                 │   │  notification:   │
                    │  REST:          │   │    push          │
                    │  /api/seats     │   │  order:status    │
                    │  /api/orders    │   └──────────────────┘
                    │  /api/queue     │
                    │  /api/stalls    │
                    └──────┬──────────┘
                           │
              ┌────────────┼────────────┐
              │         Nginx           │
              │  :8080 → /api → API     │
              │        → /ws  → API     │
              │        → /    → Frontend│
              └────────────┼────────────┘
                           │
                    ┌──────▼──────┐
                    │  Frontend   │
                    │  React/Vite │
                    │             │
                    │  FloorMap   │ ← WebSocket (real-time seats)
                    │  UserApp    │ ← REST (orders, queue)
                    │  StallPanel │ ← REST (stall management)
                    └─────────────┘
```

## Channel Map

| Redis Channel        | Publisher       | Subscriber(s)          | Purpose                    |
|----------------------|-----------------|------------------------|----------------------------|
| `seat:updates`       | CV Engine       | API (→ WS + DB)        | Real-time seat states      |
| `order:status`       | API             | Notification Worker    | Order lifecycle events     |
| `notification:push`  | API             | Notification Worker    | Direct push notifications  |

## Key: `seat:state:{camera_id}` (TTL 10s)

Direct Redis key for current seat snapshot. Used for on-demand reads without subscribing.

## Database Persistence

The API service runs a **background subscriber** that:
1. Subscribes to `seat:updates`
2. Buffers incoming states
3. Batch-upserts to PostgreSQL every ~2 minutes
4. This ensures analytics/history queries work against the DB

## Decoupled Systems

| System A: Floor Map (Real-time) | System B: Orders & Queue           |
|---------------------------------|------------------------------------|
| CV Engine → Redis → API WS       | User → API REST → PostgreSQL       |
| Frontend FloorMap component       | Frontend UserApp/StallPanel        |
| No cross-reference to orders      | No cross-reference to seats        |

The `seat_id` field has been removed from the `orders` table.
Users view the floor map to find a seat, then independently place orders.

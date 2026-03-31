# 🍽️ Smart Canteen — AI-Powered Canteen Management System

> Full-stack AI platform: Computer Vision + Order Management + Real-time Dashboard

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│  HARDWARE LAYER                                         │
│  Cam A (overview) │ Cam B (side-angle) │ IoT (display)  │
├─────────────────────────────────────────────────────────┤
│  AI ENGINE                                              │
│  YOLOv8n Detection │ State Logic │ Recommender Engine   │
├─────────────────────────────────────────────────────────┤
│  BACKEND                                                │
│  FastAPI + WebSocket │ Redis Pub/Sub │ PostgreSQL       │
├─────────────────────────────────────────────────────────┤
│  FRONTEND                                               │
│  Floor Map (React) │ User PWA │ Stall Vendor Panel      │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| CV/AI     | Python, YOLOv8 (ultralytics), OpenCV |
| Backend   | FastAPI, SQLAlchemy, Alembic        |
| Frontend  | React (Vite), WebSocket             |
| Database  | PostgreSQL 16, Redis 7              |
| Infra     | Docker Compose, Nginx, GitHub Actions |

## Quick Start

```bash
# 1. Clone & configure
git clone <repo-url> && cd SmartCanteen-proj
cp .env.example .env   # แก้ไข DB_PASS, SECRET_KEY, FCM_SERVER_KEY

# 2. Build & launch all services
docker compose up --build -d

# 3. Init database schema
docker compose exec api python -m alembic upgrade head

# 4. Load ROI config & test camera feed
docker compose exec cv-engine python -c "from main import test_camera; test_camera()"

# 5. Access services
# Dashboard → http://localhost:3000
# API docs  → http://localhost:8000/docs
```

## Project Structure

```
SmartCanteen-proj/
├── .github/workflows/         # CI/CD pipelines
├── services/
│   ├── cv-engine/             # YOLOv8 seat detection
│   ├── api/                   # FastAPI backend
│   ├── frontend/              # React dashboard
│   └── notification/          # Push notification worker
├── infra/
│   ├── nginx/                 # Reverse proxy config
│   └── postgres/              # DB init schema
├── docker-compose.yml         # Dev environment
├── docker-compose.prod.yml    # Production overrides
└── .env.example               # Environment template
```

## Team Responsibility

| Engineer | Domain        | Scope                                              |
|----------|---------------|-----------------------------------------------------|
| A        | CV / AI       | YOLOv8 training, ROI config, state logic, TensorRT |
| B        | Backend       | FastAPI, WebSocket, order/queue API, waiting time   |
| C        | Frontend      | React floor map, User PWA, Stall panel, analytics  |

## Git Branching Strategy

```
main ← develop ← feat/cv-roi
                ← feat/order-api
                ← feat/floor-map-ui
```

Each feature branch → PR เข้า `develop` → CI auto → merge เข้า `main` → deploy prod

## Services

### CV Engine (Port: internal only)
- YOLOv8n seat detection pipeline
- Temporal state machine (occupied/reserved/vacant)
- Queue exclusion zone filtering
- Emit seat updates via Redis pub/sub every 2 seconds

### API Backend (Port: 8000)
- REST API + WebSocket for real-time seat updates
- Order management with queue token system
- Stall ranking algorithm (multi-variable scoring)
- Menu recommendation (collaborative filtering)
- API docs at `/docs` (Swagger UI)

### Frontend (Port: 3000)
- Real-time floor map with color-coded seats
- User ordering app with queue tracking
- Stall vendor panel with order management
- PWA with push notifications

### Notification Worker
- Redis subscriber for order status changes
- Firebase Cloud Messaging (FCM) push notifications
- IoT buzzer/display integration

## License

MIT

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

# 2. Build + launch Docker services
make start

# 3. Init database schema
docker compose exec api python -m alembic upgrade head

# 4. Start Cloudflare tunnel (systemd user service)
make start-tunnel

# 5. Load ROI config & test camera feed
docker compose exec cv-engine python -c "from main import test_camera; test_camera()"

# 6. Access services
# Web app   → https://smart-canteen.app
# API docs  → https://smart-canteen.app/docs
```

### Shortcut Commands

```bash
make help            # ดูคำสั่งทั้งหมด
make web-up          # start docker + tunnel ทีเดียว
make web-down        # stop tunnel + docker
make status          # เช็กสถานะ docker + tunnel
make tunnel-logs     # ดู log tunnel แบบสด
make ports           # แสดงพอร์ต/URL ที่จำเป็น
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

### CV Engine (Port: 8001)
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

### Frontend (ผ่าน Nginx: 8080/8443 ภายในเครื่อง)
- Real-time floor map with color-coded seats
- User ordering app with queue tracking
- Stall vendor panel with order management
- PWA with push notifications

### Nginx Reverse Proxy (Ports: 8080, 8443)
- Route `/` ไป frontend
- Route `/api/*` และ `/api/seats/ws` ไป backend
- Route `/video_feed` ไป CV engine
- ใช้ร่วมกับ Cloudflare Tunnel เพื่อเปิดเว็บผ่านโดเมน

### Notification Worker
- Redis subscriber for order status changes
- Firebase Cloud Messaging (FCM) push notifications
- IoT buzzer/display integration

## License

MIT

# 🔍 findings.md — Smart Canteen Discovery Report

> **Phase:** 1 — Blueprint
> **Generated:** 2026-04-02T19:50:00+07:00

---

## 5 Discovery Questions

These questions were generated from a full audit of the SmartCanteen-proj file structure and codebase. Each question targets an architectural seam, ambiguity, or untested assumption that **must be resolved** before Phase 2 (Link) can begin.

---

### ✅ RESOLVED Q1: Dead `API_WS_URL` env var — Is Redis pub/sub the canonical path?

**Resolution:** Kept and fixed. While Redis is the canonical path for internal communication, `API_WS_URL` is kept for special direct websocket signals to the API server to broadcast to the Frontend.

---

### ✅ RESOLVED Q2: No database persistence for real-time seat data — How to fix?

**Resolution:** A `SeatSyncer` background task was implemented in the API service (`services/api/main.py`) to subscribe to `seat:updates` and flush/persist to PostgreSQL in batches every 2 minutes for analytics purposes.

---

### ✅ RESOLVED Q3: Port mismatch — Frontend `:3001` vs CORS `:3000`

**Resolution:** Standardized to Port 3000 everywhere. `docker-compose.yml` frontend port mapping changed to `3000:80` and `ALLOWED_ORIGINS` in `.env` configured to `http://localhost:3000,http://localhost:8080`.

---

### ✅ RESOLVED Q4: Crowd mode thresholds — Keep, tune, or remove?

**Resolution:** Kept as "Experimental". Crowd mode threshold lowered to `person_count > total_seats * 1.5`. The `chair_roi` feature was fully implemented in `seat_logic.py` using `shapely` to distinguish standing people from sitting people based on the base-point intersection with chair coordinates.

---

### ✅ RESOLVED Q5: How does the order queue system integrate with seat assignment?

**Resolution:** Fully Decoupled System. The `seat_id` field has been removed from `orders` table in Postgres, API DB models, and request/response schemas. The flow is: (1) Check Map -> (2) Walk to the Seat -> (3) Order/View Queue.

---

## 🔎 Additional Observations

| Finding | Location | Severity |
|---------|----------|----------|
| `services/api/.venv/` is committed to the repo | `.gitignore` has `.venv/` but dir exists | 🟡 Low |
| No Alembic migrations directory — schema is `init.sql` only | `services/api/` | 🟠 Medium |
| Frontend `node_modules/` appears to be committed | `services/frontend/` | 🟡 Low |
| `package-lock.json` is only 96 bytes (likely empty/broken) | `services/frontend/` | 🟠 Medium |
| No test directories exist for any service | All services | 🔴 High |
| FCM uses legacy HTTP API (`/fcm/send`) — deprecated by Google | `services/notification/worker.py` | 🟠 Medium |
| Frontend `components/` has `.gitkeep` only in `pages/` | `services/frontend/src/pages/` | 🟡 Low |

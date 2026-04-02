# 📈 progress.md — Smart Canteen Work Log

---

## 2026-04-02 — B.L.A.S.T. Phase 2 & 3 Execution

### ✅ Completed
- [x] Fixed `docker-compose.yml` (frontend port `3000:80`, kept `API_WS_URL`).
- [x] Updated `.env` (CORS to `:3000, :8080`, generated securely `DB_PASS`, `SECRET_KEY`).
- [x] Created `tools/verify_redis.py`, `verify_postgres.py`, `verify_api.py`, `verify_camera.py`.
- [x] Wrote `architecture/cv_pipeline.md` and `architecture/data_flow.md` SOPs.
- [x] Updated `roi_config.json` with `chair_roi` coordinates.
- [x] Implemented `chair_roi` scoring in `seat_logic.py` using `shapely` and marked experimental features.
- [x] Decreased crowd mode threshold to `n_seats * 1.5` in `seat_logic.py`.
- [x] Removed `seat_id` from `orders` table (`init.sql`) and API ORM schemas/models (`db_models.py`, `schemas.py`) to fully decouple seats and orders.
- [x] Added `SeatSyncer` background task in `services/api/main.py` to persist seat states and history to DB every 2 minutes.
- [x] Updated B.L.A.S.T. documentation to reflect approved decisions.

### ⏳ Waiting
- [ ] Run testing and verification scripts (`tools/verify_*.py`).
- [ ] Proceed to Phase 4 (Stylize) and 5 (Trigger/Deploy) eventually.

### ❌ Errors
- None yet.

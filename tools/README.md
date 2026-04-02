# tools/README.md — Layer 3 Execution Scripts

> This directory contains **deterministic Python scripts** that perform atomic, testable operations.
> Each tool does one thing well. Environment variables and tokens are stored in `.env`.

## Rules
1. **Atomic:** Each script performs a single operation.
2. **Testable:** Every tool must be runnable standalone with `python tools/<name>.py`.
3. **No secrets in code:** Use `os.getenv()` or `.env` for all credentials.
4. **Temp files go to `.tmp/`:** Never write intermediate files outside `.tmp/`.

## Planned Tools

| Tool Script | Purpose | Phase |
|-------------|---------|-------|
| `verify_redis.py` | Test Redis connection and pub/sub | Phase 2 (Link) |
| `verify_postgres.py` | Test PostgreSQL connection and schema | Phase 2 (Link) |
| `verify_api.py` | Test FastAPI health endpoint | Phase 2 (Link) |
| `verify_fcm.py` | Test FCM credentials (dry-run) | Phase 2 (Link) |
| `verify_camera.py` | Test camera/RTSP source availability | Phase 2 (Link) |

> Tools will be built during Phase 2 (Link) — connectivity verification scripts come first.

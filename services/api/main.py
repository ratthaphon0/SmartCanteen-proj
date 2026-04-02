"""
Smart Canteen — FastAPI Backend Entrypoint
REST API + WebSocket for seat state, orders, queue, and stall management.
"""

import asyncio
import json
import logging
from contextlib import asynccontextmanager
from datetime import datetime

import redis.asyncio as aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from config import settings
from database import engine, Base, AsyncSessionLocal
from routers import seats, orders, queue, stalls
from models.db_models import Seat, SeatHistory

# ─── Logging ──────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [API] %(levelname)s %(message)s"
)
logger = logging.getLogger(__name__)

# ─── Redis Client (shared) ───────────────────────
redis_client: aioredis.Redis = None


# ─── Seat Persistence Task ────────────────────────
class SeatSyncer:
    def __init__(self):
        self.latest_states = {}
        self.task = None
        self.sync_interval = 120  # 2 minutes

    async def run(self, redis_client):
        pubsub = redis_client.pubsub()
        await pubsub.subscribe("seat:updates")
        logger.info("SeatSyncer subscribed to seat:updates")

        last_sync = asyncio.get_event_loop().time()

        while True:
            try:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message["type"] == "message":
                    data = json.loads(message["data"])
                    for seat in data.get("seats", []):
                        self.latest_states[seat["seat_id"]] = seat
                
                now = asyncio.get_event_loop().time()
                if now - last_sync >= self.sync_interval:
                    if self.latest_states:
                        await self.sync_to_db()
                    last_sync = now
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"SeatSyncer error: {e}")
                await asyncio.sleep(1)

    async def sync_to_db(self):
        logger.info(f"Syncing {len(self.latest_states)} seats to DB...")
        async with AsyncSessionLocal() as session:
            try:
                for seat_id, state in self.latest_states.items():
                    result = await session.execute(select(Seat).where(Seat.seat_id == seat_id))
                    seat = result.scalar_one_or_none()
                    
                    if not seat:
                        continue
                    
                    status = state.get("status", "vacant")
                    confidence = state.get("confidence", 0.0)
                    
                    seat.status = status
                    seat.confidence = confidence
                    seat.reserved_object = state.get("reserved_object")

                    if state.get("occupied_since"):
                        try:
                            seat.occupied_since = datetime.fromisoformat(state["occupied_since"].replace("Z", "+00:00"))
                        except ValueError:
                            pass
                    if state.get("reserved_since"):
                        try:
                            seat.reserved_since = datetime.fromisoformat(state["reserved_since"].replace("Z", "+00:00"))
                        except ValueError:
                            pass

                    history = SeatHistory(
                        seat_id=seat_id,
                        status=status,
                        confidence=confidence,
                    )
                    session.add(history)
                
                await session.commit()
                self.latest_states.clear()
            except Exception as e:
                await session.rollback()
                logger.error(f"DB Sync failed: {e}")

seat_syncer = SeatSyncer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    global redis_client

    # Startup
    logger.info("Starting Smart Canteen API...")

    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ready")

    # Connect to Redis
    redis_client = aioredis.from_url(
        settings.REDIS_URL,
        decode_responses=True
    )
    await redis_client.ping()
    logger.info("Redis connected")

    # Store in app state for access from routers
    app.state.redis = redis_client

    # Start persistence task
    seat_syncer.task = asyncio.create_task(seat_syncer.run(redis_client))

    yield

    # Shutdown
    if seat_syncer.task:
        seat_syncer.task.cancel()
        try:
            await seat_syncer.task
        except asyncio.CancelledError:
            pass

    if redis_client:
        await redis_client.close()
    await engine.dispose()
    logger.info("Shutdown complete")


# ─── App Setup ────────────────────────────────────
app = FastAPI(
    title="Smart Canteen API",
    description="AI-Powered Canteen Management System — "
                "Seat Detection, Order Management, Queue & Recommendation",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────
app.include_router(seats.router, prefix="/api/seats", tags=["Seats"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])
app.include_router(queue.router, prefix="/api/queue", tags=["Queue"])
app.include_router(stalls.router, prefix="/api/stalls", tags=["Stalls"])


# ─── Health Check ─────────────────────────────────
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "smart-canteen-api",
        "version": "1.0.0"
    }


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "🍽️ Smart Canteen API",
        "docs": "/docs",
        "health": "/health"
    }

"""
Smart Canteen — FastAPI Backend Entrypoint
REST API + WebSocket for seat state, orders, queue, and stall management.
"""

import logging
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import engine, Base
from routers import seats, orders, queue, stalls

# ─── Logging ──────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [API] %(levelname)s %(message)s"
)
logger = logging.getLogger(__name__)

# ─── Redis Client (shared) ───────────────────────
redis_client: aioredis.Redis = None


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

    yield

    # Shutdown
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

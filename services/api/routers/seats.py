"""
Smart Canteen — Seats Router
Real-time seat status API + WebSocket endpoint.
"""

import asyncio
import json
import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.db_models import Seat
from models.schemas import SeatResponse, SeatUpdate

logger = logging.getLogger(__name__)
router = APIRouter()

# ─── WebSocket Connection Manager ─────────────────
class SeatConnectionManager:
    """Manages WebSocket connections for seat updates."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connected: {len(self.active_connections)} active")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected: {len(self.active_connections)} active")

    async def broadcast(self, data: dict):
        """Broadcast seat update to all connected clients."""
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except Exception:
                disconnected.append(connection)

        for conn in disconnected:
            self.active_connections.remove(conn)


manager = SeatConnectionManager()


# ─── REST Endpoints ───────────────────────────────
@router.get("/", response_model=List[SeatResponse])
async def get_all_seats(
    zone: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all seats with optional filtering by zone or status."""
    query = select(Seat)

    if zone:
        query = query.where(Seat.zone == zone)
    if status:
        query = query.where(Seat.status == status)

    result = await db.execute(query)
    seats = result.scalars().all()
    return seats


@router.get("/{seat_id}", response_model=SeatResponse)
async def get_seat(seat_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific seat by ID."""
    result = await db.execute(select(Seat).where(Seat.seat_id == seat_id))
    seat = result.scalar_one_or_none()
    if not seat:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Seat not found")
    return seat


@router.put("/{seat_id}/override")
async def override_seat(
    seat_id: str,
    update: SeatUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Admin override for seat status."""
    result = await db.execute(select(Seat).where(Seat.seat_id == seat_id))
    seat = result.scalar_one_or_none()
    if not seat:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Seat not found")

    seat.status = update.status
    seat.override = True
    await db.commit()

    # Broadcast update
    await manager.broadcast({
        "event": "seat_override",
        "seat_id": seat_id,
        "status": update.status
    })

    return {"message": f"Seat {seat_id} overridden to {update.status}"}


# ─── WebSocket Endpoint ──────────────────────────
@router.websocket("/ws")
async def websocket_seat_updates(websocket: WebSocket, request: Request):
    """
    WebSocket endpoint for real-time seat updates.
    Subscribes to Redis 'seat:updates' channel and forwards to clients.
    """
    await manager.connect(websocket)

    redis = request.app.state.redis

    try:
        # Subscribe to Redis channel
        pubsub = redis.pubsub()
        await pubsub.subscribe("seat:updates")

        while True:
            # Check for Redis messages
            message = await pubsub.get_message(
                ignore_subscribe_messages=True,
                timeout=1.0
            )
            if message and message["type"] == "message":
                data = json.loads(message["data"])
                await websocket.send_json(data)

            # Check for client messages (e.g., ping)
            try:
                client_msg = await asyncio.wait_for(
                    websocket.receive_text(), timeout=0.1
                )
                if client_msg == "ping":
                    await websocket.send_text("pong")
            except asyncio.TimeoutError:
                pass

    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)
    finally:
        await pubsub.unsubscribe("seat:updates")

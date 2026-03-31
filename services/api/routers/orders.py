"""
Smart Canteen — Orders Router
Order CRUD, status tracking, and food-ready notification flow.
"""

import logging
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from database import get_db
from models.db_models import Order, OrderItem, QueueToken
from models.schemas import (
    OrderCreate, OrderResponse, OrderStatusUpdate
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=201)
async def create_order(
    order_data: OrderCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new order.
    Flow: User สั่งอาหาร → Queue token สร้าง → Stall รับ order
    """
    # Generate order ID
    now = datetime.now(timezone.utc)
    order_id = f"ORD-{now.strftime('%Y%m%d')}-{now.strftime('%H%M%S')}"

    # Generate queue token
    stall_letter = order_data.stall_id.split("-")[-1][0].upper() if order_data.stall_id else "A"
    # Get next token number for this stall
    result = await db.execute(
        select(QueueToken)
        .where(QueueToken.stall_id == order_data.stall_id)
        .order_by(desc(QueueToken.created_at))
        .limit(1)
    )
    last_token = result.scalar_one_or_none()
    next_num = 1 if not last_token else (last_token.token_number + 1) % 1000
    queue_token = f"{stall_letter}-{next_num:03d}"

    # Calculate estimated wait time
    from services.waiting_time import estimate_wait
    est_seconds = await estimate_wait(db, order_data.stall_id, order_data.items[0].menu_id)
    est_ready = now.timestamp() + est_seconds

    # Create order
    order = Order(
        order_id=order_id,
        user_id=order_data.user_id,
        stall_id=order_data.stall_id,
        queue_token=queue_token,
        status="pending",
        total_price=sum(item.price * item.qty for item in order_data.items),
        seat_id=order_data.seat_id,
        est_ready_at=datetime.fromtimestamp(est_ready, tz=timezone.utc),
        created_at=now,
    )
    db.add(order)

    # Create order items
    for item in order_data.items:
        order_item = OrderItem(
            order_id=order_id,
            menu_id=item.menu_id,
            name=item.name,
            qty=item.qty,
            price=item.price,
        )
        db.add(order_item)

    # Create queue token record
    token = QueueToken(
        token=queue_token,
        stall_id=order_data.stall_id,
        order_id=order_id,
        token_number=next_num,
        priority=order_data.priority or "walk-in",
        created_at=now,
    )
    db.add(token)

    await db.commit()

    # Publish to Redis for real-time updates
    redis = request.app.state.redis
    import json
    await redis.publish("order:new", json.dumps({
        "order_id": order_id,
        "stall_id": order_data.stall_id,
        "queue_token": queue_token,
        "status": "pending"
    }))

    logger.info(f"Order created: {order_id} / Queue: {queue_token}")

    return order


@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    user_id: Optional[str] = None,
    stall_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get orders with optional filtering."""
    query = select(Order).order_by(desc(Order.created_at)).limit(limit)

    if user_id:
        query = query.where(Order.user_id == user_id)
    if stall_id:
        query = query.where(Order.stall_id == stall_id)
    if status:
        query = query.where(Order.status == status)

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific order by ID."""
    result = await db.execute(select(Order).where(Order.order_id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    update: OrderStatusUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Update order status.
    Flow: pending → preparing → ready → completed
    When status = 'ready', trigger push notification.
    """
    result = await db.execute(select(Order).where(Order.order_id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_transitions = {
        "pending": ["preparing", "cancelled"],
        "preparing": ["ready", "cancelled"],
        "ready": ["completed"],
    }

    if update.status not in valid_transitions.get(order.status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid transition: {order.status} → {update.status}"
        )

    order.status = update.status

    if update.status == "completed":
        order.completed_at = datetime.now(timezone.utc)

    await db.commit()

    # Publish status change to Redis
    redis = request.app.state.redis
    import json
    await redis.publish("order:status", json.dumps({
        "order_id": order_id,
        "user_id": order.user_id,
        "stall_id": order.stall_id,
        "queue_token": order.queue_token,
        "status": update.status
    }))

    # If ready, trigger notification
    if update.status == "ready":
        await redis.publish("notification:push", json.dumps({
            "user_id": order.user_id,
            "title": "อาหารพร้อมแล้ว! 🔔",
            "body": f"คิว {order.queue_token} — อาหารของคุณพร้อมแล้ว เราจะแจ้งเตือนทันที",
            "order_id": order_id,
        }))
        logger.info(f"Food ready notification sent for {order_id}")

    return {"message": f"Order {order_id} → {update.status}"}

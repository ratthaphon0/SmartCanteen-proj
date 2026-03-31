"""
Smart Canteen — Waiting Time Estimator
Calculates estimated wait time per stall/menu item.

Algorithm:
  est_wait = ceil(orders_ahead / stall_capacity) × avg_cook_time × 0.9
  0.9 = optimistic factor
"""

import logging
from math import ceil
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from models.db_models import Order, Stall, MenuItem, QueueToken

logger = logging.getLogger(__name__)

# Default values
DEFAULT_COOK_TIME = 300  # 5 minutes in seconds
OPTIMISTIC_FACTOR = 0.9
MAX_WAIT_SECONDS = 3600  # 60 minutes cap


async def estimate_wait(
    db: AsyncSession,
    stall_id: str,
    menu_item_id: Optional[str] = None
) -> int:
    """
    Estimate waiting time in seconds.

    Args:
        db: Database session
        stall_id: Stall identifier
        menu_item_id: Optional specific menu item

    Returns:
        Estimated wait time in seconds
    """
    # Get stall capacity
    result = await db.execute(
        select(Stall).where(Stall.stall_id == stall_id)
    )
    stall = result.scalar_one_or_none()
    capacity = stall.capacity if stall else 2

    # Get average cook time
    if menu_item_id:
        result = await db.execute(
            select(MenuItem).where(MenuItem.menu_id == menu_item_id)
        )
        item = result.scalar_one_or_none()
        avg_cook = item.avg_cook_time if item else DEFAULT_COOK_TIME
    else:
        avg_cook = stall.avg_cook_time_seconds if stall else DEFAULT_COOK_TIME

    # Count orders ahead in queue
    result = await db.execute(
        select(func.count())
        .select_from(QueueToken)
        .where(QueueToken.stall_id == stall_id)
        .where(QueueToken.status.in_(["waiting", "preparing"]))
    )
    orders_ahead = result.scalar() or 0

    # Calculate estimated wait
    if orders_ahead == 0:
        return int(avg_cook * OPTIMISTIC_FACTOR)

    batches = ceil(orders_ahead / capacity)
    estimated = int(batches * avg_cook * OPTIMISTIC_FACTOR)

    # Cap at maximum
    return min(estimated, MAX_WAIT_SECONDS)


async def get_wait_time_display(
    db: AsyncSession,
    stall_id: str
) -> dict:
    """
    Get formatted wait time for display.

    Returns:
        Dict with minutes, display text, and crowd level.
    """
    seconds = await estimate_wait(db, stall_id)
    minutes = seconds / 60

    if seconds >= MAX_WAIT_SECONDS:
        display = "High demand — check back later"
        level = "extreme"
    elif minutes > 30:
        display = f"~{int(minutes)} นาที (คิวยาว)"
        level = "high"
    elif minutes > 15:
        display = f"~{int(minutes)} นาที"
        level = "medium"
    elif minutes > 5:
        display = f"~{int(minutes)} นาที"
        level = "normal"
    else:
        display = "พร้อมเสิร์ฟเร็ว ⚡"
        level = "fast"

    return {
        "stall_id": stall_id,
        "wait_seconds": seconds,
        "wait_minutes": round(minutes, 1),
        "display": display,
        "crowd_level": level,
    }

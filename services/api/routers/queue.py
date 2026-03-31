"""
Smart Canteen — Queue Router
Queue token management, priority system, and queue board display.
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from database import get_db
from models.db_models import QueueToken
from models.schemas import QueueTokenResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=List[QueueTokenResponse])
async def get_queue(
    stall_id: Optional[str] = None,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """
    Get active queue tokens.
    Used by queue board display and stall panel.
    """
    query = select(QueueToken).order_by(QueueToken.created_at)

    if stall_id:
        query = query.where(QueueToken.stall_id == stall_id)
    if active_only:
        query = query.where(QueueToken.status.in_(["waiting", "preparing"]))

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/board/{stall_id}")
async def get_queue_board(stall_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get queue board data for TV/display at stall.
    Returns: current serving, next in queue, total waiting.
    """
    result = await db.execute(
        select(QueueToken)
        .where(QueueToken.stall_id == stall_id)
        .where(QueueToken.status.in_(["waiting", "preparing", "ready"]))
        .order_by(QueueToken.priority_order, QueueToken.created_at)
    )
    tokens = result.scalars().all()

    preparing = [t for t in tokens if t.status == "preparing"]
    ready = [t for t in tokens if t.status == "ready"]
    waiting = [t for t in tokens if t.status == "waiting"]

    return {
        "stall_id": stall_id,
        "now_serving": [t.token for t in preparing[:3]],
        "ready_pickup": [t.token for t in ready],
        "next_up": [t.token for t in waiting[:5]],
        "total_waiting": len(waiting),
    }


@router.patch("/{token}/skip")
async def skip_queue(token: str, db: AsyncSession = Depends(get_db)):
    """Admin: Skip a queue token (move to back)."""
    result = await db.execute(
        select(QueueToken).where(QueueToken.token == token)
    )
    queue_token = result.scalar_one_or_none()
    if not queue_token:
        raise HTTPException(status_code=404, detail="Token not found")

    queue_token.status = "skipped"
    await db.commit()

    return {"message": f"Token {token} skipped"}


@router.patch("/{token}/cancel")
async def cancel_queue(token: str, db: AsyncSession = Depends(get_db)):
    """Admin: Cancel a queue token."""
    result = await db.execute(
        select(QueueToken).where(QueueToken.token == token)
    )
    queue_token = result.scalar_one_or_none()
    if not queue_token:
        raise HTTPException(status_code=404, detail="Token not found")

    queue_token.status = "cancelled"
    await db.commit()

    return {"message": f"Token {token} cancelled"}

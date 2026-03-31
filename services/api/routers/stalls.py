"""
Smart Canteen — Stalls Router
Stall ranking, menu CRUD, and vendor management.
"""

import logging
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from database import get_db
from models.db_models import Stall, MenuItem, Order
from models.schemas import (
    StallResponse, StallCreate,
    MenuItemResponse, MenuItemCreate,
    StallRankingResponse
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ─── Stall CRUD ───────────────────────────────────
@router.get("/", response_model=List[StallResponse])
async def get_stalls(db: AsyncSession = Depends(get_db)):
    """Get all stalls."""
    result = await db.execute(select(Stall).where(Stall.is_active == True))
    return result.scalars().all()


@router.post("/", response_model=StallResponse, status_code=201)
async def create_stall(stall: StallCreate, db: AsyncSession = Depends(get_db)):
    """Register a new stall."""
    new_stall = Stall(**stall.model_dump())
    db.add(new_stall)
    await db.commit()
    await db.refresh(new_stall)
    return new_stall


@router.get("/{stall_id}", response_model=StallResponse)
async def get_stall(stall_id: str, db: AsyncSession = Depends(get_db)):
    """Get stall details."""
    result = await db.execute(select(Stall).where(Stall.stall_id == stall_id))
    stall = result.scalar_one_or_none()
    if not stall:
        raise HTTPException(status_code=404, detail="Stall not found")
    return stall


# ─── Menu CRUD ────────────────────────────────────
@router.get("/{stall_id}/menu", response_model=List[MenuItemResponse])
async def get_menu(
    stall_id: str,
    available_only: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """Get menu items for a stall."""
    query = select(MenuItem).where(MenuItem.stall_id == stall_id)
    if available_only:
        query = query.where(MenuItem.is_available == True)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{stall_id}/menu", response_model=MenuItemResponse, status_code=201)
async def add_menu_item(
    stall_id: str,
    item: MenuItemCreate,
    db: AsyncSession = Depends(get_db)
):
    """Add a menu item to a stall."""
    menu_item = MenuItem(stall_id=stall_id, **item.model_dump())
    db.add(menu_item)
    await db.commit()
    await db.refresh(menu_item)
    return menu_item


@router.patch("/{stall_id}/menu/{menu_id}/toggle")
async def toggle_menu_availability(
    stall_id: str,
    menu_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Toggle menu item availability (sold out / available)."""
    result = await db.execute(
        select(MenuItem)
        .where(MenuItem.stall_id == stall_id)
        .where(MenuItem.menu_id == menu_id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    item.is_available = not item.is_available
    await db.commit()

    status = "available" if item.is_available else "sold out"
    return {"message": f"{item.name} is now {status}"}


# ─── Ranking ──────────────────────────────────────
@router.get("/ranking/today", response_model=List[StallRankingResponse])
async def get_stall_ranking(db: AsyncSession = Depends(get_db)):
    """
    Smart Stall Ranking — multi-variable scoring.

    score = w1*avg_rating + w2*(1/avg_wait) + w3*order_volume
           + w4*freshness + w5*value_score

    Weights: w1=0.3, w2=0.25, w3=0.2, w4=0.15, w5=0.1
    """
    result = await db.execute(select(Stall).where(Stall.is_active == True))
    stalls = result.scalars().all()

    rankings = []
    for stall in stalls:
        # Calculate ranking score components
        avg_rating = stall.avg_rating or 3.0
        avg_wait = max(stall.avg_cook_time_seconds or 300, 60)  # min 60s
        order_volume = stall.today_order_count or 0
        freshness = stall.freshness_score or 0.5
        value_score = stall.value_score or 0.5

        # Normalize order volume (0-1 scale)
        max_orders = 100  # assumed daily max
        volume_norm = min(order_volume / max_orders, 1.0)

        # Calculate composite score
        score = (
            0.30 * (avg_rating / 5.0)
            + 0.25 * (1.0 / (avg_wait / 60.0))  # minutes
            + 0.20 * volume_norm
            + 0.15 * freshness
            + 0.10 * value_score
        )

        rankings.append({
            "stall_id": stall.stall_id,
            "name": stall.name,
            "score": round(score, 3),
            "avg_rating": avg_rating,
            "avg_wait_minutes": round(avg_wait / 60, 1),
            "order_count_today": order_volume,
        })

    # Sort by score descending
    rankings.sort(key=lambda x: x["score"], reverse=True)

    return rankings


# ─── Recommendation ───────────────────────────────
@router.get("/recommend/{user_id}")
async def recommend_menu(
    user_id: str,
    top_k: int = 5,
    db: AsyncSession = Depends(get_db)
):
    """Get personalized menu recommendations for a user."""
    from services.recommender import get_recommendations
    recommendations = await get_recommendations(db, user_id, top_k)
    return {"user_id": user_id, "recommendations": recommendations}

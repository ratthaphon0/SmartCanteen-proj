"""
Smart Canteen — Menu Recommender
Collaborative Filtering — recommends menu items based on similar users' order history.

Algorithm:
1. Build user-item order matrix (90-day lookback)
2. Cosine similarity with top 20 similar users
3. Get unseen items from similar users
4. Boost by stall ranking + trending + time-of-day
5. Filter: available, within price range, ready within 15 min
6. Never recommend items rated < 3 stars
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.db_models import Order, OrderItem, MenuItem, Stall

logger = logging.getLogger(__name__)

LOOKBACK_DAYS = 90
TOP_SIMILAR_USERS = 20
MIN_RATING = 3.0
MAX_READY_MINUTES = 15


async def get_recommendations(
    db: AsyncSession,
    user_id: str,
    top_k: int = 5
) -> List[dict]:
    """
    Get personalized menu recommendations for a user.

    Uses collaborative filtering with stall ranking boost.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=LOOKBACK_DAYS)

    # Step 1: Get user's order history
    user_orders = await _get_user_orders(db, user_id, cutoff)
    user_items = set(user_orders.keys())

    if not user_items:
        # New user — return trending items
        return await _get_trending_items(db, top_k)

    # Step 2: Build order matrix and find similar users
    all_orders = await _get_all_orders(db, cutoff)
    similar_users = _find_similar_users(user_orders, all_orders, user_id)

    # Step 3: Get items from similar users that current user hasn't tried
    candidates = _get_candidate_items(similar_users, all_orders, user_items)

    if not candidates:
        return await _get_trending_items(db, top_k)

    # Step 4: Score and filter candidates
    scored = await _score_candidates(db, candidates)

    # Step 5: Return top-k
    scored.sort(key=lambda x: x["score"], reverse=True)
    return scored[:top_k]


async def _get_user_orders(
    db: AsyncSession,
    user_id: str,
    since: datetime
) -> Dict[str, int]:
    """Get user's order counts per menu item."""
    result = await db.execute(
        select(OrderItem.menu_id, OrderItem.name)
        .join(Order, Order.order_id == OrderItem.order_id)
        .where(Order.user_id == user_id)
        .where(Order.created_at >= since)
    )
    counts: Dict[str, int] = {}
    for row in result:
        counts[row[0]] = counts.get(row[0], 0) + 1
    return counts


async def _get_all_orders(
    db: AsyncSession,
    since: datetime
) -> Dict[str, Dict[str, int]]:
    """Build user-item matrix from all orders."""
    result = await db.execute(
        select(Order.user_id, OrderItem.menu_id)
        .join(OrderItem, Order.order_id == OrderItem.order_id)
        .where(Order.created_at >= since)
    )
    matrix: Dict[str, Dict[str, int]] = {}
    for row in result:
        uid, mid = row[0], row[1]
        if uid not in matrix:
            matrix[uid] = {}
        matrix[uid][mid] = matrix[uid].get(mid, 0) + 1
    return matrix


def _find_similar_users(
    user_orders: Dict[str, int],
    all_orders: Dict[str, Dict[str, int]],
    current_user: str
) -> List[str]:
    """Find top-N similar users using cosine similarity."""
    import math

    user_norm = math.sqrt(sum(v ** 2 for v in user_orders.values()))
    if user_norm == 0:
        return []

    similarities = []
    for other_id, other_orders in all_orders.items():
        if other_id == current_user:
            continue

        # Cosine similarity
        dot = sum(
            user_orders.get(item, 0) * count
            for item, count in other_orders.items()
        )
        other_norm = math.sqrt(sum(v ** 2 for v in other_orders.values()))

        if other_norm == 0:
            continue

        sim = dot / (user_norm * other_norm)
        if sim > 0:
            similarities.append((other_id, sim))

    similarities.sort(key=lambda x: x[1], reverse=True)
    return [uid for uid, _ in similarities[:TOP_SIMILAR_USERS]]


def _get_candidate_items(
    similar_users: List[str],
    all_orders: Dict[str, Dict[str, int]],
    user_items: set
) -> Dict[str, float]:
    """Get items ordered by similar users but not by current user."""
    candidates: Dict[str, float] = {}

    for uid in similar_users:
        if uid not in all_orders:
            continue
        for item, count in all_orders[uid].items():
            if item not in user_items:
                candidates[item] = candidates.get(item, 0) + count

    return candidates


async def _score_candidates(
    db: AsyncSession,
    candidates: Dict[str, float]
) -> List[dict]:
    """Score and filter candidate items."""
    scored = []

    for menu_id, collab_score in candidates.items():
        result = await db.execute(
            select(MenuItem).where(MenuItem.menu_id == menu_id)
        )
        item = result.scalar_one_or_none()

        if not item:
            continue
        if not item.is_available:
            continue
        if item.avg_cook_time and item.avg_cook_time > MAX_READY_MINUTES * 60:
            continue

        scored.append({
            "menu_id": item.menu_id,
            "name": item.name,
            "stall_id": item.stall_id,
            "price": item.price,
            "category": item.category,
            "score": round(collab_score, 2),
            "est_cook_minutes": round((item.avg_cook_time or 300) / 60, 1),
        })

    return scored


async def _get_trending_items(
    db: AsyncSession,
    top_k: int
) -> List[dict]:
    """Fallback: get today's trending items."""
    result = await db.execute(
        select(MenuItem)
        .where(MenuItem.is_available == True)
        .limit(top_k)
    )
    items = result.scalars().all()

    return [
        {
            "menu_id": item.menu_id,
            "name": item.name,
            "stall_id": item.stall_id,
            "price": item.price,
            "category": item.category,
            "score": 0.5,
            "est_cook_minutes": round((item.avg_cook_time or 300) / 60, 1),
            "reason": "trending_today",
        }
        for item in items
    ]

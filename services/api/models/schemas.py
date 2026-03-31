"""
Smart Canteen — Pydantic Schemas
Request/response models for API validation.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ─── Seats ────────────────────────────────────────
class SeatResponse(BaseModel):
    seat_id: str
    table_id: str
    zone: Optional[str] = None
    status: str
    confidence: float = 0.0
    occupied_since: Optional[datetime] = None
    reserved_since: Optional[datetime] = None
    reserved_object: Optional[str] = None
    camera_source: Optional[str] = None
    override: bool = False

    class Config:
        from_attributes = True


class SeatUpdate(BaseModel):
    status: str = Field(..., pattern="^(occupied|reserved|vacant)$")


# ─── Orders ───────────────────────────────────────
class OrderItemCreate(BaseModel):
    menu_id: str
    name: str
    qty: int = 1
    price: float


class OrderCreate(BaseModel):
    user_id: str
    stall_id: str
    items: List[OrderItemCreate]
    seat_id: Optional[str] = None
    priority: Optional[str] = "walk-in"  # walk-in | pre-order | vip


class OrderResponse(BaseModel):
    order_id: str
    user_id: str
    stall_id: str
    queue_token: Optional[str] = None
    status: str
    total_price: float = 0.0
    seat_id: Optional[str] = None
    est_ready_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(preparing|ready|completed|cancelled)$")


# ─── Queue ────────────────────────────────────────
class QueueTokenResponse(BaseModel):
    token: str
    stall_id: str
    order_id: Optional[str] = None
    priority: str = "walk-in"
    status: str = "waiting"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ─── Stalls ───────────────────────────────────────
class StallCreate(BaseModel):
    stall_id: str
    name: str
    description: Optional[str] = None
    owner_id: Optional[str] = None
    capacity: int = 2


class StallResponse(BaseModel):
    stall_id: str
    name: str
    description: Optional[str] = None
    capacity: int = 2
    is_active: bool = True
    avg_rating: float = 0.0
    avg_cook_time_seconds: int = 300
    today_order_count: int = 0

    class Config:
        from_attributes = True


class StallRankingResponse(BaseModel):
    stall_id: str
    name: str
    score: float
    avg_rating: float
    avg_wait_minutes: float
    order_count_today: int


# ─── Menu ─────────────────────────────────────────
class MenuItemCreate(BaseModel):
    menu_id: str
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = "main"
    calories: Optional[int] = None
    protein_g: Optional[float] = None
    avg_cook_time: int = 300


class MenuItemResponse(BaseModel):
    menu_id: str
    stall_id: str
    name: str
    description: Optional[str] = None
    price: float
    category: Optional[str] = None
    is_available: bool = True
    calories: Optional[int] = None
    protein_g: Optional[float] = None
    avg_cook_time: int = 300

    class Config:
        from_attributes = True

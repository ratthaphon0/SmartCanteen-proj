"""
Smart Canteen — SQLAlchemy ORM Models
Database schema: users, stalls, menu, orders, queue, seats.
"""

from datetime import datetime, timezone

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime,
    Text, ForeignKey, Index
)
from sqlalchemy.orm import relationship

from database import Base


def utcnow():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    user_id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True)
    phone = Column(String(20))
    role = Column(String(20), default="student")  # student | staff | admin | vendor
    fcm_token = Column(Text)  # Firebase Cloud Messaging token
    created_at = Column(DateTime(timezone=True), default=utcnow)

    orders = relationship("Order", back_populates="user")


class Stall(Base):
    __tablename__ = "stalls"

    stall_id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    owner_id = Column(String(50), ForeignKey("users.user_id"))
    capacity = Column(Integer, default=2)  # parallel cooking capacity
    is_active = Column(Boolean, default=True)

    # Ranking metrics (updated periodically)
    avg_rating = Column(Float, default=0.0)
    avg_cook_time_seconds = Column(Integer, default=300)
    today_order_count = Column(Integer, default=0)
    freshness_score = Column(Float, default=0.5)
    value_score = Column(Float, default=0.5)

    created_at = Column(DateTime(timezone=True), default=utcnow)

    menu_items = relationship("MenuItem", back_populates="stall")
    orders = relationship("Order", back_populates="stall")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    menu_id = Column(String(50), unique=True, nullable=False)
    stall_id = Column(String(50), ForeignKey("stalls.stall_id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    category = Column(String(50))  # main | drink | dessert | snack
    image_url = Column(Text)
    is_available = Column(Boolean, default=True)

    # Nutrition info (optional)
    calories = Column(Integer)
    protein_g = Column(Float)

    # Cooking time estimate in seconds
    avg_cook_time = Column(Integer, default=300)

    created_at = Column(DateTime(timezone=True), default=utcnow)

    stall = relationship("Stall", back_populates="menu_items")


class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String(50), primary_key=True)
    user_id = Column(String(50), ForeignKey("users.user_id"), nullable=False)
    stall_id = Column(String(50), ForeignKey("stalls.stall_id"), nullable=False)
    queue_token = Column(String(20))
    status = Column(String(20), default="pending")  # pending|preparing|ready|completed|cancelled
    total_price = Column(Float, default=0.0)
    seat_id = Column(String(20))
    est_ready_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=utcnow)
    completed_at = Column(DateTime(timezone=True))

    user = relationship("User", back_populates="orders")
    stall = relationship("Stall", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

    __table_args__ = (
        Index("idx_order_user", "user_id"),
        Index("idx_order_stall", "stall_id"),
        Index("idx_order_status", "status"),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(50), ForeignKey("orders.order_id"), nullable=False)
    menu_id = Column(String(50))
    name = Column(String(100))
    qty = Column(Integer, default=1)
    price = Column(Float)

    order = relationship("Order", back_populates="items")


class QueueToken(Base):
    __tablename__ = "queue_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    token = Column(String(20), unique=True, nullable=False)
    stall_id = Column(String(50), ForeignKey("stalls.stall_id"), nullable=False)
    order_id = Column(String(50), ForeignKey("orders.order_id"))
    token_number = Column(Integer)
    priority = Column(String(20), default="walk-in")  # walk-in | pre-order | vip
    priority_order = Column(Integer, default=2)  # 0=vip, 1=pre-order, 2=walk-in
    status = Column(String(20), default="waiting")  # waiting|preparing|ready|completed|skipped|cancelled
    created_at = Column(DateTime(timezone=True), default=utcnow)

    __table_args__ = (
        Index("idx_queue_stall_status", "stall_id", "status"),
    )


class Seat(Base):
    __tablename__ = "seats"

    seat_id = Column(String(20), primary_key=True)
    table_id = Column(String(20), nullable=False)
    zone = Column(String(10))
    status = Column(String(20), default="vacant")  # occupied | reserved | vacant
    confidence = Column(Float, default=0.0)
    occupied_since = Column(DateTime(timezone=True))
    reserved_since = Column(DateTime(timezone=True))
    reserved_object = Column(String(50))
    camera_source = Column(String(50))
    override = Column(Boolean, default=False)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)


class SeatHistory(Base):
    __tablename__ = "seat_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    seat_id = Column(String(20), ForeignKey("seats.seat_id"), nullable=False)
    status = Column(String(20))
    confidence = Column(Float)
    recorded_at = Column(DateTime(timezone=True), default=utcnow)

    __table_args__ = (
        Index("idx_seat_history", "seat_id", "recorded_at"),
    )

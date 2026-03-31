"""
Smart Canteen — Notification Worker
Subscribes to Redis channels and sends push notifications.

Channels:
  - notification:push → FCM push notification
  - order:status → order status change events
"""

import asyncio
import json
import logging
import os

import httpx
import redis.asyncio as aioredis

# ─── Configuration ────────────────────────────────
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
FCM_KEY = os.getenv("FCM_KEY", "")
FCM_URL = "https://fcm.googleapis.com/fcm/send"

# ─── Logging ──────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [NOTIFICATION] %(levelname)s %(message)s"
)
logger = logging.getLogger(__name__)


async def send_push_notification(user_id: str, title: str, body: str, data: dict = None):
    """
    Send push notification via Firebase Cloud Messaging.

    In production, look up user's FCM token from database.
    For demo, just log the notification.
    """
    if not FCM_KEY:
        logger.info(f"[DEMO] Push → {user_id}: {title} — {body}")
        return

    payload = {
        "to": f"/topics/user_{user_id}",  # Topic-based for simplicity
        "notification": {
            "title": title,
            "body": body,
            "sound": "default",
        },
        "data": data or {},
    }

    headers = {
        "Authorization": f"key={FCM_KEY}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(FCM_URL, json=payload, headers=headers)
            if response.status_code == 200:
                logger.info(f"Push sent → {user_id}: {title}")
            else:
                logger.error(f"FCM error: {response.status_code} — {response.text}")
    except Exception as e:
        logger.error(f"Push notification failed: {e}")


async def handle_notification_push(message: dict):
    """Handle notification:push channel messages."""
    data = json.loads(message["data"])

    await send_push_notification(
        user_id=data.get("user_id", "unknown"),
        title=data.get("title", "Smart Canteen"),
        body=data.get("body", ""),
        data={"order_id": data.get("order_id", "")},
    )


async def handle_order_status(message: dict):
    """Handle order:status channel messages."""
    data = json.loads(message["data"])
    status = data.get("status", "")
    user_id = data.get("user_id", "")
    queue_token = data.get("queue_token", "")

    status_messages = {
        "preparing": (
            "กำลังเตรียมอาหาร 🍳",
            f"คิว {queue_token} — ร้านรับออร์เดอร์ของคุณแล้ว กำลังทำ!"
        ),
        "ready": (
            "อาหารพร้อมแล้ว! 🔔",
            f"คิว {queue_token} — มารับได้เลยครับ/ค่ะ!"
        ),
        "completed": (
            "ขอบคุณ! 🙏",
            f"ออร์เดอร์ {queue_token} เสร็จสมบูรณ์ ขอบคุณที่ใช้บริการ"
        ),
    }

    if status in status_messages:
        title, body = status_messages[status]
        await send_push_notification(user_id, title, body, data)


async def main():
    """Main worker loop — subscribe to Redis channels."""
    logger.info("Starting notification worker...")

    redis = aioredis.from_url(REDIS_URL, decode_responses=True)
    await redis.ping()
    logger.info("Connected to Redis")

    pubsub = redis.pubsub()
    await pubsub.subscribe("notification:push", "order:status")
    logger.info("Subscribed to channels: notification:push, order:status")

    handlers = {
        "notification:push": handle_notification_push,
        "order:status": handle_order_status,
    }

    try:
        while True:
            message = await pubsub.get_message(
                ignore_subscribe_messages=True,
                timeout=1.0
            )
            if message and message["type"] == "message":
                channel = message["channel"]
                handler = handlers.get(channel)
                if handler:
                    try:
                        await handler(message)
                    except Exception as e:
                        logger.error(f"Handler error on {channel}: {e}")

            await asyncio.sleep(0.1)

    except KeyboardInterrupt:
        logger.info("Shutting down...")
    finally:
        await pubsub.unsubscribe()
        await redis.close()
        logger.info("Worker stopped")


if __name__ == "__main__":
    asyncio.run(main())

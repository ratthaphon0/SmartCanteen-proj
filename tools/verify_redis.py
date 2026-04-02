"""
Smart Canteen — Redis Connectivity Verification
B.L.A.S.T. Phase 2: Link
Tests: PING, SET/GET, PUBLISH/SUBSCRIBE on required channels.
"""

import asyncio
import os
import sys

# Allow running from project root or tools/
sys.path.insert(0, os.path.dirname(__file__))

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

REQUIRED_CHANNELS = ["seat:updates", "order:status", "notification:push"]


async def verify():
    try:
        import redis.asyncio as aioredis
    except ImportError:
        print("❌ redis package not installed: pip install redis")
        return False

    results = []

    # Test 1: PING
    try:
        client = aioredis.from_url(REDIS_URL, decode_responses=True)
        pong = await client.ping()
        print(f"✅ PING → {'PONG' if pong else 'FAIL'}")
        results.append(pong)
    except Exception as e:
        print(f"❌ PING failed: {e}")
        return False

    # Test 2: SET/GET
    try:
        await client.set("blast:test", "hello", ex=10)
        val = await client.get("blast:test")
        ok = val == "hello"
        print(f"✅ SET/GET → {'OK' if ok else 'FAIL'} (got: {val})")
        await client.delete("blast:test")
        results.append(ok)
    except Exception as e:
        print(f"❌ SET/GET failed: {e}")
        results.append(False)

    # Test 3: PUB/SUB on each channel
    for channel in REQUIRED_CHANNELS:
        try:
            pubsub = client.pubsub()
            await pubsub.subscribe(channel)
            await client.publish(channel, '{"test": true}')
            msg = await pubsub.get_message(ignore_subscribe_messages=True, timeout=2.0)
            ok = msg is not None and msg["type"] == "message"
            print(f"✅ PUB/SUB [{channel}] → {'OK' if ok else 'FAIL'}")
            await pubsub.unsubscribe(channel)
            results.append(ok)
        except Exception as e:
            print(f"❌ PUB/SUB [{channel}] failed: {e}")
            results.append(False)

    await client.close()

    all_ok = all(results)
    print(f"\n{'🟢 ALL REDIS CHECKS PASSED' if all_ok else '🔴 SOME CHECKS FAILED'}")
    return all_ok


if __name__ == "__main__":
    success = asyncio.run(verify())
    sys.exit(0 if success else 1)

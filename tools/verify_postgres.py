"""
Smart Canteen — PostgreSQL Connectivity Verification
B.L.A.S.T. Phase 2: Link
Tests: connection, table existence, seed data validation.
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://canteen:canteen_s3cure_2026!@localhost:5432/canteen_db"
)

REQUIRED_TABLES = [
    "users", "stalls", "menu_items", "orders",
    "order_items", "queue_tokens", "seats", "seat_history"
]


async def verify():
    try:
        from sqlalchemy.ext.asyncio import create_async_engine
        from sqlalchemy import text
    except ImportError:
        print("❌ sqlalchemy/asyncpg not installed")
        return False

    results = []

    # Test 1: Connection
    try:
        engine = create_async_engine(DATABASE_URL, echo=False)
        async with engine.connect() as conn:
            row = await conn.execute(text("SELECT 1"))
            ok = row.scalar() == 1
            print(f"✅ Connection → {'OK' if ok else 'FAIL'}")
            results.append(ok)
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        return False

    # Test 2: Table existence
    async with engine.connect() as conn:
        for table in REQUIRED_TABLES:
            try:
                result = await conn.execute(text(
                    f"SELECT EXISTS (SELECT FROM information_schema.tables "
                    f"WHERE table_name = '{table}')"
                ))
                exists = result.scalar()
                print(f"  {'✅' if exists else '❌'} Table [{table}] → "
                      f"{'EXISTS' if exists else 'MISSING'}")
                results.append(exists)
            except Exception as e:
                print(f"  ❌ Table [{table}] check failed: {e}")
                results.append(False)

    # Test 3: Seed data
    async with engine.connect() as conn:
        try:
            row = await conn.execute(text("SELECT COUNT(*) FROM users"))
            count = row.scalar()
            ok = count > 0
            print(f"\n✅ Seed data → {count} users {'(OK)' if ok else '(EMPTY!)'}")
            results.append(ok)

            row = await conn.execute(text("SELECT COUNT(*) FROM stalls"))
            count = row.scalar()
            print(f"✅ Seed data → {count} stalls")

            row = await conn.execute(text("SELECT COUNT(*) FROM menu_items"))
            count = row.scalar()
            print(f"✅ Seed data → {count} menu items")

            row = await conn.execute(text("SELECT COUNT(*) FROM seats"))
            count = row.scalar()
            print(f"✅ Seed data → {count} seats")

        except Exception as e:
            print(f"❌ Seed data check failed: {e}")
            results.append(False)

    await engine.dispose()

    all_ok = all(results)
    print(f"\n{'🟢 ALL POSTGRES CHECKS PASSED' if all_ok else '🔴 SOME CHECKS FAILED'}")
    return all_ok


if __name__ == "__main__":
    success = asyncio.run(verify())
    sys.exit(0 if success else 1)

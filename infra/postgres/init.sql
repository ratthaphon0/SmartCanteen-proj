-- ═══════════════════════════════════════════════
-- Smart Canteen — Database Schema
-- PostgreSQL 16 initialization script
-- ═══════════════════════════════════════════════

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    user_id     VARCHAR(50) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(150) UNIQUE,
    phone       VARCHAR(20),
    role        VARCHAR(20) DEFAULT 'student',  -- student | staff | admin | vendor
    fcm_token   TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Stalls ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS stalls (
    stall_id                VARCHAR(50) PRIMARY KEY,
    name                    VARCHAR(100) NOT NULL,
    description             TEXT,
    owner_id                VARCHAR(50) REFERENCES users(user_id),
    capacity                INTEGER DEFAULT 2,
    is_active               BOOLEAN DEFAULT TRUE,
    avg_rating              FLOAT DEFAULT 0.0,
    avg_cook_time_seconds   INTEGER DEFAULT 300,
    today_order_count       INTEGER DEFAULT 0,
    freshness_score         FLOAT DEFAULT 0.5,
    value_score             FLOAT DEFAULT 0.5,
    created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Menu Items ──────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
    id              SERIAL PRIMARY KEY,
    menu_id         VARCHAR(50) UNIQUE NOT NULL,
    stall_id        VARCHAR(50) NOT NULL REFERENCES stalls(stall_id),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    price           FLOAT NOT NULL,
    category        VARCHAR(50),        -- main | drink | dessert | snack
    image_url       TEXT,
    is_available    BOOLEAN DEFAULT TRUE,
    calories        INTEGER,
    protein_g       FLOAT,
    avg_cook_time   INTEGER DEFAULT 300,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Orders ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    order_id        VARCHAR(50) PRIMARY KEY,
    user_id         VARCHAR(50) NOT NULL REFERENCES users(user_id),
    stall_id        VARCHAR(50) NOT NULL REFERENCES stalls(stall_id),
    queue_token     VARCHAR(20),
    status          VARCHAR(20) DEFAULT 'pending',  -- pending|preparing|ready|completed|cancelled
    total_price     FLOAT DEFAULT 0.0,
    est_ready_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_order_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_stall ON orders(stall_id);
CREATE INDEX IF NOT EXISTS idx_order_status ON orders(status);

-- ─── Order Items ─────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
    id          SERIAL PRIMARY KEY,
    order_id    VARCHAR(50) NOT NULL REFERENCES orders(order_id),
    menu_id     VARCHAR(50),
    name        VARCHAR(100),
    qty         INTEGER DEFAULT 1,
    price       FLOAT
);

-- ─── Queue Tokens ────────────────────────────────
CREATE TABLE IF NOT EXISTS queue_tokens (
    id              SERIAL PRIMARY KEY,
    token           VARCHAR(20) UNIQUE NOT NULL,
    stall_id        VARCHAR(50) NOT NULL REFERENCES stalls(stall_id),
    order_id        VARCHAR(50) REFERENCES orders(order_id),
    token_number    INTEGER,
    priority        VARCHAR(20) DEFAULT 'walk-in',  -- walk-in | pre-order | vip
    priority_order  INTEGER DEFAULT 2,               -- 0=vip, 1=pre-order, 2=walk-in
    status          VARCHAR(20) DEFAULT 'waiting',   -- waiting|preparing|ready|completed|skipped|cancelled
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_queue_stall_status ON queue_tokens(stall_id, status);

-- ─── Seats ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS seats (
    seat_id         VARCHAR(20) PRIMARY KEY,
    table_id        VARCHAR(20) NOT NULL,
    zone            VARCHAR(10),
    status          VARCHAR(20) DEFAULT 'vacant',  -- occupied | reserved | vacant
    confidence      FLOAT DEFAULT 0.0,
    occupied_since  TIMESTAMPTZ,
    reserved_since  TIMESTAMPTZ,
    reserved_object VARCHAR(50),
    camera_source   VARCHAR(50),
    override        BOOLEAN DEFAULT FALSE,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Seat History ────────────────────────────────
CREATE TABLE IF NOT EXISTS seat_history (
    id          SERIAL PRIMARY KEY,
    seat_id     VARCHAR(20) NOT NULL REFERENCES seats(seat_id),
    status      VARCHAR(20),
    confidence  FLOAT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seat_history ON seat_history(seat_id, recorded_at);

-- ═══════════════════════════════════════════════
-- Seed Data — Demo stalls and menu items
-- ═══════════════════════════════════════════════

-- Demo users
INSERT INTO users (user_id, name, email, role) VALUES
    ('USR-001', 'นายสมชาย', 'somchai@uni.ac.th', 'student'),
    ('USR-002', 'นางสมศรี', 'somsri@uni.ac.th', 'student'),
    ('VENDOR-01', 'ร้านป้าแก้ว', 'vendor1@canteen.com', 'vendor'),
    ('VENDOR-02', 'ร้านลุงสมบัติ', 'vendor2@canteen.com', 'vendor'),
    ('ADMIN-01', 'ผู้ดูแลระบบ', 'admin@canteen.com', 'admin')
ON CONFLICT (user_id) DO NOTHING;

-- Demo stalls
INSERT INTO stalls (stall_id, name, description, owner_id, capacity, avg_rating, avg_cook_time_seconds) VALUES
    ('STALL-01', 'ร้านข้าวแกง ป้าแก้ว', 'ข้าวแกงเจ้าอร่อย หลากหลายเมนู', 'VENDOR-01', 3, 4.5, 180),
    ('STALL-02', 'ก๋วยเตี๋ยว ลุงสมบัติ', 'ก๋วยเตี๋ยวเรือ น้ำตก บะหมี่', 'VENDOR-02', 2, 4.2, 240),
    ('STALL-03', 'ร้านข้าวผัด', 'ข้าวผัดทุกชนิด ทำสดใหม่', 'VENDOR-01', 2, 4.8, 200)
ON CONFLICT (stall_id) DO NOTHING;

-- Demo menu items
INSERT INTO menu_items (menu_id, stall_id, name, price, category, calories, protein_g, avg_cook_time) VALUES
    ('M01', 'STALL-01', 'ข้าวแกงเขียวหวาน', 45, 'main', 520, 25, 180),
    ('M02', 'STALL-01', 'ข้าวผัดกะเพรา', 40, 'main', 480, 22, 180),
    ('M03', 'STALL-01', 'ข้าวมันไก่', 50, 'main', 550, 30, 120),
    ('M04', 'STALL-02', 'ก๋วยเตี๋ยวเรือ', 45, 'main', 400, 20, 240),
    ('M05', 'STALL-02', 'บะหมี่แห้ง', 40, 'main', 380, 18, 180),
    ('M06', 'STALL-02', 'ต้มยำก๋วยเตี๋ยว', 50, 'main', 350, 22, 300),
    ('M07', 'STALL-03', 'ข้าวผัดปู', 60, 'main', 500, 24, 200),
    ('M08', 'STALL-03', 'ข้าวผัดกุ้ง', 55, 'main', 480, 26, 200),
    ('M09', 'STALL-03', 'ข้าวผัดหมู', 40, 'main', 450, 20, 150)
ON CONFLICT (menu_id) DO NOTHING;

-- Demo seats (Zone A)
INSERT INTO seats (seat_id, table_id, zone, status) VALUES
    ('T01-S1', 'T01', 'A', 'vacant'),
    ('T01-S2', 'T01', 'A', 'vacant'),
    ('T01-S3', 'T01', 'A', 'vacant'),
    ('T01-S4', 'T01', 'A', 'vacant'),
    ('T02-S1', 'T02', 'A', 'vacant'),
    ('T02-S2', 'T02', 'A', 'vacant'),
    ('T02-S3', 'T02', 'A', 'vacant'),
    ('T02-S4', 'T02', 'A', 'vacant'),
    ('T03-S1', 'T03', 'A', 'vacant'),
    ('T03-S2', 'T03', 'A', 'vacant')
ON CONFLICT (seat_id) DO NOTHING;
TRUNCATE TABLE seat_history CASCADE;
TRUNCATE TABLE seats CASCADE;
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R1-C1-S1', 'LW-R1-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R1-C1-S2', 'LW-R1-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R1-C1-S3', 'LW-R1-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R1-C1-S4', 'LW-R1-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R1-C2-S1', 'LW-R1-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R1-C2-S2', 'LW-R1-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R1-C2-S3', 'LW-R1-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R1-C2-S4', 'LW-R1-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R2-C1-S1', 'LW-R2-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R2-C1-S2', 'LW-R2-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R2-C1-S3', 'LW-R2-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R2-C1-S4', 'LW-R2-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R2-C2-S1', 'LW-R2-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R2-C2-S2', 'LW-R2-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R2-C2-S3', 'LW-R2-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R2-C2-S4', 'LW-R2-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R3-C1-S1', 'LW-R3-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R3-C1-S2', 'LW-R3-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R3-C1-S3', 'LW-R3-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R3-C1-S4', 'LW-R3-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R3-C2-S1', 'LW-R3-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R3-C2-S2', 'LW-R3-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R3-C2-S3', 'LW-R3-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R3-C2-S4', 'LW-R3-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R4-C1-S1', 'LW-R4-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R4-C1-S2', 'LW-R4-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R4-C1-S3', 'LW-R4-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R4-C1-S4', 'LW-R4-C1', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R4-C2-S1', 'LW-R4-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R4-C2-S2', 'LW-R4-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R4-C2-S3', 'LW-R4-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('LW-R4-C2-S4', 'LW-R4-C2', 'A', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R1-C1-S1', 'RW-R1-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R1-C1-S2', 'RW-R1-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R1-C1-S3', 'RW-R1-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R1-C1-S4', 'RW-R1-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R1-C2-S1', 'RW-R1-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R1-C2-S2', 'RW-R1-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R1-C2-S3', 'RW-R1-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R1-C2-S4', 'RW-R1-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R2-C1-S1', 'RW-R2-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R2-C1-S2', 'RW-R2-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R2-C1-S3', 'RW-R2-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R2-C1-S4', 'RW-R2-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R2-C2-S1', 'RW-R2-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R2-C2-S2', 'RW-R2-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R2-C2-S3', 'RW-R2-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R2-C2-S4', 'RW-R2-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R3-C1-S1', 'RW-R3-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R3-C1-S2', 'RW-R3-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R3-C1-S3', 'RW-R3-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R3-C1-S4', 'RW-R3-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R3-C2-S1', 'RW-R3-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R3-C2-S2', 'RW-R3-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R3-C2-S3', 'RW-R3-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R3-C2-S4', 'RW-R3-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R4-C1-S1', 'RW-R4-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R4-C1-S2', 'RW-R4-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R4-C1-S3', 'RW-R4-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R4-C1-S4', 'RW-R4-C1', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R4-C2-S1', 'RW-R4-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R4-C2-S2', 'RW-R4-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R4-C2-S3', 'RW-R4-C2', 'B', 'vacant');
INSERT INTO seats (seat_id, table_id, zone, status) VALUES ('RW-R4-C2-S4', 'RW-R4-C2', 'B', 'vacant');
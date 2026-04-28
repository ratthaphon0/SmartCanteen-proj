import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');
const POLL_INTERVAL = 10_000; // 10 seconds

// Status progression for demo simulation
const STATUS_FLOW = ['pending', 'preparing', 'ready'];

const DEMO_ORDERS = [
  {
    id: 'ORD-DEMO-01',
    order_id: 'ORD-DEMO-01',
    shopId: 'SHOP-01',
    shopName: 'ร้านอาหารตามสั่ง',
    shopIcon: '🍳',
    items: [
      { name: 'ข้าวมันไก่', qty: 1, price: 55, emoji: '🍗' },
      { name: 'ข้าวหมูแดง', qty: 1, price: 55, emoji: '🥩' },
    ],
    total: 110,
    status: 'preparing',
    queue_token: 'A-07',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'ORD-DEMO-02',
    order_id: 'ORD-DEMO-02',
    shopId: 'SHOP-02',
    shopName: 'ร้านก๋วยเตี๋ยว',
    shopIcon: '🍜',
    items: [
      { name: 'ก๋วยเตี๋ยวเรือ', qty: 1, price: 40, emoji: '🍜' },
    ],
    total: 40,
    status: 'ready',
    queue_token: 'B-03',
    timestamp: new Date().toISOString(),
  },
  {
    id: 'ORD-DEMO-03',
    order_id: 'ORD-DEMO-03',
    shopId: 'SHOP-03',
    shopName: 'ร้านข้าวราดแกง',
    shopIcon: '🍛',
    items: [
      { name: 'ข้าวแกงเขียวหวาน', qty: 1, price: 45, emoji: '🍛' },
      { name: 'ข้าวแกงมัสมั่น', qty: 1, price: 50, emoji: '🥘' },
    ],
    total: 95,
    status: 'pending',
    queue_token: 'C-12',
    timestamp: new Date().toISOString(),
  },
];

// ─── Simple QR-like pattern generator (deterministic from string) ───
function QRPattern({ data, size = 120 }) {
  // Generate a deterministic grid pattern from the data string
  const gridSize = 11;
  const cellSize = size / gridSize;
  const hash = data.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);

  const cells = [];
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      // Position markers (3 corners)
      const isTopLeft = row < 3 && col < 3;
      const isTopRight = row < 3 && col >= gridSize - 3;
      const isBottomLeft = row >= gridSize - 3 && col < 3;
      const isPositionMarker = isTopLeft || isTopRight || isBottomLeft;

      // Border of position markers
      const isOuterBorder = (isTopLeft && (row === 0 || row === 2 || col === 0 || col === 2)) ||
                           (isTopRight && (row === 0 || row === 2 || col === gridSize - 1 || col === gridSize - 3)) ||
                           (isBottomLeft && (row === gridSize - 1 || row === gridSize - 3 || col === 0 || col === 2));
      const isCenter = (isTopLeft && row === 1 && col === 1) ||
                       (isTopRight && row === 1 && col === gridSize - 2) ||
                       (isBottomLeft && row === gridSize - 2 && col === 1);

      let filled = false;
      if (isPositionMarker) {
        filled = isOuterBorder || isCenter;
      } else {
        // Pseudo-random pattern from hash
        const seed = (hash * (row * gridSize + col + 1) * 31) % 100;
        filled = seed > 45;
      }

      if (filled) {
        cells.push(
          <rect
            key={`${row}-${col}`}
            x={col * cellSize}
            y={row * cellSize}
            width={cellSize}
            height={cellSize}
            rx={cellSize * 0.1}
            className="fill-kg-green-p"
          />
        );
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} className="fill-white" rx={4} />
      {cells}
    </svg>
  );
}

export const UserQueue = ({ stallOrders = [], setStallOrders }) => {
  const [orders, setOrders] = useState([]);
  const [debugLog, setDebugLog] = useState([]);
  const [pollCount, setPollCount] = useState(0);
  const [expandedQR, setExpandedQR] = useState(null); // orderId of expanded QR

  const log = useCallback((msg) => {
    if (import.meta.env.DEV) {
      console.log(`[Queue] ${msg}`);
      setDebugLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 15));
    }
  }, []);

  // ─── Load orders from sessionStorage + stallOrders prop ───
  const loadOrders = useCallback(() => {
    log('Loading orders...');

    // 1. Try sessionStorage
    let stored = [];
    try {
      const raw = sessionStorage.getItem('sc_orders');
      if (raw) {
        stored = JSON.parse(raw);
        log(`sessionStorage: found ${stored.length} orders`);
      } else {
        log('sessionStorage: no orders found');
      }
    } catch (e) {
      log(`sessionStorage parse error: ${e.message}`);
    }

    // 2. Merge with stallOrders prop
    const propOrders = stallOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
    log(`stallOrders prop: ${propOrders.length} active orders`);

    // 3. Deduplicate by id
    const merged = [...stored, ...propOrders];
    const seen = new Set();
    const unique = merged.filter(o => {
      const key = o.id || o.order_id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // 4. If still empty, use demo data
    if (unique.length === 0) {
      log('No orders found — using demo data');
      setOrders(DEMO_ORDERS);
      return;
    }

    log(`Loaded ${unique.length} unique orders`);
    setOrders(unique);
  }, [stallOrders, log]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ─── Poll for status updates every 10s ───
  useEffect(() => {
    const interval = setInterval(async () => {
      setPollCount(c => c + 1);
      log(`Polling (#${pollCount + 1})...`);

      // Try real API first
      for (const order of orders) {
        try {
          const res = await fetch(`${API_URL}/api/orders/${order.order_id || order.id}`);
          if (res.ok) {
            const data = await res.json();
            log(`API: ${order.order_id} → status=${data.status}`);
            setOrders(prev => prev.map(o =>
              (o.id === order.id || o.order_id === order.order_id)
                ? { ...o, status: data.status }
                : o
            ));
            continue;
          }
        } catch {
          // API unavailable — simulate progression
        }
      }

      // Demo mode: randomly advance one order's status
      setOrders(prev => {
        const mutable = prev.filter(o => o.status !== 'ready' && o.status !== 'completed');
        if (mutable.length === 0) return prev;

        const pick = mutable[Math.floor(Math.random() * mutable.length)];
        const currentIdx = STATUS_FLOW.indexOf(pick.status);
        if (currentIdx < STATUS_FLOW.length - 1) {
          const nextStatus = STATUS_FLOW[currentIdx + 1];
          log(`Demo: ${pick.id} → ${nextStatus}`);

          const updated = prev.map(o =>
            (o.id === pick.id) ? { ...o, status: nextStatus } : o
          );

          // Persist to sessionStorage
          try {
            sessionStorage.setItem('sc_orders', JSON.stringify(updated));
          } catch {}

          return updated;
        }
        return prev;
      });
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [orders, pollCount, log]);

  // ─── Derived data ───
  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');

  // Group orders by shop
  const ordersByShop = activeOrders.reduce((acc, order) => {
    const key = order.shopId || order.shopName || '_unknown';
    if (!acc[key]) {
      acc[key] = {
        shopId: order.shopId,
        shopName: order.shopName || order.shopId || 'ร้านค้า',
        shopIcon: order.shopIcon || '🏪',
        orders: [],
      };
    }
    acc[key].orders.push(order);
    return acc;
  }, {});

  const shopGroups = Object.values(ordersByShop);
  const totalOrders = activeOrders.length;

  const markReceived = (orderId) => {
    setOrders(prev => {
      const updated = prev.map(o =>
        (o.id === orderId || o.order_id === orderId)
          ? { ...o, status: 'completed' }
          : o
      );
      try {
        sessionStorage.setItem('sc_orders', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (setStallOrders) {
      setStallOrders(prev => prev.map(o =>
        (o.id === orderId) ? { ...o, status: 'completed', timestamp: new Date().toISOString() } : o
      ));
    }
  };

  return (
    <div className="flex flex-col h-full bg-kg-dark text-kg-green-p font-th">
      {/* ═══ Page Header ═══ */}
      <div className="flex justify-between items-end mb-5 px-1">
        <div>
          <div className="font-en font-black text-3xl leading-none italic uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-kg-green-l to-white">
            Smart Queue
          </div>
          <div className="text-[10px] text-kg-green-p/50 font-en tracking-[0.3em] uppercase mt-1">
            {totalOrders > 0 ? `${totalOrders} Active Orders · ${shopGroups.length} Shops` : 'ไม่มีออเดอร์'}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-kg-green-l animate-pulse"></span>
          <span className="text-[9px] font-en font-bold text-kg-green-l uppercase tracking-widest">Live</span>
        </div>
      </div>

      <div className="space-y-6 pb-14 overflow-y-auto flex-1">
        <AnimatePresence>
          {shopGroups.length > 0 ? (
            shopGroups.map((group, groupIdx) => (
              <motion.div
                key={group.shopId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.1 }}
              >
                {/* ═══ Shop Section Header ═══ */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-lg">{group.shopIcon}</span>
                  <span className="font-bold text-sm text-kg-green-l">{group.shopName}</span>
                  <span className="text-[9px] bg-kg-green-p/5 text-kg-green-p/40 px-2 py-0.5 rounded-full font-en font-bold">
                    {group.orders.length} ออเดอร์
                  </span>
                </div>

                {/* ═══ Individual Order Cards ═══ */}
                <div className="space-y-3">
                  {group.orders.map((order, idx) => {
                    const isReady = order.status === 'ready';
                    const isPreparing = order.status === 'preparing';
                    const orderId = order.id || order.order_id;
                    const isQRExpanded = expandedQR === orderId;

                    // Generate pickup code for QR
                    const pickupCode = `SC-${orderId}-${order.queue_token || 'X'}`;

                    return (
                      <motion.div
                        key={orderId}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`backdrop-blur-xl bg-kg-card/80 border rounded-3xl p-5 transition-all duration-500 relative overflow-hidden z-0 ${
                          isReady
                            ? 'border-kg-green-l/50 shadow-[0_10px_40px_rgba(0,166,81,0.25)] ring-1 ring-kg-green-l/30'
                            : isPreparing
                            ? 'border-kg-gold/40 shadow-[0_10px_40px_rgba(201,176,55,0.15)] ring-1 ring-kg-gold/20'
                            : 'border-kg-green/15 hover:border-kg-green/30 hover:bg-kg-card/90 shadow-xl'
                        }`}
                      >
                        {/* Premium Glow Effects */}
                        {isReady && <div className="absolute top-0 right-0 w-48 h-48 bg-kg-green-l/20 rounded-full blur-[50px] -z-10 translate-x-1/2 -translate-y-1/2" />}
                        {isPreparing && <div className="absolute top-0 right-0 w-48 h-48 bg-kg-gold/15 rounded-full blur-[50px] -z-10 translate-x-1/2 -translate-y-1/2" />}

                        {/* Order header: queue token + status */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-en font-extrabold text-lg text-kg-gold-l italic">
                              {order.queue_token || orderId.slice(-6)}
                            </span>
                            <span className="text-[9px] text-kg-green-p/30 font-en font-medium">
                              {orderId}
                            </span>
                          </div>
                          {/* Status badge */}
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black border tracking-widest uppercase shadow-sm ${
                            isReady
                              ? 'bg-kg-green-l/15 border-kg-green-l/40 text-kg-green-l'
                              : isPreparing
                              ? 'bg-kg-gold/15 border-kg-gold/40 text-kg-gold'
                              : 'bg-kg-green-p/5 border-kg-green-p/20 text-kg-green-p/50'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              isReady ? 'bg-kg-green-l' : isPreparing ? 'bg-kg-gold animate-pulse' : 'bg-kg-green-p/30'
                            }`}></span>
                            {isReady ? '✓ พร้อมรับแล้ว' : isPreparing ? '⏳ กำลังปรุง' : '📋 รอคิว'}
                          </span>
                        </div>

                        {/* Item list */}
                        <div className="space-y-1.5 mb-3">
                          {(order.items || []).map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-[11px] px-1">
                              <span className="text-kg-green-p/60">
                                {item.emoji && <span className="mr-1.5">{item.emoji}</span>}
                                {item.name} × {item.qty}
                              </span>
                              <span className="font-en font-bold text-kg-green-p/40">฿{item.price * item.qty}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order total */}
                        <div className="flex justify-between items-center px-1 mb-3 border-t border-kg-green/10 pt-2">
                          <span className="text-[10px] text-kg-green-p/40">รวม</span>
                          <span className="font-en font-extrabold text-sm text-kg-green-l">
                            ฿{order.total || (order.items || []).reduce((s, i) => s + i.price * i.qty, 0)}
                          </span>
                        </div>

                        {/* Ready — show QR code for pickup */}
                        {isReady && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2"
                          >
                            <button
                              onClick={() => setExpandedQR(isQRExpanded ? null : orderId)}
                              className="w-full py-3.5 bg-gradient-to-r from-kg-green to-kg-green-l text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(0,166,81,0.4)] hover:shadow-[0_10px_40px_rgba(0,166,81,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="1" />
                                <rect x="14" y="3" width="7" height="7" rx="1" />
                                <rect x="3" y="14" width="7" height="7" rx="1" />
                                <rect x="14" y="14" width="3" height="3" rx="0.5" />
                                <rect x="18" y="18" width="3" height="3" rx="0.5" />
                                <rect x="18" y="14" width="3" height="3" rx="0.5" />
                                <rect x="14" y="18" width="3" height="3" rx="0.5" />
                              </svg>
                              {isQRExpanded ? 'ซ่อน QR Code' : '📲 แสดง QR Code รับอาหาร'}
                            </button>

                            {/* Expanded QR Section */}
                            <AnimatePresence>
                              {isQRExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-4 bg-white rounded-2xl p-6 flex flex-col items-center gap-4 shadow-[0_8px_32px_rgba(0,166,81,0.15)]">
                                    {/* QR Code */}
                                    <QRPattern data={pickupCode} size={140} />

                                    {/* Pickup info */}
                                    <div className="text-center">
                                      <div className="text-[10px] text-gray-400 font-en uppercase tracking-widest mb-1">สแกนที่ร้านเพื่อรับอาหาร</div>
                                      <div className="font-en font-extrabold text-2xl text-gray-800 italic">{order.queue_token}</div>
                                      <div className="text-[9px] text-gray-400 font-mono mt-1">{pickupCode}</div>
                                    </div>

                                    {/* Items summary on QR */}
                                    <div className="w-full bg-gray-50 rounded-xl p-3 space-y-1">
                                      {(order.items || []).map((item, i) => (
                                        <div key={i} className="flex justify-between text-[11px] text-gray-600">
                                          <span>{item.emoji} {item.name} ×{item.qty}</span>
                                          <span className="font-en font-bold">฿{item.price * item.qty}</span>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="text-[9px] text-gray-300 font-en text-center">
                                      ยื่น QR นี้ให้ร้านค้าสแกน เพื่อยืนยันการรับอาหาร
                                    </div>
                                  </div>

                                  {/* Mock "received" button (for demo flow) */}
                                  <button
                                    onClick={() => markReceived(orderId)}
                                    className="w-full mt-3 py-2 border border-kg-green-p/10 rounded-xl text-[10px] text-kg-green-p/30 font-en uppercase tracking-widest hover:bg-kg-green/10 hover:text-kg-green-l transition-all"
                                  >
                                    🧪 Demo: จำลองร้านค้าสแกนแล้ว
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Shop section divider */}
                {groupIdx < shopGroups.length - 1 && (
                  <div className="h-px bg-kg-green/10 mt-5"></div>
                )}
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-kg-card border border-dashed border-kg-green/20 rounded-2xl p-10 text-center flex flex-col items-center gap-4"
            >
              <div className="text-5xl opacity-20 italic">🍱</div>
              <div className="text-sm font-bold text-kg-green-p/30 uppercase tracking-widest font-en">ยังไม่มีออเดอร์ในขณะนี้</div>
              <div className="text-[10px] text-kg-green-p/20 font-en">สั่งอาหารจากหน้าแรกเพื่อเริ่มต้น</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ Debug Panel (DEV only) ═══ */}
        {import.meta.env.DEV && debugLog.length > 0 && (
          <details className="mt-4">
            <summary className="text-[9px] font-en text-kg-green-p/20 uppercase tracking-widest cursor-pointer hover:text-kg-green-p/40 transition-colors">
              🔧 Debug Log ({debugLog.length})
            </summary>
            <div className="mt-2 bg-kg-surface border border-kg-green/10 rounded-xl p-3 max-h-40 overflow-y-auto">
              {debugLog.map((line, i) => (
                <div key={i} className="text-[9px] font-mono text-kg-green-p/30 leading-relaxed">{line}</div>
              ))}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};

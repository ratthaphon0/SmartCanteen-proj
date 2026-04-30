import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Layouts
import { UserLayout } from './layouts/UserLayout';
import { StallLayout } from './layouts/StallLayout';
import { AdminLayout } from './layouts/AdminLayout';

// User Pages
import { UserLogin } from './pages/user/UserLogin';
import { UserDashboard } from './pages/user/UserDashboard';
import { UserCart } from './pages/user/UserCart';
import { UserQueue } from './pages/user/UserQueue';

// Stall Pages
import { StallOrders } from './pages/stall/StallOrders';

// Admin Pages
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminConfig } from './pages/admin/AdminConfig';

// Core Floor Map
import FloorMap from './pages/FloorMap';

// TV Signage
import { DigitalSignage } from './pages/DigitalSignage';

function App() {
  const [cart, setCart] = useState([]);
  const [stallOrders, setStallOrders] = useState([]);
  const [storeList, setStoreList] = useState(INITIAL_STORES);
  const [floorSeats, setFloorSeats] = useState([]);
  const [userRole, setUserRole] = useState(null);
  
  const isLocalHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const envApiUrl = import.meta.env.VITE_API_URL || '';
  const envWsUrl = import.meta.env.VITE_WS_URL || '';
  const API_URL =
    !isLocalHost && envApiUrl.includes('localhost')
      ? ''
      : envApiUrl || (import.meta.env.DEV ? 'http://localhost:8000' : '');
  const WS_URL =
    !isLocalHost && envWsUrl.includes('localhost')
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
      : envWsUrl || (import.meta.env.DEV ? 'ws://localhost:8000' : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`);

  const normalizeSeat = (s) => ({
    id: s.id || s.seat_id,
    table_id: s.table_id,
    status: s.status,
    lastUpdate: 'Live',
  });
  
  useEffect(() => {
    const fetchSeats = () =>
      fetch(`${API_URL}/api/seats/`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch");
          return res.json();
        })
        .then(data => setFloorSeats(data.map(normalizeSeat)))
        .catch(err => {
          console.error("Failed to fetch live seats:", err);
          setFloorSeats([]);
        });

    // 1. Fetch initial seats
    fetchSeats();

    // 2. Connect to WebSocket
    let ws;
    const retryTimer = setInterval(() => {
      // Keep data alive even if WS drops or first fetch failed.
      setFloorSeats(prev => {
        if (prev.length > 0) return prev;
        fetchSeats();
        return prev;
      });
    }, 10000);
    try {
      ws = new WebSocket(`${WS_URL}/api/seats/ws`);
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'seat_update') {
            const updates = payload.seats;
            setFloorSeats(prev => {
              const next = [...prev];
              updates.forEach(u => {
                const idx = next.findIndex(s => s.id === u.seat_id);
                if (idx !== -1) {
                  next[idx] = { ...next[idx], status: u.status, lastUpdate: 'Live' };
                } else {
                  next.push(normalizeSeat(u));
                }
              });
              return next;
            });
          }
        } catch (e) {
          console.error("WS parse error", e);
        }
      };
      ws.onerror = () => console.warn("WebSocket connection failed for live seat updates");
    } catch {
      console.warn("WebSocket not available for live seat updates");
    }
    return () => {
       clearInterval(retryTimer);
       if(ws && ws.readyState === 1) ws.close();
    }
  }, []);



  const addDemoOrder = () => {
    const items = [
      { name: 'ข้าวมันไก่ธรรมดา', price: 50, emoji: '🍗' },
      { name: 'ข้าวมันไก่พิเศษ', price: 65, emoji: '🍗' },
      { name: 'ก๋วยเตี๋ยวเรือ', price: 45, emoji: '🍜' },
      { name: 'ต้มยำกุ้ง', price: 80, emoji: '🦐' }
    ];
    const item = items[Math.floor(Math.random() * items.length)];
    const newOrder = {
      id: `ORD-${Math.floor(Math.random() * 900) + 100}`,
      items: [{ ...item, qty: 1 }],
      total: item.price,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    setStallOrders(prev => [newOrder, ...prev]);
  };

  const sharedProps = {
    cart, setCart,
    stallOrders, setStallOrders,
    storeList, setStoreList,
    floorSeats, setFloorSeats,
    userRole, setUserRole,
    API_URL, WS_URL
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* TV Digital Signage */}
        <Route path="/signage" element={<DigitalSignage />} />

        {/* Auth / Login */}
        <Route path="/login" element={<UserLogin {...sharedProps} />} />

        {/* 📱 User Application */}
        <Route path="/user" element={<UserLayout {...sharedProps} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard {...sharedProps} />} />
          <Route path="cart" element={<UserCart {...sharedProps} />} />
          <Route path="queue" element={<UserQueue {...sharedProps} />} />
          <Route path="floormap" element={<FloorMap {...sharedProps} />} />
        </Route>

        {/* 🍳 Stall Panel */}
        <Route path="/stall" element={<StallLayout {...sharedProps} />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<StallOrders {...sharedProps} />} />
        </Route>

        {/* ⚙️ Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout {...sharedProps} />}>
          <Route index element={<Navigate to="analytics" replace />} />
          <Route path="analytics" element={<AdminAnalytics {...sharedProps} />} />
          <Route path="config" element={<AdminConfig {...sharedProps} />} />
          <Route path="floormap" element={<FloorMap {...sharedProps} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

const INITIAL_STORES = [
  { id:'S01', name:'ข้าวมันไก่เจ๊สม', status:'active', zone:'A', owner:'สมใจ', price:'฿40-65' },
  { id:'S02', name:'ก๋วยเตี๋ยวเรือลุงแดง', status:'active', zone:'A', owner:'แดง', price:'฿35-55' },
  { id:'S03', name:'ร้านน้ำปั่นชื่นใจ', status:'inactive', zone:'B', owner:'ชื่น', price:'฿25-45' },
  { id:'S04', name:'อาหารตามสั่งยายจง', status:'active', zone:'B', owner:'จง', price:'฿50-80' },
  { id:'S05', name:'ส้มตำนางแดง', status:'active', zone:'C', owner:'แดง', price:'฿30-60' },
];

export default App;

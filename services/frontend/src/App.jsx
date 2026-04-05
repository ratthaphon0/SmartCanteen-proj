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

function App() {
  const [cart, setCart] = useState([]);
  const [stallOrders, setStallOrders] = useState([]);
  const [storeList, setStoreList] = useState(INITIAL_STORES);
  const [floorSeats, setFloorSeats] = useState(INITIAL_SEATS);
  const [userRole, setUserRole] = useState(null); // 'user', 'admin', or null

  // Simulation: Random seat flicker every 12s
  useEffect(() => {
    const interval = setInterval(() => {
      setFloorSeats(prev => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        const cycle = ['vacant', 'occupied', 'reserved'];
        const curr = cycle.indexOf(next[idx].status);
        next[idx] = { ...next[idx], status: cycle[(curr + 1) % cycle.length] };
        return next;
      });
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Simulation: Add demo orders periodically
  useEffect(() => {
    const timer = setTimeout(() => {
       addDemoOrder();
       addDemoOrder();
    }, 2000);
    const interval = setInterval(addDemoOrder, 25000);
    return () => { clearTimeout(timer); clearInterval(interval); };
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
      id: Math.floor(Math.random() * 900) + 100,
      name: item.name,
      price: item.price,
      emoji: item.emoji,
      status: 'pending',
      time: 'เพิ่งสั่ง'
    };
    setStallOrders(prev => [newOrder, ...prev]);
  };

  const sharedProps = {
    cart, setCart,
    stallOrders, setStallOrders,
    storeList, setStoreList,
    floorSeats, setFloorSeats,
    userRole, setUserRole
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
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

const INITIAL_SEATS = [];
const TABLE_COUNT = 13; // 13 large long tables
const SEATS_PER_TABLE = 30; // 15 top, 15 bottom
const statusPool = ['vacant','vacant','vacant','occupied','occupied','reserved'];

for (let t = 1; t <= TABLE_COUNT; t++) {
  const tid = 'T' + String(t).padStart(2,'0');
  for (let s = 1; s <= SEATS_PER_TABLE; s++) {
    INITIAL_SEATS.push({
      table_id: tid,
      id: `${tid}-S${String(s).padStart(2,'0')}`,
      status: statusPool[Math.floor(Math.random() * statusPool.length)],
      lastUpdate: '2m ago'
    });
  }
}

export default App;

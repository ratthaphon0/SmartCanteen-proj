import React, { useState, useEffect, Suspense, Component } from 'react';
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
import { UserMap } from './pages/user/UserMap';

// Stall Pages
import { StallOrders } from './pages/stall/StallOrders';

// Admin Pages
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminConfig } from './pages/admin/AdminConfig';

// TV Signage
import { DigitalSignage } from './pages/DigitalSignage';

// ─── Static Data (must be before App component) ─────────────
const INITIAL_STORES = [
  { id:'S01', name:'ข้าวมันไก่เจ๊สม', status:'active', zone:'A', owner:'สมใจ', price:'฿40-65' },
  { id:'S02', name:'ก๋วยเตี๋ยวเรือลุงแดง', status:'active', zone:'A', owner:'แดง', price:'฿35-55' },
  { id:'S03', name:'ร้านน้ำปั่นชื่นใจ', status:'inactive', zone:'B', owner:'ชื่น', price:'฿25-45' },
  { id:'S04', name:'อาหารตามสั่งยายจง', status:'active', zone:'B', owner:'จง', price:'฿50-80' },
  { id:'S05', name:'ส้มตำนางแดง', status:'active', zone:'C', owner:'แดง', price:'฿30-60' },
];

// ─── Error Boundary ─────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("App Crash:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#030f07', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', color: 'white', fontFamily: 'Inter, sans-serif' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '16px', color: '#ef4444' }}>ขออภัย เกิดข้อผิดพลาด</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px', maxWidth: '500px', textAlign: 'center' }}>{this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '16px 32px', background: '#006633', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 900, cursor: 'pointer', fontSize: '1rem' }}
          >
            รีโหลดหน้าเว็บ
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Main App ───────────────────────────────────────────────
function App() {
  const [cart, setCart] = useState([]);
  const [stallOrders, setStallOrders] = useState([]);
  const [storeList, setStoreList] = useState(INITIAL_STORES);
  const [floorSeats, setFloorSeats] = useState([]);
  const [userRole, setUserRole] = useState(null);
  
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');
  const WS_URL = import.meta.env.VITE_WS_URL || (import.meta.env.DEV ? 'ws://localhost:8000' : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`);

  useEffect(() => {
    console.log("Smart Canteen v2.0 Initialized", { API_URL, WS_URL });
  }, []);

  const sharedProps = {
    cart, setCart,
    stallOrders, setStallOrders,
    storeList, setStoreList,
    floorSeats, setFloorSeats,
    userRole, setUserRole,
    API_URL, WS_URL
  };

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={
          <div style={{ minHeight: '100vh', background: '#030f07', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Inter, sans-serif' }}>
            <p>Loading Smart Canteen...</p>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/signage" element={<DigitalSignage />} />
            <Route path="/login" element={<UserLogin {...sharedProps} />} />

            <Route path="/user" element={<UserLayout {...sharedProps} />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard {...sharedProps} />} />
              <Route path="cart" element={<UserCart {...sharedProps} />} />
              <Route path="queue" element={<UserQueue {...sharedProps} />} />
              <Route path="floormap" element={<UserMap {...sharedProps} />} />
            </Route>

            <Route path="/stall" element={<StallLayout {...sharedProps} />}>
              <Route index element={<Navigate to="orders" replace />} />
              <Route path="orders" element={<StallOrders {...sharedProps} />} />
            </Route>

            <Route path="/admin" element={<AdminLayout {...sharedProps} />}>
              <Route index element={<Navigate to="analytics" replace />} />
              <Route path="analytics" element={<AdminAnalytics {...sharedProps} />} />
              <Route path="config" element={<AdminConfig {...sharedProps} />} />
              <Route path="floormap" element={<UserMap {...sharedProps} />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;

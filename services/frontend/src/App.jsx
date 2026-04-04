import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Layouts
import { UserLayout } from './layouts/UserLayout';
import { StallLayout } from './layouts/StallLayout';
import { AdminLayout } from './layouts/AdminLayout';

// User Pages
import { UserLogin } from './pages/user/UserLogin';
import { UserDashboard } from './pages/user/UserDashboard';
import { UserMap } from './pages/user/UserMap';
import { UserStalls } from './pages/user/UserStalls';
import { UserCart } from './pages/user/UserCart';
import { UserQueue } from './pages/user/UserQueue';

// Stall Pages
import { StallOrders } from './pages/stall/StallOrders';
import { StallMenu } from './pages/stall/StallMenu';
import { StallAnalytics } from './pages/stall/StallAnalytics';

// Admin Pages
import { AdminAnalytics } from './pages/admin/AdminAnalytics';
import { AdminConfig } from './pages/admin/AdminConfig';
import { AdminMonitoring } from './pages/admin/AdminMonitoring';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Redirect to User Login */}
        <Route path="/" element={<Navigate to="/user/login" replace />} />

        {/* 📱 User Application (PWA) */}
        <Route path="/user/login" element={<UserLogin />} />
        
        <Route path="/user" element={<UserLayout />}>
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="map" element={<UserMap />} />
          <Route path="stalls" element={<UserStalls />} />
          <Route path="cart" element={<UserCart />} />
          <Route path="queue" element={<UserQueue />} />
        </Route>

        {/* 🍳 Stall Vendor Panel */}
        <Route path="/stall" element={<StallLayout border="none" />}>
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="orders" element={<StallOrders />} />
          <Route path="menu" element={<StallMenu />} />
          <Route path="analytics" element={<StallAnalytics />} />
        </Route>

        {/* ⚙️ Admin Dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="analytics" replace />} />
          <Route path="analytics" element={<AreaChartAdminWrapper />} />
          <Route path="monitoring" element={<AdminMonitoring />} />
          <Route path="config" element={<AdminConfig />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Simple wrapper to fix naming clash or just use direct components
const AreaChartAdminWrapper = () => <AdminAnalytics />;

export default App;

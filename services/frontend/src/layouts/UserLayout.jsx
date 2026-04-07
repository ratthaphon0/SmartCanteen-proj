import React from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, Clock, Map as MapIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../stores/cartStore';

export const UserLayout = ({ setUserRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = useCartStore(s => s.getItemCount());

  const handleLogout = () => {
    setUserRole(null);
    // Clear session data on logout
    sessionStorage.removeItem('sc_orders');
    navigate('/login');
  };

  const navItems = [
    { to: '/user/dashboard', icon: Home, label: 'หน้าแรก' },
    { to: '/user/cart', icon: ShoppingCart, label: 'ตะกร้า', badge: cartCount },
    { to: '/user/queue', icon: Clock, label: 'คิว' },
    { to: '/user/floormap', icon: MapIcon, label: 'แผนที่' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-kg-dark text-kg-green-p font-th overflow-x-hidden">
      {/* Top Nav Placeholder from Snippet */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-kg-dark/90 backdrop-blur-xl border-b border-kg-green/20 flex overflow-x-auto hide-scrollbar">
        <button onClick={handleLogout} className="px-5 py-3.5 font-en text-[11px] font-semibold tracking-widest uppercase text-kg-green-p/40 hover:text-kg-green-p transition-all whitespace-nowrap">🔐 Logout</button>
        <span className="px-5 py-3.5 font-en text-[11px] font-semibold tracking-widest uppercase text-kg-green-l border-b-2 border-kg-green-l whitespace-nowrap">📱 Student App</span>
      </nav>

      <main className="flex-1 pt-14 pb-32 max-w-lg mx-auto w-full px-4 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Glassmorphic Bottom Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 max-w-[calc(32rem-2rem)] mx-auto bg-kg-surface/90 backdrop-blur-xl border border-kg-green/20 rounded-[20px] flex p-2 z-50 shadow-2xl">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => 
              `flex-1 flex flex-col items-center gap-1 py-2 rounded-2xl transition-all duration-300 relative ${
                isActive ? 'bg-kg-green-l/15 text-kg-green-l' : 'text-kg-green-p/40 hover:text-kg-green-p/70'
              }`
            }
          >
            <item.icon size={20} strokeWidth={2.5} />
            <span className="text-[10px] font-bold font-en tracking-tight">
              {item.label}
              {item.badge > 0 && (
                <span className="ml-1 bg-kg-gold text-black rounded-full text-[9px] px-1.5 font-en font-bold align-top">
                  {item.badge}
                </span>
              )}
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

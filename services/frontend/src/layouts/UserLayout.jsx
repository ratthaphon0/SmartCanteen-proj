import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map as MapIcon, Store, ShoppingCart, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UserLayout = () => {
  const location = useLocation();

  const navItems = [
    { to: '/user/dashboard', icon: LayoutDashboard, label: 'หน้าแรก' },
    { to: '/user/map', icon: MapIcon, label: 'แผนที่' },
    { to: '/user/stalls', icon: Store, label: 'ร้านอาหาร' },
    { to: '/user/cart', icon: ShoppingCart, label: 'ตะกร้า' },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-[480px] mx-auto bg-[#0f1117] shadow-black/50 shadow-2xl overflow-hidden relative">
      {/* Top Status Bar (fake) */}
      <div className="h-6 flex justify-between items-center px-6 pt-2 text-[10px] text-gray-500 font-bold tracking-widest uppercase">
        <span>KU-Canteen</span>
        <span>12:45 PM</span>
      </div>

      <main className="flex-1 overflow-y-auto px-5 py-6 pb-28 hide-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Dynamic Bottom Navbar */}
      <nav className="absolute bottom-6 left-5 right-5 h-16 bg-[#1a1d2e]/80 backdrop-blur-xl border border-white/10 rounded-2xl flex justify-around items-center px-2 z-50 shadow-2xl">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink 
            key={to}
            to={to} 
            className={({isActive}) => `relative flex flex-col items-center justify-center w-16 h-full transition-all duration-300 ${isActive ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 bg-blue-500/10 rounded-xl"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] mt-1 font-bold ${isActive ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

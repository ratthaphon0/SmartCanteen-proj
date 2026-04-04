import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { ChefHat, ListOrdered, MenuSquare, LineChart, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export const StallLayout = () => {
  const stallNav = [
    { to: '/stall/orders', icon: ListOrdered, label: 'จัดการออเดอร์' },
    { to: '/stall/menu', icon: MenuSquare, label: 'จัดการเมนู' },
    { to: '/stall/analytics', icon: LineChart, label: 'รายงานยอดขาย' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#0f1117] text-white">
      {/* Sidebar for Desktop / Bottom Nav for Mobile */}
      <aside className="w-full md:w-64 bg-[#1a1d2e] border-r border-white/5 flex flex-col md:h-full z-50 fixed md:static bottom-0 left-0 right-0 h-20 md:h-full shadow-2xl md:shadow-none">
        {/* Desktop Sidebar Header */}
        <div className="hidden md:flex p-8 items-center gap-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
            <ChefHat size={24} className="text-orange-500" />
          </div>
          <span className="font-extrabold text-lg tracking-tight">Stall Panel</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start px-4 py-2 md:py-6 gap-2">
          {stallNav.map(({ to, icon: Icon, label }) => (
            <NavLink 
              key={to}
              to={to} 
              className={({isActive}) => `flex flex-col md:flex-row items-center gap-1 md:gap-4 px-4 py-2 md:py-3.5 transition-all duration-300 md:rounded-xl text-[10px] md:text-sm font-bold ${isActive ? 'bg-blue-500/10 text-blue-400 border-t-2 md:border-t-0 md:border-r-4 border-blue-500' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <Icon size={20} className="md:w-5 md:h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
          
          <button className="hidden md:flex mt-auto items-center gap-4 px-6 py-4 text-gray-500 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-bold">ออกจากระบบ</span>
          </button>
        </nav>
      </aside>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0">
        <header className="h-20 bg-[#1a1d2e]/50 backdrop-blur-xl border-b border-white/5 flex items-center px-6 md:px-12 justify-between sticky top-0 z-40">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3">
              <span className="md:hidden"><ChefHat size={24} className="text-orange-500" /></span>
              ร้านข้าวแกงแม่ประนอม
            </h2>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Open
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Notification trigger, etc */}
          </div>
        </header>

        <main className="flex-1 p-5 md:p-12 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

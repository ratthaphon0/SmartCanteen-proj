import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Activity, Settings, Video, ShieldCheck, Database, LogOut } from 'lucide-react';

export const AdminLayout = () => {
  const adminNav = [
    { to: '/admin/analytics', icon: Activity, label: 'ภาพรวมระบบ' },
    { to: '/admin/monitoring', icon: Video, label: 'AI & CCTV' },
    { to: '/admin/config', icon: Settings, label: 'ตั้งค่าระบบ' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#0f1117] text-white">
      {/* Sidebar Mobile/Bottom & Desktop */}
      <aside className="w-full md:w-64 bg-[#1a1d2e] border-r border-white/5 flex flex-col md:h-full z-50 fixed md:static bottom-0 left-0 right-0 h-20 md:h-full shadow-2xl">
        <div className="hidden md:flex p-8 items-center gap-4 bg-blue-600/10 border-b border-blue-500/10 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
            <ShieldCheck size={24} className="text-blue-500" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-blue-400">Admin Portal</span>
        </div>

        <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start px-2 md:px-4 gap-1 md:gap-2">
          {adminNav.map(({ to, icon: Icon, label }) => (
            <NavLink 
              key={to}
              to={to} 
              className={({isActive}) => `flex flex-col md:flex-row items-center gap-1 md:gap-4 px-3 py-2 md:px-6 md:py-3.5 transition-all duration-300 md:rounded-xl text-[10px] md:text-sm font-bold ${isActive ? 'bg-blue-500/10 text-blue-400 border-t-2 md:border-t-0 md:border-r-4 border-blue-500' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
          
          <button className="hidden md:flex mt-auto mb-8 items-center gap-4 px-6 py-4 text-gray-500 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </nav>
      </aside>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pb-20 md:pb-0">
        <header className="h-20 bg-[#1a1d2e]/50 backdrop-blur-xl border-b border-white/5 flex items-center px-6 md:px-12 justify-between shrink-0 sticky top-0 z-40">
          <div className="flex flex-col">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90">
              Smart Canteen Admin
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Database size={12} className="text-gray-500" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none">Database online</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-black border border-blue-500/20">
              S
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 md:p-12 overflow-y-auto bg-grid-white/[0.02]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

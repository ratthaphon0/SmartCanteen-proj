import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Store, LineChart, Map as MapIcon } from 'lucide-react';

export const AdminLayout = ({ setUserRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUserRole(null);
    navigate('/login');
  };

  const adminNav = [
    { to: '/admin/config', icon: Store, label: 'จัดการร้านค้า' },
    { to: '/admin/analytics', icon: LineChart, label: 'ภาพรวม' },
    { to: '/admin/floormap', icon: MapIcon, label: 'Floor Map' },
  ];

  const getPageTitle = () => {
    if (location.pathname.includes('config')) return 'จัดการร้านค้า';
    if (location.pathname.includes('analytics')) return 'ภาพรวมระบบ';
    if (location.pathname.includes('floormap')) return 'Floor Map';
    return 'Admin Panel';
  };

  return (
    <div className="flex h-screen bg-kg-dark text-kg-green-p font-th">
      {/* Sidebar */}
      <aside className="w-14 sm:w-52 bg-kg-card border-r border-kg-green/15 flex flex-col flex-shrink-0">
        <div className="p-4 sm:p-5 border-b border-kg-green/15">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-kg-green to-kg-green-l flex items-center justify-center text-lg flex-shrink-0 animate-pulse-slow">⚙️</div>
            <span className="hidden sm:block font-bold text-sm font-en">Admin</span>
          </div>
          <div className="hidden sm:block text-[10px] text-kg-green-p/30 font-en pl-12">KU Canteen Portal</div>
          <div className="hidden sm:flex pl-12 mt-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-kg-gold/15 text-kg-gold-l border border-kg-gold/25 font-en">⚙️ Admin</span>
          </div>
        </div>

        <nav className="flex-1 p-2 sm:p-3 flex flex-col gap-1">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                  ? 'bg-kg-green/20 text-kg-green-l' 
                  : 'text-kg-green-p/40 hover:bg-kg-green/10 hover:text-kg-green-p/80'
                }`
              }
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span className="hidden sm:block text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="px-5 py-3.5 border-b border-kg-green/15 flex justify-between items-center bg-kg-card/50 backdrop-blur-md">
          <div className="font-bold text-sm">{getPageTitle()}</div>
          <div className="flex items-center gap-4">
             <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-kg-green-l/15 text-kg-green-l border border-kg-green-l/25">
               <span className="w-1.5 h-1.5 rounded-full bg-kg-green-l animate-blink"></span> Online
             </span>
             <button 
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 border border-kg-green/15 rounded-xl text-kg-green-p/40 hover:text-red-400 hover:border-red-400/30 transition-all font-bold"
            >
              🚪 ออกจากระบบ
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_50%_0%,rgba(0,102,51,0.05)_0%,transparent_50%)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

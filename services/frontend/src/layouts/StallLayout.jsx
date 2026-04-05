import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ListOrdered, MenuSquare, LineChart, LogOut } from 'lucide-react';

export const StallLayout = ({ setUserRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUserRole(null);
    navigate('/login');
  };

  const stallNav = [
    { to: '/stall/orders', icon: ListOrdered, label: 'จัดการออเดอร์' },
    // { to: '/stall/menu', icon: MenuSquare, label: 'จัดการเมนู' }, // Snippet has these sections
    // { to: '/stall/stats', icon: LineChart, label: 'ยอดขาย' },
  ];

  const getPageTitle = () => {
    if (location.pathname.includes('orders')) return 'จัดการออเดอร์';
    if (location.pathname.includes('menu')) return 'จัดการเมนู';
    if (location.pathname.includes('stats')) return 'รายงานยอดขาย';
    return 'Stall Panel';
  };

  return (
    <div className="flex h-screen bg-kg-dark text-kg-green-p font-th">
      {/* Sidebar */}
      <aside className="w-14 sm:w-52 bg-kg-card border-r border-kg-green/15 flex flex-col flex-shrink-0">
        <div className="p-4 sm:p-5 border-b border-kg-green/15">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-kg-green to-kg-green-l flex items-center justify-center text-lg flex-shrink-0 animate-pulse-slow">🍳</div>
            <span className="hidden sm:block font-bold text-sm font-en">Stall Panel</span>
          </div>
          <div className="hidden sm:block text-[10px] text-kg-green-p/30 font-en pl-12">ร้านข้าวมันไก่เจ๊สม</div>
        </div>
        
        <nav className="flex-1 p-2 sm:p-3 flex flex-col gap-1">
          {stallNav.map((item) => (
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

        <div className="p-3 sm:p-4 border-t border-kg-green/15 mt-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-kg-green-l">
            <div className="w-2 h-2 rounded-full bg-kg-green-l animate-blink flex-shrink-0"></div>
            <span className="hidden sm:block">เปิดให้บริการ</span>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="px-5 py-3.5 border-b border-kg-green/15 flex justify-between items-center bg-kg-card/50 backdrop-blur-md">
          <div className="font-bold text-sm">{getPageTitle()}</div>
          <div className="flex gap-2">
            <button 
              onClick={handleLogout}
              className="text-xs px-3 py-1.5 border border-kg-green/15 rounded-xl text-kg-green-p/40 hover:text-red-400 hover:border-red-400/30 transition-all font-bold"
            >
              🚪 ออก
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

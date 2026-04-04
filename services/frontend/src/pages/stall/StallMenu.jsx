import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { Edit2, LayoutGrid, List, Plus, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

export const StallMenu = () => {
  const [menus, setMenus] = useState([
    { id: 1, name: 'ข้าวมันไก่ต้ม (ธรรมดา)', price: 40, active: true, cat: 'Rice' },
    { id: 2, name: 'ข้าวมันไก่ทอด (ธรรมดา)', price: 45, active: true, cat: 'Rice' },
    { id: 3, name: 'ข้าวมันไก่ผสม (พิเศษ)', price: 50, active: false, cat: 'Rice' },
  ]);

  const toggleStatus = (id) => {
    setMenus(menus.map(m => m.id === id ? { ...m, active: !m.active } : m));
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
      <header className="flex justify-between items-center bg-[#1a1d2e] p-6 rounded-2xl border border-white/5 shadow-2xl">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase mb-1">จัดการเมนูอาหาร</h2>
          <p className="text-gray-500 font-medium text-xs uppercase tracking-widest leading-none">Manage Availability & Pricing</p>
        </div>
        <div className="flex items-center gap-3">
           <button className="p-3 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors">
              <LayoutGrid size={18} />
           </button>
           <Button className="py-3 px-6 text-xs font-black uppercase tracking-widest shadow-blue-500/30">
              <Plus size={16} /> New Menu
           </Button>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="flex gap-4 border-b border-white/5 pb-4 px-2 overflow-x-auto hide-scrollbar">
        {['All Menus', 'Main Rice', 'Sides', 'Drinks'].map((cat, i) => (
          <button key={cat} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${i === 0 ? 'text-blue-500 border-b-2 border-blue-500 pb-4 -mb-4' : 'text-gray-500 hover:text-gray-300'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {menus.map((menu) => (
          <GlassCard 
            key={menu.id} 
            className={`flex justify-between items-center p-6 border-white/5 relative group transition-all duration-500 ${!menu.active ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100 hover:bg-white/[0.03] shadow-black/40 shadow-xl'}`}
          >
            <div className="flex flex-col h-full justify-center">
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{menu.cat}</span>
              <h3 className="font-extrabold text-lg text-white mb-2 leading-none uppercase tracking-tight">{menu.name}</h3>
              <div className="flex items-center gap-2">
                 <span className="text-2xl font-black text-blue-400 tracking-tighter">฿{menu.price}</span>
                 <button className="p-2 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-blue-500 transition-opacity">
                    <Edit2 size={12} />
                 </button>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-6 justify-between h-full">
              <button 
                onClick={(e) => { e.preventDefault(); toggleStatus(menu.id); }}
                className={`transition-all duration-300 scale-125 pointer-events-auto ${menu.active ? 'text-emerald-500 hover:scale-135' : 'text-gray-700'}`}
              >
                {menu.active ? <ToggleRight size={48} strokeWidth={1} /> : <ToggleLeft size={48} strokeWidth={1} />}
              </button>
              
              <button className="p-2 opacity-0 group-hover:opacity-100 text-gray-700 hover:text-red-500 transition-opacity pointer-events-auto">
                 <Trash2 size={14} />
              </button>
            </div>
          </GlassCard>
        ))}
        
        {/* Empty Placeholder Slot */}
        <div className="border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center p-8 opacity-20 hover:opacity-100 hover:border-blue-500/20 transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Plus size={24} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Quick Add Item</span>
        </div>
      </div>
    </div>
  );
};

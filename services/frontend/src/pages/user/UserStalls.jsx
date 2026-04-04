import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, MoreVertical } from 'lucide-react';

export const UserStalls = () => {
  const stalls = [
    { id: 1, name: 'ก๋วยเตี๋ยวลุงแดง', wait: '3คิว', status: 'เปิด', rating: 4.8, type: 'Noodles', emoji: '🍜' },
    { id: 2, name: 'ข้าวมันไก่เจ๊สม', wait: '10คิว', status: 'เปิด', rating: 4.5, type: 'Rice', emoji: '🍛' },
    { id: 3, name: 'น้ำปั่นชื่นใจ', wait: 'ว่าง', status: 'เปิด', rating: 5.0, type: 'Drinks', emoji: '🥤' }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-6"
    >
      <header>
        <h1 className="text-3xl font-black text-white tracking-tight mb-4 leading-none">ร้านอาหาร</h1>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search stores or menus..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all placeholder:text-gray-600 shadow-2xl" 
          />
        </div>
      </header>

      {/* Categories Toolbar */}
      <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2 mask-linear-gradient-x">
        {['All', 'Rice', 'Noodles', 'Drinks', 'Halal', 'Sweets'].map((cat, i) => (
          <button 
            key={cat} 
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${i === 0 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white/5 text-gray-500 hover:text-white border border-white/10'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {stalls.map(stall => (
          <GlassCard key={stall.id} interactive className="flex py-5 px-6 justify-between items-center group/card border-white/5 hover:border-blue-500/20">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl border border-white/5 group-hover/card:scale-105 group-hover/card:bg-white/10 transition-all">
                {stall.emoji}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-extrabold text-white text-lg group-hover/card:text-blue-400 transition-colors tracking-tight leading-none uppercase">{stall.name}</h3>
                </div>
                <div className="flex items-center gap-3 mt-1.5 font-bold">
                  <div className="flex items-center gap-1 text-emerald-500 text-[10px] uppercase tracking-widest">
                    <Star size={10} strokeWidth={3} fill="currentColor" /> {stall.rating}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                  <div className="text-blue-400 text-[10px] uppercase tracking-widest underline underline-offset-4 decoration-blue-500/30">
                    รอ {stall.wait}
                  </div>
                  <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                  <div className="text-gray-500 text-[10px] uppercase tracking-widest">{stall.type}</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button size="sm" variant="secondary" className="rounded-full h-8 w-8 !p-0">
                 <MoreVertical size={16} />
              </Button>
            </div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
};

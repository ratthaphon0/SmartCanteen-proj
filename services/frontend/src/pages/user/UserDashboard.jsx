import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { Search, Flame, Users, Clock, ArrowRight } from 'lucide-react';

export const UserDashboard = () => {
  return (
    <div className="flex flex-col gap-6">
      <header className="mb-2">
        <h1 className="text-3xl font-black text-white tracking-tight mb-1">สวัสดี, Supachai 👋</h1>
        <p className="text-gray-500 font-medium">Have a great meal today!</p>
      </header>

      {/* Hero Banner */}
      <GlassCard className="bg-gradient-to-br from-blue-600 to-purple-600 border-none text-white p-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Flame size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            🔥 Exclusive Offer
          </div>
          <h3 className="text-2xl font-black tracking-tight mb-2">Flash Sale!</h3>
          <p className="text-sm font-medium text-white/80 leading-relaxed max-w-[200px]">
            รับส่วนลด 15 บาท เมื่อสั่งเมนูข้าวราดแกงทุกร้านในแอป
          </p>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="flex flex-col items-center justify-center py-6 border-white/5 shadow-xl group">
          <Users size={24} className="text-emerald-500 mb-3 group-hover:scale-110 transition-transform" />
          <div className="text-3xl font-black text-emerald-500 tracking-tighter">45</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">ที่นั่งว่าง</div>
        </GlassCard>
        
        <GlassCard className="flex flex-col items-center justify-center py-6 border-white/5 shadow-xl group">
          <Clock size={24} className="text-cyan-500 mb-3 group-hover:scale-110 transition-transform" />
          <div className="text-3xl font-black text-cyan-500 tracking-tighter">8m</div>
          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">เวลารอฉลี่ย</div>
        </GlassCard>
      </div>

      {/* Quick Search */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-600 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Search for food or stalls..." 
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all placeholder:text-gray-600" 
        />
      </div>

      {/* Section Header */}
      <div className="flex justify-between items-center mt-2 px-1">
        <h2 className="text-lg font-black text-white/90">ร้านอาหารแนะนำ</h2>
        <button className="text-[10px] font-black text-gray-500 hover:text-blue-400 uppercase tracking-widest transition-colors flex items-center gap-1.5">
          View all <ArrowRight size={12} />
        </button>
      </div>
      
      {/* Popular Stalls List */}
      <div className="flex flex-col gap-3">
        {[1, 2].map((i) => (
          <GlassCard key={i} interactive className="flex py-4 px-5 justify-between items-center group/card border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center overflow-hidden border border-white/5">
                <span className="text-xl">{i === 1 ? '🍜' : '🍛'}</span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-white group-hover/card:text-blue-400 transition-colors uppercase tracking-tight">
                  {i === 1 ? 'ก๋วยเตี๋ยวลุงแดง' : 'ข้าวมันไก่เจ๊สม'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge status={i === 1 ? 'preparing' : 'vacant'} className="scale-[0.8] origin-left">
                    {i === 1 ? 'รอนาน (15m)' : 'คิวสั้น (2m)'}
                  </Badge>
                </div>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-700 group-hover/card:text-blue-500 group-hover/card:translate-x-1 transition-all" />
          </GlassCard>
        ))}
      </div>
    </div>
  );
};

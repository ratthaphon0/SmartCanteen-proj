import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { Clock, ChefHat, CheckCircle2, UserCheck } from 'lucide-react';

export const UserQueue = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-6 h-full text-center"
    >
      <header className="mb-4">
        <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">ติดตามสถานะ</h1>
        <p className="text-gray-500 font-medium text-xs uppercase tracking-widest leading-none">Real-time Order Progress</p>
      </header>

      {/* Main Status Display */}
      <GlassCard className="flex flex-col items-center justify-center py-10 bg-gradient-to-b from-[#1a1d2e] to-black/30 border border-blue-500/10 shadow-black shadow-2xl relative group">
        <div className="absolute top-4 right-6 flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
           <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Live Updates</span>
        </div>
        
        <h2 className="text-5xl font-black text-blue-500 tracking-tighter mb-1 select-none">Q-104</h2>
        <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">ร้านข้าวมันไก่เจ๊สม</span>
        
        {/* Progress Ring Simulation */}
        <div className="mt-10 relative flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border-2 border-white/5 flex flex-col items-center justify-center relative bg-black/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
             <div className="flex flex-col items-center">
                <ChefHat size={32} className="text-orange-500 mb-3 animate-bounce" />
                <span className="text-3xl font-black text-white tracking-tighter">5</span>
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">min wait</span>
             </div>
             
             {/* Progress Segments */}
             <div className="absolute inset-0 rounded-full border-t-4 border-l-4 border-orange-500 border-transparent rotate-45 opacity-60"></div>
          </div>
        </div>

        <div className="mt-8">
          <Badge status="preparing" className="px-6 py-2 text-xs font-black bg-blue-500/20 text-blue-400 border-blue-500/30 uppercase tracking-[0.1em]">🧑‍🍳 กำลังจัดเตรียมออเดอร์</Badge>
        </div>
      </GlassCard>

      {/* Step Sequence */}
      <div className="flex flex-col gap-3 mt-4 text-left">
         {[
           { icon: UserCheck, label: 'คำสั่งซื้อเข้าสู่คิว', active: true, done: true },
           { icon: ChefHat, label: 'พนักงานกำลังเตรียมอาหาร', active: true, done: false },
           { icon: CheckCircle2, label: 'อาหารพร้อมให้รับแล้ว!', active: false, done: false },
         ].map((step, i) => (
           <GlassCard key={i} className={`flex items-center gap-4 py-4 px-6 border-white/5 transition-opacity ${step.active ? 'opacity-100' : 'opacity-30'}`}>
              <div className={`p-2 rounded-lg ${step.done ? 'bg-emerald-500/10 text-emerald-500' : step.active ? 'bg-blue-500/10 text-blue-500' : 'bg-white/5 text-gray-600'}`}>
                 <step.icon size={18} strokeWidth={3} />
              </div>
              <span className={`text-[11px] font-black uppercase tracking-widest ${step.active ? 'text-white' : 'text-gray-600'}`}>{step.label}</span>
              {step.done && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
           </GlassCard>
         ))}
      </div>

      <div className="mt-auto pt-6">
        <Button variant="secondary" className="w-full py-4 text-xs font-black uppercase tracking-widest opacity-80 hover:opacity-100" onClick={() => window.location.href = '/user/dashboard'}>
          ดูประวัติการสั่งซื้อ
        </Button>
      </div>
    </motion.div>
  );
};

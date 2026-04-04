import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { motion } from 'framer-motion';
import { Map as MapIcon, RotateCw, Filter, Layers } from 'lucide-react';

export const UserMap = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5 h-full min-h-[500px]"
    >
      <header className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">AI Floor Map</h1>
          <p className="text-gray-500 font-medium text-xs uppercase tracking-widest leading-none">Real-time Seat Detection</p>
        </div>
        <button className="p-3 bg-white/5 rounded-xl border border-white/10 text-gray-500 hover:text-blue-400 transition-colors">
          <RotateCw size={18} />
        </button>
      </header>

      {/* Legend & Stats */}
      <div className="flex gap-2 flex-wrap mb-2">
        <Badge status="vacant" className="bg-emerald-500/10 text-emerald-500 py-1.5 px-3">ที่นั่งว่าง: 45</Badge>
        <Badge status="occupied" className="bg-red-500/10 text-red-500 py-1.5 px-3">ไม่ว่าง: 120</Badge>
        <Badge status="reserved" className="bg-amber-500/10 text-amber-500 py-1.5 px-3">จอง/วางของ: 12</Badge>
      </div>

      <GlassCard className="flex-1 flex flex-col items-center justify-center min-h-[350px] relative overflow-hidden bg-grid-white/[0.02] border-white/5 group shadow-black/80">
        {/* Floating Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors">
            <Filter size={16} />
          </button>
          <button className="p-2 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-white/60 hover:text-white transition-colors">
            <Layers size={16} />
          </button>
        </div>

        {/* Map Center */}
        <div className="text-center">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
            transition={{ repeat: Infinity, duration: 8 }}
            className="text-6xl mb-6 drop-shadow-2xl"
          >
            🗺️
          </motion.div>
          <p className="font-black text-white uppercase tracking-widest text-sm mb-2 group-hover:text-blue-400 transition-colors">
            Interactive Floor Map
          </p>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] max-w-[200px] mx-auto leading-relaxed">
            SVG Map will be injected here via AI pipeline WebSocket signal.
          </p>
        </div>

        {/* Pulse Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
             <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Live Stream Active</span>
        </div>
      </GlassCard>

      <div className="flex gap-4 px-2">
        <GlassCard className="flex-1 p-4 flex items-center gap-3 border-white/5 bg-white/[0.03]">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Filter size={14} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Filter Zones</span>
        </GlassCard>
        <GlassCard className="flex-1 p-4 flex items-center gap-3 border-white/5 bg-white/[0.03]">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
            <Layers size={14} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Heatmap Mode</span>
        </GlassCard>
      </div>
    </motion.div>
  );
};

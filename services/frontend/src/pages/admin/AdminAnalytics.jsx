import React from 'react';
import { motion } from 'framer-motion';
import HeatmapAnalytics from '../../components/HeatmapAnalytics';

export const AdminAnalytics = ({ API_URL }) => {
  return (
    <div className="flex flex-col h-full bg-kg-dark text-kg-green-p font-th p-8">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 px-1">
        <div>
          <div className="font-en font-extrabold text-2xl leading-none italic uppercase bg-clip-text text-transparent bg-gradient-to-r from-[#00a8ff] to-white">B2B Analytics Hub</div>
          <div className="text-[10px] text-kg-green-p/40 font-en tracking-[0.2em] uppercase mt-1">Smart Canteen Infrastructure</div>
        </div>
        <div className="px-3 py-1.5 bg-[#00a8ff]/10 border border-[#00a8ff]/20 rounded-full flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00a8ff] animate-pulse"></span>
          <span className="text-[10px] font-bold text-[#00a8ff] uppercase tracking-widest font-en">AI Sensors Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Current Peak Zone', val: 'Zone B', trend: 'High Traffic', color: 'text-red-400', badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20' },
          { label: 'Total Diners Today', val: '1,245', trend: '+12% vs Yesterday', color: 'text-kg-gold-l', badgeColor: 'bg-kg-gold/10 text-kg-gold border-kg-gold/20' },
          { label: 'Avg Wait Time', val: '4m 30s', trend: '-2m (Load Balanced)', color: 'text-kg-green-l', badgeColor: 'bg-kg-green-l/10 text-kg-green-l border-kg-green-l/20' },
          { label: 'Food Waste Prevented', val: '45 Kg', trend: 'ESG Goal On Track', color: 'text-[#00a8ff]', badgeColor: 'bg-[#00a8ff]/10 text-[#00a8ff] border-[#00a8ff]/20' }
        ].map((kpi, i) => (
          <div key={i} className="bg-kg-card border border-kg-green/15 rounded-3xl p-6 shadow-xl group hover:border-[#00a8ff]/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 font-en font-black text-6xl italic select-none pointer-events-none group-hover:scale-110 transition-transform">
              {i+1}
            </div>
            <div className="text-[10px] font-en tracking-widest uppercase text-kg-green-p/40 mb-3 relative z-10">{kpi.label}</div>
            <div className={`font-en text-3xl font-extrabold italic mb-4 relative z-10 ${kpi.color}`}>{kpi.val}</div>
            <div className={`inline-flex px-2.5 py-1 rounded-md text-[9px] font-bold border uppercase relative z-10 ${kpi.badgeColor}`}>
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time Heatmap Layer */}
      <div className="mb-12">
        <HeatmapAnalytics API_URL={API_URL} />
      </div>

      {/* Footer / Context */}
      <div className="mt-auto pt-8 border-t border-white/5 flex justify-between items-center text-[9px] font-en text-white/20 uppercase tracking-widest">
        <span>© 2026 Smart Canteen Intelligence</span>
        <span>Secure Feed: SSL Encrypted (AES-256)</span>
      </div>
    </div>
  );
};


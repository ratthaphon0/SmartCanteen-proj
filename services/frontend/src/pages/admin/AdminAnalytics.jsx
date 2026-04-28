import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminAnalytics = () => {
  const chartData = [
    { time: '08:00', val: 30 },
    { time: '10:00', val: 65 },
    { time: '12:00', val: 95 },
    { time: '14:00', val: 40 },
    { time: '16:00', val: 20 },
  ];

  return (
    <div className="flex flex-col h-full bg-kg-dark text-kg-green-p font-th">
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

      {/* Main Chart Card */}
      <div className="flex-1 bg-kg-card border border-kg-green/15 rounded-[32px] p-8 shadow-2xl overflow-hidden relative group mb-2">
        <div className="absolute top-0 right-0 p-10 text-[120px] opacity-[0.02] italic font-en font-black select-none pointer-events-none group-hover:scale-110 transition-transform">HEATMAP</div>

        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="font-en text-2xl font-extrabold italic uppercase tracking-tight text-[#00a8ff]">Crowd Density Heatmap</h3>
            <p className="text-[10px] text-kg-green-p/40 font-en uppercase tracking-[0.2em] mt-1">Peak Time Analysis for Staffing & Prep</p>
            
            <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 inline-flex flex-col gap-1">
              <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">⚠️ AI Recommendation</span>
              <span className="text-[11px] text-white">Deploy cleaning staff to Zone B at 12:00</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-[#00a8ff]"></div> <span className="text-[10px] font-bold uppercase font-en opacity-60">Traffic Volume</span></div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="kgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00a8ff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00a8ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,166,81,0.05)" vertical={false} />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6fbd8a', fontSize: 10, fontWeight: 700, fontFamily: 'Syne' }}
                dy={15}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6fbd8a', fontSize: 10, fontWeight: 700, fontFamily: 'Syne' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#071910',
                  border: '1px solid rgba(0,166,81,0.2)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}
              />
              <Area
                type="monotone"
                dataKey="val"
                stroke="#00a8ff"
                strokeWidth={4}
                fillOpacity={1}
                fill="url(#kgGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

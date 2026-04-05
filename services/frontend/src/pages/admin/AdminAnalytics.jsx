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
          <div className="font-en font-extrabold text-2xl leading-none italic uppercase">System Analytics</div>
          <div className="text-[10px] text-kg-green-p/40 font-en tracking-[0.2em] uppercase mt-1">Infrastructure Monitoring</div>
        </div>
        <div className="px-3 py-1.5 bg-kg-green-l/10 border border-kg-green-l/20 rounded-full flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-kg-green-l animate-pulse"></span>
          <span className="text-[10px] font-bold text-kg-green-l uppercase tracking-widest font-en">System Healthy</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Real-time Load', val: '78%', trend: '+5%', color: 'text-kg-green-l' },
          { label: 'Total Orders', val: '1,245', trend: '+12%', color: 'text-kg-gold-l' },
          { label: 'AI Nodes', val: '3/3', trend: 'Stable', color: 'text-white' },
          { label: 'DB Latency', val: '14ms', trend: 'Optimal', color: 'text-kg-gold-l' }
        ].map((kpi, i) => (
          <div key={i} className="bg-kg-card border border-kg-green/15 rounded-3xl p-6 shadow-xl group hover:border-kg-green-l/30 transition-all">
            <div className="text-[10px] font-en tracking-widest uppercase text-kg-green-p/30 mb-3">{kpi.label}</div>
            <div className={`font-en text-4xl font-extrabold italic mb-4 ${kpi.color}`}>{kpi.val}</div>
            <div className="inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold bg-kg-green-l/10 text-kg-green-l border border-kg-green-l/20 uppercase">
              {kpi.trend}
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Card */}
      <div className="flex-1 bg-kg-card border border-kg-green/15 rounded-[32px] p-8 shadow-2xl overflow-hidden relative group mb-2">
        <div className="absolute top-0 right-0 p-10 text-[120px] opacity-[0.03] italic font-en font-black select-none pointer-events-none group-hover:scale-110 transition-transform">DATA</div>
        
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="font-en text-xl font-extrabold italic uppercase tracking-tight">Traffic Flow Analysis</h3>
            <p className="text-[10px] text-kg-green-p/30 font-en uppercase tracking-widest mt-1">Live AI Prediction Stream</p>
          </div>
          <div className="flex gap-4">
             <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-kg-green-l"></div> <span className="text-[10px] font-bold uppercase font-en opacity-40">Occupancy</span></div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="kgGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00a651" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00a651" stopOpacity={0}/>
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
                stroke="#00a651" 
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

import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Shield, Zap, Database, TrendingUp } from 'lucide-react';

export const AdminAnalytics = () => {
  const data = [
    { time: '11:00', occupancy: 20 },
    { time: '11:30', occupancy: 45 },
    { time: '12:00', occupancy: 85 },
    { time: '12:30', occupancy: 95 },
    { time: '13:00', occupancy: 60 },
    { time: '13:30', occupancy: 30 },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">Global Analytics</h1>
          <p className="text-gray-500 font-medium text-[10px] uppercase tracking-widest leading-none">Smart Canteen Infrastructure Monitoring</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <Zap size={14} fill="currentColor" /> System Healthy
           </div>
        </div>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="border-white/5 bg-[#1a1d2e] p-6 hover:border-blue-500/30 transition-all group">
          <div className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Real-time Occupancy</div>
          <div className="text-4xl font-black text-white tracking-tighter group-hover:scale-105 transition-transform origin-left">78%</div>
          <div className="mt-3 flex items-center gap-1.5 text-blue-500 text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded w-fit">
             Peak Hour active
          </div>
        </GlassCard>

        <GlassCard className="border-white/5 bg-[#1a1d2e] p-6 hover:border-purple-500/30 transition-all group">
          <div className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Total Orders today</div>
          <div className="text-4xl font-black text-purple-400 tracking-tighter group-hover:scale-105 transition-transform origin-left">1,245</div>
          <div className="mt-3 flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded w-fit text-shadow-glow">
             +12% vs Yesterday
          </div>
        </GlassCard>

        <GlassCard className="border-white/5 bg-[#1a1d2e] p-6 hover:border-orange-500/30 transition-all group">
          <div className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">Camera Status</div>
          <div className="text-4xl font-black text-white tracking-tighter group-hover:scale-105 transition-transform origin-left">3/3</div>
          <div className="mt-3 flex items-center gap-1.5 text-emerald-500 text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded w-fit">
             Online & Tracking
          </div>
        </GlassCard>

        <GlassCard className="border-white/5 bg-[#1a1d2e] p-6 hover:border-blue-400/30 transition-all group overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
             <Database size={80} />
          </div>
          <div className="text-gray-500 text-[9px] font-black uppercase tracking-[0.2em] mb-2">DB Latency</div>
          <div className="text-4xl font-black text-blue-400 tracking-tighter group-hover:scale-105 transition-transform origin-left">14ms</div>
          <div className="mt-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 px-2 py-1 rounded w-fit">
             Optimal Performance
          </div>
        </GlassCard>
      </div>

      {/* Main Stats Chart */}
      <GlassCard className="h-[500px] flex flex-col p-8 bg-[#1a1d2e] border-white/5 shadow-2xl relative shadow-black/80 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-blue-600/[0.03] to-transparent pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-10 relative z-10">
           <h3 className="text-xl font-black text-white tracking-tight uppercase italic flex items-center gap-4">
              <TrendingUp size={24} className="text-blue-500" /> Canteen Traffic Flow
           </h3>
           <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                 <div className="w-2.5 h-2.5 rounded-full border border-blue-500/50 bg-blue-500/20 animate-pulse shadow-glow-blue"></div> Live Occupancy
              </div>
           </div>
        </div>

        <div className="flex-1 w-full relative h-[350px] pr-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d3148" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#4b5563" 
                    tick={{fontSize: 11, fontWeight: 900}} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={15} 
                    className="uppercase tracking-widest"
                  />
                  <YAxis 
                    stroke="#4b5563" 
                    tick={{fontSize: 11, fontWeight: 900}} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#1a1d2e', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)', padding: '16px' }} 
                    itemStyle={{ color: '#fff', fontWeight: '900', letterSpacing: '-0.025em', textTransform: 'uppercase' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="occupancy" 
                    stroke="#3b82f6" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorOcc)" 
                    animationDuration={2000}
                  />
              </AreaChart>
            </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};

import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar } from 'lucide-react';

export const StallAnalytics = () => {
  const data = [
    { day: 'Mon', sales: 4200 },
    { day: 'Tue', sales: 3100 },
    { day: 'Wed', sales: 5800 },
    { day: 'Thu', sales: 4900 },
    { day: 'Fri', sales: 6500 },
    { day: 'Sat', sales: 2200 },
    { day: 'Sun', sales: 1800 },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-10">
      <header className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2 uppercase">Sales Report</h1>
          <p className="text-gray-500 font-medium text-xs uppercase tracking-widest leading-none">Weekly Performance Monitoring</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
           <Calendar size={14} className="text-blue-500" />
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Apr 2026</span>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard className="bg-gradient-to-br from-blue-600 to-indigo-800 border-none text-white p-8 group overflow-hidden relative shadow-blue-500/20">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-700">
             <DollarSign size={100} />
          </div>
          <div className="relative z-10">
            <h3 className="text-white/60 font-black uppercase tracking-widest text-[10px] mb-2">Total Monthly Revenue</h3>
            <div className="text-5xl font-black tracking-tighter">฿162k</div>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-md w-fit">
               <TrendingUp size={12} /> +14.2% Growth
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 flex flex-col justify-center border-white/5 bg-[#1a1d2e] shadow-2xl">
          <h3 className="text-gray-500 font-black uppercase tracking-widest text-[10px] mb-2">Top Selling Menu</h3>
          <div className="text-3xl font-black text-white tracking-tight mb-2 uppercase italic">ข้าวมันไก่ผสม</div>
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
             <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest">1,240 Sold this month</span>
          </div>
        </GlassCard>

        <GlassCard className="p-8 flex flex-col justify-center border-white/5 bg-[#1a1d2e] shadow-2xl">
          <h3 className="text-gray-500 font-black uppercase tracking-widest text-[10px] mb-2">Avg. Order Value</h3>
          <div className="text-4xl font-black text-white tracking-tighter mb-2">฿52.50</div>
          <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Across 3,100 orders</div>
        </GlassCard>
      </div>

      {/* Sales Chart */}
      <GlassCard className="h-[450px] p-8 border-white/5 bg-[#1a1d2e] shadow-2xl relative">
        <div className="flex justify-between items-center mb-10">
           <h3 className="text-lg font-black text-white tracking-tight uppercase">ยอดขายรายวัน (Weekly Activity)</h3>
           <div className="flex gap-2">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div> Revenue
              </div>
           </div>
        </div>

        <div className="flex-1 w-full relative h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2d3148" />
              <XAxis 
                 dataKey="day" 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{fill: '#4b5563', fontSize: 11, fontWeight: 900}} 
                 dy={15} 
              />
              <YAxis 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{fill: '#4b5563', fontSize: 11, fontWeight: 900}} 
              />
              <Tooltip 
                cursor={{fill: '#ffffff', opacity: 0.05}} 
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  backgroundColor: '#1a1d2e',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
                  padding: '16px' 
                }} 
                itemStyle={{ color: '#fff', fontWeight: '900', fontSize: '14px', letterSpacing: '-0.025em' }}
              />
              <Bar dataKey="sales" radius={[8, 8, 0, 0]} barSize={45}>
                 {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 4 ? '#3b82f6' : '#2d3148'} />
                 ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};

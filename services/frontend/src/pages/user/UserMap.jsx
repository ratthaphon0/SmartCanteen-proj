import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, RotateCw, Filter, Layers, Info } from 'lucide-react';

const STATUS_COLORS = {
  occupied: '#ef4444',
  reserved: '#FFD700',
  vacant: '#00A651',
};

const DEMO_SEATS = [
  { seat_id: 'T01-S1', table_id: 'T01', status: 'occupied' },
  { seat_id: 'T01-S2', table_id: 'T01', status: 'vacant' },
  { seat_id: 'T01-S3', table_id: 'T01', status: 'reserved' },
  { seat_id: 'T02-S1', table_id: 'T02', status: 'vacant' },
  { seat_id: 'T02-S2', table_id: 'T02', status: 'vacant' },
];

export const UserMap = () => {
  const [activeTable, setActiveTable] = useState(null);

  const tables = {};
  DEMO_SEATS.forEach(seat => {
    if (!tables[seat.table_id]) tables[seat.table_id] = [];
    tables[seat.table_id].push(seat);
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5 h-full"
    >
      <header className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2 uppercase italic">AI Location</h1>
          <p className="text-[#FFD700]/60 font-medium text-[10px] uppercase tracking-widest leading-none">Find your perfect seat</p>
        </div>
        <button className="p-3 bg-[#0a2a1b] rounded-xl border border-[#006633]/30 text-[#FFD700] hover:scale-110 transition-transform">
          <RotateCw size={18} />
        </button>
      </header>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <GlassCard className="p-3 text-center border-[#00A651]/20 bg-[#00A651]/5">
           <div className="text-xl font-black text-[#00A651]">45</div>
           <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Free</div>
        </GlassCard>
        <GlassCard className="p-3 text-center border-[#ef4444]/20 bg-[#ef4444]/5">
           <div className="text-xl font-black text-[#ef4444]">12</div>
           <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Full</div>
        </GlassCard>
        <GlassCard className="p-3 text-center border-[#FFD700]/20 bg-[#FFD700]/5">
           <div className="text-xl font-black text-[#FFD700]">8</div>
           <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Reserved</div>
        </GlassCard>
      </div>

      <GlassCard className="flex-1 p-6 relative overflow-hidden bg-grid-white/[0.02] border-[#006633]/20 bg-[#0a2a1b]/20 rounded-3xl min-h-[400px]">
        <div className="grid grid-cols-1 gap-6">
          {Object.entries(tables).map(([tableId, tableSeats]) => (
            <motion.div 
              key={tableId}
              onClick={() => setActiveTable(activeTable === tableId ? null : tableId)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTable === tableId ? 'bg-[#006633]/20 border-[#FFD700]/40' : 'bg-black/20 border-white/5'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-black text-white uppercase italic tracking-tighter">{tableId}</span>
                <Badge className="bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/20 px-2 text-[9px]">
                  {tableSeats.filter(s => s.status === 'vacant').length} Free
                </Badge>
              </div>
              <div className="flex gap-2 justify-center">
                {tableSeats.map(seat => (
                  <div 
                    key={seat.seat_id}
                    className="w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden"
                    style={{ background: `${STATUS_COLORS[seat.status]}10` }}
                  >
                    <div 
                      className={`w-2 h-2 rounded-full ${seat.status === 'vacant' ? 'animate-pulse' : ''}`}
                      style={{ background: STATUS_COLORS[seat.status] }}
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend Overlay */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
           <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-[#00A651]" />
                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Free</span>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
                 <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Full</span>
              </div>
           </div>
           <Info size={14} className="text-[#FFD700]" />
        </div>
      </GlassCard>

      <Button className="w-full py-4 bg-[#FFD700] text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:scale-[0.98] transition-all shadow-xl shadow-[#FFD700]/10">
        Scan QR to Reserve
      </Button>
    </motion.div>
  );
};

const Button = ({ children, className, ...props }) => (
  <button className={`flex items-center justify-center gap-2 ${className}`} {...props}>
    {children}
  </button>
);

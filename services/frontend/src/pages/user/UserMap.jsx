import React, { useState, useMemo, lazy, Suspense } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, RotateCw, Filter, Layers, Info, Box, Square } from 'lucide-react';

// Lazy-load 3D map so Three.js errors don't crash the page
const Canteen3DMap = lazy(() => 
  import('../../components/Canteen3DMap').catch(() => ({
    default: () => <div className="w-full h-full flex items-center justify-center text-white/40 text-sm">3D not available</div>
  }))
);

const STATUS_COLORS = {
  occupied: '#ef4444',
  reserved: '#FFD700',
  vacant: '#00A651',
};

const DEMO_SEATS = [
  { seat_id: 'T01-S1', table_id: 'T01', status: 'occupied' },
  { seat_id: 'T01-S2', table_id: 'T01', status: 'vacant' },
  { seat_id: 'T01-S3', table_id: 'T01', status: 'reserved' },
  { seat_id: 'T01-S4', table_id: 'T01', status: 'vacant' },
  { seat_id: 'T02-S1', table_id: 'T02', status: 'vacant' },
  { seat_id: 'T02-S2', table_id: 'T02', status: 'vacant' },
  { seat_id: 'T02-S3', table_id: 'T02', status: 'occupied' },
  { seat_id: 'T03-S1', table_id: 'T03', status: 'vacant' },
  { seat_id: 'T03-S2', table_id: 'T03', status: 'vacant' },
];

export const UserMap = () => {
  const [activeTable, setActiveTable] = useState(null);
  const [viewMode, setViewMode] = useState('3d'); // '2d' or '3d'

  const tables = useMemo(() => {
    const t = {};
    DEMO_SEATS.forEach(seat => {
      if (!t[seat.table_id]) t[seat.table_id] = [];
      t[seat.table_id].push(seat);
    });
    return t;
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-5 h-full p-4 sm:p-6"
    >
      <header className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none mb-2 uppercase italic bg-clip-text text-transparent bg-gradient-to-r from-kg-green-l to-white">
            AI Location
          </h1>
          <p className="text-[#FFD700]/60 font-en font-black text-[10px] uppercase tracking-[0.2em] leading-none">Find your perfect seat · Real-time Sensors</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
                className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-white hover:bg-white/10 transition-all flex items-center gap-2"
            >
                {viewMode === '2d' ? <Box size={18} className="text-kg-green-l" /> : <Square size={18} className="text-kg-green-l" />}
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{viewMode === '2d' ? '3D View' : '2D View'}</span>
            </button>
            <button className="p-3 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 text-kg-green-l hover:rotate-180 transition-all duration-500">
                <RotateCw size={18} />
            </button>
        </div>
      </header>

      {/* Quick Stats Overlay */}
      <div className="grid grid-cols-3 gap-3 relative z-10">
        {[
            { label: 'Free', val: 45, color: 'text-[#00A651]', bg: 'bg-[#00A651]/10', border: 'border-[#00A651]/20' },
            { label: 'Full', val: 12, color: 'text-[#ef4444]', bg: 'bg-[#ef4444]/10', border: 'border-[#ef4444]/20' },
            { label: 'Wait', val: 8, color: 'text-[#FFD700]', bg: 'bg-[#FFD700]/10', border: 'border-[#FFD700]/20' }
        ].map((stat, i) => (
            <GlassCard key={i} className={`p-4 text-center ${stat.border} ${stat.bg} rounded-[24px] shadow-2xl`}>
                <div className={`text-2xl font-black ${stat.color} font-en italic tracking-tighter`}>{stat.val}</div>
                <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">{stat.label}</div>
            </GlassCard>
        ))}
      </div>

      <div className="flex-1 relative min-h-[400px] rounded-[40px] overflow-hidden border border-white/5 shadow-3xl bg-kg-card/30 backdrop-blur-sm">
        <AnimatePresence mode="wait">
            {viewMode === '3d' ? (
                <motion.div 
                    key="3d"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="absolute inset-0"
                >
                    <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white/30 text-xs uppercase tracking-widest">Loading 3D...</div>}>
                      <Canteen3DMap tables={tables} />
                    </Suspense>
                </motion.div>
            ) : (
                <motion.div 
                    key="2d"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-0 p-8 overflow-y-auto"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(tables).map(([tableId, tableSeats]) => (
                        <div 
                        key={tableId}
                        onClick={() => setActiveTable(activeTable === tableId ? null : tableId)}
                        className={`p-6 rounded-[32px] border transition-all cursor-pointer group ${
                            activeTable === tableId ? 'bg-kg-green/20 border-kg-green-l/40' : 'bg-black/40 border-white/5 hover:border-white/20'
                        }`}
                        >
                        <div className="flex justify-between items-center mb-6">
                            <span className="font-black text-white text-xl uppercase italic tracking-tighter group-hover:text-kg-green-l transition-colors">{tableId}</span>
                            <Badge className="bg-kg-green/10 text-kg-green-l border-kg-green/20 px-3 py-1 text-[10px] rounded-full">
                            {tableSeats.filter(s => s.status === 'vacant').length} Free
                            </Badge>
                        </div>
                        <div className="flex gap-3 justify-center">
                            {tableSeats.map(seat => (
                            <div 
                                key={seat.seat_id}
                                className="w-12 h-12 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden transition-transform hover:scale-110"
                                style={{ background: `${STATUS_COLORS[seat.status]}10` }}
                            >
                                <div 
                                className={`w-2.5 h-2.5 rounded-full ${seat.status === 'vacant' ? 'animate-pulse shadow-[0_0_10px_#00A651]' : ''}`}
                                style={{ background: STATUS_COLORS[seat.status] }}
                                />
                            </div>
                            ))}
                        </div>
                        </div>
                    ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Legend Overlay */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center bg-black/80 backdrop-blur-2xl p-4 rounded-[28px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20">
           <div className="flex gap-6">
              {[
                  { label: 'Free', color: 'bg-[#00A651]' },
                  { label: 'Full', color: 'bg-[#ef4444]' },
                  { label: 'Reserved', color: 'bg-[#FFD700]' }
              ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                     <div className={`w-2.5 h-2.5 rounded-full ${item.color} ${item.label === 'Free' ? 'animate-pulse shadow-[0_0_8px_#00A651]' : ''}`} />
                     <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{item.label}</span>
                  </div>
              ))}
           </div>
           <div className="flex items-center gap-4">
                <span className="text-[10px] text-white/20 italic font-en">Smart Sensors: v2.4</span>
                <Info size={16} className="text-kg-green-l opacity-50" />
           </div>
        </div>
      </div>

      <motion.button 
        whileTap={{ scale: 0.98 }}
        className="w-full py-5 bg-gradient-to-r from-kg-green to-kg-green-l text-white font-black uppercase tracking-[0.25em] text-xs rounded-[24px] shadow-2xl shadow-kg-green/20 border border-white/10"
      >
        Scan QR to Reserve
      </motion.button>
    </motion.div>
  );
};


const Button = ({ children, className, ...props }) => (
  <button className={`flex items-center justify-center gap-2 ${className}`} {...props}>
    {children}
  </button>
);

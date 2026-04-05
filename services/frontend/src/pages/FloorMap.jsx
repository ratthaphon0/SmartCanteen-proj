import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloorMap = ({ floorSeats = [], setFloorSeats }) => {
  const [selectedSeat, setSelectedSeat] = useState(null);

  const tablesMap = floorSeats.reduce((acc, seat) => {
    if (!acc[seat.table_id]) acc[seat.table_id] = [];
    acc[seat.table_id].push(seat);
    return acc;
  }, {});

  const tableIds = Object.keys(tablesMap).sort();

  const stats = {
    vacant: floorSeats.filter(s => s.status === 'vacant').length,
    occupied: floorSeats.filter(s => s.status === 'occupied').length,
    reserved: floorSeats.filter(s => s.status === 'reserved').length,
  };

  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);
  };

  const reserveSeat = (id) => {
    setFloorSeats(prev => prev.map(s => 
      s.id === id ? { ...s, status: 'reserved', lastUpdate: 'Just now' } : s
    ));
    setSelectedSeat(null);
  };

  return (
    <div className="flex flex-col h-full bg-kg-dark text-kg-green-p font-th overflow-hidden">
      {/* Premium Header - Inspired by Admin Dashboard */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-kg-gold font-black uppercase tracking-[0.2em] text-[10px] font-en">
             <span className="w-2 h-2 rounded-full bg-kg-gold animate-pulse" /> AI Infrastructure Monitoring
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none font-en uppercase italic">
            Floor <span className="text-kg-green-l">Map</span>
          </h1>
        </div>

        <div className="flex items-center gap-6 bg-kg-card/40 p-4 rounded-2xl border border-kg-green/10 shadow-2xl">
           {[
             { label: 'Available', val: stats.vacant, color: 'text-kg-green-l' },
             { label: 'Busy', val: stats.occupied, color: 'text-red-400' },
             { label: 'Waitlist', val: stats.reserved, color: 'text-kg-gold' }
           ].map((s, i) => (
             <div key={i} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-kg-green-p/30 uppercase tracking-widest leading-none">{s.label}</span>
                <span className={`text-xl font-en font-black italic ${s.color}`}>{s.val}</span>
             </div>
           ))}
        </div>
      </header>

      {/* Grid Container - Long Scrollable List of Tables */}
      <div className="flex-1 overflow-y-auto px-2 pb-20 custom-scrollbar">
        <div className="flex flex-col gap-12">
          {tableIds.map(tid => {
            const seats = tablesMap[tid].slice().sort((a,b) => a.id.localeCompare(b.id));
            const topSeats = seats.slice(0, 15);
            const bottomSeats = seats.slice(15);
            
            return (
              <motion.div 
                key={tid} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-4 group"
              >
                {/* Table Header Line */}
                <div className="flex items-center gap-4 px-1">
                   <div className="w-16 h-px bg-gradient-to-r from-kg-green/40 to-transparent" />
                   <span className="font-en font-black text-xs text-kg-green-p/20 italic uppercase tracking-widest">{tid} — UNIT SEATING</span>
                   <div className="flex-1 h-px bg-gradient-to-l from-kg-green/10 to-transparent opacity-30" />
                </div>

                <div className="relative">
                   {/* Top Seats */}
                   <div className="flex justify-between md:justify-around px-8 mb-3">
                      {topSeats.map(seat => (
                        <SeatIcon key={seat.id} seat={seat} onClick={() => handleSeatClick(seat)} />
                      ))}
                   </div>

                   {/* Main Table Surface - Glassmorphic High-Tech Look */}
                   <div className="w-full h-20 bg-kg-card/80 border border-kg-green/15 rounded-[24px] flex items-center justify-center shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] backdrop-blur-md relative overflow-hidden transition-all group-hover:border-kg-green/40 group-hover:bg-kg-card/90">
                      {/* Technical Grid Overlay */}
                      <div className="absolute inset-0 opacity-[0.03] pattern-grid-kg pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-10 pointer-events-none" />
                      
                      <div className="flex flex-col items-center">
                        <div className="font-en font-black text-2xl text-white italic tracking-tighter opacity-10 group-hover:opacity-20 transition-opacity select-none tracking-[0.2em]">{tid}</div>
                        <div className="text-[8px] font-en font-bold text-kg-green-l uppercase tracking-[0.5em] mt-1 opacity-20 group-hover:opacity-40">Active Monitoring System</div>
                      </div>
                   </div>

                   {/* Bottom Seats */}
                   <div className="flex justify-between md:justify-around px-8 mt-3">
                      {bottomSeats.map(seat => (
                        <SeatIcon key={seat.id} seat={seat} onClick={() => handleSeatClick(seat)} />
                      ))}
                   </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Premium Detail Modal */}
      <AnimatePresence>
        {selectedSeat && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSeat(null)}
              className="fixed inset-0 bg-kg-dark/90 backdrop-blur-xl z-[60]"
            />
            <motion.div 
              initial={{ y: '100%', scale: 1 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: '100%', scale: 0.95 }}
              className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-kg-surface border-t border-kg-green/20 rounded-t-[48px] p-12 z-[70] shadow-[0_-40px_80px_rgba(0,0,0,0.8)] border-x border-kg-green/5"
            >
              <div className="w-16 h-1 bg-kg-green-l/10 rounded-full mx-auto mb-10" />
              
              <div className="flex justify-between items-start mb-12">
                <div className="space-y-1">
                  <div className="text-[10px] text-kg-green-p/30 font-en tracking-[0.3em] uppercase italic">Seat Identifier</div>
                  <h3 className="font-en text-6xl font-black italic text-white tracking-tighter leading-none">#{selectedSeat.id}</h3>
                  <p className="text-xs text-kg-green-p/40 font-en font-bold uppercase tracking-widest mt-2">{selectedSeat.table_id} Corridor Support Unit</p>
                </div>
                <div className={`px-6 py-3 rounded-2xl font-en font-black text-[10px] uppercase tracking-widest border transition-all ${
                  selectedSeat.status === 'vacant' 
                  ? 'bg-kg-green-l/10 border-kg-green-l/40 text-kg-green-l shadow-[0_0_20px_rgba(0,166,81,0.2)]' 
                  : 'bg-red-500/10 border-red-500/40 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                }`}>
                  {selectedSeat.status === 'vacant' ? 'Available' : 'Occupied'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-12">
                 <div className="bg-kg-card/40 border border-kg-green/10 rounded-3xl p-6 transition-all hover:border-kg-green-l/20">
                    <span className="text-[9px] uppercase font-en font-black text-kg-green-p/30 tracking-[0.2em] mb-2 block">CV Confidence</span>
                    <span className="text-xl font-en font-black text-kg-green-l italic leading-none">99.85%</span>
                 </div>
                 <div className="bg-kg-card/40 border border-kg-green/10 rounded-3xl p-6 transition-all hover:border-kg-green-l/20">
                    <span className="text-[9px] uppercase font-en font-black text-kg-green-p/30 tracking-[0.2em] mb-2 block">Detection Age</span>
                    <span className="text-xl font-en font-black text-kg-green-p/50 italic leading-none">{selectedSeat.lastUpdate}</span>
                 </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setSelectedSeat(null)} 
                  className="flex-1 py-5 border border-kg-green/10 rounded-[24px] font-en font-black text-kg-green-p/20 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]"
                >
                  Dismiss Panel
                </button>
                {selectedSeat.status === 'vacant' && (
                  <button 
                    onClick={() => reserveSeat(selectedSeat.id)}
                    className="flex-[2] py-5 bg-kg-green text-white font-en font-black rounded-[24px] shadow-[0_20px_50px_rgba(0,102,51,0.4)] hover:bg-kg-green-l transition-all uppercase tracking-widest text-[10px]"
                  >
                    Resrve Seating Unit 🎒
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .pattern-grid-kg {
          background-image: linear-gradient(rgba(0, 166, 81, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 166, 81, 0.2) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}} />
    </div>
  );
};

const SeatIcon = ({ seat, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.5, zIndex: 10, y: seat.id.includes('S16') || seat.id.includes('S17') ? 3 : -3 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`w-4 h-4 md:w-5 md:h-5 rounded-[6px] border transition-all shadow-lg ${
      seat.status === 'occupied' ? 'bg-red-500/40 border-red-500/30' :
      seat.status === 'reserved' ? 'bg-kg-gold border-kg-gold' :
      'bg-kg-green-l border-kg-green-l shadow-[0_0_15px_rgba(0,166,81,0.3)]'
    }`}
  />
);

export default FloorMap;

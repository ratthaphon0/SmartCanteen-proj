import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const FloorMap = ({ floorSeats = [], setFloorSeats }) => {
  const [selectedSeat, setSelectedSeat] = useState(null);

  const streamUrl =
    import.meta.env.VITE_CV_STREAM_URL ||
    `${window.location.protocol}//${window.location.host}/video_feed`;
  const apiBase =
    import.meta.env.VITE_API_URL ||
    `${window.location.protocol}//${window.location.host}`;

  const generateInitialMockup = () => {
    const wings = ['LW', 'RW'];
    const rows = [1, 2, 3, 4, 5, 6, 7];
    const cols = [1, 2, 3, 4];
    const mockup = [];

    wings.forEach(wing => {
      rows.forEach(row => {
        cols.forEach(col => {
          if ((wing === 'LW' && col > 2) || (wing === 'RW' && col <= 2)) return;
          const tableId = `${wing}-R${row}-C${col}`;
          
          for (let s = 1; s <= 6; s++) {
            const seatId = `${tableId}-S${s}`;
            let status = 'vacant';
            
            // Create a realistic initial state: mix of busy tables and empty tables
            const rand = Math.random();
            // Higher chance to be occupied if it's near the front (R1, R2)
            const busyThreshold = 0.3 + (row * 0.05); 
            if (rand > 0.90) status = 'reserved';
            else if (rand > busyThreshold) status = 'occupied';

            mockup.push({ id: seatId, seat_id: seatId, table_id: tableId, status, lastUpdate: 'Live' });
          }
        });
      });
    });
    return mockup;
  };

  const [liveSeats, setLiveSeats] = useState(generateInitialMockup());

  useEffect(() => {
    // 🎭 PITCH DECK SHOWCASE MODE 🎭
    // Simulates a live, breathing canteen by randomly flipping seat statuses over time
    const timer = setInterval(() => {
      setLiveSeats(prev => {
        const next = [...prev];
        // Flip 1 to 4 random seats every tick
        const numFlips = Math.floor(Math.random() * 4) + 1;
        
        for(let i=0; i<numFlips; i++) {
            const idx = Math.floor(Math.random() * next.length);
            const currentStatus = next[idx].status;
            
            if (currentStatus === 'occupied') {
               // 70% chance to become vacant, 30% stay occupied
               next[idx] = { ...next[idx], status: Math.random() > 0.3 ? 'vacant' : 'occupied' };
            } else if (currentStatus === 'vacant') {
               // 80% chance to become occupied, 20% reserved
               next[idx] = { ...next[idx], status: Math.random() > 0.2 ? 'occupied' : 'reserved' };
            } else {
               // Reserved -> usually becomes occupied as people arrive
               next[idx] = { ...next[idx], status: 'occupied' };
            }
        }
        return next;
      });
    }, 2000); // Fast updates for the pitch deck

    return () => clearInterval(timer);
  }, []);

  const effectiveSeats = useMemo(() => {
    const source = liveSeats.length > 0 ? liveSeats : floorSeats;
    return source.map((s) => ({
      id: s.id || s.seat_id,
      table_id: s.table_id,
      status: s.status,
      lastUpdate: s.lastUpdate || 'Live',
    }));
  }, [floorSeats, liveSeats]);

  // Group seats by table_id
  const tablesMap = effectiveSeats.reduce((acc, seat) => {
    if (!acc[seat.table_id]) acc[seat.table_id] = [];
    acc[seat.table_id].push(seat);
    return acc;
  }, {});

  const tableIds = Object.keys(tablesMap).sort();

  // Extract unique row numbers (e.g., "R1", "R2", ...) and sort them
  const rowNumbers = [...new Set(tableIds.map(id => {
    const match = id.match(/R(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }))].sort((a, b) => a - b);

  const stats = {
    vacant: effectiveSeats.filter(s => s.status === 'vacant').length,
    occupied: effectiveSeats.filter(s => s.status === 'occupied').length,
    reserved: effectiveSeats.filter(s => s.status === 'reserved').length,
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

  // Helper: get tables for a specific row + column pattern
  const getTable = (row, col) => {
    // Format: LW-R{row}-C{col} or RW-R{row}-C{col}
    const wing = col <= 2 ? 'LW' : 'RW';
    const tid = `${wing}-R${row}-C${col}`;
    return tablesMap[tid] ? { tid, seats: tablesMap[tid] } : null;
  };

  return (
    <div className="flex flex-col h-full bg-kg-dark text-kg-green-p font-th overflow-hidden">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 px-4 shrink-0">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-kg-gold font-black uppercase tracking-[0.2em] text-[10px] font-en">
             <span className="w-2 h-2 rounded-full bg-kg-gold animate-pulse" /> AI Infrastructure Monitoring
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter leading-none font-en uppercase italic">
            Floor <span className="text-kg-green-l">Map</span>
          </h1>
        </div>

        <div className="flex items-center gap-6 bg-kg-card/40 p-3 rounded-2xl border border-kg-green/10 shadow-2xl">
           {[
             { label: 'Available', val: stats.vacant, color: 'text-kg-green-l' },
             { label: 'Busy', val: stats.occupied, color: 'text-red-400' },
             { label: 'Reserved', val: stats.reserved, color: 'text-kg-gold' }
           ].map((s, i) => (
             <div key={i} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-kg-green-p/30 uppercase tracking-widest leading-none">{s.label}</span>
                <span className={`text-xl font-en font-black italic ${s.color}`}>{s.val}</span>
             </div>
           ))}
        </div>
      </header>

      {/* ═══ Canteen Floor Plan ═══ */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
        <div className="max-w-5xl mx-auto">

          {/* Legend */}
          <div className="flex items-center gap-6 mb-4 px-2 text-[10px] font-en font-bold uppercase tracking-widest text-kg-green-p/40">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-kg-green-l shadow-[0_0_6px_rgba(0,166,81,0.4)]" /> Available</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/60" /> Busy</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-kg-gold" /> Reserved</div>
          </div>

          {/* ─── Rows of Long Tables ─── */}
          {rowNumbers.map((rowNum, rowIdx) => {
            // Each row has: [Left Col1] [Left Col2] [AISLE] [Right Col3] [Right Col4]
            const leftCol1 = getTable(rowNum, 1);
            const leftCol2 = getTable(rowNum, 2);
            const rightCol3 = getTable(rowNum, 3);
            const rightCol4 = getTable(rowNum, 4);

            // Perspective: rows further back get slightly smaller
            const scale = Math.max(0.75, 1 - rowIdx * 0.015);

            return (
              <motion.div
                key={rowNum}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIdx * 0.03 }}
                className="mb-3"
                style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
              >
                {/* Row label */}
                <div className="text-center mb-1">
                  <span className="text-[9px] font-en font-black text-kg-green-p/20 uppercase tracking-[0.3em]">Row {rowNum}</span>
                </div>

                {/* Table Row Layout: 2 long tables on each side of the aisle */}
                <div className="flex items-stretch gap-1">
                  
                  {/* ── Left Wing ── */}
                  <div className="flex-1 flex gap-1">
                    {/* Left Column 1 */}
                    {leftCol1 ? (
                      <LongTable data={leftCol1} handleSeatClick={handleSeatClick} />
                    ) : <div className="flex-1" />}
                    
                    {/* Left Column 2 */}
                    {leftCol2 ? (
                      <LongTable data={leftCol2} handleSeatClick={handleSeatClick} />
                    ) : <div className="flex-1" />}
                  </div>

                  {/* ── Center Aisle ── */}
                  <div className="w-6 md:w-10 shrink-0 flex items-center justify-center relative">
                    <div className="w-full h-full bg-gradient-to-b from-transparent via-kg-green/5 to-transparent rounded-sm" />
                    {rowIdx === 0 && (
                      <div className="absolute text-[8px] font-en font-black text-kg-green-p/15 uppercase tracking-[0.15em] rotate-90 whitespace-nowrap">Aisle</div>
                    )}
                  </div>

                  {/* ── Right Wing ── */}
                  <div className="flex-1 flex gap-1">
                    {/* Right Column 3 */}
                    {rightCol3 ? (
                      <LongTable data={rightCol3} handleSeatClick={handleSeatClick} />
                    ) : <div className="flex-1" />}
                    
                    {/* Right Column 4 */}
                    {rightCol4 ? (
                      <LongTable data={rightCol4} handleSeatClick={handleSeatClick} />
                    ) : <div className="flex-1" />}
                  </div>

                </div>
              </motion.div>
            );
          })}

        </div>
      </div>

      {/* Removed Live Telemetry Feed for Pitch Deck Showcase */}

      {/* ═══ Seat Detail Modal ═══ */}
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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="fixed bottom-0 left-0 right-0 max-w-xl mx-auto bg-kg-surface border-t border-kg-green/20 rounded-t-[32px] p-8 z-[70] shadow-[0_-40px_80px_rgba(0,0,0,0.8)] border-x border-kg-green/5"
            >
              <div className="w-12 h-1 bg-kg-green-l/10 rounded-full mx-auto mb-6" />
              
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <div className="text-[10px] text-kg-green-p/30 font-en tracking-[0.3em] uppercase italic">Seat</div>
                  <h3 className="font-en text-4xl font-black italic text-white tracking-tighter leading-none">{selectedSeat.id}</h3>
                  <p className="text-xs text-kg-green-p/40 font-en font-bold uppercase tracking-widest mt-1">{selectedSeat.table_id}</p>
                </div>
                <div className={`px-4 py-2 rounded-xl font-en font-black text-[10px] uppercase tracking-widest border transition-all ${
                  selectedSeat.status === 'vacant' 
                  ? 'bg-kg-green-l/10 border-kg-green-l/40 text-kg-green-l' 
                  : selectedSeat.status === 'reserved'
                  ? 'bg-kg-gold/10 border-kg-gold/40 text-kg-gold'
                  : 'bg-red-500/10 border-red-500/40 text-red-400'
                }`}>
                  {selectedSeat.status === 'vacant' ? 'Available' : selectedSeat.status === 'reserved' ? 'Reserved' : 'Occupied'}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedSeat(null)} 
                  className="flex-1 py-4 border border-kg-green/10 rounded-2xl font-en font-black text-kg-green-p/20 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest text-[10px]"
                >
                  Close
                </button>
                {selectedSeat.status === 'vacant' && (
                  <button 
                    onClick={() => reserveSeat(selectedSeat.id)}
                    className="flex-[2] py-4 bg-kg-green text-white font-en font-black rounded-2xl shadow-[0_20px_50px_rgba(0,102,51,0.4)] hover:bg-kg-green-l transition-all uppercase tracking-widest text-[10px]"
                  >
                    Reserve Seat 🎒
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Debug grid removed */}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
 *  LongTable — Represents one long bench-style table
 *  Seats are shown as dots along the top & bottom edges
 * ═══════════════════════════════════════════════════ */
const LongTable = ({ data, handleSeatClick }) => {
  const { tid, seats } = data;
  const sorted = seats.slice().sort((a, b) => a.id.localeCompare(b.id));
  
  // Split seats: top row and bottom row
  const topSeats = sorted.slice(0, Math.ceil(sorted.length / 2));
  const bottomSeats = sorted.slice(Math.ceil(sorted.length / 2));

  const occupiedCount = seats.filter(s => s.status !== 'vacant').length;
  const isBusy = occupiedCount > 0;

  // Short label: R1-C1 etc
  const label = tid.replace('LW-', '').replace('RW-', '');

  return (
    <div className="flex-1 group">
      {/* Top seat indicators */}
      <div className="flex justify-evenly px-1 mb-0.5">
        {topSeats.map(seat => (
          <SeatDot key={seat.id} seat={seat} onClick={() => handleSeatClick(seat)} />
        ))}
      </div>

      {/* Table surface - long horizontal bar */}
      <div className={`w-full h-7 md:h-9 rounded-[4px] flex items-center justify-center border transition-all cursor-default ${
        isBusy 
          ? 'bg-red-500/8 border-red-500/25 group-hover:border-red-500/50' 
          : 'bg-kg-card/60 border-kg-green/8 group-hover:border-kg-green/30'
      }`}>
        <span className={`font-en font-black text-[8px] md:text-[10px] italic select-none transition-all ${
          isBusy ? 'text-red-500/40' : 'text-kg-green-p/20 group-hover:text-kg-green-l/40'
        }`}>{label}</span>
      </div>

      {/* Bottom seat indicators */}
      <div className="flex justify-evenly px-1 mt-0.5">
        {bottomSeats.map(seat => (
          <SeatDot key={seat.id} seat={seat} onClick={() => handleSeatClick(seat)} />
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
 *  SeatDot — Single seat indicator
 * ═══════════════════════════════════════════════════ */
const SeatDot = ({ seat, onClick }) => (
  <motion.button
    whileHover={{ scale: 1.8, zIndex: 10 }}
    whileTap={{ scale: 0.85 }}
    onClick={onClick}
    title={seat.id}
    className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-[3px] border transition-all ${
      seat.status === 'occupied' ? 'bg-red-500/50 border-red-500/40 shadow-[0_0_6px_rgba(239,68,68,0.3)]' :
      seat.status === 'reserved' ? 'bg-kg-gold/60 border-kg-gold/50 shadow-[0_0_6px_rgba(201,176,55,0.3)]' :
      'bg-kg-green-l/70 border-kg-green-l/50 shadow-[0_0_6px_rgba(0,166,81,0.25)]'
    }`}
  />
);

export default FloorMap;

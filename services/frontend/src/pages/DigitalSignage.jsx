import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FloorMap } from './FloorMap';

// ─── Mock Data for TV Display ───
const LIVE_SHOPS = [
  { id: 'S1', name: 'อาหารตามสั่ง', queue: 2, wait: '6 min', status: 'normal' },
  { id: 'S2', name: 'ก๋วยเตี๋ยวเรือ', queue: 8, wait: '15 min', status: 'busy' },
  { id: 'S3', name: 'ข้าวราดแกง', queue: 0, wait: '0 min', status: 'fast' },
  { id: 'S4', name: 'น้ำปั่น / คาเฟ่', queue: 3, wait: '5 min', status: 'normal' },
];

export const DigitalSignage = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-kg-dark text-white font-th flex flex-col cursor-none">
      {/* ── Header ── */}
      <div className="h-24 bg-gradient-to-r from-kg-green-d via-[#003D6A] to-kg-dark border-b border-white/10 flex justify-between items-center px-10">
        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center p-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <img src="/ku-logo.png" alt="KU" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-en font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">SMART CANTEEN</h1>
            <p className="text-sm font-en uppercase tracking-[0.3em] text-kg-green-l">Live Campus Infrastructure</p>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-5 py-2 rounded-full">
             <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
             <span className="font-en font-bold tracking-widest uppercase text-red-400 text-sm">Peak Hour</span>
          </div>
          <div className="text-right">
            <div className="font-en font-black text-4xl leading-none italic">{time.toLocaleTimeString('en-US', { hour12: false })}</div>
            <div className="font-en text-xs uppercase tracking-widest text-gray-400 mt-1">{time.toLocaleDateString('en-GB')}</div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex p-6 gap-6">
        
        {/* Left Column: Live Queue Board */}
        <div className="w-1/3 flex flex-col gap-4">
          <div className="bg-kg-surface/50 border border-white/5 rounded-[32px] p-8 h-full flex flex-col relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 right-0 w-64 h-64 bg-kg-green-l/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <h2 className="text-xl font-en font-black uppercase tracking-widest text-kg-gold-l mb-8 flex items-center gap-3">
              <span className="text-2xl">⏳</span> Live Queue Status
            </h2>
            
            <div className="flex flex-col gap-4 flex-1">
              {LIVE_SHOPS.map((shop, i) => (
                <motion.div 
                  key={shop.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center justify-between p-6 rounded-2xl border ${
                    shop.status === 'busy' ? 'bg-red-500/5 border-red-500/20' : 
                    shop.status === 'fast' ? 'bg-kg-green-l/5 border-kg-green-l/20' : 
                    'bg-white/5 border-white/10'
                  }`}
                >
                  <div>
                    <div className="text-2xl font-bold mb-1">{shop.name}</div>
                    <div className="text-sm text-gray-400">รอ {shop.queue} คิว</div>
                  </div>
                  <div className={`text-right ${
                    shop.status === 'busy' ? 'text-red-400' : 
                    shop.status === 'fast' ? 'text-kg-green-l' : 
                    'text-white'
                  }`}>
                    <div className="font-en font-black text-4xl italic leading-none">{shop.wait}</div>
                    <div className="font-en text-[10px] uppercase tracking-widest mt-1 opacity-60">Estimated</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* TV QR Code CTA */}
            <div className="mt-8 bg-kg-card border border-kg-green/30 rounded-2xl p-6 flex items-center gap-6 shadow-[0_0_40px_rgba(0,166,81,0.1)]">
              <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center shrink-0 p-2">
                 {/* Fake QR for TV */}
                 <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://smart-canteen.app" alt="QR" className="w-full h-full" />
              </div>
              <div>
                <h3 className="font-en font-black text-xl italic uppercase text-white mb-1">Scan to Order</h3>
                <p className="text-sm text-kg-green-l/80">สั่งล่วงหน้าผ่านแอป ไม่ต้องยืนรอคิว!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Map */}
        <div className="w-2/3 bg-black rounded-[32px] border border-white/10 relative overflow-hidden shadow-2xl flex flex-col">
          <div className="absolute top-6 left-6 z-10 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
            <h3 className="font-en font-black uppercase tracking-widest text-white text-lg">AI Vision Occupancy</h3>
            <p className="text-xs text-kg-green-l">Live Heatmap Tracking Active</p>
          </div>
          <div className="flex-1 -m-10"> {/* Negative margin to crop/zoom the map slightly for TV */}
             <div className="transform scale-[1.1] origin-center w-full h-full">
               <FloorMap />
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};

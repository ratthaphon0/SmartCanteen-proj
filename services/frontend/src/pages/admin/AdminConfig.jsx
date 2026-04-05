import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const AdminConfig = () => {
  const [stores, setStores] = useState([
    { id: 'S01', name: 'ข้าวมันไก่เจ๊สม', status: 'Active', zone: 'Zone A', owner: 'Somjai K.' },
    { id: 'S02', name: 'ก๋วยเตี๋ยวเรือลุงแดง', status: 'Active', zone: 'Zone A', owner: 'Daeng P.' },
    { id: 'S03', name: 'ร้านน้ำปั่นชื่นใจ', status: 'Inactive', zone: 'Zone B', owner: 'Chuen S.' },
  ]);

  const toggleStatus = (id) => {
    setStores(prev => prev.map(s => 
      s.id === id ? { ...s, status: s.status === 'Active' ? 'Inactive' : 'Active' } : s
    ));
  };

  return (
    <div className="flex flex-col h-full bg-kg-dark text-kg-green-p font-th">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 px-1">
        <div>
          <div className="font-en font-extrabold text-2xl leading-none italic uppercase">System Config</div>
          <div className="text-[10px] text-kg-green-p/40 font-en tracking-[0.2em] uppercase mt-1">Infrastructure Management</div>
        </div>
        <button className="px-5 py-2.5 bg-kg-green text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-kg-green-l transition-all shadow-lg">+ Add Stall</button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
        {/* Stall List */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="text-[10px] text-kg-green-p/40 font-en tracking-widest uppercase mb-2 px-1">Registered Stalls / รายชื่อร้านค้า</div>
          <AnimatePresence>
            {stores.map(store => (
              <motion.div 
                key={store.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-kg-card border border-kg-green/15 rounded-3xl p-5 mb-2 hover:border-kg-green-l/30 transition-all group"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-en font-black italic border ${
                      store.status === 'Active' ? 'bg-kg-green/10 text-kg-green-l border-kg-green-l/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {store.id}
                    </div>
                    <div>
                      <div className="font-bold text-sm tracking-tight">{store.name}</div>
                      <div className="text-[10px] text-kg-green-p/30 font-en uppercase tracking-widest">{store.owner} • {store.zone}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => toggleStatus(store.id)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${
                        store.status === 'Active' ? 'bg-kg-green-l text-white border-kg-green-l' : 'bg-kg-surface text-kg-green-p/30 border-kg-green/10'
                      }`}
                    >
                      {store.status}
                    </button>
                    <button className="text-kg-green-p/20 hover:text-kg-green-p p-2">⚙️</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Engine Config */}
        <div className="flex flex-col gap-6">
          <div className="text-[10px] text-kg-green-p/40 font-en tracking-widest uppercase mb-2 px-1">Engine Settings</div>
          <div className="bg-kg-card border border-kg-green/15 rounded-[32px] p-8 shadow-2xl space-y-10">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-[10px] font-en font-black uppercase tracking-widest text-kg-green-p/40">Confidence Threshold</label>
                  <span className="font-en font-bold text-kg-gold-l italic">0.45</span>
                </div>
                <input type="range" className="w-full h-1 bg-kg-surface rounded-full appearance-none accent-kg-green-l cursor-pointer" defaultValue="45" />
              </div>

              <div>
                <label className="text-[10px] font-en font-black uppercase tracking-widest text-kg-green-p/40 block mb-4">Refresh Frequency</label>
                <div className="grid grid-cols-4 gap-2">
                  {[0.5, 1, 2, 5].map(v => (
                    <button key={v} className={`py-2 rounded-xl text-[9px] font-en font-black border transition-all ${v === 2 ? 'bg-kg-green text-white border-kg-green-l' : 'bg-kg-surface border-kg-green/10 text-kg-green-p/30 hover:text-kg-green-p'}`}>
                      {v}s
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-kg-green/10">
              <button className="w-full py-4 bg-kg-green text-white font-bold rounded-2xl shadow-xl hover:bg-kg-green-l transition-all uppercase tracking-widest text-xs">Deploy Configuration</button>
              <div className="mt-4 text-[9px] text-center text-kg-green-p/20 uppercase tracking-[0.2em] font-medium leading-relaxed italic">
                Updates Redis caches and re-initializes<br/>CV Worker clusters.
              </div>
            </div>
          </div>

          <div className="bg-kg-card/30 border border-kg-green/5 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-kg-green-l/5 flex items-center justify-center text-kg-green-l italic font-en font-black">DB</div>
            <div>
              <div className="text-[9px] font-en uppercase tracking-widest text-kg-green-p/30">PostgreSQL Status</div>
              <div className="text-[11px] font-bold text-kg-green-l">Synced (14ms latency)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminConfig;

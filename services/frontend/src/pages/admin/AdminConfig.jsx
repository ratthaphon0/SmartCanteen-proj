import React, { useState } from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Settings, Plus, Save, Database, Shield, Sliders, Server } from 'lucide-react';

export const AdminConfig = () => {
  const [stores, setStores] = useState([
    { id: 'S01', name: 'ข้าวมันไก่เจ๊สม', status: 'Active', zone: 'A', owner: 'Somjai' },
    { id: 'S02', name: 'ก๋วยเตี๋ยวเรือลุงแดง', status: 'Active', zone: 'A', owner: 'Daeng' },
    { id: 'S03', name: 'ร้านน้ำปั่นชื่นใจ', status: 'Inactive', zone: 'B', owner: 'Chuen' },
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto pb-10">
      <header className="flex justify-between items-center bg-[#1a1d2e] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000">
           <Settings size={120} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic mb-1">System Config</h1>
          <p className="text-gray-500 font-medium text-[10px] uppercase tracking-widest leading-none">Manage Infrastructure, Stores & AI Parameters</p>
        </div>
        <Button className="py-3 px-8 text-xs font-black uppercase tracking-widest shadow-blue-500/30 flex gap-3">
           <Plus size={16} /> Add Store
        </Button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Store Management Table */}
        <div className="xl:col-span-2 flex flex-col gap-4">
           <div className="flex items-center gap-3 px-2 mb-2">
              <Shield size={20} className="text-blue-500" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Active Registrations</h3>
           </div>
           
           <div className="flex flex-col gap-3">
              {stores.map(store => (
                <GlassCard key={store.id} className="flex justify-between items-center p-6 border-white/5 bg-black/20 hover:bg-white/[0.03] transition-colors relative group">
                  <div className="flex items-center gap-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border ${store.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                       {store.id}
                    </div>
                    <div className="flex flex-col">
                      <h4 className="font-extrabold text-white uppercase tracking-tight text-lg mb-1">{store.name}</h4>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Zone {store.zone}</span>
                         <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                         <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Owner: {store.owner}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <Badge status={store.status === 'Active' ? 'ready' : 'occupied'} className="px-3 py-1 font-black uppercase tracking-widest">
                       {store.status}
                     </Badge>
                     <Button variant="ghost" className="p-3">
                        <Sliders size={16} />
                     </Button>
                  </div>
                </GlassCard>
              ))}
           </div>
        </div>

        {/* AI Parameters Control */}
        <div className="xl:col-span-1 flex flex-col gap-6">
           <div className="flex items-center gap-3 px-2 mb-2">
              <Server size={20} className="text-purple-500" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">AI Settings</h3>
           </div>

           <GlassCard className="p-8 border-white/5 bg-[#1a1d2e] shadow-2xl flex flex-col gap-8">
             <div className="flex flex-col gap-6">
                <div>
                  <div className="flex justify-between items-center mb-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Confidence Threshold</label>
                     <span className="text-xs font-black text-blue-400 tracking-tighter">0.45</span>
                  </div>
                  <input type="range" min="0" max="100" defaultValue="45" className="w-full accent-blue-500 h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer" />
                </div>

                <div>
                   <div className="flex justify-between items-center mb-4 font-black">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest">Emit Interval (s)</label>
                      <span className="text-xs text-purple-400 tracking-tighter">2s</span>
                   </div>
                   <div className="flex gap-2">
                       {[0.5, 1, 2, 5].map(v => (
                         <button key={v} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase border tracking-widest transition-all ${v === 2 ? 'bg-purple-500/10 border-purple-500 text-purple-400 shadow-lg shadow-purple-500/10' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>
                            {v}s
                         </button>
                       ))}
                   </div>
                </div>
             </div>

             <div className="pt-6 border-t border-white/5">
                <Button className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/30 text-emerald-500 hover:text-white transition-all group flex gap-3">
                   <Save size={16} /> Save AI Configuration
                </Button>
                <p className="text-[9px] text-center mt-4 text-gray-600 font-bold uppercase tracking-widest leading-relaxed">
                   Changes will be pushed to WebSocket<br/>
                   and CV-Engine via Redis Pub/Sub immediately.
                </p>
             </div>
           </GlassCard>

           <GlassCard className="p-6 border-white/5 bg-black/20 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                 <Database size={18} />
              </div>
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">PostgreSQL Engine</span>
                 <span className="text-xs font-bold text-gray-200">Sync delay: 124ms</span>
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
};

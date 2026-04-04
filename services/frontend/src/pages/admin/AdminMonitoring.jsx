import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Video, Maximize2, Zap, LayoutPanelTop, Eye, Info } from 'lucide-react';

export const AdminMonitoring = () => {
  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto pb-10 h-full">
      <header className="flex justify-between items-center bg-[#1a1d2e] p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:rotate-12 transition-transform duration-1000 uppercase text-[120px] font-black italic tracking-tighter">Live</div>
        <div className="relative z-10 w-full flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase italic mb-1">AI Inference Terminal</h1>
                <p className="text-gray-500 font-medium text-[10px] uppercase tracking-widest leading-none">Live Camera Streams & YOLOv8 Detection Feeds</p>
            </div>
            <div className="flex gap-4">
               <Badge status="ready" className="px-5 py-2 font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-lg shadow-emerald-500/5">🟢 Engine Active</Badge>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Main Feed Container */}
        <div className="flex flex-col gap-6">
           <div className="flex items-center gap-3 px-2">
              <Eye size={20} className="text-blue-500" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Camera Feed: Zone A (Overview)</h3>
           </div>
           
           <GlassCard className="flex flex-col p-4 bg-black/40 border-none relative overflow-hidden h-[450px] shadow-black/80 shadow-2xl group border border-white/5">
             <div className="absolute top-6 left-6 z-10 flex gap-2">
               <Badge status="pending" className="bg-red-500 text-white border-transparent px-3 py-1 font-black shadow-lg shadow-red-500/20 animate-pulse">🔴 REC</Badge>
               <Badge status="pending" className="bg-black/60 text-gray-300 border-white/10 backdrop-blur-md px-3 font-black">2026-04-04 12:44:05</Badge>
             </div>
             
             <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
                <button className="p-3 bg-black/60 backdrop-blur-md rounded-xl text-white/50 hover:text-white border border-white/10 transition-colors">
                   <Maximize2 size={20} />
                </button>
             </div>

             <div className="flex-1 w-full bg-[#0a0a0f] rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-white/[0.02] pointer-events-none"></div>
                <span className="text-gray-800 font-black text-sm uppercase tracking-[0.5em] italic select-none">Video Stream Signal</span>
                
                {/* Mock Inference Result Bounding Boxes */}
                <div className="absolute top-[25%] left-[30%] w-[18%] h-[25%] border-2 border-emerald-500/80 bg-emerald-500/10 rounded">
                   <div className="absolute -top-6 left-0 bg-emerald-500 text-black text-[9px] px-2 font-black uppercase tracking-widest leading-loose">Seat-Vacant: 0.95</div>
                </div>
                <div className="absolute top-[48%] left-[55%] w-[14%] h-[30%] border-2 border-red-500/80 bg-red-500/10 rounded">
                   <div className="absolute -top-6 left-0 bg-red-500 text-white text-[9px] px-2 font-black uppercase tracking-widest leading-loose font-sans">Seat-Occupied: 0.89</div>
                </div>
                <div className="absolute top-[10%] left-[10%] w-[12%] h-[20%] border-2 border-blue-500/80 bg-blue-500/10 rounded">
                   <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[9px] px-2 font-black uppercase tracking-widest leading-loose">Object: Bag</div>
                </div>
             </div>
           </GlassCard>
        </div>

        {/* Console / Diagnostics */}
        <div className="flex flex-col gap-6 h-full">
           <div className="flex items-center gap-3 px-2">
              <LayoutPanelTop size={20} className="text-purple-500" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Diagnostics & Logs</h3>
           </div>

           <GlassCard className="flex-1 p-6 bg-[#0a0a0f] border-white/5 font-mono text-[10px] text-gray-400 overflow-y-auto max-h-[450px] shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                 <span className="font-black text-gray-600 uppercase tracking-widest">Real-time Inference Log</span>
                 <Zap size={14} className="text-orange-500" />
              </div>
              
              <div className="flex flex-col gap-1.5 opacity-80">
                 <p className="text-blue-400 select-none">[12:44:01] ENGINE.STARTING: Initializing TensorRT engine...</p>
                 <p className="text-emerald-500">[12:44:02] ENGINE.READY: Model YOLOv8n loaded successfully (Conf=0.45)</p>
                 <p className="text-gray-500">[12:44:03] STREAM.CONNECT: Linked to Camera Zone-A via RTMP (30fps)</p>
                 <p className="text-white/80">[12:44:04] INFERENCE.LOOP: Processing frame sequence (Latency: 12ms)</p>
                 <p className="text-orange-500">[12:44:05] ALERT: Seat T01-S1 status changed &rarr; Occupied</p>
                 <p className="text-white/80">[12:44:05] INFERENCE.LOOP: Occupancy updated &rarr; 78%</p>
                 <p className="text-gray-600 font-bold opacity-30">[...] System polling continuous </p>
                 <p className="flex items-center gap-2 text-blue-500 font-black animate-pulse">[12:44:06] DATA.SYNC: Transmitting update to Redis PubSub...</p>
              </div>

              <div className="absolute bottom-6 left-6 right-6">
                 <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-4">
                    <Info size={20} className="text-blue-500" />
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-loose">
                      System automatically triggers push notifications based on detection confidence levels over 80%.
                    </p>
                 </div>
              </div>
           </GlassCard>
        </div>
      </div>
    </div>
  );
};

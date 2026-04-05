import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Badge } from '../../components/ui/Badge';
import { Video, Maximize2, Zap, LayoutPanelTop, Eye, Info, Activity, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export const AdminMonitoring = () => {
  return (
    <div className="flex flex-col gap-10 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-[var(--border)] pb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-ku-gold font-black uppercase tracking-[0.2em] text-[10px] font-en">
            <Video size={12} className="animate-pulse" /> Live Inference Terminal
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter leading-none font-en uppercase italic">
            AI <span className="text-ku-green-light">Monitoring</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-5 py-2.5 bg-ku-green-light/10 border border-ku-green-light/20 rounded-xl flex items-center gap-3 shadow-lg shadow-ku-green-light/5">
              <div className="w-2 h-2 rounded-full bg-ku-green-light animate-pulse" />
              <span className="text-[10px] font-black text-ku-green-light uppercase tracking-widest font-en">YOLOv8 Engine Active</span>
           </div>
           <Badge status="pending" className="bg-ku-gold text-black border-transparent px-4 py-2 font-black uppercase tracking-widest shadow-lg shadow-ku-gold/10">Live Feed</Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Main Feed Container */}
        <div className="flex flex-col gap-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] font-en flex items-center gap-3">
                 <Eye size={18} className="text-ku-green-light" /> Zone A (Overview)
              </h3>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">Recording</span>
              </div>
           </div>
           
           <GlassCard className="p-4 bg-bg-dark border-[var(--border)] relative overflow-hidden h-[500px] shadow-2xl group">
             {/* Feed Overlay UI */}
             <div className="absolute top-8 left-8 z-20 space-y-2">
               <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                  <span className="text-[9px] font-black text-white uppercase tracking-widest font-en">Cam_01_A</span>
               </div>
               <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest font-en">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
               </div>
             </div>
             
             <div className="absolute bottom-8 right-8 z-20 flex gap-3">
                <button className="p-3 bg-ku-green/80 backdrop-blur-md rounded-xl text-white border border-ku-green-light/30 hover:bg-ku-green transition-all shadow-lg border-2">
                   <Maximize2 size={20} />
                </button>
             </div>

             <div className="w-full h-full bg-[#050c08] rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden group-hover:scale-[1.01] transition-transform duration-700">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,166,81,0.08)_0%,transparent_70%)]" />
                <div className="absolute inset-0 bg-grid-white/[0.02] opacity-30" />
                
                {/* Mock Inference Result Bounding Boxes */}
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="absolute top-[25%] left-[20%] w-[20%] h-[28%] border-2 border-ku-green-light bg-ku-green-light/10 rounded-lg shadow-[0_0_20px_rgba(0,166,81,0.2)]"
                >
                   <div className="absolute -top-7 left-0 bg-ku-green-light text-black text-[9px] px-3 font-black uppercase tracking-widest h-6 flex items-center rounded-t-lg">Seat-Vacant [0.98]</div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  className="absolute top-[50%] left-[55%] w-[16%] h-[32%] border-2 border-red-500 bg-red-500/10 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                >
                   <div className="absolute -top-7 left-0 bg-red-500 text-white text-[9px] px-3 font-black uppercase tracking-widest h-6 flex items-center rounded-t-lg">Seat-Occupied [0.92]</div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                  className="absolute top-[15%] left-[65%] w-[14%] h-[22%] border-2 border-ku-gold bg-ku-gold/10 rounded-lg shadow-[0_0_20px_rgba(201,162,39,0.2)]"
                >
                   <div className="absolute -top-7 left-0 bg-ku-gold text-black text-[9px] px-3 font-black uppercase tracking-widest h-6 flex items-center rounded-t-lg">Reserved: Bag [0.85]</div>
                </motion.div>

                <span className="text-white/5 font-black text-4xl uppercase tracking-[0.5em] italic font-en select-none pointer-events-none">Signal Active</span>
             </div>
           </GlassCard>
        </div>

        {/* Console / Diagnostics */}
        <div className="flex flex-col gap-6">
           <div className="flex items-center gap-3 px-2">
              <Terminal size={18} className="text-ku-green-light" />
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] font-en">System Diagnostics</h3>
           </div>

           <GlassCard className="flex-1 p-8 bg-bg-dark border-[var(--border)] font-mono text-[11px] text-gray-400 h-[500px] overflow-hidden relative flex flex-col">
              <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-ku-green-light animate-pulse" />
                    <span className="font-black text-white uppercase tracking-widest font-en">Live Inference Log</span>
                 </div>
                 <Activity size={16} className="text-ku-green-light" />
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-4">
                 <LogLine time="12:54:01" type="INFO" msg="TensorRT engine warm-up complete." color="text-blue-400" />
                 <LogLine time="12:54:02" type="SUCCESS" msg="Model YOLOv8n initialized (CONF=0.45)" color="text-ku-green-light" />
                 <LogLine time="12:54:03" type="STREAM" msg="RTMP feed established: Zone-A @ 30fps" color="text-gray-500" />
                 <LogLine time="12:54:04" type="CORE" msg="Processing frame vector (Avg Latency: 12ms)" color="text-white/70" />
                 <LogLine time="12:54:05" type="ALERT" msg="Seat T01-01 status flipped -> OCCUPIED" color="text-ku-gold font-black" />
                 <LogLine time="12:54:06" type="SYNC" msg="Transmitting global state to Redis" color="text-blue-500 animate-pulse" />
                 <LogLine time="12:54:07" type="CORE" msg="Detection loop continuous..." color="text-white/40" />
                 <LogLine time="12:54:08" type="INFO" msg="Object detected at T01-03: Bag (0.85)" color="text-ku-gold/80" />
                 <LogLine time="12:54:09" type="SYNC" msg="Broadcast queue: 0 pending" color="text-blue-500/50" />
              </div>

              <div className="mt-8 p-5 bg-ku-green-light/5 border border-ku-green-light/20 rounded-2xl flex items-center gap-5">
                 <div className="w-10 h-10 rounded-xl bg-ku-green-light/10 flex items-center justify-center text-ku-green-light">
                    <Info size={20} />
                 </div>
                 <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-loose font-en">
                   Detection confidence threshold is set to <span className="text-ku-gold">0.45</span>. 
                   Auto-notification is <span className="text-ku-green-light">ENABLED</span> for high-confidence anomalies.
                 </p>
              </div>
           </GlassCard>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
    </div>
  );
};

const LogLine = ({ time, type, msg, color }) => (
  <div className="flex gap-4 group/log">
     <span className="text-text-muted font-bold tracking-tighter shrink-0">{time}</span>
     <span className={`w-[80px] font-black uppercase text-center shrink-0`}>[{type}]</span>
     <span className={`${color} leading-relaxed group-hover:text-white transition-colors`}>{msg}</span>
  </div>
);

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HeatmapAnalytics = ({ API_URL }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_URL}/api/analytics/density`);
                const result = await response.json();
                if (result.status === "success") {
                    setData(result);
                }
            } catch (error) {
                console.error("Failed to fetch heatmap data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 10000); // Update every 10s
        return () => clearInterval(interval);
    }, [API_URL]);

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center bg-white/5 rounded-3xl border border-white/10 animate-pulse">
                <span className="text-white/30 font-en tracking-widest uppercase text-xs">Initializing AI Heatmap...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* AI Insights Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-gradient-to-br from-[#00a8ff]/20 to-[#00a8ff]/5 backdrop-blur-xl rounded-3xl border border-[#00a8ff]/30 shadow-[0_8px_32px_rgba(0,168,255,0.1)]"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-[#00a8ff] flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,168,255,0.5)]">
                        <span className="text-xs">🤖</span>
                    </div>
                    <h3 className="text-sm font-en font-black text-[#00a8ff] uppercase tracking-widest">AI Strategic Insight</h3>
                </div>
                <p className="text-white text-sm leading-relaxed italic">
                    "{data?.insights || "Gathering real-time intelligence..."}"
                </p>
            </motion.div>

            {/* Heatmap Grid */}
            <div className="bg-kg-card border border-white/10 rounded-[32px] p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 text-[120px] opacity-[0.02] italic font-en font-black select-none pointer-events-none group-hover:scale-110 transition-transform">GRID</div>
                
                <div className="flex justify-between items-end mb-8 relative z-10">
                    <div>
                        <h2 className="text-2xl font-en font-black text-white italic uppercase tracking-tighter">Live Occupancy Grid</h2>
                        <p className="text-[10px] text-white/40 font-en uppercase tracking-[0.2em] mt-1">Sensor Matrix — Zone A/B/C</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[9px] text-green-400 font-bold uppercase tracking-widest">Live Feed</div>
                    </div>
                </div>

                <div className="grid grid-cols-5 md:grid-cols-10 gap-2 relative z-10">
                    <AnimatePresence>
                        {data?.data?.heatmap?.map((seat, i) => (
                            <motion.div 
                                key={seat.seat_id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.02 }}
                                className="aspect-square w-full rounded-xl flex items-center justify-center text-[8px] font-en font-bold transition-all duration-700 relative group/seat"
                                style={{ 
                                    backgroundColor: `rgba(239, 68, 68, ${0.1 + (seat.score * 0.9)})`,
                                    border: seat.score > 0.5 ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
                                    boxShadow: seat.score > 0.7 ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none'
                                }}
                            >
                                <span className={seat.score > 0.5 ? 'text-white' : 'text-white/20'}>S{seat.seat_id}</span>
                                
                                {/* Tooltip on Hover */}
                                <div className="absolute bottom-full mb-2 hidden group-hover/seat:block z-20 bg-black/90 text-white p-2 rounded-lg text-[9px] whitespace-nowrap border border-white/10 shadow-2xl">
                                    Occupancy: {(seat.score * 100).toFixed(0)}%
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <div className="mt-8 flex justify-between items-center text-[10px] font-en font-bold uppercase tracking-widest text-white/30 relative z-10 border-t border-white/5 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500/10"></div>
                        <span>Vacant</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Highly Occupied</span>
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeatmapAnalytics;


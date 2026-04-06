import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const UserQueue = ({ stallOrders = [], setStallOrders }) => {
  const activeOrders = stallOrders
    .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const pastOrders = stallOrders
    .filter(o => o.status === 'completed' || o.status === 'cancelled')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const formatTime = (isoString) => {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { return isoString; }
  };

  const markAsReceived = (id) => {
    if (setStallOrders) {
      setStallOrders(prev => prev.map(order => 
        order.id === id ? { ...order, status: 'completed', timestamp: new Date().toISOString() } : order
      ));
    }
  };

  return (
    <div className="flex flex-col h-full bg-kg-dark text-kg-green-p font-th">
      <div className="flex justify-between items-end mb-6 px-1">
        <div>
          <div className="font-en font-extrabold text-2xl leading-none italic uppercase">สถานะออเดอร์</div>
          <div className="text-[10px] text-kg-green-p/40 font-en tracking-[0.2em] uppercase mt-1">Live Tracking</div>
        </div>
      </div>

      <div className="space-y-6 pb-14">
        {/* Active Queue Cards */}
        {activeOrders.length > 0 ? (
          <div className="space-y-4">
            {activeOrders.map((order, idx) => {
              const isReady = order.status === 'ready';
              const waitTime = isReady ? 0 : (idx + 1) * 5;
              
              return (
                <motion.div 
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-kg-card border rounded-3xl p-6 shadow-2xl relative overflow-hidden group transition-all duration-500 ${
                    isReady ? 'border-kg-gold shadow-[0_0_30px_rgba(201,162,39,0.15)] ring-1 ring-kg-gold/30' : 'border-kg-green/20'
                  }`}
                >
                  <div className={`absolute top-4 right-6 flex items-center gap-1.5 px-2 py-1 rounded-full border ${
                    isReady ? 'bg-kg-gold/10 border-kg-gold/30' : 'bg-kg-green-l/10 border-kg-green-l/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-blink ${isReady ? 'bg-kg-gold' : 'bg-kg-green-l'}`}></span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest font-en ${isReady ? 'text-kg-gold' : 'text-kg-green-l'}`}>
                      {isReady ? 'READY TO PICKUP' : (order.status || 'PREPARING')}
                    </span>
                  </div>
                  
                  <div className="text-center py-4">
                    <div className="text-[10px] text-kg-green-p/40 font-en uppercase tracking-[0.3em] mb-2">Queue Number</div>
                    <div className={`font-en text-5xl font-extrabold italic leading-none mb-4 drop-shadow-xl transition-colors ${
                      isReady ? 'text-kg-gold' : 'text-kg-gold-l'
                    }`}>
                      {order.id?.toString().replace('ORD-', 'Q-')}
                    </div>
                    <div className="text-sm font-bold mb-4">
                      {order.items?.[0]?.name || 'รายการอาหาร'} 
                      {order.items?.length > 1 && ` +${order.items.length - 1}`}
                    </div>
                    
                    <div className="flex justify-center items-center gap-8 border-y border-kg-green/10 py-6 my-2">
                      <div className="text-center">
                        <div className="text-[9px] text-kg-green-p/30 font-en uppercase tracking-widest mb-1">Status</div>
                        <div className={`text-xs font-bold ${isReady ? 'text-kg-gold' : 'text-kg-green-l'}`}>
                          {isReady ? '✅ พร้อมรับอาหาร' : '🧑‍🍳 กำลังปรุง'}
                        </div>
                      </div>
                      <div className="text-center border-l border-white/5 pl-8">
                        <div className="text-[9px] text-kg-green-p/30 font-en uppercase tracking-widest mb-1">Position / Wait</div>
                        <div className="text-xs font-bold text-kg-green-p">
                          {isReady ? 'รับได้เลย!' : `คิวที่ ${idx + 1} / ~${waitTime} นาที`}
                        </div>
                      </div>
                    </div>

                    {isReady && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => markAsReceived(order.id)}
                        className="w-full mt-4 py-3 bg-kg-green text-white font-bold rounded-xl text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-kg-green-l transition-all animate-shimmer"
                      >
                        รับอาหารแล้ว 🥡 คลิกยืนยัน
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="bg-kg-card border border-dashed border-kg-green/20 rounded-2xl p-10 text-center flex flex-col items-center gap-4">
            <div className="text-5xl opacity-20 italic">🍱</div>
            <div className="text-sm font-bold text-kg-green-p/30 uppercase tracking-widest font-en">ยังไม่มีออเดอร์ในขณะนี้</div>
          </div>
        )}

        {/* History List */}
        <div>
          <div className="text-[10px] text-kg-green-p/40 font-en tracking-widest uppercase mb-4 px-1">ประวัติการสั่งซื้อ / History</div>
          <div className="space-y-3">
            {pastOrders.length > 0 ? (
              pastOrders.map((order) => (
                <div key={order.id} className="bg-kg-surface/50 border border-kg-green/10 rounded-2xl p-4 flex items-center gap-4 opacity-60">
                   <div className="w-12 h-12 rounded-xl bg-kg-card flex items-center justify-center text-2xl">{order.items?.[0]?.emoji || '🥡'}</div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-bold text-sm">{order.items?.[0]?.name || 'รายการอาหาร'}</div>
                        <div className="font-en font-black text-xs">฿{order.total}</div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-kg-green-p/40 font-en tracking-tighter">
                         <span>{formatTime(order.timestamp)}</span>
                         <span>•</span>
                         <span className={order.status === 'completed' ? 'text-kg-green-l' : 'text-red-400'}>
                           {order.status === 'completed' ? 'สำเร็จ' : 'ยกเลิก'}
                         </span>
                      </div>
                   </div>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-center text-kg-green-p/20 italic font-en">ไม่มีรายการประวัติ</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const StallOrders = ({ stallOrders = [], setStallOrders }) => {
  const activeOrders = stallOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const pastOrders = stallOrders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  const updateStatus = (id, nextStatus) => {
    setStallOrders(prev => prev.map(o => 
      o.id === id ? { ...o, status: nextStatus } : o
    ));
  };

  const addDemoOrder = () => {
    const items = [
      { name: 'ข้าวมันไก่', price: 55, emoji: '🍗' },
      { name: 'ก๋วยเตี๋ยวเรือ', price: 40, emoji: '🍜' },
      { name: 'ข้าวแกงกะหรี่', price: 60, emoji: '🍛' }
    ];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      items: [{ ...randomItem, qty: 1 }],
      total: randomItem.price,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString()
    };
    setStallOrders(prev => [newOrder, ...prev]);
  };

  return (
    <div className="flex flex-col h-full bg-kg-dark text-kg-green-p font-th">
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-6 px-1">
        <div>
          <div className="font-en font-extrabold text-2xl leading-none italic uppercase">Order Board</div>
          <div className="text-[10px] text-kg-green-p/40 font-en tracking-[0.2em] uppercase mt-1">Live Management</div>
        </div>
        <button 
          onClick={addDemoOrder}
          className="px-4 py-2 bg-kg-green text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-kg-green-l transition-all shadow-lg"
        >
          + จำลองออเดอร์ใหม่
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
        {/* Active Orders */}
        <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="text-[10px] text-kg-green-p/40 font-en tracking-widest uppercase mb-2 px-1">Active / กำลังดำเนินการ</div>
          <AnimatePresence mode="popLayout">
            {activeOrders.map(order => (
              <motion.div 
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className={`bg-kg-card border rounded-3xl p-5 mb-2 relative overflow-hidden transition-all ${
                  order.status === 'ready' ? 'border-kg-gold shadow-[0_0_20px_rgba(201,162,39,0.15)]' : 'border-kg-green/15'
                }`}
              >
                {order.status === 'ready' && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-kg-gold text-black text-[9px] font-black uppercase tracking-tighter rounded-bl-xl font-en">Ready to Pick</div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="font-en font-extrabold text-kg-green-l italic tracking-tight mb-0.5">#{order.id}</div>
                    <div className="text-sm font-bold">{order.items.map(i => `${i.name} x${i.qty}`).join(', ')}</div>
                  </div>
                  <div className="font-en font-black text-lg">฿{order.total}</div>
                </div>

                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <button onClick={() => updateStatus(order.id, 'preparing')} className="flex-1 py-2.5 bg-kg-green text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-kg-green-l transition-all">รับออเดอร์ (Accept)</button>
                  )}
                  {order.status === 'preparing' && (
                    <button onClick={() => updateStatus(order.id, 'ready')} className="flex-1 py-2.5 bg-kg-gold text-black rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-kg-gold-l transition-all">ทำเสร็จแล้ว (Ready)</button>
                  )}
                  {order.status === 'ready' && (
                    <button onClick={() => updateStatus(order.id, 'completed')} className="flex-1 py-2.5 bg-kg-green-l text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-kg-green transition-all">เสร็จสิ้น (Done)</button>
                  )}
                  <button onClick={() => updateStatus(order.id, 'cancelled')} className="px-4 py-2.5 bg-kg-surface border border-kg-green/10 text-red-400/50 hover:text-red-400 rounded-xl text-[10px] font-bold uppercase transition-all">ยกเลิก</button>
                </div>
              </motion.div>
            ))}
            {activeOrders.length === 0 && (
              <div className="text-center py-20 opacity-20 italic text-kg-green-p/50">No active orders</div>
            )}
          </AnimatePresence>
        </div>

        {/* Past Orders */}
        <div className="hidden lg:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar opacity-40 grayscale-[0.5]">
          <div className="text-[10px] text-kg-green-p/40 font-en tracking-widest uppercase mb-2 px-1">Completed / ประวัติ</div>
          {pastOrders.map(order => (
            <div key={order.id} className="bg-kg-surface/50 border border-kg-green/10 rounded-2xl p-4 flex justify-between items-center mb-1">
               <div className="flex items-center gap-3">
                  <div className="font-en font-extrabold text-xs italic text-kg-green-p/40">#{order.id}</div>
                  <div className="text-xs font-medium">{order.items[0]?.name}...</div>
               </div>
               <div className={`text-[9px] font-bold uppercase tracking-widest p-1 px-2 rounded-md ${order.status === 'completed' ? 'bg-kg-green/10 text-kg-green-l' : 'bg-red-500/10 text-red-400'}`}>
                 {order.status === 'completed' ? 'SUCCESS' : 'VOID'}
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

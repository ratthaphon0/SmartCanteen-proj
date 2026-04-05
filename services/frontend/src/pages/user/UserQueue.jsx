import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const UserQueue = ({ stallOrders = [] }) => {
  const activeOrders = stallOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const pastOrders = stallOrders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  return (
    <div className="flex flex-col h-full bg-kg-dark text-kg-green-p font-th">
      <div className="flex justify-between items-end mb-6 px-1">
        <div>
          <div className="font-en font-extrabold text-2xl leading-none italic uppercase">สถานะออเดอร์</div>
          <div className="text-[10px] text-kg-green-p/40 font-en tracking-[0.2em] uppercase mt-1">Live Tracking</div>
        </div>
      </div>

      <div className="space-y-6 pb-14">
        {/* Active Queue Card */}
        {activeOrders.length > 0 ? (
          <div className="bg-kg-card border border-kg-green/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-4 right-6 flex items-center gap-1.5 px-2 py-1 rounded-full bg-kg-green-l/10 border border-kg-green-l/20">
              <span className="w-1.5 h-1.5 rounded-full bg-kg-green-l animate-blink"></span>
              <span className="text-[9px] font-bold text-kg-green-l uppercase tracking-widest font-en">Preparing</span>
            </div>
            
            <div className="text-center py-4">
              <div className="text-[10px] text-kg-green-p/40 font-en uppercase tracking-[0.3em] mb-2">Queue Number</div>
              <div className="font-en text-6xl font-extrabold text-kg-gold-l italic leading-none mb-4 drop-shadow-[0_0_20px_rgba(201,162,39,0.3)]">
                {activeOrders[0].id.replace('ORD-', 'Q-')}
              </div>
              <div className="text-sm font-bold mb-4">{activeOrders[0].items[0].name} {activeOrders[0].items.length > 1 && `+${activeOrders[0].items.length - 1}`}</div>
              
              <div className="flex justify-center items-center gap-8 border-t border-kg-green/10 pt-6 mt-2">
                <div className="text-center">
                  <div className="text-[9px] text-kg-green-p/30 font-en uppercase tracking-widest mb-1">Status</div>
                  <div className="text-xs font-bold text-kg-green-l">🧑‍🍳 กำลังทำ</div>
                </div>
                <div className="text-center">
                  <div className="text-[9px] text-kg-green-p/30 font-en uppercase tracking-widest mb-1">Wait Time</div>
                  <div className="text-xs font-bold text-kg-green-p">~5 mins</div>
                </div>
              </div>
            </div>
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
              pastOrders.map((order, i) => (
                <div key={i} className="bg-kg-surface/50 border border-kg-green/10 rounded-2xl p-4 flex items-center gap-4 opacity-60">
                   <div className="w-12 h-12 rounded-xl bg-kg-card flex items-center justify-center text-2xl">{order.items[0]?.emoji || '🥡'}</div>
                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-bold text-sm">{order.items[0]?.name}</div>
                        <div className="font-en font-black text-xs">฿{order.total}</div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-kg-green-p/40 font-en tracking-tighter">
                         <span>{order.timestamp}</span>
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

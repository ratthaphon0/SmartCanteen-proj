import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShoppingBag, Bell, CheckCircle2 } from 'lucide-react';

export const StallOrders = () => {
  const orders = [
    { id: '101', item: 'ข้าวแกงเนื้อ + ไข่ดาว', note: 'ไม่เผ็ด', time: '2m ago', status: 'pending', price: 55 },
    { id: '102', item: 'หมูกระเทียมราดข้าว', note: '', time: '5m ago', status: 'preparing', price: 45 },
    { id: '104', item: 'ต้มยำกุ้งน้ำข้น', note: 'ใส่ถุง', time: '1m ago', status: 'pending', price: 80 },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* New Orders Column */}
        <div className="flex flex-col gap-4">
          <header className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
              ออเดอร์ใหม่ <Badge status="reserved" className="scale-110">2</Badge>
            </h3>
            <button className="text-[10px] font-black text-gray-500 hover:text-blue-400 uppercase tracking-widest transition-colors">
              Auto-Accept: ON
            </button>
          </header>

          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {orders.filter(o => o.status === 'pending').map(order => (
                <motion.div 
                   key={order.id} 
                   layout 
                   initial={{ opacity: 0, scale: 0.9, y: 10 }} 
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   className="relative"
                >
                  <GlassCard className="border-l-4 border-l-amber-500 overflow-hidden bg-[#1a1d2e] shadow-2xl hover:border-l-blue-500 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 font-black border border-amber-500/20">
                            #{order.id}
                         </div>
                         <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none drop-shadow-sm">{order.time}</span>
                      </div>
                      <div className="text-lg font-black text-white tracking-tighter">฿{order.price}</div>
                    </div>

                    <h4 className="text-xl font-black text-white mb-2 leading-tight tracking-tight uppercase">{order.item}</h4>
                    {order.note && (
                      <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-red-500/20 mb-4">
                        <Bell size={12} className="animate-pulse" /> {order.note}
                      </div>
                    )}

                    <div className="flex gap-3 mt-2">
                      <Button className="flex-1 py-3 text-xs font-black uppercase tracking-widest shadow-blue-500/20 border border-blue-500/30">Accept Order</Button>
                      <Button variant="ghost" className="w-12 h-12 !p-0 rounded-xl border border-white/5 bg-white/5 hover:bg-red-500/10 hover:text-red-500 transition-all text-gray-500">
                         <X size={20} />
                      </Button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Preparing Orders Column */}
        <div className="flex flex-col gap-4">
          <header className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
              กำลังจัดเตรียม <Badge status="preparing" className="scale-110">1</Badge>
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Processing...</span>
            </div>
          </header>

          <div className="flex flex-col gap-4">
            {orders.filter(o => o.status === 'preparing').map(order => (
              <motion.div key={order.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <GlassCard className="border-l-4 border-l-blue-500 opacity-90 shadow-lg p-6 bg-black/20">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-black text-xl text-blue-400 tracking-tighter">#{order.id}</span>
                    <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{order.time}</span>
                  </div>
                  <h4 className="text-xl font-black text-gray-300 mb-6 leading-tight tracking-tight uppercase">{order.item}</h4>
                  
                  <Button variant="secondary" className="w-full py-3.5 text-xs font-black uppercase tracking-widest border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10 group">
                    <CheckCircle2 size={16} className="group-hover:scale-110 transition-transform" /> 
                    อาหารเสร็จแล้ว (แจ้งคนรับ)
                  </Button>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const X = ({ size }) => <span style={{fontSize: size}} className="font-bold">×</span>;

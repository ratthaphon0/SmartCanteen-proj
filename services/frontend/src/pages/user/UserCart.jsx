import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const UserCart = ({ cart, setCart, setStallOrders }) => {
  const navigate = useNavigate();

  const updateQty = (name, delta) => {
    setCart(prev => prev.map(item => 
      item.name === name ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  const removeItem = (name) => {
    setCart(prev => prev.filter(item => item.name !== name));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Add to shared stall orders
    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-4)}`,
      items: [...cart],
      total,
      status: 'pending',
      timestamp: new Date().toLocaleTimeString()
    };
    
    setStallOrders(prev => [newOrder, ...prev]);
    setCart([]);
    navigate('/user/queue');
  };

  return (
    <div className="flex flex-col h-full bg-kg-dark text-kg-green-p font-th">
      <div className="flex justify-between items-end mb-6 px-1">
        <div>
          <div className="font-en font-extrabold text-2xl leading-none italic">ตะกร้าของคุณ</div>
          <div className="text-[10px] text-kg-green-p/40 font-en tracking-[0.2em] uppercase mt-1">Review Items</div>
        </div>
        <div className="text-xs font-bold text-kg-green-l">{cart.length} รายการ</div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-6">
        <AnimatePresence mode="popLayout">
          {cart.length === 0 ? (
            <div className="bg-kg-card border border-dashed border-kg-green/20 rounded-2xl p-10 text-center flex flex-col items-center gap-4">
              <div className="text-5xl opacity-20 italic">🛒</div>
              <div className="text-sm font-bold text-kg-green-p/30 uppercase tracking-widest font-en">ตะกร้าว่างเปล่า</div>
            </div>
          ) : (
            cart.map((item, i) => (
              <motion.div 
                key={item.name}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-kg-card border border-kg-green/15 rounded-2xl p-4 flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-xl bg-kg-surface border border-kg-green/10 flex items-center justify-center text-3xl">{item.emoji}</div>
                <div className="flex-1">
                  <div className="font-bold text-sm mb-0.5">{item.name}</div>
                  <div className="font-en font-extrabold text-kg-green-l text-xs italic">฿{item.price}</div>
                </div>
                <div className="flex items-center gap-2 bg-kg-surface border border-kg-green/10 rounded-lg p-1">
                  <button onClick={() => updateQty(item.name, -1)} className="w-6 h-6 flex items-center justify-center text-xs hover:bg-kg-green/20 rounded">-</button>
                  <span className="w-4 text-center font-en font-bold text-xs">{item.qty}</span>
                  <button onClick={() => updateQty(item.name, 1)} className="w-6 h-6 flex items-center justify-center text-xs hover:bg-kg-green/20 rounded">+</button>
                </div>
                <button onClick={() => removeItem(item.name)} className="text-kg-green-p/20 hover:text-red-400 p-1">❌</button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {cart.length > 0 && (
        <div className="border-t border-kg-green/15 pt-6 pb-2">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="text-[10px] text-kg-green-p/40 font-en tracking-widest uppercase">ยอดรวมทั้งหมด</div>
              <div className="font-en text-4xl font-extrabold text-kg-gold-l italic">฿{total}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-kg-green-p/30 font-en uppercase tracking-tighter mb-1">Payment Method</div>
              <div className="px-2.5 py-1 bg-kg-green-l/10 border border-kg-green-l/25 rounded-full text-[10px] font-bold text-kg-green-l">📱 QR PromptPay</div>
            </div>
          </div>
          
          <button 
            onClick={handleCheckout}
            className="w-full py-4 bg-kg-green text-white font-bold rounded-xl text-lg shadow-[0_8px_32px_rgba(0,102,51,0.25)] hover:bg-kg-green-l transition-all active:scale-[0.98]"
          >
            ยืนยันการสั่งอาหาร 🚀
          </button>
          <div className="text-center text-[9px] text-kg-green-p/20 mt-4 uppercase tracking-[0.2em]">Transaction secured by KU Gateway</div>
        </div>
      )}
    </div>
  );
};

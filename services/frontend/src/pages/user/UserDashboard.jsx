import React from 'react';
import { motion } from 'framer-motion';

export const UserDashboard = ({ cart, setCart, stallOrders }) => {
  const addToCart = (name, price, emoji) => {
    setCart(prev => {
      const existing = prev.find(item => item.name === name);
      if (existing) {
        return prev.map(item => item.name === name ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { name, price, emoji, qty: 1 }];
    });
  };

  const quickOrders = [
    { name: 'ข้าวมันไก่', price: 55, emoji: '🍗' },
    { name: 'ก๋วยเตี๋ยวเรือ', price: 40, emoji: '🍜' },
    { name: 'ข้าวแกงกะหรี่', price: 60, emoji: '🍛' },
    { name: 'ต้มยำกุ้ง', price: 80, emoji: '🦐' }
  ];

  return (
    <div className="flex flex-col h-full bg-kg-dark text-kg-green-p font-th">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-kg-green-d to-kg-green/30 border border-kg-green/25 rounded-2xl p-6 mb-5 group">
        <div className="absolute right-0 top-0 text-[80px] opacity-[0.05] leading-none select-none group-hover:scale-110 transition-transform">🌿</div>
        <p className="text-sm text-kg-green-l/80 mb-1 font-en font-bold uppercase tracking-widest">สวัสดี 👋</p>
        <h2 className="text-2xl font-bold mb-3 italic">ด.ช.เกษตร สุขสงบ</h2>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-kg-green-l/15 text-kg-green-l border border-kg-green-l/25 font-en tracking-wider uppercase">🏫 คณะเกษตร</span>
      </div>

      {/* Quick Order */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-4 px-1">
          <div>
            <div className="font-en font-extrabold text-xl leading-none">สั่งอาหารด่วน</div>
            <div className="text-[10px] text-kg-green-p/40 font-en tracking-[0.2em] uppercase mt-1">Popular Picks</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {quickOrders.map((food, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(food.name, food.price, food.emoji)}
              className="bg-kg-card border border-kg-green/20 rounded-2xl p-4 cursor-pointer hover:border-kg-green-l/40 transition-all shadow-xl"
            >
              <div className="text-4xl text-center mb-3">{food.emoji}</div>
              <div className="font-bold text-sm mb-1">{food.name}</div>
              <div className="font-en font-extrabold text-kg-green-l text-sm mb-3">฿{food.price}</div>
              <button className="w-full py-2 text-[10px] bg-kg-green text-white rounded-xl font-bold uppercase tracking-widest hover:bg-kg-green-l transition-all">+ เพิ่มลงตะกร้า</button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 pb-6">
        <div className="bg-kg-card border border-kg-green/20 rounded-2xl p-4 shadow-xl">
          <div className="text-[10px] font-en tracking-widest uppercase text-kg-green-p/40 mb-2">ออเดอร์วันนี้</div>
          <div className="font-en text-4xl font-extrabold text-kg-green-l leading-none">3</div>
          <div className="text-[10px] text-kg-green-l/60 mt-2 font-en font-medium italic">↑ 1 จากเมื่อวาน</div>
        </div>
        <div className="bg-kg-card border border-kg-green/20 rounded-2xl p-4 shadow-xl">
          <div className="text-[10px] font-en tracking-widest uppercase text-kg-green-p/40 mb-2">คิวของคุณ</div>
          <div className="font-en text-4xl font-extrabold text-kg-gold-l leading-none italic">Q-07</div>
          <div className="text-[10px] text-kg-green-p/40 mt-2 font-en font-medium">รอประมาณ ~4 นาที</div>
        </div>
      </div>
    </div>
  );
};

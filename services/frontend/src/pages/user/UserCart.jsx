import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { ShoppingBag, X, Plus, Minus, CreditCard, ArrowRight } from 'lucide-react';

export const UserCart = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex flex-col gap-6 h-full min-h-[500px]"
    >
      <header className="mb-2">
        <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-2">ตะกร้าของฉัน</h1>
        <p className="text-gray-500 font-medium text-xs uppercase tracking-widest leading-none">Review and Checkout</p>
      </header>

      <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px] hide-scrollbar">
        {[1].map((i) => (
          <GlassCard key={i} className="flex flex-col gap-4 p-5 border-white/5 relative group">
            <button className="absolute top-4 right-4 p-1.5 bg-black/20 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
            
            <div className="flex gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl border border-white/5">
                🍗
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="font-bold text-white text-lg tracking-tight uppercase leading-none">ข้าวมันไก่ผสม (พิเศษ)</h3>
                <div className="flex items-center gap-2 mt-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  <ShoppingBag size={12} className="text-blue-500" /> ข้าวมันไก่เจ๊สม
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <div className="flex items-center gap-4 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                <button className="text-gray-500 hover:text-white transition-colors"><Minus size={16} /></button>
                <span className="text-sm font-black text-white w-4 text-center">1</span>
                <button className="text-blue-500 hover:text-blue-400 transition-colors"><Plus size={16} /></button>
              </div>
              <div className="text-2xl font-black text-white tracking-tighter">
                ฿50
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
      
      {/* Checkout Summary Container */}
      <div className="mt-auto pt-6 border-t border-white/5 bg-gradient-to-t from-[#141624] to-transparent -mx-5 px-5">
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Amount</span>
            <span className="text-3xl font-black text-white tracking-tighter">฿50</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">PromptPay Active</span>
             <span className="text-gray-600 text-[9px] font-bold">+ VAT 7% Included</span>
          </div>
        </div>

        <Button className="w-full py-5 text-base font-black shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-700 border-none group">
          <CreditCard size={20} />
          ชำระเงินตอนนี้
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Button>
        <p className="text-center text-[9px] mt-4 text-gray-600 font-bold uppercase tracking-widest">Secure payment via University Gateway</p>
      </div>
    </motion.div>
  );
};

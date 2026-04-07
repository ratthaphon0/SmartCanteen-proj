import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../../stores/cartStore';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');

export const UserCart = ({ setStallOrders }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  const items = useCartStore(s => s.items);
  const updateQuantity = useCartStore(s => s.updateQuantity);
  const removeItem = useCartStore(s => s.removeItem);
  const clearCart = useCartStore(s => s.clearCart);
  const getTotal = useCartStore(s => s.getTotal);
  const getItemsByShop = useCartStore(s => s.getItemsByShop);
  const getShopSubtotal = useCartStore(s => s.getShopSubtotal);
  const getShopCount = useCartStore(s => s.getShopCount);
  const getItemCount = useCartStore(s => s.getItemCount);

  const shopGroups = getItemsByShop();
  const grandTotal = getTotal();
  const shopCount = getShopCount();
  const itemCount = getItemCount();

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setIsSubmitting(true);

    const shopIds = Object.keys(shopGroups);
    const orders = [];

    for (const shopId of shopIds) {
      const group = shopGroups[shopId];
      const orderData = {
        user_id: 'USR-001',
        stall_id: shopId,
        items: group.items.map(item => ({
          menu_id: item.menu_id,
          name: item.name,
          qty: item.qty,
          price: item.price,
        })),
        priority: 'walk-in',
      };

      try {
        // Attempt real API call
        const res = await fetch(`${API_URL}/api/orders/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        if (res.ok) {
          const order = await res.json();
          orders.push({
            ...order,
            shopName: group.shopName,
            shopIcon: group.shopIcon,
            items: group.items,
          });
          continue;
        }
        throw new Error('API returned non-ok');
      } catch (err) {
        // Fallback: create mock order for demo mode
        if (import.meta.env.DEV) console.warn(`[Demo Mode] API unavailable for ${shopId}:`, err.message);
        setDemoMode(true);

        const mockOrder = {
          id: `ORD-${Date.now().toString().slice(-4)}-${shopId.slice(-2)}`,
          order_id: `ORD-${Date.now().toString().slice(-4)}-${shopId.slice(-2)}`,
          shopId: shopId,
          shopName: group.shopName,
          shopIcon: group.shopIcon,
          items: group.items.map(i => ({ ...i })),
          total: group.items.reduce((s, i) => s + i.price * i.qty, 0),
          status: 'pending',
          queue_token: `Q-${String(Math.floor(Math.random() * 99) + 1).padStart(2, '0')}`,
          timestamp: new Date().toISOString(),
        };
        orders.push(mockOrder);
      }
    }

    // Persist orders to sessionStorage for queue page
    const existingOrders = JSON.parse(sessionStorage.getItem('sc_orders') || '[]');
    sessionStorage.setItem('sc_orders', JSON.stringify([...orders, ...existingOrders]));

    // Also push to stallOrders for backward compat
    if (setStallOrders) {
      for (const order of orders) {
        setStallOrders(prev => [order, ...prev]);
      }
    }

    clearCart();
    setIsSubmitting(false);
    navigate('/user/queue');
  };

  return (
    <div className="flex flex-col h-full bg-kg-dark text-kg-green-p font-th">
      {/* ═══ Header ═══ */}
      <div className="flex justify-between items-end mb-6 px-1">
        <div>
          <div className="font-en font-extrabold text-2xl leading-none italic">ตะกร้าของคุณ</div>
          <div className="text-[10px] text-kg-green-p/40 font-en tracking-[0.2em] uppercase mt-1">
            {shopCount > 0 ? `${shopCount} ร้าน · ${itemCount} รายการ` : 'Review Items'}
          </div>
        </div>
        {demoMode && (
          <span className="text-[9px] bg-kg-gold/15 text-kg-gold px-2 py-1 rounded-full font-en font-bold animate-pulse">
            Demo Mode
          </span>
        )}
      </div>

      {/* ═══ Cart Content ═══ */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-6">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-kg-card border border-dashed border-kg-green/20 rounded-2xl p-10 text-center flex flex-col items-center gap-4"
            >
              <div className="text-5xl opacity-20 italic">🛒</div>
              <div className="text-sm font-bold text-kg-green-p/30 uppercase tracking-widest font-en">ตะกร้าว่างเปล่า</div>
              <div className="text-[10px] text-kg-green-p/20 font-en">เลือกเมนูจากหน้าแรก</div>
            </motion.div>
          ) : (
            Object.entries(shopGroups).map(([shopId, group], groupIdx) => (
              <motion.div
                key={shopId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: groupIdx * 0.1 }}
              >
                {/* Shop Section Header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-kg-card border border-kg-green/25 text-kg-green-l">
                    <span className="text-sm">{group.shopIcon}</span>
                    {group.shopName}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {group.items.map(item => (
                    <motion.div
                      key={item.menu_id}
                      layout
                      className="bg-kg-card border border-kg-green/15 rounded-2xl p-4 flex items-center gap-3 group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-kg-surface border border-kg-green/10 flex items-center justify-center text-2xl shrink-0">
                        {item.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm mb-0.5 truncate">{item.name}</div>
                        <div className="font-en font-extrabold text-kg-green-l text-xs italic">฿{item.price * item.qty}</div>
                      </div>
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-kg-surface border border-kg-green/10 rounded-xl p-1">
                        <button
                          onClick={() => {
                            if (item.qty <= 1) removeItem(item.menu_id);
                            else updateQuantity(item.menu_id, item.qty - 1);
                          }}
                          className="w-7 h-7 flex items-center justify-center text-sm hover:bg-kg-green/20 rounded-lg transition-colors font-bold text-kg-green-p/60"
                        >
                          −
                        </button>
                        <span className="w-5 text-center font-en font-bold text-xs">{item.qty}</span>
                        <button
                          onClick={() => updateQuantity(item.menu_id, item.qty + 1)}
                          className="w-7 h-7 flex items-center justify-center text-sm hover:bg-kg-green/20 rounded-lg transition-colors font-bold text-kg-green-l"
                        >
                          +
                        </button>
                      </div>
                      <div className="font-en font-extrabold text-xs text-kg-green-p/50 w-12 text-right">฿{item.price}</div>
                    </motion.div>
                  ))}
                </div>

                {/* Per-shop Subtotal */}
                <div className="flex justify-between items-center px-3 mt-2 text-[11px]">
                  <span className="text-kg-green-p/40">รวมร้านนี้</span>
                  <span className="font-en font-bold text-kg-green-l">฿{getShopSubtotal(shopId)}</span>
                </div>

                {/* Divider (between shops, not after last) */}
                {groupIdx < Object.keys(shopGroups).length - 1 && (
                  <div className="h-px bg-kg-green/10 mt-4 mb-1"></div>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ═══ Grand Total & Checkout ═══ */}
      {items.length > 0 && (
        <div className="border-t border-kg-green/15 pt-5 pb-2">
          <div className="flex justify-between items-center mb-5 px-1">
            <div>
              <div className="text-[10px] text-kg-green-p/40 font-en tracking-widest uppercase">ยอดรวมทั้งหมด</div>
              <div className="font-en text-4xl font-extrabold text-kg-gold-l italic">฿{grandTotal}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-kg-green-p/30 font-en uppercase tracking-tighter mb-1">Payment Method</div>
              <div className="px-2.5 py-1 bg-kg-green-l/10 border border-kg-green-l/25 rounded-full text-[10px] font-bold text-kg-green-l">📱 QR PromptPay</div>
            </div>
          </div>

          <motion.button
            onClick={handleCheckout}
            disabled={isSubmitting}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-4 font-bold rounded-xl text-lg shadow-[0_8px_32px_rgba(0,102,51,0.25)] transition-all active:scale-[0.98] ${
              isSubmitting
                ? 'bg-kg-green/50 text-white/50 cursor-wait'
                : 'bg-kg-green text-white hover:bg-kg-green-l'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                กำลังส่งคำสั่ง...
              </span>
            ) : (
              `ยืนยันสั่งอาหาร → ฿${grandTotal}`
            )}
          </motion.button>
          <div className="text-center text-[9px] text-kg-green-p/20 mt-3 uppercase tracking-[0.2em] font-en">
            {shopCount > 1 ? `จะสร้าง ${shopCount} ออเดอร์แยกตามร้าน` : 'Transaction secured by KU Gateway'}
          </div>
        </div>
      )}
    </div>
  );
};

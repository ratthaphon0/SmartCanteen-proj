import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useCartStore from '../../stores/cartStore';
import QueueDensityBadge from '../../components/QueueDensityBadge';
import { useEffect } from 'react';

// ─── Shop & Menu Data ────────────────────────────
// avgTimePerDish = เวลาเฉลี่ยต่อจาน (นาที)
// queueCount    = จำนวนจานที่มีในคิวตอนนี้
const SHOPS = [
  { shopId: 'SHOP-01', name: 'ร้านอาหารตามสั่ง', shortName: 'ตามสั่ง', icon: '🍳', avgTimePerDish: 3, queueCount: 2 },
  { shopId: 'SHOP-02', name: 'ร้านก๋วยเตี๋ยว', shortName: 'ก๋วยเตี๋ยว', icon: '🍜', avgTimePerDish: 5, queueCount: 4 },
  { shopId: 'SHOP-03', name: 'ร้านข้าวราดแกง', shortName: 'ราดแกง', icon: '🍛', avgTimePerDish: 2, queueCount: 1 },
];

const MENU_ITEMS = [
  // ── ร้าน 1: อาหารตามสั่ง ──
  { menu_id: 'TS-01', shopId: 'SHOP-01', name: 'ข้าวมันไก่', price: 55, emoji: '🍗', calories: 550 },
  { menu_id: 'TS-02', shopId: 'SHOP-01', name: 'ผัดกะเพราไข่ดาว', price: 50, emoji: '🦐', calories: 480 },
  { menu_id: 'TS-03', shopId: 'SHOP-01', name: 'ข้าวไข่เจียว', price: 45, emoji: '🥚', calories: 420 },
  { menu_id: 'TS-04', shopId: 'SHOP-01', name: 'ข้าวหมูแดง', price: 55, emoji: '🥩', calories: 520 },
  // ── ร้าน 2: ก๋วยเตี๋ยว ──
  { menu_id: 'KT-01', shopId: 'SHOP-02', name: 'ก๋วยเตี๋ยวเรือ', price: 40, emoji: '🍜', calories: 400 },
  { menu_id: 'KT-02', shopId: 'SHOP-02', name: 'บะหมี่แห้ง', price: 35, emoji: '🍝', calories: 380 },
  { menu_id: 'KT-03', shopId: 'SHOP-02', name: 'ต้มยำก๋วยเตี๋ยว', price: 45, emoji: '🍲', calories: 350 },
  // ── ร้าน 3: ข้าวราดแกง ──
  { menu_id: 'KG-01', shopId: 'SHOP-03', name: 'ข้าวแกงเขียวหวาน', price: 45, emoji: '🍛', calories: 520 },
  { menu_id: 'KG-02', shopId: 'SHOP-03', name: 'ข้าวแกงมัสมั่น', price: 50, emoji: '🥘', calories: 580 },
  { menu_id: 'KG-03', shopId: 'SHOP-03', name: 'ข้าวแกงพะแนง', price: 55, emoji: '🫕', calories: 540 },
];

// ─── Helper: calculate wait time per shop ────────
function getShopWaitTime(shop) {
  return shop.avgTimePerDish * shop.queueCount; // minutes
}

// ─── Fastest Shop + Menu Recommendation ──────────
function getFastestRecommendation() {
  // Sort shops by estimated wait time (ascending)
  const sorted = [...SHOPS].sort((a, b) => getShopWaitTime(a) - getShopWaitTime(b));
  const fastestShop = sorted[0];
  if (!fastestShop) return null;

  // Pick cheapest item from the fastest shop as recommendation
  const shopMenu = MENU_ITEMS.filter(i => i.shopId === fastestShop.shopId);
  if (shopMenu.length === 0) return null;

  const cheapest = shopMenu.reduce((a, b) => a.price <= b.price ? a : b);
  return {
    shop: fastestShop,
    menu: cheapest,
    waitMinutes: getShopWaitTime(fastestShop),
  };
}

export const UserDashboard = ({ cart, setCart, stallOrders }) => {
  const [selectedShopId, setSelectedShopId] = useState(SHOPS[0].shopId);
  const addItem = useCartStore(s => s.addItem);
  const cartItems = useCartStore(s => s.items);

  const selectedShop = SHOPS.find(s => s.shopId === selectedShopId);
  const filteredMenu = useMemo(
    () => MENU_ITEMS.filter(item => item.shopId === selectedShopId),
    [selectedShopId]
  );

  const fastestRec = useMemo(() => getFastestRecommendation(), []);

  const handleAddToCart = (item, shop) => {
    const targetShop = shop || selectedShop;
    addItem({
      ...item,
      shopName: targetShop?.name,
      shopIcon: targetShop?.icon,
    });
  };

  const isInCart = (menuId) => cartItems.some(i => i.menu_id === menuId);

  // Stats
  const ordersToday = stallOrders?.length || 3;

  return (
    <div className="flex flex-col h-full bg-kg-dark text-kg-green-p font-th">
      {/* ═══ Profile & Gamification Hero ═══ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-kg-green-d to-kg-green/30 border border-kg-green/25 rounded-2xl p-6 mb-5 group">
        <div className="absolute right-0 top-0 text-[80px] opacity-[0.05] leading-none select-none group-hover:scale-110 transition-transform">🌿</div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-kg-green-l/80 mb-1 font-en font-bold uppercase tracking-widest">สวัสดี 👋</p>
            <h2 className="text-2xl font-bold mb-3 italic">ด.ช.เกษตร สุขสงบ</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-kg-green-l/15 text-kg-green-l border border-kg-green-l/25 font-en tracking-wider uppercase">🏫 คณะเกษตร</span>
          </div>
          <div className="text-right">
            <div className="inline-flex flex-col items-center justify-center bg-kg-card/80 border border-kg-gold/30 rounded-2xl p-3 shadow-[0_8px_24px_rgba(201,176,55,0.15)] backdrop-blur-md">
              <span className="text-[9px] font-en uppercase tracking-widest text-kg-gold mb-1">KU Rewards</span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">🌟</span>
                <span className="font-en font-black text-2xl text-white italic leading-none">450</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Fastest Shop Recommendation ═══ */}
      {fastestRec && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 bg-gradient-to-r from-kg-green-l/10 via-kg-gold/8 to-kg-green/10 border border-kg-green-l/30 rounded-2xl p-4 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-kg-green-l/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-en font-black text-kg-green-l uppercase tracking-[0.15em] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-kg-green-l animate-pulse"></span>
              ⚡ Smart Routing (เร็วที่สุด)
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-kg-gold/15 border border-kg-gold/30 text-kg-gold px-2 py-0.5 rounded-full font-en font-bold animate-pulse">รับคะแนน ×2</span>
              <span className="text-[9px] bg-kg-green-l/15 text-kg-green-l px-2 py-0.5 rounded-full font-en font-bold">~{fastestRec.waitMinutes} นาที</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-kg-card/80 border border-kg-green-l/20 flex items-center justify-center text-2xl shrink-0">{fastestRec.menu.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm mb-0.5 truncate">{fastestRec.menu.name}</div>
              <div className="flex items-center gap-2 text-[10px] text-kg-green-p/50 font-en">
                <span className="font-extrabold text-kg-green-l">฿{fastestRec.menu.price}</span>
                <span>·</span>
                <span>{fastestRec.shop.icon} {fastestRec.shop.shortName}</span>
                <span>·</span>
                <span>คิว {fastestRec.shop.queueCount} จาน</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedShopId(fastestRec.shop.shopId);
                handleAddToCart(fastestRec.menu, fastestRec.shop);
              }}
              className="px-3 py-2 bg-kg-green-l text-white text-[10px] font-bold rounded-xl uppercase tracking-wider shrink-0 shadow-[0_4px_12px_rgba(0,166,81,0.3)]"
            >
              + สั่งเลย
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* ═══ ESG Zero Food Waste (Happy Hour) ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-gradient-to-r from-[#003D6A]/20 to-transparent border border-[#003D6A]/30 rounded-2xl p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-en font-black text-[#00a8ff] uppercase tracking-[0.15em] flex items-center gap-1.5">
            🌱 Zero Food Waste
          </span>
          <span className="text-[9px] bg-[#00a8ff]/15 text-[#00a8ff] px-2 py-0.5 rounded-full font-en font-bold">Clearance -50%</span>
        </div>
        <div className="flex items-center gap-3 bg-kg-card/40 p-2 rounded-xl border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-kg-surface flex items-center justify-center text-xl shrink-0 opacity-80">🍜</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs mb-0.5 truncate">บะหมี่แห้ง (หมูแดง)</div>
            <div className="flex items-center gap-2 text-[9px] text-kg-green-p/50 font-en">
              <span className="line-through">฿35</span>
              <span className="font-extrabold text-[#00a8ff] text-[11px]">฿17</span>
              <span>· ร้านก๋วยเตี๋ยว</span>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Dummy logic for mockup
              alert('เพิ่มสินค้า Clearance ลงตะกร้าแล้ว (Mockup)');
            }}
            className="px-3 py-1.5 bg-[#003D6A] text-white text-[9px] font-bold rounded-lg uppercase tracking-wider shrink-0 border border-[#00a8ff]/30"
          >
            + สั่งเลย
          </motion.button>
        </div>
      </motion.div>

      {/* ═══ Shop Tab Bar ═══ */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="w-1 h-4 rounded-full bg-kg-green-l"></div>
          <span className="text-xs font-bold text-kg-green-p/60">เลือกร้าน</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {SHOPS.map(shop => {
            const isActive = shop.shopId === selectedShopId;
            const waitTime = getShopWaitTime(shop);
            // Mock density for demo
            const density = shop.queueCount > 3 ? 'High' : (shop.queueCount > 1 ? 'Medium' : 'Low');
            return (
              <motion.button
                key={shop.shopId}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedShopId(shop.shopId)}
                className={`flex flex-col items-start gap-1.5 p-4 rounded-3xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-kg-green text-white border-kg-green-l/40 shadow-[0_4px_16px_rgba(0,102,51,0.3)]'
                    : 'bg-kg-card text-kg-green-p/50 border-kg-green/15 hover:border-kg-green/40 hover:text-kg-green-p/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{shop.icon}</span>
                  <span>{shop.shortName}</span>
                </div>
                <div className="flex flex-col items-start gap-2 mt-1">
                  <QueueDensityBadge density={density} />
                  <span className={`text-[9px] font-en ${
                    isActive ? 'text-white/70' : 'text-kg-green-p/40'
                  }`}>~{waitTime} นาที</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ═══ Menu Grid ═══ */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-4 px-1">
          <div>
            <div className="font-en font-extrabold text-xl leading-none">{selectedShop?.icon} {selectedShop?.name}</div>
            <div className="text-[10px] text-kg-green-p/40 font-en tracking-[0.2em] uppercase mt-1">
              {filteredMenu.length} items · รอ ~{selectedShop ? getShopWaitTime(selectedShop) : 0} นาที ({selectedShop?.queueCount} คิว × {selectedShop?.avgTimePerDish} นาที/จาน)
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedShopId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-3"
          >
            {filteredMenu.map((food, i) => {
              const inCart = isInCart(food.menu_id);
              return (
                <motion.div
                  key={food.menu_id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddToCart(food, selectedShop)}
                  className={`bg-kg-card border rounded-2xl p-4 cursor-pointer transition-all shadow-xl ${
                    inCart
                      ? 'border-kg-green-l/40 ring-1 ring-kg-green-l/20'
                      : 'border-kg-green/20 hover:border-kg-green-l/40'
                  }`}
                >
                  <div className="text-4xl text-center mb-3">{food.emoji}</div>
                  <div className="font-bold text-sm mb-1">{food.name}</div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-en font-extrabold text-kg-green-l text-sm">฿{food.price}</div>
                    <div className="text-[9px] text-kg-green-p/30 font-en">{food.calories} kcal</div>
                  </div>
                  <button className={`w-full py-2 text-[10px] rounded-xl font-bold uppercase tracking-widest transition-all ${
                    inCart
                      ? 'bg-kg-green-l/20 text-kg-green-l border border-kg-green-l/30'
                      : 'bg-kg-green text-white hover:bg-kg-green-l'
                  }`}>
                    {inCart ? '✓ อยู่ในตะกร้า' : '+ เพิ่มลงตะกร้า'}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ═══ Stats Row ═══ */}
      <div className="pb-6">
        <div className="bg-kg-card border border-kg-green/20 rounded-2xl p-4 shadow-xl">
          <div className="text-[10px] font-en tracking-widest uppercase text-kg-green-p/40 mb-2">รายการวันนี้</div>
          <div className="font-en text-4xl font-extrabold text-kg-green-l leading-none">{ordersToday}</div>
          <div className="text-[10px] text-kg-green-l/60 mt-2 font-en font-medium italic">↑ 1 จากเมื่อวาน</div>
        </div>
      </div>
    </div>
  );
};

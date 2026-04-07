import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items: [],

  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.menu_id === item.menu_id)
    if (existing) {
      return {
        items: state.items.map(i =>
          i.menu_id === item.menu_id ? { ...i, qty: i.qty + 1 } : i
        )
      }
    }
    return {
      items: [...state.items, {
        ...item,
        qty: 1,
        shopId: item.shopId || null,
        shopName: item.shopName || '',
        shopIcon: item.shopIcon || '',
      }]
    }
  }),

  removeItem: (menuId) => set((state) => ({
    items: state.items.filter(i => i.menu_id !== menuId)
  })),

  updateQuantity: (menuId, qty) => set((state) => ({
    items: state.items.map(i =>
      i.menu_id === menuId ? { ...i, qty: Math.max(0, qty) } : i
    ).filter(i => i.qty > 0)
  })),

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.qty, 0)
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.qty, 0)
  },

  // ─── Multi-shop helpers ───────────────────────
  getShopIds: () => {
    const ids = [...new Set(get().items.map(i => i.shopId).filter(Boolean))]
    return ids
  },

  getItemsByShop: () => {
    const items = get().items
    const grouped = {}
    items.forEach(item => {
      const key = item.shopId || '_unknown'
      if (!grouped[key]) {
        grouped[key] = {
          shopId: item.shopId,
          shopName: item.shopName || 'ไม่ทราบร้าน',
          shopIcon: item.shopIcon || '🏪',
          items: [],
        }
      }
      grouped[key].items.push(item)
    })
    return grouped
  },

  getShopSubtotal: (shopId) => {
    return get().items
      .filter(i => i.shopId === shopId)
      .reduce((sum, i) => sum + i.price * i.qty, 0)
  },

  getShopCount: () => {
    return new Set(get().items.map(i => i.shopId).filter(Boolean)).size
  },
}))

export default useCartStore
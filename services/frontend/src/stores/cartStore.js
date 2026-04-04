import { create } from 'zustand'

const useCartStore = create((set, get) => ({
  items: [],
  selectedStall: null,

  addItem: (item) => set((state) => {
    const existing = state.items.find(i => i.menu_id === item.menu_id)
    if (existing) {
      return {
        items: state.items.map(i =>
          i.menu_id === item.menu_id ? { ...i, qty: i.qty + 1 } : i
        )
      }
    }
    return { items: [...state.items, { ...item, qty: 1 }] }
  }),

  removeItem: (menuId) => set((state) => ({
    items: state.items.filter(i => i.menu_id !== menuId)
  })),

  updateQuantity: (menuId, qty) => set((state) => ({
    items: state.items.map(i =>
      i.menu_id === menuId ? { ...i, qty: Math.max(0, qty) } : i
    ).filter(i => i.qty > 0)
  })),

  clearCart: () => set({ items: [], selectedStall: null }),

  setSelectedStall: (stall) => set({ selectedStall: stall }),

  getTotal: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.qty, 0)
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.qty, 0)
  }
}))

export default useCartStore
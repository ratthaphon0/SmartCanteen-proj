import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

function UserApp() {
  const [stalls, setStalls] = useState([])
  const [selectedStall, setSelectedStall] = useState(null)
  const [menu, setMenu] = useState([])
  const [cart, setCart] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [activeTab, setActiveTab] = useState('menu') // menu | cart | orders

  // Demo user
  const userId = 'USR-001'

  useEffect(() => {
    fetchStalls()
    fetchMyOrders()
  }, [])

  const fetchStalls = async () => {
    try {
      const res = await fetch(`${API_URL}/api/stalls/`)
      if (res.ok) setStalls(await res.json())
    } catch {
      setStalls(DEMO_STALLS)
    }
  }

  const fetchMenu = async (stallId) => {
    try {
      const res = await fetch(`${API_URL}/api/stalls/${stallId}/menu`)
      if (res.ok) setMenu(await res.json())
    } catch {
      setMenu(DEMO_MENU.filter(m => m.stall_id === stallId))
    }
  }

  const fetchMyOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/?user_id=${userId}&limit=10`)
      if (res.ok) setMyOrders(await res.json())
    } catch {
      setMyOrders(DEMO_ORDERS)
    }
  }

  const selectStall = (stall) => {
    setSelectedStall(stall)
    fetchMenu(stall.stall_id)
  }

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.menu_id === item.menu_id)
      if (existing) {
        return prev.map(c =>
          c.menu_id === item.menu_id ? { ...c, qty: c.qty + 1 } : c
        )
      }
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const removeFromCart = (menuId) => {
    setCart(prev => prev.filter(c => c.menu_id !== menuId))
  }

  const placeOrder = async () => {
    if (!selectedStall || cart.length === 0) return

    const orderData = {
      user_id: userId,
      stall_id: selectedStall.stall_id,
      items: cart.map(c => ({
        menu_id: c.menu_id,
        name: c.name,
        qty: c.qty,
        price: c.price,
      })),
      priority: 'walk-in',
    }

    try {
      const res = await fetch(`${API_URL}/api/orders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })
      if (res.ok) {
        const order = await res.json()
        alert(`สั่งอาหารสำเร็จ! 🎉\nคิว: ${order.queue_token}`)
        setCart([])
        fetchMyOrders()
        setActiveTab('orders')
      }
    } catch {
      alert('Demo mode — order would be placed here')
      setCart([])
    }
  }

  const totalPrice = cart.reduce((sum, c) => sum + c.price * c.qty, 0)

  return (
    <div className="user-app">
      <div className="page-header">
        <h1 className="page-title">🛒 สั่งอาหาร</h1>
        <p className="page-subtitle">เลือกร้าน → เลือกเมนู → สั่งเลย!</p>
      </div>

      {/* Tab Switcher */}
      <div className="tab-switcher">
        {['menu', 'cart', 'orders'].map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'menu' && '🍜 เมนู'}
            {tab === 'cart' && `🛒 ตะกร้า (${cart.length})`}
            {tab === 'orders' && '📋 คำสั่งซื้อ'}
          </button>
        ))}
      </div>

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div className="menu-section">
          {/* Stall Selector */}
          <div className="stall-list">
            {(stalls.length > 0 ? stalls : DEMO_STALLS).map(stall => (
              <button
                key={stall.stall_id}
                className={`stall-chip ${selectedStall?.stall_id === stall.stall_id ? 'active' : ''}`}
                onClick={() => selectStall(stall)}
              >
                {stall.name}
                {stall.avg_rating > 0 && <span className="stall-rating">⭐ {stall.avg_rating}</span>}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="menu-grid">
            {(menu.length > 0 ? menu : DEMO_MENU).map(item => (
              <div key={item.menu_id} className="menu-card">
                <div className="menu-info">
                  <span className="menu-name">{item.name}</span>
                  <span className="menu-price">฿{item.price}</span>
                  {item.calories && (
                    <span className="menu-cal">{item.calories} kcal</span>
                  )}
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>
                  + เพิ่ม
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cart Tab */}
      {activeTab === 'cart' && (
        <div className="cart-section">
          {cart.length === 0 ? (
            <div className="empty-state">
              <p>🛒 ตะกร้าว่าง — เลือกเมนูจากแท็บเมนูได้เลย!</p>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.menu_id} className="cart-item card">
                  <div className="cart-item-info">
                    <span className="cart-name">{item.name}</span>
                    <span className="cart-qty">x{item.qty}</span>
                    <span className="cart-price">฿{item.price * item.qty}</span>
                  </div>
                  <button className="btn btn-sm" onClick={() => removeFromCart(item.menu_id)}>
                    ✕
                  </button>
                </div>
              ))}
              <div className="cart-total card">
                <span>รวมทั้งหมด</span>
                <span className="total-price">฿{totalPrice}</span>
              </div>
              <button className="btn btn-primary btn-lg" onClick={placeOrder}>
                🛒 สั่งเลย — ฿{totalPrice}
              </button>
            </>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="orders-section">
          {(myOrders.length > 0 ? myOrders : DEMO_ORDERS).map(order => (
            <div key={order.order_id} className="order-card card">
              <div className="order-header">
                <span className="order-id">{order.order_id}</span>
                <span className={`badge badge-${order.status}`}>{order.status}</span>
              </div>
              <div className="order-details">
                <span>คิว: {order.queue_token}</span>
                <span>ร้าน: {order.stall_id}</span>
                <span>฿{order.total_price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Demo data
const DEMO_STALLS = [
  { stall_id: 'STALL-01', name: 'ร้านข้าวแกง', avg_rating: 4.5 },
  { stall_id: 'STALL-02', name: 'ร้านก๋วยเตี๋ยว', avg_rating: 4.2 },
  { stall_id: 'STALL-03', name: 'ร้านข้าวผัด', avg_rating: 4.8 },
]

const DEMO_MENU = [
  { menu_id: 'M01', stall_id: 'STALL-01', name: 'ข้าวแกงเขียวหวาน', price: 45, calories: 520, is_available: true },
  { menu_id: 'M02', stall_id: 'STALL-01', name: 'ข้าวผัดกะเพรา', price: 40, calories: 480, is_available: true },
  { menu_id: 'M03', stall_id: 'STALL-01', name: 'ข้าวมันไก่', price: 50, calories: 550, is_available: true },
  { menu_id: 'M04', stall_id: 'STALL-02', name: 'ก๋วยเตี๋ยวเรือ', price: 45, calories: 400, is_available: true },
  { menu_id: 'M05', stall_id: 'STALL-02', name: 'บะหมี่แห้ง', price: 40, calories: 380, is_available: true },
  { menu_id: 'M06', stall_id: 'STALL-03', name: 'ข้าวผัดปู', price: 60, calories: 500, is_available: true },
]

const DEMO_ORDERS = [
  { order_id: 'ORD-20250401-0001', queue_token: 'A-001', stall_id: 'STALL-01', status: 'preparing', total_price: 85 },
  { order_id: 'ORD-20250401-0002', queue_token: 'C-012', stall_id: 'STALL-03', status: 'completed', total_price: 60 },
]

export default UserApp

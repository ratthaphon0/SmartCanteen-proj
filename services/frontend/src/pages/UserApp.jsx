import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useAuthStore from '../stores/authStore'
import useCartStore from '../stores/cartStore'

const API_URL = import.meta.env.VITE_API_URL || ''

function WaitTimeCountdown({ initialTime }) {
  const [timeLeft, setTimeLeft] = useState(initialTime * 60) // convert to seconds

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  if (timeLeft <= 0) return <span className="text-green-500">พร้อมรับแล้ว!</span>

  return (
    <span className="text-yellow-500 font-mono">
      {minutes}:{seconds.toString().padStart(2, '0')}
    </span>
  )
}

function UserApp() {
  const { user, isAuthenticated, login, logout, checkAuth } = useAuthStore()
  const { items: cart, selectedStall, addItem, removeItem, clearCart, setSelectedStall, getTotal, getItemCount } = useCartStore()

  const [stalls, setStalls] = useState([])
  const [menu, setMenu] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [activeTab, setActiveTab] = useState('menu') // menu | cart | orders
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    checkAuth()
    if (isAuthenticated) {
      fetchStalls()
      fetchMyOrders()
    }
  }, [isAuthenticated])

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
      const res = await fetch(`${API_URL}/api/orders/?user_id=${user?.id}&limit=10`)
      if (res.ok) setMyOrders(await res.json())
    } catch {
      setMyOrders(DEMO_ORDERS)
    }
  }

  const selectStallHandler = (stall) => {
    setSelectedStall(stall)
    fetchMenu(stall.stall_id)
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const result = await login(loginForm.username, loginForm.password)
    if (!result.success) {
      setLoginError(result.error)
    } else {
      setLoginError('')
    }
  }

  const placeOrder = async () => {
    if (!selectedStall || cart.length === 0) return

    const orderData = {
      user_id: user.id,
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
        clearCart()
        fetchMyOrders()
        setActiveTab('orders')
      }
    } catch {
      alert('Demo mode — order would be placed here')
      clearCart()
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          className="bg-gray-800 p-8 rounded-lg border border-gray-700 w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-center">เข้าสู่ระบบ</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">ชื่อผู้ใช้</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">รหัสผ่าน</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md font-medium transition-colors"
            >
              เข้าสู่ระบบ
            </button>
            <p className="text-center text-sm text-gray-400 mt-4">
              Demo: username: demo, password: demo
            </p>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">🛒 สั่งอาหาร</h1>
          <p className="text-sm text-gray-400">เลือกร้าน → เลือกเมนู → สั่งเลย!</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-medium transition-colors"
        >
          ออกจากระบบ
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        {[
          { key: 'menu', label: '🍜 เมนู', count: null },
          { key: 'cart', label: '🛒 ตะกร้า', count: getItemCount() },
          { key: 'orders', label: '📋 คำสั่งซื้อ', count: null }
        ].map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} {tab.count !== null && tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Menu Tab */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Stall Selector */}
          <div className="flex gap-2 flex-wrap">
            {(stalls.length > 0 ? stalls : DEMO_STALLS).map(stall => (
              <motion.button
                key={stall.stall_id}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedStall?.stall_id === stall.stall_id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => selectStallHandler(stall)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {stall.name}
                {stall.avg_rating > 0 && <span className="ml-2">⭐ {stall.avg_rating}</span>}
              </motion.button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(menu.length > 0 ? menu : DEMO_MENU).map(item => (
              <motion.div
                key={item.menu_id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-400">฿{item.price}</p>
                    {item.calories && (
                      <p className="text-xs text-gray-500">{item.calories} kcal</p>
                    )}
                  </div>
                  <motion.button
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-medium transition-colors"
                    onClick={() => addItem(item)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    + เพิ่ม
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Cart Tab */}
      {activeTab === 'cart' && (
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>🛒 ตะกร้าว่าง — เลือกเมนูจากแท็บเมนูได้เลย!</p>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <motion.div
                  key={item.menu_id}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex justify-between items-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-400">฿{item.price} x {item.qty} = ฿{item.price * item.qty}</p>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-400 text-xl"
                    onClick={() => removeItem(item.menu_id)}
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 flex justify-between items-center">
                <span className="font-semibold">รวมทั้งหมด</span>
                <span className="text-xl font-bold text-green-500">฿{getTotal()}</span>
              </div>
              <motion.button
                className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
                onClick={placeOrder}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                🛒 สั่งเลย — ฿{getTotal()}
              </motion.button>
            </>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {(myOrders.length > 0 ? myOrders : DEMO_ORDERS).map(order => (
            <motion.div
              key={order.order_id}
              className="bg-gray-800 border border-gray-700 rounded-lg p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{order.order_id}</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.status === 'completed' ? 'bg-green-600' :
                  order.status === 'preparing' ? 'bg-yellow-600' : 'bg-gray-600'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <p>คิว: {order.queue_token}</p>
                <p>ร้าน: {order.stall_id}</p>
                <p>฿{order.total_price}</p>
                {order.status === 'preparing' && order.estimated_wait_time > 0 && (
                  <p>เวลารอ: <WaitTimeCountdown initialTime={order.estimated_wait_time} /></p>
                )}
              </div>
            </motion.div>
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
  { order_id: 'ORD-20250401-0001', queue_token: 'A-001', stall_id: 'STALL-01', status: 'preparing', total_price: 85, estimated_wait_time: 15 },
  { order_id: 'ORD-20250401-0002', queue_token: 'C-012', stall_id: 'STALL-03', status: 'completed', total_price: 60, estimated_wait_time: 0 },
]

export default UserApp

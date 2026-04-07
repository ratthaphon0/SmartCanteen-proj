import { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '');

function StallPanel() {
  const [orders, setOrders] = useState([])
  const [queueBoard, setQueueBoard] = useState(null)
  const [selectedStall] = useState('STALL-01') // Default stall

  useEffect(() => {
    fetchOrders()
    fetchQueueBoard()
    // Poll every 5 seconds
    const interval = setInterval(() => {
      fetchOrders()
      fetchQueueBoard()
    }, 5000)
    return () => clearInterval(interval)
  }, [selectedStall])

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/api/orders/?stall_id=${selectedStall}&status=pending`)
      if (res.ok) setOrders(await res.json())
    } catch {
      setOrders(DEMO_STALL_ORDERS)
    }
  }

  const fetchQueueBoard = async () => {
    try {
      const res = await fetch(`${API_URL}/api/queue/board/${selectedStall}`)
      if (res.ok) setQueueBoard(await res.json())
    } catch {
      setQueueBoard(DEMO_QUEUE_BOARD)
    }
  }

  const updateStatus = async (orderId, newStatus) => {
    try {
      await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      fetchOrders()
      fetchQueueBoard()
    } catch {
      alert(`Demo: ${orderId} → ${newStatus}`)
    }
  }

  const board = queueBoard || DEMO_QUEUE_BOARD

  return (
    <div className="stall-panel">
      <div className="page-header">
        <h1 className="page-title">👨‍🍳 Stall Panel — จัดการคำสั่งอาหาร</h1>
        <p className="page-subtitle">รับออร์เดอร์ อัพเดทสถานะ และจัดการคิว</p>
      </div>

      {/* Queue Board */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--accent-amber)' }}>
            {board.total_waiting}
          </span>
          <span className="stat-label">รอคิว</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--accent-blue)' }}>
            {board.now_serving?.length || 0}
          </span>
          <span className="stat-label">กำลังทำ</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--accent-green)' }}>
            {board.ready_pickup?.length || 0}
          </span>
          <span className="stat-label">พร้อมเสิร์ฟ</span>
        </div>
      </div>

      {/* Now Serving Display */}
      {board.now_serving?.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(59,130,246,0.3)' }}>
          <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--accent-blue)' }}>
            🔥 กำลังทำ
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {board.now_serving.map(token => (
              <span key={token} className="badge" style={{
                background: 'rgba(59,130,246,0.15)', color: 'var(--accent-blue)',
                fontSize: 16, padding: '6px 16px'
              }}>
                {token}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Ready for Pickup */}
      {board.ready_pickup?.length > 0 && (
        <div className="card" style={{ marginBottom: '1rem', borderColor: 'rgba(16,185,129,0.3)' }}>
          <h3 style={{ fontSize: 14, marginBottom: 8, color: 'var(--accent-green)' }}>
            ✅ พร้อมเสิร์ฟ — เรียกลูกค้า!
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {board.ready_pickup.map(token => (
              <span key={token} className="badge" style={{
                background: 'rgba(16,185,129,0.15)', color: 'var(--accent-green)',
                fontSize: 18, padding: '8px 20px', fontWeight: 600
              }}>
                {token}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Order Queue */}
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
        📋 รายการออร์เดอร์
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(orders.length > 0 ? orders : DEMO_STALL_ORDERS).map(order => (
          <div key={order.order_id} className="card" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 15 }}>{order.queue_token}</span>
                <span className={`badge badge-${order.status}`}>{order.status}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {order.order_id} · ฿{order.total_price}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {order.status === 'pending' && (
                <button className="btn btn-primary btn-sm"
                  onClick={() => updateStatus(order.order_id, 'preparing')}>
                  🍳 รับออร์เดอร์
                </button>
              )}
              {order.status === 'preparing' && (
                <button className="btn btn-success btn-sm"
                  onClick={() => updateStatus(order.order_id, 'ready')}>
                  ✅ เสร็จแล้ว
                </button>
              )}
              {order.status === 'ready' && (
                <button className="btn btn-sm"
                  onClick={() => updateStatus(order.order_id, 'completed')}>
                  📦 รับอาหารแล้ว
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Demo data
const DEMO_QUEUE_BOARD = {
  stall_id: 'STALL-01',
  now_serving: ['A-038', 'A-039'],
  ready_pickup: ['A-036', 'A-037'],
  next_up: ['A-040', 'A-041', 'A-042'],
  total_waiting: 5,
}

const DEMO_STALL_ORDERS = [
  { order_id: 'ORD-20250401-0038', queue_token: 'A-038', stall_id: 'STALL-01', status: 'preparing', total_price: 85 },
  { order_id: 'ORD-20250401-0039', queue_token: 'A-039', stall_id: 'STALL-01', status: 'preparing', total_price: 45 },
  { order_id: 'ORD-20250401-0040', queue_token: 'A-040', stall_id: 'STALL-01', status: 'pending', total_price: 90 },
  { order_id: 'ORD-20250401-0041', queue_token: 'A-041', stall_id: 'STALL-01', status: 'pending', total_price: 50 },
]

export default StallPanel

import { useState, useEffect, useRef } from 'react'
import './FloorMap.css'

const API_URL = import.meta.env.VITE_API_URL || ''
const WS_URL = import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:8000`

// Seat status colors
const STATUS_COLORS = {
  occupied: '#ef4444',
  reserved: '#f59e0b',
  vacant: '#10b981',
  unknown: '#6b7280',
}

const STATUS_LABELS = {
  occupied: 'ไม่ว่าง',
  reserved: 'จองที่',
  vacant: 'ว่าง',
}

function FloorMap() {
  const [seats, setSeats] = useState([])
  const [stats, setStats] = useState({ occupied: 0, reserved: 0, vacant: 0 })
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const wsRef = useRef(null)

  // WebSocket connection for real-time seat updates
  useEffect(() => {
    const connectWS = () => {
      const ws = new WebSocket(`${WS_URL}/api/seats/ws`)

      ws.onopen = () => {
        setConnected(true)
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.seats) {
          setSeats(data.seats)
          setLastUpdate(new Date().toLocaleTimeString('th-TH'))
          updateStats(data.seats)
        }
      }

      ws.onclose = () => {
        setConnected(false)
        // Reconnect after 3 seconds
        setTimeout(connectWS, 3000)
      }

      ws.onerror = () => {
        ws.close()
      }

      wsRef.current = ws
    }

    // Try WebSocket, fallback to REST polling
    connectWS()

    return () => {
      if (wsRef.current) wsRef.current.close()
    }
  }, [])

  // Fallback: REST polling if no WebSocket
  useEffect(() => {
    if (connected) return

    const fetchSeats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/seats/`)
        if (res.ok) {
          const data = await res.json()
          setSeats(data)
          setLastUpdate(new Date().toLocaleTimeString('th-TH'))
          updateStats(data)
        }
      } catch (err) {
        // API not available — use demo data
        setSeats(DEMO_SEATS)
        updateStats(DEMO_SEATS)
        setLastUpdate('Demo Mode')
      }
    }

    fetchSeats()
    const interval = setInterval(fetchSeats, 5000)
    return () => clearInterval(interval)
  }, [connected])

  const updateStats = (seatList) => {
    const s = { occupied: 0, reserved: 0, vacant: 0 }
    seatList.forEach(seat => {
      s[seat.status] = (s[seat.status] || 0) + 1
    })
    setStats(s)
  }

  // Group seats by table
  const tables = {}
  seats.forEach(seat => {
    if (!tables[seat.table_id]) tables[seat.table_id] = []
    tables[seat.table_id].push(seat)
  })

  return (
    <div className="floor-map-page">
      <div className="page-header">
        <h1 className="page-title">🗺️ Floor Map — Real-time Seat Status</h1>
        <p className="page-subtitle">
          สถานะที่นั่งแบบเรียลไทม์ อัพเดททุก 2 วินาที
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--accent-green)' }}>
            {stats.vacant}
          </span>
          <span className="stat-label">ที่นั่งว่าง</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--accent-red)' }}>
            {stats.occupied}
          </span>
          <span className="stat-label">ไม่ว่าง</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--accent-amber)' }}>
            {stats.reserved}
          </span>
          <span className="stat-label">จองแล้ว</span>
        </div>
        <div className="stat-card">
          <span className="stat-value" style={{ color: 'var(--text-secondary)' }}>
            {connected ? '🟢' : '🔴'}
          </span>
          <span className="stat-label">
            {connected ? 'Connected' : 'Reconnecting...'} · {lastUpdate || '—'}
          </span>
        </div>
      </div>

      {/* Floor Grid */}
      <div className="floor-grid">
        {Object.entries(tables).map(([tableId, tableSeats]) => (
          <div key={tableId} className="table-card">
            <div className="table-header">
              <span className="table-id">{tableId}</span>
              <span className="table-count">
                {tableSeats.filter(s => s.status === 'vacant').length}/{tableSeats.length} ว่าง
              </span>
            </div>
            <div className="seats-row">
              {tableSeats.map(seat => (
                <div
                  key={seat.seat_id}
                  className={`seat-node seat-${seat.status}`}
                  title={`${seat.seat_id} — ${STATUS_LABELS[seat.status] || seat.status}
Confidence: ${(seat.confidence * 100).toFixed(0)}%`}
                >
                  <div className="seat-indicator"
                    style={{ background: STATUS_COLORS[seat.status] || STATUS_COLORS.unknown }}
                  />
                  <span className="seat-label">{seat.seat_id.split('-')[1]}</span>
                  {seat.reserved_object && (
                    <span className="seat-object">🎒</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="legend">
        {Object.entries(STATUS_COLORS).filter(([k]) => k !== 'unknown').map(([status, color]) => (
          <div key={status} className="legend-item">
            <div className="legend-dot" style={{ background: color }} />
            <span>{STATUS_LABELS[status]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Demo data for when API is not connected
const DEMO_SEATS = [
  { seat_id: 'T01-S1', table_id: 'T01', status: 'occupied', confidence: 0.94, reserved_object: null },
  { seat_id: 'T01-S2', table_id: 'T01', status: 'vacant', confidence: 0.96, reserved_object: null },
  { seat_id: 'T01-S3', table_id: 'T01', status: 'reserved', confidence: 0.81, reserved_object: 'backpack' },
  { seat_id: 'T01-S4', table_id: 'T01', status: 'vacant', confidence: 0.95, reserved_object: null },
  { seat_id: 'T02-S1', table_id: 'T02', status: 'occupied', confidence: 0.92, reserved_object: null },
  { seat_id: 'T02-S2', table_id: 'T02', status: 'occupied', confidence: 0.89, reserved_object: null },
  { seat_id: 'T02-S3', table_id: 'T02', status: 'vacant', confidence: 0.97, reserved_object: null },
  { seat_id: 'T02-S4', table_id: 'T02', status: 'vacant', confidence: 0.93, reserved_object: null },
  { seat_id: 'T03-S1', table_id: 'T03', status: 'vacant', confidence: 0.98, reserved_object: null },
  { seat_id: 'T03-S2', table_id: 'T03', status: 'reserved', confidence: 0.75, reserved_object: 'laptop' },
]

export default FloorMap

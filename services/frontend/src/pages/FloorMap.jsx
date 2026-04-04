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
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">🗺️ Floor Map — Real-time Seat Status</h1>
        <p className="text-sm text-gray-400">
          สถานะที่นั่งแบบเรียลไทม์ อัพเดททุก 2 วินาที
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-500">{stats.vacant}</div>
          <div className="text-sm text-gray-400">ที่นั่งว่าง</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-500">{stats.occupied}</div>
          <div className="text-sm text-gray-400">ไม่ว่าง</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-500">{stats.reserved}</div>
          <div className="text-sm text-gray-400">จองแล้ว</div>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-400">{connected ? '🟢' : '🔴'}</div>
          <div className="text-sm text-gray-400">
            {connected ? 'Connected' : 'Reconnecting...'} · {lastUpdate || '—'}
          </div>
        </div>
      </div>

      {/* Floor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(tables).map(([tableId, tableSeats]) => (
          <motion.div
            key={tableId}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">{tableId}</span>
              <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
                {tableSeats.filter(s => s.status === 'vacant').length}/{tableSeats.length} ว่าง
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {tableSeats.map(seat => (
                <motion.div
                  key={seat.seat_id}
                  className={`flex flex-col items-center gap-1 p-3 rounded-md bg-gray-700 border min-w-[52px] cursor-pointer ${
                    seat.status === 'occupied' ? 'border-red-500/40' :
                    seat.status === 'reserved' ? 'border-yellow-500/40' :
                    'border-green-500/40'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  title={`${seat.seat_id} — ${STATUS_LABELS[seat.status] || seat.status}
Confidence: ${(seat.confidence * 100).toFixed(0)}%`}
                >
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ background: STATUS_COLORS[seat.status] || STATUS_COLORS.unknown }}
                  />
                  <span className="text-xs font-medium text-gray-300">{seat.seat_id.split('-')[1]}</span>
                  {seat.reserved_object && (
                    <span className="absolute -top-1 -right-1 text-xs">🎒</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-4 justify-center mt-6">
        {Object.entries(STATUS_COLORS).filter(([k]) => k !== 'unknown').map(([status, color]) => (
          <div key={status} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-sm text-gray-400">{STATUS_LABELS[status]}</span>
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

import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import FloorMap from './pages/FloorMap.jsx'
import UserApp from './pages/UserApp.jsx'
import StallPanel from './pages/StallPanel.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        {/* ─── Navigation ─── */}
        <nav className="nav-bar">
          <div className="nav-brand">
            <span className="nav-icon">🍽️</span>
            <span className="nav-title">Smart Canteen</span>
          </div>
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Floor Map
            </NavLink>
            <NavLink to="/order" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              สั่งอาหาร
            </NavLink>
            <NavLink to="/stall" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Stall Panel
            </NavLink>
          </div>
        </nav>

        {/* ─── Routes ─── */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<FloorMap />} />
            <Route path="/order" element={<UserApp />} />
            <Route path="/stall" element={<StallPanel />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App

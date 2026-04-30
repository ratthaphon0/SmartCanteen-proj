import React, { useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Lazy-load the 3D background so Three.js errors don't crash the entire login page
const Floating3DBackground = lazy(() => 
  import('../../components/Floating3DBackground').catch(() => ({
    default: () => null  // If Three.js fails to load, just show nothing
  }))
);

export const UserLogin = ({ setUserRole }) => {
  const [role, setRole] = useState('user');
  const [userId, setUserId] = useState('6210012345');
  const [password, setPassword] = useState('1234');
  const navigate = useNavigate();

  const handleToggleRole = (newRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setUserId('admin');
      setPassword('admin');
    } else {
      setUserId('6210012345');
      setPassword('1234');
    }
  };

  const handleLogin = () => {
    if (!userId || !password) return;
    
    if (role === 'admin' && userId === 'admin' && password === 'admin') {
      setUserRole('admin');
      navigate('/admin');
    } else if (role === 'user' && (userId === 'user' || userId === '6210012345')) {
      setUserRole('user');
      navigate('/user');
    } else {
      alert('❌ รหัสผิด กรุณาลองใหม่');
    }
  };

  const guestLogin = () => {
    setUserRole('user');
    navigate('/user');
  };

  return (
    <div className="min-h-screen bg-[#05150d] flex items-center justify-center p-6 relative overflow-hidden">
      {/* 3D Visual Background — safely wrapped */}
      <Suspense fallback={null}>
        <Floating3DBackground />
      </Suspense>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 20 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="w-24 h-24 rounded-[32px] mx-auto mb-8 flex items-center justify-center text-5xl shadow-[0_20px_50px_rgba(0,166,81,0.3)] bg-gradient-to-br from-kg-green-d via-kg-green to-kg-green-l relative group">
          <div className="absolute inset-0 rounded-[32px] bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
          <span className="relative z-10">🌿</span>
        </div>
        
        <h1 className="font-en text-4xl font-black text-center mb-1 text-white italic tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-kg-green-l to-white">
            Smart Canteen
        </h1>
        <p className="text-[10px] uppercase tracking-[0.4em] text-kg-green-p/40 text-center mb-10 font-en font-black">Kasetsart University · AI Infrastructure</p>

        <div className="flex gap-3 mb-6">
          {['user', 'admin'].map((r) => (
            <button 
              key={r}
              onClick={() => handleToggleRole(r)}
              className={`flex-1 py-4 text-[10px] font-black rounded-2xl transition-all font-en uppercase tracking-widest border ${
                role === r 
                ? 'bg-white text-black border-white shadow-[0_10px_30px_rgba(255,255,255,0.2)] scale-105' 
                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white/60'
              }`}
            >
              {r === 'user' ? '🎓 Student' : '⚙️ Administrator'}
            </button>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 mb-4 shadow-3xl">
          <div className="space-y-6">
            <div>
              <label className="block text-[9px] font-en font-black tracking-[0.2em] uppercase text-white/30 mb-2 px-1">
                {role === 'user' ? 'Student ID' : 'Admin Username'}
              </label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-kg-green-l/50 focus:bg-white/10 transition-all placeholder-white/10 font-en"
                type="text" 
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder={role === 'user' ? '6x10xxxxx' : 'admin'}
              />
            </div>
            
            <div>
              <label className="block text-[9px] font-en font-black tracking-[0.2em] uppercase text-white/30 mb-2 px-1">Security Key</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white outline-none focus:border-kg-green-l/50 focus:bg-white/10 transition-all placeholder-white/10 font-en"
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="bg-kg-green/10 border border-kg-green/20 rounded-2xl px-5 py-4 text-[10px] text-kg-green-l/80 flex items-center gap-3">
              <span className="text-lg">💡</span>
              <span className="font-en tracking-wide">
                Demo Credentials: <strong className="text-white font-black">{role === 'user' ? 'user / 1234' : 'admin / admin'}</strong>
              </span>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              className="w-full py-5 bg-gradient-to-r from-kg-green to-kg-green-l text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] shadow-2xl shadow-kg-green/30 hover:shadow-kg-green/50 transition-all"
            >
              Initialize Session
            </motion.button>
          </div>
        </div>

        <button 
          onClick={guestLogin}
          className="w-full py-4 bg-transparent border border-white/5 text-white/20 rounded-2xl font-black hover:border-white/20 hover:text-white/40 transition-all text-[9px] uppercase tracking-[0.3em] font-en"
        >
          Access as Guest
        </button>
        
        <p className="text-center text-[9px] text-white/10 mt-10 font-en font-black tracking-[0.4em] uppercase italic">Kasetsart University · Digital Frontier 2026</p>
      </motion.div>
    </div>
  );
};

export default UserLogin;

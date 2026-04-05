import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export const UserLogin = ({ setUserRole }) => {
  const [role, setRole] = useState('user'); // 'user' or 'admin'
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
    
    // Simple mock auth logic from snippet
    if (role === 'admin' && userId === 'admin' && password === 'admin') {
      setUserRole('admin');
      navigate('/admin');
    } else if (role === 'user' && userId === 'user' || userId === '6210012345') {
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
    <div className="min-h-screen bg-kg-dark flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,102,51,0.18)_0%,transparent_70%)]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center text-4xl shadow-[0_8px_32px_rgba(0,102,51,0.4)] bg-gradient-to-br from-kg-green-d to-kg-green-l">
          🌿
        </div>
        
        <h1 className="font-en text-3xl font-extrabold text-center mb-1 text-kg-green-p italic">KU Smart Canteen</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-kg-green-p/30 text-center mb-8 font-en">Kasetsart University · Smart Campus</p>

        <div className="flex gap-2.5 mb-5">
          <button 
            onClick={() => handleToggleRole('user')}
            className={`flex-1 py-3.5 text-xs font-bold rounded-xl transition-all font-en uppercase tracking-widest ${
              role === 'user' ? 'bg-kg-green text-white shadow-[0_4px_16px_rgba(0,102,51,0.3)]' : 'bg-transparent border border-kg-green/25 text-kg-green-p/40'
            }`}
          >
            🎓 นิสิต
          </button>
          <button 
            onClick={() => handleToggleRole('admin')}
            className={`flex-1 py-3.5 text-xs font-bold rounded-xl transition-all font-en uppercase tracking-widest ${
              role === 'admin' ? 'bg-kg-gold text-black shadow-[0_4px_16px_rgba(201,162,39,0.3)] font-bold' : 'bg-transparent border border-kg-green/25 text-kg-green-p/40'
            }`}
          >
            ⚙️ Admin
          </button>
        </div>

        <div className="bg-kg-card border border-kg-green/20 rounded-2xl p-5 mb-3 shadow-2xl">
          <label className="block text-[10px] font-en tracking-widest uppercase text-kg-green-p/40 mb-1.5">
            {role === 'user' ? 'รหัสนิสิต' : 'ชื่อผู้ใช้ Admin'}
          </label>
          <input 
            className="w-full bg-kg-surface border border-kg-green/20 rounded-xl px-4 py-3 text-sm text-kg-green-p outline-none focus:border-kg-green-l transition-colors placeholder-kg-green/30 mb-4 font-en"
            type="text" 
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder={role === 'user' ? '6x10xxxxx' : 'admin'}
          />
          
          <label className="block text-[10px] font-en tracking-widest uppercase text-kg-green-p/40 mb-1.5">รหัสผ่าน</label>
          <input 
            className="w-full bg-kg-surface border border-kg-green/20 rounded-xl px-4 py-3 text-sm text-kg-green-p outline-none focus:border-kg-green-l transition-colors placeholder-kg-green/30 mb-5 font-en"
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="bg-kg-green/10 border border-kg-green/20 rounded-xl px-4 py-2.5 mb-4 text-[11px] text-kg-green-p/60">
            💡 ทดสอบ: <strong className="text-kg-green-p/80 font-en">{role === 'user' ? 'user / 1234' : 'admin / admin'}</strong>
          </div>
          
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-kg-green text-white font-bold rounded-xl text-base shadow-[0_4px_16px_rgba(0,102,51,0.3)] hover:bg-kg-green-l transition-all active:scale-[0.97]"
          >
            🚀 เข้าสู่ระบบ
          </button>
        </div>

        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-kg-green/15"></div>
          <span className="text-[10px] font-en tracking-widest text-kg-green-p/30 uppercase">หรือ</span>
          <div className="flex-1 h-px bg-kg-green/15"></div>
        </div>

        <button 
          onClick={guestLogin}
          className="w-full py-3.5 bg-transparent border border-kg-green/20 text-kg-green-p/60 rounded-xl font-bold hover:border-kg-green-l/40 hover:text-kg-green-p/80 transition-all text-sm uppercase tracking-wider font-en"
        >
          👤 เข้าใช้แบบผู้เยี่ยมชม
        </button>
        
        <p className="text-center text-[11px] text-kg-green-p/20 mt-8 font-en tracking-widest uppercase italic">Kasetsart University · Smart Campus 2025</p>
      </motion.div>
    </div>
  );
};

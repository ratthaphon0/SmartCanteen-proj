import React from 'react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';

export const UserLogin = () => {
  return (
    <div className="min-h-screen bg-[#0f1117] flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm z-10"
      >
        <div className="text-center mb-10">
          <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-2xl overflow-hidden group">
            <motion.span 
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
              className="text-5xl"
            >
              🍽️
            </motion.span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Smart Canteen</h1>
          <p className="text-gray-500 font-medium tracking-tight">University AI-Powered System</p>
        </div>

        <GlassCard className="p-8 border-white/5">
          <div className="flex flex-col gap-6">
            <Button className="w-full py-4 text-base font-bold shadow-2xl shadow-blue-500/20" onClick={() => window.location.href = '/user/dashboard'}>
              Sign in with KU Auth
            </Button>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink-0 mx-4 text-gray-600 text-[10px] font-bold uppercase tracking-[0.2em]">OR</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>
            
            <Button variant="secondary" className="w-full py-4 text-sm font-bold opacity-80 hover:opacity-100" onClick={() => window.location.href = '/user/dashboard'}>
              Continue as Guest
            </Button>
          </div>
        </GlassCard>

        <p className="mt-8 text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-loose">
          By continuing, you agree to our<br/>
          <span className="text-gray-400 hover:text-white cursor-pointer transition-colors underline underline-offset-4">Terms of Service</span> & <span className="text-gray-400 hover:text-white cursor-pointer transition-colors underline underline-offset-4">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
};

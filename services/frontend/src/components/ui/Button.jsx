import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon: Icon,
  fullWidth = false,
  ...props 
}) => {
  
  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-[11px] rounded-md uppercase tracking-wider",
    md: "px-5 py-3 text-sm rounded-lg",
    lg: "px-6 py-4 text-base rounded-xl font-bold",
  };

  const variantClasses = {
    primary: "bg-ku-green text-white shadow-[0_4px_16px_rgba(0,102,51,0.3)] hover:bg-ku-green-light",
    secondary: "bg-ku-gold text-black shadow-[0_4px_12px_rgba(201,162,39,0.3)] hover:bg-ku-gold-light",
    danger: "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20",
    ghost: "bg-transparent border border-[var(--border)] text-text-secondary hover:border-[var(--border-bright)] hover:text-text-primary",
    success: "bg-ku-green-light/15 border border-ku-green-light/30 text-ku-green-light hover:bg-ku-green-light/25",
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.96 }}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 disabled:opacity-50 disabled:scale-100 ${fullWidth ? 'w-full' : ''} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} 
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 18} />}
      {children}
    </motion.button>
  );
};

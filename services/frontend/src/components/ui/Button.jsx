import React from 'react';
import { motion } from 'framer-motion';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon: Icon,
  ...props 
}) => {
  
  const sizeClasses = {
    sm: "px-2.5 py-1.5 text-xs rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl",
  };

  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20",
    secondary: "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20",
    ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20",
  };

  return (
    <motion.button 
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:opacity-50 disabled:scale-100 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`} 
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 20} />}
      {children}
    </motion.button>
  );
};

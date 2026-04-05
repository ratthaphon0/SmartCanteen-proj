import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = '', interactive = false, ...props }) => {
  const CardContainer = interactive ? motion.div : 'div';
  
  const baseClasses = "bg-bg-card border border-[var(--border)] backdrop-blur-xl rounded-2xl p-5 shadow-2xl transition-all duration-300";
  const interactiveClasses = interactive ? "cursor-pointer hover:bg-white/5 hover:border-[var(--border-bright)] hover:translate-y-[-4px]" : "";
  
  return (
    <CardContainer 
      className={`${baseClasses} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </CardContainer>
  );
};

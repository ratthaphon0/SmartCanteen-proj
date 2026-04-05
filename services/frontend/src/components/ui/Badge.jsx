import React from 'react';

export const Badge = ({ children, status = 'default', className = '' }) => {
  const statusClasses = {
    vacant: "bg-ku-green-light/15 text-ku-green-light border-ku-green-light/25",
    occupied: "bg-red-500/10 text-red-400 border-red-500/20",
    reserved: "bg-ku-gold-light/15 text-ku-gold-light border-ku-gold-light/25",
    pending: "bg-ku-gold/10 text-ku-gold border-ku-gold/20",
    preparing: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    ready: "bg-ku-green-light/15 text-ku-green-light border-ku-green-light/25",
    completed: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    default: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${statusClasses[status]} ${className}`}>
      {children}
    </span>
  );
};

import React from 'react';

export const Badge = ({ children, status = 'default', className = '' }) => {
  const statusClasses = {
    vacant: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    occupied: "bg-red-500/10 text-red-500 border-red-500/20",
    reserved: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    preparing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    ready: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    completed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    default: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize border tracking-wide transition-colors ${statusClasses[status]} ${className}`}>
      {children}
    </span>
  );
};

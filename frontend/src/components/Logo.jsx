import React from 'react';

export default function Logo({ className = "w-8 h-8", textClass = "text-2xl" }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`${className} bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-bold text-xl`}>
        K
      </div>
      <span className={`font-bold ${textClass} tracking-tight text-white`}>
        Kanban<span className="text-purple-400">Pro</span>
      </span>
    </div>
  );
}
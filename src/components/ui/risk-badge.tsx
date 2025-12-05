import React from 'react';

interface Props {
  level: 'Low' | 'Medium' | 'High';
}

export const RiskBadge: React.FC<Props> = ({ level }) => {
  const styles = {
    Low: "bg-green-100 text-green-800 border-green-200",
    Medium: "bg-amber-100 text-amber-800 border-amber-200",
    High: "bg-red-100 text-red-800 border-red-200 animate-pulse",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[level]} flex items-center gap-2 uppercase tracking-wide`}>
      <span className={`w-2 h-2 rounded-full ${level === 'High' ? 'bg-red-500' : level === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`}></span>
      {level} Risk Profile
    </span>
  );
};
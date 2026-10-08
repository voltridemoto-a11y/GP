import React from 'react';

interface Props {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  sub?: string;
  onClick?: () => void;
}

export default function StatCard({ label, value, icon: Icon, color = 'bg-red-600', sub, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className={`card-tech card ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="data-label mb-1">{label}</p>
          <p className="text-3xl font-black text-white ticker-in truncate">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
    </div>
  );
}

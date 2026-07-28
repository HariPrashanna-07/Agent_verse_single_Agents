import React from 'react';

export default function MetricCard({ title, amount, subtitle, icon: Icon, color = 'emerald', badge, badgeType = 'neutral' }) {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  const badgeColorMap = {
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <div className="glass-panel p-5 rounded-2xl relative overflow-hidden transition-all duration-200 hover:border-slate-700">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 tracking-wider uppercase">{title}</p>
          <h3 className="text-2xl font-bold text-slate-50 mt-1 tracking-tight">{amount}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.emerald}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-slate-400">{subtitle}</p>
        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${badgeColorMap[badgeType]}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

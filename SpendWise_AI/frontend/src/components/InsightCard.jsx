import React from 'react';
import { AlertTriangle, AlertCircle, Info, Lightbulb } from 'lucide-react';

export default function InsightCard({ insight }) {
  const isCritical = insight.level === 'critical';
  const isWarning = insight.level === 'warning';

  const bgStyles = isCritical
    ? 'bg-rose-950/40 border-rose-800/50 text-rose-200'
    : isWarning
    ? 'bg-amber-950/40 border-amber-800/50 text-amber-200'
    : 'bg-slate-900/60 border-slate-800 text-slate-200';

  const IconComponent = isCritical ? AlertCircle : isWarning ? AlertTriangle : Lightbulb;
  const iconColor = isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400';

  return (
    <div className={`p-4 rounded-xl border ${bgStyles} transition-all duration-200 flex items-start space-x-3`}>
      <div className="mt-0.5 shrink-0">
        <IconComponent className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">
            {insight.category ? `${insight.category} Risk` : 'Autonomous Insight'}
          </span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isCritical ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
            {insight.level.toUpperCase()}
          </span>
        </div>
        <p className="text-sm font-medium mt-1 leading-snug">{insight.message}</p>
        {insight.action_suggestion && (
          <p className="text-xs mt-2 opacity-90 font-medium text-emerald-300/90 flex items-center gap-1">
            <span>💡 Suggestion:</span> {insight.action_suggestion}
          </p>
        )}
      </div>
    </div>
  );
}

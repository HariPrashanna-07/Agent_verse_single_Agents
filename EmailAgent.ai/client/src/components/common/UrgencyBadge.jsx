import React from 'react';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export function UrgencyBadge({ urgency }) {
  const styles = {
    Urgent: 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-400',
    Medium: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400',
    Low: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400',
  };

  const icons = {
    Urgent: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
    Medium: <Clock className="w-3.5 h-3.5 mr-1" />,
    Low: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
  };

  const currentStyle = styles[urgency] || styles.Low;
  const currentIcon = icons[urgency] || icons.Low;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${currentStyle}`}>
      {currentIcon}
      {urgency || 'Low'}
    </span>
  );
}

import React from 'react';
import { Tag, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

const Badge = ({ variant = 'category', text, confidence, className = '' }) => {
  if (variant === 'confidence') {
    const isHigh = confidence >= 80;
    const isMedium = confidence >= 60 && confidence < 80;

    const bgClass = isHigh
      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
      : isMedium
      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
      : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20';

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgClass} ${className}`}>
        <CheckCircle className="w-3 h-3" />
        {confidence}% Confidence
      </span>
    );
  }

  if (variant === 'duplicate') {
    const isExact = text === 'Duplicate';
    const bgClass = isExact
      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
      : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20';

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${bgClass} ${className}`}>
        <AlertTriangle className="w-3 h-3 shrink-0" />
        {text}
      </span>
    );
  }

  // Category Badge
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-500/20 ${className}`}>
      <Tag className="w-3 h-3 shrink-0 text-indigo-500" />
      {text || 'Uncategorized'}
    </span>
  );
};

export default Badge;

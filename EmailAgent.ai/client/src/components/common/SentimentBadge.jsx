import React from 'react';
import { Smile, Meh, Frown, Sparkles } from 'lucide-react';

export function SentimentBadge({ sentiment }) {
  const styles = {
    Positive: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    Neutral: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    Negative: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    Mixed: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  };

  const icons = {
    Positive: <Smile className="w-3.5 h-3.5 mr-1" />,
    Neutral: <Meh className="w-3.5 h-3.5 mr-1" />,
    Negative: <Frown className="w-3.5 h-3.5 mr-1" />,
    Mixed: <Sparkles className="w-3.5 h-3.5 mr-1" />,
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[sentiment] || styles.Neutral}`}>
      {icons[sentiment] || icons.Neutral}
      {sentiment || 'Neutral'}
    </span>
  );
}

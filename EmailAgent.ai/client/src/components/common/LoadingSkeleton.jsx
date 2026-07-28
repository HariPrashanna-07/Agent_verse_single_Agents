import React from 'react';

export function LoadingSkeleton({ type = 'card', count = 3 }) {
  if (type === 'row') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-xl glass-card">
            <div className="flex items-center space-x-4 w-full">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700/60" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-1/3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse p-6 rounded-2xl glass-card space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-1/2" />
          <div className="h-8 bg-slate-300 dark:bg-slate-600/60 rounded w-3/4" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
        </div>
      ))}
    </div>
  );
}

import React from 'react';

export const Loader = ({ label = 'Processing with Gemini AI...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 animate-pulse">{label}</p>
    </div>
  );
};

export const ProgressBar = ({ progress = 0, label = '' }) => {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          <span>{label}</span>
          <span>{progress}%</span>
        </div>
      )}
      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export const SkeletonCard = () => {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl skeleton shrink-0"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 w-2/3 rounded skeleton"></div>
          <div className="h-3 w-1/3 rounded skeleton"></div>
        </div>
      </div>
      <div className="h-12 w-full rounded-xl skeleton"></div>
    </div>
  );
};

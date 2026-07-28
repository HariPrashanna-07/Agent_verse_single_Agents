import React from 'react';
import Card from '../common/Card';

const StatCard = ({ title, value, description, icon: Icon, color = 'indigo' }) => {
  const colorStyles = {
    indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200/50 dark:border-indigo-500/20',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/50 dark:border-emerald-500/20',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-200/50 dark:border-amber-500/20',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-200/50 dark:border-rose-500/20',
  };

  return (
    <Card hover={true} className="flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`p-2.5 rounded-xl border ${colorStyles[color] || colorStyles.indigo}`}>
            <Icon className="w-5 h-5 shrink-0" />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">
          {value}
        </h3>
        {description && (
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
    </Card>
  );
};

export default StatCard;

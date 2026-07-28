import { Flame, CheckCircle2, Circle } from 'lucide-react'

const categoryColors = {
  Learning: 'bg-blue-900/40 text-blue-300 border-blue-800/40',
  Fitness: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/40',
  Health: 'bg-teal-900/40 text-teal-300 border-teal-800/40',
  Reading: 'bg-violet-900/40 text-violet-300 border-violet-800/40',
  Mindfulness: 'bg-amber-900/40 text-amber-300 border-amber-800/40',
  Productivity: 'bg-orange-900/40 text-orange-300 border-orange-800/40',
  Personal: 'bg-pink-900/40 text-pink-300 border-pink-800/40',
  Other: 'bg-slate-800 text-slate-300 border-slate-700',
}

export default function HabitCard({ habit, onLog, onEdit, onDelete, showActions = true }) {
  const pct = Math.min(100, habit.progress_pct ?? (habit.actual && habit.target ? Math.round((habit.actual / habit.target) * 100) : 0))
  const catColor = categoryColors[habit.category] || categoryColors.Other

  return (
    <div className="card hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-white text-sm">{habit.name}</h3>
            <span className={`badge border ${catColor}`}>{habit.category}</span>
            {habit.difficulty && (
              <span className="badge bg-slate-800 text-slate-400 border border-slate-700">{habit.difficulty}</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {habit.target_value ?? habit.target} {habit.unit} · {habit.frequency ?? 'daily'}
          </p>
        </div>
        {habit.streak > 0 && (
          <div className="flex items-center gap-1 text-amber-400 flex-shrink-0">
            <Flame size={14} />
            <span className="text-xs font-bold">{habit.streak}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {(habit.actual !== undefined || habit.progress_pct !== undefined) && (
        <div className="mb-3">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{habit.actual ?? 0} / {habit.target_value ?? habit.target} {habit.unit}</span>
            <span className={pct >= 100 ? 'text-emerald-400 font-medium' : ''}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-forge-500' : 'bg-amber-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Completion rate if available */}
      {habit.completion_rate !== undefined && (
        <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
          <span>7-day: <span className="text-white font-medium">{habit.completion_rate}%</span></span>
          {habit.current_streak !== undefined && (
            <span>Streak: <span className="text-amber-400 font-medium">{habit.current_streak}d</span></span>
          )}
        </div>
      )}

      {showActions && (
        <div className="flex gap-2 mt-2">
          {onLog && (
            <button onClick={() => onLog(habit)} className="btn-primary flex-1 text-xs py-1.5">
              Log Progress
            </button>
          )}
          {onEdit && (
            <button onClick={() => onEdit(habit)} className="btn-secondary text-xs py-1.5 px-3">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(habit)} className="btn-danger text-xs py-1.5 px-3">
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  )
}

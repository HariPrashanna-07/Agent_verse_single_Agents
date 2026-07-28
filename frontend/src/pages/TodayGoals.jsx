import { useEffect, useState } from 'react'
import { CalendarCheck, Flame, CheckCircle2, Circle, RefreshCw } from 'lucide-react'
import { getDashboard } from '../services/api'
import ProgressModal from '../components/ProgressModal'

const priorityColors = {
  HIGH: 'border-rose-800/40 bg-rose-900/10 text-rose-300',
  MEDIUM: 'border-amber-800/40 bg-amber-900/10 text-amber-300',
  LOW: 'border-emerald-800/40 bg-emerald-900/10 text-emerald-300',
}

export default function TodayGoals() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [logHabit, setLogHabit] = useState(null)

  const load = () => {
    setLoading(true)
    getDashboard()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading today's plan…</div>
  if (!data) return <div className="p-8 text-slate-500 text-sm">Failed to load.</div>

  const goals = data.daily_goals || []
  const completed = goals.filter(g => g.today_completed).length

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Today's Goals</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{completed}/{goals.length}</p>
            <p className="text-xs text-slate-400">completed</p>
          </div>
          <button onClick={load} className="btn-secondary p-2">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="card">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Daily Progress</span>
          <span>{goals.length > 0 ? Math.round((completed / goals.length) * 100) : 0}%</span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-forge-600 to-emerald-500 rounded-full transition-all"
            style={{ width: `${goals.length > 0 ? (completed / goals.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Goal cards */}
      <div className="space-y-3">
        {goals.length === 0 ? (
          <p className="text-slate-500 text-sm">No active habits. Create some habits first.</p>
        ) : goals.map(goal => (
          <div key={goal.habit_id} className="card hover:border-slate-700 transition-colors">
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                {goal.today_completed
                  ? <CheckCircle2 size={20} className="text-emerald-400" />
                  : <Circle size={20} className="text-slate-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-white text-sm">{goal.habit_name}</h3>
                  <span className={`badge border text-xs ${priorityColors[goal.priority]}`}>
                    {goal.priority}
                  </span>
                  {goal.current_streak > 0 && (
                    <span className="flex items-center gap-1 text-amber-400 text-xs">
                      <Flame size={11} /> {goal.current_streak}d streak
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                  <span>Original: <span className="text-slate-300">{goal.original_target} {goal.unit}</span></span>
                  <span className="text-slate-600">→</span>
                  <span>Suggested: <span className="text-forge-300 font-medium">{goal.suggested_target} {goal.unit}</span></span>
                  <span>Consistency: <span className="text-slate-300">{goal.completion_rate}%</span></span>
                </div>

                <p className="text-xs text-slate-500 italic mb-3">"{goal.reason}"</p>

                {goal.today_logged && (
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Today: {goal.today_actual} / {goal.suggested_target} {goal.unit}</span>
                      <span>{Math.min(100, Math.round((goal.today_actual / goal.suggested_target) * 100))}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${goal.today_completed ? 'bg-emerald-500' : 'bg-forge-500'}`}
                        style={{ width: `${Math.min(100, (goal.today_actual / goal.suggested_target) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {!goal.today_completed && (
                <button
                  onClick={() => setLogHabit({ id: goal.habit_id, name: goal.habit_name, target_value: goal.original_target, unit: goal.unit })}
                  className="btn-primary text-xs py-1.5 flex-shrink-0"
                >
                  Log
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {logHabit && (
        <ProgressModal
          habit={logHabit}
          onClose={() => setLogHabit(null)}
          onSuccess={load}
        />
      )}
    </div>
  )
}

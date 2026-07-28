import { useEffect, useState } from 'react'
import { getHabits, getProgressAnalysis, getProgress, getWeeklyReport } from '../services/api'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid, Legend
} from 'recharts'
import MetricCard from '../components/MetricCard'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const TREND_ICON = { improving: TrendingUp, declining: TrendingDown, stable: Minus }
const TREND_COLOR = { improving: 'text-emerald-400', declining: 'text-rose-400', stable: 'text-slate-400' }

export default function Progress() {
  const [habits, setHabits] = useState([])
  const [analyses, setAnalyses] = useState({})
  const [weeklyReport, setWeeklyReport] = useState(null)
  const [selected, setSelected] = useState(null)
  const [historyData, setHistoryData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [habitsRes, reportRes] = await Promise.all([getHabits({ active: true }), getWeeklyReport()])
        setHabits(habitsRes.data)
        setWeeklyReport(reportRes.data)

        const analysisMap = {}
        await Promise.all(habitsRes.data.map(async h => {
          try {
            const r = await getProgressAnalysis(h.id, 30)
            analysisMap[h.id] = r.data
          } catch { analysisMap[h.id] = {} }
        }))
        setAnalyses(analysisMap)

        if (habitsRes.data.length > 0) {
          setSelected(habitsRes.data[0])
          loadHistory(habitsRes.data[0].id)
        }
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  async function loadHistory(habitId) {
    try {
      const r = await getProgress(habitId, 30)
      const logs = r.data
      setHistoryData(logs.slice().reverse().map(l => ({
        date: new Date(l.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actual: l.actual_value,
        completed: l.completed ? 1 : 0,
      })))
    } catch { setHistoryData([]) }
  }

  function selectHabit(h) {
    setSelected(h)
    loadHistory(h.id)
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading progress data…</div>

  const daily = weeklyReport?.daily_breakdown || []

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Progress</h1>
        <p className="text-sm text-slate-400 mt-0.5">Analytics across all your habits</p>
      </div>

      {/* Weekly overview chart */}
      <div className="card">
        <h2 className="text-sm font-semibold text-white mb-4">7-Day Completion Overview</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={daily.slice(-7)} barSize={24}>
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })} />
            <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
            <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
              formatter={v => [`${v}%`, 'Completion']} />
            <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
              {daily.slice(-7).map((e, i) => (
                <Cell key={i} fill={e.pct >= 80 ? '#10b981' : e.pct >= 50 ? '#6366f1' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Habit selector + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Habit list */}
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Habits</h2>
          {habits.map(h => {
            const a = analyses[h.id] || {}
            const TrendIcon = TREND_ICON[a.trend] || Minus
            return (
              <button
                key={h.id}
                onClick={() => selectHabit(h)}
                className={`w-full text-left card-sm hover:border-slate-600 transition-colors ${selected?.id === h.id ? 'border-forge-600/50 bg-forge-900/10' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{h.name}</span>
                  <TrendIcon size={13} className={TREND_COLOR[a.trend] || 'text-slate-400'} />
                </div>
                <div className="flex gap-3 mt-1 text-xs text-slate-400">
                  <span>{a.completion_rate ?? 0}% done</span>
                  <span>🔥 {a.current_streak ?? 0}d</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Detail */}
        {selected && analyses[selected.id] && (
          <div className="lg:col-span-2 space-y-4">
            <div className="card">
              <h2 className="text-sm font-semibold text-white mb-4">{selected.name} — 30-Day Analysis</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Completion', value: `${analyses[selected.id].completion_rate}%` },
                  { label: 'Avg Actual', value: `${analyses[selected.id].average_actual} ${selected.unit}` },
                  { label: 'Current Streak', value: `🔥 ${analyses[selected.id].current_streak}d` },
                  { label: 'Best Streak', value: `${analyses[selected.id].best_streak}d` },
                ].map(m => (
                  <div key={m.label} className="bg-slate-800 rounded-lg p-3">
                    <p className="text-xs text-slate-500">{m.label}</p>
                    <p className="text-base font-bold text-white mt-0.5">{m.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 text-xs text-slate-400">
                <span>Missed: <span className="text-rose-400 font-medium">{analyses[selected.id].missed_days}d</span></span>
                <span>Completed: <span className="text-emerald-400 font-medium">{analyses[selected.id].completed_days}d</span></span>
                <span>Trend: <span className={`font-medium ${TREND_COLOR[analyses[selected.id].trend]}`}>{analyses[selected.id].trend}</span></span>
                <span>Consistency: <span className="text-white font-medium">{analyses[selected.id].consistency_score}</span></span>
              </div>
            </div>

            {/* History chart */}
            {historyData.length > 0 && (
              <div className="card">
                <h3 className="text-xs font-semibold text-slate-400 mb-3">30-Day Progress History</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} dot={false} name={`Actual (${selected.unit})`} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

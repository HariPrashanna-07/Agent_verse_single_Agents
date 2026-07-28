import { useEffect, useState } from 'react'
import { Activity, Flame, BarChart2, Target, Bot } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { getDashboard } from '../services/api'
import MetricCard from '../components/MetricCard'
import HabitCard from '../components/HabitCard'
import InsightCard from '../components/InsightCard'
import ProgressModal from '../components/ProgressModal'

export default function Dashboard() {
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

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-slate-500 text-sm">Loading dashboard…</div>
    </div>
  )

  if (!data) return (
    <div className="p-8 text-slate-500 text-sm">Failed to load. Is the backend running?</div>
  )

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white">{greeting} — here's your consistency overview.</h1>
        <p className="text-sm text-slate-400 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Progress"
          value={`${data.today_completed} / ${data.today_total}`}
          sub="habits completed"
          icon={Activity}
          color="forge"
        />
        <MetricCard
          title="Best Current Streak"
          value={`🔥 ${data.best_streak} Days`}
          sub={data.best_streak_habit || 'No streak yet'}
          icon={Flame}
          color="amber"
        />
        <MetricCard
          title="Weekly Consistency"
          value={`${data.weekly_consistency}%`}
          sub="last 7 days"
          icon={BarChart2}
          color="emerald"
        />
        <MetricCard
          title="Active Habits"
          value={data.active_habits}
          sub="being tracked"
          icon={Target}
          color="violet"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Chart */}
        <div className="card lg:col-span-2">
          <h2 className="text-sm font-semibold text-white mb-4">Weekly Completion</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.weekly_data} barSize={28}>
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v}%`, 'Completion']}
              />
              <Bar dataKey="completion" radius={[4, 4, 0, 0]}>
                {data.weekly_data.map((entry, i) => (
                  <Cell key={i} fill={entry.completion >= 80 ? '#10b981' : entry.completion >= 50 ? '#6366f1' : '#f59e0b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insight */}
        <div className="card flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Bot size={14} className="text-forge-400" />
            <h2 className="text-sm font-semibold text-white">AI Coach Insight</h2>
          </div>
          {data.insights?.length > 0 ? (
            <div className="space-y-2 flex-1">
              {data.insights.slice(0, 2).map((ins, i) => (
                <InsightCard key={i} insight={ins} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 flex-1">All habits are on track. Keep up the great work!</p>
          )}
        </div>
      </div>

      {/* Today's Habits */}
      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Today's Habits</h2>
        {data.today_habits?.length === 0 ? (
          <p className="text-sm text-slate-500">No active habits. Create one to get started.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.today_habits.map(h => (
              <HabitCard
                key={h.id}
                habit={{ ...h, target: h.target, actual: h.actual }}
                onLog={() => setLogHabit(h)}
              />
            ))}
          </div>
        )}
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

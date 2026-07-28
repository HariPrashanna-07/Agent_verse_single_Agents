import { useEffect, useState } from 'react'
import { getInsights } from '../services/api'
import InsightCard from '../components/InsightCard'
import GoalRecommendationCard from '../components/GoalRecommendationCard'
import { chatWithAgent } from '../services/api'
import { RefreshCw, Lightbulb } from 'lucide-react'

export default function Insights() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)
  const [toast, setToast] = useState('')

  const load = () => {
    setLoading(true)
    getInsights()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function handleAccept(rec) {
    setAccepting(rec.habit_id)
    try {
      await chatWithAgent(
        `Change ${rec.habit_name} target to ${rec.suggested_target} ${rec.unit}. Reason: ${rec.reason}`,
        []
      )
      setToast(`✅ ${rec.habit_name} target updated to ${rec.suggested_target} ${rec.unit}`)
      setTimeout(() => setToast(''), 4000)
      load()
    } catch {
      setToast('Failed to apply adjustment')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setAccepting(null)
    }
  }

  if (loading) return <div className="p-8 text-slate-500 text-sm">Loading insights…</div>

  const insights = data?.insights || []
  const recs = data?.goal_recommendations || []

  const byType = {
    danger: insights.filter(i => i.severity === 'danger'),
    warning: insights.filter(i => i.severity === 'warning'),
    success: insights.filter(i => i.severity === 'success'),
    info: insights.filter(i => i.severity === 'info'),
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Insights</h1>
          <p className="text-sm text-slate-400 mt-0.5">AI-driven coaching recommendations</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {insights.length === 0 && recs.length === 0 && (
        <div className="card text-center py-12">
          <Lightbulb size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No insights yet. Log some progress to get personalized coaching.</p>
        </div>
      )}

      {/* Goal Adjustments */}
      {recs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Goal Adjustments</h2>
          <p className="text-xs text-slate-500 mb-3">Based on your recent performance data. Accept to apply the change.</p>
          <div className="space-y-3">
            {recs.map(rec => (
              <GoalRecommendationCard
                key={rec.habit_id}
                rec={rec}
                onAccept={handleAccept}
                loading={accepting === rec.habit_id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Needs Attention */}
      {(byType.danger.length > 0 || byType.warning.length > 0) && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Needs Attention</h2>
          <div className="space-y-2">
            {[...byType.danger, ...byType.warning].map((ins, i) => (
              <InsightCard key={i} insight={ins} />
            ))}
          </div>
        </div>
      )}

      {/* Improving */}
      {byType.success.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Improving</h2>
          <div className="space-y-2">
            {byType.success.map((ins, i) => <InsightCard key={i} insight={ins} />)}
          </div>
        </div>
      )}

      {/* Info */}
      {byType.info.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-white mb-3">Strong Habits</h2>
          <div className="space-y-2">
            {byType.info.map((ins, i) => <InsightCard key={i} insight={ins} />)}
          </div>
        </div>
      )}
    </div>
  )
}

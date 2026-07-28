const severityStyles = {
  danger: 'border-rose-800/40 bg-rose-900/10 text-rose-300',
  warning: 'border-amber-800/40 bg-amber-900/10 text-amber-300',
  success: 'border-emerald-800/40 bg-emerald-900/10 text-emerald-300',
  info: 'border-blue-800/40 bg-blue-900/10 text-blue-300',
}

const typeLabels = {
  STREAK_AT_RISK: '🔥 Streak at Risk',
  STRUGGLING: '⚠️ Struggling',
  IMPROVING: '📈 Improving',
  GOAL_TOO_EASY: '💡 Goal Too Easy',
  GOAL_TOO_DIFFICULT: '🎯 Goal Too Difficult',
}

export default function InsightCard({ insight }) {
  const style = severityStyles[insight.severity] || severityStyles.info
  const label = typeLabels[insight.type] || insight.type

  return (
    <div className={`rounded-lg border p-4 ${style}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</span>
        <span className="text-xs opacity-60">· {insight.habit_name}</span>
      </div>
      <p className="text-sm">{insight.message}</p>
    </div>
  )
}

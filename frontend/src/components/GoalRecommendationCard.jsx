import { TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react'

export default function GoalRecommendationCard({ rec, onAccept, loading }) {
  const isDecrease = rec.recommendation === 'DECREASE'
  const isIncrease = rec.recommendation === 'INCREASE'

  return (
    <div className={`rounded-xl border p-4 ${
      isDecrease ? 'border-amber-800/40 bg-amber-900/10' :
      isIncrease ? 'border-emerald-800/40 bg-emerald-900/10' :
      'border-slate-700 bg-slate-800/50'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isDecrease ? <TrendingDown size={14} className="text-amber-400" /> :
             isIncrease ? <TrendingUp size={14} className="text-emerald-400" /> :
             <CheckCircle2 size={14} className="text-slate-400" />}
            <span className="font-semibold text-white text-sm">{rec.habit_name}</span>
            <span className={`badge border text-xs ${
              isDecrease ? 'bg-amber-900/30 text-amber-300 border-amber-800/40' :
              isIncrease ? 'bg-emerald-900/30 text-emerald-300 border-emerald-800/40' :
              'bg-slate-800 text-slate-400 border-slate-700'
            }`}>{rec.recommendation}</span>
          </div>
          <div className="flex items-center gap-3 text-sm mb-2">
            <span className="text-slate-400">Current: <span className="text-white font-medium">{rec.current_target} {rec.unit}</span></span>
            {rec.recommendation !== 'KEEP' && (
              <>
                <span className="text-slate-600">→</span>
                <span className="text-slate-400">Suggested: <span className={`font-medium ${isDecrease ? 'text-amber-300' : 'text-emerald-300'}`}>{rec.suggested_target} {rec.unit}</span></span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400">{rec.reason}</p>
        </div>
      </div>
      {rec.recommendation !== 'KEEP' && onAccept && (
        <button
          onClick={() => onAccept(rec)}
          disabled={loading}
          className={`mt-3 w-full py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isDecrease
              ? 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-700/40'
              : 'bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-700/40'
          }`}
        >
          {loading ? 'Applying…' : `Accept — Change to ${rec.suggested_target} ${rec.unit}`}
        </button>
      )}
    </div>
  )
}

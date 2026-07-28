import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

export default function ToolCallBadge({ toolCall }) {
  const isError = toolCall.status === 'error'
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
      isError
        ? 'bg-rose-900/20 border-rose-800/40 text-rose-400'
        : 'bg-forge-900/20 border-forge-800/40 text-forge-400'
    }`}>
      {isError
        ? <AlertCircle size={11} />
        : <CheckCircle2 size={11} className="text-emerald-400" />
      }
      <span className="font-mono">{toolCall.tool}</span>
      {!isError && <span className="text-emerald-400">✓</span>}
    </div>
  )
}

export default function MetricCard({ title, value, sub, icon: Icon, color = 'forge', trend }) {
  const colors = {
    forge: 'text-forge-400 bg-forge-900/30 border-forge-800/40',
    emerald: 'text-emerald-400 bg-emerald-900/30 border-emerald-800/40',
    amber: 'text-amber-400 bg-amber-900/30 border-amber-800/40',
    rose: 'text-rose-400 bg-rose-900/30 border-rose-800/40',
    violet: 'text-violet-400 bg-violet-900/30 border-violet-800/40',
  }
  return (
    <div className="card flex items-start gap-4">
      {Icon && (
        <div className={`p-2.5 rounded-lg border ${colors[color]}`}>
          <Icon size={20} className={colors[color].split(' ')[0]} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        {trend && (
          <p className={`text-xs mt-1 font-medium ${trend === 'improving' ? 'text-emerald-400' : trend === 'declining' ? 'text-rose-400' : 'text-slate-400'}`}>
            {trend === 'improving' ? '↑ Improving' : trend === 'declining' ? '↓ Declining' : '→ Stable'}
          </p>
        )}
      </div>
    </div>
  )
}

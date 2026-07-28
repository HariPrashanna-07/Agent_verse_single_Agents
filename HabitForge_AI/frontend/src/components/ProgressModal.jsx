import { useState } from 'react'
import { X } from 'lucide-react'
import { logProgress } from '../services/api'

export default function ProgressModal({ habit, onClose, onSuccess }) {
  const [value, setValue] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!value || isNaN(value)) return setError('Enter a valid number')
    setLoading(true)
    try {
      await logProgress({ habit_id: habit.id, actual_value: parseFloat(value), notes })
      onSuccess?.()
      onClose()
    } catch {
      setError('Failed to log progress')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Log Progress</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          <span className="text-white font-medium">{habit.name}</span> · Target: {habit.target_value ?? habit.target} {habit.unit}
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Amount ({habit.unit})</label>
            <input
              className="input"
              type="number"
              min="0"
              step="any"
              placeholder={`e.g. ${habit.target_value ?? habit.target}`}
              value={value}
              onChange={e => setValue(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" placeholder="What did you work on?" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving…' : 'Save Progress'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

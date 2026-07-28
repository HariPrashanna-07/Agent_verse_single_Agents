import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createHabit, updateHabit } from '../services/api'

const CATEGORIES = ['Learning', 'Fitness', 'Health', 'Productivity', 'Reading', 'Mindfulness', 'Personal', 'Other']
const DIFFICULTIES = ['easy', 'medium', 'hard']
const FREQUENCIES = ['daily', 'weekly']

const empty = { name: '', description: '', target_value: '', unit: '', frequency: 'daily', category: 'Other', difficulty: 'medium' }

export default function HabitModal({ habit, onClose, onSuccess }) {
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (habit) setForm({ ...empty, ...habit, target_value: habit.target_value ?? '' })
  }, [habit])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name || !form.target_value || !form.unit) return setError('Name, target, and unit are required')
    setLoading(true)
    try {
      const payload = { ...form, target_value: parseFloat(form.target_value) }
      if (habit?.id) await updateHabit(habit.id, payload)
      else await createHabit(payload)
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save habit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-white">{habit?.id ? 'Edit Habit' : 'Create Habit'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="label">Habit Name *</label>
            <input className="input" placeholder="e.g. DSA Practice" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" placeholder="Optional description" value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Daily Target *</label>
              <input className="input" type="number" min="1" step="any" placeholder="60" value={form.target_value} onChange={e => set('target_value', e.target.value)} />
            </div>
            <div>
              <label className="label">Unit *</label>
              <input className="input" placeholder="minutes / pages" value={form.unit} onChange={e => set('unit', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select className="input" value={form.difficulty} onChange={e => set('difficulty', e.target.value)}>
                {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Frequency</label>
            <select className="input" value={form.frequency} onChange={e => set('frequency', e.target.value)}>
              {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving…' : habit?.id ? 'Update Habit' : 'Create Habit'}
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Plus, Search, Filter } from 'lucide-react'
import { getHabits, deleteHabit, updateHabit, getHabitAnalysis, getHabitStreak } from '../services/api'
import HabitCard from '../components/HabitCard'
import HabitModal from '../components/HabitModal'
import ProgressModal from '../components/ProgressModal'

const CATEGORIES = ['All', 'Learning', 'Fitness', 'Health', 'Productivity', 'Reading', 'Mindfulness', 'Personal', 'Other']

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [enriched, setEnriched] = useState({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [modal, setModal] = useState(null) // null | 'create' | habit obj
  const [logHabit, setLogHabit] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const res = await getHabits()
      setHabits(res.data)
      // Enrich with streak + analysis
      const enrichMap = {}
      await Promise.all(res.data.map(async h => {
        try {
          const [streakRes, analysisRes] = await Promise.all([
            getHabitStreak(h.id),
            getHabitAnalysis(h.id, 7),
          ])
          enrichMap[h.id] = {
            streak: streakRes.data.current_streak,
            current_streak: streakRes.data.current_streak,
            completion_rate: analysisRes.data.completion_rate,
          }
        } catch { enrichMap[h.id] = {} }
      }))
      setEnriched(enrichMap)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = habits.filter(h => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'All' || h.category === catFilter
    return matchSearch && matchCat
  })

  async function handleDelete(habit) {
    if (!confirm(`Delete "${habit.name}"?`)) return
    await deleteHabit(habit.id)
    load()
  }

  async function handleToggle(habit) {
    await updateHabit(habit.id, { active: !habit.active })
    load()
  }

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">My Habits</h1>
          <p className="text-sm text-slate-400 mt-0.5">{habits.filter(h => h.active).length} active habits</p>
        </div>
        <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2">
          <Plus size={15} /> New Habit
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-8"
            placeholder="Search habits…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                catFilter === c
                  ? 'bg-forge-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm">Loading habits…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-500 text-sm mb-3">No habits found.</p>
          <button onClick={() => setModal('create')} className="btn-primary">Create your first habit</button>
        </div>
      ) : (
        <>
          {/* Active */}
          {filtered.filter(h => h.active).length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Active</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.filter(h => h.active).map(h => (
                  <HabitCard
                    key={h.id}
                    habit={{ ...h, ...enriched[h.id] }}
                    onLog={() => setLogHabit(h)}
                    onEdit={() => setModal(h)}
                    onDelete={() => handleDelete(h)}
                  />
                ))}
              </div>
            </div>
          )}
          {/* Inactive */}
          {filtered.filter(h => !h.active).length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Paused</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.filter(h => !h.active).map(h => (
                  <div key={h.id} className="opacity-50">
                    <HabitCard
                      habit={{ ...h, ...enriched[h.id] }}
                      onEdit={() => setModal(h)}
                      onDelete={() => handleDelete(h)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {modal && (
        <HabitModal
          habit={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSuccess={load}
        />
      )}
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

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Zap, Loader2, Lightbulb } from 'lucide-react'
import { chatWithAgent } from '../services/api'
import ToolCallBadge from '../components/ToolCallBadge'
import InsightCard from '../components/InsightCard'

const QUICK_PROMPTS = [
  'How am I doing this week?',
  'What should I focus on today?',
  "What's my longest streak?",
  'Which habit am I struggling with?',
  'Should I adjust any goals?',
  'Create a 30-minute daily reading habit.',
]

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser ? 'bg-forge-600' : 'bg-slate-700'
      }`}>
        {isUser ? <User size={13} className="text-white" /> : <Bot size={13} className="text-forge-400" />}
      </div>
      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
        {/* Tool calls */}
        {msg.tool_calls?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs text-slate-500 mr-1">Tool Execution:</span>
            {msg.tool_calls.map((tc, i) => <ToolCallBadge key={i} toolCall={tc} />)}
          </div>
        )}
        {/* Message */}
        <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-forge-600 text-white rounded-tr-sm'
            : 'bg-slate-800 text-slate-100 rounded-tl-sm border border-slate-700'
        }`}>
          {msg.content.split('\n').map((line, i) => {
            // Bold markdown
            const parts = line.split(/\*\*(.*?)\*\*/g)
            return (
              <p key={i} className={i > 0 ? 'mt-1' : ''}>
                {parts.map((p, j) => j % 2 === 1 ? <strong key={j} className="font-semibold">{p}</strong> : p)}
              </p>
            )
          })}
        </div>
        {/* Proactive insights */}
        {msg.insights?.length > 0 && (
          <div className="w-full space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Lightbulb size={11} /> Proactive Insights
            </div>
            {msg.insights.map((ins, i) => (
              <div key={i} className="text-xs bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-300">
                {ins}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AICoach() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm HabitForge Agent — your autonomous habit coach. I can analyze your habits, track streaks, suggest daily goals, and adapt targets based on your real performance data.\n\nWhat would you like to work on?",
      tool_calls: [],
      insights: [],
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getHistory = () =>
    messages.map(m => ({ role: m.role, content: m.content }))

  async function send(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')

    setMessages(prev => [...prev, { role: 'user', content: msg, tool_calls: [], insights: [] }])
    setLoading(true)

    try {
      const res = await chatWithAgent(msg, getHistory())
      const { response, tool_calls, insights } = res.data
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        tool_calls: tool_calls || [],
        insights: insights || [],
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check that the backend is running.',
        tool_calls: [],
        insights: [],
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-forge-600/20 border border-forge-600/30 flex items-center justify-center">
            <Bot size={18} className="text-forge-400" />
          </div>
          <div>
            <h1 className="font-semibold text-white text-sm">HabitForge Coach</h1>
            <p className="text-xs text-slate-500">Autonomous Coaching Agent · Groq-powered</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/20 border border-emerald-800/30">
          <Zap size={11} className="text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">Groq llama-3.3-70b</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Bot size={13} className="text-forge-400" />
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Loader2 size={12} className="animate-spin" />
                <span>Agent reasoning…</span>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-6 pb-2 flex gap-2 flex-wrap flex-shrink-0">
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => send(p)}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors disabled:opacity-40"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-6 pb-5 pt-2 flex-shrink-0">
        <form
          onSubmit={e => { e.preventDefault(); send() }}
          className="flex gap-2 bg-slate-800 border border-slate-700 rounded-xl p-2 focus-within:border-forge-600/50 transition-colors"
        >
          <input
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none px-2"
            placeholder="Ask about your habits, log progress, check streaks…"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-lg bg-forge-600 hover:bg-forge-500 disabled:opacity-40 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send size={13} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  )
}

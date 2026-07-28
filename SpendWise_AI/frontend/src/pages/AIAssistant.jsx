import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Zap, 
  CheckCircle2 
} from 'lucide-react';
import ToolCallBadge from '../components/ToolCallBadge';
import InsightCard from '../components/InsightCard';
import { sendAgentChat } from '../services/api';

const QUICK_PROMPTS = [
  "I spent ₹250 on lunch today.",
  "Where did I spend the most this month?",
  "Am I likely to exceed my budget?",
  "What should I reduce?",
  "How much did I spend this week?",
  "Set my monthly budget to ₹25000."
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am **SpendWise**, your autonomous personal expense management agent. You can tell me about your expenses in natural language, ask questions about your spending, check forecasts, or set budget goals.',
      tool_calls: [],
      insights: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim() || loading) return;

    setError(null);
    const userMsg = { role: 'user', content: queryText };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      // Build conversation history format for API payload
      const historyPayload = updatedMessages
        .slice(1, -1)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await sendAgentChat(queryText, historyPayload);
      const data = res.data;

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          tool_calls: data.tool_calls || [],
          insights: data.insights || []
        }
      ]);
    } catch (err) {
      console.error('Error communicating with SpendWise agent:', err);
      setError('Failed to reach SpendWise Agent. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation history reset. How can SpendWise assist your expenses today?',
        tool_calls: [],
        insights: []
      }
    ]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col glass-panel rounded-2xl overflow-hidden border border-slate-800">
      {/* Top Agent Bar */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-md">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 flex items-center gap-2 text-sm">
              SpendWise Agent
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                ReAct Tool-Calling Engine
              </span>
            </h3>
            <p className="text-xs text-slate-400">Direct Natural Language Expense Interface</p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="text-xs text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors"
        >
          Reset Chat
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              msg.role === 'user'
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-slate-900 border border-slate-800 text-slate-100'
            }`}>
              {/* Tool Execution Badges if executed */}
              {msg.tool_calls && msg.tool_calls.length > 0 && (
                <div className="mb-3 space-y-1">
                  {msg.tool_calls.map((tc, tIdx) => (
                    <ToolCallBadge key={tIdx} toolCall={tc} />
                  ))}
                </div>
              )}

              {/* Text Content */}
              <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

              {/* Proactive Budget Insights triggered */}
              {msg.insights && msg.insights.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Proactive Budget Monitoring Alert:
                  </span>
                  {msg.insights.map((ins, iIdx) => (
                    <InsightCard key={iIdx} insight={ins} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-2xl px-4 py-3 text-xs flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-400" />
              <span>SpendWise is reasoning, selecting backend tools, and evaluating budget rules...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions & Input Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/90 space-y-3">
        {/* Quick Prompts Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> Suggestions:
          </span>
          {QUICK_PROMPTS.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1 rounded-full border border-slate-700 whitespace-nowrap transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder="Type a message (e.g. 'I spent ₹250 on lunch today' or 'Am I likely to exceed my budget?')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold text-sm transition-all flex items-center justify-center space-x-2 shadow-md shadow-brand-500/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

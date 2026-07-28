import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Sparkles, Activity, ShieldCheck, Cpu, DollarSign, BarChart3, PieChart } from 'lucide-react';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { SentimentBadge } from '../components/common/SentimentBadge';

export default function AIAnalysisPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        const res = await api.get('/ai/history');
        if (res.data.success) {
          setHistory(res.data.history);
        }
      } catch (err) {
        console.error('History load error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-3xl space-y-2">
        <div className="flex items-center space-x-2 text-indigo-500">
          <Sparkles className="w-5 h-5" />
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">AI Email Intelligence Center</h1>
        </div>
        <p className="text-xs text-slate-400">Deep breakdown of sentiment, keywords, and action items extracted by Google Gemini.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <div key={item._id} className="glass-card p-6 rounded-3xl space-y-4 border-slate-700/50">
            <div className="flex items-center justify-between">
              <CategoryBadge category={item.category} />
              <UrgencyBadge urgency={item.urgency} />
              <SentimentBadge sentiment={item.sentiment} />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{item.email?.subject || 'Email Analysis Item'}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{item.summary?.short}</p>
            </div>

            {item.keywords?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {item.keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold">
                    #{kw}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Confidence {Math.round((item.confidence || 0.95) * 100)}%</span>
              <span>{item.processingTime || 850}ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { History as HistoryIcon, Trash2, Calendar, FileText } from 'lucide-react';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { Link } from 'react-router-dom';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/history');
      if (res.data.success) {
        setHistory(res.data.history);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/ai/history/${id}`);
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert('Failed to delete history item');
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-3xl space-y-2">
        <div className="flex items-center space-x-2 text-indigo-500">
          <HistoryIcon className="w-5 h-5" />
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">AI Analysis History Archive</h1>
        </div>
        <p className="text-xs text-slate-400">Complete audit log of saved Gemini analyses, extracted tasks, and draft outputs.</p>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden divide-y divide-slate-800">
        {history.map((item) => (
          <div key={item._id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors">
            <div className="space-y-1 max-w-2xl">
              <div className="flex items-center space-x-2">
                <CategoryBadge category={item.category} />
                <UrgencyBadge urgency={item.urgency} />
                <span className="text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-200">{item.email?.subject || 'Email Analysis Log'}</h4>
              <p className="text-xs text-slate-400 line-clamp-1">{item.summary?.short}</p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to={`/emails/${item.emailId || item.email?._id || 'email_101'}`}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold transition-all"
              >
                View Analysis
              </Link>
              <button
                onClick={() => handleDelete(item._id)}
                className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Delete Log"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

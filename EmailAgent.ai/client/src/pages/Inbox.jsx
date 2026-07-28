import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Sparkles, Paperclip, Filter, Search, CheckSquare, RefreshCw, Play, CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Inbox() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [queueProgress, setQueueProgress] = useState(null);

  const categories = ['All', 'Work', 'Finance', 'Education', 'Personal', 'Promotions', 'Social'];
  const statuses = [
    { id: 'All', label: 'All Status' },
    { id: 'ANALYZED', label: '✨ Analyzed' },
    { id: 'NOT_ANALYZED', label: 'Pending Analysis' },
  ];

  const fetchInbox = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/emails?category=${selectedCategory}&status=${selectedStatus}`);
      if (res.data.success) {
        setEmails(res.data.emails);
      }
    } catch (err) {
      console.error('Inbox error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, [selectedCategory, selectedStatus]);

  const toggleSelect = (id) => {
    setSelectedEmails((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleBatchAnalyze = async () => {
    const ids = selectedEmails.length > 0 ? selectedEmails : emails.map((e) => e._id);
    try {
      const res = await api.post('/emails/batch-analyze', { emailIds: ids });
      if (res.data.success) {
        alert(`Queued ${ids.length} emails for batch analysis!`);
        pollProgress();
      }
    } catch (err) {
      alert('Batch analysis queue failed: ' + err.message);
    }
  };

  const pollProgress = async () => {
    const interval = setInterval(async () => {
      try {
        const res = await api.get('/emails/queue-progress');
        if (res.data.success) {
          setQueueProgress(res.data.progress);
          if (!res.data.progress.active) {
            clearInterval(interval);
            fetchInbox();
          }
        }
      } catch (e) {
        clearInterval(interval);
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-4 rounded-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 border-r border-slate-700/50 pr-3">
            <span className="text-xs font-bold text-slate-400 flex items-center mr-1">
              <Filter className="w-3.5 h-3.5 mr-1 text-indigo-400" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-bold text-slate-400 mr-1">AI Status:</span>
            {statuses.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  selectedStatus === st.id
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleBatchAnalyze}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover:opacity-90 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{selectedEmails.length > 0 ? `Analyze Selected (${selectedEmails.length})` : 'Analyze All Inbox'}</span>
          </button>
        </div>
      </div>

      {/* Queue Progress Bar */}
      {queueProgress && queueProgress.active && (
        <div className="glass-card p-4 rounded-2xl border-indigo-500/30 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-indigo-400 flex items-center">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Batch Analyzing: {queueProgress.currentSubject}
            </span>
            <span>
              {queueProgress.processed} / {queueProgress.total}
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(queueProgress.processed / queueProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Email List Table */}
      {loading ? (
        <LoadingSkeleton type="row" count={5} />
      ) : emails.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-3xl space-y-3">
          <Sparkles className="w-8 h-8 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold">No emails match the selected filters</h3>
          <p className="text-xs text-slate-400">Try selecting a different category or clearing filters.</p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden divide-y divide-slate-800">
          {emails.map((email) => {
            const isAnalyzed = email.aiStatus === 'ANALYZED' || !!email.analysis;

            return (
              <div
                key={email._id}
                className={`p-4 md:p-5 flex items-center justify-between hover:bg-slate-800/40 transition-colors group ${
                  !email.isRead ? 'bg-indigo-500/[0.03] font-semibold' : ''
                }`}
              >
                <div className="flex items-center space-x-4 min-w-0 flex-1 pr-4">
                  <input
                    type="checkbox"
                    checked={selectedEmails.includes(email._id)}
                    onChange={() => toggleSelect(email._id)}
                    className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs font-bold text-slate-200 truncate">{email.sender?.name || email.sender?.email}</span>

                      {/* AI Status Badge */}
                      {isAnalyzed ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10">
                          <Sparkles className="w-3 h-3 mr-1 text-amber-300" /> Analyzed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-800/80 text-slate-400 border border-slate-700/60">
                          <Circle className="w-2.5 h-2.5 mr-1 text-slate-500" /> Pending Analysis
                        </span>
                      )}

                      {email.analysis?.category && <CategoryBadge category={email.analysis.category} />}
                      {email.analysis?.urgency && <UrgencyBadge urgency={email.analysis.urgency} />}
                      {email.hasAttachments && <Paperclip className="w-3.5 h-3.5 text-slate-400" />}
                    </div>

                    <Link to={`/emails/${email._id}`} className="block">
                      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-400 transition-colors truncate">
                        {email.subject}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1">
                        {email.analysis?.summaryShort || email.snippet || email.bodyPreview}
                      </p>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-[11px] text-slate-500 whitespace-nowrap hidden sm:inline">
                    {new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <Link
                    to={`/emails/${email._id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-bold transition-all shadow-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

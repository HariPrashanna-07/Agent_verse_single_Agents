import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Search as SearchIcon, Sparkles, Filter, ArrowRight } from 'lucide-react';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const executeSearch = async (qString) => {
    if (!qString.trim()) return;
    try {
      setLoading(true);
      const res = await api.post('/emails/search-nl', { query: qString });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch(query);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Bar Input */}
      <form onSubmit={handleSubmit} className="glass-card p-4 rounded-3xl flex items-center space-x-3 border-indigo-500/30">
        <SearchIcon className="w-5 h-5 text-indigo-400 ml-2" />
        <input
          type="text"
          placeholder="Ask AI in natural language (e.g. 'Find invoices', 'Show urgent work emails')..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent border-none text-sm font-semibold focus:outline-none placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/25 flex items-center space-x-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Search</span>
        </button>
      </form>

      {/* Suggested Searches */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-semibold">Try searching:</span>
        {['Show invoices from last month', 'Urgent financial audits', 'Interview invitations', 'Work emails'].map((s) => (
          <button
            key={s}
            onClick={() => {
              setQuery(s);
              executeSearch(s);
            }}
            className="px-3 py-1 rounded-full bg-slate-800/60 hover:bg-slate-700 text-slate-300 text-[11px] font-medium border border-slate-700 transition-colors"
          >
            "{s}"
          </button>
        ))}
      </div>

      {/* Results & Parsed Intent */}
      {loading ? (
        <div className="glass-card p-12 text-center rounded-3xl">
          <Sparkles className="w-8 h-8 text-indigo-500 mx-auto animate-spin" />
          <p className="text-xs text-slate-400 mt-2">Gemini is parsing intent and filtering emails...</p>
        </div>
      ) : data ? (
        <div className="space-y-4">
          {/* Intent Card */}
          <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between text-xs gap-3">
            <div>
              <span className="text-slate-400 font-semibold">AI Parsed Filters: </span>
              <span className="text-indigo-400 font-bold ml-1">
                Category: {data.intent?.category} • Urgency: {data.intent?.urgency}
              </span>
            </div>
            <div className="font-mono text-slate-500 text-[11px]">Gmail Query: {data.intent?.suggestedGmailQuery}</div>
          </div>

          {/* Results List */}
          <div className="glass-card rounded-3xl overflow-hidden divide-y divide-slate-800">
            {data.results.map((email) => (
              <Link
                key={email._id}
                to={`/emails/${email._id}`}
                className="p-5 block hover:bg-slate-800/40 transition-colors space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-200">{email.sender?.name}</span>
                    {email.analysis?.category && <CategoryBadge category={email.analysis.category} />}
                    {email.analysis?.urgency && <UrgencyBadge urgency={email.analysis.urgency} />}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">{email.subject}</h4>
                <p className="text-xs text-slate-400 line-clamp-1">{email.snippet || email.bodyPreview}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

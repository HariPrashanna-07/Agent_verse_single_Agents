import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { SentimentBadge } from '../components/common/SentimentBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ArrowLeft, Sparkles, Copy, Check, Clock, ShieldCheck, FileText, CheckSquare, Calendar, RefreshCw, Send } from 'lucide-react';

export default function EmailDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [emailData, setEmailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [copiedTone, setCopiedTone] = useState(null);
  const [activeTone, setActiveTone] = useState('professional');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/emails/${id}`);
      if (res.data.success) {
        setEmailData(res.data);
      }
    } catch (err) {
      console.error('Error fetching email details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleRunAnalysis = async () => {
    try {
      setAnalyzing(true);
      const res = await api.post(`/emails/${id}/analyze`);
      if (res.data.success) {
        setEmailData((prev) => ({ ...prev, analysis: res.data.analysis }));
      }
    } catch (err) {
      alert('Analysis failed: ' + err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = (text, tone) => {
    navigator.clipboard.writeText(text);
    setCopiedTone(tone);
    setTimeout(() => setCopiedTone(null), 2000);
  };

  if (loading) return <LoadingSkeleton type="row" count={3} />;
  if (!emailData?.email) return <div className="p-8 text-center">Email not found</div>;

  const { email, analysis } = emailData;
  const tones = ['professional', 'friendly', 'formal', 'short', 'detailed'];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inbox</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analysis ? 'Regenerate Intelligence' : 'Run Gemini Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Grid View: Email Content vs AI Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Original Email (7 Cols) */}
        <div className="lg:col-span-7 glass-card p-6 md:p-8 rounded-3xl space-y-6">
          <div className="space-y-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">{email.subject}</h1>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">{email.sender?.name}</span>{' '}
                <span className="text-slate-400">&lt;{email.sender?.email}&gt;</span>
              </div>
              <span>{new Date(email.date).toLocaleString()}</span>
            </div>
          </div>

          <div
            className="prose dark:prose-invert max-w-none text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: email.body || email.bodyPreview || email.snippet }}
          />

          {email.attachments?.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-500">Attachments ({email.attachments.length})</span>
              <div className="flex flex-wrap gap-2">
                {email.attachments.map((att, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    <span>{att.filename}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: AI Intelligence Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {analysis ? (
            <div className="glass-card p-6 rounded-3xl space-y-6 border-indigo-500/30">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span className="text-sm font-extrabold">Gemini Intelligence</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CategoryBadge category={analysis.category} />
                  <UrgencyBadge urgency={analysis.urgency} />
                  <SentimentBadge sentiment={analysis.sentiment} />
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Executive Summary</span>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/50">
                  {analysis.summary?.short}
                </p>
              </div>

              {/* Actionable Tasks */}
              {analysis.tasks?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400 mr-1.5" /> Action Items ({analysis.tasks.length})
                  </span>
                  <div className="space-y-2">
                    {analysis.tasks.map((task, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                        <p className="font-semibold text-emerald-300">{task.task}</p>
                        <p className="text-[10px] text-emerald-400/80">Deadline: {task.deadline}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deadlines */}
              {analysis.deadlines?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 mr-1.5" /> Extracted Deadlines
                  </span>
                  <div className="space-y-2">
                    {analysis.deadlines.map((dl, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex justify-between items-center">
                        <span className="font-semibold text-amber-300">{dl.description}</span>
                        <span className="text-[10px] text-amber-400 font-mono">{dl.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-Tone Reply Generator Tabs */}
              {analysis.replyDrafts && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">AI Reply Draft</span>
                    <span className="text-[10px] text-slate-500">User reviews before sending</span>
                  </div>

                  <div className="flex space-x-1 overflow-x-auto pb-1">
                    {tones.map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveTone(t)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                          activeTone === t
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="relative p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 space-y-3 whitespace-pre-wrap">
                    {analysis.replyDrafts[activeTone]}

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                      <span className="text-[10px] text-slate-500">Click to copy into email client</span>
                      <button
                        onClick={() => handleCopy(analysis.replyDrafts[activeTone], activeTone)}
                        className="inline-flex items-center space-x-1 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-sans font-bold transition-all"
                      >
                        {copiedTone === activeTone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedTone === activeTone ? 'Copied!' : 'Copy Reply'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card p-8 text-center rounded-3xl space-y-4">
              <Sparkles className="w-10 h-10 text-indigo-500 mx-auto animate-pulse" />
              <h3 className="text-base font-bold">Email Not Yet Analyzed</h3>
              <p className="text-xs text-slate-400">Run Gemini AI Analysis to summarize, extract deadlines, and generate reply drafts.</p>
              <button
                onClick={handleRunAnalysis}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition-all"
              >
                Analyze Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

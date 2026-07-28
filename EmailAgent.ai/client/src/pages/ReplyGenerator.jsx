import React, { useState } from 'react';
import api from '../services/api';
import { MessageSquareReply, Sparkles, Copy, Check, Sliders, Send } from 'lucide-react';

export default function ReplyGenerator() {
  const [selectedTone, setSelectedTone] = useState('professional');
  const [instructions, setInstructions] = useState('');
  const [emailId, setEmailId] = useState('email_101');
  const [draft, setDraft] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const tones = [
    { id: 'professional', label: 'Professional', desc: 'Clear, polite executive tone' },
    { id: 'friendly', label: 'Friendly', desc: 'Warm, personable tone' },
    { id: 'formal', label: 'Formal', desc: 'Strict business etiquette' },
    { id: 'short', label: 'Short', desc: 'Concise 1-2 sentence response' },
    { id: 'detailed', label: 'Detailed', desc: 'Itemized, comprehensive draft' },
  ];

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await api.post('/ai/generate-reply', {
        emailId,
        tone: selectedTone,
        customInstructions: instructions,
      });
      if (res.data.success) {
        setDraft(res.data.replyDraft);
      }
    } catch (err) {
      alert('Error generating reply: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-panel p-6 rounded-3xl space-y-2">
        <div className="flex items-center space-x-2 text-indigo-500">
          <MessageSquareReply className="w-5 h-5" />
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">AI Reply Generator Studio</h1>
        </div>
        <p className="text-xs text-slate-400">Craft personalized response drafts with custom tone and instructions. The AI never sends emails automatically.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Settings (5 Cols) */}
        <div className="md:col-span-5 glass-card p-6 rounded-3xl space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Response Tone</label>
            <div className="space-y-2">
              {tones.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTone(t.id)}
                  className={`w-full text-left p-3 rounded-2xl border text-xs transition-all ${
                    selectedTone === t.id
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400 font-bold'
                      : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <p className="font-semibold text-slate-200">{t.label}</p>
                  <p className="text-[10px] text-slate-400">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Custom Instructions (Optional)</label>
            <textarea
              rows={3}
              placeholder="e.g. Mention that I will be out of office until Thursday morning..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-slate-800/80 border border-slate-700 focus:border-indigo-500 focus:outline-none text-slate-200"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all flex items-center justify-center space-x-2"
          >
            <Sparkles className={`w-4 h-4 text-amber-300 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Generating Draft...' : 'Generate AI Reply'}</span>
          </button>
        </div>

        {/* Draft Workspace (7 Cols) */}
        <div className="md:col-span-7 glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Generated Reply Preview</span>
              <span className="text-[10px] text-emerald-400 font-semibold">User Review Mandatory</span>
            </div>

            <textarea
              rows={12}
              value={draft || 'Select a tone and click "Generate AI Reply" to build a response draft...'}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>

          {draft && (
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-500">Edit freely before copying to your Gmail client</span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Reply'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

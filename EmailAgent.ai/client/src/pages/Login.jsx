import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MailCheck, Sparkles, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Login() {
  const { loginWithDemo } = useAuth();
  const navigate = useNavigate();

  const handleDemoClick = async () => {
    const success = await loginWithDemo();
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleClick = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get('/auth/google');
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error('Google login error:', err);
      window.location.href = '/api/auth/google?redirect=true';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-white relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="max-w-md w-full glass-card p-8 rounded-3xl space-y-8 relative z-10 border border-slate-800 bg-slate-900/80">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 shadow-xl shadow-indigo-500/30">
            <MailCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
            EmailAgent.ai
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Commercial-grade AI Email Intelligence powered by Google Gemini. Summarize, categorize, extract action items, and draft replies.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <button
            onClick={handleDemoClick}
            className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Launch Live Demo Experience</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleGoogleClick}
            className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign in with Google OAuth</span>
          </button>
        </div>

        {/* Feature Highlights */}
        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-left">
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Zero Auto-Send</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">User stays in total control of draft messages.</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>OAuth 2.0 Safe</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">Encrypted tokens & secure session handling.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

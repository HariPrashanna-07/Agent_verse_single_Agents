import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Settings as SettingsIcon, ShieldCheck, Key, Moon, Sun, Trash2, Check } from 'lucide-react';
import api from '../services/api';

export default function SettingsPage() {
  const { user, isDemoMode, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [geminiKey, setGeminiKey] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSaveSettings = async () => {
    try {
      await api.put('/auth/settings', {
        settings: {
          ...user?.settings,
          theme,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert('Error saving settings');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass-panel p-6 rounded-3xl space-y-2">
        <div className="flex items-center space-x-2 text-indigo-500">
          <SettingsIcon className="w-5 h-5" />
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">System Settings & Connections</h1>
        </div>
        <p className="text-xs text-slate-400">Manage Google Account integration, Gemini API credentials, and application preferences.</p>
      </div>

      {/* Account Info */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Google Account Integration</h3>
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center space-x-3">
            <img src={user?.avatar} alt="Avatar" className="w-10 h-10 rounded-full border border-slate-600" />
            <div>
              <p className="text-sm font-bold text-white">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            {isDemoMode ? 'Demo Session' : 'OAuth Connected'}
          </span>
        </div>
      </div>

      {/* Gemini API Key */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200">Google Gemini API Credentials</h3>
        <p className="text-xs text-slate-400">
          The system defaults to environment-configured Gemini 1.5 Flash. You may override with your custom API key.
        </p>
        <div className="flex space-x-3">
          <div className="relative flex-1">
            <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              placeholder="AIzaSy... (Leave blank to use default Gemini key)"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center space-x-1"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-400" /> : null}
            <span>{saved ? 'Saved!' : 'Save Key'}</span>
          </button>
        </div>
      </div>

      {/* Theme Preference */}
      <div className="glass-card p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200">Appearance Theme</h3>
            <p className="text-xs text-slate-400">Switch between dark glassmorphic interface and bright clean design.</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center space-x-2"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
            <span className="capitalize">{theme} Mode</span>
          </button>
        </div>
      </div>

      {/* Sign Out & Clear Data */}
      <div className="glass-card p-6 rounded-3xl space-y-4 border-rose-500/20">
        <h3 className="text-sm font-bold text-rose-400">Danger Zone</h3>
        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-colors flex items-center space-x-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Sign Out Session</span>
        </button>
      </div>
    </div>
  );
}

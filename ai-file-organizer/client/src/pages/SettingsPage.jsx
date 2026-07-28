import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { getSettingsApi, updateSettingsApi } from '../services/settingsApi';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Sliders, Sun, Moon, Sparkles, Copy, Trash2, Save, ShieldAlert } from 'lucide-react';

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { addToast } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [aiStrictness, setAiStrictness] = useState('balanced');
  const [duplicateDetectionMode, setDuplicateDetectionMode] = useState('hash-and-ai');
  const [ignoredExtensions, setIgnoredExtensions] = useState('.tmp, .log, .ds_store, .sys');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettingsApi();
      if (data.settings) {
        if (data.settings.aiStrictness) setAiStrictness(data.settings.aiStrictness);
        if (data.settings.duplicateDetectionMode) setDuplicateDetectionMode(data.settings.duplicateDetectionMode);
        if (data.settings.ignoredExtensions) setIgnoredExtensions(data.settings.ignoredExtensions.join(', '));
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const exts = ignoredExtensions.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

      const response = await updateSettingsApi({
        aiStrictness,
        duplicateDetectionMode,
        ignoredExtensions: exts,
        theme
      });

      if (response.success) {
        addToast('Settings updated successfully!', 'success');
      }
    } catch (error) {
      console.error('Save Settings Error:', error);
      addToast('Failed to update settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200/60 dark:border-slate-800/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Preferences & Settings
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
            Configure Gemini AI sensitivity, duplicate detection rules, and interface appearance.
          </p>
        </div>
        <Button
          onClick={handleSaveSettings}
          loading={saving}
          variant="primary"
          icon={Save}
        >
          Save Preferences
        </Button>
      </div>

      <div className="space-y-6">
        {/* Appearance Group Card */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <Sun className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Appearance & Theme</h3>
              <p className="text-xs text-slate-400">Choose system display style</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-500/10 text-white ring-2 ring-indigo-500/30'
                  : 'border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:border-slate-400'
              }`}
            >
              <Moon className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-semibold">Dark Mode (Default)</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-24 transition-all ${
                theme === 'light'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-500/30'
                  : 'border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:border-slate-400'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-semibold">Light Mode</span>
            </button>
          </div>
        </Card>

        {/* AI Behavior Group Card */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Gemini AI Strictness</h3>
              <p className="text-xs text-slate-400">Control creativity vs precision for filename & category generation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'flexible', name: 'Flexible', desc: 'Creates broader dynamic categories' },
              { id: 'balanced', name: 'Balanced (Default)', desc: 'Optimal context-driven accuracy' },
              { id: 'strict', name: 'Strict', desc: 'Strict classification & exact naming' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAiStrictness(item.id)}
                className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                  aiStrictness === item.id
                    ? 'border-indigo-500 bg-indigo-500/10 text-slate-900 dark:text-white ring-2 ring-indigo-500/30'
                    : 'border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:border-slate-400'
                }`}
              >
                <h4 className="text-sm font-bold">{item.name}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{item.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Duplicate Detection Mode */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <Copy className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Duplicate Detection Engine</h3>
              <p className="text-xs text-slate-400">Configure multi-layer duplicate evaluation depth</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDuplicateDetectionMode('hash-and-ai')}
              className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                duplicateDetectionMode === 'hash-and-ai'
                  ? 'border-indigo-500 bg-indigo-500/10 text-slate-900 dark:text-white ring-2 ring-indigo-500/30'
                  : 'border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:border-slate-400'
              }`}
            >
              <h4 className="text-sm font-bold">2-Layer Hybrid (Recommended)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">SHA256 Exact Checksum + Gemini Semantic Document Comparison</p>
            </button>

            <button
              type="button"
              onClick={() => setDuplicateDetectionMode('hash-only')}
              className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${
                duplicateDetectionMode === 'hash-only'
                  ? 'border-indigo-500 bg-indigo-500/10 text-slate-900 dark:text-white ring-2 ring-indigo-500/30'
                  : 'border-slate-200/60 dark:border-slate-800/60 text-slate-400 hover:border-slate-400'
              }`}
            >
              <h4 className="text-sm font-bold">SHA256 Hash Only</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Fast exact byte-for-byte duplicate matching only</p>
            </button>
          </div>
        </Card>

        {/* Ignored Extensions */}
        <Card className="space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <Sliders className="w-5 h-5 text-indigo-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Ignored Extensions</h3>
              <p className="text-xs text-slate-400">File extensions to skip during scanning (comma separated)</p>
            </div>
          </div>

          <input
            type="text"
            value={ignoredExtensions}
            onChange={(e) => setIgnoredExtensions(e.target.value)}
            placeholder=".tmp, .log, .ds_store, .sys"
            className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500"
          />
        </Card>

        {/* Danger Zone Card */}
        <Card className="space-y-4 border-rose-500/30">
          <div className="flex items-center gap-3 pb-3 border-b border-rose-500/20">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="text-base font-bold text-rose-600 dark:text-rose-400">Danger Zone</h3>
              <p className="text-xs text-slate-400">Irreversible configuration actions</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Clear Local App Cache</h4>
              <p className="text-xs text-slate-500">Resets local active scan state</p>
            </div>
            <Button
              onClick={() => {
                localStorage.clear();
                addToast('Local state cache cleared.', 'info');
              }}
              variant="danger"
              size="sm"
              icon={Trash2}
            >
              Clear Cache
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;

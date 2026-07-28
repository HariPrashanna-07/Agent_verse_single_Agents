import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Search, RefreshCw, Sparkles, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Navbar({ onSync, syncing }) {
  const { user, isDemoMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between transition-colors">
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Ask AI or search emails (e.g. 'Find invoices' or 'Urgent work')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs md:text-sm rounded-full bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
        />
      </form>

      <div className="flex items-center space-x-3">
        {isDemoMode && (
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Sparkles className="w-3 h-3 mr-1" />
            Demo Mode Active
          </span>
        )}

        <button
          onClick={onSync}
          disabled={syncing}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          title="Sync Gmail Inbox"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-indigo-500' : ''}`} />
        </button>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
            alt="User avatar"
            className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 object-cover"
          />
          <span className="hidden md:inline text-xs font-semibold text-slate-700 dark:text-slate-200">
            {user?.name || 'Alex Rivera'}
          </span>
        </div>
      </div>
    </header>
  );
}

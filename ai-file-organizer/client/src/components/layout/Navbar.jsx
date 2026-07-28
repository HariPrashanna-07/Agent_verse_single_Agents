import React from 'react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, Sun, Moon, Sparkles, Bell, FolderSearch } from 'lucide-react';

const Navbar = ({ onMobileMenuClick }) => {
  const { searchQuery, setSearchQuery, activeScan } = useApp();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 px-4 sm:px-6 flex items-center justify-between transition-colors">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents, categories, or keywords (e.g. 'resume', 'invoices')..."
            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-indigo-500/50 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Active Scan Status Pill & Action Tools */}
      <div className="flex items-center gap-3">
        {activeScan && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Active: {activeScan.folderName} ({activeScan.statistics?.totalFiles || 0} files)</span>
          </div>
        )}

        {/* Notifications Icon */}
        <button
          title="Notifications"
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;

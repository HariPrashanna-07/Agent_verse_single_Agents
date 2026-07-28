import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderPlus, 
  FileSearch, 
  Sparkles, 
  History, 
  Settings, 
  Bot,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Upload Folder', path: '/upload', icon: FolderPlus },
    { name: 'Scan Results', path: '/results', icon: FileSearch },
    { name: 'Organization Plan', path: '/preview', icon: Sparkles },
    { name: 'Scan History', path: '/history', icon: History },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col justify-between p-4 shrink-0 transition-colors">
      {/* Brand Header */}
      <div>
        <div className="flex items-center gap-3 px-3 py-3 mb-6">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none">
              FileOrganizer <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold border border-indigo-500/20">AI</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-400 mt-1">Smart Document Agent</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => (isActive ? 'nav-item-active' : 'nav-item')}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Gemini Agent Status */}
      <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <div className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Gemini 2.5 Active</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Structured JSON Mode</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

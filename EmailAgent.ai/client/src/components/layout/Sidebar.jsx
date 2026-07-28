import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Inbox, Sparkles, MessageSquareReply, Search, History, Settings, LogOut, MailCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
  const { logout } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/inbox', label: 'Inbox', icon: Inbox },
    { to: '/analysis', label: 'AI Intelligence', icon: Sparkles },
    { to: '/reply-generator', label: 'Reply Generator', icon: MessageSquareReply },
    { to: '/search', label: 'NL Search', icon: Search },
    { to: '/history', label: 'Analysis History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] flex flex-col justify-between hidden md:flex transition-colors">
      <div className="p-4 space-y-6">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 px-2 py-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <MailCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">EmailAgent.ai</h1>
            <p className="text-[10px] text-indigo-500 font-semibold tracking-wider uppercase">Gmail Intelligence</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { DailyBriefingCard } from '../components/common/DailyBriefingCard';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { UrgencyBadge } from '../components/common/UrgencyBadge';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { Mail, AlertTriangle, CheckSquare, Calendar, Sparkles, Cpu, DollarSign, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/overview');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSkeleton type="card" count={4} />;
  }

  const { briefing, stats } = data || {};
  const COLORS = ['#6366f1', '#10b981', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* AI Daily Briefing Top Banner */}
      <DailyBriefingCard briefing={briefing} />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Total Emails</span>
            <Mail className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats?.totalEmails || 5}</p>
          <span className="text-[10px] text-slate-400">Synced from Gmail</span>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Unread</span>
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">{stats?.unreadEmails || 2}</p>
          <span className="text-[10px] text-slate-400">Needs attention</span>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Urgent</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">{stats?.urgentEmails || 1}</p>
          <span className="text-[10px] text-rose-500/80 font-medium">Requires action</span>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Tasks Extracted</span>
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{stats?.tasksFound || 4}</p>
          <span className="text-[10px] text-slate-400">Action items</span>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Deadlines</span>
            <Calendar className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">{stats?.deadlinesThisWeek || 2}</p>
          <span className="text-[10px] text-slate-400">This week</span>
        </div>

        <div className="glass-card p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold">Token Usage</span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl font-extrabold text-purple-600 dark:text-purple-400">{stats?.totalTokens || 1250}</p>
          <span className="text-[10px] text-slate-400">${stats?.estimatedCost || 0.00032} Est. Cost</span>
        </div>
      </div>

      {/* Analytics Charts & Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Chart */}
        <div className="glass-card p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Category Distribution</span>
            <Sparkles className="w-4 h-4 text-indigo-500" />
          </h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats?.categoriesChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                  {stats?.categoriesChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Distribution Chart */}
        <div className="glass-card p-6 rounded-3xl space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Inbox Sentiment Analysis</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.sentimentChart}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

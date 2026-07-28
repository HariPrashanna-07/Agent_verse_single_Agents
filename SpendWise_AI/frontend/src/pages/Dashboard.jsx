import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Wallet, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Plus,
  RefreshCw
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart, 
  Bar 
} from 'recharts';
import MetricCard from '../components/MetricCard';
import InsightCard from '../components/InsightCard';
import AddExpenseModal from '../components/AddExpenseModal';
import { getExpenses, getBudgets, getSpendingSummary, getForecast, getBudgetRisks } from '../services/api';

const CATEGORY_COLORS = {
  Food: '#f59e0b',
  Transport: '#3b82f6',
  Shopping: '#ec4899',
  Utilities: '#10b981',
  Entertainment: '#8b5cf6',
  Education: '#06b6d4',
  Healthcare: '#ef4444',
  Rent: '#6366f1',
  Subscription: '#a855f7',
  Other: '#64748b'
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [forecast, setForecast] = useState(null);
  const [risks, setRisks] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, budRes, foreRes, riskRes, expRes] = await Promise.all([
        getSpendingSummary('this_month'),
        getBudgets(),
        getForecast(),
        getBudgetRisks(),
        getExpenses({ limit: 6 })
      ]);

      setSummary(sumRes.data);
      setBudgets(budRes.data);
      setForecast(foreRes.data);
      setRisks(riskRes.data);
      setRecentExpenses(expRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const overallBudget = budgets.find(b => b.category === 'Overall') || { limit: 0, spent: 0, remaining: 0, percentage_used: 0 };
  const totalSpent = summary?.total_spent || 0;
  const remainingBudget = overallBudget.limit > 0 ? (overallBudget.limit - totalSpent) : 0;
  const budgetUsedPct = overallBudget.limit > 0 ? ((totalSpent / overallBudget.limit) * 100).toFixed(1) : 0;

  // Prepare chart data
  const pieData = Object.entries(summary?.category_totals || {}).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Overview Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time expense metrics and autonomous AI insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Spent (Month)"
          amount={`₹${totalSpent.toLocaleString()}`}
          subtitle={`${summary?.transaction_count || 0} transactions`}
          icon={Wallet}
          color="emerald"
        />
        <MetricCard
          title="Monthly Budget"
          amount={overallBudget.limit > 0 ? `₹${overallBudget.limit.toLocaleString()}` : 'Not Set'}
          subtitle="Monthly target limit"
          icon={Target}
          color="blue"
        />
        <MetricCard
          title="Remaining Budget"
          amount={`₹${remainingBudget.toLocaleString()}`}
          subtitle={remainingBudget >= 0 ? 'Within budget' : 'Over budget'}
          icon={DollarSign}
          color={remainingBudget < 0 ? 'rose' : 'amber'}
          badge={remainingBudget < 0 ? 'Exceeded' : 'Safe'}
          badgeType={remainingBudget < 0 ? 'danger' : 'success'}
        />
        <MetricCard
          title="Budget Used %"
          amount={`${budgetUsedPct}%`}
          subtitle={`Daily avg: ₹${summary?.daily_average || 0}`}
          icon={TrendingUp}
          color={budgetUsedPct > 90 ? 'rose' : 'purple'}
        />
        <MetricCard
          title="Predicted Month-End"
          amount={forecast ? `₹${forecast.predicted_monthly_spending.toLocaleString()}` : 'Calculated'}
          subtitle={`${forecast?.remaining_days || 0} days remaining`}
          icon={TrendingUp}
          color={forecast?.risk_level === 'critical' ? 'rose' : 'emerald'}
          badge={forecast?.risk_level || 'Normal'}
          badgeType={forecast?.risk_level === 'critical' ? 'danger' : (forecast?.risk_level === 'warning' ? 'warning' : 'success')}
        />
      </div>

      {/* Autonomous AI Insights Banner Section */}
      {risks.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Autonomous AI Budget Risk Detection
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risks.map((insight, idx) => (
              <InsightCard key={idx} insight={insight} />
            ))}
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Donut */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-1">Category Breakdown</h3>
            <p className="text-xs text-slate-400 mb-4">Distribution of spending across categories</p>
          </div>
          
          <div className="h-64 relative flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-slate-500 text-sm">No expenses recorded yet.</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-800/80">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2 text-xs">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#64748b' }}></span>
                <span className="text-slate-300 truncate">{item.name}:</span>
                <span className="font-semibold text-slate-100 font-mono ml-auto">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget vs Actual Category Comparison Bar Chart */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-1">Budget vs Actual Spending</h3>
            <p className="text-xs text-slate-400 mb-4">Category limits vs current expenditures</p>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgets.filter(b => b.category !== 'Overall')}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  formatter={(val) => `₹${val.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                />
                <Bar dataKey="limit" name="Limit" fill="#334155" radius={[6, 6, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table Widget */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest expense entries recorded in database</p>
          </div>
          <a href="/transactions" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View All <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase bg-slate-900/80 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentExpenses.length > 0 ? (
                recentExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{exp.date}</td>
                    <td className="px-4 py-3 font-medium text-slate-100">{exp.description}</td>
                    <td className="px-4 py-3">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-50 font-mono">
                      ₹{exp.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-slate-500">No transactions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddExpenseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onRefresh={fetchData}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Sparkles, 
  DollarSign, 
  CheckCircle,
  Lightbulb
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { getFullReport } from '../services/api';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await getFullReport();
      setReport(res.data);
    } catch (err) {
      console.error('Error fetching financial report:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 text-sm">
        Generating monthly financial report & data analytics...
      </div>
    );
  }

  const { analytics, comparison, forecast, recommendations, active_warnings } = report || {};

  const handlePrint = () => {
    window.print();
  };

  const categoryBarData = Object.entries(analytics?.category_totals || {}).map(([category, amount]) => ({
    category,
    amount
  }));

  return (
    <div className="space-y-8 pb-12 print:text-black">
      {/* Top Action Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-400" />
            Financial Health & Forecast Report
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Comprehensive monthly audit, MoM analysis, and AI recommendations
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all flex items-center space-x-2 print:hidden"
        >
          <Printer className="w-4 h-4 text-emerald-400" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs uppercase text-slate-400 font-medium">Total Monthly Spending</span>
          <p className="text-2xl font-bold text-slate-50 mt-1 font-mono">₹{analytics?.total_spent?.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-2">{analytics?.transaction_count} Total Transactions</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs uppercase text-slate-400 font-medium">Daily Average</span>
          <p className="text-2xl font-bold text-slate-50 mt-1 font-mono">₹{analytics?.daily_average?.toLocaleString()}/day</p>
          <p className="text-xs text-slate-400 mt-2">Over {analytics?.days_in_period} Days</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs uppercase text-slate-400 font-medium">Highest Category</span>
          <p className="text-2xl font-bold text-amber-400 mt-1">{analytics?.highest_spending_category?.category}</p>
          <p className="text-xs text-slate-400 mt-2">₹{analytics?.highest_spending_category?.amount?.toLocaleString()}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <span className="text-xs uppercase text-slate-400 font-medium">Month-Over-Month</span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-50 font-mono">
              {comparison?.percentage_change}%
            </span>
            {comparison?.direction === 'increased' ? (
              <TrendingUp className="w-5 h-5 text-rose-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">Vs previous month (₹{comparison?.period2?.total_spent?.toLocaleString()})</p>
        </div>
      </div>

      {/* Forecast & Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Month-End Deterministic Forecast */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              Deterministic Month-End Forecast
            </h3>
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              {forecast?.remaining_days} days left
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Spent So Far:</span>
              <span className="font-semibold text-slate-100 font-mono">₹{forecast?.spent_so_far?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Average Burn Rate:</span>
              <span className="font-semibold text-slate-100 font-mono">₹{forecast?.average_daily_spending?.toLocaleString()}/day</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/60">
              <span className="text-slate-400">Predicted Total:</span>
              <span className="font-bold text-emerald-400 font-mono text-base">₹{forecast?.predicted_monthly_spending?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Budget Limit:</span>
              <span className="font-semibold text-slate-100 font-mono">₹{forecast?.budget_limit?.toLocaleString() || 'Not set'}</span>
            </div>
          </div>
        </div>

        {/* Largest Single Transaction */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              Largest Single Transaction
            </h3>
          </div>

          {analytics?.largest_transaction ? (
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-100 text-lg">{analytics.largest_transaction.description}</h4>
                  <span className="text-xs text-slate-400">{analytics.largest_transaction.date}</span>
                </div>
                <span className="text-xl font-extrabold text-amber-400 font-mono">
                  ₹{analytics.largest_transaction.amount?.toLocaleString()}
                </span>
              </div>
              <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-semibold">
                Category: {analytics.largest_transaction.category}
              </span>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">No transaction recorded.</p>
          )}
        </div>
      </div>

      {/* Category Spending Bar Chart */}
      <div className="glass-panel p-6 rounded-2xl">
        <h3 className="text-base font-bold text-slate-100 mb-4">Category Expenditures</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="category" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₹${v}`} />
              <Tooltip
                formatter={(val) => `₹${val.toLocaleString()}`}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
              />
              <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grounded Personalized Savings Recommendations */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <h3 className="text-base font-bold text-slate-100">
            Data-Grounded Savings Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations?.map((rec, idx) => (
            <div key={idx} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-200">{rec.category}</span>
                {rec.potential_savings > 0 && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Save ₹{rec.potential_savings.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{rec.reasoning}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import { createExpense, updateExpense } from '../services/api';

const CATEGORIES = [
  "Food", "Transport", "Shopping", "Utilities", "Entertainment",
  "Education", "Healthcare", "Rent", "Subscription", "Other"
];

export default function AddExpenseModal({ isOpen, onClose, onRefresh, initialData = null }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount);
      setCategory(initialData.category);
      setDescription(initialData.description);
      setDate(initialData.date);
    } else {
      setAmount('');
      setCategory('Food');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    setLoading(true);
    try {
      if (initialData) {
        await updateExpense(initialData.id, {
          amount: parseFloat(amount),
          category,
          description,
          date
        });
      } else {
        await createExpense({
          amount: parseFloat(amount),
          category,
          description,
          date
        });
      }
      onRefresh();
      onClose();
    } catch (err) {
      console.error('Error saving expense:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            {initialData ? 'Edit Expense' : 'Add New Expense'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 250"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-brand-500 font-mono text-base"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-brand-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Description</label>
            <input
              type="text"
              required
              placeholder="e.g. Lunch at Cafe"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm transition-colors flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : (initialData ? 'Update Expense' : 'Save Expense')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getExpenses = (params) => api.get('/expenses', { params });
export const createExpense = (data) => api.post('/expenses', data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

export const getBudgets = (month, year) => api.get('/budgets', { params: { month, year } });
export const setBudget = (data) => api.post('/budgets', data);
export const getBudgetRisks = () => api.get('/budgets/risks');

export const getSpendingSummary = (period = 'this_month') => api.get('/analytics/summary', { params: { period } });
export const compareSpending = (period1 = 'this_month', period2 = 'last_month') => api.get('/analytics/compare', { params: { period1, period2 } });
export const getForecast = (month, year) => api.get('/analytics/forecast', { params: { month, year } });
export const getRecommendations = (period = 'this_month') => api.get('/analytics/recommendations', { params: { period } });
export const getFullReport = (month, year) => api.get('/analytics/report', { params: { month, year } });

export const sendAgentChat = (message, history = []) => api.post('/agent/chat', { message, history });
export const scanReceipt = (formData) => api.post('/ocr/scan', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export default api;

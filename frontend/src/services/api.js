import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

// Habits
export const getHabits = (params) => api.get('/api/habits', { params })
export const createHabit = (data) => api.post('/api/habits', data)
export const updateHabit = (id, data) => api.put(`/api/habits/${id}`, data)
export const deleteHabit = (id) => api.delete(`/api/habits/${id}`)
export const getHabitStreak = (id) => api.get(`/api/habits/${id}/streak`)
export const getHabitAnalysis = (id, days = 7) => api.get(`/api/habits/${id}/analysis`, { params: { days } })

// Progress
export const logProgress = (data) => api.post('/api/progress', data)
export const getProgress = (habitId, days = 30) => api.get(`/api/progress/${habitId}`, { params: { days } })
export const getProgressStreak = (habitId) => api.get(`/api/progress/${habitId}/streak`)
export const getProgressAnalysis = (habitId, days = 7) => api.get(`/api/progress/${habitId}/analysis`, { params: { days } })

// Dashboard
export const getDashboard = () => api.get('/api/dashboard')

// Insights
export const getInsights = () => api.get('/api/insights')

// Reports
export const getWeeklyReport = () => api.get('/api/reports/weekly')
export const getMonthlyReport = () => api.get('/api/reports/monthly')

// Agent
export const chatWithAgent = (message, history = []) =>
  api.post('/api/agent/chat', { message, history })

// Adapt goal
export const adaptGoal = (habitId, newTarget, reason) =>
  api.post('/api/agent/chat', {
    message: `Change habit ${habitId} target to ${newTarget} because: ${reason}`,
    history: [],
  })

export default api

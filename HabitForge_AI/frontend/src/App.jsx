import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Habits from './pages/Habits'
import TodayGoals from './pages/TodayGoals'
import AICoach from './pages/AICoach'
import Progress from './pages/Progress'
import Insights from './pages/Insights'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="habits" element={<Habits />} />
          <Route path="today" element={<TodayGoals />} />
          <Route path="coach" element={<AICoach />} />
          <Route path="progress" element={<Progress />} />
          <Route path="insights" element={<Insights />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

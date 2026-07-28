import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AIAssistant from './pages/AIAssistant';
import Reports from './pages/Reports';
import ReceiptOCR from './pages/ReceiptOCR';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="chat" element={<AIAssistant />} />
          <Route path="reports" element={<Reports />} />
          <Route path="ocr" element={<ReceiptOCR />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

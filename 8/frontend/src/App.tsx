import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import HomePage from './pages/HomePage';
import ProposalDetailPage from './pages/ProposalDetailPage';

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/proposals/:id" element={<ProposalDetailPage />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
};

export default App;

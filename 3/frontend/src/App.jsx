import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import SurveyList from './pages/SurveyList.jsx';
import SurveyEditor from './pages/SurveyEditor.jsx';
import AnswerPage from './pages/AnswerPage.jsx';
import ThankYouPage from './pages/ThankYouPage.jsx';
import StatsPage from './pages/StatsPage.jsx';

export default function App() {
  const navigate = useNavigate();
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="navbar-brand">
          📝<span>在线问卷系统</span>
        </Link>
        <div className="navbar-actions">
          <button className="btn-primary" onClick={() => navigate('/new')}>
            + 新建问卷
          </button>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<SurveyList />} />
        <Route path="/new" element={<SurveyEditor />} />
        <Route path="/edit/:id" element={<SurveyEditor />} />
        <Route path="/answer/:id" element={<AnswerPage />} />
        <Route path="/thanks" element={<ThankYouPage />} />
        <Route path="/stats/:id" element={<StatsPage />} />
        <Route path="*" element={<SurveyList />} />
      </Routes>
    </>
  );
}

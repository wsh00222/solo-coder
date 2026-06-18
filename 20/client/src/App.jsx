import React from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { ToastProvider } from './components/Feedback.jsx';
import NoteList from './pages/NoteList.jsx';
import NoteDetail from './pages/NoteDetail.jsx';
import NoteEditor from './pages/NoteEditor.jsx';

function Header() {
  const loc = useLocation();
  const nav = useNavigate();
  const showCreate = loc.pathname === '/' || loc.pathname === '';
  return (
    <header className="app-header">
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="app-title">
          <span className="emoji">📒</span>
          <span>个人笔记</span>
        </div>
      </Link>
      {showCreate && (
        <button className="btn btn-primary" onClick={() => nav('/new')}>
          ➕ 新建笔记
        </button>
      )}
    </header>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<NoteList />} />
          <Route path="/note/:id" element={<NoteDetail />} />
          <Route path="/note/:id/edit" element={<NoteEditor />} />
          <Route path="/new" element={<NoteEditor />} />
          <Route path="*" element={<NoteList />} />
        </Routes>
      </div>
    </ToastProvider>
  );
}

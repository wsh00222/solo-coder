import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import MovieList from './pages/MovieList.jsx';
import MovieDetail from './pages/MovieDetail.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="container header-inner">
          <Link to="/" className="app-title">
            <span className="title-icon">🎬</span>
            <span>我的电影收藏</span>
          </Link>
          <nav className="app-nav">
            <Link to="/" className="nav-link">片单</Link>
          </nav>
        </div>
      </header>
      <main className="container main-content">
        <Routes>
          <Route path="/" element={<MovieList />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
        </Routes>
      </main>
      <footer className="app-footer">
        <div className="container">个人电影收藏与评分管理 · 全栈 Demo</div>
      </footer>
    </div>
  );
}

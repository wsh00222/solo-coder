import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RecipeList from './pages/RecipeList.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import RecipeForm from './pages/RecipeForm.jsx';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>🍳 食谱收藏</h1>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/add" element={<RecipeForm />} />
          <Route path="/edit/:id" element={<RecipeForm />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

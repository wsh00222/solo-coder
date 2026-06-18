import React from 'react'
import { Routes, Route } from 'react-router-dom'
import BookList from './pages/BookList.jsx'
import BookDetail from './pages/BookDetail.jsx'
import BookForm from './pages/BookForm.jsx'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>📚 我的书籍收藏</h1>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/add" element={<BookForm mode="add" />} />
          <Route path="/edit/:id" element={<BookForm mode="edit" />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

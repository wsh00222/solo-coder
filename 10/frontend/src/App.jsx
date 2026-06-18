import { Routes, Route } from 'react-router-dom'
import BookList from './pages/BookList.jsx'
import BookDetail from './pages/BookDetail.jsx'
import BookEdit from './pages/BookEdit.jsx'
import BookAdd from './pages/BookAdd.jsx'

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold">📚 个人书单管理器</h1>
          <p className="text-indigo-100 text-sm mt-1">记录你的每一次阅读旅程</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Routes>
          <Route path="/" element={<BookList />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/book/add" element={<BookAdd />} />
          <Route path="/book/:id/edit" element={<BookEdit />} />
        </Routes>
      </main>
      <footer className="mt-12 py-6 text-center text-gray-400 text-sm">
        © 2024 个人书单管理器
      </footer>
    </div>
  )
}

export default App

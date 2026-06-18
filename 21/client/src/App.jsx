import { Routes, Route } from 'react-router-dom';
import BookListPage from './pages/BookListPage.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📚 我的书籍收藏</h1>
        <p>记录每一本读过的书，珍藏每一段文字时光</p>
      </header>
      <Routes>
        <Route path="/" element={<BookListPage />} />
        <Route path="/book/:id" element={<BookDetailPage />} />
      </Routes>
    </div>
  );
}

export default App;

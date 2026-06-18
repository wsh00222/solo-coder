import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StarRating from '../components/StarRating.jsx';
import Modal from '../components/Modal.jsx';
import BookForm from '../components/BookForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Toast from '../components/Toast.jsx';
import { fetchBookById, updateBook, deleteBook } from '../api/books.js';
import '../styles/pages/BookDetailPage.css';

const statusConfig = {
  '想读': { color: '#3498db', bg: '#ebf5fb', icon: '📌' },
  '在读': { color: '#e67e22', bg: '#fdf2e9', icon: '📖' },
  '读完': { color: '#27ae60', bg: '#eafaf1', icon: '✅' }
};

const genreConfig = {
  '小说': { icon: '📖', desc: '虚构文学作品' },
  '科技': { icon: '🔬', desc: '科学技术类' },
  '生活': { icon: '🏠', desc: '生活实用类' },
  '其他': { icon: '📚', desc: '综合类书籍' }
};

function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadBook = async () => {
    try {
      setLoading(true);
      const data = await fetchBookById(id);
      setBook(data);
    } catch (error) {
      showToast('加载书籍详情失败：' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBook();
  }, [id]);

  const handleUpdateBook = async (bookData) => {
    try {
      const updated = await updateBook(id, bookData);
      setBook(updated);
      setShowEditModal(false);
      showToast('书籍信息已更新！');
    } catch (error) {
      showToast('更新失败：' + error.message, 'error');
    }
  };

  const handleDeleteBook = async () => {
    try {
      await deleteBook(id);
      showToast('书籍已删除');
      setTimeout(() => navigate('/'), 800);
    } catch (error) {
      showToast('删除失败：' + error.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">正在加载书籍详情...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="book-not-found">
        <div className="book-not-found-icon">😢</div>
        <h2>书籍不存在</h2>
        <p>可能已被删除或链接无效</p>
        <Link to="/" className="btn btn-primary">
          ← 返回书架
        </Link>
      </div>
    );
  }

  const statusStyle = statusConfig[book.status] || statusConfig['读完'];
  const genreStyle = genreConfig[book.genre] || genreConfig['其他'];

  return (
    <div className="book-detail-page">
      <Link to="/" className="back-link">
        ← 返回书架
      </Link>

      <div className="detail-card card">
        <div className="detail-header">
          <div className="detail-genre-badge" title={genreStyle.desc}>
            <span className="genre-icon">{genreStyle.icon}</span>
            <span className="genre-name">{book.genre}</span>
          </div>
          <div
            className="detail-status-badge"
            style={{ background: statusStyle.bg, color: statusStyle.color }}
          >
            {statusStyle.icon} {book.status}
          </div>
        </div>

        <h1 className="detail-title">{book.title}</h1>

        <div className="detail-rating-section">
          <StarRating rating={book.rating} size="large" />
          <span className="detail-rating-text">{book.rating}.0 / 5.0</span>
        </div>

        <div className="detail-info-grid">
          <div className="info-item">
            <span className="info-icon">✍️</span>
            <div className="info-content">
              <span className="info-label">作者</span>
              <span className="info-value">{book.author}</span>
            </div>
          </div>

          <div className="info-item">
            <span className="info-icon">📅</span>
            <div className="info-content">
              <span className="info-label">出版年份</span>
              <span className="info-value">{book.year} 年</span>
            </div>
          </div>

          <div className="info-item">
            <span className="info-icon">📚</span>
            <div className="info-content">
              <span className="info-label">类型</span>
              <span className="info-value">{book.genre} · {genreStyle.desc}</span>
            </div>
          </div>

          <div className="info-item">
            <span className="info-icon">⭐</span>
            <div className="info-content">
              <span className="info-label">评分</span>
              <span className="info-value">{book.rating} 星</span>
            </div>
          </div>
        </div>

        <div className="detail-actions">
          <button
            className="btn btn-primary"
            onClick={() => setShowEditModal(true)}
          >
            ✏️ 编辑书籍
          </button>
          <button
            className="btn btn-danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            🗑️ 删除书籍
          </button>
        </div>
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="✏️ 编辑书籍"
      >
        <BookForm
          initialData={book}
          onSubmit={handleUpdateBook}
          onCancel={() => setShowEditModal(false)}
          submitText="保存修改"
        />
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteBook}
        title="删除确认"
        message={`确定要删除《${book.title}》吗？此操作无法撤销。`}
        confirmText="确认删除"
        type="danger"
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}

export default BookDetailPage;

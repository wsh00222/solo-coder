import { useNavigate } from 'react-router-dom';
import StarRating from './StarRating.jsx';
import '../styles/components/BookCard.css';

const statusConfig = {
  '想读': { color: '#3498db', bg: '#ebf5fb' },
  '在读': { color: '#e67e22', bg: '#fdf2e9' },
  '读完': { color: '#27ae60', bg: '#eafaf1' }
};

const genreIcons = {
  '小说': '📖',
  '科技': '🔬',
  '生活': '🏠',
  '其他': '📚'
};

function BookCard({ book }) {
  const navigate = useNavigate();
  const statusStyle = statusConfig[book.status] || statusConfig['其他'];

  return (
    <div
      className="book-card"
      onClick={() => navigate(`/book/${book.id}`)}
    >
      <div className="book-card-header">
        <span className="book-genre-icon">{genreIcons[book.genre] || '📚'}</span>
        <span
          className="book-status-tag"
          style={{ background: statusStyle.bg, color: statusStyle.color }}
        >
          {book.status}
        </span>
      </div>

      <div className="book-card-body">
        <h3 className="book-title" title={book.title}>
          {book.title}
        </h3>
        <p className="book-author">
          ✍️ {book.author} · {book.year}年
        </p>
      </div>

      <div className="book-card-footer">
        <StarRating rating={book.rating} size="small" />
        <span className="book-rating-text">{book.rating}.0</span>
      </div>
    </div>
  );
}

export default BookCard;

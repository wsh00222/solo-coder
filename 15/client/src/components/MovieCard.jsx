import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { renderStars, statusColor, genreColor, isAnniversary } from '../utils/helpers.js';
import Modal from './Modal.jsx';
import { movieApi } from '../services/movieApi.js';

const GENRE_EMOJI = {
  '剧情': '🎭', '喜剧': '😂', '动作': '💥', '科幻': '🚀', '其他': '🎞️'
};

export default function MovieCard({ movie, selectable, selected, onSelect, onUpdate, onToast }) {
  const navigate = useNavigate();
  const [showRate, setShowRate] = useState(false);
  const [rate, setRate] = useState('');
  const [loading, setLoading] = useState(false);

  const st = statusColor(movie.status);
  const ge = genreColor(movie.genre);
  const anniv = isAnniversary(movie.watchDate);

  const handleCard = (e) => {
    if (e.target.closest('.card-select, .card-actions, .card-badges')) return;
    navigate(`/movie/${movie.id}`);
  };

  const handleMarkWatched = async () => {
    setRate('');
    setShowRate(true);
  };

  const confirmMark = async () => {
    try {
      setLoading(true);
      const updated = await movieApi.markAsWatched(movie.id, rate || null);
      setShowRate(false);
      onUpdate && onUpdate(updated);
      onToast && onToast('已标记为已看', 'success');
    } catch (err) {
      onToast && onToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="movie-card" onClick={handleCard}>
        {selectable && (
          <input
            type="checkbox"
            className="card-select"
            checked={selected}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onSelect && onSelect(movie.id, e.target.checked)}
          />
        )}
        <div className="card-badges">
          {anniv && <span className="badge badge-anniv">🎂 {anniv}周年</span>}
          <span className="badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
        </div>
        <div className={`card-cover g-${movie.genre}`}>
          <span className="card-emoji">{GENRE_EMOJI[movie.genre] || '🎬'}</span>
        </div>
        <div className="card-body">
          <div className="card-title">{movie.title}</div>
          <div className="card-meta">🎬 {movie.director} · {movie.year}</div>
          <div className="card-meta" style={{ marginTop: -2 }}>
            <span className="badge" style={{ background: ge.bg, color: ge.color, padding: '1px 8px' }}>{movie.genre}</span>
          </div>
          <div className="card-row">
            <div className={movie.rating ? 'card-rating' : 'card-rating none'}>
              <span className="stars">{renderStars(movie.rating)}</span>
              {movie.rating ? ` ${movie.rating}.0` : ' 未评分'}
            </div>
            {movie.watchDate && <div className="card-meta">📅 {movie.watchDate}</div>}
          </div>
        </div>
        {movie.status === '想看' && (
          <div className="card-actions">
            <button
              className="btn btn-success btn-sm flex-1"
              onClick={(e) => { e.stopPropagation(); handleMarkWatched(); }}
            >✓ 标记为已看</button>
          </div>
        )}
      </div>

      <Modal
        open={showRate}
        title="给电影打个分吧（可选）"
        onClose={() => !loading && setShowRate(false)}
        footer={
          <>
            <button className="btn" onClick={() => setShowRate(false)} disabled={loading}>跳过</button>
            <button className="btn btn-primary" onClick={confirmMark} disabled={loading}>
              {loading ? '提交中...' : '确认标记'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">评分（1-10 整数，可选）</label>
          <input
            type="number"
            className="input form-input"
            min="1"
            max="10"
            placeholder="留空则不评分"
            value={rate}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '' || (parseInt(v, 10) >= 1 && parseInt(v, 10) <= 10)) setRate(v);
            }}
          />
        </div>
        <p style={{ fontSize: 13, color: '#64748b' }}>
          提交后状态将变为「已看」，观看日期设为今天。
        </p>
      </Modal>
    </>
  );
}

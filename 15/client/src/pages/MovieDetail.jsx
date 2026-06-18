import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal.jsx';
import MovieForm from '../components/MovieForm.jsx';
import { movieApi } from '../services/movieApi.js';
import { renderStars, statusColor, genreColor, isAnniversary, formatDate } from '../utils/helpers.js';

const GENRE_EMOJI = {
  '剧情': '🎭', '喜剧': '😂', '动作': '💥', '科幻': '🚀', '其他': '🎞️'
};

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type, id: Date.now() });
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const load = async () => {
    setLoading(true);
    try {
      const m = await movieApi.get(id);
      setMovie(m);
    } catch (err) {
      showToast(err.message, 'error');
      setTimeout(() => navigate('/'), 1500);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleEdit = async (data) => {
    try {
      const m = await movieApi.update(id, data);
      setMovie(m);
      setEditOpen(false);
      showToast('修改成功', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await movieApi.remove(id);
      setDelOpen(false);
      showToast('删除成功', 'success');
      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>加载中...</div>;
  }
  if (!movie) return null;

  const st = statusColor(movie.status);
  const ge = genreColor(movie.genre);
  const anniv = isAnniversary(movie.watchDate);

  return (
    <div>
      {toast && <div className={`toast toast-${toast.type}`}>{toast.msg}</div>}

      <Link to="/" className="back-btn">← 返回片单</Link>

      <div className="detail-card">
        <div className="detail-header">
          <div className={`detail-cover g-${movie.genre}`}>
            <span className="card-emoji">{GENRE_EMOJI[movie.genre] || '🎬'}</span>
          </div>
          <div className="detail-info">
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <h1 className="detail-title">{movie.title}</h1>
              {anniv > 0 && (
                <span className="badge badge-anniv" style={{ fontSize: 13, padding: '6px 14px' }}>
                  🎂 观影 {anniv} 周年纪念
                </span>
              )}
            </div>
            <div className="detail-tags">
              <span className="badge" style={{ background: st.bg, color: st.color, fontSize: 12 }}>{st.label}</span>
              <span className="badge" style={{ background: ge.bg, color: ge.color, fontSize: 12 }}>{movie.genre}</span>
            </div>
            {movie.rating ? (
              <div style={{ marginBottom: 16 }}>
                <span className="detail-rating-big">{movie.rating}</span>
                <span style={{ fontSize: 20, color: '#f59e0b', marginLeft: 4 }}>★</span>
                <span style={{ marginLeft: 12, fontSize: 14, color: '#64748b' }}>{renderStars(movie.rating)}</span>
              </div>
            ) : (
              <div style={{ marginBottom: 16, color: '#94a3b8', fontSize: 14 }}>尚未评分</div>
            )}
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">导演</span>
                <span className="detail-value">{movie.director}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">上映年份</span>
                <span className="detail-value">{movie.year} 年</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">观看状态</span>
                <span className="detail-value" style={{ color: st.color, fontWeight: 600 }}>{movie.status}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">观看日期</span>
                <span className="detail-value">{formatDate(movie.watchDate)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-notes">
          <h3>📝 我的备注</h3>
          {movie.notes ? (
            <p>{movie.notes}</p>
          ) : (
            <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>暂无备注，点击「编辑」添加你的观影感想吧。</p>
          )}
        </div>

        <div className="detail-actions">
          <button className="btn btn-primary" onClick={() => setEditOpen(true)}>✎ 编辑信息</button>
          <button className="btn btn-danger" onClick={() => setDelOpen(true)}>🗑 删除此电影</button>
          <button className="btn" onClick={() => navigate('/')}>← 返回列表</button>
        </div>
      </div>

      <Modal
        open={editOpen}
        title="编辑电影"
        onClose={() => setEditOpen(false)}
      >
        <MovieForm
          initial={movie}
          submitText="保存修改"
          onSubmit={handleEdit}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <Modal
        open={delOpen}
        title="确认删除"
        onClose={() => setDelOpen(false)}
        footer={
          <>
            <button className="btn" onClick={() => setDelOpen(false)}>取消</button>
            <button className="btn btn-danger" onClick={handleDelete}>确认删除</button>
          </>
        }
      >
        <p className="confirm-msg">
          确定要删除电影 <strong>《{movie.title}》</strong>？<br />
          此操作无法撤销，所有相关信息将被永久移除。
        </p>
      </Modal>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api, formatDate, linkify } from '../lib/utils.js';
import { useToast, ConfirmModal } from '../components/Feedback.jsx';

function LinkifiedContent({ text }) {
  const lines = String(text || '').split('\n');
  return (
    <div className="detail-content">
      {lines.map((line, li) => {
        const parts = linkify(line);
        return (
          <div key={li}>
            {parts.length === 0 ? (
              <br />
            ) : (
              parts.map(p =>
                p.type === 'link' ? (
                  <a
                    key={p.key}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {p.display}
                  </a>
                ) : (
                  <span key={p.key}>{p.content}</span>
                )
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await api.getNote(id);
        setNote(data);
      } catch (e) {
        setError(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteNote(id);
      setConfirmOpen(false);
      pushToast('success', '笔记已删除');
      setTimeout(() => navigate('/'), 300);
    } catch (e) {
      pushToast('error', e.message || '删除失败');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="back-link" onClick={() => navigate(-1)}>← 返回列表</div>

      {loading && <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>加载中...</div>}
      {error && !loading && (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <div className="empty-title">出错了</div>
          <div className="empty-desc">{error}</div>
          <button className="btn btn-primary" onClick={() => navigate('/')}>返回列表</button>
        </div>
      )}

      {!loading && !error && note && (
        <div className="detail-wrap">
          <div className="detail-head">
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 className="detail-title">{note.title}</h1>
              <div className="detail-meta">
                <span>🕒 创建于 {formatDate(note.createdAt)}</span>
                <span>✏️ 修改于 {formatDate(note.updatedAt)}</span>
              </div>
              {note.tags?.length > 0 && (
                <div className="note-tags">
                  {note.tags.map(t => (
                    <span key={t} className="tag-mini">#{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="detail-actions">
              <button
                className="btn btn-secondary"
                onClick={() => navigate(`/note/${note.id}/edit`)}
              >
                ✏️ 编辑
              </button>
              <button
                className="btn btn-danger"
                onClick={() => setConfirmOpen(true)}
              >
                🗑️ 删除
              </button>
            </div>
          </div>

          <LinkifiedContent text={note.content} />
        </div>
      )}

      <ConfirmModal
        title={confirmOpen ? '删除笔记' : ''}
        body={confirmOpen ? (
          <>确定要删除笔记「<strong>{note?.title || ''}</strong>」吗？<br />此操作无法撤销。</>
        ) : ''}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}

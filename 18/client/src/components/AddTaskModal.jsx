import React, { useState, useEffect } from 'react';

export default function AddTaskModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setError('');
      setSubmitting(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('标题不能为空');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        status,
        priority
      });
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.error || err.message || '添加失败，请重试';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">✨ 添加新任务</h2>
          <button className="modal-close" onClick={onClose} aria-label="关闭">×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">标题 *</label>
            <input
              type="text"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="例如：完成项目原型设计"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              autoFocus
            />
            {error && <div className="form-error">{error}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">描述</label>
            <textarea
              className="form-textarea"
              placeholder="添加任务的详细描述（可选）"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">状态</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="todo">待办</option>
                <option value="in_progress">进行中</option>
                <option value="done">已完成</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">优先级</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="high">高 🔴</option>
                <option value="medium">中 🟡</option>
                <option value="low">低 🟢</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>取消</button>
            <button type="submit" className="btn-confirm" disabled={submitting}>
              {submitting ? '提交中...' : '添加任务'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

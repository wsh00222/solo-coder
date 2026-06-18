import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts(list => [...list, { id, type, message }]);
    setTimeout(() => {
      setToasts(list => list.filter(t => t.id !== id));
    }, 2400);
  }, []);

  return (
    <ToastCtx.Provider value={{ pushToast }}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ConfirmModal({ title, body, onCancel, onConfirm, loading }) {
  if (!title && !body) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <div className="modal-body">{body}</div>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            取消
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? '处理中...' : '确认删除'}
          </button>
        </div>
      </div>
    </div>
  );
}

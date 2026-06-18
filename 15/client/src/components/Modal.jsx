import React, { useEffect } from 'react';

export default function Modal({ open, title, onClose, children, footer, width }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose && onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlay}>
      <div className="modal" style={width ? { maxWidth: width } : undefined}>
        {title && (
          <div className="modal-header">
            <div className="modal-title">{title}</div>
            <button className="modal-close" onClick={onClose} aria-label="关闭">×</button>
          </div>
        )}
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

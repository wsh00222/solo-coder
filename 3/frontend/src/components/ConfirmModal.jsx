import React from 'react';

/**
 * 二次确认弹窗
 * Props:
 *  - open: boolean
 *  - title: string
 *  - desc: string
 *  - confirmText?: string
 *  - cancelText?: string
 *  - onConfirm: () => void
 *  - onCancel: () => void
 *  - danger?: boolean 确认按钮红色
 */
export default function ConfirmModal({
  open,
  title,
  desc,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  danger = false,
}) {
  if (!open) return null;
  return (
    <div className="modal-mask" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-desc">{desc}</p>
        <div className="modal-actions">
          <button className="btn-outline" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

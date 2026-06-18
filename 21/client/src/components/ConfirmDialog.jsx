import Modal from './Modal.jsx';
import '../styles/components/ConfirmDialog.css';

function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = '确认操作',
  message = '确定要执行此操作吗？',
  confirmText = '确认',
  cancelText = '取消',
  type = 'default'
}) {
  const iconConfig = {
    default: { icon: '❓', color: '#667eea' },
    danger: { icon: '⚠️', color: '#e74c3c' },
    warning: { icon: '⚡', color: '#f39c12' },
    success: { icon: '✅', color: '#27ae60' }
  };

  const config = iconConfig[type] || iconConfig.default;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="confirm-dialog">
        <div className="confirm-icon" style={{ background: `${config.color}20`, color: config.color }}>
          {config.icon}
        </div>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;

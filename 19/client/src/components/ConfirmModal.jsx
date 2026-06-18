function ConfirmModal({ title, message, detail, onConfirm, onCancel, danger }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>

        <p className="confirm-message">{message}</p>

        {detail && (
          <div className="confirm-detail">{detail}</div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={onCancel}
          >
            取消
          </button>
          <button
            type="button"
            className={danger ? 'btn-danger' : 'btn-confirm'}
            onClick={onConfirm}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal

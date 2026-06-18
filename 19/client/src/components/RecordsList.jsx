function RecordsList({ records, loading, deletingIds, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="records-list">
        <div className="empty-state">
          <div className="empty-icon">⏳</div>
          <div className="empty-text">加载中...</div>
        </div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="records-list">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <div className="empty-text">还没有任何记录</div>
          <div className="empty-hint">点击右上角"添加记录"开始记账吧</div>
        </div>
      </div>
    )
  }

  const getCategoryIcon = (category, isIncome) => {
    if (isIncome) return '💵'
    const icons = {
      '餐饮': '🍜',
      '交通': '🚇',
      '购物': '🛒',
      '娱乐': '🎮',
      '医疗': '🏥',
      '教育': '📚',
      '其他': '📌'
    }
    return icons[category] || '📌'
  }

  return (
    <div>
      <div className="records-list">
        {records.map(record => {
          const isIncome = record.amount > 0
          const isDeleting = deletingIds.includes(record.id)

          return (
            <div
              key={record.id}
              className={`record-item ${isDeleting ? 'deleting' : ''}`}
            >
              <div className={`record-icon ${isIncome ? 'income-bg' : 'expense-bg'}`}>
                {getCategoryIcon(record.category, isIncome)}
              </div>

              <div className="record-info">
                <div className="record-category">{record.category}</div>
                <div className="record-meta">
                  <span>{record.date}</span>
                  {record.note && (
                    <span className="record-note">{record.note}</span>
                  )}
                </div>
              </div>

              <div className={`record-amount ${isIncome ? 'positive' : 'negative'}`}>
                {isIncome ? '+' : ''}{record.amount.toFixed(2)}
              </div>

              <div className="record-actions">
                <button
                  className="edit-btn"
                  onClick={() => onEdit(record)}
                >
                  编辑
                </button>
                <button
                  className="delete-btn"
                  onClick={() => onDelete(record)}
                >
                  删除
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="list-footer">
        共 {records.length} 条记录
      </div>
    </div>
  )
}

export default RecordsList

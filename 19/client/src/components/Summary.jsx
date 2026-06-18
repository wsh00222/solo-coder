function Summary({ summary }) {
  return (
    <div className="summary">
      <div className="summary-title">本月结余</div>
      <div className="summary-balance">
        ¥ {summary.balance.toFixed(2)}
      </div>
      <div className="summary-details">
        <div className="summary-item">
          <div className="summary-item-label">总收入</div>
          <div className="summary-item-value income">
            + ¥ {summary.income.toFixed(2)}
          </div>
        </div>
        <div className="summary-item">
          <div className="summary-item-label">总支出</div>
          <div className="summary-item-value expense">
            - ¥ {summary.expense.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Summary

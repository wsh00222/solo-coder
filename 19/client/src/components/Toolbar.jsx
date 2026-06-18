function Toolbar({
  categories,
  categoryFilter,
  onCategoryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onAdd,
  onReset
}) {
  return (
    <div className="toolbar">
      <div className="filters">
        <div className="filter-group">
          <label>类别:</label>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="全部">全部</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>开始:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>结束:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
          />
        </div>

        <button
          className="add-btn"
          onClick={onAdd}
        >
          + 添加记录
        </button>
      </div>
    </div>
  )
}

export default Toolbar

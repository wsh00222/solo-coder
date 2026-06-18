import '../styles/components/FilterBar.css';

function FilterBar({
  statusFilter,
  setStatusFilter,
  genreFilter,
  setGenreFilter,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  onAddBook
}) {
  return (
    <div className="filter-bar">
      <div className="filter-controls">
        <div className="filter-item">
          <label className="filter-label">状态</label>
          <select
            className="form-select filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">全部</option>
            <option value="想读">想读</option>
            <option value="在读">在读</option>
            <option value="读完">读完</option>
          </select>
        </div>

        <div className="filter-item">
          <label className="filter-label">类型</label>
          <select
            className="form-select filter-select"
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
          >
            <option value="">全部</option>
            <option value="小说">小说</option>
            <option value="科技">科技</option>
            <option value="生活">生活</option>
            <option value="其他">其他</option>
          </select>
        </div>

        <div className="filter-item">
          <label className="filter-label">排序</label>
          <select
            className="form-select filter-select"
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
          >
            <option value="">默认</option>
            <option value="title">书名</option>
            <option value="rating">评分</option>
          </select>
        </div>

        {sortField && (
          <div className="filter-item">
            <label className="filter-label">顺序</label>
            <select
              className="form-select filter-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">升序 ↑</option>
              <option value="desc">降序 ↓</option>
            </select>
          </div>
        )}
      </div>

      <button className="btn btn-primary" onClick={onAddBook}>
        ➕ 添加书籍
      </button>
    </div>
  );
}

export default FilterBar;

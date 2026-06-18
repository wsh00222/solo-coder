import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import BookCard from '../components/BookCard.jsx'
import Pagination from '../components/Pagination.jsx'
import { getBooks, getStats } from '../services/api.js'

function BookList() {
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [stats, setStats] = useState({ total: 0, status: { 想读: 0, 在读: 0, 读完: 0 }, avgRating: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [genreFilter, setGenreFilter] = useState('all')
  const [sortBy, setSortBy] = useState('id')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const PAGE_SIZE = 6

  const fetchStats = useCallback(async () => {
    try {
      const data = await getStats()
      setStats(data)
    } catch (err) {
      console.error('获取统计失败', err)
    }
  }, [])

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    try {
      const params = {
        status: statusFilter,
        genre: genreFilter,
        sortBy,
        sortOrder,
        page,
        pageSize: PAGE_SIZE
      }
      const data = await getBooks(params)
      setBooks(data.books)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error('获取书籍列表失败', err)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, genreFilter, sortBy, sortOrder, page])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value)
    setPage(1)
  }

  const handleGenreChange = (e) => {
    setGenreFilter(e.target.value)
    setPage(1)
  }

  const handleSortChange = (e) => {
    const [by, order] = e.target.value.split('-')
    setSortBy(by)
    setSortOrder(order)
    setPage(1)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  const refreshData = () => {
    fetchStats()
    fetchBooks()
  }

  const hasActiveFilter = statusFilter !== 'all' || genreFilter !== 'all'

  return (
    <div className="book-list-page">
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">总藏书量</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">想读</div>
            <div className="stat-value">{stats.status['想读'] || 0}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">在读</div>
            <div className="stat-value">{stats.status['在读'] || 0}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">读完</div>
            <div className="stat-value">{stats.status['读完'] || 0}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">平均评分</div>
            <div className="stat-value">{stats.avgRating.toFixed(1)}</div>
          </div>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-item">
          <label>阅读状态</label>
          <select value={statusFilter} onChange={handleStatusChange}>
            <option value="all">全部</option>
            <option value="想读">想读</option>
            <option value="在读">在读</option>
            <option value="读完">读完</option>
          </select>
        </div>
        <div className="filter-item">
          <label>书籍类型</label>
          <select value={genreFilter} onChange={handleGenreChange}>
            <option value="all">全部</option>
            <option value="小说">小说</option>
            <option value="科技">科技</option>
            <option value="生活">生活</option>
            <option value="其他">其他</option>
          </select>
        </div>
        <div className="filter-item">
          <label>排序方式</label>
          <select value={`${sortBy}-${sortOrder}`} onChange={handleSortChange}>
            <option value="id-desc">默认排序</option>
            <option value="title-asc">书名（升序）</option>
            <option value="title-desc">书名（降序）</option>
            <option value="rating-asc">评分（升序）</option>
            <option value="rating-desc">评分（降序）</option>
          </select>
        </div>
        <div className="add-btn-wrapper">
          <button className="btn btn-primary" onClick={() => navigate('/add')}>
            + 添加书籍
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>加载中...</div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📖</div>
          <h3>
            {hasActiveFilter ? '没有符合条件的书籍' : '还没有收藏任何书籍'}
          </h3>
          <p>
            {hasActiveFilter ? '试试调整筛选条件吧' : '点击上方按钮添加你的第一本书'}
          </p>
          {!hasActiveFilter && (
            <button className="btn btn-primary" onClick={() => navigate('/add')}>
              添加书籍
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>

          <div className="list-footer">
            <div className="total-count">
              共 {total} 本书籍
              {hasActiveFilter && `（已筛选）`}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default BookList

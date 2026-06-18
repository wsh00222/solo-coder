import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { bookApi, statsApi } from '../services/api.js'
import { showToast, ToastContainer } from '../components/Toast.jsx'
import StatsBoard from '../components/StatsBoard.jsx'
import FilterBar from '../components/FilterBar.jsx'
import BookCard from '../components/BookCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import Pagination from '../components/Pagination.jsx'
import Modal from '../components/Modal.jsx'

export default function BookList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState([])
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0, limit: 6 })
  const [stats, setStats] = useState(null)
  const [filters, setFilters] = useState({ status: '', genre: '', sort: '', page: 1 })
  const [quickModal, setQuickModal] = useState(false)
  const [quickForm, setQuickForm] = useState({ title: '', author: '' })
  const [quickLoading, setQuickLoading] = useState(false)

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const result = await bookApi.getAll(filters)
      setBooks(result.books)
      setPagination({
        total: result.total,
        page: result.page,
        totalPages: result.totalPages,
        limit: result.limit,
      })
    } catch (err) {
      showToast(err.message || '加载失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const s = await statsApi.getGlobal()
      setStats(s)
    } catch (err) {
      console.warn('统计加载失败', err)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [filters])

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRate = async (id, rating) => {
    try {
      await bookApi.updateRating(id, rating)
      setBooks((bs) => bs.map((b) => (b.id === id ? { ...b, rating } : b)))
      await fetchStats()
      showToast(rating > 0 ? `已更新为 ${rating} 星` : '已取消评分')
    } catch (err) {
      showToast(err.message || '评分失败', 'error')
    }
  }

  const handlePageChange = (page) => {
    setFilters((f) => ({ ...f, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleQuickSubmit = async (e) => {
    e.preventDefault()
    if (!quickForm.title.trim() || !quickForm.author.trim()) {
      showToast('书名和作者不能为空', 'warning')
      return
    }
    try {
      setQuickLoading(true)
      await bookApi.quickAdd(quickForm.title.trim(), quickForm.author.trim())
      setQuickModal(false)
      setQuickForm({ title: '', author: '' })
      showToast('书籍添加成功')
      fetchBooks()
      fetchStats()
    } catch (err) {
      showToast(err.message || '添加失败', 'error')
    } finally {
      setQuickLoading(false)
    }
  }

  return (
    <div>
      <ToastContainer />

      <StatsBoard stats={stats} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">我的书架</h2>
          <p className="text-sm text-gray-500 mt-0.5">共 {pagination.total} 本书</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/book/add"
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 shadow-sm transition"
          >
            + 完整添加
          </Link>
        </div>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState onAdd={() => navigate('/book/add')} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onRate={handleRate} />
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              当前显示第 {(pagination.page - 1) * pagination.limit + 1} -{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} 本，
              共 <span className="font-semibold text-gray-700">{pagination.total}</span> 本书
            </p>
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onChange={handlePageChange}
            />
          </div>
        </>
      )}

      <button
        onClick={() => setQuickModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl hover:shadow-3xl hover:scale-110 transition-all flex items-center justify-center group z-40"
        title="快速添加书籍"
      >
        <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      <Modal
        open={quickModal}
        onClose={() => !quickLoading && setQuickModal(false)}
        title="⚡ 快速添加书籍"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleQuickSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 -mt-2 mb-4">
            只需填写书名和作者，其他信息可稍后补充
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              书名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={quickForm.title}
              onChange={(e) => setQuickForm({ ...quickForm, title: e.target.value })}
              placeholder="输入书名"
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              作者 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={quickForm.author}
              onChange={(e) => setQuickForm({ ...quickForm, author: e.target.value })}
              placeholder="输入作者"
              className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <div className="flex-1 text-xs text-gray-400">
              默认状态：<span className="font-medium text-amber-600">想读</span> · 类型：<span className="font-medium text-slate-600">其他</span>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setQuickModal(false)}
              disabled={quickLoading}
              className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={quickLoading}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {quickLoading ? '添加中...' : '添加'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

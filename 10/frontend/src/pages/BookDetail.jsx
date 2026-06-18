import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { bookApi, statsApi } from '../services/api.js'
import {
  STATUS_MAP, GENRE_MAP, isNewBook, formatDate, formatDateShort,
  getLastReadTimeLabel, getProgressPercent
} from '../utils/constants.js'
import StarRating from '../components/StarRating.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import Modal from '../components/Modal.jsx'
import { showToast, ToastContainer } from '../components/Toast.jsx'

export default function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [book, setBook] = useState(null)
  const [progressForm, setProgressForm] = useState({ current: '', total: '' })
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressAnimating, setProgressAnimating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [lastReadLabel, setLastReadLabel] = useState(null)

  const fetchBook = async () => {
    try {
      setLoading(true)
      const b = await bookApi.getById(id)
      setBook(b)
      setProgressForm({
        current: b.current_pages || 0,
        total: b.total_pages || '',
      })
      if (b.readingHistory && b.readingHistory.length > 0) {
        setLastReadLabel(getLastReadTimeLabel(b.readingHistory[0].read_date))
      }
    } catch (err) {
      showToast(err.message || '加载失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBook()
  }, [id])

  const handleRate = async (rating) => {
    try {
      await bookApi.updateRating(id, rating)
      setBook((b) => ({ ...b, rating }))
      await statsApi.getGlobal()
      showToast(rating > 0 ? `已更新为 ${rating} 星` : '已取消评分')
    } catch (err) {
      showToast(err.message || '评分失败', 'error')
    }
  }

  const handleProgressSubmit = async (e) => {
    e.preventDefault()
    const cp = parseInt(progressForm.current)
    const tp = progressForm.total !== '' ? parseInt(progressForm.total) : undefined

    if (isNaN(cp) || cp < 0) {
      showToast('请输入有效的当前页数', 'warning')
      return
    }
    if (tp !== undefined) {
      if (isNaN(tp) || tp <= 0) {
        showToast('总页数必须是正整数', 'warning')
        return
      }
      if (cp > tp) {
        showToast('当前页数不能超过总页数', 'warning')
        return
      }
    }

    try {
      setProgressLoading(true)
      setProgressAnimating(true)
      const updated = await bookApi.updateProgress(id, cp, tp)
      setBook(updated)
      setLastReadLabel(getLastReadTimeLabel(new Date().toISOString()))
      showToast('阅读进度已更新')
      setTimeout(() => setProgressAnimating(false), 500)
    } catch (err) {
      showToast(err.message || '更新失败', 'error')
      setProgressAnimating(false)
    } finally {
      setProgressLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setDeleting(true)
      await bookApi.remove(id)
      showToast('书籍已删除')
      setTimeout(() => navigate('/'), 600)
    } catch (err) {
      showToast(err.message || '删除失败', 'error')
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-40 mb-6" />
        <div className="h-64 bg-gray-200 rounded-2xl mb-6" />
        <div className="h-40 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">书籍不存在或已被删除</p>
        <Link to="/" className="text-indigo-600 hover:underline">← 返回书架</Link>
      </div>
    )
  }

  const statusCfg = STATUS_MAP[book.status]
  const genreCfg = GENRE_MAP[book.genre]
  const isNew = isNewBook(book.publish_year)
  const currentPercent = getProgressPercent(book.current_pages, book.total_pages)

  return (
    <div>
      <ToastContainer />

      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition mb-6 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回书架
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`relative h-48 sm:h-56 ${genreCfg.color} flex items-center justify-center`}>
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.4) 0%, transparent 60%)'
              }} />
              {isNew && (
                <div className="absolute top-5 left-5 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow">
                  ✨ 新书 · 2000年后出版
                </div>
              )}
              <div className={`absolute top-5 right-5 ${statusCfg.color} text-sm font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm shadow-sm`}>
                <span className={`inline-block w-2 h-2 rounded-full ${statusCfg.dot} mr-2 align-middle`} />
                {statusCfg.label}
              </div>
              <div className="relative z-10 flex flex-col items-center px-6 text-center">
                <svg className="w-20 h-20 text-white/90 drop-shadow-lg mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.5" fill="rgba(255,255,255,0.15)" strokeLinejoin="round" />
                </svg>
                <div className="text-white/80 text-xs uppercase tracking-[0.2em] font-semibold mb-2">
                  {genreCfg.label}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                {book.title}
              </h1>
              <p className="text-gray-500 text-lg mb-4">
                {book.author}
                {book.publish_year && <span className="mx-2 text-gray-300">·</span>}
                {book.publish_year && <span>{book.publish_year} 年出版</span>}
              </p>

              <div className="py-4 border-y border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1.5">个人评分</div>
                  <StarRating rating={book.rating} onRate={handleRate} size="lg" />
                </div>
                {lastReadLabel && (
                  <div className="sm:ml-auto px-4 py-2 bg-indigo-50 rounded-xl text-sm text-indigo-700 font-medium animate-fade-in">
                    🕒 {lastReadLabel}
                  </div>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-400 mb-1">创建时间</div>
                  <div className="text-sm font-medium text-gray-700">{formatDateShort(book.created_at)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-400 mb-1">最近更新</div>
                  <div className="text-sm font-medium text-gray-700">{formatDateShort(book.updated_at)}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-400 mb-1">书籍类型</div>
                  <div className="text-sm font-medium text-gray-700">{genreCfg.label}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="text-xs text-gray-400 mb-1">总页数</div>
                  <div className="text-sm font-medium text-gray-700">{book.total_pages || '未知'}</div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={`/book/${book.id}/edit`}
                  className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all text-center flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  编辑书籍
                </Link>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex-1 sm:flex-none px-6 py-3 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  删除书籍
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              阅读历史时间线
              <span className="ml-auto text-sm font-normal text-gray-400">
                共 {book.readingHistory?.length || 0} 条记录
              </span>
            </h2>

            {!book.readingHistory || book.readingHistory.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm">暂无阅读记录，开始记录你的阅读进度吧！</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200 rounded-full" />
                <div className="space-y-5">
                  {book.readingHistory.map((item, idx) => (
                    <div key={item.id} className="relative pl-12 animate-slide-in" style={{ animationDelay: `${idx * 60}ms` }}>
                      <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-md ${
                        idx === 0 ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-purple-400'
                      }`} />
                      <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-indigo-600">
                              {item.current_pages}
                            </span>
                            <span className="text-gray-400 text-sm pt-1">页</span>
                            {item.total_pages && (
                              <>
                                <span className="text-gray-300">/</span>
                                <span className="text-gray-600 text-sm pt-1">{item.total_pages} 页</span>
                              </>
                            )}
                          </div>
                          {item.progress_percent !== null && (
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              item.progress_percent >= 100
                                ? 'bg-green-100 text-green-700'
                                : item.progress_percent >= 50
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {item.progress_percent.toFixed(0)}%
                            </span>
                          )}
                        </div>
                        {item.total_pages && (
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                            <div
                              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                              style={{ width: `${Math.min(100, item.progress_percent || 0)}%` }}
                            />
                          </div>
                        )}
                        <div className="text-xs text-gray-400 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(item.read_date)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              更新阅读进度
            </h2>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">当前进度</span>
                <span className="text-sm font-bold text-indigo-600">
                  {currentPercent !== null ? `${currentPercent.toFixed(0)}%` : '-'}
                </span>
              </div>
              <ProgressBar
                current={book.current_pages}
                total={book.total_pages}
                animated={progressAnimating}
              />
            </div>

            <form onSubmit={handleProgressSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">当前页数</label>
                <input
                  type="number"
                  min="0"
                  value={progressForm.current}
                  onChange={(e) => setProgressForm({ ...progressForm, current: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 hover:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  总页数 <span className="text-gray-400 font-normal">（未知留空）</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={progressForm.total}
                  onChange={(e) => setProgressForm({ ...progressForm, total: e.target.value })}
                  placeholder="例如：350"
                  className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 hover:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={progressLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
              >
                {progressLoading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {progressLoading ? '保存中...' : '保存阅读记录'}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">快捷设置</h3>
              <div className="space-y-2">
                {book.total_pages ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setProgressForm({ ...progressForm, current: Math.floor(book.total_pages * 0.25) })}
                      className="w-full px-3 py-2 text-xs bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition text-left"
                    >
                      📖 设置为 25%（约 {Math.floor(book.total_pages * 0.25)} 页）
                    </button>
                    <button
                      type="button"
                      onClick={() => setProgressForm({ ...progressForm, current: Math.floor(book.total_pages * 0.5) })}
                      className="w-full px-3 py-2 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-left"
                    >
                      📖 设置为 50%（约 {Math.floor(book.total_pages * 0.5)} 页）
                    </button>
                    <button
                      type="button"
                      onClick={() => setProgressForm({ ...progressForm, current: book.total_pages })}
                      className="w-full px-3 py-2 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-left"
                    >
                      ✅ 设置为 100%（{book.total_pages} 页 · 已读完）
                    </button>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 italic">设置总页数后可使用快捷进度</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => !deleting && setConfirmDelete(false)}
        title="确认删除书籍"
      >
        <div className="mb-5">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-center text-gray-700 mb-2">
            确定要删除书籍 <span className="font-bold text-gray-900">「{book.title}」</span> 吗？
          </p>
          <p className="text-center text-sm text-gray-500">
            此操作将同时删除所有阅读历史记录，且不可恢复。
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setConfirmDelete(false)}
            disabled={deleting}
            className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {deleting ? '删除中...' : '确认删除'}
          </button>
        </div>
      </Modal>
    </div>
  )
}

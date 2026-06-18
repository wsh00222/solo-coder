import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BookForm from '../components/BookForm.jsx'
import { bookApi } from '../services/api.js'
import { showToast, ToastContainer } from '../components/Toast.jsx'

export default function BookEdit() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [book, setBook] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const b = await bookApi.getById(id)
        setBook(b)
      } catch (err) {
        showToast(err.message || '加载失败', 'error')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  const handleSubmit = async (data) => {
    await bookApi.update(id, data)
    showToast('书籍信息已更新')
    setTimeout(() => navigate(`/book/${id}`), 500)
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-40 mb-6" />
        <div className="h-[500px] bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  if (!book) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">书籍不存在</p>
        <Link to="/" className="text-indigo-600 hover:underline">← 返回书架</Link>
      </div>
    )
  }

  return (
    <div>
      <ToastContainer />
      <Link
        to={`/book/${id}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition mb-6 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回详情
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </span>
            编辑书籍
          </h1>
          <p className="text-gray-500 ml-[52px]">正在编辑《{book.title}》的信息</p>
        </div>

        <BookForm initialData={book} onSubmit={handleSubmit} submitLabel="保存修改" isEdit />
      </div>
    </div>
  )
}

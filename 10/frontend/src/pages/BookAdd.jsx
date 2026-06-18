import { Link, useNavigate } from 'react-router-dom'
import BookForm from '../components/BookForm.jsx'
import { bookApi } from '../services/api.js'
import { showToast, ToastContainer } from '../components/Toast.jsx'

export default function BookAdd() {
  const navigate = useNavigate()

  const handleSubmit = async (data) => {
    await bookApi.create(data)
    showToast('书籍添加成功')
    setTimeout(() => navigate('/'), 500)
  }

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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            添加新书籍
          </h1>
          <p className="text-gray-500 ml-[52px]">记录一本新书到你的书架，开启阅读之旅</p>
        </div>

        <BookForm onSubmit={handleSubmit} submitLabel="添加书籍" />
      </div>
    </div>
  )
}

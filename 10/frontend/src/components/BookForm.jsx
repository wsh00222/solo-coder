import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { STATUS_SELECT_OPTIONS, GENRE_SELECT_OPTIONS } from '../utils/constants.js'
import StarRating from './StarRating.jsx'
import { showToast } from './Toast.jsx'

export default function BookForm({ initialData = {}, onSubmit, submitLabel = '保存', isEdit = false }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: initialData.title || '',
    author: initialData.author || '',
    publish_year: initialData.publish_year || '',
    genre: initialData.genre || 'other',
    rating: initialData.rating || 0,
    status: initialData.status || 'want_to_read',
    current_pages: initialData.current_pages || 0,
    total_pages: initialData.total_pages || '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = '请输入书名'
    if (!form.author.trim()) e.author = '请输入作者'
    if (form.publish_year && (isNaN(Number(form.publish_year)) || Number(form.publish_year) <= 0)) {
      e.publish_year = '出版年份必须是正整数'
    }
    if (form.total_pages && (isNaN(Number(form.total_pages)) || Number(form.total_pages) <= 0)) {
      e.total_pages = '总页数必须是正整数'
    }
    if (form.total_pages && Number(form.current_pages) > Number(form.total_pages)) {
      e.current_pages = '当前页数不能超过总页数'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const payload = {
        ...form,
        publish_year: form.publish_year ? Number(form.publish_year) : null,
        total_pages: form.total_pages ? Number(form.total_pages) : null,
        current_pages: Number(form.current_pages) || 0,
      }
      await onSubmit(payload)
    } catch (err) {
      showToast(err.message || '保存失败', 'error')
    } finally {
      setLoading(false)
    }
  }

  const input = (label, field, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{field === 'title' || field === 'author' ? <span className="text-red-500 ml-0.5">*</span> : ''}
      </label>
      <input
        type={type}
        value={form[field]}
        onChange={(e) => handleChange(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition ${
          errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 hover:bg-white'
        }`}
      />
      {errors[field] && <p className="mt-1 text-xs text-red-500">{errors[field]}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {input('书名', 'title', 'text', '例如：三体')}
        {input('作者', 'author', 'text', '例如：刘慈欣')}
        {input('出版年份', 'publish_year', 'number', '选填')}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">类型</label>
          <select
            value={form.genre}
            onChange={(e) => handleChange('genre', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 hover:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
          >
            {GENRE_SELECT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">阅读状态</label>
          <select
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 hover:bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
          >
            {STATUS_SELECT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">个人评分</label>
          <div className="px-4 py-2.5 border border-gray-200 bg-gray-50 rounded-xl">
            <StarRating rating={form.rating} onRate={(r) => handleChange('rating', r)} size="lg" />
          </div>
        </div>
      </div>

      <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          阅读进度（选填）
        </h4>
        <div className="grid grid-cols-2 gap-4">
          {input('当前页数', 'current_pages', 'number', '0')}
          {input('总页数', 'total_pages', 'number', '未知则留空')}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {loading ? '保存中...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

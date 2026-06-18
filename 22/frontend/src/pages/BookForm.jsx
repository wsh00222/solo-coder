import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import StarRating from '../components/StarRating.jsx'
import { getBook, addBook, updateBook } from '../services/api.js'

function BookForm({ mode }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = mode === 'edit'

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: '',
    genre: '小说',
    rating: 3,
    status: '想读'
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      const fetchBook = async () => {
        setLoading(true)
        try {
          const data = await getBook(id)
          setFormData({
            title: data.title,
            author: data.author,
            year: data.year || '',
            genre: data.genre,
            rating: data.rating,
            status: data.status
          })
        } catch (err) {
          console.error('获取书籍信息失败', err)
          if (err.response?.status === 404) {
            navigate('/')
          }
        } finally {
          setLoading(false)
        }
      }
      fetchBook()
    }
  }, [isEdit, id, navigate])

  const validate = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = '请输入书名'
    }
    if (!formData.author.trim()) {
      newErrors.author = '请输入作者'
    }
    if (formData.year) {
      const yearNum = parseInt(formData.year)
      if (isNaN(yearNum) || yearNum < 0 || yearNum > 9999) {
        newErrors.year = '请输入有效的年份'
      }
    }
    if (!formData.genre) {
      newErrors.genre = '请选择类型'
    }
    if (!formData.rating || formData.rating < 1 || formData.rating > 5 || !Number.isInteger(formData.rating)) {
      newErrors.rating = '评分必须为 1-5 的整数'
    }
    if (!formData.status) {
      newErrors.status = '请选择阅读状态'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleRatingChange = (value) => {
    setFormData(prev => ({ ...prev, rating: value }))
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setSubmitLoading(true)
    try {
      const submitData = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null
      }

      if (isEdit) {
        await updateBook(id, submitData)
      } else {
        await addBook(submitData)
      }
      navigate('/')
    } catch (err) {
      console.error('提交失败', err)
      if (err.response?.data?.error) {
        alert(err.response.data.error)
      } else {
        alert('提交失败，请重试')
      }
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
  }

  return (
    <div className="form-container">
      <Link to="/" className="back-link">← 返回列表</Link>
      
      <h2 className="form-title">
        {isEdit ? '编辑书籍' : '添加书籍'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">书名 *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="请输入书名"
          />
          {errors.title && <div className="error-text">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="author">作者 *</label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleChange}
            placeholder="请输入作者"
          />
          {errors.author && <div className="error-text">{errors.author}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="year">出版年份</label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="请输入出版年份"
            min="0"
            max="9999"
          />
          {errors.year && <div className="error-text">{errors.year}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="genre">类型 *</label>
          <select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
          >
            <option value="小说">小说</option>
            <option value="科技">科技</option>
            <option value="生活">生活</option>
            <option value="其他">其他</option>
          </select>
          {errors.genre && <div className="error-text">{errors.genre}</div>}
        </div>

        <div className="form-group">
          <label>评分（1-5 星）*</label>
          <StarRating 
            rating={formData.rating} 
            interactive={true} 
            onChange={handleRatingChange}
          />
          {errors.rating && <div className="error-text">{errors.rating}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="status">阅读状态 *</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="想读">想读</option>
            <option value="在读">在读</option>
            <option value="读完">读完</option>
          </select>
          {errors.status && <div className="error-text">{errors.status}</div>}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            取消
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={submitLoading}
          >
            {submitLoading ? '保存中...' : (isEdit ? '保存修改' : '添加')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BookForm

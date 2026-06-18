import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import StarRating from '../components/StarRating.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import { getBook, deleteBook } from '../services/api.js'

function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBook(id)
        setBook(data)
      } catch (err) {
        console.error('获取书籍详情失败', err)
        if (err.response?.status === 404) {
          navigate('/')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchBook()
  }, [id, navigate])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteBook(id)
      navigate('/')
    } catch (err) {
      console.error('删除失败', err)
      alert('删除失败，请重试')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
  }

  if (!book) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>书籍不存在</div>
  }

  const getStatusClass = (status) => {
    switch (status) {
      case '想读': return 'want'
      case '在读': return 'reading'
      case '读完': return 'finished'
      default: return 'want'
    }
  }

  return (
    <div className="detail-container">
      <Link to="/" className="back-link">← 返回列表</Link>

      <div className="detail-header">
        <div>
          <h2 className="detail-title">{book.title}</h2>
          <p className="detail-author">作者：{book.author}</p>
        </div>
        <span className={`status-tag ${getStatusClass(book.status)}`}>
          {book.status}
        </span>
      </div>

      <div className="detail-info">
        <div className="detail-info-row">
          <span className="detail-info-label">类型</span>
          <span className="detail-info-value">
            <span className="genre-tag">{book.genre}</span>
          </span>
        </div>
        <div className="detail-info-row">
          <span className="detail-info-label">出版年份</span>
          <span className="detail-info-value">{book.year || '未知'}</span>
        </div>
        <div className="detail-info-row">
          <span className="detail-info-label">评分</span>
          <span className="detail-info-value">
            <StarRating rating={book.rating} />
          </span>
        </div>
        <div className="detail-info-row">
          <span className="detail-info-label">阅读状态</span>
          <span className="detail-info-value">{book.status}</span>
        </div>
      </div>

      <div className="detail-actions">
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate(`/edit/${book.id}`)}
        >
          编辑
        </button>
        <button 
          className="btn btn-danger" 
          onClick={() => setShowDeleteConfirm(true)}
        >
          删除
        </button>
      </div>

      {showDeleteConfirm && (
        <ConfirmModal
          title="确认删除"
          message={`确定要删除《${book.title}》吗？此操作不可撤销。`}
          confirmText={deleting ? '删除中...' : '删除'}
          onConfirm={handleDelete}
          onCancel={() => !deleting && setShowDeleteConfirm(false)}
        />
      )}
    </div>
  )
}

export default BookDetail

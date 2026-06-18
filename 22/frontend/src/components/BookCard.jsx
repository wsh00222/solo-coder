import React from 'react'
import { useNavigate } from 'react-router-dom'
import StarRating from './StarRating.jsx'

function BookCard({ book }) {
  const navigate = useNavigate()

  const getStatusClass = (status) => {
    switch (status) {
      case '想读': return 'want'
      case '在读': return 'reading'
      case '读完': return 'finished'
      default: return 'want'
    }
  }

  const handleClick = () => {
    navigate(`/book/${book.id}`)
  }

  return (
    <div className="book-card" onClick={handleClick}>
      <div className="book-card-header">
        <h3 className="book-card-title">{book.title}</h3>
        <span className={`status-tag ${getStatusClass(book.status)}`}>
          {book.status}
        </span>
      </div>
      <p className="book-card-author">作者：{book.author}</p>
      <StarRating rating={book.rating} />
    </div>
  )
}

export default BookCard

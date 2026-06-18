import React, { useState } from 'react'

function StarRating({ rating, interactive = false, onChange }) {
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value)
    }
  }

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
    }
  }

  const displayRating = interactive ? (hoverRating || rating) : rating

  return (
    <div 
      className="stars-display" 
      onMouseLeave={handleMouseLeave}
      style={{ cursor: interactive ? 'pointer' : 'default' }}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= displayRating ? 'filled' : ''}`}
          onMouseEnter={() => handleMouseEnter(star)}
          onClick={() => handleClick(star)}
        >
          ★
        </span>
      ))}
    </div>
  )
}

export default StarRating

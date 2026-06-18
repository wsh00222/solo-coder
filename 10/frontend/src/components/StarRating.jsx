import { useState } from 'react'

export default function StarRating({ rating = 0, onRate, readonly = false, size = 'md' }) {
  const [hover, setHover] = useState(0)
  const display = readonly ? rating : (hover || rating)
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-7 h-7' : 'w-5 h-5'

  const handleClick = (value) => {
    if (readonly || !onRate) return
    onRate(rating === value ? 0 : value)
  }

  return (
    <div className="inline-flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= display
        return (
          <button
            key={i}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(i)}
            onMouseEnter={() => !readonly && setHover(i)}
            className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-transform ${!readonly ? 'hover:scale-110' : ''}`}
            title={readonly ? `${rating} 星` : `点击打 ${i} 星`}
          >
            <svg
              className={`${sizeClass} ${filled ? 'text-yellow-400' : 'text-gray-300'} drop-shadow-sm`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        )
      })}
      {size !== 'sm' && rating > 0 && (
        <span className="ml-1 text-xs text-gray-500 font-medium">{rating.toFixed(0)}.0</span>
      )}
    </div>
  )
}

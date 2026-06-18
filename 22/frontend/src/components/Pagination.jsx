import React from 'react'

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1)
  }

  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1)
  }

  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, page - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="pagination">
      <button 
        className="page-btn" 
        onClick={handlePrev} 
        disabled={page === 1}
      >
        ‹
      </button>
      {getPageNumbers().map((p) => (
        <button
          key={p}
          className={`page-btn ${p === page ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      <button 
        className="page-btn" 
        onClick={handleNext} 
        disabled={page === totalPages}
      >
        ›
      </button>
      <span className="page-info">共 {totalPages} 页</span>
    </div>
  )
}

export default Pagination

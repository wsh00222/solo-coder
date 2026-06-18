import { useState } from 'react';
import '../styles/components/StarRating.css';

function StarRating({ rating, interactive = false, onChange, size = 'medium' }) {
  const [hoverRating, setHoverRating] = useState(0);

  const getStarClass = (index) => {
    const displayRating = interactive ? (hoverRating || rating) : rating;
    if (index <= displayRating) {
      return 'star star-filled';
    }
    return 'star star-empty';
  };

  const handleClick = (index) => {
    if (interactive && onChange) {
      onChange(index);
    }
  };

  return (
    <div
      className={`star-rating star-rating-${size}`}
      onMouseLeave={() => interactive && setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={getStarClass(i)}
          onMouseEnter={() => interactive && setHoverRating(i)}
          onClick={() => handleClick(i)}
          style={interactive ? { cursor: 'pointer' } : {}}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default StarRating;

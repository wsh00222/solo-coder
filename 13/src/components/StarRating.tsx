import { Star } from 'lucide-react';
import { FEELING_MAP } from '../utils';

interface StarRatingProps {
  rating: number | null;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const SIZE_MAP = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function StarRating({ rating, size = 'md', interactive = false, onChange }: StarRatingProps) {
  const sz = SIZE_MAP[size];
  const stars = [1, 2, 3, 4, 5];

  if (rating === null) {
    return (
      <div className="flex items-center gap-0.5" title="未评价">
        {stars.map(s => (
          <Star key={s} className={`${sz} text-gray-300 stroke-dashed`} fill="none" strokeDasharray="3 3" />
        ))}
        {size !== 'sm' && <span className="text-xs text-gray-400 ml-1">未评价</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5" title={FEELING_MAP[rating]}>
      {stars.map(s => {
        const filled = s <= rating;
        return (
          <button
            key={s}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(s)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`${sz} ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
              fill={filled ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
      {size !== 'sm' && <span className="text-xs text-gray-500 ml-1">{FEELING_MAP[rating]}</span>}
    </div>
  );
}

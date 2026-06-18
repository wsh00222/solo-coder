import { Link } from 'react-router-dom'
import { STATUS_MAP, GENRE_MAP, isNewBook, getProgressPercent } from '../utils/constants.js'
import StarRating from './StarRating.jsx'
import ProgressBar from './ProgressBar.jsx'

export default function BookCard({ book, onRate }) {
  const genreCfg = GENRE_MAP[book.genre] || GENRE_MAP.other
  const statusCfg = STATUS_MAP[book.status] || STATUS_MAP.want_to_read
  const coverColor = genreCfg.color
  const isNew = isNewBook(book.publish_year)

  return (
    <div
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group animate-slide-in cursor-pointer border border-gray-100 hover:border-indigo-200"
    >
      <Link to={`/book/${book.id}`} className="block">
        <div className={`relative h-40 ${coverColor} flex items-center justify-center overflow-hidden`}>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)'
          }} />
          {isNew && (
            <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              ✨ 新书
            </div>
          )}
          <div className={`absolute top-3 right-3 ${statusCfg.color} text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm`}>
            {statusCfg.label}
          </div>
          <svg className="w-16 h-16 text-white/90 drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" strokeWidth="1.5" fill="rgba(255,255,255,0.15)" strokeLinejoin="round" />
          </svg>
          <div className="absolute bottom-3 left-4 right-4">
            <div className="text-white/80 text-[11px] uppercase tracking-wider font-medium">
              {genreCfg.label}
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-gray-800 text-lg mb-1 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-gray-500 mb-3 line-clamp-1">
            {book.author}{book.publish_year ? ` · ${book.publish_year}` : ''}
          </p>

          <div className="mb-3" onClick={(e) => e.preventDefault()}>
            <StarRating
              rating={book.rating}
              onRate={(r) => onRate && onRate(book.id, r)}
              size="sm"
            />
          </div>

          {book.status === 'reading' && (
            <div className="pt-3 border-t border-gray-100">
              <ProgressBar
                current={book.current_pages}
                total={book.total_pages}
                height="h-1.5"
              />
            </div>
          )}

          {book.status === 'finished' && book.total_pages && (
            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs text-green-600 font-medium flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                共 {book.total_pages} 页 · 已完成
              </div>
            </div>
          )}

          {book.status === 'want_to_read' && (
            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-400 italic flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                等待开启阅读之旅
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

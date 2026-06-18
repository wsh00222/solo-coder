import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const handleEsc = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', handleEsc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEsc)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className={`relative w-full ${maxWidth} bg-white rounded-2xl shadow-2xl animate-slide-down overflow-hidden`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

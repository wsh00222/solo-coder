import { useEffect, useState, useCallback } from 'react'

let showToastFn = null

export function ToastContainer() {
  const [toast, setToast] = useState(null)

  const show = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
  }, [])

  useEffect(() => {
    showToastFn = show
    return () => { showToastFn = null }
  }, [show])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  if (!toast) return null

  const colors = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-amber-500',
  }
  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '!',
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-down">
      <div className={`${colors[toast.type]} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[240px]`}>
        <span className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-sm font-bold">
          {icons[toast.type]}
        </span>
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  )
}

export function showToast(message, type = 'success') {
  if (showToastFn) showToastFn(message, type)
}

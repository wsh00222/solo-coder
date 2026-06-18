import { useEffect, useState } from 'react'
import { getProgressPercent } from '../utils/constants.js'

export default function ProgressBar({ current, total, animated = false, height = 'h-2' }) {
  const [displayPercent, setDisplayPercent] = useState(0)
  const percent = getProgressPercent(current, total)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setDisplayPercent(percent || 0), 30)
      return () => clearTimeout(timer)
    } else {
      setDisplayPercent(percent || 0)
    }
  }, [percent, animated])

  if (percent === null) {
    return (
      <div className="text-sm text-gray-500">
        已读 <span className="font-semibold text-gray-700">{current}</span> 页
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className={`w-full ${height} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
          style={{
            width: `${displayPercent}%`,
            transition: animated ? 'width 400ms cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          }}
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{current} / {total} 页</span>
        <span className="font-medium text-indigo-600">{displayPercent.toFixed(0)}%</span>
      </div>
    </div>
  )
}

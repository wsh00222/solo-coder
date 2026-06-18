import { STATUS_OPTIONS, GENRE_OPTIONS, SORT_OPTIONS } from '../utils/constants.js'

export default function FilterBar({ filters, onChange }) {
  const update = (key, val) => onChange({ ...filters, [key]: val, page: 1 })

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm mb-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="sm:min-w-[140px]">
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">状态筛选</label>
          <select
            value={filters.status || ''}
            onChange={(e) => update('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-gray-50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="sm:min-w-[140px]">
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">类型筛选</label>
          <select
            value={filters.genre || ''}
            onChange={(e) => update('genre', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-gray-50"
          >
            {GENRE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="sm:min-w-[140px]">
          <label className="block text-xs text-gray-500 mb-1.5 font-medium">排序方式</label>
          <select
            value={filters.sort || ''}
            onChange={(e) => update('sort', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 bg-gray-50"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex sm:justify-end gap-2 mt-2 sm:mt-0">
          <button
            onClick={() => onChange({ status: '', genre: '', sort: '', page: 1 })}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition"
          >
            重置
          </button>
        </div>
      </div>
    </div>
  )
}

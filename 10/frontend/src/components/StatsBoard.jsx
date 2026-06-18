import { STATUS_MAP } from '../utils/constants.js'

export default function StatsBoard({ stats }) {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-16" />
          </div>
        ))}
      </div>
    )
  }

  const items = [
    {
      label: '总藏书量',
      value: stats.totalBooks,
      icon: '📚',
      bg: 'from-indigo-500 to-purple-500',
    },
    {
      label: STATUS_MAP.want_to_read.label,
      value: stats.statusCounts.want_to_read,
      icon: '📋',
      bg: 'from-amber-400 to-orange-500',
    },
    {
      label: STATUS_MAP.reading.label,
      value: stats.statusCounts.reading,
      icon: '📖',
      bg: 'from-sky-400 to-blue-600',
    },
    {
      label: STATUS_MAP.finished.label,
      value: stats.statusCounts.finished,
      icon: '✅',
      bg: 'from-emerald-400 to-green-600',
    },
    {
      label: '平均评分',
      value: stats.avgRating ? `${stats.avgRating.toFixed(1)} ★` : '-',
      icon: '⭐',
      bg: 'from-yellow-400 to-amber-500',
    },
    {
      label: '本月新增',
      value: stats.newThisMonth,
      icon: '🆕',
      bg: 'from-pink-400 to-rose-500',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 animate-slide-in"
          style={{ animationDelay: `${idx * 50}ms` }}
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{item.icon}</span>
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${item.bg} opacity-20`} />
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">{item.value}</div>
          <div className="text-sm text-gray-500">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

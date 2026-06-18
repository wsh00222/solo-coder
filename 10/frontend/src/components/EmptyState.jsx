export default function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-40 h-40 mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
        <svg className="w-20 h-20 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-700 mb-2">书架空空如也</h3>
      <p className="text-gray-500 mb-8 max-w-md">
        开始记录你的阅读旅程吧！添加第一本书，追踪阅读进度，见证每一次成长。
      </p>
      {onAdd && (
        <button
          onClick={onAdd}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          + 添加我的第一本书
        </button>
      )}
    </div>
  )
}

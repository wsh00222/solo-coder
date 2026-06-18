export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)

  const btn = (label, p, disabled = false, active = false) => (
    <button
      key={label}
      onClick={() => !disabled && onChange(p)}
      disabled={disabled}
      className={`min-w-[38px] h-10 px-3 rounded-lg text-sm font-medium transition
        ${active ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-indigo-50 border border-gray-200'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {btn('‹', page - 1, page === 1)}
      {pages.map((p) => btn(p, p, false, p === page))}
      {btn('›', page + 1, page === totalPages)}
    </div>
  )
}

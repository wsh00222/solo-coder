export const STATUS_MAP = {
  want_to_read: { label: '想读', color: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  reading: { label: '在读', color: 'bg-blue-100 text-blue-800', dot: 'bg-blue-500' },
  finished: { label: '读完', color: 'bg-green-100 text-green-800', dot: 'bg-green-500' },
}

export const GENRE_MAP = {
  novel: { label: '小说', color: 'bg-rose-500' },
  tech: { label: '科技', color: 'bg-sky-500' },
  life: { label: '生活', color: 'bg-emerald-500' },
  other: { label: '其他', color: 'bg-slate-500' },
}

export const STATUS_OPTIONS = [
  { value: '', label: '全部状态' },
  { value: 'want_to_read', label: '想读' },
  { value: 'reading', label: '在读' },
  { value: 'finished', label: '读完' },
]

export const GENRE_OPTIONS = [
  { value: '', label: '全部类型' },
  { value: 'novel', label: '小说' },
  { value: 'tech', label: '科技' },
  { value: 'life', label: '生活' },
  { value: 'other', label: '其他' },
]

export const SORT_OPTIONS = [
  { value: '', label: '默认排序' },
  { value: 'title', label: '按书名' },
  { value: 'rating', label: '按评分' },
]

export const STATUS_SELECT_OPTIONS = [
  { value: 'want_to_read', label: '想读' },
  { value: 'reading', label: '在读' },
  { value: 'finished', label: '读完' },
]

export const GENRE_SELECT_OPTIONS = [
  { value: 'novel', label: '小说' },
  { value: 'tech', label: '科技' },
  { value: 'life', label: '生活' },
  { value: 'other', label: '其他' },
]

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getLastReadTimeLabel(dateStr) {
  if (!dateStr) return null
  const then = new Date(dateStr)
  if (isNaN(then.getTime())) return null
  const now = new Date()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 0) return null
  if (diffMin < 1) return '上次阅读于 刚刚'
  if (diffMin < 60) return `上次阅读于 ${diffMin} 分钟前`
  return `上次阅读于 ${formatDate(dateStr)}`
}

export function getProgressPercent(current, total) {
  if (!total || total <= 0) return null
  return Math.min(100, Math.max(0, (current / total) * 100))
}

export function isNewBook(publishYear) {
  return publishYear && publishYear >= 2000
}

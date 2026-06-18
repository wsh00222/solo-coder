import dayjs from 'dayjs'

export const STATUS_OPTIONS = [
  { value: 'available', label: '可用', type: 'success' },
  { value: 'borrowed', label: '已借出', type: 'danger' },
  { value: 'maintenance', label: '维修中', type: 'info' }
]

export const statusMap = {
  available: { label: '可用', type: 'success', color: '#67C23A' },
  borrowed: { label: '已借出', type: 'danger', color: '#F56C6C' },
  maintenance: { label: '维修中', type: 'info', color: '#909399' }
}

export const recordStatusMap = {
  borrowing: { label: '借用中', type: 'warning' },
  returned: { label: '已归还', type: 'success' },
  overdue: { label: '逾期', type: 'danger' }
}

export function formatDate(date) {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD')
}

export function formatDateTime(date) {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

export function getToday() {
  return dayjs().format('YYYY-MM-DD')
}

export function getTomorrow() {
  return dayjs().add(1, 'day').format('YYYY-MM-DD')
}

export function isDateAfter(date1, date2) {
  return dayjs(date1).isAfter(dayjs(date2), 'day')
}

export function daysBetween(date1, date2) {
  if (!date1 || !date2) return 0
  return dayjs(date1).diff(dayjs(date2), 'day')
}

export function isOverdue(expectedReturnDate) {
  if (!expectedReturnDate) return false
  return dayjs().isAfter(dayjs(expectedReturnDate), 'day')
}

export function downloadFileFromBlob(blob, filename) {
  const url = window.URL.createObjectURL(new Blob([blob]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

export function groupByLocation(equipments) {
  const groups = {}
  for (const eq of equipments) {
    const loc = eq.location || '未分类'
    if (!groups[loc]) groups[loc] = []
    groups[loc].push(eq)
  }
  return Object.entries(groups).map(([location, items]) => ({
    location,
    count: items.length,
    items
  }))
}

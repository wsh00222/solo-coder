export function formatAmount(value) {
  return Number(value).toFixed(2)
}

export function today() {
  return new Date().toISOString().slice(0, 10)
}

export function currentMonth() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function categoryIcon(category) {
  const icons = {
    '餐饮': '🍜',
    '交通': '🚗',
    '购物': '🛒',
    '工资': '💰',
    '娱乐': '🎮',
    '住房': '🏠',
    '医疗': '💊',
    '教育': '📚',
    '其他': '📌'
  }
  return icons[category] || '📌'
}

export function exportCSV(records) {
  const BOM = '\uFEFF'
  const header = '日期,类别,金额,备注'
  const rows = records.map(r =>
    `${r.date},${r.category},${formatAmount(r.amount)},"${(r.note || '').replace(/"/g, '""')}"`
  )
  const csv = BOM + header + '\n' + rows.join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const date = today()
  a.href = url
  a.download = `记账_${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

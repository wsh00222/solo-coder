export async function fetchRecords(params = {}) {
  const query = new URLSearchParams()
  if (params.category && params.category !== '全部') query.set('category', params.category)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)
  const res = await fetch(`/api/records?${query.toString()}`)
  return res.json()
}

export async function fetchSummary(params = {}) {
  const query = new URLSearchParams()
  if (params.category && params.category !== '全部') query.set('category', params.category)
  if (params.startDate) query.set('startDate', params.startDate)
  if (params.endDate) query.set('endDate', params.endDate)
  const res = await fetch(`/api/records/summary?${query.toString()}`)
  return res.json()
}

export async function createRecord(data) {
  const res = await fetch('/api/records', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || '创建失败')
  }
  return res.json()
}

export async function updateRecord(id, data) {
  const res = await fetch(`/api/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || '更新失败')
  }
  return res.json()
}

export async function deleteRecord(id) {
  const res = await fetch(`/api/records/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || '删除失败')
  }
  return res.json()
}

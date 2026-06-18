const API_BASE = '/api';

export async function getMeetings(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v) query.set(k, v);
  });
  const res = await fetch(`${API_BASE}/meetings?${query.toString()}`);
  if (!res.ok) throw new Error('获取会议列表失败');
  return res.json();
}

export async function getMeeting(id) {
  const res = await fetch(`${API_BASE}/meetings/${id}`);
  if (!res.ok) throw new Error('获取会议详情失败');
  return res.json();
}

export async function createMeeting(data) {
  const res = await fetch(`${API_BASE}/meetings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || '创建会议失败');
  }
  return res.json();
}

export async function updateMeeting(id, data) {
  const res = await fetch(`${API_BASE}/meetings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || '更新会议失败');
  }
  return res.json();
}

export async function deleteMeeting(id) {
  const res = await fetch(`${API_BASE}/meetings/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error('删除会议失败');
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/meetings/stats`);
  if (!res.ok) throw new Error('获取统计数据失败');
  return res.json();
}

export async function getUpcomingMeetings() {
  const res = await fetch(`${API_BASE}/meetings/upcoming`);
  if (!res.ok) throw new Error('获取即将开始的会议失败');
  return res.json();
}

export async function checkConflict(startTime, duration, excludeId) {
  const query = new URLSearchParams({ startTime, duration });
  if (excludeId) query.set('excludeId', excludeId);
  const res = await fetch(`${API_BASE}/meetings/conflict/check?${query.toString()}`);
  if (!res.ok) return { conflicts: [] };
  return res.json();
}

export async function exportCSV(params = {}) {
  const res = await fetch(`${API_BASE}/meetings/export/csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error('导出失败');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'meetings.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

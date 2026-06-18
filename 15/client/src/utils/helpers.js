export function renderStars(rating) {
  if (rating === null || rating === undefined) return '—';
  const full = Math.floor(rating / 2);
  const half = rating % 2;
  let s = '';
  for (let i = 0; i < full; i++) s += '★';
  if (half) s += '⯨';
  const empty = 5 - full - (half ? 1 : 0);
  for (let i = 0; i < empty; i++) s += '☆';
  return s;
}

export function statusColor(status) {
  switch (status) {
    case '想看': return { bg: '#e0f2fe', color: '#0369a1', label: '想看' };
    case '已看': return { bg: '#dcfce7', color: '#15803d', label: '已看' };
    case '二刷': return { bg: '#fef3c7', color: '#b45309', label: '二刷' };
    default: return { bg: '#f3f4f6', color: '#374151', label: status };
  }
}

export function genreColor(genre) {
  const colors = {
    '剧情': { bg: '#ede9fe', color: '#6d28d9' },
    '喜剧': { bg: '#fce7f3', color: '#be185d' },
    '动作': { bg: '#fee2e2', color: '#b91c1c' },
    '科幻': { bg: '#dbeafe', color: '#1d4ed8' },
    '其他': { bg: '#e5e7eb', color: '#374151' }
  };
  return colors[genre] || colors['其他'];
}

export function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isAnniversary(watchDate) {
  if (!watchDate) return null;
  const wd = new Date(watchDate);
  if (isNaN(wd.getTime())) return null;
  const now = new Date();
  if (wd.getMonth() !== now.getMonth() || wd.getDate() !== now.getDate()) return null;
  const years = now.getFullYear() - wd.getFullYear();
  if (years <= 0) return null;
  return years;
}

export function exportCSV(movies, filename) {
  const headers = ['片名', '导演', '年份', '类型', '评分', '状态', '观看日期'];
  const rows = movies.map(m => [
    `"${String(m.title || '').replace(/"/g, '""')}"`,
    `"${String(m.director || '').replace(/"/g, '""')}"`,
    m.year || '',
    m.genre || '',
    m.rating || '',
    m.status || '',
    m.watchDate || ''
  ]);
  const csv = '\ufeff' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return dateStr;
}

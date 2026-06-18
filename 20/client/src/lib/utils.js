const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = res.headers.get('content-type')?.includes('application/json')
    ? await res.json()
    : null;
  if (!res.ok) {
    const msg = data?.error || `请求失败 (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  listNotes(params = {}) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.append(k, String(v));
    });
    return request(`/notes?${q.toString()}`);
  },
  getNote(id) {
    return request(`/notes/${id}`);
  },
  createNote(payload) {
    return request('/notes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateNote(id, payload) {
    return request(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  deleteNote(id) {
    return request(`/notes/${id}`, { method: 'DELETE' });
  }
};

export function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatRelative(ts) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const min = 60 * 1000, hour = 60 * min, day = 24 * hour;
  if (diff < min) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / min)} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
  return formatDate(ts).slice(0, 10);
}

export function summaryOf(text, n = 50) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (s.length <= n) return s;
  return s.slice(0, n) + '…';
}

export function linkify(text) {
  const urlPattern = /(https?:\/\/[^\s<>"'，。；！？、）)]+)/g;
  const parts = [];
  let last = 0;
  let match;
  let key = 0;
  while ((match = urlPattern.exec(text)) !== null) {
    if (match.index > last) {
      parts.push({ type: 'text', content: text.slice(last, match.index), key: key++ });
    }
    const url = match[0];
    let display = url;
    const cleanEnd = url.replace(/[.,;:!?，。；：！？、]+$/g, '');
    if (cleanEnd !== url) {
      const trailing = url.slice(cleanEnd.length);
      parts.push({ type: 'link', url: cleanEnd, display: cleanEnd, key: key++ });
      parts.push({ type: 'text', content: trailing, key: key++ });
    } else {
      parts.push({ type: 'link', url, display, key: key++ });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    parts.push({ type: 'text', content: text.slice(last), key: key++ });
  }
  return parts;
}

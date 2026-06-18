const BASE_URL = '/api/movies';

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `请求失败 (${res.status})`);
  }
  return data;
}

export const movieApi = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return request(`${BASE_URL}${qs ? '?' + qs : ''}`).then(r => r.data);
  },
  get(id) { return request(`${BASE_URL}/${id}`).then(r => r.data); },
  create(data) { return request(BASE_URL, { method: 'POST', body: JSON.stringify(data) }).then(r => r.data); },
  update(id, data) { return request(`${BASE_URL}/${id}`, { method: 'PUT', body: JSON.stringify(data) }).then(r => r.data); },
  remove(id) { return request(`${BASE_URL}/${id}`, { method: 'DELETE' }); },
  batchDelete(ids) { return request(`${BASE_URL}/batch/delete`, { method: 'POST', body: JSON.stringify({ ids }) }); },
  batchUpdateStatus(ids, status) { return request(`${BASE_URL}/batch/status`, { method: 'POST', body: JSON.stringify({ ids, status }) }); },
  markAsWatched(id, rating) { return request(`${BASE_URL}/${id}/watched`, { method: 'POST', body: JSON.stringify({ rating }) }).then(r => r.data); },
  stats() { return request(`${BASE_URL}/stats`).then(r => r.data); },
  distribution() { return request(`${BASE_URL}/distribution`).then(r => r.data); },
  recommend() { return request(`${BASE_URL}/recommend`).then(r => r.data); },
  meta() { return request(`${BASE_URL}/meta`).then(r => r.data); }
};

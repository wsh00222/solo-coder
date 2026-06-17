// API 封装：所有对后端的 HTTP 请求集中在此文件
// 假设 Vite 已将 /api 代理到 http://localhost:5000

const BASE = '/api';

function handleJSON(res) {
  // DELETE 204 无内容
  if (res.status === 204) return null;
  return res.json().then((data) => {
    if (!res.ok) {
      const msg = data?.error || `请求失败（HTTP ${res.status}）`;
      throw new Error(msg);
    }
    return data;
  });
}

function req(url, options = {}) {
  return fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).then(handleJSON);
}

export const surveyApi = {
  list: () => req('/surveys', { method: 'GET' }),
  create: (payload) => req('/surveys', { method: 'POST', body: payload }),
  get: (id) => req(`/surveys/${id}`, { method: 'GET' }),
  update: (id, payload) => req(`/surveys/${id}`, { method: 'PUT', body: payload }),
  publish: (id) => req(`/surveys/${id}/publish`, { method: 'POST' }),
  remove: (id) => req(`/surveys/${id}`, { method: 'DELETE' }),
  submitAnswer: (id, data) =>
    req(`/surveys/${id}/answers`, { method: 'POST', body: { data } }),
  stats: (id) => req(`/surveys/${id}/stats`, { method: 'GET' }),
  exportCSV: (id) => {
    // 触发浏览器下载
    const link = document.createElement('a');
    link.href = BASE + `/surveys/${id}/export`;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

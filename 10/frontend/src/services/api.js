const BASE_URL = '/api'

async function request(url, options = {}) {
  const defaultHeaders = { 'Content-Type': 'application/json' }
  const config = {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  }

  if (config.body && typeof config.body !== 'string') {
    config.body = JSON.stringify(config.body)
  }

  try {
    const res = await fetch(`${BASE_URL}${url}`, config)
    const contentType = res.headers.get('content-type')
    const data = contentType && contentType.includes('application/json')
      ? await res.json()
      : await res.text()

    if (!res.ok) {
      const message = data?.error || `请求失败 (${res.status})`
      throw new Error(message)
    }
    return data
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('无法连接到服务器，请确保后端服务已启动')
    }
    throw err
  }
}

export const bookApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, v)
    })
    const qs = query.toString()
    return request(`/books${qs ? `?${qs}` : ''}`)
  },

  getById: (id) => request(`/books/${id}`),

  create: (data) => request('/books', { method: 'POST', body: data }),

  quickAdd: (title, author) =>
    request('/books/quick', { method: 'POST', body: { title, author } }),

  update: (id, data) =>
    request(`/books/${id}`, { method: 'PUT', body: data }),

  remove: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  updateRating: (id, rating) =>
    request(`/books/${id}/rating`, { method: 'PATCH', body: { rating } }),

  updateProgress: (id, current_pages, total_pages) =>
    request(`/books/${id}/progress`, {
      method: 'PATCH',
      body: { current_pages, total_pages },
    }),
}

export const statsApi = {
  getGlobal: () => request('/stats'),
}

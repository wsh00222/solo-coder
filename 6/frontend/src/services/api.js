import axios from 'axios'

const request = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || '请求失败'
    return Promise.reject(new Error(message))
  }
)

export const notesApi = {
  getList(params) {
    return request.get('/notes', { params })
  },

  getStats(params) {
    return request.get('/notes/stats', { params })
  },

  getById(id) {
    return request.get(`/notes/${id}`)
  },

  create(data) {
    return request.post('/notes', data)
  },

  update(id, data) {
    return request.put(`/notes/${id}`, data)
  },

  remove(id) {
    return request.delete(`/notes/${id}`)
  }
}

export const tagsApi = {
  getAll() {
    return request.get('/tags')
  },

  remove(id) {
    return request.delete(`/tags/${id}`)
  }
}

export default request

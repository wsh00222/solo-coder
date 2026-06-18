import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 5000
})

export const getStats = () => api.get('/stats').then(res => res.data)

export const getBooks = (params) => api.get('/books', { params }).then(res => res.data)

export const getBook = (id) => api.get(`/books/${id}`).then(res => res.data)

export const addBook = (data) => api.post('/books', data).then(res => res.data)

export const updateBook = (id, data) => api.put(`/books/${id}`, data).then(res => res.data)

export const deleteBook = (id) => api.delete(`/books/${id}`).then(res => res.data)

export default api

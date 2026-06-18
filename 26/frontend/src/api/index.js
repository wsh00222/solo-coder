import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 5000
})

export function getMembers(params = {}) {
  return api.get('/members', { params }).then(res => res.data)
}

export function getMember(id) {
  return api.get(`/members/${id}`).then(res => res.data)
}

export function getStats() {
  return api.get('/members/stats').then(res => res.data)
}

export function createMember(data) {
  return api.post('/members', data).then(res => res.data)
}

export function updateMember(id, data) {
  return api.put(`/members/${id}`, data).then(res => res.data)
}

export function deleteMember(id) {
  return api.delete(`/members/${id}`).then(res => res.data)
}

export default api

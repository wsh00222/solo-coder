import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

export const activityApi = {
  getList: (params) => api.get('/activities', { params }),
  getDetail: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
  register: (id, data) => api.post(`/activities/${id}/register`, data),
  checkIn: (id, phone) => api.post(`/activities/${id}/checkin`, { phone }),
  exportCsv: (id) => {
    window.open(`/api/activities/${id}/export`, '_blank');
  }
};

export const registrationApi = {
  cancel: (id) => api.delete(`/registrations/${id}`)
};

export const statsApi = {
  getGlobalStats: () => api.get('/stats')
};

export default api;

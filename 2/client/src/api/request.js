import axios from 'axios';

const instance = axios.create({
  baseURL: '/api',
  timeout: 10000
});

let alertRef = null;

export function setAlertRef(ref) {
  alertRef = ref;
}

instance.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code !== 0) {
      if (alertRef) alertRef.showError(res.msg || '请求失败');
      return Promise.reject(new Error(res.msg || '请求失败'));
    }
    return res.data;
  },
  (error) => {
    const msg = error.response?.data?.msg || error.message || '网络错误';
    if (alertRef) alertRef.showError(msg);
    return Promise.reject(error);
  }
);

export default instance;

export const api = {
  getSurveys: () => instance.get('/surveys'),
  getSurveyStats: () => instance.get('/surveys/stats'),
  getSurvey: (id) => instance.get(`/surveys/${id}`),
  createSurvey: (data) => instance.post('/surveys', data),
  updateSurvey: (id, data) => instance.put(`/surveys/${id}`, data),
  deleteSurvey: (id) => instance.delete(`/surveys/${id}`),
  publishSurvey: (id) => instance.post(`/surveys/${id}/publish`),
  submitResponse: (data) => instance.post('/responses', data),
  getStatistics: (id) => instance.get(`/surveys/${id}/statistics`),
  clearAll: () => instance.post('/clear')
};

import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

request.interceptors.response.use(
  (response) => {
    if (response.config.responseType === 'blob') {
      return response
    }
    const data = response.data
    if (data && data.success === false) {
      ElMessage.error(data.message || '请求失败')
    }
    return data
  },
  (error) => {
    const msg = error.response?.data?.message || error.message || '网络错误，请重试'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default request

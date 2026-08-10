import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: '/v1',
  withCredentials: true,
  timeout: 20000
})

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 0) {
      const silent = response.config?.silentError
      if (!silent) {
        ElMessage({ message: res.msg || 'Error', type: 'error', duration: 4000 })
      }
      return Promise.reject(new Error(res.msg || 'Error'))
    }
    return res
  },
  (error) => {
    const status = error.response?.status
    const silent = error.config?.silentError || status === 401
    const msg = error.response?.data?.msg || error.message || '网络错误'
    if (!silent) {
      ElMessage({ message: msg, type: 'error', duration: 4000 })
    }
    return Promise.reject(error)
  }
)

export default service

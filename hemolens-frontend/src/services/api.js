// src/services/api.js
import axios from 'axios'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hemolens_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hemolens_token')
      localStorage.removeItem('hemolens_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
}

export const reportsAPI = {
  upload: (file) => {
    const form = new FormData()
    form.append('report', file)
    return api.post('/reports/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  getStatus: (id) => api.get(`/reports/status/${id}`),
  getReport: (id) => api.get(`/reports/${id}`),
  getHistory: () => api.get('/reports/history'),
  chat: (id, question) => api.post(`/reports/${id}/chat`, { question }),
  deleteReport: (id) => api.delete(`/reports/${id}`),
  exportReport: (id) =>
  api.get(`/reports/${id}/export`, {
    responseType: "blob",
  }),
}

export default api

import axios from 'axios'

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
})

// Attacher le token JWT automatiquement si présent
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const getAnnonces = (params) => api.get('/annonces', { params })
export const getAnnonce = (id) => api.get(`/annonces/${id}`)
export const createAnnonce = (data) => api.post('/annonces', data)
export const updateAnnonce = (id, data) => api.put(`/annonces/${id}`, data)
export const deleteAnnonce = (id) => api.delete(`/annonces/${id}`)

export default api

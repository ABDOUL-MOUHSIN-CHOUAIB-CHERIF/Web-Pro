import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ew_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ew_token')
      localStorage.removeItem('ew_user')
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (payload) => api.post('/auth/login', payload),
  register: (payload) => api.post('/auth/register', payload),
}

export const expensesApi = {
  list: () => api.get('/expenses'),
  byCategory: (categoryId) => api.get(`/expenses/category/${categoryId}`),
  get: (id) => api.get(`/expenses/${id}`),
  create: (payload) => api.post('/expenses', payload),
  update: (id, payload) => api.put(`/expenses/${id}`, payload),
  remove: (id) => api.delete(`/expenses/${id}`),
}

export const incomesApi = {
  list: () => api.get('/incomes'),
  create: (payload) => api.post('/incomes', payload),
  update: (id, payload) => api.put(`/incomes/${id}`, payload),
  remove: (id) => api.delete(`/incomes/${id}`),
}

export const categoriesApi = {
  list: () => api.get('/categories'),
  create: (payload) => api.post('/categories', payload),
  update: (id, payload) => api.put(`/categories/${id}`, payload),
  remove: (id) => api.delete(`/categories/${id}`),
}

export const goalsApi = {
  list: () => api.get('/goals'),
  create: (payload) => api.post('/goals', payload),
  update: (id, payload) => api.put(`/goals/${id}`, payload),
  remove: (id) => api.delete(`/goals/${id}`),
}

export const dashboardApi = {
  counts: () => api.get('/dashboard'),
  summary: () => api.get('/dashboard/summary'),
}

export const reportsApi = {
  monthlyExpenses: () => api.get('/reports/monthly-expenses'),
  monthlyIncomes: () => api.get('/reports/monthly-incomes'),
  categoryExpenses: () => api.get('/reports/category-expenses'),
  financialSummary: () => api.get('/reports/financial-summary'),
}

export default api

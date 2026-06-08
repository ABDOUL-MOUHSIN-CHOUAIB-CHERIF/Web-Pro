import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('ew_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('ew_token'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) localStorage.setItem('ew_token', token)
    else localStorage.removeItem('ew_token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('ew_user', JSON.stringify(user))
    else localStorage.removeItem('ew_user')
  }, [user])

  const login = useCallback(async ({ email, password }) => {
    setLoading(true)
    try {
      const { data } = await authApi.login({ email, password })
      setToken(data.token)
      setUser(data.user)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true)
    try {
      const { data } = await authApi.register({ name, email, password })
      setToken(data.token)
      setUser(data.user)
      return data
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api/authAPI'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => localStorage.getItem('agromart_token'))

  // Load user from token on mount
  useEffect(() => {
    if (token) {
      fetchMe()
    } else {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMe = async () => {
    try {
      const { data } = await authAPI.getMe()
      setUser(data.user)
    } catch {
      // Token invalid — clear it
      localStorage.removeItem('agromart_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password })
    localStorage.setItem('agromart_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (userData) => {
    const { data } = await authAPI.register(userData)
    localStorage.setItem('agromart_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch { /* silent */ }
    localStorage.removeItem('agromart_token')
    setToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }, [])

  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }))
  }, [])

  const isAdmin = user?.role === 'admin'
  const isAuthenticated = !!user && !!token

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated, isAdmin,
      login, register, logout, updateUser, fetchMe,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

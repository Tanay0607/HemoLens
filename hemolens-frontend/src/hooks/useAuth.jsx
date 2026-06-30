// src/hooks/useAuth.jsx
// React Context that holds the logged-in user across the whole app
// Wrap your app with <AuthProvider> and call useAuth() anywhere

import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    // Try to restore user from localStorage on page load
    const saved = localStorage.getItem('hemolens_user')
    if (!saved || saved === 'undefined' || saved === 'null') return null
    try {
      return JSON.parse(saved)
    } catch {
      // Corrupted data — clear it so this never crashes again
      localStorage.removeItem('hemolens_user')
      localStorage.removeItem('hemolens_token')
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  // Verify token is still valid on mount
  useEffect(() => {
    const token = localStorage.getItem('hemolens_token')
    if (token) {
      // Safety net: if the backend is slow to wake up (Render free tier
      // cold start), don't leave the UI stuck loading forever
      const timeout = setTimeout(() => setLoading(false), 8000)

      authAPI.getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('hemolens_token')
          localStorage.removeItem('hemolens_user')
          setUser(null)
        })
        .finally(() => { clearTimeout(timeout); setLoading(false) })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    const { token, user } = res.data
    localStorage.setItem('hemolens_token', token)
    localStorage.setItem('hemolens_user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password })
    const { token, user } = res.data
    localStorage.setItem('hemolens_token', token)
    localStorage.setItem('hemolens_user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('hemolens_token')
    localStorage.removeItem('hemolens_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

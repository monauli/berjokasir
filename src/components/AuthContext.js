'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [lokasi, setLokasiState] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('berjo_token')
    const savedUser = localStorage.getItem('berjo_user')
    const savedLokasi = localStorage.getItem('berjo_lokasi')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    if (savedLokasi) setLokasiState(savedLokasi)
    setLoading(false)
  }, [])

  function login(userData, tokenData) {
    const savedLokasi = localStorage.getItem('berjo_lokasi')
    setUser(userData)
    setToken(tokenData)
    setLokasiState(savedLokasi)
    localStorage.setItem('berjo_token', tokenData)
    localStorage.setItem('berjo_user', JSON.stringify(userData))
  }

  function logout() {
    setUser(null)
    setToken(null)
    // Lokasi tetap disimpan agar pilihan terakhir masih tersedia.
    localStorage.removeItem('berjo_token')
    localStorage.removeItem('berjo_user')
  }

  async function apiFetch(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const res = await fetch(path, { ...options, headers })
    if (res.status === 401) { logout(); return null }
    return res
  }

  return (
    <AuthContext.Provider value={{ user, token, lokasi, loading, login, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, AuthProvider } from '@/components/AuthContext'

const LOKASI_INFO = {
  jumog: { nama: 'Air Terjun Jumog', kode: 'JG', tone: 'Biru air' },
  madirda: { nama: 'Telaga Madirda', kode: 'MD', tone: 'Biru elegan' },
}

function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lokasi, setLokasi] = useState(null)
  const { login } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('berjo_lokasi')
    if (!saved) {
      router.push('/')
      return
    }
    setLokasi(saved)
  }, [router])

  async function handleLogin(e) {
    e.preventDefault()
    if (!username || !password) {
      setError('Username dan password wajib diisi')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, lokasi }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login gagal')
        return
      }
      login(data.user, data.token)
      router.push(data.user.role === 'supervisor' ? '/laporan' : '/kasir')
    } catch {
      setError('Gagal terhubung ke server')
    } finally {
      setLoading(false)
    }
  }

  const info = LOKASI_INFO[lokasi] || LOKASI_INFO.jumog

  return (
    <div className={`theme-${lokasi || 'jumog'}`} style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(180deg, #fbfcfe 0%, #f6f8fb 100%)',
      padding: '1rem',
    }}>
      <div className="clean-card animate-fade" style={{
        width: '100%',
        maxWidth: 420,
        padding: '1.35rem',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: '0 0 auto', height: 5, background: 'linear-gradient(90deg, var(--location-primary), var(--location-secondary))' }} />

        <button
          onClick={() => router.push('/')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.84rem',
            cursor: 'pointer',
            padding: '0 0 0.75rem',
            fontWeight: 800,
          }}
        >
          Ganti Lokasi
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.45rem' }}>
          <img src="/logo-berjo.png" alt="Wisata Berjo" style={{ height: 66, objectFit: 'contain' }} />
          <div style={{ marginTop: '0.85rem' }} className="location-chip">
            <span className="location-dot" />
            {info.nama}
          </div>
          <h1 style={{ color: 'var(--text-main)', fontSize: '1.2rem', margin: '1rem 0 0.25rem', fontWeight: 800, letterSpacing: 0 }}>
            Masuk Sistem Kasir
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>{info.tone}</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Username</label>
            <input
              className="app-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              autoComplete="username"
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password</label>
            <input
              className="app-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div style={{ color: '#b42318', background: '#fff4f2', border: '1px solid #fecdca', borderRadius: 9, fontSize: '0.83rem', padding: '0.7rem 0.8rem', marginBottom: '0.85rem', fontWeight: 700 }}>
              {error}
            </div>
          )}
          <button type="submit" className="app-button" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return <AuthProvider><LoginForm /></AuthProvider>
}

'use client'
import { useAuth } from './AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from './Sidebar'

export default function AppLayout({ children, title, requireRole = null }) {
  const { user, loading, lokasi } = useAuth()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/')
        return
      }
      if (requireRole && user.role !== requireRole) {
        router.push(user.role === 'supervisor' ? '/laporan' : '/kasir')
      }
    }
  }, [user, loading, requireRole, router])

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-main)' }}>
        <div className="clean-card" style={{ padding: '1.35rem 1.5rem', fontWeight: 800, color: 'var(--location-primary)', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <span className="meta-dot" />
          Memuat Sistem...
        </div>
      </div>
    )
  }

  const dateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className={`app-container theme-${lokasi || 'jumog'}`}>
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="app-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
            <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Buka menu">
              <span style={{ width: 16, height: 2, background: 'currentColor', display: 'block', boxShadow: '0 5px 0 currentColor, 0 -5px 0 currentColor' }} />
            </button>
            <h1 className="topbar-title">{title}</h1>
          </div>
          <div className="topbar-meta">
            <span className="meta-dot" />
            {dateStr}
          </div>
        </header>

        <main className="page-shell">
          {children}
        </main>
      </div>
    </div>
  )
}

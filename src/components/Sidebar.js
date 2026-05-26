'use client'
import { useAuth } from './AuthContext'
import { useRouter, usePathname } from 'next/navigation'

const LOCATION_LABELS = {
  jumog: 'Air Terjun Jumog',
  madirda: 'Telaga Madirda',
}

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout, lokasi } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isSupervisor = user?.role === 'supervisor'
  const lokasiLabel = LOCATION_LABELS[lokasi] || null

  const kasirNav = [
    { href: '/kasir', icon: 'KT', label: 'Kasir Tiket' },
    { href: '/kasir/riwayat', icon: 'RT', label: 'Riwayat Transaksi' },
  ]

  const supervisorNav = [
    { href: '/laporan', icon: 'DA', label: 'Dashboard Analisis' },
    { href: '/pengunjung', icon: 'DP', label: 'Data Pengunjung' },
    { href: '/supervisor/kasir', icon: 'KK', label: 'Kelola Kasir' },
    { href: '/pengaturan', icon: 'PH', label: 'Pengaturan Harga' },
  ]

  const initials = user ? user.name.split(' ').map((word) => word[0]).slice(0, 2).join('') : '?'

  const handleNav = (href) => {
    router.push(href)
    if (setIsOpen) setIsOpen(false)
  }

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <img src="/logo-berjo.png" alt="Berjo" />
        </div>
        <div>
          <div className="sidebar-title">WISATA BERJO</div>
          <div className="sidebar-subtitle">Ticketing System</div>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>
        <div style={{ overflow: 'hidden' }}>
          <div className="sidebar-user-name">{user?.name}</div>
          <div className="sidebar-user-role">{isSupervisor ? 'Supervisor' : 'Kasir Staff'}</div>
          {lokasiLabel && (
            <div className="sidebar-location">
              <span className="location-dot" />
              {lokasiLabel}
            </div>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Menu Utama</div>
        {(isSupervisor ? supervisorNav : kasirNav).map((item) => {
          const isActive = pathname === item.href
          return (
            <button
              key={item.href}
              onClick={() => handleNav(item.href)}
              className={`sidebar-nav-button ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          className="logout-button"
          onClick={() => {
            logout()
            router.push('/')
          }}
        >
          Keluar Akun
        </button>
      </div>
    </aside>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, AuthProvider } from '@/components/AuthContext'
import LocationMark from '@/components/LocationMark'

const LOKASI = [
  {
    id: 'jumog',
    nama: 'Air Terjun Jumog',
    desc: 'Arus tiket untuk area air terjun.',
    tone: 'Biru air',
  },
  {
    id: 'madirda',
    nama: 'Telaga Madirda',
    desc: 'Arus tiket untuk area telaga.',
    tone: 'Biru elegan',
  },
]

function PilihLokasi() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === 'supervisor' ? '/laporan' : '/kasir')
    }
  }, [user, loading, router])

  function pilih(id) {
    localStorage.setItem('berjo_lokasi', id)
    router.push('/login')
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(150deg, #071a2d 0%, #064468 52%, #0877a5 100%)',
      padding: '1.5rem',
    }}>
      <div style={{ width: '100%', maxWidth: 880 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <img src="/logo-berjo.png" alt="Wisata Berjo" style={{ height: 70, objectFit: 'contain' }} />
          <h1 style={{ color: '#ffffff', fontSize: '1.65rem', fontWeight: 800, margin: '0.85rem 0 0', letterSpacing: 0 }}>
            WISATA BERJO
          </h1>
          <p style={{ color: 'rgba(229, 242, 255, 0.82)', fontSize: '0.96rem', marginTop: '0.35rem', fontWeight: 600 }}>
            Sistem kasir tiket multi-lokasi
          </p>
        </div>

        <div className="clean-card" style={{
          padding: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          background: 'rgba(255, 255, 255, 0.13)',
          borderColor: 'rgba(255, 255, 255, 0.18)',
          boxShadow: '0 20px 60px rgba(3, 20, 38, 0.26)',
          backdropFilter: 'blur(10px)',
        }}>
          {LOKASI.map((lok) => {
            const active = hovered === lok.id
            return (
              <button
                key={lok.id}
                onClick={() => pilih(lok.id)}
                onMouseEnter={() => setHovered(lok.id)}
                onMouseLeave={() => setHovered(null)}
                className={`theme-${lok.id}`}
                style={{
                  position: 'relative',
                  padding: '1.25rem',
                  borderRadius: 10,
                  border: `1px solid ${active ? 'var(--location-border)' : 'var(--border)'}`,
                  background: active ? 'linear-gradient(180deg, var(--location-soft), #ffffff)' : '#ffffff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                  transform: active ? 'translateY(-2px)' : 'none',
                  boxShadow: active ? 'var(--shadow-md)' : 'none',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', inset: '0 auto 0 0', width: 5, background: 'var(--location-primary)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', marginBottom: '1rem' }}>
                  <LocationMark type={lok.id} size={48} />
                  <div>
                    <div style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '1.02rem' }}>{lok.nama}</div>
                    <div style={{ color: 'var(--location-primary)', fontSize: '0.78rem', fontWeight: 800, marginTop: '0.18rem' }}>{lok.tone}</div>
                  </div>
                </div>
                <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem', lineHeight: 1.55 }}>{lok.desc}</p>
                <div style={{ marginTop: '1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.45rem', color: 'var(--location-primary)', fontSize: '0.86rem', fontWeight: 800 }}>
                  Masuk
                  <span style={{ width: 22, height: 22, borderRadius: 999, background: 'var(--location-soft)', display: 'grid', placeItems: 'center' }}>{'>'}</span>
                </div>
              </button>
            )
          })}
        </div>

        <p style={{ color: 'rgba(226, 242, 255, 0.72)', fontSize: '0.78rem', marginTop: '1.5rem', textAlign: 'center', fontWeight: 700 }}>
          Berjo Ticketing
        </p>
      </div>
    </div>
  )
}

export default function HomePage() {
  return <AuthProvider><PilihLokasi /></AuthProvider>
}

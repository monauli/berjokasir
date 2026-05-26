'use client'
import { useState } from 'react'
import { useAuth } from '@/components/AuthContext'
import AppLayout from '@/components/AppLayout'
import { AuthProvider } from '@/components/AuthContext'
import { QueryClient, QueryClientProvider, useQuery, keepPreviousData } from '@tanstack/react-query'

// Create a client for React Query
const queryClient = new QueryClient()

function formatRp(n) { return 'Rp ' + Math.round(n || 0).toLocaleString('id-ID') }

const BADGE = {
  satuan: { bg: '#e0f2fe', color: '#0284c7', label: 'Satuan' },
  rombongan: { bg: '#fef3c7', color: '#d97706', label: 'Rombongan' },
  mancanegara: { bg: '#cffafe', color: '#0891b2', label: 'Mancanegara' },
}

function RiwayatContent() {
  const { apiFetch } = useAuth()

  // Pagination & Select State
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // TanStack Query Implementation
  const { data, isLoading, isError } = useQuery({
    queryKey: ['tickets', page, limit],
    queryFn: async () => {
      const res = await apiFetch(`/api/tickets?page=${page}&limit=${limit}`)
      if (!res.ok) throw new Error('Gagal mengambil data')
      return res.json()
    },
    placeholderData: keepPreviousData // Keeps old data visible while fetching the next page
  })

  // Extract data with safe fallbacks
  const tickets = data?.tickets || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalTickets: 0 }
  const summary = data?.summary || { totalPemasukan: 0 }

  if (isLoading) return <div style={{ textAlign: 'center', padding: 40, color: '#5b8db8' }}>Memuat riwayat...</div>
  if (isError) return <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>Gagal memuat riwayat transaksi.</div>

  return (
    <div>
      {/* Summary Cards */}
      <div style={{ background: 'white', borderRadius: 12, padding: '1rem 1.5rem', border: '1.5px solid #bae0fb', marginBottom: 16, display: 'flex', gap: 24 }}>
        <div>
          <span style={{ fontSize: 12, color: '#5b8db8' }}>Transaksi Hari Ini</span>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0c1e35' }}>{pagination.totalTickets}</div>
        </div>
        <div>
          <span style={{ fontSize: 12, color: '#5b8db8' }}>Total Pemasukan</span>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0284c7' }}>{formatRp(summary.totalPemasukan)}</div>
        </div>
      </div>

      {/* Toolbar: Page limit selector */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 13, color: '#1e4976', fontWeight: 600 }}>Tampilkan:</label>
        <select
          value={limit}
          onChange={(e) => {
            setLimit(Number(e.target.value))
            setPage(1) // Reset to first page when changing row limits
          }}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #bae0fb', fontSize: 13, outline: 'none', background: 'white', cursor: 'pointer' }}
        >
          <option value={5}>5 baris</option>
          <option value={10}>10 baris</option>
          <option value={20}>20 baris</option>
          <option value={50}>50 baris</option>
        </select>
      </div>

      {tickets.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#5b8db8' }}>
          <div style={{ fontSize: 48 }}>📋</div>
          <p style={{ marginTop: 12 }}>Belum ada transaksi hari ini</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, border: '1.5px solid #bae0fb', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#e0f2fe' }}>
                  {['ID', 'Waktu', 'Nama', 'No. HP', 'Jenis', 'Orang', 'Total'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#1e4976', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid #bae0fb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((t, i) => {
                  const b = BADGE[t.jenis] || BADGE.satuan
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #f0f7ff' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e4976' }}>{t.id}</td>
                      <td style={{ padding: '12px 14px', color: '#5b8db8' }}>{t.waktu}</td>
                      <td style={{ padding: '12px 14px' }}>{t.nama || '-'}</td>
                      <td style={{ padding: '12px 14px', color: '#5b8db8' }}>{t.noHp || '-'}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, background: b.bg, color: b.color, fontSize: 11, fontWeight: 700 }}>{b.label}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }}>{t.qty || 1}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0284c7' }}>{formatRp(t.total)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid #bae0fb', background: '#f8fafc', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: 13, color: '#5b8db8', fontWeight: 500 }}>
              Menampilkan halaman <b>{pagination.page}</b> dari <b>{pagination.totalPages}</b> (Total {pagination.totalTickets} tiket)
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '6px 14px', border: '1px solid #bae0fb', borderRadius: 6, fontSize: 13, fontWeight: 600, transition: '0.2s',
                  background: page === 1 ? '#e2e8f0' : 'white',
                  color: page === 1 ? '#94a3b8' : '#1e4976',
                  cursor: page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Sebelumnya
              </button>
              <button
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages || pagination.totalPages === 0}
                style={{
                  padding: '6px 14px', border: '1px solid #bae0fb', borderRadius: 6, fontSize: 13, fontWeight: 600, transition: '0.2s',
                  background: page >= pagination.totalPages ? '#e2e8f0' : 'white',
                  color: page >= pagination.totalPages ? '#94a3b8' : '#1e4976',
                  cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RiwayatPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppLayout title="Riwayat Transaksi">
          <RiwayatContent />
        </AppLayout>
      </AuthProvider>
    </QueryClientProvider>
  )
}
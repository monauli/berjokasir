'use client'
import { useState } from 'react'
import { useAuth } from '@/components/AuthContext'
import AppLayout from '@/components/AppLayout'
import { AuthProvider } from '@/components/AuthContext'
import { QueryClient, QueryClientProvider, useQuery, keepPreviousData } from '@tanstack/react-query'

const queryClient = new QueryClient()

function formatRp(n) { return 'Rp ' + Math.round(n || 0).toLocaleString('id-ID') }

function PengunjungContent() {
  const { apiFetch } = useAuth()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['visitors', page, limit],
    queryFn: async () => {
      const res = await apiFetch(`/api/visitors?page=${page}&limit=${limit}`)
      if (!res.ok) throw new Error('Gagal mengambil data')
      return res.json()
    },
    placeholderData: keepPreviousData
  })

  const visitors = data?.visitors || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalItems: 0 }

  if (isLoading) return <div style={{ textAlign: 'center', padding: 40, color: '#5b8db8' }}>Memuat data pengunjung...</div>
  if (isError) return <div style={{ textAlign: 'center', padding: 40, color: '#ef4444' }}>Gagal memuat data pengunjung.</div>

  return (
    <div>
      <div style={{ background: '#e0f2fe', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#0369a1', display: 'flex', alignItems: 'center', gap: 8 }}>
        ℹ️ Pengunjung diidentifikasi berdasarkan nama yang diinput kasir saat transaksi.
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12, alignItems: 'center', gap: 8 }}>
        <label style={{ fontSize: 13, color: '#1e4976', fontWeight: 600 }}>Tampilkan:</label>
        <select
          value={limit}
          onChange={(e) => { setLimit(Number(e.target.value)); setPage(1) }}
          style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #bae0fb', fontSize: 13, outline: 'none', background: 'white', cursor: 'pointer' }}
        >
          <option value={5}>5 baris</option>
          <option value={10}>10 baris</option>
          <option value={20}>20 baris</option>
          <option value={50}>50 baris</option>
        </select>
      </div>

      {visitors.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#5b8db8' }}>
          <div style={{ fontSize: 48 }}>👥</div>
          <p style={{ marginTop: 12 }}>Belum ada data pengunjung</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 12, border: '1.5px solid #bae0fb', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#e0f2fe' }}>
                  {['#', 'Nama Pengunjung', 'No. HP', 'Kunjungan', 'Total Orang', 'Total Bayar', 'Terakhir'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#1e4976', textTransform: 'uppercase', borderBottom: '1px solid #bae0fb' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visitors.map((v, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f7ff' }}>
                    <td style={{ padding: '10px 14px', color: '#5b8db8', fontWeight: 700 }}>{((page - 1) * limit) + i + 1}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{v.nama}</td>
                    <td style={{ padding: '10px 14px', color: '#5b8db8' }}>{v.noHp || '-'}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, background: v.kunjungan > 1 ? '#e0f2fe' : '#f0f0f0', color: v.kunjungan > 1 ? '#0284c7' : '#5b8db8', fontSize: 12, fontWeight: 700 }}>
                        {v.kunjungan}× {v.kunjungan > 1 ? '🔄' : ''}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>{v.totalOrang} orang</td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0284c7' }}>{formatRp(v.totalBayar)}</td>
                    <td style={{ padding: '10px 14px', color: '#5b8db8' }}>{v.terakhir || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid #bae0fb', background: '#f8fafc', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ fontSize: 13, color: '#5b8db8', fontWeight: 500 }}>
              Menampilkan halaman <b>{pagination.page}</b> dari <b>{pagination.totalPages}</b> (Total {pagination.totalItems} pengunjung)
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 14px', border: '1px solid #bae0fb', borderRadius: 6, fontSize: 13, fontWeight: 600, background: page === 1 ? '#e2e8f0' : 'white', color: page === 1 ? '#94a3b8' : '#1e4976', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Sebelumnya</button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages || pagination.totalPages === 0} style={{ padding: '6px 14px', border: '1px solid #bae0fb', borderRadius: 6, fontSize: 13, fontWeight: 600, background: page >= pagination.totalPages ? '#e2e8f0' : 'white', color: page >= pagination.totalPages ? '#94a3b8' : '#1e4976', cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer' }}>Selanjutnya</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function PengunjungPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppLayout title="Data Pengunjung" requireRole="supervisor">
          <PengunjungContent />
        </AppLayout>
      </AuthProvider>
    </QueryClientProvider>
  )
}
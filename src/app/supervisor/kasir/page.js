'use client'
import { useState } from 'react'
import { useAuth } from '@/components/AuthContext'
import AppLayout from '@/components/AppLayout'
import { AuthProvider } from '@/components/AuthContext'
import { QueryClient, QueryClientProvider, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'

const queryClient = new QueryClient()

function KelolaCasirContent() {
  const { apiFetch } = useAuth()
  const qClient = useQueryClient()

  // Pagination & Search States
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5) // Default to 5 here to show pagination faster

  // Form States
  const [form, setForm] = useState({ name: '', username: '', password: '', lokasi: 'jumog' })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')
  const [showForm, setShowForm] = useState(false)

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  // React Query fetcher
  const { data, isLoading } = useQuery({
    queryKey: ['users', page, limit],
    queryFn: async () => {
      const res = await apiFetch(`/api/users?page=${page}&limit=${limit}`)
      return res.json()
    },
    placeholderData: keepPreviousData
  })

  const users = data?.users || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalItems: 0 }

  async function handleAdd() {
    if (!form.name || !form.username || !form.password) { showToast('❌ Semua field wajib diisi'); return }
    setSaving(true)
    const res = await apiFetch('/api/users', { method: 'POST', body: JSON.stringify(form) })
    const d = await res?.json()
    if (d?.success) {
      showToast('✅ Kasir berhasil ditambahkan!')
      setForm({ name: '', username: '', password: '', lokasi: 'jumog' })
      setShowForm(false)
      // Refresh the query automatically
      qClient.invalidateQueries({ queryKey: ['users'] })
    } else {
      showToast('❌ ' + (d?.error || 'Gagal menambahkan'))
    }
    setSaving(false)
  }

  async function handleDelete(id, name) {
    if (!confirm(`Hapus kasir "${name}"?`)) return
    const res = await apiFetch('/api/users', { method: 'DELETE', body: JSON.stringify({ id }) })
    const d = await res?.json()
    if (d?.success) {
      showToast('✅ Kasir dihapus')
      qClient.invalidateQueries({ queryKey: ['users'] })
    }
    else showToast('❌ Gagal menghapus')
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#1e4976' }}>Total {pagination.totalItems} kasir terdaftar</div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ padding: '9px 20px', background: '#0284c7', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}>
          {showForm ? '✕ Batal' : '+ Tambah Kasir'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', border: '1.5px solid #bae0fb', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0284c7', marginBottom: 16 }}>👤 Tambah Kasir Baru</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { key: 'name', label: 'Nama Lengkap', placeholder: 'Contoh: Budi Santoso' },
              { key: 'username', label: 'Username', placeholder: 'Contoh: budi123' },
              { key: 'password', label: 'Password', placeholder: 'Min. 6 karakter', type: 'password' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#1e4976', marginBottom: 5, textTransform: 'uppercase' }}>{f.label}</label>
                <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #bae0fb', borderRadius: 8, fontSize: 14, outline: 'none' }} />
              </div>
            ))}
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#1e4976', marginBottom: 5, textTransform: 'uppercase' }}>Lokasi Tugas</label>
              <select value={form.lokasi} onChange={e => setForm(p => ({ ...p, lokasi: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #bae0fb', borderRadius: 8, fontSize: 14, outline: 'none' }}>
                <option value="jumog">🌊 Air Terjun Jumog</option>
                <option value="madirda">🏞️ Telaga Madirda</option>
              </select>
            </div>
          </div>
          <button onClick={handleAdd} disabled={saving}
            style={{ marginTop: 16, padding: '10px 24px', background: '#0284c7', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            {saving ? 'Menyimpan...' : '💾 Simpan Kasir'}
          </button>
        </div>
      )}

      {/* Toolbar: Page limit selector */}
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

      {isLoading ? <div style={{ textAlign: 'center', padding: 40, color: '#5b8db8' }}>Memuat data...</div> : (
        users.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#5b8db8' }}>
            <div style={{ fontSize: 48 }}>👤</div>
            <p style={{ marginTop: 12 }}>Belum ada kasir terdaftar</p>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 12, border: '1.5px solid #bae0fb', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#e0f2fe' }}>
                    {['#', 'Nama Lengkap', 'Username', 'Lokasi', 'Terdaftar', 'Aksi'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#1e4976', textTransform: 'uppercase', borderBottom: '1px solid #bae0fb' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f0f7ff' }}>
                      <td style={{ padding: '10px 14px', color: '#5b8db8', fontWeight: 700 }}>{((page - 1) * limit) + i + 1}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '10px 14px', color: '#0284c7', fontFamily: 'monospace' }}>{u.username}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ background: u.lokasi === 'madirda' ? '#d1fae5' : '#e0f2fe', color: u.lokasi === 'madirda' ? '#065f46' : '#0284c7', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {u.lokasi === 'jumog' ? '🌊 Air Terjun Jumog' : u.lokasi === 'madirda' ? '🏞️ Telaga Madirda' : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', color: '#5b8db8' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID') : '-'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <button onClick={() => handleDelete(u._id, u.name)} style={{ padding: '5px 12px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          🗑️ Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderTop: '1px solid #bae0fb', background: '#f8fafc', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ fontSize: 13, color: '#5b8db8', fontWeight: 500 }}>
                Menampilkan halaman <b>{pagination.page}</b> dari <b>{pagination.totalPages}</b> (Total {pagination.totalItems} kasir)
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 14px', border: '1px solid #bae0fb', borderRadius: 6, fontSize: 13, fontWeight: 600, background: page === 1 ? '#e2e8f0' : 'white', color: page === 1 ? '#94a3b8' : '#1e4976', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Sebelumnya</button>
                <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages || pagination.totalPages === 0} style={{ padding: '6px 14px', border: '1px solid #bae0fb', borderRadius: 6, fontSize: 13, fontWeight: 600, background: page >= pagination.totalPages ? '#e2e8f0' : 'white', color: page >= pagination.totalPages ? '#94a3b8' : '#1e4976', cursor: page >= pagination.totalPages ? 'not-allowed' : 'pointer' }}>Selanjutnya</button>
              </div>
            </div>
          </div>
        )
      )}

      {toast && <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#0284c7', color: 'white', padding: '12px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, zIndex: 200, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>{toast}</div>}
    </div>
  )
}

export default function KelolaCasirPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppLayout title="Kelola Kasir" requireRole="supervisor">
          <KelolaCasirContent />
        </AppLayout>
      </AuthProvider>
    </QueryClientProvider>
  )
}
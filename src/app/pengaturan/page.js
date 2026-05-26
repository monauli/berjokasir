'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthContext'
import AppLayout from '@/components/AppLayout'
import { AuthProvider } from '@/components/AuthContext'

function PengaturanContent() {
  const { apiFetch } = useAuth()
  const [form, setForm] = useState({ satuan: 25000, mancanegara: 75000, diskonRombongan: 10, minRombongan: 5 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    apiFetch('/api/config').then(r => r?.json()).then(d => {
      if (d?.harga) setForm(d.harga)
      setLoading(false)
    })
  }, [])

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function handleSave() {
    setSaving(true)
    const res = await apiFetch('/api/config', { method: 'PUT', body: JSON.stringify(form) })
    const d = await res?.json()
    if (d?.success) showToast('✅ Harga berhasil disimpan!')
    else showToast('❌ Gagal menyimpan: ' + (d?.error || 'Error'))
    setSaving(false)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 40, color: '#5b8db8' }}>Memuat pengaturan...</div>

  const fields = [
    {
      title: '🎫 Harga Tiket',
      items: [
        { key: 'satuan', label: 'Harga Tiket Satuan (per orang)', prefix: 'Rp' },
        { key: 'mancanegara', label: 'Harga Tiket Mancanegara (per orang)', prefix: 'Rp' },
      ]
    },
    {
      title: '👥 Pengaturan Rombongan',
      items: [
        { key: 'minRombongan', label: 'Minimum orang untuk mendapat harga rombongan', suffix: 'orang' },
        { key: 'diskonRombongan', label: 'Persentase diskon rombongan', suffix: '%' },
      ]
    }
  ]

  return (
    <div>
      {fields.map((section, si) => (
        <div key={si} style={{ background: 'white', borderRadius: 12, padding: '1.5rem', border: '1.5px solid #bae0fb', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0c1e35', marginBottom: 16 }}>{section.title}</h3>
          {section.items.map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <label style={{ flex: 1, fontSize: 13.5, color: '#1e4976' }}>{item.label}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {item.prefix && <span style={{ fontSize: 13, color: '#5b8db8', fontWeight: 600 }}>{item.prefix}</span>}
                <input type="number" value={form[item.key]}
                  onChange={e => setForm(f => ({ ...f, [item.key]: Number(e.target.value) }))}
                  style={{ width: 140, padding: '8px 12px', border: '1.5px solid #bae0fb', borderRadius: 8, fontSize: 14, outline: 'none', textAlign: 'right' }} />
                {item.suffix && <span style={{ fontSize: 13, color: '#5b8db8', fontWeight: 600 }}>{item.suffix}</span>}
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{ background: '#e0f2fe', borderRadius: 12, padding: '1.25rem', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#0369a1', marginBottom: 10 }}>Preview Harga</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div style={{ background: 'white', borderRadius: 8, padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#5b8db8' }}>Satuan</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0284c7' }}>Rp {form.satuan.toLocaleString('id-ID')}</div>
          </div>
          <div style={{ background: 'white', borderRadius: 8, padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#5b8db8' }}>Rombongan (≥{form.minRombongan} org)</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#d97706' }}>
              Rp {Math.round(form.satuan * (1 - form.diskonRombongan / 100)).toLocaleString('id-ID')}
            </div>
            <div style={{ fontSize: 11, color: '#d97706' }}>Diskon {form.diskonRombongan}%</div>
          </div>
          <div style={{ background: 'white', borderRadius: 8, padding: '0.75rem', textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#5b8db8' }}>Mancanegara</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0891b2' }}>Rp {form.mancanegara.toLocaleString('id-ID')}</div>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        style={{ padding: '12px 28px', background: 'linear-gradient(135deg, #0369a1, #0284c7)', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
      </button>

      {toast && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: '#0284c7', color: 'white', padding: '12px 20px', borderRadius: 8, fontSize: 14, fontWeight: 600, zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  )
}

export default function PengaturanPage() {
  return (
    <AuthProvider>
      <AppLayout title="Pengaturan Harga" requireRole="supervisor">
        <PengaturanContent />
      </AppLayout>
    </AuthProvider>
  )
}

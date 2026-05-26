"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthContext";
import AppLayout from "@/components/AppLayout";
import { AuthProvider } from "@/components/AuthContext";

function formatRp(n) {
  return "Rp " + Math.round(n || 0).toLocaleString("id-ID");
}

function validateNoHp(noHp) {
  const cleaned = noHp.replace(/\s+/g, "");
  if (!cleaned.startsWith("+62")) return { valid: false, msg: "Nomor harus diawali +62" };
  const digits = cleaned.slice(3);
  if (digits.length < 9 || digits.length > 12) return { valid: false, msg: "Nomor setelah +62 harus 9-12 digit" };
  if (!/^\d+$/.test(digits)) return { valid: false, msg: "Nomor hanya boleh berisi angka" };
  return { valid: true, msg: "" };
}

function TicketPrint({ struk }) {
  if (!struk) return null;
  return (
    <div id="ticket-print" style={{ width: '80mm', fontFamily: "monospace", background: "white", padding: "16px", display: "none", margin: '0 auto' }}>
      <div style={{ textAlign: "center", borderBottom: "2px dashed #000", paddingBottom: 10, marginBottom: 10 }}>
        <img src="/logo-berjo.png" alt="Berjo" style={{ height: 45, objectFit: "contain", filter: "grayscale(100%)" }} />
        <div style={{ fontSize: 12, fontWeight: 'bold', marginTop: 4 }}>WISATA BERJO</div>
        <div style={{ fontSize: 10, marginTop: 2 }}>Tiket Masuk Wisata</div>
      </div>
      <div style={{ fontSize: 11, marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span>No. Tiket</span><b>{struk.id}</b></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span>Tanggal</span><span>{struk.tanggal} {struk.waktu}</span></div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span>Jenis</span><span>{struk.jenis.toUpperCase()}</span></div>
        {struk.nama && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span>Nama</span><span>{struk.nama}</span></div>}
        {struk.qty > 1 && <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span>Jumlah</span><span>{struk.qty} org</span></div>}
      </div>
      <div style={{ borderTop: "2px dashed #000", borderBottom: "2px dashed #000", padding: "8px 0", margin: "8px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: 14 }}>
          <span>TOTAL</span><span>{formatRp(struk.total)}</span>
        </div>
      </div>
      <div style={{ textAlign: "center", fontSize: 10, marginTop: 12 }}>
        <div>Kasir: {struk.kasirNama}</div>
        <div style={{ marginTop: 6, fontWeight: 'bold' }}>Terima kasih atas kunjungan Anda!</div>
      </div>
    </div>
  );
}

function Struk({ struk, onClose, onNew }) {
  if (!struk) return null;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [sudahCetak, setSudahCetak] = useState(false);

  function handlePrint() {
    if (sudahCetak) return;
    const el = document.getElementById("ticket-print");
    if (!el) return;
    el.style.display = "block";
    window.print();
    el.style.display = "none";
    setSudahCetak(true);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="animate-fade" style={{ background: 'white', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
        <div style={{ textAlign: 'center', borderBottom: '2px dashed #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ width: 64, height: 64, background: '#f0fdf4', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem' }}>
            ✓
          </div>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', margin: 0, fontWeight: 800 }}>Pembayaran Berhasil</h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '0.25rem' }}>{struk.tanggal} — {struk.waktu}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.95rem', color: '#475569' }}>
          {[
            ["No. Transaksi", struk.id],
            ["Jenis Tiket", struk.jenis === "satuan" ? "Satuan" : struk.jenis === "rombongan" ? "Rombongan" : "Mancanegara"],
            struk.nama ? ["Nama", struk.nama] : null,
            struk.noHp ? ["No. HP", struk.noHp] : null,
            struk.qty > 1 ? ["Jumlah Orang", struk.qty + " orang"] : null,
            struk.hargaSatuan ? ["Harga Satuan", formatRp(struk.hargaSatuan)] : null,
            struk.subtotal ? ["Subtotal", formatRp(struk.subtotal)] : null,
            struk.diskon ? ["Diskon " + struk.diskon + "%", "- " + formatRp(struk.diskonAmt)] : null,
          ].filter(Boolean).map(([label, val], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{label}</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{val}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: '1.25rem', color: '#0ea5e9', borderTop: '2px dashed #e2e8f0', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
            <span>TOTAL BAYAR</span>
            <span>{formatRp(struk.total)}</span>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {sudahCetak && (
            <div style={{ background: '#ecfdf5', color: '#059669', padding: '0.75rem', borderRadius: '12px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
              ✅ Tiket berhasil dicetak
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '0.85rem', background: '#f1f5f9', border: 'none', borderRadius: '12px', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>Tutup</button>
            <button onClick={handlePrint} disabled={sudahCetak} style={{ flex: 2, padding: '0.85rem', background: '#0ea5e9', border: 'none', borderRadius: '12px', fontWeight: 700, color: 'white', cursor: sudahCetak ? 'not-allowed' : 'pointer', opacity: sudahCetak ? 0.5 : 1 }}>
              🖨️ {sudahCetak ? "Sudah Dicetak" : "Cetak Tiket"}
            </button>
          </div>
          <button onClick={onNew} disabled={!sudahCetak} style={{ width: '100%', padding: '0.85rem', background: '#10b981', border: 'none', borderRadius: '12px', fontWeight: 700, color: 'white', cursor: !sudahCetak ? 'not-allowed' : 'pointer', opacity: !sudahCetak ? 0.5 : 1 }}>
            + Transaksi Baru
          </button>
          {!sudahCetak && <p style={{ fontSize: '0.75rem', color: '#f59e0b', textAlign: 'center', margin: 0 }}>⚠️ Cetak tiket terlebih dahulu sebelum melanjutkan.</p>}
        </div>
      </div>
      <TicketPrint struk={struk} />
    </div>
  );
}

function KasirContent() {
  const { apiFetch } = useAuth();
  const [ticketType, setTicketType] = useState("satuan");
  const [form, setForm] = useState({ qty: 1, nama: "", noHp: "+62" });
  const [harga, setHarga] = useState({ satuan: 25000, mancanegara: 75000, diskonRombongan: 10, minRombongan: 5 });
  const [struk, setStruk] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    apiFetch("/api/config").then((r) => r?.json()).then((d) => { if (d?.harga) setHarga(d.harga); });
  }, []);

  function handleNoHpChange(e) {
    let val = e.target.value;
    if (!val.startsWith("+62")) val = "+62" + val.replace(/^\+62?/, "");
    setForm((f) => ({ ...f, noHp: val }));
    if (errors.noHp) setErrors((p) => ({ ...p, noHp: "" }));
  }

  function handleQtyChange(amount) {
    setForm(f => ({ ...f, qty: Math.max(1, parseInt(f.qty || 1) + amount) }));
  }

  function validate() {
    const errs = {};
    if (!form.nama.trim()) errs.nama = "Nama pengunjung wajib diisi";
    const hpCheck = validateNoHp(form.noHp);
    if (!hpCheck.valid) errs.noHp = hpCheck.msg;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const qty = parseInt(form.qty) || 1;
  const subtotal = qty * (ticketType === "satuan" ? harga.satuan : ticketType === "rombongan" ? harga.satuan : harga.mancanegara);
  const berlakuDiskon = ticketType === "rombongan" && qty >= harga.minRombongan;
  const discAmt = berlakuDiskon ? (subtotal * harga.diskonRombongan) / 100 : 0;
  const grandTotal = subtotal - discAmt;

  async function handleBayar() {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await apiFetch("/api/tickets", {
        method: "POST",
        body: JSON.stringify({ jenis: ticketType, nama: form.nama.trim(), noHp: form.noHp, qty: ticketType === "rombongan" ? qty : 1 }),
      });
      const data = await res.json();
      if (!res.ok) { alert("Error: " + data.error); return; }
      setStruk(data.ticket);
      setForm({ qty: 1, nama: "", noHp: "+62" });
      setErrors({});
    } catch { alert("Gagal terhubung ke server"); } finally { setLoading(false); }
  }

  const ticketTypes = [
    { key: "satuan", emoji: "🎫", title: "Tiket Satuan", desc: "Perorangan lokal", price: harga.satuan, color: "#0ea5e9" },
    { key: "rombongan", emoji: "👥", title: "Rombongan", desc: `Min. ${harga.minRombongan} orang (Diskon ${harga.diskonRombongan}%)`, price: harga.satuan, color: "#f59e0b" },
    { key: "mancanegara", emoji: "🌏", title: "Mancanegara", desc: "Turis Internasional", price: harga.mancanegara, color: "#8b5cf6" },
  ];

  return (
    <>
      <style>{`
        @media print { body > * { display: none !important; } #ticket-print { display: block !important; } }
        .pos-input { width: 100%; padding: 12px 16px; border: 1px solid #cbd5e1; border-radius: 12px; font-size: 14px; outline: none; transition: all 0.2s; background: #f8fafc; font-weight: 500; color: #0f172a; box-sizing: border-box; }
        .pos-input:focus { border-color: #0ea5e9; background: white; box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1); }
        .ticket-btn { padding: 1.5rem; border-radius: 20px; border: 2px solid transparent; background: white; cursor: pointer; transition: all 0.2s; text-align: left; display: flex; flex-direction: column; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .ticket-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
      `}</style>

      <div className="animate-fade" style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
        
        {/* KIRI: Etalase Pilihan Tiket */}
        <div style={{ flex: '1 1 60%', minWidth: '320px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🏷️ Pilih Jenis Tiket
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {ticketTypes.map((t) => {
              const isActive = ticketType === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => { setTicketType(t.key); setForm({ qty: 1, nama: "", noHp: "+62" }); setErrors({}); }}
                  className="ticket-btn"
                  style={{ 
                    borderColor: isActive ? t.color : 'transparent', 
                    background: isActive ? `${t.color}08` : 'white', // 08 is hex for 5% opacity
                    boxShadow: isActive ? `0 10px 25px -5px ${t.color}30` : ''
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem', background: isActive ? 'white' : '#f1f5f9', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', transition: 'all 0.2s' }}>
                    {t.emoji}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#0f172a' }}>{t.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem', marginBottom: '1rem', minHeight: '40px' }}>{t.desc}</div>
                  <div style={{ marginTop: 'auto', fontWeight: 800, color: t.color, fontSize: '1.1rem' }}>
                    {formatRp(t.price)} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>/org</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* KANAN: Panel Order & Checkout (Sticky) */}
        <div style={{ flex: '1 1 35%', minWidth: '320px', background: 'white', borderRadius: '24px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', border: '1px solid #f1f5f9', position: 'sticky', top: '100px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px dashed #e2e8f0' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Detail Pesanan</h3>
            <span style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
              {ticketTypes.find(t => t.key === ticketType)?.title}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Input Nama */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                Nama Pengunjung <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input value={form.nama} onChange={(e) => { setForm((f) => ({ ...f, nama: e.target.value })); if (errors.nama) setErrors((p) => ({ ...p, nama: "" })); }} placeholder="Ketik nama lengkap..." className="pos-input" style={{ borderColor: errors.nama ? '#ef4444' : '' }} />
              {errors.nama && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.4rem', margin: '4px 0 0 0' }}>{errors.nama}</p>}
            </div>

            {/* Input WhatsApp */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                Nomor WhatsApp <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input value={form.noHp} onChange={handleNoHpChange} placeholder="+62812..." className="pos-input" style={{ borderColor: errors.noHp ? '#ef4444' : '' }} />
              {errors.noHp && <p style={{ fontSize: '0.8rem', color: '#ef4444', marginTop: '0.4rem', margin: '4px 0 0 0' }}>{errors.noHp}</p>}
            </div>

            {/* Stepper Jumlah Orang (Khusus Rombongan) */}
            {ticketType === "rombongan" && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>
                  Jumlah Rombongan
                </label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
                  <button onClick={() => handleQtyChange(-1)} style={{ padding: '12px 20px', background: 'transparent', border: 'none', fontSize: '1.25rem', fontWeight: 600, color: '#0ea5e9', cursor: 'pointer' }}>−</button>
                  <input type="number" min={1} value={form.qty} onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))} style={{ flex: 1, textAlign: 'center', border: 'none', background: 'transparent', outline: 'none', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }} />
                  <button onClick={() => handleQtyChange(1)} style={{ padding: '12px 20px', background: 'transparent', border: 'none', fontSize: '1.25rem', fontWeight: 600, color: '#0ea5e9', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            )}
          </div>

          {/* Tagihan Summary */}
          <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '1.25rem', marginTop: '1.5rem', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
              <span>Subtotal ({ticketType === "rombongan" ? qty : 1}x)</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatRp(subtotal)}</span>
            </div>
            
            {ticketType === "rombongan" && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: berlakuDiskon ? '#10b981' : '#f59e0b', marginBottom: '0.5rem', fontWeight: 600 }}>
                <span>Diskon ({berlakuDiskon ? harga.diskonRombongan + '%' : 'Belum capai min.'})</span>
                <span>{berlakuDiskon ? `-${formatRp(discAmt)}` : 'Rp 0'}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px dashed #cbd5e1' }}>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>TOTAL</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0ea5e9', letterSpacing: '-0.5px' }}>
                {formatRp(grandTotal)}
              </span>
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handleBayar} disabled={loading}
            style={{ width: '100%', padding: '1.15rem', marginTop: '1.5rem', background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 10px 15px -3px rgba(14, 165, 233, 0.3)', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            onMouseOver={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseOut={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {loading ? <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> : "💳"} 
            {loading ? "Memproses..." : "Bayar Sekarang"}
          </button>

        </div>
      </div>

      <Struk struk={struk} onClose={() => setStruk(null)} onNew={() => { setStruk(null); setTicketType("satuan"); }} />
    </>
  );
}

export default function KasirPage() {
  return (
    <AuthProvider>
      <AppLayout title="Sistem Kasir (POS)" requireRole="kasir">
        <KasirContent />
      </AppLayout>
    </AuthProvider>
  );
}
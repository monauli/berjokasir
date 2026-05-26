"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import AppLayout from "@/components/AppLayout";
import { AuthProvider } from "@/components/AuthContext";
import LocationMark from "@/components/LocationMark";

function formatRp(n) { return "Rp " + Math.round(n || 0).toLocaleString("id-ID"); }
function todayStr() { return new Date().toISOString().slice(0, 10); }

const BADGE = {
  satuan: { bg: "#e0f2fe", color: "#0284c7", label: "Satuan" },
  rombongan: { bg: "#fef3c7", color: "#d97706", label: "Rombongan" },
  mancanegara: { bg: "#ede9fe", color: "#4f46e5", label: "Mancanegara" },
};

const LOKASI_CARD = {
  jumog: {
    label: "Air Terjun Jumog",
    color: "#0284c7",
    soft: "#e0f2fe",
    border: "#bae6fd",
  },
  madirda: {
    label: "Telaga Madirda",
    color: "#1d4ed8",
    soft: "#eaf1ff",
    border: "#bfdbfe",
  },
};

const PERIODE = [
  { key: "hari", label: "Hari Ini" },
  { key: "minggu", label: "Minggu Ini" },
  { key: "bulan", label: "Bulan Ini" },
  { key: "tahun", label: "Tahun Ini" },
  { key: "kustom", label: "Kustom Tanggal" },
];

function LaporanContent() {
  const { apiFetch } = useAuth();
  const [periode, setPeriode] = useState("hari");
  const [dari, setDari] = useState(todayStr());
  const [sampai, setSampai] = useState(todayStr());
  const [jenis, setJenis] = useState("semua");
  const [lokasiFilter, setLokasiFilter] = useState("semua");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  async function fetchReport() {
    setLoading(true);
    const params = new URLSearchParams({ periode, jenis, lokasi: lokasiFilter });
    if (periode === "kustom") { params.set("dari", dari); params.set("sampai", sampai); }
    try {
      const res = await apiFetch(`/api/reports?${params}`);
      if (!res || !res.ok) { setLoading(false); return; }
      const d = await res.json();
      if (d) setData(d);
    } catch (e) { console.error("Gagal fetch laporan:", e); }
    setLoading(false);
  }

  useEffect(() => { fetchReport(); }, [periode]); // Auto fetch saat tab periode berubah

  const sum = data?.summary;
  const tikets = data?.tikets || [];
  
  // Hitung total nominal untuk Progress Bar visualisasi
  const totalNominalJenis = sum && sum.byJenis ? Object.values(sum.byJenis).reduce((a, b) => a + b, 0) : 0;
  const lokasiSummary = sum?.byLokasi || {};

  return (
    <div className="animate-fade">
      {/* 1. Header & Filter Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        
        {/* Toggle Periode (Modern Pills) */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", background: 'white', padding: '8px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', width: 'fit-content' }}>
          {PERIODE.map((p) => (
            <button
              key={p.key} onClick={() => setPeriode(p.key)}
              style={{
                padding: "8px 20px", borderRadius: "12px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", transition: "all 0.2s", border: 'none',
                background: periode === p.key ? "#0f172a" : "transparent",
                color: periode === p.key ? "white" : "#64748b",
              }}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div style={{ background: "white", borderRadius: '16px', padding: "1.25rem 1.5rem", boxShadow: 'var(--shadow-md)', display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          {periode === "kustom" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label style={sty.lbl}>Dari</label>
                <input type="date" value={dari} onChange={(e) => setDari(e.target.value)} style={sty.inp} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label style={sty.lbl}>Sampai</label>
                <input type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} style={sty.inp} />
              </div>
            </>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={sty.lbl}>Jenis Tiket</label>
            <select value={jenis} onChange={(e) => setJenis(e.target.value)} style={sty.inp}>
              <option value="semua">Semua Tiket</option>
              <option value="satuan">Satuan</option>
              <option value="rombongan">Rombongan</option>
              <option value="mancanegara">Mancanegara</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <label style={sty.lbl}>Lokasi</label>
            <select value={lokasiFilter} onChange={(e) => setLokasiFilter(e.target.value)} style={sty.inp}>
              <option value="semua">Semua Lokasi</option>
              <option value="jumog">🌊 Air Terjun Jumog</option>
              <option value="madirda">🏞️ Telaga Madirda</option>
            </select>
          </div>
          <button onClick={fetchReport} style={sty.btnFilter}>
            Terapkan Filter
          </button>
          {sum && (
            <div style={{ marginLeft: 'auto', fontSize: 13, color: "#64748b", fontWeight: 500, background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px' }}>
              Berdasarkan data: {sum.dari} - {sum.sampai}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#0ea5e9", fontWeight: 600, fontSize: 18 }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>⏳</div>
          Menganalisis Data...
        </div>
      ) : (
        <>
          {/* 2. Top Metric Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: '1.25rem', marginBottom: '1.5rem' }}>
            {[
              { label: "Total Transaksi", val: sum?.totalTx || 0, icon: "🧾", color: "#3b82f6", bg: "#eff6ff" },
              { label: "Total Pengunjung", val: sum?.totalPengunjung || 0, icon: "👥", color: "#10b981", bg: "#ecfdf5" },
              { label: "Pendapatan Bersih", val: formatRp(sum?.totalPemasukan || 0), icon: "💰", color: "#0ea5e9", bg: "#e0f2fe" },
              { label: "Rata-rata/Transaksi", val: formatRp(sum?.rataPerTx || 0), icon: "📈", color: "#8b5cf6", bg: "#f5f3ff" },
            ].map((s, i) => (
              <div key={i} style={{ background: "white", borderRadius: '20px', padding: "1.5rem", boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '14px', background: s.bg, fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: typeof s.val === "string" ? 22 : 28, fontWeight: 800, color: "#0f172a", letterSpacing: '-0.5px' }}>
                    {s.val}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: '1rem', marginBottom: '1.5rem' }}>
            {Object.entries(LOKASI_CARD).map(([key, meta]) => {
              const item = lokasiSummary[key] || { total: 0, tx: 0, pengunjung: 0 };
              const selected = lokasiFilter === key;
              return (
                <div
                  key={key}
                  style={{
                    background: "white",
                    borderRadius: 10,
                    border: `1px solid ${selected ? meta.color : meta.border}`,
                    boxShadow: selected ? "0 14px 34px rgba(16, 24, 40, 0.10)" : "var(--shadow-sm)",
                    padding: "1.1rem",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "absolute", inset: "0 auto 0 0", width: 5, background: meta.color }} />
                  <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", marginBottom: "1rem" }}>
                    <LocationMark type={key} size={42} />
                    <div>
                      <div style={{ color: "#0f172a", fontWeight: 800, fontSize: "0.98rem" }}>{meta.label}</div>
                      <div style={{ color: meta.color, fontWeight: 800, fontSize: "0.76rem", marginTop: 2 }}>{selected ? "Filter aktif" : "Ringkasan lokasi"}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr 0.8fr", gap: "0.75rem", alignItems: "end" }}>
                    <div>
                      <div style={{ color: "#64748b", fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase" }}>Pendapatan</div>
                      <div style={{ color: meta.color, fontWeight: 900, fontSize: "1.35rem", marginTop: 4 }}>{formatRp(item.total)}</div>
                    </div>
                    <div>
                      <div style={{ color: "#64748b", fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase" }}>Transaksi</div>
                      <div style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.1rem", marginTop: 4 }}>{item.tx}</div>
                    </div>
                    <div>
                      <div style={{ color: "#64748b", fontSize: "0.74rem", fontWeight: 700, textTransform: "uppercase" }}>Orang</div>
                      <div style={{ color: "#0f172a", fontWeight: 800, fontSize: "1.1rem", marginTop: 4 }}>{item.pengunjung}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 3. Visualisasi Analisis Breakdown */}
          {sum && Object.keys(sum.byJenis || {}).length > 0 && (
            <div style={{ background: "white", borderRadius: '20px', padding: "1.75rem", boxShadow: 'var(--shadow-md)', marginBottom: '2rem', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: '1.5rem' }}>
                Komposisi Pendapatan per Jenis Tiket
              </div>
              
              {/* Progress Bar Visualization */}
              <div style={{ display: 'flex', width: '100%', height: '12px', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.5rem', background: '#f1f5f9' }}>
                {Object.entries(sum.byJenis).map(([k, v]) => {
                   const percentage = totalNominalJenis > 0 ? (v / totalNominalJenis) * 100 : 0;
                   return <div key={k} style={{ width: `${percentage}%`, background: BADGE[k].color }} title={`${BADGE[k].label}: ${percentage.toFixed(1)}%`} />
                })}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                {Object.entries(sum.byJenis).map(([k, v]) => {
                  const b = BADGE[k];
                  const pct = totalNominalJenis > 0 ? ((v / totalNominalJenis) * 100).toFixed(1) : 0;
                  return (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: "1rem", background: "#f8fafc", borderRadius: '14px', border: `1px solid ${b.color}30` }}>
                      <div style={{ width: 12, height: 40, borderRadius: 6, background: b.color }} />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#475569", textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          {b.label} <span style={{ color: b.color, marginLeft: 4 }}>({pct}%)</span>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 4 }}>
                          {formatRp(v)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. Tabel Riwayat */}
          <div style={{ background: "white", borderRadius: '20px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)', overflow: 'hidden', padding: '1rem' }}>
             <h3 style={{ margin: '0.5rem 1rem 1.5rem', fontSize: '1.1rem', color: '#0f172a', fontWeight: 800 }}>Rincian Transaksi</h3>
            {tikets.length === 0 ? (
              <div style={{ textAlign: "center", padding: '40px 0', color: "#94a3b8" }}>
                <div style={{ fontSize: 48, opacity: 0.5 }}>📭</div>
                <p style={{ marginTop: 12, fontWeight: 500 }}>Belum ada data transaksi yang sesuai filter.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table className="modern-table" style={{ width: "100%", minWidth: "900px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                      {["Kode Tiket", "Tgl & Waktu", "Nama Pembeli", "No. HP", "Jenis", "Qty", "Total", "Kasir"].map((h) => (
                        <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tikets.map((t, i) => {
                      const b = BADGE[t.jenis] || BADGE.satuan;
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0f172a" }}>#{t.id.slice(-6)}</td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: '#475569' }}>
                            <div style={{ fontWeight: 600 }}>{t.tanggal}</div>
                            <div style={{ color: '#94a3b8' }}>{t.waktu}</div>
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: 500, color: '#1e293b' }}>{t.nama || "-"}</td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: '#64748b' }}>{t.noHp || "-"}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <span style={{ display: "inline-flex", alignItems: 'center', padding: "4px 12px", borderRadius: 20, background: b.bg, color: b.color, fontSize: 12, fontWeight: 700 }}>
                              {b.label}
                            </span>
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: 600, color: '#475569' }}>{t.qty || 1} pax</td>
                          <td style={{ padding: "14px 16px", fontWeight: 800, color: "#0284c7" }}>{formatRp(t.total)}</td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: "#64748b", fontWeight: 500 }}>👤 {t.kasirNama}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function LaporanPage() {
  return (
    <AuthProvider>
      <AppLayout title="Dashboard Analisis" requireRole="supervisor">
        <LaporanContent />
      </AppLayout>
    </AuthProvider>
  );
}

const sty = {
  lbl: { fontSize: 13, fontWeight: 600, color: "#64748b" },
  inp: {
    padding: "10px 14px", border: "1px solid #cbd5e1", borderRadius: 10, fontSize: 14, outline: "none", color: '#0f172a', fontWeight: 500, background: '#f8fafc', transition: 'border 0.2s'
  },
  btnFilter: {
    padding: "10px 24px", background: "#0ea5e9", color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: '0 4px 6px rgba(14,165,233,0.2)', transition: 'background 0.2s'
  },
};

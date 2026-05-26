import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getUserFromToken } from '@/lib/auth'
import { jakartaPeriodRange } from '@/lib/datetime'

export async function GET(req) {
  try {
    const user = await getUserFromToken(req)
    if (!user || user.role !== 'supervisor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const dari = searchParams.get('dari')
    const sampai = searchParams.get('sampai')
    const jenis = searchParams.get('jenis') || 'semua'
    const periode = searchParams.get('periode') || 'custom'
    const lokasiFilter = searchParams.get('lokasi') || 'semua'  // 'semua', 'jumog', 'madirda'

    const db = await getDb()
    const { startDate, endDate } = jakartaPeriodRange(periode, dari, sampai)

    const query = {}
    if (startDate) query.tanggal = { $gte: startDate }
    if (endDate) query.tanggal = { ...query.tanggal, $lte: endDate }
    if (jenis !== 'semua') query.jenis = jenis
    if (lokasiFilter !== 'semua') query.lokasi = lokasiFilter  // filter lokasi

    const tikets = await db.collection('tickets').find(query).sort({ _id: -1 }).toArray()
    const mapped = tikets.map(t => ({ ...t, _id: t._id.toString() }))

    const totalTx = mapped.length
    const totalPemasukan = mapped.reduce((s, t) => s + t.total, 0)
    const totalPengunjung = mapped.reduce((s, t) => s + (t.qty || 1), 0)
    const rataPerTx = totalTx ? totalPemasukan / totalTx : 0
    const byJenis = {}
    for (const t of mapped) byJenis[t.jenis] = (byJenis[t.jenis] || 0) + t.total

    // Per lokasi breakdown
    const byLokasi = {}
    for (const t of mapped) {
      const lok = t.lokasi || 'tidak diketahui'
      if (!byLokasi[lok]) byLokasi[lok] = { total: 0, tx: 0, pengunjung: 0 }
      byLokasi[lok].total += t.total
      byLokasi[lok].tx += 1
      byLokasi[lok].pengunjung += (t.qty || 1)
    }

    return NextResponse.json({
      summary: { totalTx, totalPemasukan, totalPengunjung, rataPerTx, byJenis, byLokasi, dari: startDate, sampai: endDate },
      tikets: mapped,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Server error: ' + e.message }, { status: 500 })
  }
}

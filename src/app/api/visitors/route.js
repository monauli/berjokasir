import { NextResponse } from 'next/server'
import { getDb, getUserFromToken, getTokenFromRequest } from '@/lib/mongodb'

export async function GET(req) {
  try {
    const token = getTokenFromRequest(req)
    const user = getUserFromToken(token)
    if (!user || user.role !== 'supervisor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // 1. Pagination Parameters
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    const db = await getDb()
    const tickets = await db.collection('tickets').find({ nama: { $ne: null } }).toArray()

    // 2. Grouping Logic
    const map = {}
    for (const t of tickets) {
      if (!t.nama) continue
      const key = t.nama.toLowerCase().trim()
      if (!map[key]) map[key] = { nama: t.nama, noHp: t.noHp || '-', kunjungan: 0, totalOrang: 0, totalBayar: 0, terakhir: '' }
      map[key].kunjungan++
      map[key].totalOrang += t.qty || 1
      map[key].totalBayar += t.total
      if (!map[key].terakhir || t.tanggal > map[key].terakhir) map[key].terakhir = t.tanggal
      if (t.noHp) map[key].noHp = t.noHp
    }

    // 3. Sorting & Pagination Slice
    const allVisitors = Object.values(map).sort((a, b) => b.kunjungan - a.kunjungan)
    const totalItems = allVisitors.length
    const totalPages = Math.ceil(totalItems / limit)
    const paginatedVisitors = allVisitors.slice(skip, skip + limit)

    return NextResponse.json({
      visitors: paginatedVisitors,
      pagination: { page, limit, totalItems, totalPages }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Server error: ' + e.message }, { status: 500 })
  }
}
import { NextResponse } from 'next/server'
import { getDb, getUserFromToken, getTokenFromRequest } from '@/lib/mongodb'

export async function GET(req) {
  try {
    const token = getTokenFromRequest(req)
    const user = getUserFromToken(token)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const db = await getDb()
    const config = await db.collection('config').findOne({ key: 'harga' })
    const harga = config?.value || { satuan: 25000, mancanegara: 75000, diskonRombongan: 10, minRombongan: 5 }
    return NextResponse.json({ harga })
  } catch (e) {
    return NextResponse.json({ error: 'Server error: ' + e.message }, { status: 500 })
  }
}

export async function PUT(req) {
  try {
    const token = getTokenFromRequest(req)
    const user = getUserFromToken(token)
    if (!user || user.role !== 'supervisor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json()
    const db = await getDb()
    await db.collection('config').updateOne(
      { key: 'harga' },
      { $set: { value: body } },
      { upsert: true }
    )
    return NextResponse.json({ success: true, harga: body })
  } catch (e) {
    return NextResponse.json({ error: 'Server error: ' + e.message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import { getUserFromToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'

export async function GET(req) {
  try {
    const user = await getUserFromToken(req)
    if (!user || user.role !== 'supervisor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    const db = await getDb()
    const totalItems = await db.collection('users').countDocuments({ role: 'kasir' })
    const totalPages = Math.ceil(totalItems / limit)
    const users = await db.collection('users').find({ role: 'kasir' }).skip(skip).limit(limit).toArray()

    return NextResponse.json({
      users: users.map(u => ({ ...u, _id: u._id.toString(), password: undefined })),
      pagination: { page, limit, totalItems, totalPages }
    })
  } catch (e) {
    return NextResponse.json({ error: 'Server error: ' + e.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const user = await getUserFromToken(req)
    if (!user || user.role !== 'supervisor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { name, username, password, lokasi } = await req.json()
    if (!name || !username || !password) return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    if (!lokasi) return NextResponse.json({ error: 'Lokasi wajib dipilih' }, { status: 400 })

    const db = await getDb()
    const exists = await db.collection('users').findOne({ username })
    if (exists) return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })

    const hashed = await bcrypt.hash(password, 10)
    await db.collection('users').insertOne({
      name, username, password: hashed, role: 'kasir', lokasi, createdAt: new Date()
    })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error: ' + e.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const user = await getUserFromToken(req)
    if (!user || user.role !== 'supervisor') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { id } = await req.json()
    const db = await getDb()
    await db.collection('users').deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error: ' + e.message }, { status: 500 })
  }
}

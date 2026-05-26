import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(req) {
  try {
    const { username, password, lokasi } = await req.json()
    const db = await getDb()
    const user = await db.collection('users').findOne({ username })
    if (!user) return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return NextResponse.json({ error: 'Username atau password salah' }, { status: 401 })

    // Kasir hanya bisa login di lokasi yang sesuai
    if (user.role === 'kasir' && lokasi && user.lokasi && user.lokasi !== lokasi) {
      return NextResponse.json({ error: `Kasir ini terdaftar di ${user.lokasi === 'jumog' ? 'Air Terjun Jumog' : 'Telaga Madirda'}` }, { status: 403 })
    }

    const { password: _, ...userData } = user
    userData._id = userData._id.toString()

    const token = Buffer.from(JSON.stringify({
      id: userData._id,
      username: userData.username,
      name: userData.name,
      role: userData.role,
      lokasi: userData.lokasi || lokasi || null,
      exp: Date.now() + 86400000
    })).toString('base64')

    return NextResponse.json({ user: userData, token })
  } catch (e) {
    return NextResponse.json({ error: 'Server error: ' + e.message }, { status: 500 })
  }
}

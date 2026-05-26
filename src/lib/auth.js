import { getDb } from './mongodb'

export async function getUserFromToken(req) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return null
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    if (payload.exp < Date.now()) return null
    const db = await getDb()
    const user = await db.collection('users').findOne({ username: payload.username })
    if (!user) return null
    return { 
      id: user._id.toString(), 
      name: user.name, 
      username: user.username, 
      role: user.role,
      lokasi: user.lokasi || payload.lokasi || null,
    }
  } catch { return null }
}

export function makeToken(user) {
  return Buffer.from(JSON.stringify({
    username: user.username,
    exp: Date.now() + 86400000
  })).toString('base64')
}

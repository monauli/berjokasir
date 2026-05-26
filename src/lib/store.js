// Simple in-memory store (resets on server restart)
// Replace with a real database (SQLite, PostgreSQL, etc.) for production

export const store = {
  tickets: [],
  config: {
    harga: {
      satuan: 25000,
      mancanegara: 75000,
      diskonRombongan: 10,
      minRombongan: 5,
    }
  },
  nextId: 1,
}

export const USERS = [
  { id: 1, username: 'kasir1', name: 'Budi Santoso', role: 'kasir' },
  { id: 2, username: 'kasir2', name: 'Siti Rahayu', role: 'kasir' },
  { id: 3, username: 'supervisor', name: 'Ahmad Supervisor', role: 'supervisor' },
]

export function getUserFromToken(req) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace('Bearer ', '')
  if (!token) return null
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    if (payload.exp < Date.now()) return null
    return USERS.find(u => u.id === payload.id) || null
  } catch { return null }
}

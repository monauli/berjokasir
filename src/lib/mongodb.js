import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

const options = {
  ...(uri?.startsWith('mongodb+srv://') ? { tls: true } : {}),
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
}

let client
let clientPromise

function getClientPromise() {
  if (!uri) throw new Error('MONGODB_URI belum diset di .env.local')

  if (clientPromise) return clientPromise

  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options)
      global._mongoClientPromise = client.connect()
    }
    clientPromise = global._mongoClientPromise
  } else {
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }

  return clientPromise
}

export default getClientPromise

export async function getDb() {
  const client = await getClientPromise()
  return client.db('berjo_kasir')
}

// Decode token langsung (tidak query DB) — role sudah ada di payload
export function getUserFromToken(token) {
  if (!token) return null
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    if (payload.exp < Date.now()) return null
    return payload
  } catch { return null }
}

export function getTokenFromRequest(req) {
  const auth = req.headers.get('authorization') || ''
  return auth.replace('Bearer ', '') || null
}

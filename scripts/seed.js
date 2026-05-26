const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, '')
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

async function seed() {
  loadEnvLocal()

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI belum diset di .env.local')
  }

  const options = process.env.MONGODB_URI.startsWith('mongodb+srv://') ? { tls: true } : {}
  const client = new MongoClient(process.env.MONGODB_URI, options)
  await client.connect()
  const db = client.db('berjo_kasir')

  const defaultUsers = [
    { name: 'Ahmad Supervisor', username: 'supervisor', password: 'super123', role: 'supervisor', lokasi: null },
    { name: 'Budi Santoso', username: 'kasir_jumog1', password: 'kasir123', role: 'kasir', lokasi: 'jumog' },
    { name: 'Dewi Rahayu', username: 'kasir_jumog2', password: 'kasir123', role: 'kasir', lokasi: 'jumog' },
    { name: 'Eko Prasetyo', username: 'kasir_madirda1', password: 'kasir123', role: 'kasir', lokasi: 'madirda' },
    { name: 'Fitri Wulandari', username: 'kasir_madirda2', password: 'kasir123', role: 'kasir', lokasi: 'madirda' },
  ]

  let createdUsers = 0
  for (const user of defaultUsers) {
    const result = await db.collection('users').updateOne(
      { username: user.username },
      {
        $setOnInsert: {
          name: user.name,
          username: user.username,
          password: await bcrypt.hash(user.password, 10),
          role: user.role,
          lokasi: user.lokasi,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )
    if (result.upsertedCount) createdUsers++
  }

  console.log(createdUsers ? `${createdUsers} user default dibuat` : 'Semua user default sudah ada')
  console.log('')
  console.log('Akun default yang tersedia:')
  console.log('   Supervisor   : supervisor / super123')
  console.log('   Kasir Jumog  : kasir_jumog1 / kasir123')
  console.log('   Kasir Jumog  : kasir_jumog2 / kasir123')
  console.log('   Kasir Madirda: kasir_madirda1 / kasir123')
  console.log('   Kasir Madirda: kasir_madirda2 / kasir123')

  await db.collection('config').updateOne(
    { key: 'harga' },
    { $setOnInsert: { key: 'harga', value: { satuan: 25000, mancanegara: 75000, diskonRombongan: 10, minRombongan: 5 } } },
    { upsert: true }
  )
  console.log('Config seeded')
  await client.close()
  console.log('Selesai. Silakan jalankan: npm run dev')
}

seed().catch((error) => {
  console.error(error)
  process.exit(1)
})

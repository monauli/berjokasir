# Berjo Kasir — Sistem Tiket Wisata Berjo

Sistem kasir multi-lokasi untuk **Air Terjun Jumog** dan **Telaga Madirda**.

## Fitur
- Halaman awal pemilihan destinasi wisata
- Login kasir per lokasi (kasir Jumog hanya bisa login di halaman Jumog)
- Supervisor tunggal bisa akses semua lokasi
- Laporan terpisah per lokasi (filter di halaman laporan)
- Struk tiket mencantumkan nama lokasi

## Alur Login
1. Buka aplikasi → pilih **Air Terjun Jumog** atau **Telaga Madirda**
2. Login dengan akun kasir yang sesuai lokasi, atau akun supervisor

## Akun Default (setelah seed)
| Role | Username | Password | Lokasi |
|------|----------|----------|--------|
| Supervisor | `supervisor` | `super123` | Semua |
| Kasir | `kasir_jumog1` | `kasir123` | Air Terjun Jumog |
| Kasir | `kasir_jumog2` | `kasir123` | Air Terjun Jumog |
| Kasir | `kasir_madirda1` | `kasir123` | Telaga Madirda |
| Kasir | `kasir_madirda2` | `kasir123` | Telaga Madirda |

## Setup
```bash
npm install
# Buat file .env.local dengan MONGODB_URI
node scripts/seed.js
npm run dev
```

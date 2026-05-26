import './globals.css'

export const metadata = {
  title: 'Kasir Wisata Berjo',
  description: 'Sistem Penjualan Tiket Wisata Berjo — Gawe Tresno',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}

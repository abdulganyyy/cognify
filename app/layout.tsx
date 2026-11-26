import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'Cognify — Belajar Lebih Cerdas dari Setiap PDF',
  description: 'Platform belajar berbasis AI untuk mengubah dokumen PDF menjadi ringkasan, topik utama, flashcard, dan tutor interaktif.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
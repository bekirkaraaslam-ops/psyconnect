import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Seansify – Klinik Yönetim',
  description: 'Psikologlar için akıllı klinik yönetim sistemi',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`${inter.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t===null&&p)){document.documentElement.classList.add('dark')}}catch(e){}` }} />
      </head>
      <body className="min-h-full">{children}</body>
    </html>
  )
}

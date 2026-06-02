import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'

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
    <html lang="tr" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('theme'),p=window.matchMedia('(prefers-color-scheme: dark)').matches,path=window.location.pathname,isDash=/^\/(dashboard|appointments|patients|calendar|settings|whatsapp|yorumlar|bloglar|raporlar|upgrade|waiting-list|profil|login|register)(\/|$)/.test(path);if(isDash&&(t==='dark'||(t===null&&p))){document.documentElement.classList.add('dark')}}catch(e){}` }} />
      </head>
      <body className="min-h-full">
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}

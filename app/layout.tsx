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
  openGraph: {
    title: 'Seansify – Psikologlar için Klinik Yönetim',
    description: 'Randevu yönetimi, WhatsApp otomasyonu, SOAP seans notu ve ödeme takibi tek platformda.',
    url: 'https://seansify.com',
    siteName: 'Seansify',
    type: 'website',
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seansify – Psikologlar için Klinik Yönetim',
    description: 'Randevu yönetimi, WhatsApp otomasyonu, SOAP seans notu ve ödeme takibi tek platformda.',
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
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18248822768" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','AW-18248822768');` }} />
      </head>
      <body className="min-h-full">
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}

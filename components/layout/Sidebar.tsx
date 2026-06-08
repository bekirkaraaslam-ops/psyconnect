'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { PlanType } from '@/types'

const navItems = [
  {
    href: '/dashboard',
    label: 'Genel Bakış',
    whatsappLocked: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/appointments',
    label: 'Randevular',
    whatsappLocked: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/raporlar',
    label: 'Raporlar',
    whatsappLocked: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: '/calendar',
    label: 'Takvim',
    whatsappLocked: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="14" x2="8" y2="14" /><line x1="12" y1="14" x2="12" y2="14" /><line x1="16" y1="14" x2="16" y2="14" />
        <line x1="8" y1="18" x2="8" y2="18" /><line x1="12" y1="18" x2="12" y2="18" />
      </svg>
    ),
  },
  {
    href: '/patients',
    label: 'Danışanlar',
    whatsappLocked: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/waiting-list',
    label: 'Bekleme Listesi',
    whatsappLocked: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    href: '/whatsapp',
    label: 'WhatsApp',
    whatsappLocked: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/bloglar',
    label: 'Bloglarım',
    whatsappLocked: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    href: '/yorumlar',
    label: 'Yorumlar',
    whatsappLocked: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="9" y2="10" /><line x1="12" y1="10" x2="12" y2="10" /><line x1="15" y1="10" x2="15" y2="10" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Ayarlar',
    whatsappLocked: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
]

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

const planLabels: Record<string, { label: string; color: string; bg: string }> = {
  free: { label: 'Ücretsiz', color: '#64748b', bg: '#f1f5f9' },
  baslangic: { label: 'Başlangıç', color: '#d97706', bg: '#fef3c7' },
  pro: { label: 'Pro', color: '#4a7c6f', bg: '#e8f5f1' },
}

interface SidebarProps {
  planType?: PlanType
  onAyarlarClick?: () => void
}

export default function Sidebar({ planType = 'free', onAyarlarClick }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isWhatsappUnlocked = planType === 'pro'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const planInfo = planLabels[planType] || planLabels.free

  return (
    <aside className="hidden md:flex flex-col w-16 lg:w-60 min-h-screen border-r py-6" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
      {/* Logo */}
      <div className="px-2 lg:px-6 mb-8 flex flex-col items-center lg:items-start">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Seansify" width={32} height={32} className="rounded-xl flex-shrink-0" />
          <span className="hidden lg:inline font-semibold text-base" style={{ color: 'var(--foreground)' }}>Seansify</span>
        </div>
        <div className="mt-2 hidden lg:block">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: planInfo.bg, color: planInfo.color }}
          >
            {planInfo.label}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-1.5 lg:px-3 space-y-0.5">
        {navItems.map(item => {
          const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
          const showLock = item.whatsappLocked && !isWhatsappUnlocked

          if (item.href === '/settings') {
            return (
              <button
                key={item.href}
                onClick={onAyarlarClick}
                title={item.label}
                className="relative flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-xl text-sm font-medium transition-colors w-full hover:bg-gray-100 dark:hover:bg-slate-700 text-[#64748b] dark:text-slate-300"
                style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              >
                {item.icon}
                <span className="hidden lg:inline flex-1">{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                'relative flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'text-[#2d5a51]'
                  : showLock
                    ? 'hover:bg-gray-100 dark:hover:bg-slate-700 text-[#94a3b8] dark:text-slate-500'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-700 text-[#64748b] dark:text-slate-300'
              )}
              style={isActive ? { background: 'rgba(74,124,111,0.12)', fontWeight: 600 } : {}}
            >
              {isActive && (
                <span style={{
                  position: 'absolute', left: 0, top: 5, bottom: 5,
                  width: 3, borderRadius: '0 3px 3px 0',
                  background: '#4a7c6f',
                  animation: 'indicatorSlideIn 0.2s cubic-bezier(0.34,1.56,0.64,1) forwards',
                }} />
              )}
              <span style={isActive ? { color: '#4a7c6f' } : {}}>{item.icon}</span>
              <span className="hidden lg:inline flex-1">{item.label}</span>
              {showLock && (
                <span style={{ color: '#94a3b8' }}>
                  <LockIcon />
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Upgrade butonu (free veya baslangic planında) */}
      {planType !== 'pro' && (
        <div className="px-1.5 lg:px-3 mb-3">
          <Link
            href="/upgrade"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ background: '#e8f5f1', color: '#4a7c6f' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 11 12 6 7 11" /><line x1="12" y1="18" x2="12" y2="6" />
            </svg>
            <span className="hidden lg:inline">{planType === 'free' ? 'Plan Satın Al' : "Pro'ya Geç"}</span>
          </Link>
        </div>
      )}

      {/* Logout */}
      <div className="px-1.5 lg:px-3 mt-2">
        <button
          onClick={handleLogout}
          title="Çıkış Yap"
          className="flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3 py-2.5 rounded-xl text-sm font-medium w-full transition-colors hover:bg-red-50"
          style={{ color: '#94a3b8' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="hidden lg:inline">Çıkış Yap</span>
        </button>
      </div>
    </aside>
  )
}

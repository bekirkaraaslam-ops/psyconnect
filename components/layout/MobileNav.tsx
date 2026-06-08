'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlanType } from '@/types'

const mainItems = [
  {
    href: '/dashboard',
    label: 'Genel',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/appointments',
    label: 'Randevular',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/calendar',
    label: 'Takvim',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/patients',
    label: 'Danışanlar',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    ),
  },
]

const sheetItems = [
  {
    href: '/raporlar',
    label: 'Raporlar',
    locked: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    href: '/waiting-list',
    label: 'Bekleme Listesi',
    locked: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    href: '/whatsapp',
    label: 'WhatsApp',
    locked: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/bloglar',
    label: 'Bloglarım',
    locked: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    href: '/yorumlar',
    label: 'Yorumlar',
    locked: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="9" y2="10" /><line x1="12" y1="10" x2="12" y2="10" /><line x1="15" y1="10" x2="15" y2="10" />
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

interface MobileNavProps {
  onAyarlarClick?: () => void
  planType?: PlanType
}

export default function MobileNav({ onAyarlarClick, planType = 'free' }: MobileNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sheetOpen, setSheetOpen] = useState(false)

  const isWhatsappUnlocked = planType === 'pro'
  const planInfo = planLabels[planType] || planLabels.free

  const isSheetActive = sheetItems.some(item =>
    pathname.startsWith(item.href)
  )

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setSheetOpen(false)
    router.push('/login')
    router.refresh()
  }

  function handleAyarlar() {
    setSheetOpen(false)
    onAyarlarClick?.()
  }

  function handleSheetLink() {
    setSheetOpen(false)
  }

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-end"
        style={{
          background: 'var(--card)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {mainItems.map(item => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-1 pt-2 pb-3 text-xs font-medium transition-colors"
              style={{ color: isActive ? '#4a7c6f' : '#94a3b8' }}
            >
              <span
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 40, height: 32, borderRadius: 10,
                  background: isActive ? 'rgba(74,124,111,0.12)' : 'transparent',
                  transition: 'background 0.2s',
                }}
              >
                {item.icon}
              </span>
              <span style={{ fontSize: 10, lineHeight: 1 }}>{item.label}</span>
            </Link>
          )
        })}

        {/* Daha Fazla butonu */}
        <button
          onClick={() => setSheetOpen(true)}
          className="flex-1 flex flex-col items-center gap-1 pt-2 pb-3 text-xs font-medium transition-colors"
          style={{
            color: isSheetActive || sheetOpen ? '#4a7c6f' : '#94a3b8',
            background: 'none', border: 'none', cursor: 'pointer',
          }}
        >
          <span
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 40, height: 32, borderRadius: 10,
              background: isSheetActive || sheetOpen ? 'rgba(74,124,111,0.12)' : 'transparent',
              transition: 'background 0.2s',
              position: 'relative',
            }}
          >
            {/* Nokta göstergesi — sheet'teki aktif sayfa için */}
            {isSheetActive && (
              <span style={{
                position: 'absolute', top: 4, right: 6,
                width: 6, height: 6, borderRadius: '50%',
                background: '#4a7c6f',
              }} />
            )}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
            </svg>
          </span>
          <span style={{ fontSize: 10, lineHeight: 1 }}>Daha Fazla</span>
        </button>
      </nav>

      {/* Backdrop */}
      {sheetOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60]"
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
          onClick={() => setSheetOpen(false)}
        />
      )}

      {/* Bottom Sheet */}
      <div
        className="md:hidden fixed left-0 right-0 z-[70] rounded-t-3xl"
        style={{
          bottom: 0,
          background: 'var(--card)',
          boxShadow: '0 -8px 40px rgba(0,0,0,0.15)',
          transform: sheetOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          paddingBottom: 'env(safe-area-inset-bottom, 16px)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--border)' }} />
        </div>

        {/* Plan badge */}
        <div style={{ padding: '8px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>Menü</span>
          <span
            style={{
              fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
              background: planInfo.bg, color: planInfo.color,
            }}
          >
            {planInfo.label}
          </span>
        </div>

        {/* Sheet nav items */}
        <div style={{ padding: '0 12px' }}>
          {sheetItems.map(item => {
            const isActive = pathname.startsWith(item.href)
            const showLock = item.locked && !isWhatsappUnlocked

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleSheetLink}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '13px 12px', borderRadius: 14,
                  background: isActive ? 'rgba(74,124,111,0.1)' : 'transparent',
                  textDecoration: 'none',
                  color: isActive ? '#4a7c6f' : showLock ? '#94a3b8' : 'var(--foreground)',
                  marginBottom: 2,
                }}
              >
                <span style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? 'rgba(74,124,111,0.15)' : 'var(--background)',
                  color: isActive ? '#4a7c6f' : showLock ? '#94a3b8' : '#64748b',
                }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1, fontSize: 15, fontWeight: isActive ? 700 : 500 }}>
                  {item.label}
                </span>
                {showLock && <LockIcon />}
                {isActive && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </Link>
            )
          })}
        </div>

        <div style={{ margin: '8px 12px 0', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
          {/* Ayarlar */}
          <button
            onClick={handleAyarlar}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 12px', borderRadius: 14,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--foreground)', width: '100%', textAlign: 'left',
              marginBottom: 2,
            }}
          >
            <span style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--background)', color: '#64748b',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span style={{ flex: 1, fontSize: 15, fontWeight: 500 }}>Ayarlar</span>
          </button>

          {/* Upgrade (free/baslangic) */}
          {planType !== 'pro' && (
            <Link
              href="/upgrade"
              onClick={handleSheetLink}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '13px 12px', borderRadius: 14,
                textDecoration: 'none', marginBottom: 2,
                background: 'rgba(74,124,111,0.08)',
              }}
            >
              <span style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(74,124,111,0.15)', color: '#4a7c6f',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="17 11 12 6 7 11" /><line x1="12" y1="18" x2="12" y2="6" />
                </svg>
              </span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#4a7c6f' }}>
                {planType === 'free' ? 'Plan Satın Al' : "Pro'ya Geç"}
              </span>
            </Link>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 12px', borderRadius: 14,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#ef4444', width: '100%', textAlign: 'left',
              marginBottom: 8,
            }}
          >
            <span style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(239,68,68,0.08)', color: '#ef4444',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            <span style={{ fontSize: 15, fontWeight: 500 }}>Çıkış Yap</span>
          </button>
        </div>
      </div>
    </>
  )
}

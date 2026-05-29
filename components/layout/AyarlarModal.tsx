'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import ProfilEditor from '@/app/(dashboard)/profil/ProfilEditor'
import SettingsForm from '@/components/settings/SettingsForm'
import PackagesPanel from '@/components/settings/PackagesPanel'
import ReferralPanel from '@/components/settings/ReferralPanel'

interface Props {
  open: boolean
  onClose: () => void
  defaultTab?: 'profil' | 'klinik'
}

export default function AyarlarModal({ open, onClose, defaultTab = 'profil' }: Props) {
  const [tab, setTab] = useState<'profil' | 'klinik'>(defaultTab)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<{
    psych: any
    paketler: any[]
    email: string
  } | null>(null)

  useEffect(() => {
    if (!open || data) return
    setLoading(true)
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const [{ data: psych }, { data: paketler }] = await Promise.all([
        supabase.from('psychologists').select(`
          id, full_name, booking_slug, unvan, sehir, bio_text,
          uzmanlik_alanlari, egitim, foto_url, klinik_adi, klinik_adres,
          klinik_tel, calisma_saatleri, profil_alinti, deneyim_yil, dil,
          work_start_hour, work_end_hour, work_days, session_duration_minutes,
          buffer_minutes, subscription_status, subscription_ends_at,
          profil_gorunum, ilk_seans_metni, tema, yaklasim, tpd_uye_no,
          phone_number, harita_linki, online_gorusme_linki, hosgeldiniz_mesaji,
          booking_slug, varsayilan_seans_ucreti, tatil_modu
        `).eq('auth_user_id', user.id).single(),
        supabase.from('paket_sablonlari')
          .select('id, name, session_count, price_tl, is_active')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
      ])
      setData({ psych, paketler: paketler ?? [], email: user.email ?? '' })
      setLoading(false)
    })
  }, [open])

  useEffect(() => { setTab(defaultTab) }, [defaultTab, open])

  if (!open) return null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.45)',
          backdropFilter: 'blur(2px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1001,
        width: 'min(860px, 95vw)',
        background: 'var(--background)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.25s cubic-bezier(0.34,1.1,0.64,1)',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px 0',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card)',
          position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {(['profil', 'klinik'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '10px 20px',
                  fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: 'pointer', background: 'none',
                  borderBottom: tab === t ? '2px solid #4a7c6f' : '2px solid transparent',
                  color: tab === t ? '#4a7c6f' : '#64748b',
                  marginBottom: -1,
                  transition: 'all 0.15s',
                }}
              >
                {t === 'profil' ? 'Profil Ayarları' : 'Klinik Ayarları'}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--border)', background: 'var(--card)',
              cursor: 'pointer', color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {loading || !data ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: '#94a3b8', fontSize: 14 }}>
              Yükleniyor...
            </div>
          ) : tab === 'profil' ? (
            <ProfilEditor
              psych={data.psych}
              paketler={data.paketler}
              subscriptionStatus={data.psych?.subscription_status ?? null}
            />
          ) : (
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <SettingsForm
                psychologist={data.psych}
                email={data.email}
                subscriptionStatus={data.psych?.subscription_status ?? null}
                subscriptionEndsAt={data.psych?.subscription_ends_at ?? null}
              />
              <PackagesPanel />
              <ReferralPanel />
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideInRight { from { transform: translateX(100%) } to { transform: translateX(0) } }
      `}</style>
    </>
  )
}

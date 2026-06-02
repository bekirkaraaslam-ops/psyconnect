'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Yorum {
  id: string
  yildiz: number
  yorum_metni: string | null
  reviewer_init: string | null
  onaylandi: boolean
  olusturuldu_at: string
  dolduruldu_at: string | null
}

interface Props {
  psychologistId: string
  yorumlar: Yorum[]
}

function StarRow({ n, size = 14 }: { n: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= n ? '#f59e0b' : '#e2e8f0', fontSize: size, lineHeight: 1 }}>★</span>
      ))}
    </span>
  )
}

function Avatar({ init }: { init: string | null }) {
  const label = init ?? '?'
  return (
    <div style={{
      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
      background: 'linear-gradient(135deg, #4a7c6f, #6ee7b7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{label}</span>
    </div>
  )
}

export default function YorumlarClient({ yorumlar: initial }: Props) {
  const supabase = createClient()
  const [yorumlar, setYorumlar] = useState<Yorum[]>(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [tab, setTab] = useState<'bekleyen' | 'onaylanan'>('bekleyen')

  const bekleyen = yorumlar.filter(y => !y.onaylandi && y.dolduruldu_at)
  const onaylanan = yorumlar.filter(y => y.onaylandi)

  const avgRating = onaylanan.length > 0
    ? (onaylanan.reduce((s, y) => s + y.yildiz, 0) / onaylanan.length).toFixed(1)
    : null

  async function onayla(id: string) {
    setLoading(id)
    const { data, error } = await supabase
      .from('psikolog_yorumlar')
      .update({ onaylandi: true })
      .eq('id', id)
      .select()
      .single()
    setLoading(null)
    if (!error && data) setYorumlar(prev => prev.map(y => y.id === id ? data : y))
  }

  async function reddet(id: string) {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return
    setLoading(id)
    const { error } = await supabase.from('psikolog_yorumlar').delete().eq('id', id)
    setLoading(null)
    if (!error) setYorumlar(prev => prev.filter(y => y.id !== id))
  }

  async function kaldir(id: string) {
    setLoading(id)
    const { data, error } = await supabase
      .from('psikolog_yorumlar')
      .update({ onaylandi: false })
      .eq('id', id)
      .select()
      .single()
    setLoading(null)
    if (!error && data) setYorumlar(prev => prev.map(y => y.id === id ? data : y))
  }

  const fmt = (s: string | null) => s
    ? new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  const list = tab === 'bekleyen' ? bekleyen : onaylanan

  return (
    <div style={{ padding: '28px 24px', maxWidth: 720, margin: '0 auto' }}>

      {/* Başlık */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--foreground)', margin: 0, marginBottom: 4 }}>Danışan Yorumları</h1>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Randevu sonrası gelen değerlendirmeler</p>
      </div>

      {/* İstatistik özeti */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard
          value={avgRating ?? '—'}
          label="Ortalama Puan"
          sub={avgRating ? <StarRow n={Math.round(Number(avgRating))} size={12} /> : undefined}
          accent="#f59e0b"
        />
        <StatCard
          value={String(onaylanan.length)}
          label="Yayındaki Yorum"
          accent="#4a7c6f"
        />
        <StatCard
          value={String(bekleyen.length)}
          label="Onay Bekliyor"
          accent={bekleyen.length > 0 ? '#f59e0b' : '#94a3b8'}
        />
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['bekleyen', 'onaylanan'] as const).map(t => {
          const count = t === 'bekleyen' ? bekleyen.length : onaylanan.length
          const active = tab === t
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: `1.5px solid ${active ? '#4a7c6f' : '#dde5e2'}`,
                background: active ? '#f0fdf4' : 'var(--card)',
                color: active ? '#15803d' : 'var(--muted-foreground)',
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'all 0.15s',
              }}
            >
              {t === 'bekleyen' ? 'Bekleyen' : 'Yayında'}
              <span style={{
                fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 9,
                background: active ? '#4a7c6f' : '#e2e8f0',
                color: active ? '#fff' : '#64748b',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px',
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Liste */}
      {list.length === 0 ? (
        <EmptyState tab={tab} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {list.map(y => (
            <div
              key={y.id}
              style={{
                background: 'var(--card)', borderRadius: 14,
                border: `1px solid ${tab === 'bekleyen' ? '#fde68a' : 'var(--border)'}`,
                borderLeft: `3px solid ${tab === 'bekleyen' ? '#f59e0b' : '#4a7c6f'}`,
                padding: 16,
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Avatar init={y.reviewer_init} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <StarRow n={y.yildiz} size={15} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--foreground)' }}>
                        {y.reviewer_init ?? 'Anonim'}
                      </span>
                      {tab === 'onaylanan' && (
                        <span style={{ fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '1px 7px', borderRadius: 8 }}>
                          Yayında
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                      {fmt(y.dolduruldu_at)}
                    </span>
                  </div>
                  {y.yorum_metni ? (
                    <p style={{ fontSize: 13, color: 'var(--foreground)', lineHeight: 1.65, margin: 0, marginBottom: 12, opacity: 0.85 }}>
                      "{y.yorum_metni}"
                    </p>
                  ) : (
                    <p style={{ fontSize: 12, color: '#cbd5e1', fontStyle: 'italic', margin: 0, marginBottom: 12 }}>
                      Sadece yıldız değerlendirmesi
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: 6 }}>
                    {tab === 'bekleyen' ? (
                      <>
                        <ActionButton
                          onClick={() => onayla(y.id)}
                          disabled={loading === y.id}
                          variant="primary"
                        >
                          {loading === y.id ? '…' : '✓ Onayla'}
                        </ActionButton>
                        <ActionButton
                          onClick={() => reddet(y.id)}
                          disabled={loading === y.id}
                          variant="danger"
                        >
                          Sil
                        </ActionButton>
                      </>
                    ) : (
                      <ActionButton
                        onClick={() => kaldir(y.id)}
                        disabled={loading === y.id}
                        variant="ghost"
                      >
                        Yayından Kaldır
                      </ActionButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ value, label, sub, accent }: {
  value: string; label: string; sub?: React.ReactNode; accent: string; bg?: string
}) {
  return (
    <div style={{ background: 'var(--card)', borderRadius: 14, border: `1px solid ${accent}44`, padding: '14px 16px' }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: accent, lineHeight: 1, marginBottom: 2 }}>{value}</div>
      {sub && <div style={{ marginBottom: 2 }}>{sub}</div>}
      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function ActionButton({ children, onClick, disabled, variant }: {
  children: React.ReactNode
  onClick: () => void
  disabled: boolean
  variant: 'primary' | 'danger' | 'ghost'
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: '#4a7c6f', color: '#fff', border: 'none' },
    danger:  { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
    ghost:   { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' },
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '5px 13px', borderRadius: 8, fontSize: 12, fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.5 : 1,
        ...styles[variant],
      }}
    >
      {children}
    </button>
  )
}

function EmptyState({ tab }: { tab: 'bekleyen' | 'onaylanan' }) {
  return (
    <div style={{
      background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)',
      padding: '48px 32px', textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%',
        background: tab === 'bekleyen' ? '#fffbeb' : '#f0fdf4',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px', fontSize: 24,
      }}>
        {tab === 'bekleyen' ? '⏳' : '⭐'}
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)', margin: 0, marginBottom: 8 }}>
        {tab === 'bekleyen' ? 'Onay bekleyen yorum yok' : 'Henüz yayınlanan yorum yok'}
      </p>
      <p style={{ fontSize: 12, color: '#94a3b8', margin: 0, lineHeight: 1.7, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
        {tab === 'bekleyen'
          ? 'Randevu tamamlandığında danışana otomatik değerlendirme linki gönderilir.'
          : 'Onayladığınız yorumlar profil sayfanızda görünür ve yeni danışanların güvenini artırır.'}
      </p>
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { formatDateTime, appointmentStatusColor, appointmentStatusLabel, appointmentStatusAccent, formatPhoneDisplay } from '@/lib/utils'

interface LastSoap {
  tarih: string
  s: string
  o: string
  a: string
  p: string
  genel: string
}

interface AptDetail {
  id: string
  appointment_date: string
  duration_minutes: number | null
  status: string
  reminder_sent: boolean | null
  reminder_sent_at: string | null
  appointment_type: string | null
  ucret: number | null
  odeme_durumu: string | null
  mevcut_seans_no: number | null
  toplam_paket_seansi: number | null
  patient: { id: string; name_surname: string; phone_number: string } | null
}

interface Props {
  appointmentId: string | null
  onClose: () => void
}

export default function AppointmentDrawer({ appointmentId, onClose }: Props) {
  const [data, setData] = useState<{ apt: AptDetail; lastSoap: LastSoap | null } | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchData = useCallback(async (id: string) => {
    setLoading(true)
    setData(null)
    try {
      const res = await fetch(`/api/appointments/${id}/detail`)
      if (res.ok) setData(await res.json())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (appointmentId) fetchData(appointmentId)
  }, [appointmentId, fetchData])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (appointmentId) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [appointmentId, onClose])

  const isOpen = !!appointmentId

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.35)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: 420,
          zIndex: 50,
          background: 'var(--card)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Başlık */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <p className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>Randevu Detayı</p>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* İçerik */}
        <div className="flex-1 p-5 space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: '#e2e8f0', borderTopColor: '#4a7c6f' }} />
            </div>
          )}

          {!loading && data && (() => {
            const { apt, lastSoap } = data
            const accent = appointmentStatusAccent(apt.status)
            const hasHap = lastSoap && (lastSoap.s || lastSoap.o || lastSoap.a || lastSoap.p || lastSoap.genel)

            return (
              <>
                {/* Hasta başlık */}
                <div className="flex items-center gap-3 p-4 rounded-2xl" style={{ background: 'var(--muted)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: accent.avatar, color: accent.avatarText }}>
                    {apt.patient?.name_surname?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) ?? '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>{apt.patient?.name_surname}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {formatPhoneDisplay(apt.patient?.phone_number ?? '')}
                    </p>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${appointmentStatusColor(apt.status)}`}>
                    {appointmentStatusLabel(apt.status)}
                  </span>
                </div>

                {/* Detay grid */}
                <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  <div style={{ borderLeft: `4px solid ${accent.bar}` }}>
                    {[
                      {
                        label: 'Tarih & Saat',
                        value: formatDateTime(apt.appointment_date),
                        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                      },
                      {
                        label: 'Süre',
                        value: apt.duration_minutes ? `${apt.duration_minutes} dakika` : '—',
                        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                      },
                      {
                        label: 'Tür',
                        value: apt.appointment_type === 'online' ? 'Online' : 'Yüz yüze',
                        icon: apt.appointment_type === 'online'
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>,
                      },
                      ...(apt.mevcut_seans_no && apt.toplam_paket_seansi ? [{
                        label: 'Seans',
                        value: `${apt.mevcut_seans_no}. seans / ${apt.toplam_paket_seansi} paket`,
                        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
                      }] : []),
                      {
                        label: 'Hatırlatıcı',
                        value: apt.reminder_sent
                          ? `Gönderildi${apt.reminder_sent_at ? ' · ' + formatDateTime(apt.reminder_sent_at) : ''}`
                          : 'Henüz gönderilmedi',
                        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.12 1.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.45-.45a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg>,
                      },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="flex items-start gap-3 px-4 py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                        <span className="mt-0.5 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }}>{icon}</span>
                        <div className="min-w-0">
                          <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
                          <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ücret */}
                <div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>SEANS ÜCRETİ</p>
                  {apt.ucret != null ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
                        ₺{apt.ucret.toLocaleString('tr-TR')}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        apt.odeme_durumu === 'odendi' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {apt.odeme_durumu === 'odendi' ? 'Ödendi' : 'Ödeme bekliyor'}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Ücret girilmemiş</p>
                  )}
                </div>

                {/* Son SOAP notu */}
                {hasHap && (
                  <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                    <div className="px-4 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Son Seans Özeti</span>
                      <span className="text-xs ml-auto" style={{ color: 'var(--muted-foreground)' }}>
                        {new Date(lastSoap.tarih).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                      </span>
                    </div>
                    <div className="p-4 space-y-3">
                      {lastSoap.s && (
                        <div className="flex gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded text-white text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: '#3b82f6', fontSize: 10 }}>S</span>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{lastSoap.s}</p>
                        </div>
                      )}
                      {lastSoap.o && (
                        <div className="flex gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded text-white text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: '#22c55e', fontSize: 10 }}>O</span>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{lastSoap.o}</p>
                        </div>
                      )}
                      {lastSoap.a && (
                        <div className="flex gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded text-white text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: '#f59e0b', fontSize: 10 }}>A</span>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{lastSoap.a}</p>
                        </div>
                      )}
                      {lastSoap.p && (
                        <div className="flex gap-2">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded text-white text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: '#a855f7', fontSize: 10 }}>P</span>
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{lastSoap.p}</p>
                        </div>
                      )}
                      {lastSoap.genel && !lastSoap.s && !lastSoap.o && !lastSoap.a && !lastSoap.p && (
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>{lastSoap.genel}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Alt butonlar */}
                <div className="flex gap-3 pt-1">
                  {apt.patient?.id && (
                    <Link
                      href={`/patients/${apt.patient.id}`}
                      onClick={onClose}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-xl font-medium border transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
                      style={{ color: '#4a7c6f', borderColor: '#dde5e2' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      Hasta Sayfası
                    </Link>
                  )}
                  <Link
                    href={`/appointments/${apt.id}/edit`}
                    onClick={onClose}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2.5 rounded-xl font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ background: '#4a7c6f' }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Düzenle
                  </Link>
                </div>
              </>
            )
          })()}
        </div>
      </div>
    </>
  )
}

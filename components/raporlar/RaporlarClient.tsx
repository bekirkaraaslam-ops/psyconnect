'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  useEffect(() => {
    setValue(0)
    if (target === 0) { setValue(0); return }
    const start = performance.now()
    function update(now: number) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(update)
    }
    rafRef.current = requestAnimationFrame(update)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])
  return value
}

interface Appointment {
  id: string
  appointment_date: string
  status: string
  appointment_type: string | null
  ucret: number | null
  odeme_durumu: string | null
  odeme_tarihi: string | null
  patient_id: string | null
  patient_name: string | null
  makbuz_gonderildi_at: string | null
}

interface Summary {
  tamamlananSeans: number
  aktifRandevu: number
  iptalVeGelmedi: number
  tahsilEdilen: number
  bekleyenOdeme: number
}

const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Tamamlandı', color: '#4a7c6f', bg: '#e8f5f1' },
  confirmed: { label: 'Onaylı', color: '#2563eb', bg: '#eff6ff' },
  seansify_pending: { label: 'Bekliyor', color: '#d97706', bg: '#fef3c7' },
  canceled: { label: 'İptal', color: '#ef4444', bg: '#fef2f2' },
  cancelled_by_patient: { label: 'İptal (Hasta)', color: '#ef4444', bg: '#fef2f2' },
  no_show: { label: 'Gelmedi', color: '#94a3b8', bg: '#f1f5f9' },
}

const ODEME_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  odendi: { label: 'Ödendi', color: '#16a34a', bg: '#dcfce7' },
  bekliyor: { label: 'Bekliyor', color: '#ca8a04', bg: '#fef9c3' },
}

type FilterType = 'tumu' | 'odendi' | 'bekliyor' | 'ucretsiz'

function formatCurrency(n: number) {
  return n.toLocaleString('tr-TR') + ' ₺'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  })
}

interface RaporlarClientProps {
  planType?: string
}

export default function RaporlarClient({ planType = 'free' }: RaporlarClientProps) {
  const isPro = planType === 'pro'
  const reportMonths = isPro ? Infinity : 3
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [filter, setFilter] = useState<FilterType>('tumu')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [makbuzSendingId, setMakbuzSendingId] = useState<string | null>(null)
  const [makbuzResult, setMakbuzResult] = useState<Record<string, 'ok' | 'error' | 'no_phone'>>({})
  const [tableKey, setTableKey] = useState(0)
  const [summaryKey, setSummaryKey] = useState(0)
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right')

  const fetchReport = useCallback(async () => {
    setLoading(true)
    const monthStr = `${year}-${String(month).padStart(2, '0')}`
    const res = await fetch(`/api/reports?month=${monthStr}`)
    const data = await res.json()
    if (res.ok) {
      setSummary(data.summary)
      setAppointments(data.appointments)
      setTableKey(k => k + 1)
      setSummaryKey(k => k + 1)
    } else {
      console.error('[Raporlar] API hatası:', data)
    }
    setLoading(false)
  }, [year, month])

  useEffect(() => { fetchReport() }, [fetchReport])

  function prevMonth() {
    if (isAtEarliestMonth) return
    setSlideDir('left')
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    setSlideDir('right')
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  async function sendMakbuz(aptId: string) {
    setMakbuzSendingId(aptId)
    try {
      const res = await fetch('/api/receipts/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: aptId }),
      })
      if (res.status === 422) {
        setMakbuzResult(prev => ({ ...prev, [aptId]: 'no_phone' }))
      } else if (res.ok) {
        setAppointments(prev => prev.map(a =>
          a.id === aptId ? { ...a, makbuz_gonderildi_at: new Date().toISOString() } : a
        ))
      } else {
        setMakbuzResult(prev => ({ ...prev, [aptId]: 'error' }))
      }
    } catch {
      setMakbuzResult(prev => ({ ...prev, [aptId]: 'error' }))
    }
    setMakbuzSendingId(null)
  }

  async function updateOdemeDurumu(aptId: string, yeniDurum: string) {
    setUpdatingId(aptId)
    const res = await fetch(`/api/appointments/${aptId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ odeme_durumu: yeniDurum }),
    })
    if (res.ok) {
      const cancelStatuses = ['canceled', 'cancelled_by_patient']
      setAppointments(prev => {
        const updated = prev.map(a => a.id === aptId ? { ...a, odeme_durumu: yeniDurum } : a)
        const tahsilEdilen = updated.filter(a => a.odeme_durumu === 'odendi').reduce((s, a) => s + (a.ucret ?? 0), 0)
        const bekleyenOdeme = updated.filter(a => a.odeme_durumu === 'bekliyor' && !cancelStatuses.includes(a.status)).reduce((s, a) => s + (a.ucret ?? 0), 0)
        setSummary(prev => prev ? { ...prev, tahsilEdilen, bekleyenOdeme } : prev)
        return updated
      })
    }
    setUpdatingId(null)
  }

  const filtered = appointments.filter(a => {
    if (filter === 'odendi') return a.odeme_durumu === 'odendi'
    if (filter === 'bekliyor') return a.odeme_durumu === 'bekliyor'
    if (filter === 'ucretsiz') return !a.ucret
    return true
  })

  const isFutureMonth = year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth() + 1)

  const earliestAllowed = new Date(now.getFullYear(), now.getMonth() - (reportMonths - 1), 1)
  const isAtEarliestMonth = !isPro && (
    year < earliestAllowed.getFullYear() ||
    (year === earliestAllowed.getFullYear() && month <= earliestAllowed.getMonth() + 1)
  )

  function exportCSV() {
    const headers = ['Tarih', 'Danışan', 'Tür', 'Seans Durumu', 'Ücret (₺)', 'Ödeme Durumu']
    const rows = appointments.map(a => [
      new Date(a.appointment_date).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' }),
      a.patient_name ?? '',
      a.appointment_type === 'online' ? 'Online' : 'Yüz yüze',
      STATUS_LABELS[a.status]?.label ?? a.status,
      a.ucret ?? '',
      ODEME_LABELS[a.odeme_durumu ?? '']?.label ?? '',
    ])
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seansify-rapor-${year}-${String(month).padStart(2, '0')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-5xl">
      {!isPro && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl text-sm" style={{ background: '#fef9c3', border: '1px solid #fde047' }}>
          <span style={{ color: '#854d0e' }}>Seansify One: Son 3 aylık raporlara erişebilirsiniz.</span>
          <a href="/upgrade" className="text-xs font-semibold px-3 py-1 rounded-lg" style={{ background: '#4a7c6f', color: 'white' }}>Pro'ya Geç</a>
        </div>
      )}
      {/* Ay Seçici */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={prevMonth}
            disabled={isAtEarliestMonth}
            className="p-2 rounded-lg transition-colors hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="text-base md:text-xl font-semibold min-w-[120px] md:min-w-[180px] text-center" style={{ color: 'var(--foreground)' }}>
            {MONTHS[month - 1]} {year}
          </div>
          <button
            onClick={nextMonth}
            disabled={isFutureMonth}
            className="p-2 rounded-lg transition-colors hover:opacity-80 disabled:opacity-30"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
        {!loading && appointments.length > 0 && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            CSV İndir
          </button>
        )}
      </div>

      {/* Özet Kartlar */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: 'var(--card)', border: '1px solid var(--border)', height: 96 }} />
          ))}
        </div>
      ) : summary && (
        <div key={summaryKey} className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ animation: 'fadeInUp 0.3s ease forwards' }}>
          <SummaryCard
            title="Tamamlanan Seans"
            value={String(summary.tamamlananSeans)}
            rawValue={summary.tamamlananSeans}
            sub="Bu ay"
            iconColor="#4a7c6f"
            icon={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>}
          />
          <SummaryCard
            title="Tahsil Edilen"
            value={formatCurrency(summary.tahsilEdilen)}
            rawValue={summary.tahsilEdilen}
            isCurrency
            sub="Ödendi işaretlendi"
            iconColor="#2563eb"
            icon={<><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>}
          />
          <SummaryCard
            title="Bekleyen Ödeme"
            value={formatCurrency(summary.bekleyenOdeme)}
            rawValue={summary.bekleyenOdeme}
            isCurrency
            sub="Henüz tahsil edilmedi"
            iconColor="#d97706"
            icon={<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>}
          />
          <SummaryCard
            title="İptal / Gelmedi"
            value={String(summary.iptalVeGelmedi)}
            rawValue={summary.iptalVeGelmedi}
            sub="Bu ay toplam"
            iconColor="#ef4444"
            icon={<><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>}
          />
        </div>
      )}

      {/* Gelir Özeti Bar */}
      {!loading && summary && (summary.tahsilEdilen + summary.bekleyenOdeme) > 0 && (
        <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex flex-wrap justify-between gap-1 text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
            <span>Tahsil: <strong style={{ color: '#4a7c6f' }}>{formatCurrency(summary.tahsilEdilen)}</strong></span>
            <span>Toplam Potansiyel: <strong>{formatCurrency(summary.tahsilEdilen + summary.bekleyenOdeme)}</strong></span>
          </div>
          <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{
                background: '#4a7c6f',
                width: `${Math.round((summary.tahsilEdilen / (summary.tahsilEdilen + summary.bekleyenOdeme)) * 100)}%`,
              }}
            />
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            {Math.round((summary.tahsilEdilen / (summary.tahsilEdilen + summary.bekleyenOdeme)) * 100)}% tahsil edildi
          </div>
        </div>
      )}

      {/* Tablo */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {/* Filtre Sekmeleri */}
        <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
          {([
            { key: 'tumu', label: 'Tümü' },
            { key: 'odendi', label: 'Ödendi' },
            { key: 'bekliyor', label: 'Bekliyor' },
            { key: 'ucretsiz', label: 'Ücretsiz' },
          ] as { key: FilterType; label: string }[]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className="flex-1 px-2 md:px-4 py-3 text-xs md:text-sm font-medium transition-colors"
              style={{
                color: filter === tab.key ? '#4a7c6f' : 'var(--muted-foreground)',
                borderBottom: filter === tab.key ? '2px solid #4a7c6f' : '2px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>Yükleniyor...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>Bu filtreye göre kayıt yok.</div>
        ) : (
          <div key={tableKey} className="overflow-x-auto" style={{ animation: `${slideDir === 'right' ? 'slideInFromRight' : 'slideInFromLeft'} 0.22s ease forwards` }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                  <th className="text-left px-4 py-3 font-medium">Tarih</th>
                  <th className="text-left px-4 py-3 font-medium">Danışan</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Tür</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Seans Durumu</th>
                  <th className="text-right px-4 py-3 font-medium">Ücret</th>
                  <th className="text-left px-4 py-3 font-medium">Ödeme Durumu</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Makbuz</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((apt, i) => {
                  const statusInfo = STATUS_LABELS[apt.status] ?? { label: apt.status, color: '#94a3b8', bg: '#f1f5f9' }
                  const isUpdating = updatingId === apt.id
                  const hasUcret = !!apt.ucret
                  return (
                    <tr
                      key={apt.id}
                      style={{
                        borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : undefined,
                        background: 'var(--card)',
                        opacity: 0,
                        animation: 'fadeInUp 0.22s ease forwards',
                        animationDelay: `${Math.min(i * 28, 220)}ms`,
                      }}
                    >
                      <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--foreground)' }}>
                        {formatDate(apt.appointment_date)}
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: 'var(--foreground)' }}>
                        {apt.patient_name ?? '—'}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell" style={{ color: 'var(--muted-foreground)' }}>
                        {apt.appointment_type === 'online' ? '💻 Online' : '🏢 Yüz yüze'}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ color: statusInfo.color, background: statusInfo.bg }}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--foreground)' }}>
                        {apt.ucret ? formatCurrency(apt.ucret) : <span style={{ color: 'var(--muted-foreground)' }}>—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {hasUcret ? (
                          isUpdating ? (
                            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>...</span>
                          ) : apt.odeme_durumu === 'odendi' ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#dcfce7', color: '#16a34a', animation: 'scaleIn 0.18s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>✓ Ödendi</span>
                              <button
                                onClick={() => updateOdemeDurumu(apt.id, 'bekliyor')}
                                title="Geri al"
                                className="text-xs opacity-40 hover:opacity-80 transition-opacity"
                                style={{ color: '#94a3b8' }}
                              >✕</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateOdemeDurumu(apt.id, 'odendi')}
                              className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all hover:opacity-80 active:scale-95"
                              style={{ background: '#fef9c3', color: '#ca8a04', border: '1px solid #fde68a' }}
                            >
                              Bekliyor →
                            </button>
                          )
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>—</span>
                        )}
                      </td>
                      {/* Makbuz sütunu */}
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {apt.odeme_durumu === 'odendi' && (
                          <MakbuzCell
                            apt={apt}
                            isSending={makbuzSendingId === apt.id}
                            result={makbuzResult[apt.id]}
                            onSend={() => sendMakbuz(apt.id)}
                          />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function MakbuzCell({
  apt, isSending, result, onSend,
}: {
  apt: Appointment
  isSending: boolean
  result: 'ok' | 'error' | 'no_phone' | undefined
  onSend: () => void
}) {
  // Makbuz başarıyla gönderildi (veya DB'den zaten gönderilmiş)
  if (apt.makbuz_gonderildi_at || result === 'ok') {
    const sentAt = apt.makbuz_gonderildi_at
      ? new Date(apt.makbuz_gonderildi_at).toLocaleString('tr-TR', {
          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
          timeZone: 'Europe/Istanbul',
        })
      : null
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold" style={{ color: '#16a34a' }}>✓ Gönderildi</span>
        {sentAt && (
          <button
            onClick={onSend}
            disabled={isSending}
            title="Tekrar gönder"
            className="text-xs opacity-40 hover:opacity-70 transition-opacity disabled:cursor-not-allowed"
            style={{ color: '#4a7c6f' }}
          >
            ↺
          </button>
        )}
      </div>
    )
  }

  if (result === 'no_phone') {
    return <span className="text-xs" style={{ color: '#94a3b8' }}>Telefon yok</span>
  }

  if (result === 'error') {
    return (
      <button
        onClick={onSend}
        disabled={isSending}
        className="text-xs font-medium px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
        style={{ background: '#fef2f2', color: '#ef4444' }}
      >
        Hata — Tekrar Dene
      </button>
    )
  }

  if (isSending) {
    return (
      <span className="text-xs font-medium" style={{ color: '#4a7c6f' }}>
        Gönderiliyor...
      </span>
    )
  }

  return (
    <button
      onClick={onSend}
      className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all hover:opacity-80 active:scale-95"
      style={{ background: '#e8f5f0', color: '#4a7c6f', border: '1px solid #c8e6de' }}
    >
      Makbuz Gönder
    </button>
  )
}

function SummaryCard({
  title, value, sub, iconColor, icon, rawValue, isCurrency,
}: {
  title: string
  value: string
  sub: string
  iconColor: string
  icon: React.ReactNode
  rawValue?: number
  isCurrency?: boolean
}) {
  const counted = useCountUp(rawValue ?? 0, 700)
  const displayValue = rawValue !== undefined
    ? (isCurrency ? counted.toLocaleString('tr-TR') + ' ₺' : String(counted))
    : value

  return (
    <div className="rounded-xl p-4 space-y-2" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{title}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {icon}
        </svg>
      </div>
      <div className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{displayValue}</div>
      <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{sub}</div>
    </div>
  )
}

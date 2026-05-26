'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'

interface PendingApt {
  id: string
  appointment_date: string
  duration_minutes: number
  patient: { name_surname: string; phone_number: string } | null
}

interface CompletionApt {
  id: string
  appointment_date: string
  duration_minutes: number
  patient: { name_surname: string } | null
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export default function NotificationBell() {
  const router = useRouter()
  const [pending, setPending] = useState<PendingApt[]>([])
  const [awaiting, setAwaiting] = useState<CompletionApt[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [varsayilanUcret, setVarsayilanUcret] = useState<number | null>(null)
  // approving: { id } means we're showing the ücret input for that appointment
  const [approving, setApproving] = useState<{ id: string; ucret: string } | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function fetchData() {
      fetch('/api/pending-appointments')
        .then(r => r.json())
        .then(d => {
          setPending(d.pending ?? [])
          setAwaiting(d.awaitingCompletion ?? [])
          setVarsayilanUcret(d.varsayilanUcret ?? null)
        })
    }
    fetchData()
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function startApprove(id: string) {
    setApproving({ id, ucret: varsayilanUcret != null ? String(varsayilanUcret) : '' })
  }

  async function confirmApprove() {
    if (!approving) return
    setLoading(approving.id)
    const ucretVal = approving.ucret.trim() !== '' ? Number(approving.ucret) : null
    await fetch(`/api/appointments/${approving.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ucret: ucretVal }),
    })
    setPending(prev => prev.filter(i => i.id !== approving.id))
    setApproving(null)
    setLoading(null)
    router.refresh()
  }

  async function handleReject(id: string) {
    setLoading(id)
    await fetch(`/api/appointments/${id}/reject`, { method: 'POST' })
    setPending(prev => prev.filter(i => i.id !== id))
    setLoading(null)
    router.refresh()
  }

  async function handleCompletion(id: string, action: 'complete' | 'no-show') {
    setLoading(id)
    await fetch(`/api/appointments/${id}/${action}`, { method: 'POST' })
    setAwaiting(prev => prev.filter(i => i.id !== id))
    setLoading(null)
    router.refresh()
  }

  const total = pending.length + awaiting.length

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
        style={{ color: 'var(--muted-foreground)' }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={total > 0 ? 'animate-pulse' : ''}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {total > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
            style={{ background: '#f59e0b', fontSize: '10px', lineHeight: 1 }}>
            {total > 9 ? '9+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 rounded-2xl shadow-xl overflow-hidden z-50"
          style={{ background: 'var(--card)', border: '1px solid var(--border)', width: 'min(360px, calc(100vw - 16px))' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Bildirimler</span>
            {total > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                {total}
              </span>
            )}
          </div>

          <div className="max-h-[480px] overflow-y-auto">
            {total === 0 && (
              <div className="px-4 py-8 text-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Bildirim yok</p>
              </div>
            )}

            {/* ─── Seans Durumu ─── */}
            {awaiting.length > 0 && (
              <>
                <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)', background: '#fffbeb' }}>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#92400e' }}>
                    Seans Durumu — {awaiting.length} randevu
                  </span>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {awaiting.map(apt => (
                    <div key={apt.id} className="px-4 py-3">
                      <div className="flex items-center gap-3 mb-2.5">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                          style={{ background: '#d97706' }}>
                          {getInitials(apt.patient?.name_surname ?? '?')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                            {apt.patient?.name_surname}
                          </div>
                          <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                            {formatDateTime(apt.appointment_date)} · {apt.duration_minutes} dk
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2 pl-12">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span className="text-xs font-medium" style={{ color: '#92400e' }}>
                          Seans tamamlandı mı?
                        </span>
                      </div>
                      <div className="flex gap-2 pl-12">
                        <button
                          disabled={loading === apt.id}
                          onClick={() => handleCompletion(apt.id, 'complete')}
                          className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-white transition-opacity disabled:opacity-50"
                          style={{ background: '#4a7c6f' }}
                        >
                          ✓ Tamamlandı
                        </button>
                        <button
                          disabled={loading === apt.id}
                          onClick={() => handleCompletion(apt.id, 'no-show')}
                          className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-opacity disabled:opacity-50"
                          style={{ background: 'rgba(234,179,8,0.15)', color: '#a16207' }}
                        >
                          ✕ Tamamlanamadı
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ─── Onay Bekleyen Talepler ─── */}
            {pending.length > 0 && (
              <>
                <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--muted)' }}>
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                    Randevu Talepleri — {pending.length}
                  </span>
                </div>
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {pending.map(apt => {
                    const initials = apt.patient?.name_surname
                      ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'
                    const isApproving = approving?.id === apt.id
                    return (
                      <div key={apt.id} className="px-4 py-3">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                            style={{ background: '#f59e0b' }}>
                            {initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                              {apt.patient?.name_surname}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              {formatDateTime(apt.appointment_date)} · {apt.duration_minutes} dk
                            </div>
                          </div>
                        </div>

                        {isApproving ? (
                          /* ─── Ücret giriş adımı ─── */
                          <div className="pl-11 space-y-2">
                            <label className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                              Seans ücreti (₺)
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={approving!.ucret}
                              onChange={e => setApproving(prev => prev ? { ...prev, ucret: e.target.value } : prev)}
                              placeholder="Ücret girin veya boş bırakın"
                              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                              style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--background)' }}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                disabled={loading === apt.id}
                                onClick={confirmApprove}
                                className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-white disabled:opacity-50"
                                style={{ background: '#4a7c6f' }}
                              >
                                {loading === apt.id ? 'Onaylanıyor...' : '✓ Onayla'}
                              </button>
                              <button
                                onClick={() => setApproving(null)}
                                className="text-xs px-3 py-1.5 rounded-lg"
                                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
                              >
                                İptal
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* ─── Normal butonlar ─── */
                          <div className="flex gap-2 pl-11">
                            <button
                              disabled={loading === apt.id}
                              onClick={() => startApprove(apt.id)}
                              className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-white transition-opacity disabled:opacity-50"
                              style={{ background: '#4a7c6f' }}
                            >
                              Onayla
                            </button>
                            <button
                              disabled={loading === apt.id}
                              onClick={() => handleReject(apt.id)}
                              className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-opacity disabled:opacity-50"
                              style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
                            >
                              Reddet
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

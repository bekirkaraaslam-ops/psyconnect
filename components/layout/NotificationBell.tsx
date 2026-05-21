'use client'
import { useState, useEffect, useRef } from 'react'
import { formatDateTime } from '@/lib/utils'

interface PendingApt {
  id: string
  appointment_date: string
  duration_minutes: number
  patient: { name_surname: string; phone_number: string } | null
}

export default function NotificationBell() {
  const [items, setItems] = useState<PendingApt[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/pending-appointments')
      .then(r => r.json())
      .then(d => setItems(d.items ?? []))
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handle(id: string, action: 'approve' | 'reject') {
    setLoading(id)
    await fetch(`/api/appointments/${id}/${action}`, { method: 'POST' })
    setItems(prev => prev.filter(i => i.id !== id))
    setLoading(null)
  }

  const count = items.length

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
        style={{ color: 'var(--muted-foreground)' }}
      >
        {/* Bell icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={count > 0 ? 'animate-pulse' : ''}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {/* Badge */}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white font-bold"
            style={{ background: '#f59e0b', fontSize: '10px', lineHeight: 1 }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 rounded-2xl shadow-xl overflow-hidden z-50"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Onay Bekleyen</span>
              {count > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                  {count}
                </span>
              )}
            </div>
          </div>

          {/* Items */}
          {count === 0 ? (
            <div className="px-4 py-6 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Bekleyen randevu yok</p>
            </div>
          ) : (
            <div className="divide-y max-h-72 overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
              {items.map(apt => {
                const initials = apt.patient?.name_surname
                  ?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'
                return (
                  <div key={apt.id} className="px-4 py-3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
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
                    <div className="flex gap-2 pl-11">
                      <button
                        disabled={loading === apt.id}
                        onClick={() => handle(apt.id, 'approve')}
                        className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-white transition-opacity disabled:opacity-50"
                        style={{ background: '#4a7c6f' }}
                      >
                        Onayla
                      </button>
                      <button
                        disabled={loading === apt.id}
                        onClick={() => handle(apt.id, 'reject')}
                        className="flex-1 text-xs font-semibold py-1.5 rounded-lg transition-opacity disabled:opacity-50"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
                      >
                        Reddet
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

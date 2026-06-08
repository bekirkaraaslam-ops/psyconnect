'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDateTime, appointmentStatusColor, appointmentStatusLabel } from '@/lib/utils'

interface Apt {
  id: string
  appointment_date: string
  duration_minutes: number
  status: string
}

interface Props {
  hastaId: string
  appointments: Apt[]
}

const INITIAL_SHOW = 3
const CANCELABLE = ['confirmed', 'scheduled', 'pending']

export default function RandevuGecmisiPanel({ hastaId, appointments }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({})

  const visible = expanded ? appointments : appointments.slice(0, INITIAL_SHOW)
  const hasMore = appointments.length > INITIAL_SHOW

  async function handleCancel(id: string) {
    setCancelingId(id)
    await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'canceled' }),
    })
    setLocalStatuses(p => ({ ...p, [id]: 'canceled' }))
    setConfirmId(null)
    setCancelingId(null)
  }

  return (
    <div className="bg-white rounded-2xl border" style={{ borderColor: '#dde5e2' }}>
      <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: '#dde5e2' }}>
        <h3 className="font-semibold" style={{ color: '#334155' }}>Randevu Geçmişi</h3>
        <Link
          href={`/appointments/new?patient_id=${hastaId}`}
          className="text-sm font-medium"
          style={{ color: '#4a7c6f' }}
        >
          + Randevu Ekle
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="p-8 text-center text-sm" style={{ color: '#94a3b8' }}>
          Henüz randevu kaydı yok.
        </div>
      ) : (
        <>
          <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
            {visible.map((apt) => {
              const status = localStatuses[apt.id] ?? apt.status
              const canCancel = CANCELABLE.includes(status)
              const isConfirming = confirmId === apt.id
              const isCanceling = cancelingId === apt.id

              return (
                <div key={apt.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 group">
                  <Link href={`/appointments/${apt.id}`} className="flex-1 min-w-0 pr-3">
                    <p className="text-sm font-medium" style={{ color: '#334155' }}>
                      {formatDateTime(apt.appointment_date)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                      {apt.duration_minutes} dakika
                    </p>
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${appointmentStatusColor(status)}`}>
                      {appointmentStatusLabel(status)}
                    </span>

                    {canCancel && (
                      isConfirming ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCancel(apt.id)}
                            disabled={isCanceling}
                            className="text-xs font-semibold px-2 py-1 rounded-lg text-white disabled:opacity-50"
                            style={{ background: '#ef4444' }}
                          >
                            {isCanceling ? '...' : 'İptal Et'}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{ background: '#f1f5f9', color: '#64748b' }}
                          >
                            Vazgeç
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(apt.id)}
                          className="transition-opacity text-xs px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
                          style={{ color: '#94a3b8', background: '#f8fafc' }}
                        >
                          İptal
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {hasMore && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-medium border-t"
              style={{ borderColor: '#f1f5f9', color: '#64748b' }}
            >
              {expanded ? (
                <>
                  Daha az göster
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: 'rotate(180deg)' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </>
              ) : (
                <>
                  {appointments.length - INITIAL_SHOW} randevu daha
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  )
}

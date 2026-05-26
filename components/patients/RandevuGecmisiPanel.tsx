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

export default function RandevuGecmisiPanel({ hastaId, appointments }: Props) {
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? appointments : appointments.slice(0, INITIAL_SHOW)
  const hasMore = appointments.length > INITIAL_SHOW

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
            {visible.map((apt) => (
              <Link
                key={apt.id}
                href={`/appointments/${apt.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: '#334155' }}>
                    {formatDateTime(apt.appointment_date)}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                    {apt.duration_minutes} dakika
                  </p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${appointmentStatusColor(apt.status)}`}>
                  {appointmentStatusLabel(apt.status)}
                </span>
              </Link>
            ))}
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

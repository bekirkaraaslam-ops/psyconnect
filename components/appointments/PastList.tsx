'use client'
import { useState } from 'react'
import Link from 'next/link'
import { formatDateTime, appointmentStatusColor, appointmentStatusLabel, getInitials } from '@/lib/utils'

interface Apt {
  id: string
  appointment_date: string
  duration_minutes: number | null
  status: string
  reminder_sent: boolean | null
  mevcut_seans_no: number | null
  toplam_paket_seansi: number | null
  appointment_type: string | null
  patient: { name_surname: string; phone_number: string } | null
}

const INITIAL_VISIBLE = 5

export default function PastList({ appointments }: { appointments: Apt[] }) {
  const [showAll, setShowAll] = useState(false)

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center" style={{ borderColor: '#dde5e2' }}>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Henüz geçmiş randevu yok</p>
      </div>
    )
  }

  const visible = showAll ? appointments : appointments.slice(0, INITIAL_VISIBLE)
  const hidden = appointments.length - INITIAL_VISIBLE

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#dde5e2' }}>
      <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
        {visible.map(apt => (
          <Link key={apt.id} href={`/appointments/${apt.id}`} className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0" style={{ background: '#4a7c6f' }}>
                {getInitials(apt.patient?.name_surname ?? '?')}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: '#334155' }}>{apt.patient?.name_surname}</div>
                <div className="text-xs" style={{ color: '#64748b' }}>{formatDateTime(apt.appointment_date)}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              {apt.reminder_sent && <span className="text-xs" title="Hatırlatıcı gönderildi">💬</span>}
              {apt.mevcut_seans_no && apt.toplam_paket_seansi && (
                <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#f0f9ff', color: '#0369a1' }}>
                  {apt.mevcut_seans_no}/{apt.toplam_paket_seansi}
                </span>
              )}
              {apt.appointment_type === 'online' && <span className="text-xs" title="Online">💻</span>}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${appointmentStatusColor(apt.status)}`}>
                {appointmentStatusLabel(apt.status)}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {appointments.length > INITIAL_VISIBLE && (
        <button
          onClick={() => setShowAll(v => !v)}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors hover:bg-gray-50"
          style={{ color: '#4a7c6f', borderTop: '1px solid #f1f5f9' }}
        >
          {showAll ? (
            <>
              Daha az göster
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </>
          ) : (
            <>
              {hidden} randevu daha
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </>
          )}
        </button>
      )}
    </div>
  )
}

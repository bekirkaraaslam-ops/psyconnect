'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Apt {
  id: string
  appointment_date: string
  patient: { id: string; name_surname: string } | null
}

export default function MissingNotesAccordion({ appointments }: { appointments: Apt[] }) {
  const [open, setOpen] = useState(true)

  if (appointments.length === 0) return null

  return (
    <div className="bg-white rounded-2xl" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 p-5 text-left transition-colors hover:bg-gray-50/60 rounded-2xl"
        style={{ borderBottom: open ? '1px solid #fef3c7' : 'none' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#fef3c7' }}>
          <span style={{ fontSize: 16 }}>📝</span>
        </div>
        <h2 className="font-semibold flex-1" style={{ color: '#334155' }}>Seans Notu Eklenmemiş</h2>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#b45309' }}>
          {appointments.length}
        </span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
          {appointments.map((apt) => {
            const saat = new Date(apt.appointment_date).toLocaleTimeString('tr-TR', {
              hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul',
            })
            const gun = new Date(apt.appointment_date).toLocaleDateString('tr-TR', {
              weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Istanbul',
            })
            const initials = (apt.patient?.name_surname ?? 'H')
              .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

            return (
              <Link
                key={apt.id}
                href={`/appointments/${apt.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ background: '#f59e0b' }}>
                    {initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium" style={{ color: '#334155' }}>{apt.patient?.name_surname}</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>{gun} · {saat}</div>
                  </div>
                </div>
                <span className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ background: '#fef3c7', color: '#b45309' }}>
                  Not ekle →
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

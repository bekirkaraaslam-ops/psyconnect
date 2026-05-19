'use client'
import { useState } from 'react'
import { formatDateTime } from '@/lib/utils'

interface PendingAppointment {
  id: string
  appointment_date: string
  duration_minutes: number
  patient: { name_surname: string; phone_number: string } | null
}

export default function PendingApprovalsPanel({ initialItems }: { initialItems: PendingAppointment[] }) {
  const [items, setItems] = useState(initialItems)
  const [loading, setLoading] = useState<string | null>(null)

  async function handle(id: string, action: 'approve' | 'reject') {
    setLoading(id)
    await fetch(`/api/appointments/${id}/${action}`, { method: 'POST' })
    setItems(prev => prev.filter(i => i.id !== id))
    setLoading(null)
  }

  if (!items.length) return null

  return (
    <div className="bg-white rounded-2xl border" style={{ borderColor: '#f59e0b', borderWidth: '1.5px' }}>
      <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: '#fef3c7' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fef3c7' }}>
          <span style={{ fontSize: 16 }}>⏳</span>
        </div>
        <h2 className="font-semibold" style={{ color: '#334155' }}>Onay Bekleyen Randevular</h2>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#b45309' }}>
          {items.length}
        </span>
      </div>
      <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
        {items.map(apt => {
          const initials = apt.patient?.name_surname
            ?.split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) ?? '?'
          return (
            <div key={apt.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                  style={{ background: '#f59e0b' }}
                >
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-medium" style={{ color: '#334155' }}>
                    {apt.patient?.name_surname}
                  </div>
                  <div className="text-xs" style={{ color: '#64748b' }}>
                    {formatDateTime(apt.appointment_date)} · {apt.duration_minutes} dk
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  disabled={loading === apt.id}
                  onClick={() => handle(apt.id, 'approve')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity"
                  style={{ background: loading === apt.id ? '#94a3b8' : '#4a7c6f' }}
                >
                  Onayla
                </button>
                <button
                  disabled={loading === apt.id}
                  onClick={() => handle(apt.id, 'reject')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-opacity"
                  style={{ background: '#fee2e2', color: '#dc2626' }}
                >
                  Reddet
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

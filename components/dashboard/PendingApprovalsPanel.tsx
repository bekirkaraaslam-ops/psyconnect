'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'

interface PendingAppointment {
  id: string
  appointment_date: string
  duration_minutes: number
  booking_name: string | null
  booking_phone: string | null
  patient: { name_surname: string; phone_number: string } | null
}

export default function PendingApprovalsPanel({ initialItems }: { initialItems: PendingAppointment[] }) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    setItems(initialItems)
  }, [initialItems])

  async function handle(id: string, action: 'approve' | 'reject') {
    setLoading(id)
    try {
      const res = await fetch(`/api/appointments/${id}/${action}`, { method: 'POST' })
      if (res.ok) {
        setItems(prev => prev.filter(i => i.id !== id))
        router.refresh()
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-white rounded-2xl" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center gap-3 p-5 border-b" style={{ borderColor: '#fef3c7' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fef3c7' }}>
          <span style={{ fontSize: 16 }}>⏳</span>
        </div>
        <h2 className="font-semibold" style={{ color: '#334155' }}>Onay Bekleyen Randevular</h2>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#b45309' }}>
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="px-5 py-4 flex items-center gap-2">
          <span className="text-sm" style={{ color: '#16a34a' }}>✓</span>
          <span className="text-sm" style={{ color: '#94a3b8' }}>Onay bekleyen randevu yok</span>
        </div>
      ) : (
      <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
        {items.map(apt => {
          const displayName = apt.patient?.name_surname ?? apt.booking_name ?? 'Misafir'
          const initials = displayName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
          const isBookingPage = !apt.patient && apt.booking_name
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
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: '#334155' }}>
                      {displayName}
                    </span>
                    {isBookingPage && (
                      <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                        Online
                      </span>
                    )}
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
      )}
    </div>
  )
}

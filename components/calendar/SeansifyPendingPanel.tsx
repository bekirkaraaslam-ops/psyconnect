'use client'

import { useCallback, useEffect, useState } from 'react'
import { formatDateTime } from '@/lib/utils'

interface PendingAppointment {
  id: string
  appointment_date: string
  duration_minutes: number
  patient: {
    name_surname: string
    phone_number: string
  } | null
}

export default function SeansifyPendingPanel() {
  const [appointments, setAppointments] = useState<PendingAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchPending = useCallback(async () => {
    const res = await fetch('/api/appointments/pending-bot')
    if (res.ok) {
      const data = await res.json()
      setAppointments(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActionLoading(id + action)
    await fetch(`/api/appointments/${id}/${action}`, { method: 'POST' })
    setActionLoading(null)
    await fetchPending()
  }

  if (loading || appointments.length === 0) return null

  return (
    <div
      className="mb-6 rounded-xl border bg-white p-5"
      style={{ borderColor: '#dde5e2' }}
    >
      <h2 className="mb-4 text-base font-semibold text-slate-700">
        Seansify Tarafından Alınan Randevular
      </h2>

      <div className="flex flex-col gap-3">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderColor: '#dde5e2', backgroundColor: '#f9fbfa' }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="font-medium text-slate-800">
                {apt.patient?.name_surname ?? 'Bilinmiyor'}
              </span>
              <span className="text-sm text-slate-500">
                {formatDateTime(apt.appointment_date)} &mdash; {apt.duration_minutes} dk
              </span>
              {apt.patient?.phone_number && (
                <span className="text-xs text-slate-400">
                  {apt.patient.phone_number}
                </span>
              )}
            </div>

            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => handleAction(apt.id, 'approve')}
                disabled={actionLoading !== null}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50"
                style={{ backgroundColor: '#4a7c6f' }}
              >
                {actionLoading === apt.id + 'approve' ? 'Onaylanıyor...' : 'Onayla'}
              </button>

              <button
                onClick={() => handleAction(apt.id, 'reject')}
                disabled={actionLoading !== null}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading === apt.id + 'reject' ? 'Reddediliyor...' : 'Reddet'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppointmentStatus } from '@/types'

interface PatientOption {
  id: string
  name_surname: string
  phone_number: string
}

interface Props {
  patients: PatientOption[]
  appointment?: {
    id: string
    patient_id: string
    appointment_date: string
    duration_minutes: number
    status: AppointmentStatus
  }
}

export default function AppointmentForm({ patients, appointment }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEdit = !!appointment

  const [form, setForm] = useState({
    patient_id: appointment?.patient_id ?? searchParams.get('patient_id') ?? '',
    appointment_date: appointment?.appointment_date
      ? new Date(appointment.appointment_date).toISOString().slice(0, 16)
      : '',
    duration_minutes: appointment?.duration_minutes ?? 50,
    status: appointment?.status ?? 'waiting' as AppointmentStatus,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const url = isEdit ? `/api/appointments/${appointment.id}` : '/api/appointments'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        duration_minutes: Number(form.duration_minutes),
        appointment_date: new Date(form.appointment_date).toISOString(),
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Bir hata oluştu.')
      setLoading(false)
      return
    }

    router.push('/appointments')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-6 space-y-5" style={{ borderColor: '#dde5e2' }}>
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Hasta *</label>
        <select
          name="patient_id"
          value={form.patient_id}
          onChange={handleChange}
          required
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
        >
          <option value="">Hasta seçin...</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name_surname}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Tarih & Saat *</label>
        <input
          type="datetime-local"
          name="appointment_date"
          value={form.appointment_date}
          onChange={handleChange}
          required
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Süre (dakika)</label>
        <select
          name="duration_minutes"
          value={form.duration_minutes}
          onChange={handleChange}
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
        >
          <option value={30}>30 dakika</option>
          <option value={50}>50 dakika</option>
          <option value={60}>60 dakika</option>
          <option value={90}>90 dakika</option>
        </select>
      </div>

      {isEdit && (
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Durum</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
            style={{ borderColor: '#dde5e2', color: '#334155' }}
          >
            <option value="waiting">Bekliyor</option>
            <option value="confirmed">Onaylandı</option>
            <option value="canceled">İptal Edildi</option>
            <option value="completed">Tamamlandı</option>
          </select>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
          style={{ borderColor: '#dde5e2', color: '#64748b' }}
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
          style={{ background: '#4a7c6f' }}
        >
          {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Randevu Oluştur'}
        </button>
      </div>
    </form>
  )
}

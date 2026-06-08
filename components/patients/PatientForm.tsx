'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { normalizePhone } from '@/lib/utils'

interface Props {
  patient?: {
    id: string
    name_surname: string
    phone_number: string
    date_of_birth?: string | null
    notes?: string | null
  }
}

export default function PatientForm({ patient }: Props) {
  const router = useRouter()
  const isEdit = !!patient

  const [form, setForm] = useState({
    name_surname: patient?.name_surname ?? '',
    phone_number: patient?.phone_number ?? '',
    date_of_birth: patient?.date_of_birth ?? '',
    notes: patient?.notes ?? '',
  })
  const [anamnezEnabled, setAnamnezEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      ...form,
      phone_number: normalizePhone(form.phone_number),
      ...(isEdit ? {} : { anamnez_enabled: anamnezEnabled }),
    }

    const url = isEdit ? `/api/patients/${patient.id}` : '/api/patients'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Bir hata oluştu.')
      setLoading(false)
      return
    }

    router.push('/patients')
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
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Ad Soyad *</label>
        <input
          name="name_surname"
          value={form.name_surname}
          onChange={handleChange}
          required
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
          placeholder="Mehmet Yılmaz"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Telefon *</label>
        <input
          name="phone_number"
          value={form.phone_number}
          onChange={handleChange}
          required
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
          placeholder="0532 123 45 67"
        />
        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>WhatsApp için kullanılacak numara</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Doğum Tarihi</label>
        <input
          type="date"
          name="date_of_birth"
          value={form.date_of_birth}
          onChange={handleChange}
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Notlar</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          rows={4}
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none resize-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
          placeholder="Danışan hakkında notlarınız... (şifreli saklanır)"
        />
      </div>

      {!isEdit && (
        <div
          className="flex items-center justify-between p-4 rounded-xl cursor-pointer"
          style={{ background: anamnezEnabled ? '#f0fdf4' : '#f8fafc', border: `1px solid ${anamnezEnabled ? '#86efac' : '#dde5e2'}` }}
          onClick={() => setAnamnezEnabled(v => !v)}
        >
          <div>
            <p className="text-sm font-medium" style={{ color: '#334155' }}>Anamnez Formu Gönderilsin mi?</p>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>İlk randevudan 1 gün önce danışana WhatsApp ile form linki gönderilir</p>
          </div>
          <div className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${anamnezEnabled ? 'bg-green-500' : 'bg-gray-200'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${anamnezEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
          </div>
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
          {loading ? 'Kaydediliyor...' : isEdit ? 'Güncelle' : 'Kaydet'}
        </button>
      </div>
    </form>
  )
}

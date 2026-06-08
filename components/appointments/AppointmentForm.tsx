'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AppointmentStatus } from '@/types'

interface PatientOption {
  id: string
  name_surname: string
  phone_number: string
}

interface PaketInfo {
  id: string
  birim_fiyat: number
  kullanilan_seans: number
  toplam_seans: number
}

interface Props {
  patients: PatientOption[]
  appointment?: {
    id: string
    patient_id: string
    appointment_date: string
    status: AppointmentStatus
    appointment_type: 'online' | 'yuzyuze'
    toplam_paket_seansi: number | null
    mevcut_seans_no: number | null
    is_first_session: boolean
  }
}

export default function AppointmentForm({ patients, appointment }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEdit = !!appointment

  const [form, setForm] = useState({
    patient_id: appointment?.patient_id ?? searchParams.get('patient_id') ?? '',
    appointment_date: appointment?.appointment_date
      ? new Date(new Date(appointment.appointment_date).getTime() + 3 * 60 * 60 * 1000).toISOString().slice(0, 16)
      : '',
    status: appointment?.status ?? 'waiting' as AppointmentStatus,
    appointment_type: appointment?.appointment_type ?? 'yuzyuze' as 'online' | 'yuzyuze',
    toplam_paket_seansi: appointment?.toplam_paket_seansi ?? '' as number | '',
    mevcut_seans_no: appointment?.mevcut_seans_no ?? '' as number | '',
    is_first_session: appointment?.is_first_session ?? false,
    ucret: '' as string,
  })
  const [paketInfo, setPaketInfo] = useState<PaketInfo | null>(null)
  const [recurring, setRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly')
  const [recurringEndDate, setRecurringEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cancelCount, setCancelCount] = useState<number | null>(null)

  useEffect(() => {
    if (!form.patient_id) { setCancelCount(null); setPaketInfo(null); return }
    fetch(`/api/patients/${form.patient_id}/cancel-count`)
      .then(r => r.json())
      .then(d => setCancelCount(d.cancelCount ?? null))
      .catch(() => setCancelCount(null))

    if (!isEdit) {
      fetch(`/api/patients/${form.patient_id}/paket`)
        .then(r => r.json())
        .then(d => {
          const pkg = d.paket ?? null
          setPaketInfo(pkg)
          const autoUcret = pkg?.birim_fiyat ?? d.varsayilanUcret
          if (autoUcret != null) setForm(prev => ({ ...prev, ucret: String(autoUcret) }))
          if (pkg) {
            setForm(prev => ({
              ...prev,
              mevcut_seans_no: pkg.kullanilan_seans + 1,
              toplam_paket_seansi: pkg.toplam_seans,
            }))
          }
        })
        .catch(() => setPaketInfo(null))
    }
  }, [form.patient_id])

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
        appointment_date: (() => {
          const [dp, tp] = form.appointment_date.split('T')
          const [y, mo, d] = dp.split('-').map(Number)
          const [h, mi] = tp.split(':').map(Number)
          return new Date(Date.UTC(y, mo - 1, d, h - 3, mi)).toISOString()
        })(),
        appointment_type: form.appointment_type,
        toplam_paket_seansi: form.toplam_paket_seansi ? Number(form.toplam_paket_seansi) : null,
        mevcut_seans_no: form.mevcut_seans_no ? Number(form.mevcut_seans_no) : null,
        is_first_session: form.is_first_session,
        ucret: form.ucret !== '' ? Number(form.ucret) : null,
        recurring: !isEdit && recurring ? { frequency: recurringFrequency, endDate: recurringEndDate } : null,
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
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-4 md:p-6 space-y-5" style={{ borderColor: '#dde5e2' }}>
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Danışan *</label>
        <select
          name="patient_id"
          value={form.patient_id}
          onChange={handleChange}
          required
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
        >
          <option value="">Danışan seçin...</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.name_surname}</option>
          ))}
        </select>
        {cancelCount !== null && cancelCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm mt-2" style={{ background: '#fef3c7', color: '#92400e' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            Bu danışan daha önce <strong className="mx-1">{cancelCount}</strong> randevuyu iptal etti.
          </div>
        )}
        {paketInfo && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm mt-2" style={{ background: '#f0fdf4', color: '#15803d' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            </svg>
            Aktif paket: <strong className="mx-1">{paketInfo.kullanilan_seans}/{paketInfo.toplam_seans} seans</strong> · ₺{paketInfo.birim_fiyat}/seans
          </div>
        )}
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
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Seans Tipi</label>
        <div className="flex gap-3">
          {(['yuzyuze', 'online'] as const).map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="appointment_type"
                value={type}
                checked={form.appointment_type === type}
                onChange={handleChange}
                className="accent-[#4a7c6f]"
              />
              <span className="text-sm" style={{ color: '#334155' }}>
                {type === 'yuzyuze' ? '🏢 Yüz Yüze' : '💻 Online'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Seans Ücreti (₺)</label>
        <input
          type="number"
          min="0"
          name="ucret"
          value={form.ucret}
          onChange={handleChange}
          placeholder="Örn: 800"
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
        />
        {paketInfo && (
          <p className="text-xs mt-1" style={{ color: '#4a7c6f' }}>
            Aktif paketten otomatik dolduruldu. Randevu kaydedilince paket {paketInfo.kullanilan_seans + 1}/{paketInfo.toplam_seans} olarak güncellenecek.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Paket Seans Takibi</label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="number"
              name="mevcut_seans_no"
              value={form.mevcut_seans_no}
              onChange={handleChange}
              min={1}
              placeholder="Kaçıncı seans"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#dde5e2', color: '#334155' }}
            />
          </div>
          <div className="flex items-center text-sm" style={{ color: '#94a3b8' }}>/</div>
          <div className="flex-1">
            <input
              type="number"
              name="toplam_paket_seansi"
              value={form.toplam_paket_seansi}
              onChange={handleChange}
              min={1}
              placeholder="Toplam paket"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#dde5e2', color: '#334155' }}
            />
          </div>
        </div>
        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Ör: 2 / 4 → 4 seanslık paketin 2. seansı</p>
      </div>

      <div className="flex items-center gap-3 py-1">
        <input
          type="checkbox"
          id="is_first_session"
          name="is_first_session"
          checked={form.is_first_session}
          onChange={e => setForm(prev => ({ ...prev, is_first_session: e.target.checked }))}
          className="w-4 h-4 accent-[#4a7c6f]"
        />
        <label htmlFor="is_first_session" className="text-sm cursor-pointer" style={{ color: '#334155' }}>
          İlk seans (hoş geldiniz mesajı gönderilir)
        </label>
      </div>

      {!isEdit && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              id="recurring"
              checked={recurring}
              onChange={e => setRecurring(e.target.checked)}
              className="w-4 h-4 accent-[#4a7c6f]"
            />
            <label htmlFor="recurring" className="text-sm cursor-pointer" style={{ color: '#334155' }}>
              Tekrarlayan randevu
            </label>
          </div>

          {recurring && (
            <div className="pl-7 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Tekrar Sıklığı</label>
                <div className="flex flex-wrap gap-2">
                  {([['weekly', 'Haftalık'], ['biweekly', '2 Haftada Bir'], ['monthly', 'Aylık']] as const).map(([val, label]) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setRecurringFrequency(val)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: recurringFrequency === val ? '#4a7c6f' : '#f1f5f9',
                        color: recurringFrequency === val ? '#fff' : '#64748b',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Bitiş Tarihi *</label>
                <input
                  type="date"
                  value={recurringEndDate}
                  onChange={e => setRecurringEndDate(e.target.value)}
                  required={recurring}
                  className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
                  style={{ borderColor: '#dde5e2', color: '#334155' }}
                />
              </div>
              <p className="text-xs" style={{ color: '#94a3b8' }}>
                Her randevu ayrı ayrı oluşturulur ve bağımsız olarak düzenlenebilir.
              </p>
            </div>
          )}
        </div>
      )}

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
            <option value="cancelled_by_patient">Danışan İptal Etti</option>
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

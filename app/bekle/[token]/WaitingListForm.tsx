'use client'

import { useState } from 'react'

const ALL_DAYS = [
  { key: 'pazartesi', label: 'Pazartesi' },
  { key: 'salı', label: 'Salı' },
  { key: 'çarşamba', label: 'Çarşamba' },
  { key: 'perşembe', label: 'Perşembe' },
  { key: 'cuma', label: 'Cuma' },
  { key: 'cumartesi', label: 'Cumartesi' },
  { key: 'pazar', label: 'Pazar' },
]

interface Props {
  psychologistId: string
  psychologistName: string
  registrationToken: string | null
}

export default function WaitingListForm({ psychologistId, psychologistName, registrationToken }: Props) {
  const [form, setForm] = useState({
    name_surname: '',
    phone_number: '',
    preferred_time_start: 9,
    preferred_time_end: 18,
    notes: '',
  })
  const [preferredDays, setPreferredDays] = useState<string[]>(['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma'])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/waiting-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        psychologist_id: psychologistId,
        registration_token: registrationToken,
        ...form,
        preferred_days: preferredDays,
      }),
    })

    setLoading(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Bir hata oluştu.')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: '#e8f5f1' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#0d1f18' }}>Kaydınız alındı!</h1>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Müsait randevu çıktığında WhatsApp üzerinden bildirim alacaksınız.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
      <div className="max-w-sm w-full space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: '#4a7c6f' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0h10m-10 0a2 2 0 0 1-2 2H3" />
            </svg>
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#0d1f18' }}>Bekleme Listesi</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            <strong>{psychologistName}</strong> — müsait randevu çıktığında sizi WhatsApp'tan haberdar edeceğiz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: '#dde5e2' }}>
          {error && (
            <div className="px-4 py-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Ad Soyad *</label>
            <input
              type="text"
              required
              value={form.name_surname}
              onChange={e => setForm(p => ({ ...p, name_surname: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#dde5e2', color: '#334155' }}
              placeholder="Adınız Soyadınız"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>WhatsApp Numarası *</label>
            <input
              type="tel"
              required
              value={form.phone_number}
              onChange={e => setForm(p => ({ ...p, phone_number: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#dde5e2', color: '#334155' }}
              placeholder="0532 123 45 67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>Uygun Günler</label>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map(day => {
                const active = preferredDays.includes(day.key)
                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() =>
                      setPreferredDays(prev =>
                        active ? prev.filter(d => d !== day.key) : [...prev, day.key]
                      )
                    }
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: active ? '#4a7c6f' : '#f1f5f9',
                      color: active ? '#fff' : '#64748b',
                    }}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Tercih Başlangıç</label>
              <select
                value={form.preferred_time_start}
                onChange={e => setForm(p => ({ ...p, preferred_time_start: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
                style={{ borderColor: '#dde5e2', color: '#334155' }}
              >
                {Array.from({ length: 13 }, (_, i) => i + 8).map(h => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Tercih Bitiş</label>
              <select
                value={form.preferred_time_end}
                onChange={e => setForm(p => ({ ...p, preferred_time_end: Number(e.target.value) }))}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
                style={{ borderColor: '#dde5e2', color: '#334155' }}
              >
                {Array.from({ length: 13 }, (_, i) => i + 8).map(h => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Not (opsiyonel)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none resize-none"
              style={{ borderColor: '#dde5e2', color: '#334155' }}
              placeholder="Özel bir tercihiz varsa belirtebilirsiniz..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
            style={{ background: '#4a7c6f' }}
          >
            {loading ? 'Kaydediliyor...' : 'Bekleme Listesine Ekle'}
          </button>
        </form>

        <p className="text-center text-xs" style={{ color: '#94a3b8' }}>
          Bilgileriniz yalnızca randevu bildirimi için kullanılacaktır.
        </p>
      </div>
    </main>
  )
}

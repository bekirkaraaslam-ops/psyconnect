'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

interface Psychologist {
  id: string
  full_name: string
  session_duration_minutes: number
  buffer_minutes: number
  work_start_hour: number
  work_end_hour: number
  work_days: string[]
}

interface Slot {
  datetime: string // ISO string
  label: string   // "Pazartesi, 26 Mayıs · 10:00"
}

const DAY_MAP: Record<string, number> = {
  pazar: 0, pazartesi: 1, salı: 2, çarşamba: 3,
  perşembe: 4, cuma: 5, cumartesi: 6,
}

function generateSlots(psych: Psychologist, bookedISO: string[]): Slot[] {
  const slots: Slot[] = []
  const now = new Date()
  const bookedSet = new Set(bookedISO)

  // Bugünün Istanbul tarihini UTC offset olarak hesapla (UTC+3)
  const nowIst = new Date(now.getTime() + 3 * 60 * 60 * 1000)
  const baseYear = nowIst.getUTCFullYear()
  const baseMonth = nowIst.getUTCMonth()
  const baseDay = nowIst.getUTCDate()

  for (let dayOffset = 0; dayOffset < 28; dayOffset++) {
    // Istanbul'da bu günün tarihini temsil eden UTC gece yarısı
    const istMidnight = new Date(Date.UTC(baseYear, baseMonth, baseDay + dayOffset))
    const jsDay = istMidnight.getUTCDay() // 0=Pazar (Istanbul günü)

    const isWorkDay = (psych.work_days ?? []).some(d => DAY_MAP[d] === jsDay)
    if (!isWorkDay) continue

    const stepMinutes = psych.session_duration_minutes + psych.buffer_minutes
    let hour = psych.work_start_hour
    let minute = 0

    while (true) {
      // Istanbul saatini UTC'ye çevir (Istanbul = UTC+3)
      const slotStart = new Date(Date.UTC(
        istMidnight.getUTCFullYear(),
        istMidnight.getUTCMonth(),
        istMidnight.getUTCDate(),
        hour - 3, minute, 0, 0
      ))

      const slotEndMs = slotStart.getTime() + psych.session_duration_minutes * 60 * 1000
      const slotEndIstHour = new Date(slotEndMs + 3 * 60 * 60 * 1000).getUTCHours()
      const slotEndIstMin  = new Date(slotEndMs + 3 * 60 * 60 * 1000).getUTCMinutes()
      const endHour = psych.work_end_hour

      if (slotEndIstHour > endHour || (slotEndIstHour === endHour && slotEndIstMin > 0)) break

      // Geçmiş slotları ve 2 saatten az kalanları atla
      if (slotStart.getTime() < now.getTime() + 2 * 60 * 60 * 1000) {
        const totalMinutes = hour * 60 + minute + stepMinutes
        hour = Math.floor(totalMinutes / 60)
        minute = totalMinutes % 60
        continue
      }

      const iso = slotStart.toISOString()
      if (!bookedSet.has(iso)) {
        const label = slotStart.toLocaleString('tr-TR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Europe/Istanbul',
        })
        slots.push({ datetime: iso, label })
      }

      const totalMinutes = hour * 60 + minute + stepMinutes
      hour = Math.floor(totalMinutes / 60)
      minute = totalMinutes % 60
    }
  }

  return slots
}

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>()
  const [psych, setPsych] = useState<Psychologist | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [step, setStep] = useState<'slots' | 'form' | 'success' | 'error'>('slots')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetch(`/api/book/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setStep('error'); setErrorMsg(data.error); setLoading(false); return }
        setPsych(data.psychologist)
        setSlots(generateSlots(data.psychologist, data.bookedSlots ?? []))
        setLoading(false)
      })
      .catch(() => { setStep('error'); setErrorMsg('Bir hata oluştu.'); setLoading(false) })
  }, [slug])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    const res = await fetch(`/api/book/${slug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot: selectedSlot, name: form.name, phone: form.phone }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (res.ok) {
      setStep('success')
    } else {
      setErrorMsg(data.error ?? 'Bir hata oluştu.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4faf8' }}>
        <div className="text-sm" style={{ color: '#4a7c6f' }}>Yükleniyor...</div>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f4faf8' }}>
        <div className="text-center p-8">
          <p className="text-sm" style={{ color: '#64748b' }}>{errorMsg || 'Bu randevu sayfası bulunamadı.'}</p>
        </div>
      </div>
    )
  }


  return (
    <div className="relative min-h-screen py-10 px-4" style={{ background: '#f4faf8' }}>
      <div className="max-w-md mx-auto space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: '#4a7c6f' }}>
            <span className="text-xl font-bold text-white">
              {psych?.full_name?.charAt(0) ?? 'P'}
            </span>
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#0d1f18' }}>{psych?.full_name}</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Randevu talebi — {psych?.session_duration_minutes} dakika
          </p>
        </div>

        {step === 'slots' && (
          <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: '#dde5e2' }}>
            <h2 className="text-sm font-semibold" style={{ color: '#334155' }}>Müsait Zamanlar</h2>
            {slots.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#94a3b8' }}>
                Yakın zamanda müsait randevu bulunmuyor.
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {slots.map(slot => (
                  <button
                    key={slot.datetime}
                    type="button"
                    onClick={() => setSelectedSlot(slot.datetime)}
                    className="w-full text-left px-4 py-3 rounded-xl border text-sm transition-colors"
                    style={{
                      borderColor: selectedSlot === slot.datetime ? '#4a7c6f' : '#dde5e2',
                      background: selectedSlot === slot.datetime ? '#f0fdf4' : '#fff',
                      color: '#334155',
                    }}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              disabled={!selectedSlot}
              onClick={() => setStep('form')}
              className="w-full py-3 rounded-xl text-sm font-medium text-white disabled:opacity-40"
              style={{ background: '#4a7c6f' }}
            >
              Devam Et
            </button>
          </div>
        )}

        {step === 'form' && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: '#dde5e2' }}>
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: '#4a7c6f' }}>Seçilen zaman</p>
              <p className="text-sm font-semibold" style={{ color: '#334155' }}>
                {slots.find(s => s.datetime === selectedSlot)?.label}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Ad Soyad *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
                style={{ borderColor: '#dde5e2', color: '#334155' }}
                placeholder="Ad Soyad"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Telefon *</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
                style={{ borderColor: '#dde5e2', color: '#334155' }}
                placeholder="05XX XXX XX XX"
              />
            </div>

            <p className="text-xs" style={{ color: '#94a3b8' }}>
              Kişisel verileriniz KVKK kapsamında yalnızca randevu yönetimi amacıyla işlenecektir.
            </p>

            {errorMsg && (
              <p className="text-sm px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#dc2626' }}>
                {errorMsg}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setStep('slots'); setErrorMsg('') }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                style={{ borderColor: '#dde5e2', color: '#64748b' }}
              >
                Geri
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                style={{ background: '#4a7c6f' }}
              >
                {submitting ? 'Gönderiliyor...' : 'Talep Gönder'}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-xs" style={{ color: '#94a3b8' }}>
          Seansify ile randevu yönetimi
        </p>
      </div>

      {/* Başarı overlay */}
      {step === 'success' && (
        <div
          className="fixed inset-0 flex items-center justify-center px-4"
          style={{ background: 'rgba(13,31,24,0.55)', zIndex: 50, backdropFilter: 'blur(4px)' }}
        >
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: '#dcfce7' }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ color: '#0d1f18' }}>Talebiniz Alındı!</h2>
            <p className="text-sm mb-1" style={{ color: '#334155' }}>
              Randevu talebiniz psikologunuza iletildi.
            </p>
            <p className="text-sm" style={{ color: '#64748b' }}>
              Onaylandığında <strong>WhatsApp</strong> üzerinden bildirim alacaksınız.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm" style={{ background: '#f0fdf4', color: '#15803d' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M11.998 0C5.375 0 0 5.375 0 12c0 2.124.558 4.115 1.528 5.845L.057 23.55a.75.75 0 00.927.928l5.726-1.473A11.954 11.954 0 0012 24c6.626 0 12-5.375 12-12S18.624 0 11.998 0zm.002 21.75a9.945 9.945 0 01-5.031-1.36l-.361-.214-3.742.963.993-3.635-.236-.374A9.952 9.952 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
              </svg>
              WhatsApp bildirimi açık tutun
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

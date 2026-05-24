'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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

export default function UpcomingList({ appointments }: { appointments: Apt[] }) {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)
  const [target, setTarget] = useState<Apt | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function openModal(apt: Apt) {
    const d = new Date(apt.appointment_date)
    const pad = (n: number) => String(n).padStart(2, '0')
    // Pre-fill with current appointment time in Istanbul (UTC+3)
    const istanbul = new Date(d.getTime() + 3 * 60 * 60 * 1000)
    setNewDate(`${istanbul.getUTCFullYear()}-${pad(istanbul.getUTCMonth() + 1)}-${pad(istanbul.getUTCDate())}`)
    setNewTime(`${pad(istanbul.getUTCHours())}:${pad(istanbul.getUTCMinutes())}`)
    setReason('')
    setError('')
    setTarget(apt)
  }

  function closeModal() {
    if (loading) return
    setTarget(null)
  }

  async function handleSubmit() {
    if (!target || !newDate || !newTime || !reason.trim()) {
      setError('Lütfen tüm alanları doldurun.')
      return
    }
    setLoading(true)
    setError('')
    // Build ISO in Istanbul time (always UTC+3)
    const isoDate = new Date(`${newDate}T${newTime}:00+03:00`).toISOString()
    const res = await fetch(`/api/appointments/${target.id}/reschedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newDate: isoDate, reason }),
    })
    setLoading(false)
    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Bir hata oluştu.')
      return
    }
    setTarget(null)
    router.refresh()
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border p-8 flex flex-col items-center text-center" style={{ borderColor: '#dde5e2' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <p className="text-sm font-medium mb-1" style={{ color: '#475569' }}>Yaklaşan randevu yok</p>
        <Link href="/appointments/new" className="text-xs font-medium mt-2 underline" style={{ color: '#4a7c6f' }}>
          Yeni randevu ekle →
        </Link>
      </div>
    )
  }

  const visible = showAll ? appointments : appointments.slice(0, INITIAL_VISIBLE)
  const hidden = appointments.length - INITIAL_VISIBLE

  return (
    <>
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#dde5e2' }}>
        <div className="divide-y" style={{ borderColor: '#f1f5f9' }}>
          {visible.map(apt => (
            <div key={apt.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/60 transition-colors">
              {/* Hasta adı + tarih (tıklanabilir) */}
              <Link href={`/appointments/${apt.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0" style={{ background: '#4a7c6f' }}>
                  {getInitials(apt.patient?.name_surname ?? '?')}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: '#334155' }}>{apt.patient?.name_surname}</div>
                  <div className="text-xs" style={{ color: '#64748b' }}>{formatDateTime(apt.appointment_date)}</div>
                </div>
              </Link>

              {/* Sağ taraf: badge + erteleme butonu */}
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
                <button
                  onClick={() => openModal(apt)}
                  title="Randevuyu ertele"
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg font-medium transition-colors hover:bg-amber-50"
                  style={{ color: '#d97706', border: '1px solid #fde68a' }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Ertele
                </button>
              </div>
            </div>
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

      {/* Erteleme Modal */}
      {target && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Randevu Ertele</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  {target.patient?.name_surname} · {formatDateTime(target.appointment_date)}
                </p>
              </div>
              <button onClick={closeModal} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-gray-100" style={{ color: 'var(--muted-foreground)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Yeni tarih + saat */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Yeni Tarih</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border outline-none focus:ring-2"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--background)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Yeni Saat</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="w-full text-sm px-3 py-2 rounded-xl border outline-none focus:ring-2"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--background)' }}
                  />
                </div>
              </div>

              {/* Erteleme sebebi */}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Erteleme Sebebi</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Örn: zorunlu seyahat, acil durum..."
                  rows={3}
                  className="w-full text-sm px-3 py-2 rounded-xl border outline-none resize-none"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)', background: 'var(--background)' }}
                />
              </div>

              {/* WhatsApp bilgi notu */}
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#22c55e" className="shrink-0 mt-0.5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
                <p className="text-xs leading-relaxed" style={{ color: '#166534' }}>
                  WhatsApp bağlıysa hastaya otomatik erteleme mesajı gönderilecek.
                </p>
              </div>

              {error && (
                <p className="text-xs font-medium" style={{ color: '#ef4444' }}>{error}</p>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={closeModal}
                disabled={loading}
                className="flex-1 text-sm font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50"
                style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !newDate || !newTime || !reason.trim()}
                className="flex-1 text-sm font-semibold py-2.5 rounded-xl text-white transition-opacity disabled:opacity-50"
                style={{ background: '#4a7c6f' }}
              >
                {loading ? 'Erteleniyor...' : 'Randevuyu Ertele'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

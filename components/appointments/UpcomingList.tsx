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
  ucret: number | null
  odeme_durumu: string | null
  patient: { name_surname: string; phone_number: string } | null
}

const INITIAL_VISIBLE = 5

export default function UpcomingList({ appointments }: { appointments: Apt[] }) {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Erteleme modal
  const [target, setTarget] = useState<Apt | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Seans ücreti edit
  const [feeAptId, setFeeAptId] = useState<string | null>(null)
  const [feeValue, setFeeValue] = useState('')
  const [feeOdeme, setFeeOdeme] = useState('bekliyor')
  const [feeSaving, setFeeSaving] = useState(false)
  // Local override for optimistic update
  const [localFees, setLocalFees] = useState<Record<string, { ucret: number | null; odeme_durumu: string | null }>>({})

  function toggleExpand(apt: Apt) {
    if (expandedId === apt.id) {
      setExpandedId(null)
      setFeeAptId(null)
    } else {
      setExpandedId(apt.id)
      setFeeAptId(null)
    }
  }

  function openFeeEdit(apt: Apt) {
    const current = localFees[apt.id]
    const ucret = current !== undefined ? current.ucret : apt.ucret
    const odeme = current !== undefined ? current.odeme_durumu : apt.odeme_durumu
    setFeeValue(ucret != null ? String(ucret) : '')
    setFeeOdeme(odeme ?? 'bekliyor')
    setFeeAptId(apt.id)
  }

  async function saveFee(aptId: string) {
    setFeeSaving(true)
    const res = await fetch(`/api/appointments/${aptId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ucret: feeValue === '' ? null : feeValue, odeme_durumu: feeOdeme }),
    })
    setFeeSaving(false)
    if (res.ok) {
      setLocalFees(prev => ({
        ...prev,
        [aptId]: { ucret: feeValue === '' ? null : Number(feeValue), odeme_durumu: feeOdeme },
      }))
      setFeeAptId(null)
      router.refresh()
    }
  }

  function openModal(apt: Apt) {
    const d = new Date(apt.appointment_date)
    const pad = (n: number) => String(n).padStart(2, '0')
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
      <div className="bg-white rounded-2xl border p-8 flex flex-col items-center text-center" style={{ borderColor: '#dde5e2', animation: 'fadeInUp 0.3s ease forwards' }}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: '#f0fdf4' }}>
          <span style={{ fontSize: 26 }}>🌿</span>
        </div>
        <p className="text-sm font-semibold mb-1" style={{ color: '#334155' }}>Takvim temiz</p>
        <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>Yaklaşan randevu yok. İyi dinlenmeler.</p>
        <Link
          href="/appointments/new"
          className="text-xs font-semibold px-4 py-2 rounded-xl transition-opacity hover:opacity-80"
          style={{ background: '#e8f5f1', color: '#4a7c6f' }}
        >
          + Yeni randevu ekle
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
          {visible.map(apt => {
            const isExpanded = expandedId === apt.id
            const local = localFees[apt.id]
            const displayUcret = local !== undefined ? local.ucret : apt.ucret
            const displayOdeme = local !== undefined ? local.odeme_durumu : apt.odeme_durumu
            const isEditingFee = feeAptId === apt.id

            return (
              <div key={apt.id}>
                {/* Satır başlığı */}
                <div
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/60 transition-colors cursor-pointer"
                  onClick={() => toggleExpand(apt)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0" style={{ background: '#4a7c6f' }}>
                      {getInitials(apt.patient?.name_surname ?? '?')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: '#334155' }}>{apt.patient?.name_surname}</div>
                      <div className="text-xs" style={{ color: '#64748b' }}>{formatDateTime(apt.appointment_date)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {apt.reminder_sent && <span className="text-xs" title="Hatırlatıcı gönderildi">💬</span>}
                    {apt.mevcut_seans_no && apt.toplam_paket_seansi && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#f0f9ff', color: '#0369a1' }}>
                        {apt.mevcut_seans_no}/{apt.toplam_paket_seansi}
                      </span>
                    )}
                    {apt.appointment_type === 'online' && <span className="text-xs" title="Online">💻</span>}
                    {displayUcret != null && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        displayOdeme === 'odendi' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                      }`} title={displayOdeme === 'odendi' ? 'Ödendi' : 'Ödeme bekliyor'}>
                        ₺{displayUcret.toLocaleString('tr-TR')}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${appointmentStatusColor(apt.status)}`}>
                      {appointmentStatusLabel(apt.status)}
                    </span>
                    <svg
                      width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Detay paneli */}
                <div style={{
                  display: 'grid',
                  gridTemplateRows: isExpanded ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.28s cubic-bezier(0.4,0,0.2,1)',
                }}>
                <div style={{ minHeight: 0, overflow: 'hidden' }}>
                  <div className="px-4 pb-4 pt-1" style={{ background: '#f8fafc', borderTop: '1px solid #f1f5f9' }}>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-xs font-medium mb-0.5" style={{ color: '#94a3b8' }}>Tür</div>
                        <div className="text-sm" style={{ color: '#334155' }}>
                          {apt.appointment_type === 'online' ? '💻 Online' : '🏢 Yüz yüze'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium mb-0.5" style={{ color: '#94a3b8' }}>Süre</div>
                        <div className="text-sm" style={{ color: '#334155' }}>
                          {apt.duration_minutes ? `${apt.duration_minutes} dk` : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium mb-0.5" style={{ color: '#94a3b8' }}>Durum</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${appointmentStatusColor(apt.status)}`}>
                          {appointmentStatusLabel(apt.status)}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-medium mb-0.5" style={{ color: '#94a3b8' }}>Telefon</div>
                        <div className="text-sm" style={{ color: '#334155' }}>{apt.patient?.phone_number ?? '—'}</div>
                      </div>
                    </div>

                    {/* Seans ücreti */}
                    <div className="rounded-xl border p-3 mb-3" style={{ borderColor: '#e2e8f0', background: 'white' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold" style={{ color: '#334155' }}>Seans Ücreti</span>
                        {!isEditingFee && (
                          <button
                            onClick={e => { e.stopPropagation(); openFeeEdit(apt) }}
                            className="text-xs font-medium px-2 py-1 rounded-lg transition-colors hover:bg-gray-100"
                            style={{ color: '#4a7c6f' }}
                          >
                            {displayUcret != null ? 'Düzenle' : '+ Ekle'}
                          </button>
                        )}
                      </div>

                      {isEditingFee ? (
                        <div className="space-y-2" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="₺ Tutar"
                              value={feeValue}
                              onChange={e => setFeeValue(e.target.value)}
                              className="flex-1 text-sm px-3 py-1.5 rounded-lg border outline-none"
                              style={{ borderColor: '#e2e8f0' }}
                            />
                            <select
                              value={feeOdeme}
                              onChange={e => setFeeOdeme(e.target.value)}
                              className="text-xs px-2 py-1.5 rounded-lg border outline-none"
                              style={{ borderColor: '#e2e8f0', color: '#334155' }}
                            >
                              <option value="bekliyor">Bekliyor</option>
                              <option value="odendi">Ödendi</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setFeeAptId(null)}
                              className="flex-1 text-xs py-1.5 rounded-lg font-medium"
                              style={{ background: '#f1f5f9', color: '#64748b' }}
                            >
                              İptal
                            </button>
                            <button
                              onClick={() => saveFee(apt.id)}
                              disabled={feeSaving}
                              className="flex-1 text-xs py-1.5 rounded-lg font-semibold text-white disabled:opacity-50"
                              style={{ background: '#4a7c6f' }}
                            >
                              {feeSaving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {displayUcret != null ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold" style={{ color: '#334155' }}>
                                ₺{displayUcret.toLocaleString('tr-TR')}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                displayOdeme === 'odendi' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                              }`}>
                                {displayOdeme === 'odendi' ? 'Ödendi' : 'Ödeme bekliyor'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: '#94a3b8' }}>Ücret girilmemiş</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Alt butonlar */}
                    <div className="flex gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); openModal(apt) }}
                        className="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-2 rounded-lg font-medium transition-colors hover:bg-amber-50"
                        style={{ color: '#d97706', border: '1px solid #fde68a' }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Ertele
                      </button>
                      <Link
                        href={`/appointments/${apt.id}`}
                        className="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-2 rounded-lg font-medium"
                        style={{ color: '#4a7c6f', border: '1px solid #dde5e2', background: 'white' }}
                        onClick={e => e.stopPropagation()}
                      >
                        Detay sayfası →
                      </Link>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )
          })}
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

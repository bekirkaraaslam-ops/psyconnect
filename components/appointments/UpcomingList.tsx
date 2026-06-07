'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDateTime, appointmentStatusColor, appointmentStatusLabel, appointmentStatusAccent, getInitials } from '@/lib/utils'
import AppointmentDrawer from './AppointmentDrawer'

interface Apt {
  id: string
  patient_id: string | null
  appointment_date: string
  duration_minutes: number | null
  status: string
  reminder_sent: boolean | null
  mevcut_seans_no: number | null
  toplam_paket_seansi: number | null
  appointment_type: string | null
  ucret: number | null
  odeme_durumu: string | null
  patient: { id: string; name_surname: string; phone_number: string } | null
}

interface PaketSablon {
  id: string
  name: string
  session_count: number
  price_tl: number
}

const INITIAL_VISIBLE = 5

export default function UpcomingList({ appointments }: { appointments: Apt[] }) {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [drawerAptId, setDrawerAptId] = useState<string | null>(null)

  // Erteleme modal
  const [target, setTarget] = useState<Apt | null>(null)
  const [newDate, setNewDate] = useState('')
  const [newTime, setNewTime] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Paket ekleme
  const [paketAptId, setPaketAptId] = useState<string | null>(null)
  const [paketler, setPaketler] = useState<PaketSablon[] | null>(null)
  const [selectedPaketIdx, setSelectedPaketIdx] = useState<number>(-1)
  const [paketLoading, setPaketLoading] = useState(false)
  const [paketSaving, setPaketSaving] = useState(false)

  function toggleExpand(apt: Apt) {
    if (expandedId === apt.id) {
      setExpandedId(null)
      setPaketAptId(null)
    } else {
      setExpandedId(apt.id)
      setPaketAptId(null)
      setPaketler(null)
    }
  }

  async function openPaketEkle(apt: Apt) {
    setPaketAptId(apt.id)
    setPaketLoading(true)
    setPaketler(null)
    setSelectedPaketIdx(-1)
    const res = await fetch('/api/packages')
    const data = res.ok ? await res.json() : []
    setPaketler(data)
    setPaketLoading(false)
  }

  async function savePaket(apt: Apt) {
    if (!paketler || selectedPaketIdx < -1) return
    const patientId = apt.patient?.id ?? apt.patient_id
    if (!patientId) return

    setPaketSaving(true)
    if (selectedPaketIdx >= 0) {
      const p = paketler[selectedPaketIdx]
      const birim = Math.round(p.price_tl / p.session_count)
      await Promise.all([
        fetch(`/api/patients/${patientId}/paket`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toplam_seans: p.session_count, birim_fiyat: birim }),
        }),
        fetch(`/api/appointments/${apt.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ucret: birim, mevcut_seans_no: 1, toplam_paket_seansi: p.session_count, odeme_durumu: 'bekliyor' }),
        }),
      ])
    }
    setPaketSaving(false)
    setPaketAptId(null)
    setPaketler(null)
    router.refresh()
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
            const displayUcret = apt.ucret
            const displayOdeme = apt.odeme_durumu
            const isAddingPaket = paketAptId === apt.id

            const accent = appointmentStatusAccent(apt.status)

            return (
              <div key={apt.id} style={{ borderLeft: `3px solid ${accent.bar}` }}>
                {/* Satır başlığı */}
                <div
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50/60 transition-colors cursor-pointer"
                  onClick={() => toggleExpand(apt)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0" style={{ background: accent.avatar, color: accent.avatarText }}>
                      {getInitials(apt.patient?.name_surname ?? '?')}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate text-[#334155] dark:text-slate-100">{apt.patient?.name_surname}</div>
                      <div className="text-xs text-[#64748b] dark:text-slate-400">{formatDateTime(apt.appointment_date)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 md:gap-1.5 shrink-0 ml-2">
                    {apt.reminder_sent && <span className="text-xs hidden sm:inline" title="Hatırlatıcı gönderildi">💬</span>}
                    {apt.mevcut_seans_no && apt.toplam_paket_seansi && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full hidden sm:inline" style={{ background: '#f0f9ff', color: '#0369a1' }}>
                        {apt.mevcut_seans_no}/{apt.toplam_paket_seansi}
                      </span>
                    )}
                    {apt.appointment_type === 'online' && <span className="text-xs hidden sm:inline" title="Online">💻</span>}
                    {displayUcret != null && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium hidden md:inline ${
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
                  <div className="px-4 pb-4 pt-1 bg-[#f8fafc] dark:bg-slate-800/60" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-xs font-medium mb-0.5 text-[#94a3b8] dark:text-slate-500">Tür</div>
                        <div className="text-sm text-[#334155] dark:text-slate-100">
                          {apt.appointment_type === 'online' ? '💻 Online' : '🏢 Yüz yüze'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium mb-0.5 text-[#94a3b8] dark:text-slate-500">Süre</div>
                        <div className="text-sm text-[#334155] dark:text-slate-100">
                          {apt.duration_minutes ? `${apt.duration_minutes} dk` : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium mb-0.5 text-[#94a3b8] dark:text-slate-500">Durum</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${appointmentStatusColor(apt.status)}`}>
                          {appointmentStatusLabel(apt.status)}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-medium mb-0.5 text-[#94a3b8] dark:text-slate-500">Telefon</div>
                        <div className="text-sm text-[#334155] dark:text-slate-100">{apt.patient?.phone_number ?? '—'}</div>
                      </div>
                    </div>

                    {/* Paket */}
                    <div className="rounded-xl border p-3 mb-3 bg-white dark:bg-slate-700/60" style={{ borderColor: '#e2e8f0' }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#334155] dark:text-slate-100">Seans Paketi</span>
                        {!isAddingPaket && !apt.mevcut_seans_no && (
                          <button
                            onClick={e => { e.stopPropagation(); openPaketEkle(apt) }}
                            className="text-xs font-medium px-2 py-1 rounded-lg transition-colors hover:bg-gray-100"
                            style={{ color: '#4a7c6f' }}
                          >
                            + Paket Ekle
                          </button>
                        )}
                      </div>

                      {isAddingPaket ? (
                        <div className="space-y-2" onClick={e => e.stopPropagation()}>
                          {paketLoading ? (
                            <p className="text-xs" style={{ color: '#94a3b8' }}>Paketler yükleniyor...</p>
                          ) : paketler && paketler.length > 0 ? (
                            <select
                              value={selectedPaketIdx}
                              onChange={e => setSelectedPaketIdx(Number(e.target.value))}
                              className="w-full text-xs px-2 py-1.5 rounded-lg border outline-none"
                              style={{ borderColor: '#e2e8f0', color: '#334155' }}
                            >
                              <option value={-1}>Paket seçin...</option>
                              {paketler.map((p, i) => (
                                <option key={p.id} value={i}>
                                  {p.name} — {p.session_count} seans (₺{Math.round(p.price_tl / p.session_count)}/seans)
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className="text-xs" style={{ color: '#94a3b8' }}>Tanımlı paket şablonu yok.</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setPaketAptId(null); setPaketler(null) }}
                              className="flex-1 text-xs py-1.5 rounded-lg font-medium"
                              style={{ background: '#f1f5f9', color: '#64748b' }}
                            >
                              İptal
                            </button>
                            {paketler && paketler.length > 0 && (
                              <button
                                onClick={() => savePaket(apt)}
                                disabled={paketSaving || selectedPaketIdx < 0}
                                className="flex-1 text-xs py-1.5 rounded-lg font-semibold text-white disabled:opacity-50"
                                style={{ background: '#4a7c6f' }}
                              >
                                {paketSaving ? 'Ekleniyor...' : 'Ekle'}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          {apt.mevcut_seans_no && apt.toplam_paket_seansi ? (
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-[#334155] dark:text-slate-100">
                                {apt.mevcut_seans_no}/{apt.toplam_paket_seansi}
                              </span>
                              <span className="text-xs" style={{ color: '#64748b' }}>seans</span>
                              {displayUcret != null && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${
                                  displayOdeme === 'odendi' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                }`}>
                                  ₺{displayUcret.toLocaleString('tr-TR')} {displayOdeme === 'odendi' ? '· Ödendi' : '· Bekliyor'}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs" style={{ color: '#94a3b8' }}>Paket eklenmemiş</span>
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
                      <button
                        onClick={e => { e.stopPropagation(); setDrawerAptId(apt.id) }}
                        className="flex-1 flex items-center justify-center gap-1 text-xs px-3 py-2 rounded-lg font-medium bg-white dark:bg-slate-700 dark:border-slate-600"
                        style={{ color: '#4a7c6f', border: '1px solid #dde5e2' }}
                      >
                        Detaylar →
                      </button>
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
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors hover:bg-gray-50 dark:hover:bg-slate-700 text-[#4a7c6f] dark:text-[#6ee7b7]"
            style={{ borderTop: '1px solid #f1f5f9' }}
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

      <AppointmentDrawer appointmentId={drawerAptId} onClose={() => setDrawerAptId(null)} />

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

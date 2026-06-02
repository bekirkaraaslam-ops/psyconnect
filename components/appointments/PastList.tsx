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

export default function PastList({ appointments }: { appointments: Apt[] }) {
  const router = useRouter()
  const [showAll, setShowAll] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const [feeAptId, setFeeAptId] = useState<string | null>(null)
  const [feeValue, setFeeValue] = useState('')
  const [feeOdeme, setFeeOdeme] = useState('bekliyor')
  const [feeSaving, setFeeSaving] = useState(false)
  const [localFees, setLocalFees] = useState<Record<string, { ucret: number | null; odeme_durumu: string | null }>>({})

  function toggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      setFeeAptId(null)
    } else {
      setExpandedId(id)
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

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center" style={{ borderColor: '#dde5e2' }}>
        <p className="text-sm" style={{ color: '#94a3b8' }}>Henüz geçmiş randevu yok</p>
      </div>
    )
  }

  const visible = showAll ? appointments : appointments.slice(0, INITIAL_VISIBLE)
  const hidden = appointments.length - INITIAL_VISIBLE

  return (
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
              {/* Satır */}
              <div
                className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => toggleExpand(apt.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0" style={{ background: '#4a7c6f' }}>
                    {getInitials(apt.patient?.name_surname ?? '?')}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate text-[#334155] dark:text-slate-100">{apt.patient?.name_surname}</div>
                    <div className="text-xs text-[#64748b] dark:text-slate-400">{formatDateTime(apt.appointment_date)}</div>
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

                  {/* Seans ücreti */}
                  <div className="rounded-xl border p-3 mb-3 bg-white dark:bg-slate-700/60" style={{ borderColor: '#e2e8f0' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#334155] dark:text-slate-100">Seans Ücreti</span>
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
                            <span className="text-lg font-bold text-[#334155] dark:text-slate-100">
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

                  <Link
                    href={`/appointments/${apt.id}`}
                    className="flex items-center justify-center gap-1 text-xs px-3 py-2 rounded-lg font-medium w-full bg-white dark:bg-slate-700 dark:border-slate-600"
                    style={{ color: '#4a7c6f', border: '1px solid #dde5e2' }}
                    onClick={e => e.stopPropagation()}
                  >
                    Detay sayfası →
                  </Link>
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
  )
}

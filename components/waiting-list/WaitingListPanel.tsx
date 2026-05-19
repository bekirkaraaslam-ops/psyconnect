'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface WaitingEntry {
  id: string
  name_surname: string
  phone_number: string
  preferred_days: string[]
  preferred_time_start: number
  preferred_time_end: number
  notes: string | null
  status: string
  offer_status: string | null
  offer_sent_at: string | null
  offered_slot: string | null
  registration_token: string
  created_at: string
}

interface Props {
  initialEntries: WaitingEntry[]
  psychologistId: string
}

const DAY_LABELS: Record<string, string> = {
  pazartesi: 'Pzt', salı: 'Sal', çarşamba: 'Çar',
  perşembe: 'Per', cuma: 'Cum', cumartesi: 'Cmt', pazar: 'Paz',
}

export default function WaitingListPanel({ initialEntries, psychologistId }: Props) {
  const router = useRouter()
  const [entries, setEntries] = useState(initialEntries)
  const [removing, setRemoving] = useState<string | null>(null)
  const [copying, setCopying] = useState(false)

  const waitingLink = typeof window !== 'undefined'
    ? `${window.location.origin}/bekle/${psychologistId}`
    : `/bekle/${psychologistId}`

  async function handleRemove(id: string) {
    setRemoving(id)
    await fetch(`/api/waiting-list/${id}`, { method: 'DELETE' })
    setEntries(prev => prev.filter(e => e.id !== id))
    setRemoving(null)
    router.refresh()
  }

  async function copyLink() {
    await navigator.clipboard.writeText(waitingLink)
    setCopying(true)
    setTimeout(() => setCopying(false), 2000)
  }

  return (
    <div className="space-y-5">
      {/* Kayıt linki */}
      <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: '#dde5e2' }}>
        <h3 className="font-semibold text-sm" style={{ color: '#334155' }}>Kayıt Linki</h3>
        <p className="text-xs" style={{ color: '#64748b' }}>
          Bu linki hastanıza gönderin — doldurunca bekleme listesine eklenirler.
        </p>
        <div className="flex items-center gap-2">
          <div
            className="flex-1 px-3 py-2 rounded-lg border text-xs font-mono truncate"
            style={{ borderColor: '#dde5e2', color: '#4a7c6f', background: '#f8fafc' }}
          >
            {waitingLink}
          </div>
          <button
            onClick={copyLink}
            className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: copying ? '#dcfce7' : '#e8f5f1', color: copying ? '#16a34a' : '#4a7c6f' }}
          >
            {copying ? 'Kopyalandı!' : 'Kopyala'}
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#dde5e2' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: '#dde5e2' }}>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm" style={{ color: '#334155' }}>
              Bekleyenler ({entries.length})
            </h3>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm" style={{ color: '#94a3b8' }}>Bekleme listesi boş.</p>
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: '#dde5e2' }}>
            {entries.map(e => (
              <li key={e.id} className="px-5 py-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm" style={{ color: '#334155' }}>{e.name_surname}</span>
                    {e.status === 'offered' && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#fef3c7', color: '#92400e' }}>
                        Teklif Gönderildi
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-1.5" style={{ color: '#64748b' }}>{e.phone_number}</p>

                  {e.preferred_days?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {e.preferred_days.map(d => (
                        <span key={d} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#e8f5f1', color: '#4a7c6f' }}>
                          {DAY_LABELS[d] ?? d}
                        </span>
                      ))}
                      <span className="text-xs" style={{ color: '#94a3b8' }}>
                        {String(e.preferred_time_start ?? 9).padStart(2,'0')}:00–{String(e.preferred_time_end ?? 18).padStart(2,'0')}:00
                      </span>
                    </div>
                  )}

                  {e.offered_slot && (
                    <p className="text-xs" style={{ color: '#92400e' }}>
                      Teklif: {new Date(e.offered_slot).toLocaleString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })}
                    </p>
                  )}

                  {e.notes && (
                    <p className="text-xs mt-1 italic" style={{ color: '#94a3b8' }}>{e.notes}</p>
                  )}
                </div>

                <button
                  onClick={() => handleRemove(e.id)}
                  disabled={removing === e.id}
                  className="text-xs px-3 py-1.5 rounded-lg flex-shrink-0 disabled:opacity-50"
                  style={{ background: '#fee2e2', color: '#dc2626' }}
                >
                  {removing === e.id ? '...' : 'Çıkar'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

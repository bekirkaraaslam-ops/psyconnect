'use client'

import { useState, useEffect, useCallback } from 'react'

interface Scale {
  id: string
  slug: string
  name: string
  short_name: string
  description: string
}

interface ScaleResponse {
  id: string
  token: string
  sent_at: string
  filled_at: string | null
  expires_at: string
  total_score: number | null
  interpretation: string | null
  interpretation_color: string | null
  scale: { slug: string; name: string; short_name: string }
}

interface Props {
  hastaId: string
}

function TrendChart({ responses }: { responses: ScaleResponse[] }) {
  const filled = responses
    .filter(r => r.filled_at && r.total_score !== null)
    .slice(0, 8)
    .reverse()

  if (filled.length < 2) return null

  const scores = filled.map(r => r.total_score as number)
  const maxScore = Math.max(...scores)
  const minScore = Math.min(...scores)
  const range = Math.max(maxScore - minScore, 1)

  const W = 280
  const H = 60
  const pad = 10

  const points = scores.map((s, i) => ({
    x: pad + (i / (scores.length - 1)) * (W - 2 * pad),
    y: H - pad - ((s - minScore) / range) * (H - 2 * pad),
  }))

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: '#f1f5f9' }}>
      <p className="text-xs font-medium mb-2" style={{ color: '#94a3b8' }}>SKOR TRENDİ</p>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <path d={path} fill="none" stroke="#4a7c6f" strokeWidth="1.5" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#4a7c6f" />
        ))}
      </svg>
      <div className="flex justify-between text-xs mt-1" style={{ color: '#94a3b8' }}>
        <span>{new Date(filled[0].filled_at!).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
        <span>{new Date(filled[filled.length - 1].filled_at!).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  )
}

export default function OlceklerPanel({ hastaId }: Props) {
  const [responses, setResponses] = useState<ScaleResponse[]>([])
  const [scales, setScales] = useState<Scale[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedScale, setSelectedScale] = useState<string>('')
  const [sending, setSending] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const fetchResponses = useCallback(() => {
    setLoading(true)
    fetch(`/api/patients/${hastaId}/olcekler`)
      .then(r => r.json())
      .then(d => { setResponses(d.responses ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [hastaId])

  useEffect(() => { fetchResponses() }, [fetchResponses])

  useEffect(() => {
    if (!showModal || scales.length > 0) return
    fetch('/api/olcek/scales')
      .then(r => r.json())
      .then(d => setScales(d.scales ?? []))
  }, [showModal, scales.length])

  async function handleSend() {
    if (!selectedScale) return
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/olcek/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: hastaId, scale_id: selectedScale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Hata oluştu.')
      setLink(data.link)
      fetchResponses()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSending(false)
    }
  }

  function copyLink() {
    if (!link) return
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function closeModal() {
    setShowModal(false)
    setSelectedScale('')
    setLink(null)
    setError('')
  }

  const icon = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  )

  // Grupla: her ölçek slug'ı için en son yanıt
  const bySlug = new Map<string, ScaleResponse>()
  responses.forEach(r => {
    const slug = r.scale?.slug
    if (!slug) return
    if (!bySlug.has(slug) || r.sent_at > bySlug.get(slug)!.sent_at) {
      bySlug.set(slug, r)
    }
  })
  const latest = Array.from(bySlug.values())

  const filledResponses = responses.filter(r => r.filled_at)

  return (
    <>
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#dde5e2' }}>
        <div className="px-5 py-3 flex items-center gap-2" style={{ background: '#f8fafc', borderBottom: '1px solid #dde5e2' }}>
          {icon}
          <span className="text-sm font-semibold" style={{ color: '#334155' }}>Psikometrik Ölçekler</span>
          {responses.length > 0 && (
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#e8f5f1', color: '#4a7c6f' }}>
              {filledResponses.length} dolduruldu
            </span>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="ml-auto text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{ background: '#4a7c6f', color: '#ffffff' }}
          >
            + Ölçek Gönder
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <p className="text-sm" style={{ color: '#94a3b8' }}>Yükleniyor…</p>
          ) : latest.length === 0 ? (
            <p className="text-sm" style={{ color: '#94a3b8' }}>Henüz ölçek gönderilmedi.</p>
          ) : (
            <>
              <div className="space-y-2">
                {latest.map(r => {
                  const isExpired = !r.filled_at && new Date(r.expires_at) < new Date()
                  const isWaiting = !r.filled_at && !isExpired
                  return (
                    <div key={r.id} className="flex items-center gap-3 py-2 px-3 rounded-xl" style={{ background: '#f8fafc' }}>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium" style={{ color: '#334155' }}>{r.scale?.short_name}</p>
                        <p className="text-xs" style={{ color: '#94a3b8' }}>
                          {r.filled_at
                            ? new Date(r.filled_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
                            : isWaiting
                            ? 'Bekleniyor'
                            : 'Süresi doldu'}
                        </p>
                      </div>
                      {r.filled_at && r.total_score !== null ? (
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold" style={{ color: r.interpretation_color ?? '#334155' }}>
                            {r.total_score}
                          </p>
                          <p className="text-xs" style={{ color: r.interpretation_color ?? '#64748b' }}>
                            {r.interpretation}
                          </p>
                        </div>
                      ) : (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full shrink-0"
                          style={{
                            background: isWaiting ? '#fef9c3' : '#f1f5f9',
                            color: isWaiting ? '#a16207' : '#94a3b8',
                          }}
                        >
                          {isWaiting ? 'Bekliyor' : 'Doldurmadı'}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Trend grafiği — tek ölçek, birden fazla yanıt varsa */}
              {bySlug.size === 1 && filledResponses.length >= 2 && (
                <TrendChart responses={responses} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl w-full max-w-md p-6" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            {!link ? (
              <>
                <h3 className="text-base font-semibold mb-4" style={{ color: '#334155' }}>Ölçek Gönder</h3>
                <div className="space-y-2 mb-4">
                  {scales.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedScale(s.id)}
                      className="w-full text-left p-3.5 rounded-xl border transition-all"
                      style={{
                        borderColor: selectedScale === s.id ? '#4a7c6f' : '#dde5e2',
                        background: selectedScale === s.id ? '#e8f5f1' : '#ffffff',
                      }}
                    >
                      <p className="text-sm font-medium" style={{ color: '#334155' }}>{s.short_name} — {s.name.replace(s.short_name + ' ', '')}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{s.description}</p>
                    </button>
                  ))}
                </div>
                {error && (
                  <p className="text-sm mb-3" style={{ color: '#dc2626' }}>{error}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium border"
                    style={{ borderColor: '#dde5e2', color: '#64748b' }}
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!selectedScale || sending}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #4a7c6f 0%, #2a5446 100%)' }}
                  >
                    {sending ? 'Oluşturuluyor…' : 'Link Oluştur'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-5">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#dcfce7' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#334155' }}>Link hazır</p>
                  <p className="text-xs mt-1" style={{ color: '#64748b' }}>7 gün geçerli. Danışana gönderin.</p>
                </div>
                <div className="flex gap-2 mb-4">
                  <input
                    readOnly
                    value={link}
                    className="flex-1 px-3 py-2 rounded-xl border text-xs"
                    style={{ borderColor: '#dde5e2', color: '#334155', background: '#f8fafc' }}
                  />
                  <button
                    onClick={copyLink}
                    className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{ background: copied ? '#dcfce7' : '#e8f5f1', color: copied ? '#16a34a' : '#4a7c6f' }}
                  >
                    {copied ? '✓' : 'Kopyala'}
                  </button>
                </div>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Merhaba, lütfen aşağıdaki linke tıklayarak ölçeği doldurunuz:\n${link}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-white mb-2"
                  style={{ background: '#25D366' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp ile Gönder
                </a>
                <button
                  onClick={closeModal}
                  className="w-full py-2.5 rounded-xl text-sm font-medium border"
                  style={{ borderColor: '#dde5e2', color: '#64748b' }}
                >
                  Kapat
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

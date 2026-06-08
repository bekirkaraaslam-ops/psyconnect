'use client'

import { useEffect, useState } from 'react'

interface AnamnezData {
  filled_at: string
  sikayet: string
  sure: string
  gecmis_tedavi: string
  ilac: string
  aile: string
  uyku: string
  beslenme: string
  acil_kisi: string
  ek_notlar: string
}


export default function AnamnezAiOzet({
  formId,
  anamnezData,
}: {
  formId: string
  anamnezData: AnamnezData
}) {
  const [ozet, setOzet] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => { fetchOzet() }, [formId]) // eslint-disable-line

  function fetchOzet() {
    setLoading(true)
    setError('')
    fetch('/api/ai/anamnez-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anamnez_id: formId }),
    })
      .then(r => r.json())
      .then(d => { if (d.ozet) setOzet(d.ozet); else setError(d.error ?? 'Oluşturulamadı.') })
      .catch(() => setError('Bağlantı hatası.'))
      .finally(() => setLoading(false))
  }

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: '1px solid #a7f3d0',
          background: 'linear-gradient(160deg, #ecfdf5 0%, #f0fdf4 100%)',
          boxShadow: '0 2px 12px rgba(74,124,111,0.08)',
        }}
      >
        {/* Başlık */}
        <button
          onClick={() => setCollapsed(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3"
          style={{ borderBottom: collapsed ? 'none' : '1px solid #d1fae5' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #4a7c6f, #6ee7b7)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold" style={{ color: '#065f46' }}>İlk Görüşme Özeti</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>Anamnezden · Seansify AI</p>
            </div>
          </div>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s', flexShrink: 0 }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {!collapsed && (
          <div className="px-4 py-3 space-y-3">
            {loading ? (
              <div className="space-y-2">
                {[100, 85, 90, 70].map((w, i) => (
                  <div key={i} className="h-3 rounded-full" style={{
                    width: `${w}%`,
                    background: 'linear-gradient(90deg, #d1fae5 0%, #a7f3d0 50%, #d1fae5 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.4s ease-in-out infinite',
                    animationDelay: `${i * 0.1}s`,
                  }} />
                ))}
              </div>
            ) : error ? (
              <div className="flex items-start gap-2">
                <p className="text-xs flex-1" style={{ color: '#dc2626' }}>{error}</p>
                <button onClick={fetchOzet} className="text-xs font-medium shrink-0" style={{ color: '#4a7c6f' }}>
                  Tekrar dene
                </button>
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: '#134e4a' }}>{ozet}</p>
            )}

          </div>
        )}
      </div>



      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  )
}

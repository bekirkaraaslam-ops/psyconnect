'use client'

import { useEffect, useState } from 'react'

export default function AnamnezAiOzetKucuk({ formId }: { formId: string }) {
  const [ozet, setOzet] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/ai/anamnez-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anamnez_id: formId }),
    })
      .then(r => r.json())
      .then(d => { if (d.ozet) setOzet(d.ozet); else setError(d.error ?? '') })
      .catch(() => setError('Bağlantı hatası.'))
      .finally(() => setLoading(false))
  }, [formId])

  if (error) return null

  return (
    <div
      className="rounded-xl p-3 mb-1"
      style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
        border: '1px solid #a7f3d0',
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        <span className="text-xs font-semibold" style={{ color: '#065f46' }}>Seansify AI — İlk Görüşme Özeti</span>
      </div>

      {loading ? (
        <div className="space-y-1.5">
          {[100, 80, 90].map((w, i) => (
            <div key={i} className="h-2.5 rounded-full" style={{
              width: `${w}%`,
              background: 'linear-gradient(90deg, #d1fae5 0%, #a7f3d0 50%, #d1fae5 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.12}s`,
            }} />
          ))}
        </div>
      ) : (
        <p className="text-xs leading-relaxed" style={{ color: '#134e4a' }}>{ozet}</p>
      )}

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  description: string
}

export default function LimitReachedModal({ open, onClose, title, description }: Props) {
  const router = useRouter()

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f0fdf4' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h3 className="text-base font-bold text-center mb-1" style={{ color: '#0d1f18' }}>
          {title}
        </h3>
        <p className="text-sm text-center mb-5" style={{ color: '#64748b' }}>
          {description}
        </p>

        <div className="rounded-xl p-4 mb-5" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          <p className="text-xs font-semibold mb-2" style={{ color: '#4a7c6f' }}>Seansify Pro ile:</p>
          <ul className="space-y-1">
            {['Sınırsız hasta kaydı', 'Sınırsız WhatsApp mesajı', 'Sınırsız form gönderimi', 'Tüm seans geçmişi', 'Gelişmiş raporlar'].map(f => (
              <li key={f} className="flex items-center gap-2 text-xs" style={{ color: '#334155' }}>
                <span style={{ color: '#4a7c6f' }}>✓</span> {f}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => router.push('/upgrade')}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-white mb-2 transition-opacity hover:opacity-90"
          style={{ background: '#4a7c6f' }}
        >
          Pro'ya Geç
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl text-sm font-medium"
          style={{ color: '#94a3b8' }}
        >
          Şimdi Değil
        </button>
      </div>
    </div>
  )
}

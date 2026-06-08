'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  featureName?: string
}

export default function UpgradeModal({ open, onClose, featureName }: Props) {
  const router = useRouter()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(13,31,24,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{ backgroundColor: '#ffffff', border: '1px solid #e2ece9' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Kapat */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          style={{ color: '#94a3b8', backgroundColor: '#f1f5f9' }}
          aria-label="Kapat"
        >
          ✕
        </button>

        {/* İkon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-2xl"
          style={{ background: 'linear-gradient(135deg, #4a7c6f, #6ee7b7)' }}
        >
          ✦
        </div>

        {/* Başlık */}
        <h2 className="text-xl font-bold mb-2" style={{ color: '#0d1f18' }}>
          Aylık limitinize ulaştınız
        </h2>
        <p className="text-sm mb-6 leading-relaxed" style={{ color: '#64748b' }}>
          {featureName
            ? `${featureName} özelliği bu ay için doldu.`
            : 'Bu AI özelliği bu ay için doldu.'}{' '}
          <strong style={{ color: '#0d1f18' }}>Seansify Pro</strong> ile tüm AI özelliklerini
          sınırsız kullanın, hiçbir limit olmadan çalışmaya devam edin.
        </p>

        {/* Pro avantajları */}
        <ul className="space-y-2 mb-7">
          {[
            'Sınırsız AI seans ilerleme analizi',
            'Sınırsız psikometrik ölçek yorumu',
            'Sınırsız SOAP notu & anamnez özeti',
            'Sınırsız WhatsApp randevu botu',
          ].map(item => (
            <li key={item} className="flex items-center gap-2 text-sm" style={{ color: '#334155' }}>
              <span style={{ color: '#4a7c6f' }}>✓</span>
              {item}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={() => { onClose(); router.push('/upgrade') }}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #4a7c6f, #6ee7b7)',
            color: '#0d1f18',
          }}
        >
          Pro'ya Yükselt →
        </button>

        <p className="text-center text-xs mt-3" style={{ color: '#94a3b8' }}>
          İptal istediğinizde kolayca durdurabilirsiniz
        </p>
      </div>
    </div>
  )
}

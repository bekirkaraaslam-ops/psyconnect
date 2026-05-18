'use client'

import { useRouter } from 'next/navigation'

interface FeatureLockProps {
  children: React.ReactNode
  isPro?: boolean
  featureName?: string
}

export function FeatureLock({ children, isPro = false, featureName = 'Bu özellik' }: FeatureLockProps) {
  const router = useRouter()

  if (isPro) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none opacity-50 select-none">
        {children}
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center rounded-lg cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.85)' }}
        onClick={() => router.push('/upgrade')}
      >
        <div className="text-center p-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2" style={{ background: '#e8f5f1' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <p className="text-sm font-semibold" style={{ color: '#334155' }}>{featureName}</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>Seansify Pro gerektirir</p>
          <button
            className="mt-3 px-4 py-1.5 text-white text-xs rounded-full transition-opacity hover:opacity-90 pointer-events-auto"
            style={{ background: '#4a7c6f' }}
          >
            Pro'ya Geç
          </button>
        </div>
      </div>
    </div>
  )
}

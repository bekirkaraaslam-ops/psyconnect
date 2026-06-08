'use client'

import { useRouter } from 'next/navigation'

export default function BackButton({ fallback }: { fallback?: string }) {
  const router = useRouter()

  return (
    <button
      onClick={() => fallback ? router.push(fallback) : router.back()}
      className="flex items-center justify-center w-7 h-7 rounded-lg transition-colors hover:bg-gray-100 shrink-0"
      style={{ color: '#94a3b8' }}
      aria-label="Geri"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
      </svg>
    </button>
  )
}

'use client'

import { useEffect, useRef } from 'react'

export default function BlobBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onScroll = () => {
      const progress = Math.min(window.scrollY / 700, 1)
      el.style.opacity = String(0.55 + progress * 0.45)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        opacity: 0.55,
        background: `
          radial-gradient(ellipse 60% 30% at 108% 22%, rgba(74,124,111,0.30) 0%, transparent 65%),
          radial-gradient(ellipse 50% 25% at -8% 48%, rgba(110,231,183,0.20) 0%, transparent 65%),
          radial-gradient(ellipse 55% 28% at 108% 74%, rgba(74,124,111,0.25) 0%, transparent 65%),
          radial-gradient(ellipse 45% 22% at -8% 90%, rgba(110,231,183,0.16) 0%, transparent 65%)
        `,
      }}
    />
  )
}

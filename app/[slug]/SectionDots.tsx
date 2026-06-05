'use client'

import { useEffect, useState } from 'react'

interface Section {
  id: string
  label: string
}

export default function SectionDots({
  sections,
  accentColor = '#4a7c6f',
}: {
  sections: Section[]
  accentColor?: string
}) {
  const [active, setActive] = useState<string>('')
  const [visible, setVisible] = useState<Section[]>([])

  useEffect(() => {
    // Sadece DOM'da var olan section'ları göster
    const present = sections.filter(s => document.getElementById(s.id))
    setVisible(present)
    if (present.length === 0) return

    const ratios = new Map<string, number>()
    const observers: IntersectionObserver[] = []

    present.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return
      const io = new IntersectionObserver(
        ([entry]) => {
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0)
          let best = ''
          let bestR = 0
          ratios.forEach((r, sid) => { if (r > bestR) { bestR = r; best = sid } })
          if (best) setActive(best)
        },
        { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: '-64px 0px 0px 0px' }
      )
      io.observe(el)
      observers.push(io)
    })

    return () => observers.forEach(io => io.disconnect())
  }, [sections])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (visible.length < 2) return null

  return (
    <>
      <style>{`
        .sdots-nav { display: flex; flex-direction: column; gap: 10px; align-items: center; }
        @media (max-width: 900px) { .sdots-nav { display: none !important; } }
        .sdot-wrap { position: relative; display: flex; align-items: center; cursor: pointer; }
        .sdot-tip {
          position: absolute; right: 22px;
          background: rgba(13,31,24,0.85); color: #f8fafc;
          font-size: 11px; font-weight: 600; font-family: system-ui, sans-serif;
          padding: 4px 10px; border-radius: 6px;
          white-space: nowrap; pointer-events: none;
          opacity: 0; transform: translateX(6px);
          transition: opacity 0.18s, transform 0.18s;
        }
        .sdot-wrap:hover .sdot-tip { opacity: 1; transform: translateX(0); }
        .sdot-btn {
          border: none; padding: 0; cursor: pointer; border-radius: 50%;
          transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
          outline: none; display: block;
        }
        .sdot-btn:focus-visible { outline: 2px solid ${accentColor}; outline-offset: 3px; }
      `}</style>
      <nav
        className="sdots-nav"
        aria-label="Sayfa bölümleri"
        style={{
          position: 'fixed',
          right: 18,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 300,
        }}
      >
        {visible.map(({ id, label }) => {
          const isActive = active === id
          return (
            <div key={id} className="sdot-wrap">
              <span className="sdot-tip">{label}</span>
              <button
                className="sdot-btn"
                onClick={() => scrollTo(id)}
                aria-label={label}
                style={{
                  width: isActive ? 11 : 7,
                  height: isActive ? 11 : 7,
                  background: isActive ? accentColor : 'transparent',
                  border: `2px solid ${accentColor}`,
                  opacity: isActive ? 1 : 0.45,
                  boxShadow: isActive ? `0 0 0 3px ${accentColor}28` : 'none',
                }}
              />
            </div>
          )
        })}
      </nav>
    </>
  )
}

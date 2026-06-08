'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Step {
  id: string
  label: string
  description: string
  href: string
  done: boolean
}

interface Props {
  steps: Step[]
}

export default function OnboardingWidget({ steps }: Props) {
  const [open, setOpen] = useState(true)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)

  // Sayfa yüklenince yumuşak slide-in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120)
    return () => clearTimeout(t)
  }, [])

  const doneCount = steps.filter(s => s.done).length
  const allDone = doneCount === steps.length
  const progress = Math.round((doneCount / steps.length) * 100)

  async function handleDismiss() {
    setClosing(true)
    await fetch('/api/setup/complete', { method: 'POST' })
    setTimeout(() => setVisible(false), 280)
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 50,
        width: 300,
        transition: 'opacity 0.28s ease, transform 0.28s ease',
        opacity: visible && !closing ? 1 : 0,
        transform: visible && !closing ? 'translateY(0)' : 'translateY(16px)',
        pointerEvents: visible && !closing ? 'auto' : 'none',
      }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
        }}
      >
        {/* Header */}
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center gap-2.5 px-4 py-3 text-left"
          style={{ background: '#fff' }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: allDone ? '#dcfce7' : '#e8f5f1' }}
          >
            {allDone ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: '#334155' }}>
                {allDone ? 'Her şey hazır!' : 'Başlarken'}
              </span>
              <span className="text-xs font-medium px-1.5 py-0.5 rounded-full" style={{ background: '#f1f5f9', color: '#64748b' }}>
                {doneCount}/{steps.length}
              </span>
            </div>
            <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: '#f1f5f9' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: allDone ? '#16a34a' : '#4a7c6f' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            <button
              onClick={e => { e.stopPropagation(); handleDismiss() }}
              className="w-5 h-5 rounded flex items-center justify-center hover:bg-gray-100 transition-colors"
              title="Kapat"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </button>

        {/* Liste */}
        <div
          style={{
            maxHeight: open ? `${steps.length * 56 + 16}px` : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.32s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <div className="px-3 pb-3 space-y-0.5 border-t" style={{ borderColor: '#f1f5f9' }}>
            {steps.map(step => (
              step.done ? (
                <div key={step.id} className="flex items-center gap-2.5 px-2 py-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: '#4a7c6f' }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span className="text-xs line-through" style={{ color: '#94a3b8' }}>{step.label}</span>
                </div>
              ) : (
                <Link
                  key={step.id}
                  href={step.href}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors hover:bg-slate-50 group"
                >
                  <div className="w-4 h-4 rounded-full border-2 shrink-0" style={{ borderColor: '#dde5e2' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium leading-tight" style={{ color: '#334155' }}>{step.label}</p>
                    <p className="text-xs mt-0.5 leading-tight truncate" style={{ color: '#94a3b8' }}>{step.description}</p>
                  </div>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 group-hover:stroke-slate-400 transition-colors">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

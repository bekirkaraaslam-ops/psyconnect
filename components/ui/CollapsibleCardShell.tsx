'use client'

import { useState } from 'react'

interface Props {
  title: string
  icon?: React.ReactNode
  badge?: React.ReactNode
  action?: React.ReactNode
  extra?: React.ReactNode
  defaultOpen?: boolean
  children: React.ReactNode
  headerBg?: string
}

export default function CollapsibleCardShell({
  title,
  icon,
  badge,
  action,
  extra,
  defaultOpen = true,
  children,
  headerBg = '#f8fafc',
}: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#dde5e2' }}>
      <div
        className="px-5 py-3 flex items-center gap-2 cursor-pointer select-none"
        style={{
          borderBottom: open ? '1px solid #dde5e2' : 'none',
          background: headerBg,
        }}
        onClick={() => setOpen(v => !v)}
      >
        {icon}
        <span className="text-sm font-semibold" style={{ color: '#334155' }}>{title}</span>
        {extra}
        {badge && <span className="ml-auto">{badge}</span>}
        {action && (
          <span
            className={badge ? 'ml-2' : 'ml-auto'}
            onClick={e => e.stopPropagation()}
          >
            {action}
          </span>
        )}
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#94a3b8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={!badge && !action ? 'ml-auto shrink-0' : 'shrink-0'}
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {open && children}
    </div>
  )
}

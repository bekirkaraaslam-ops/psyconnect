'use client'

import { useState } from 'react'

interface Props {
  filledAt: string
  fields: { label: string; value: string }[]
}

export default function AnamnezFormGoster({ filledAt, fields }: Props) {
  const [open, setOpen] = useState(false)

  const filledDate = new Date(filledAt).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl w-full justify-center"
        style={{ background: '#f0f7f5', color: '#4a7c6f', border: '1px solid #d1fae5' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        Formu Görüntüle
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(13,31,24,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div
            className="bg-white rounded-2xl w-full overflow-hidden flex flex-col"
            style={{ maxWidth: '560px', maxHeight: '85vh', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#dde5e2' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#f0f7f5' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: '#334155' }}>Anamnez Formu</h3>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{filledDate} tarihinde dolduruldu</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto p-5 space-y-4">
              {fields.map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-semibold mb-1 tracking-wide" style={{ color: '#94a3b8' }}>{label.toUpperCase()}</p>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: '#334155' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

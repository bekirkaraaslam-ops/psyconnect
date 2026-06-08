'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import PatientCard from './PatientCard'
import { getInitials, formatPhoneDisplay } from '@/lib/utils'

interface Patient {
  id: string
  name_surname: string
  phone_number: string
  date_of_birth: string | null
}

export default function PatientsSearchList({ patients }: { patients: Patient[] }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return patients
      .filter(p =>
        p.name_surname.toLowerCase().includes(q) ||
        p.phone_number.replace(/\D/g, '').includes(q.replace(/\D/g, ''))
      )
      .sort((a, b) => {
        const aStarts = a.name_surname.toLowerCase().startsWith(q) ? 0 : 1
        const bStarts = b.name_surname.toLowerCase().startsWith(q) ? 0 : 1
        return aStarts - bStarts
      })
      .slice(0, 5)
  }, [query, patients])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function highlight(text: string) {
    const q = query.trim()
    if (!q) return <>{text}</>
    const idx = text.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return <>{text}</>
    return (
      <>
        {text.slice(0, idx)}
        <span style={{ color: '#4a7c6f', fontWeight: 600 }}>{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    )
  }

  return (
    <>
      <div ref={wrapperRef} className="relative mb-5 max-w-xs">
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          width="13" height="13" viewBox="0 0 24 24" fill="none"
          stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { if (query) setOpen(true) }}
          placeholder="Danışan ara..."
          className="w-full pl-8 pr-7 py-2 rounded-xl border text-sm outline-none transition-all"
          style={{
            borderColor: query ? '#4a7c6f' : '#e2e8f0',
            background: '#f8fafc',
            color: '#334155',
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false) }} className="absolute right-2.5 top-1/2 -translate-y-1/2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}

        {open && suggestions.length > 0 && (
          <div
            className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-50"
            style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
          >
            {suggestions.map(p => (
              <Link
                key={p.id}
                href={`/patients/${p.id}`}
                className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors"
                onClick={() => { setOpen(false); setQuery('') }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0"
                  style={{ background: '#4a7c6f' }}
                >
                  {getInitials(p.name_surname)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm truncate" style={{ color: '#334155' }}>{highlight(p.name_surname)}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{formatPhoneDisplay(p.phone_number)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {patients.map(patient => (
          <PatientCard key={patient.id} patient={patient} />
        ))}
      </div>
    </>
  )
}

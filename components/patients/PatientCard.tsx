'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatDate, formatPhoneDisplay, getInitials } from '@/lib/utils'

interface Patient {
  id: string
  name_surname: string
  phone_number: string
  date_of_birth: string | null
}

export default function PatientCard({ patient }: { patient: Patient }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await fetch(`/api/patients/${patient.id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="group bg-white rounded-2xl border flex flex-col hover:shadow-md transition-all" style={{ borderColor: '#dde5e2' }}>
      <Link
        href={`/patients/${patient.id}`}
        className="flex items-center gap-4 p-4 rounded-t-2xl hover:bg-gray-50/60 transition-colors"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold text-white shrink-0"
          style={{ background: '#4a7c6f' }}
        >
          {getInitials(patient.name_surname)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate text-[#334155] dark:text-slate-100">
            {patient.name_surname}
          </div>
          <div className="text-xs mt-0.5 text-[#64748b] dark:text-slate-400">
            {formatPhoneDisplay(patient.phone_number)}
          </div>
          {patient.date_of_birth && (
            <div className="text-xs mt-0.5 text-[#94a3b8] dark:text-slate-500">
              {formatDate(patient.date_of_birth)}
            </div>
          )}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0 group-hover:stroke-[#4a7c6f] transition-colors"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>

      {/* Alt çizgi + silme alanı */}
      <div className="flex items-center justify-end px-4 py-2 border-t rounded-b-2xl" style={{ borderColor: '#f1f5f9' }}>
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#64748b' }}>Hastayı silmek istiyor musunuz?</span>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg text-white disabled:opacity-50 transition-opacity"
              style={{ background: '#ef4444' }}
            >
              {deleting ? '...' : 'Evet, Sil'}
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
              style={{ background: '#f1f5f9', color: '#64748b' }}
            >
              İptal
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1.5 text-xs py-1 px-2 rounded-lg transition-colors hover:bg-red-50"
            style={{ color: '#cbd5e1' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            <span className="hover:text-red-400 transition-colors">Sil</span>
          </button>
        )}
      </div>
    </div>
  )
}

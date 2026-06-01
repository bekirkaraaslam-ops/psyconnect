'use client'

import { useState } from 'react'
import LimitReachedModal from '@/components/ui/LimitReachedModal'

export default function PatientsLimitButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
        style={{ background: '#fee2e2', color: '#dc2626' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Limit Doldu
      </button>

      <LimitReachedModal
        open={open}
        onClose={() => setOpen(false)}
        title="Hasta Limitine Ulaştınız"
        description="Seansify One planında en fazla 20 aktif hasta kaydedebilirsiniz. Daha fazla hasta eklemek için Pro'ya geçin."
      />
    </>
  )
}

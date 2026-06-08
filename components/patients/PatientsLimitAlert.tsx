'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import LimitReachedModal from '@/components/ui/LimitReachedModal'

export default function PatientsLimitAlert() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('limit') === 'patients') {
      setOpen(true)
      router.replace(pathname)
    }
  }, [searchParams, router, pathname])

  return (
    <LimitReachedModal
      open={open}
      onClose={() => setOpen(false)}
      title="Danışan Limitine Ulaştınız"
      description="Seansify One planında en fazla 20 aktif danışan kaydedebilirsiniz. Daha fazla danışan eklemek için Pro'ya geçin."
    />
  )
}

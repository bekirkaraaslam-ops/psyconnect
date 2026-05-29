'use client'

import { useState } from 'react'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import AyarlarModal from './AyarlarModal'
import { PlanType } from '@/types'

interface Props {
  planType: PlanType
}

export default function DashboardShell({ planType }: Props) {
  const [ayarlarOpen, setAyarlarOpen] = useState(false)
  const [ayarlarTab, setAyarlarTab] = useState<'profil' | 'klinik'>('profil')

  function openAyarlar(tab: 'profil' | 'klinik' = 'profil') {
    setAyarlarTab(tab)
    setAyarlarOpen(true)
  }

  return (
    <>
      <Sidebar planType={planType} onAyarlarClick={() => openAyarlar('profil')} />
      <MobileNav onAyarlarClick={() => openAyarlar('profil')} />
      <AyarlarModal
        open={ayarlarOpen}
        onClose={() => setAyarlarOpen(false)}
        defaultTab={ayarlarTab}
      />
    </>
  )
}

'use client'

import { useState } from 'react'
import RandevuGecmisiPanel from './RandevuGecmisiPanel'
import AnamnezPanel from './AnamnezPanel'
import OnamPanel from './OnamPanel'
import OlceklerPanel from './OlceklerPanel'
import SeansNotlari from './SeansNotlari'
import PaketPanel from './PaketPanel'
import OdemelerPanel from './OdemelerPanel'

interface Apt {
  id: string
  appointment_date: string
  duration_minutes: number
  status: string
}

interface AnamnezForm {
  id: string
  filled_at: string | null
  expires_at: string
  sikayet_encrypted: string | null
  sure_encrypted: string | null
  gecmis_tedavi_encrypted: string | null
  ilac_kullanim_encrypted: string | null
  aile_gecmis_encrypted: string | null
  uyku_durum_encrypted: string | null
  beslenme_durum_encrypted: string | null
  acil_kisi_encrypted: string | null
  ek_notlar_encrypted: string | null
}

interface OnamForm {
  id: string
  filled_at: string | null
  expires_at: string
  imza_text: string | null
}

interface AnamnezDecrypted {
  filled_at: string
  sikayet: string
  sure: string
  gecmis_tedavi: string
  ilac: string
  aile: string
  uyku: string
  beslenme: string
  acil_kisi: string
  ek_notlar: string
}

interface Props {
  hastaId: string
  hastaAdi: string
  appointments: Apt[]
  anamnezForm: AnamnezForm | null
  anamnezDecrypted: AnamnezDecrypted | null
  onamForm: OnamForm | null
  anamnezEnabled: boolean
}

const TABS = [
  { key: 'genel',        label: 'Genel' },
  { key: 'degerlendirme', label: 'Değerlendirme' },
  { key: 'seans',        label: 'Seans' },
  { key: 'odeme',        label: 'Ödeme' },
]

export default function PatientDetailTabs({
  hastaId,
  hastaAdi,
  appointments,
  anamnezForm,
  anamnezDecrypted,
  onamForm,
  anamnezEnabled,
}: Props) {
  const [active, setActive] = useState('genel')

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex gap-1 p-1 rounded-2xl mb-4"
        style={{ background: '#f1f5f9' }}
      >
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
            style={{
              background: active === tab.key ? '#ffffff' : 'transparent',
              color: active === tab.key ? '#334155' : '#94a3b8',
              boxShadow: active === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Genel: randevu geçmişi */}
      {active === 'genel' && (
        <div className="space-y-4">
          <RandevuGecmisiPanel hastaId={hastaId} appointments={appointments} />
        </div>
      )}

      {/* Değerlendirme: anamnez + onam + ölçekler */}
      {active === 'degerlendirme' && (
        <div className="space-y-4">
          {anamnezEnabled && <AnamnezPanel hastaId={hastaId} form={anamnezForm} decrypted={anamnezDecrypted} />}
          <OnamPanel hastaId={hastaId} form={onamForm} />
          <OlceklerPanel hastaId={hastaId} />
        </div>
      )}

      {/* Seans: notlar + paket */}
      {active === 'seans' && (
        <div className="space-y-4">
          <SeansNotlari hastaId={hastaId} hastaAdi={hastaAdi} />
          <PaketPanel hastaId={hastaId} />
        </div>
      )}

      {/* Ödeme */}
      {active === 'odeme' && (
        <div className="space-y-4">
          <OdemelerPanel hastaId={hastaId} />
        </div>
      )}
    </div>
  )
}

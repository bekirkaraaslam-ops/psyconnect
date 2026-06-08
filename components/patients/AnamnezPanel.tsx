'use client'

import { useState } from 'react'
import CollapsibleCardShell from '@/components/ui/CollapsibleCardShell'
import AnamnezFormGoster from './AnamnezFormGoster'

interface AnamnezForm {
  id: string
  filled_at: string | null
  expires_at: string
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
  form: AnamnezForm | null
  decrypted: AnamnezDecrypted | null
}

const FIELD_LABELS: { key: keyof Omit<AnamnezDecrypted, 'filled_at'>; label: string }[] = [
  { key: 'sikayet',        label: 'Ana Şikayet' },
  { key: 'sure',          label: 'Ne Zamandır Devam Ediyor' },
  { key: 'gecmis_tedavi', label: 'Önceki Psikolojik Destek' },
  { key: 'ilac',          label: 'İlaç Kullanımı' },
  { key: 'aile',          label: 'Aile Geçmişi' },
  { key: 'uyku',          label: 'Uyku Durumu' },
  { key: 'beslenme',      label: 'Beslenme Durumu' },
  { key: 'acil_kisi',     label: 'Acil İletişim Kişisi' },
  { key: 'ek_notlar',     label: 'Ek Notlar' },
]

export default function AnamnezPanel({ hastaId, form, decrypted }: Props) {
  const isPending = !form
  const isExpired = form && !form.filled_at && new Date(form.expires_at) < new Date()
  const isFilled  = form?.filled_at
  const isWaiting = form && !form.filled_at && !isExpired

  const [sending, setSending] = useState(false)
  const [link, setLink] = useState<string | null>(null)
  const [sendError, setSendError] = useState('')

  async function handleResend() {
    setSending(true)
    setSendError('')
    setLink(null)
    const res = await fetch('/api/anamnez/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: hastaId }),
    })
    const d = await res.json()
    setSending(false)
    if (d.link) setLink(d.link)
    else setSendError(d.error ?? 'Gönderilemedi.')
  }

  const icon = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )

  const badge = isFilled ? (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">Dolduruldu</span>
  ) : isWaiting ? (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">Bekleniyor</span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-500">
      {isExpired ? 'Süresi Doldu' : 'Gönderilmedi'}
    </span>
  )

  return (
    <CollapsibleCardShell title="Anamnez Formu" icon={icon} badge={badge} defaultOpen={false}>
      <div className="p-5">
        {!isFilled ? (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              {isWaiting
                ? 'Form linki gönderildi, hasta henüz doldurmadı.'
                : isExpired
                ? 'Form linkinin süresi doldu, hasta doldurmadı.'
                : 'Form henüz gönderilmedi.'}
            </p>
            {!isWaiting && (
              link ? (
                <div className="rounded-lg p-3 border space-y-2" style={{ borderColor: '#d1fae5', background: '#f0fdf4' }}>
                  <p className="text-xs font-medium" style={{ color: '#065f46' }}>Form linki oluşturuldu</p>
                  <p className="text-xs break-all font-mono" style={{ color: '#334155' }}>{link}</p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(link); }}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg"
                    style={{ background: '#dcfce7', color: '#16a34a' }}
                  >
                    Kopyala
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={sending}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
                  style={{ background: '#f0f7f5', color: '#4a7c6f', border: '1px solid #d1fae5' }}
                >
                  {sending ? 'Oluşturuluyor...' : isPending ? 'Form Linki Oluştur' : 'Yeniden Gönder'}
                </button>
              )
            )}
            {sendError && <p className="text-xs" style={{ color: '#dc2626' }}>{sendError}</p>}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              {new Date(form!.filled_at!).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} tarihinde dolduruldu
            </p>
            {decrypted && (
              <AnamnezFormGoster
                filledAt={decrypted.filled_at}
                fields={FIELD_LABELS
                  .map(({ key, label }) => ({ label, value: decrypted[key] }))
                  .filter(f => !!f.value)}
              />
            )}
          </div>
        )}
      </div>
    </CollapsibleCardShell>
  )
}

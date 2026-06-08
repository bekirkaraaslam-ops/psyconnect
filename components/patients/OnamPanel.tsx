'use client'

import { useState } from 'react'
import CollapsibleCardShell from '@/components/ui/CollapsibleCardShell'

interface OnamForm {
  id: string
  filled_at: string | null
  expires_at: string
  imza_text: string | null
}

interface Props {
  hastaId: string
  form: OnamForm | null
}

export default function OnamPanel({ hastaId, form }: Props) {
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
    const res = await fetch('/api/onam/generate', {
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
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )

  const badge = isFilled ? (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">İmzalandı</span>
  ) : isWaiting ? (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">Bekleniyor</span>
  ) : (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-500">
      {isExpired ? 'Süresi Doldu' : 'Gönderilmedi'}
    </span>
  )

  return (
    <CollapsibleCardShell title="Onam Formu" icon={icon} badge={badge} defaultOpen={false}>
      <div className="p-5">
        {!isFilled ? (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              {isWaiting
                ? 'Onam formu linki gönderildi, hasta henüz imzalamadı.'
                : isExpired
                ? 'Form linkinin süresi doldu, hasta imzalamadı.'
                : 'Form henüz gönderilmedi.'}
            </p>
            {!isWaiting && (
              link ? (
                <div className="rounded-lg p-3 border space-y-2" style={{ borderColor: '#d1fae5', background: '#f0fdf4' }}>
                  <p className="text-xs font-medium" style={{ color: '#065f46' }}>Form linki oluşturuldu</p>
                  <p className="text-xs break-all font-mono" style={{ color: '#334155' }}>{link}</p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(link) }}
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
              {new Date(form!.filled_at!).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} tarihinde imzalandı
            </p>
            {form?.imza_text && (
              <div className="rounded-lg px-4 py-3 border" style={{ borderColor: '#dde5e2', background: '#f8fafc' }}>
                <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>DİJİTAL İMZA</p>
                <p className="text-sm font-medium italic" style={{ color: '#334155' }}>{form.imza_text}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </CollapsibleCardShell>
  )
}

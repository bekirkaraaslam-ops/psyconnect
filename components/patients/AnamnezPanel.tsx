import { decrypt } from '@/lib/crypto'
import CollapsibleCardShell from '@/components/ui/CollapsibleCardShell'

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

interface Props {
  form: AnamnezForm | null
}

function safeDecrypt(val: string | null | undefined): string {
  if (!val) return ''
  try { return decrypt(val) } catch { return '' }
}

const FIELD_LABELS: Array<{ key: keyof AnamnezForm; label: string }> = [
  { key: 'sikayet_encrypted',        label: 'Ana Şikayet' },
  { key: 'sure_encrypted',           label: 'Ne Zamandır Devam Ediyor' },
  { key: 'gecmis_tedavi_encrypted',  label: 'Önceki Psikolojik Destek' },
  { key: 'ilac_kullanim_encrypted',  label: 'İlaç Kullanımı' },
  { key: 'aile_gecmis_encrypted',    label: 'Aile Geçmişi' },
  { key: 'uyku_durum_encrypted',     label: 'Uyku Durumu' },
  { key: 'beslenme_durum_encrypted', label: 'Beslenme Durumu' },
  { key: 'acil_kisi_encrypted',      label: 'Acil İletişim Kişisi' },
  { key: 'ek_notlar_encrypted',      label: 'Ek Notlar' },
]

export default function AnamnezPanel({ form }: Props) {
  const isPending  = !form
  const isExpired  = form && !form.filled_at && new Date(form.expires_at) < new Date()
  const isFilled   = form?.filled_at
  const isWaiting  = form && !form.filled_at && !isExpired

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
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            {isWaiting
              ? 'Form linki gönderildi, hasta henüz doldurmadı.'
              : isExpired
              ? 'Form linkinin süresi doldu, hasta doldurmadı.'
              : 'Form henüz gönderilmedi.'}
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              {new Date(form!.filled_at!).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} tarihinde dolduruldu
            </p>
            {FIELD_LABELS.map(({ key, label }) => {
              const value = safeDecrypt(form![key] as string | null)
              if (!value) return null
              return (
                <div key={key}>
                  <p className="text-xs font-medium mb-1" style={{ color: '#94a3b8' }}>{label.toUpperCase()}</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#334155' }}>{value}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </CollapsibleCardShell>
  )
}

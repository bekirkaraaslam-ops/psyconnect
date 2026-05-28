'use client'

import { useState } from 'react'

interface Props {
  token: string
  patientName: string
}

const FIELDS = [
  {
    key: 'sikayet',
    label: 'Ana Şikayetiniz',
    placeholder: 'Neden psikolojik destek almak istiyorsunuz? Kısaca anlatınız.',
    rows: 3,
  },
  {
    key: 'sure',
    label: 'Ne Zamandır Devam Ediyor?',
    placeholder: 'Örn: Yaklaşık 3 aydır, geçen yıldan beri...',
    rows: 2,
  },
  {
    key: 'gecmis_tedavi',
    label: 'Önceki Psikolojik Destek',
    placeholder: 'Daha önce psikolog veya psikiyatrist ile çalıştınız mı? Evet ise ne zaman ve nasıl bir deneyimdi?',
    rows: 3,
  },
  {
    key: 'ilac_kullanim',
    label: 'İlaç Kullanımı',
    placeholder: 'Kullandığınız ilaçlar var mı? Varsa ilaç adı ve dozu.',
    rows: 2,
  },
  {
    key: 'aile_gecmis',
    label: 'Aile Geçmişi',
    placeholder: 'Ailenizde psikolojik/psikiyatrik tanı alan biri var mı?',
    rows: 2,
  },
  {
    key: 'uyku_durum',
    label: 'Uyku Durumunuz',
    placeholder: 'Uyku düzeniniz nasıl? Uykuya dalmada ya da sürdürmede sorun yaşıyor musunuz?',
    rows: 2,
  },
  {
    key: 'beslenme_durum',
    label: 'Beslenme Durumunuz',
    placeholder: 'Beslenme alışkanlıklarınızda belirgin bir değişiklik var mı?',
    rows: 2,
  },
  {
    key: 'acil_kisi',
    label: 'Acil İletişim Kişisi',
    placeholder: 'Ad Soyad — Telefon numarası — Yakınlık derecesi',
    rows: 2,
  },
  {
    key: 'ek_notlar',
    label: 'Eklemek İstedikleriniz',
    placeholder: 'Psikoloğunuzun bilmesini istediğiniz başka bir şey var mı?',
    rows: 3,
  },
]

export default function AnamnezFormClient({ token, patientName }: Props) {
  const firstName = patientName.split(' ')[0]
  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(FIELDS.map(f => [f.key, '']))
  )
  const [acikRiza, setAcikRiza] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function handleChange(key: string, val: string) {
    setForm(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')

    const res = await fetch('/api/anamnez/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...form, acik_riza: acikRiza }),
    })

    if (res.ok) {
      setStatus('done')
    } else {
      const data = await res.json().catch(() => ({}))
      setErrorMsg(data.error ?? 'Bir hata oluştu, lütfen tekrar deneyin.')
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
        <div className="bg-white rounded-2xl border p-8 max-w-md w-full text-center" style={{ borderColor: '#dde5e2' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#f0fdf4' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2" style={{ color: '#334155' }}>Teşekkürler, {firstName}!</h2>
          <p className="text-sm" style={{ color: '#64748b' }}>
            Formunuz başarıyla iletildi. Psikoloğunuz görüşmeden önce bilgilerinizi inceleyecek.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#f8fafc' }}>
      <div className="max-w-lg mx-auto space-y-5">
        {/* Başlık */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#4a7c6f' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold" style={{ color: '#334155' }}>Ön Bilgi Formu</h1>
          <p className="text-sm mt-1" style={{ color: '#64748b' }}>
            Merhaba {firstName}, psikoloğunuzun sizi daha iyi tanıyabilmesi için lütfen aşağıdaki formu doldurunuz.
          </p>
        </div>

        {status === 'error' && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {FIELDS.map(field => (
            <div key={field.key} className="bg-white rounded-xl border p-4" style={{ borderColor: '#dde5e2' }}>
              <label className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>
                {field.label}
              </label>
              <textarea
                value={form[field.key]}
                onChange={e => handleChange(field.key, e.target.value)}
                rows={field.rows}
                placeholder={field.placeholder}
                className="w-full text-sm outline-none resize-none"
                style={{ color: '#334155' }}
              />
            </div>
          ))}

          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#dde5e2' }}>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={acikRiza}
                onChange={e => setAcikRiza(e.target.checked)}
                className="mt-0.5 shrink-0"
                style={{ accentColor: '#4a7c6f', width: 16, height: 16 }}
              />
              <span className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
                KVKK kapsamında kişisel ve sağlık verilerimin psikolojik danışmanlık hizmeti sunulması amacıyla işlenmesine{' '}
                <strong style={{ color: '#334155' }}>açık rıza</strong> veriyorum.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={status === 'loading' || !acikRiza}
            className="w-full py-3 rounded-xl text-sm font-medium text-white disabled:opacity-60"
            style={{ background: '#4a7c6f' }}
          >
            {status === 'loading' ? 'Gönderiliyor...' : 'Formu Gönder'}
          </button>

          <p className="text-center text-xs pb-6" style={{ color: '#94a3b8' }}>
            Bilgileriniz şifreli olarak saklanır ve yalnızca psikoloğunuz tarafından görülebilir.
          </p>
        </form>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

interface FormData {
  patientName: string
  status: 'loading' | 'ready' | 'invalid' | 'expired' | 'filled'
}

const ONAM_METNI = `Bu onam formu, psikolojik danışmanlık/terapi sürecinin başlamadan önce danışan tarafından okunup kabul edilmesi gereken bilgileri içermektedir.

GİZLİLİK: Seanslar sırasında paylaşılan bilgiler gizli tutulacaktır. Yalnızca yasal zorunluluk (mahkeme kararı), kendinize veya başkasına yönelik ciddi zarar riski durumunda gizlilik ihlal edilebilir.

SEANS SÜRECİ: Seans süresi, sıklığı ve süreci hakkında psikolog ile birlikte karar verilecektir. Herhangi bir anda danışmanlık sürecini sonlandırma hakkınız mevcuttur.

İPTAL POLİTİKASI: Randevularınızı en az 24 saat öncesinde iptal etmeniz beklenmektedir. Geç iptal veya gelmeme durumunda seans ücreti talep edilebilir.

ONAY: Bu formu imzalayarak yukarıdaki koşulları okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz.`

export default function OnamPage() {
  const { token } = useParams<{ token: string }>()
  const [data, setData] = useState<FormData>({ patientName: '', status: 'loading' })
  const [imza, setImza] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/onam/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'ready') setData({ patientName: d.patientName, status: 'ready' })
        else setData({ patientName: '', status: d.status ?? 'invalid' })
      })
      .catch(() => setData({ patientName: '', status: 'invalid' }))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imza.trim()) { setError('Lütfen adınızı ve soyadınızı yazarak imzalayın.'); return }
    setSubmitting(true)
    setError('')
    const res = await fetch(`/api/onam/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imza_text: imza.trim() }),
    })
    setSubmitting(false)
    if (res.ok) {
      setSubmitted(true)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Bir hata oluştu.')
    }
  }

  if (data.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f8fafc' }}>
        <div className="text-sm" style={{ color: '#4a7c6f' }}>Yükleniyor...</div>
      </div>
    )
  }

  if (data.status !== 'ready') {
    const messages: Record<string, { title: string; sub: string }> = {
      invalid:  { title: 'Bu link geçersiz.',       sub: 'Lütfen psikoloğunuzla iletişime geçin.' },
      expired:  { title: 'Bu linkin süresi dolmuş.', sub: 'Lütfen psikoloğunuzla iletişime geçin.' },
      filled:   { title: 'Bu form daha önce doldurulmuş.', sub: 'Teşekkür ederiz!' },
    }
    const msg = messages[data.status] ?? messages.invalid
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
        <div className="bg-white rounded-2xl border p-8 max-w-sm w-full text-center" style={{ borderColor: '#dde5e2' }}>
          <p className="text-sm font-medium" style={{ color: '#334155' }}>{msg.title}</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>{msg.sub}</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f8fafc' }}>
        <div className="bg-white rounded-2xl border p-8 max-w-sm w-full text-center" style={{ borderColor: '#dde5e2' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#dcfce7' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p className="text-base font-semibold mb-1" style={{ color: '#334155' }}>Onam formu imzalandı</p>
          <p className="text-sm" style={{ color: '#64748b' }}>Teşekkür ederiz, {data.patientName}. İlk seansınızda görüşmek üzere!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: '#f8fafc' }}>
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ background: '#e8f5f1' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold mb-1" style={{ color: '#0d1f18' }}>Bilgilendirilmiş Onam Formu</h1>
          {data.patientName && (
            <p className="text-sm" style={{ color: '#64748b' }}>Merhaba, {data.patientName}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Onam metni */}
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#dde5e2' }}>
            <h2 className="text-sm font-semibold mb-3" style={{ color: '#334155' }}>Danışmanlık Süreci Hakkında Bilgilendirme</h2>
            <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#475569' }}>
              {ONAM_METNI}
            </div>
          </div>

          {/* İmza alanı */}
          <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#dde5e2' }}>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#334155' }}>
              Dijital İmza
            </label>
            <p className="text-xs mb-3" style={{ color: '#64748b' }}>
              Yukarıdaki bilgileri okuduğumu, anladığımı ve kabul ettiğimi beyan etmek için ad ve soyadımı aşağıya yazıyorum.
            </p>
            <input
              type="text"
              required
              value={imza}
              onChange={e => setImza(e.target.value)}
              placeholder="Ad Soyad"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
              style={{ borderColor: '#dde5e2', color: '#334155', fontStyle: 'italic' }}
            />
            {error && <p className="text-xs mt-2" style={{ color: '#ef4444' }}>{error}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting || !imza.trim()}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: '#4a7c6f' }}
          >
            {submitting ? 'Gönderiliyor...' : 'Onam Formunu İmzala'}
          </button>
        </form>
      </div>
    </div>
  )
}

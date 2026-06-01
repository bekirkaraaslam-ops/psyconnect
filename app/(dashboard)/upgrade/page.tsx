'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

declare global {
  interface Window {
    LemonSqueezy: {
      Url: {
        Open: (url: string) => void
      }
    }
  }
}

const plans: { key: string; name: string; price: string; description: string; features: string[]; limits: string[]; highlight: boolean }[] = [
  {
    key: 'one',
    name: 'Seansify One',
    price: '749',
    description: 'Tüm özellikler, küçük pratikler için',
    features: [
      'Randevu takvimi',
      'Seans notları (son 90 gün)',
      'Anamnez & onam formları',
      'Hasta profil sayfası',
      'Blog yazısı (5 adet)',
      'Danışan değerlendirme sistemi',
      'WhatsApp hatırlatıcı (60/ay)',
    ],
    limits: [
      '20 aktif hasta',
      '15 form/ay',
      'Son 3 ay raporu',
    ],
    highlight: false,
  },
  {
    key: 'pro',
    name: 'Seansify Pro',
    price: '1.850',
    description: 'Sınırsız her şey, tam WhatsApp otomasyonu',
    features: [
      'Sınırsız hasta kaydı',
      'Tüm seans geçmişi',
      'Sınırsız form gönderimi',
      'Sınırsız WhatsApp mesajı',
      'Otomatik randevu asistanı',
      'Sınırsız blog yazısı',
      'Tam rapor geçmişi',
      'Bekleme listesi otomasyonu',
      'Öncelikli destek',
    ],
    limits: [],
    highlight: true,
  },
]

function UpgradeContent() {
  const searchParams = useSearchParams()
  const [referralCode, setReferralCode] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setReferralCode(ref.toUpperCase())
  }, [searchParams])

  async function handleCheckout(planType: string) {
    setLoading(planType)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType, referralCode: referralCode.trim() || undefined }),
      })

      const data = await res.json()

      if (!res.ok || !data.url) {
        setError(data.error || 'Ödeme sayfası oluşturulamadı. Lütfen tekrar deneyin.')
        return
      }

      const embedUrl = data.url + (data.url.includes('?') ? '&' : '?') + 'embed=1'

      if (typeof window !== 'undefined' && (window as any).LemonSqueezy) {
        (window as any).LemonSqueezy.Url.Open(embedUrl)
      } else {
        window.location.href = data.url
      }
    } catch {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex-1">
      <header className="h-16 border-b flex items-center px-6" style={{ background: '#ffffff', borderColor: '#dde5e2' }}>
        <h1 className="text-lg font-semibold" style={{ color: '#334155' }}>Plan Seç</h1>
      </header>

      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#334155' }}>
            Seansify ile daha verimli çalış
          </h2>
          <p className="text-sm" style={{ color: '#64748b' }}>
            İhtiyacına uygun planı seç, istediğin zaman iptal et.
          </p>
        </div>

        {/* Referral kodu alanı */}
        <div className="bg-white rounded-2xl border p-5 mb-6" style={{ borderColor: '#dde5e2' }}>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>
            Referral Kodu (opsiyonel)
          </label>
          <input
            type="text"
            value={referralCode}
            onChange={e => setReferralCode(e.target.value.toUpperCase())}
            placeholder="XXXXXXXX"
            maxLength={8}
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none font-mono tracking-widest"
            style={{ borderColor: '#dde5e2', color: '#334155' }}
          />
          <p className="text-xs mt-1.5" style={{ color: '#94a3b8' }}>
            Referral kodu girerseniz ilk ay %10 indirim kazanırsınız.
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
            {error}
          </div>
        )}

        {/* Plan kartları */}
        <div className="grid md:grid-cols-2 gap-5">
          {plans.map(plan => (
            <div
              key={plan.key}
              className="bg-white rounded-2xl border overflow-hidden"
              style={{
                borderColor: plan.highlight ? '#4a7c6f' : '#dde5e2',
                boxShadow: plan.highlight ? '0 0 0 2px #4a7c6f22' : undefined,
              }}
            >
              {plan.highlight && (
                <div className="text-center text-xs font-semibold text-white py-1.5" style={{ background: '#4a7c6f' }}>
                  En Popüler
                </div>
              )}

              <div className="p-6">
                <h3 className="font-bold text-lg mb-1" style={{ color: '#334155' }}>{plan.name}</h3>
                <p className="text-xs mb-4" style={{ color: '#64748b' }}>{plan.description}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-bold" style={{ color: '#334155' }}>{plan.price} ₺</span>
                  <span className="text-sm" style={{ color: '#94a3b8' }}>/ay</span>
                </div>

                <ul className="space-y-2.5 mb-4">
                  {plan.features.map(feature => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ color: '#334155' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limits.length > 0 && (
                  <ul className="space-y-1.5 mb-5 pl-1">
                    {plan.limits.map(limit => (
                      <li key={limit} className="flex items-center gap-2 text-xs" style={{ color: '#94a3b8' }}>
                        <span>·</span> {limit}
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  onClick={() => handleCheckout(plan.key)}
                  disabled={loading !== null}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
                  style={
                    plan.highlight
                      ? { background: '#4a7c6f', color: 'white' }
                      : { background: '#f1f5f9', color: '#334155' }
                  }
                >
                  {loading === plan.key ? 'Yönlendiriliyor...' : `${plan.name} Seç`}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#94a3b8' }}>
          Ödeme Lemon Squeezy altyapısı ile güvenle işlenir. İstediğin zaman iptal edebilirsin.
        </p>
      </div>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={null}>
      <UpgradeContent />
    </Suspense>
  )
}

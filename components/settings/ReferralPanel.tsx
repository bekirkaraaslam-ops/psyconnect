'use client'

import { useEffect, useState } from 'react'
import { REFERRAL_RULES } from '@/lib/referral-rules'
import { PlanType } from '@/types'

interface ReferralData {
  referralCode: string
  planType: PlanType
  discountPercent: number
  activeCount: number
  shareUrl: string
  referrals: Array<{
    id: string
    status: 'pending' | 'active' | 'cancelled'
    created_at: string
    referred: { full_name: string } | null
  }>
}

export default function ReferralPanel() {
  const [data, setData] = useState<ReferralData | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/referral/stats')
      .then(r => r.json())
      .then(setData)
      .catch(() => null)
  }, [])

  if (!data || (data.planType as string) === 'free') {
    return (
      <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#dde5e2' }}>
        <h3 className="font-semibold mb-3" style={{ color: '#334155' }}>Referral Programı</h3>
        <p className="text-sm" style={{ color: '#64748b' }}>
          Referral programından yararlanmak için bir plan satın alman gerekiyor.
        </p>
        <a
          href="/upgrade"
          className="inline-block mt-3 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: '#4a7c6f' }}
        >
          Plan Seç
        </a>
      </div>
    )
  }

  const rules = data.planType !== 'free' ? REFERRAL_RULES[data.planType as 'pro' | 'baslangic'] : null

  function handleCopy() {
    navigator.clipboard.writeText(data!.shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusLabel = (status: string) => {
    if (status === 'active') return { label: 'Aktif', color: '#16a34a', bg: '#dcfce7' }
    if (status === 'pending') return { label: 'Bekliyor', color: '#d97706', bg: '#fef3c7' }
    return { label: 'İptal', color: '#dc2626', bg: '#fee2e2' }
  }

  return (
    <div className="bg-white rounded-2xl border p-5 space-y-5" style={{ borderColor: '#dde5e2' }}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold" style={{ color: '#334155' }}>Referral Programı</h3>
        {data.discountPercent > 0 && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: '#e8f5f1', color: '#4a7c6f' }}>
            %{data.discountPercent} indirim aktif
          </span>
        )}
      </div>

      {/* Referral linki */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: '#64748b' }}>
          Referral Linkin
        </label>
        <div className="flex gap-2">
          <input
            readOnly
            value={data.shareUrl}
            className="flex-1 px-3 py-2 rounded-lg border text-xs outline-none truncate"
            style={{ borderColor: '#dde5e2', color: '#334155', background: '#f8fafb' }}
          />
          <button
            onClick={handleCopy}
            className="px-3 py-2 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90 shrink-0"
            style={{ background: '#4a7c6f' }}
          >
            {copied ? 'Kopyalandı!' : 'Kopyala'}
          </button>
        </div>
        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
          Referral kodun: <span className="font-mono font-semibold">{data.referralCode}</span>
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-3 text-center" style={{ background: '#f8fafb', border: '1px solid #dde5e2' }}>
          <div className="text-xl font-bold" style={{ color: '#4a7c6f' }}>{data.activeCount}</div>
          <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>Aktif Referans</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: '#f8fafb', border: '1px solid #dde5e2' }}>
          <div className="text-xl font-bold" style={{ color: '#4a7c6f' }}>%{data.discountPercent}</div>
          <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>Mevcut İndirim</div>
        </div>
        <div className="rounded-xl p-3 text-center" style={{ background: '#f8fafb', border: '1px solid #dde5e2' }}>
          <div className="text-xl font-bold" style={{ color: '#4a7c6f' }}>
            {rules ? rules.freeThreshold - data.activeCount > 0 ? rules.freeThreshold - data.activeCount : 0 : '-'}
          </div>
          <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>Ücretsiz için kalan</div>
        </div>
      </div>

      {/* Kural açıklaması */}
      {rules && (
        <div className="rounded-xl p-3 text-xs" style={{ background: '#f0f9f6', color: '#4a7c6f' }}>
          Her aktif referans için <strong>%{rules.discountPerReferral} indirim</strong> kazanırsın.
          {rules.freeThreshold} aktif referansta plan tamamen <strong>ücretsiz</strong> olur.
        </div>
      )}

      {/* Referral listesi */}
      {data.referrals.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-2" style={{ color: '#64748b' }}>Davet Ettiklerin</h4>
          <div className="space-y-2">
            {data.referrals.map(ref => {
              const s = statusLabel(ref.status)
              return (
                <div
                  key={ref.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ background: '#f8fafb', border: '1px solid #dde5e2' }}
                >
                  <span className="text-sm" style={{ color: '#334155' }}>
                    {ref.referred?.full_name || 'Kullanıcı'}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

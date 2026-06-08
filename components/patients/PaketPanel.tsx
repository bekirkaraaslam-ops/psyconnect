'use client'

import { useState, useEffect, useCallback } from 'react'
import CollapsibleCardShell from '@/components/ui/CollapsibleCardShell'

interface Paket {
  id: string
  birim_fiyat: number
  kullanilan_seans: number
  toplam_seans: number
  aktif: boolean
}

export default function PaketPanel({ hastaId }: { hastaId: string }) {
  const [paket, setPaket] = useState<Paket | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ toplam_seans: '', birim_fiyat: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchPaket = useCallback(async () => {
    const res = await fetch(`/api/patients/${hastaId}/paket`)
    const d = await res.json()
    setPaket(d.paket ?? null)
    setLoading(false)
  }, [hastaId])

  useEffect(() => { fetchPaket() }, [fetchPaket])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch(`/api/patients/${hastaId}/paket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toplam_seans: Number(form.toplam_seans), birim_fiyat: Number(form.birim_fiyat) }),
    })
    setSaving(false)
    if (!res.ok) {
      const d = await res.json()
      setError(d.error ?? 'Bir hata oluştu.')
      return
    }
    setShowForm(false)
    setForm({ toplam_seans: '', birim_fiyat: '' })
    fetchPaket()
  }

  if (loading) return null

  const kalan = paket ? paket.toplam_seans - paket.kullanilan_seans : 0
  const yuzde = paket ? Math.round((paket.kullanilan_seans / paket.toplam_seans) * 100) : 0

  const action = (
    <button
      onClick={() => setShowForm(v => !v)}
      className="text-xs px-3 py-1.5 rounded-lg font-medium"
      style={{ background: '#f0fdf4', color: '#4a7c6f' }}
    >
      {showForm ? 'İptal' : paket ? 'Yeni Paket' : '+ Paket Ekle'}
    </button>
  )

  return (
    <CollapsibleCardShell title="Seans Paketi" action={action} defaultOpen={true}>
      <div className="p-5">

      {paket ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: '#64748b' }}>Kullanılan / Toplam</span>
            <span className="font-semibold" style={{ color: '#334155' }}>
              {paket.kullanilan_seans} / {paket.toplam_seans} seans
            </span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ background: '#f1f5f9' }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${yuzde}%`,
                background: kalan <= 3 ? '#f59e0b' : '#4a7c6f',
              }}
            />
          </div>
          <div className="flex items-center justify-between text-xs" style={{ color: '#94a3b8' }}>
            <span>{kalan} seans kaldı</span>
            <span>₺{paket.birim_fiyat}/seans</span>
          </div>
          {kalan <= 3 && (
            <div className="px-3 py-2 rounded-lg text-xs" style={{ background: '#fef3c7', color: '#92400e' }}>
              {kalan === 0 ? 'Paket bitti — yeni paket ekleyin.' : `${kalan} seans kaldı — yeni paket eklemeyi unutmayın.`}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm" style={{ color: '#94a3b8' }}>Bu hasta için aktif paket bulunmuyor.</p>
      )}

      {showForm && (
        <form onSubmit={handleSave} className="mt-4 pt-4 border-t space-y-3" style={{ borderColor: '#f1f5f9' }}>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={{ color: '#334155' }}>Toplam Seans</label>
              <input
                type="number"
                min="1"
                required
                value={form.toplam_seans}
                onChange={e => setForm(p => ({ ...p, toplam_seans: e.target.value }))}
                placeholder="Örn: 4"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: '#dde5e2', color: '#334155' }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1" style={{ color: '#334155' }}>Seans Ücreti (₺)</label>
              <input
                type="number"
                min="0"
                required
                value={form.birim_fiyat}
                onChange={e => setForm(p => ({ ...p, birim_fiyat: e.target.value }))}
                placeholder="Örn: 800"
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ borderColor: '#dde5e2', color: '#334155' }}
              />
            </div>
          </div>
          {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 rounded-lg text-sm font-medium text-white disabled:opacity-60"
            style={{ background: '#4a7c6f' }}
          >
            {saving ? 'Kaydediliyor...' : 'Paketi Başlat'}
          </button>
        </form>
      )}
      </div>
    </CollapsibleCardShell>
  )
}

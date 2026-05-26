'use client'
import { useState, useEffect, useCallback } from 'react'
import CollapsibleCardShell from '@/components/ui/CollapsibleCardShell'

interface AptRow {
  id: string
  appointment_date: string
  ucret: number
  odeme_durumu: string
  odeme_tarihi: string | null
  status: string
}

interface OdemeRow {
  id: string
  tutar: number
  aciklama: string | null
  odeme_tarihi: string
  appointment_id: string | null
}

interface Props {
  hastaId: string
}

export default function OdemelerPanel({ hastaId }: Props) {
  const [apts, setApts] = useState<AptRow[]>([])
  const [odemeler, setOdemeler] = useState<OdemeRow[]>([])
  const [totalBekleyen, setTotalBekleyen] = useState(0)
  const [totalOdenen, setTotalOdenen] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ tutar: '', aciklama: '', appointment_id: '' })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(() => {
    setLoading(true)
    fetch(`/api/patients/${hastaId}/odemeler`)
      .then(r => r.json())
      .then(d => {
        setApts(d.appointments ?? [])
        setOdemeler(d.odemeler ?? [])
        setTotalBekleyen(d.totalBekleyen ?? 0)
        setTotalOdenen(d.totalOdenen ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [hastaId])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleAddOdeme(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch(`/api/patients/${hastaId}/odemeler`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tutar: form.tutar,
        aciklama: form.aciklama || null,
        appointment_id: form.appointment_id || null,
      }),
    })
    setForm({ tutar: '', aciklama: '', appointment_id: '' })
    setShowForm(false)
    setSaving(false)
    fetchData()
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' })

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Istanbul' })

  const hasData = apts.length > 0 || odemeler.length > 0

  const odemelerIcon = (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )
  const odemelerAction = (
    <button
      onClick={() => setShowForm(v => !v)}
      className="text-xs px-2.5 py-1 rounded-lg font-medium text-white"
      style={{ background: '#4a7c6f' }}
    >
      + Ödeme Ekle
    </button>
  )

  return (
    <CollapsibleCardShell title="Ödemeler" icon={odemelerIcon} action={odemelerAction} defaultOpen={false}>

      {/* Özet kartlar */}
      <div className="grid grid-cols-2 gap-3 p-4 border-b" style={{ borderColor: '#f1f5f9' }}>
        <div className="rounded-xl p-3" style={{ background: '#fef3c7' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#92400e' }}>Bekleyen</p>
          <p className="text-xl font-bold" style={{ color: '#b45309' }}>₺{totalBekleyen.toLocaleString('tr-TR')}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: '#dcfce7' }}>
          <p className="text-xs font-medium mb-0.5" style={{ color: '#166534' }}>Toplam Ödenen</p>
          <p className="text-xl font-bold" style={{ color: '#16a34a' }}>₺{totalOdenen.toLocaleString('tr-TR')}</p>
        </div>
      </div>

      {/* Ödeme ekleme formu */}
      {showForm && (
        <form onSubmit={handleAddOdeme} className="px-4 py-3 border-b space-y-2" style={{ borderColor: '#f1f5f9', background: '#fafafa' }}>
          <p className="text-xs font-semibold" style={{ color: '#334155' }}>Yeni Ödeme Kaydet</p>
          <div className="flex gap-2">
            <input
              type="number"
              required
              min="1"
              value={form.tutar}
              onChange={e => setForm(p => ({ ...p, tutar: e.target.value }))}
              placeholder="Tutar (₺)"
              className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#dde5e2' }}
            />
            <input
              type="text"
              value={form.aciklama}
              onChange={e => setForm(p => ({ ...p, aciklama: e.target.value }))}
              placeholder="Açıklama (opsiyonel)"
              className="flex-1 px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#dde5e2' }}
            />
          </div>
          {apts.filter(a => a.odeme_durumu === 'bekliyor').length > 0 && (
            <select
              value={form.appointment_id}
              onChange={e => setForm(p => ({ ...p, appointment_id: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#dde5e2', color: '#334155' }}
            >
              <option value="">— Randevuya bağla (opsiyonel) —</option>
              {apts.filter(a => a.odeme_durumu === 'bekliyor').map(a => (
                <option key={a.id} value={a.id}>
                  {fmtDate(a.appointment_date)} {fmtTime(a.appointment_date)} — ₺{a.ucret}
                </option>
              ))}
            </select>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
              style={{ background: '#4a7c6f' }}
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 rounded-lg text-xs"
              style={{ background: '#f1f5f9', color: '#64748b' }}
            >
              İptal
            </button>
          </div>
        </form>
      )}

      <div className="p-4">
        {loading ? (
          <p className="text-sm text-center py-4" style={{ color: '#94a3b8' }}>Yükleniyor...</p>
        ) : !hasData ? (
          <p className="text-sm text-center py-4" style={{ color: '#94a3b8' }}>Henüz ödeme kaydı yok.</p>
        ) : (
          <div className="space-y-4">
            {/* Randevu bazlı ücretler */}
            {apts.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: '#94a3b8' }}>Randevu Ücretleri</p>
                <div className="space-y-1.5">
                  {apts.map(a => (
                    <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: '#f8fafc' }}>
                      <div>
                        <p className="text-xs font-medium" style={{ color: '#334155' }}>
                          {fmtDate(a.appointment_date)} · {fmtTime(a.appointment_date)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold" style={{ color: '#334155' }}>₺{a.ucret?.toLocaleString('tr-TR')}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          a.odeme_durumu === 'odendi' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {a.odeme_durumu === 'odendi' ? 'Ödendi' : 'Bekliyor'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ödeme geçmişi */}
            {odemeler.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: '#94a3b8' }}>Ödeme Geçmişi</p>
                <div className="space-y-1.5">
                  {odemeler.map(o => (
                    <div key={o.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: '#f0fdf4' }}>
                      <div>
                        <p className="text-xs font-medium" style={{ color: '#334155' }}>
                          {fmtDate(o.odeme_tarihi)}
                        </p>
                        {o.aciklama && (
                          <p className="text-xs" style={{ color: '#64748b' }}>{o.aciklama}</p>
                        )}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: '#16a34a' }}>+₺{o.tutar?.toLocaleString('tr-TR')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CollapsibleCardShell>
  )
}

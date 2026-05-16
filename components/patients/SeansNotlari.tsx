'use client'

import { useState, useEffect, useCallback } from 'react'

interface NotOzet {
  id: string
  seans_tarihi: string
}

interface NotDetay {
  id: string
  seans_tarihi: string
  seans_notu: string
  gelecek_plan: string
  ev_odevi: string
}

interface Props {
  hastaId: string
  hastaAdi: string
}

export default function SeansNotlari({ hastaId, hastaAdi }: Props) {
  const [notlar, setNotlar] = useState<NotOzet[]>([])
  const [secilenId, setSecilenId] = useState<string | null>(null)
  const [detay, setDetay] = useState<NotDetay | null>(null)
  const [loading, setLoading] = useState(true)
  const [detayLoading, setDetayLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [sendError, setSendError] = useState('')
  const [form, setForm] = useState({ seans_tarihi: '', seans_notu: '', gelecek_plan: '', ev_odevi: '' })
  const [yeniMode, setYeniMode] = useState(false)
  const [error, setError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const fetchNotlar = useCallback(async () => {
    setLoading(true)
    const res = await fetch(`/api/hasta-notlari?hasta_id=${hastaId}`)
    const data = await res.json()
    setNotlar(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [hastaId])

  useEffect(() => { fetchNotlar() }, [fetchNotlar])

  async function fetchDetay(id: string) {
    setDetayLoading(true)
    setSecilenId(id)
    setYeniMode(false)
    setSaveSuccess(false)
    setSendSuccess(false)
    setSendError('')
    const res = await fetch(`/api/hasta-notlari/${id}`)
    const data = await res.json()
    setDetay(data)
    setForm({
      seans_tarihi: data.seans_tarihi ? new Date(data.seans_tarihi).toISOString().slice(0, 16) : '',
      seans_notu: data.seans_notu ?? '',
      gelecek_plan: data.gelecek_plan ?? '',
      ev_odevi: data.ev_odevi ?? '',
    })
    setDetayLoading(false)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaveSuccess(false)

    const body = {
      hasta_id: hastaId,
      seans_tarihi: new Date(form.seans_tarihi).toISOString(),
      seans_notu: form.seans_notu,
      gelecek_plan: form.gelecek_plan,
      ev_odevi: form.ev_odevi,
    }

    let res: Response
    if (yeniMode) {
      res = await fetch('/api/hasta-notlari', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    } else {
      res = await fetch(`/api/hasta-notlari/${secilenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    }

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Bir hata oluştu.')
      setSaving(false)
      return
    }

    const data = await res.json()
    setSaveSuccess(true)
    setSaving(false)

    if (yeniMode) {
      setYeniMode(false)
      setSecilenId(data.id)
      await fetchNotlar()
      await fetchDetay(data.id)
    } else {
      await fetchNotlar()
    }
  }

  async function handleDelete() {
    if (!secilenId || !confirm('Bu seans notunu silmek istediğinize emin misiniz?')) return
    await fetch(`/api/hasta-notlari/${secilenId}`, { method: 'DELETE' })
    setSecilenId(null)
    setDetay(null)
    setForm({ seans_tarihi: '', seans_notu: '', gelecek_plan: '', ev_odevi: '' })
    await fetchNotlar()
  }

  async function handleSendHomework() {
    setSending(true)
    setSendSuccess(false)
    setSendError('')
    const res = await fetch('/api/hasta-notlari/send-homework', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nota_id: secilenId }),
    })
    if (res.ok) {
      setSendSuccess(true)
    } else {
      const data = await res.json()
      setSendError(data.error ?? 'Gönderilemedi.')
    }
    setSending(false)
  }

  function handleYeni() {
    setYeniMode(true)
    setSecilenId(null)
    setDetay(null)
    setSaveSuccess(false)
    setSendSuccess(false)
    setSendError('')
    const now = new Date()
    now.setMinutes(0, 0, 0)
    setForm({
      seans_tarihi: now.toISOString().slice(0, 16),
      seans_notu: '',
      gelecek_plan: '',
      ev_odevi: '',
    })
  }

  const formatTarih = (iso: string) =>
    new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#dde5e2' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: '#dde5e2' }}>
        <h3 className="font-semibold" style={{ color: '#334155' }}>Seans Notları</h3>
        <button
          onClick={handleYeni}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-white"
          style={{ background: '#4a7c6f' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Yeni Seans
        </button>
      </div>

      <div className="flex" style={{ minHeight: '420px' }}>
        {/* SOL — Seans Listesi */}
        <div className="w-52 border-r flex-shrink-0" style={{ borderColor: '#dde5e2' }}>
          {loading ? (
            <div className="p-4 text-sm text-center" style={{ color: '#94a3b8' }}>Yükleniyor...</div>
          ) : notlar.length === 0 ? (
            <div className="p-4 text-sm text-center" style={{ color: '#94a3b8' }}>Henüz not yok</div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: '520px' }}>
              {notlar.map(n => (
                <button
                  key={n.id}
                  onClick={() => fetchDetay(n.id)}
                  className="w-full text-left px-4 py-3 border-b transition-colors text-sm"
                  style={{
                    borderColor: '#f1f5f9',
                    background: secilenId === n.id ? '#f0f7f5' : 'transparent',
                    color: secilenId === n.id ? '#4a7c6f' : '#334155',
                    fontWeight: secilenId === n.id ? '600' : '400',
                  }}
                >
                  <div>{formatTarih(n.seans_tarihi)}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SAĞ — Not Detayı */}
        <div className="flex-1 p-5">
          {!secilenId && !yeniMode ? (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: '#94a3b8' }}>
              Soldan bir seans seçin veya yeni seans ekleyin.
            </div>
          ) : detayLoading ? (
            <div className="flex items-center justify-center h-full text-sm" style={{ color: '#94a3b8' }}>
              Yükleniyor...
            </div>
          ) : (
            <div className="space-y-4">
              {/* Seans Tarihi */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748b' }}>SEANS TARİHİ</label>
                <input
                  type="datetime-local"
                  value={form.seans_tarihi}
                  onChange={e => setForm(p => ({ ...p, seans_tarihi: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                  style={{ borderColor: '#dde5e2', color: '#334155' }}
                />
              </div>

              {/* Seans Notu */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748b' }}>SEANS NOTU</label>
                <textarea
                  value={form.seans_notu}
                  onChange={e => setForm(p => ({ ...p, seans_notu: e.target.value }))}
                  rows={4}
                  placeholder="Bu seansın özeti, gözlemler..."
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={{ borderColor: '#dde5e2', color: '#334155' }}
                />
              </div>

              {/* Gelecek Plan */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748b' }}>GELECEK SEANS PLANI</label>
                <textarea
                  value={form.gelecek_plan}
                  onChange={e => setForm(p => ({ ...p, gelecek_plan: e.target.value }))}
                  rows={3}
                  placeholder="Bir sonraki seans için hedefler..."
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={{ borderColor: '#dde5e2', color: '#334155' }}
                />
              </div>

              {/* Ev Ödevi */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748b' }}>EV ÖDEVİ</label>
                <textarea
                  value={form.ev_odevi}
                  onChange={e => setForm(p => ({ ...p, ev_odevi: e.target.value }))}
                  rows={3}
                  placeholder="Hastaya verilecek ev ödevi..."
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={{ borderColor: '#dde5e2', color: '#334155' }}
                />
                {!yeniMode && (
                  <div className="mt-2">
                    <button
                      onClick={handleSendHomework}
                      disabled={sending || !form.ev_odevi.trim()}
                      className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
                      style={{ background: '#dcfce7', color: '#16a34a' }}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      {sending ? 'Gönderiliyor...' : `${hastaAdi.split(' ')[0]}'a WhatsApp ile gönder`}
                    </button>
                    {sendSuccess && (
                      <p className="text-xs mt-1.5 font-medium" style={{ color: '#16a34a' }}>Ev ödevi WhatsApp ile gönderildi.</p>
                    )}
                    {sendError && (
                      <p className="text-xs mt-1.5" style={{ color: '#dc2626' }}>{sendError}</p>
                    )}
                  </div>
                )}
              </div>

              {error && (
                <div className="px-3 py-2 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>{error}</div>
              )}
              {saveSuccess && (
                <div className="px-3 py-2 rounded-lg text-sm" style={{ background: '#dcfce7', color: '#16a34a' }}>Kaydedildi.</div>
              )}

              {/* Kaydet / Sil butonları */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving || !form.seans_tarihi}
                  className="flex-1 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-60"
                  style={{ background: '#4a7c6f' }}
                >
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                {!yeniMode && secilenId && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-xl text-sm font-medium border"
                    style={{ borderColor: '#fca5a5', color: '#dc2626' }}
                  >
                    Sil
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

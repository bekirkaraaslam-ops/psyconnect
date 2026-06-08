'use client'

import { useState, useEffect, useCallback } from 'react'
import UpgradeModal from '@/components/ui/UpgradeModal'

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
  soap_s: string
  soap_o: string
  soap_a: string
  soap_p: string
}

interface Props {
  hastaId: string
  hastaAdi: string
}

const SOAP_CARDS = [
  {
    key: 'soap_s' as const,
    label: 'S — Subjektif',
    sublabel: 'Danışanın Bu Seanstaki Anlatımları',
    placeholder: 'Danışanın kendi ifadeleri, hisleri, şikayetleri...',
    bg: '#eff6ff',
    border: '#bfdbfe',
    badge: '#3b82f6',
  },
  {
    key: 'soap_o' as const,
    label: 'O — Objektif',
    sublabel: 'Gözlemler ve Davranışsal Bulgular',
    placeholder: 'Görünüm, duygu durumu, davranış, iletişim tarzı...',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    badge: '#22c55e',
  },
  {
    key: 'soap_a' as const,
    label: 'A — Değerlendirme',
    sublabel: 'Klinik Değerlendirme',
    placeholder: 'Klinik izlenim, hipotezler, ilerleme değerlendirmesi...',
    bg: '#fffbeb',
    border: '#fde68a',
    badge: '#f59e0b',
  },
  {
    key: 'soap_p' as const,
    label: 'P — Plan',
    sublabel: 'Sonraki Adımlar',
    placeholder: 'Sonraki seans hedefleri, teknikler, odak noktaları...',
    bg: '#faf5ff',
    border: '#e9d5ff',
    badge: '#a855f7',
  },
]

export default function SeansNotlari({ hastaId, hastaAdi }: Props) {
  const [open, setOpen] = useState(false)
  const [notlar, setNotlar] = useState<NotOzet[]>([])
  const [secilenId, setSecilenId] = useState<string | null>(null)
  const [, setDetay] = useState<NotDetay | null>(null)
  const [loading, setLoading] = useState(true)
  const [detayLoading, setDetayLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [sendError, setSendError] = useState('')
  const [form, setForm] = useState({
    seans_tarihi: '',
    seans_notu: '',
    gelecek_plan: '',
    ev_odevi: '',
    soap_s: '',
    soap_o: '',
    soap_a: '',
    soap_p: '',
  })
  const [yeniMode, setYeniMode] = useState(false)
  const [error, setError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuccess, setAiSuccess] = useState(false)
  const [aiError, setAiError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [analizOpen, setAnalizOpen] = useState(false)
  const [analizLoading, setAnalizLoading] = useState(false)
  const [analizText, setAnalizText] = useState('')
  const [analizError, setAnalizError] = useState('')
  const [analizSeansSayisi, setAnalizSeansSayisi] = useState(0)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)

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
      soap_s: data.soap_s ?? '',
      soap_o: data.soap_o ?? '',
      soap_a: data.soap_a ?? '',
      soap_p: data.soap_p ?? '',
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
      soap_s: form.soap_s,
      soap_o: form.soap_o,
      soap_a: form.soap_a,
      soap_p: form.soap_p,
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
    if (!secilenId) return
    await fetch(`/api/hasta-notlari/${secilenId}`, { method: 'DELETE' })
    setSecilenId(null)
    setDetay(null)
    setConfirmDelete(false)
    setForm({ seans_tarihi: '', seans_notu: '', gelecek_plan: '', ev_odevi: '', soap_s: '', soap_o: '', soap_a: '', soap_p: '' })
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

  async function handleAiSoap() {
    if (!form.seans_notu.trim()) {
      setAiError('Önce Genel Notlar alanına seans özetini yazın.')
      return
    }
    setAiLoading(true)
    setAiError('')
    setAiSuccess(false)
    const res = await fetch('/api/ai/soap-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        seans_notu: form.seans_notu,
        mevcut_s: form.soap_s,
        mevcut_o: form.soap_o,
        mevcut_a: form.soap_a,
        mevcut_p: form.soap_p,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setAiError(data.error ?? 'Bir hata oluştu.')
      setAiLoading(false)
      return
    }
    setForm(p => ({ ...p, soap_s: data.s, soap_o: data.o, soap_a: data.a, soap_p: data.p }))
    setAiSuccess(true)
    setAiLoading(false)
    setTimeout(() => setAiSuccess(false), 4000)
  }

  async function handleAnalizAc() {
    if (analizOpen && analizText) { setAnalizOpen(false); return }
    setAnalizOpen(true)
    if (analizText) return
    setAnalizLoading(true)
    setAnalizError('')
    const res = await fetch('/api/ai/seans-analiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: hastaId }),
    })
    const data = await res.json()
    if (!res.ok) {
      if (data.limitReached) {
        setAnalizOpen(false)
        setUpgradeModalOpen(true)
      } else {
        setAnalizError(data.error ?? 'Analiz oluşturulamadı.')
      }
      setAnalizLoading(false)
      return
    }
    setAnalizText(data.analiz)
    setAnalizSeansSayisi(data.seans_sayisi)
    setAnalizLoading(false)
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
      soap_s: '',
      soap_o: '',
      soap_a: '',
      soap_p: '',
    })
  }

  const formatTarih = (iso: string) =>
    new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <>
    <UpgradeModal
      open={upgradeModalOpen}
      onClose={() => setUpgradeModalOpen(false)}
      featureName="AI seans ilerleme analizi"
    />
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: '#dde5e2' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer select-none"
        style={{ borderBottom: open ? '1px solid #dde5e2' : 'none' }}
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-3">
          <h3 className="font-semibold" style={{ color: '#334155' }}>Seans Notları</h3>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: '#f0f7f5' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span className="text-xs font-medium" style={{ color: '#4a7c6f', fontSize: '10px' }}>Uçtan uca şifreli</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {open && notlar.length >= 3 && (
            <button
              onClick={e => { e.stopPropagation(); handleAnalizAc() }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: analizOpen ? '#e8f5f1' : 'linear-gradient(135deg, #4a7c6f 0%, #3d6b5f 100%)',
                color: analizOpen ? '#4a7c6f' : '#fff',
                border: analizOpen ? '1px solid #b2d8d0' : 'none',
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              {analizOpen ? 'Analizi Gizle' : 'İlerleme Analizi'}
            </button>
          )}
          {open && (
            <button
              onClick={e => { e.stopPropagation(); handleYeni() }}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg text-white"
              style={{ background: '#4a7c6f' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Yeni Seans
            </button>
          )}
          <svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
      {open && <>

      {/* İlerleme Analizi Paneli */}
      {analizOpen && (
        <div className="px-5 py-4 border-b" style={{ borderColor: '#dde5e2', background: '#f8fafc' }}>
          <div className="flex items-center gap-2 mb-3">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            <span className="text-xs font-semibold" style={{ color: '#4a7c6f' }}>
              AI İLERLEME ANALİZİ
            </span>
            {analizSeansSayisi > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#e8f5f1', color: '#4a7c6f' }}>
                Son {analizSeansSayisi} seans
              </span>
            )}
          </div>
          {analizLoading ? (
            <div className="flex items-center gap-2 text-sm" style={{ color: '#94a3b8' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              Analiz oluşturuluyor...
            </div>
          ) : analizError ? (
            <p className="text-sm" style={{ color: '#dc2626' }}>{analizError}</p>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm leading-relaxed flex-1" style={{ color: '#334155' }}>{analizText}</p>
              <button
                onClick={() => { setAnalizText(''); setAnalizError(''); handleAnalizAc() }}
                className="text-xs shrink-0 px-2.5 py-1 rounded-lg border transition-all"
                style={{ borderColor: '#dde5e2', color: '#94a3b8' }}
                title="Yeniden oluştur"
              >
                ↻ Yenile
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:h-[520px]">
        {/* SOL — Seans Listesi */}
        <div className="w-full md:w-52 border-b md:border-b-0 md:border-r flex-shrink-0 flex flex-col overflow-hidden max-h-52 md:max-h-none" style={{ borderColor: '#dde5e2' }}>
          {loading ? (
            <div className="p-4 text-sm text-center" style={{ color: '#94a3b8' }}>Yükleniyor...</div>
          ) : notlar.length === 0 ? (
            <div className="p-6 text-sm text-center" style={{ color: '#94a3b8' }}>
              <p className="mb-2">Henüz not yok</p>
              <button
                onClick={handleYeni}
                className="text-xs font-medium underline"
                style={{ color: '#4a7c6f' }}
              >
                İlk seans notunu ekle
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
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
        <div className="flex-1 p-4 md:p-5 overflow-y-auto">
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

              {/* Seans özeti + AI butonu */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium" style={{ color: '#64748b' }}>SEANS ÖZETİ</label>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>AI bu nottan SOAP oluşturur</span>
                </div>
                <textarea
                  value={form.seans_notu}
                  onChange={e => setForm(p => ({ ...p, seans_notu: e.target.value }))}
                  rows={3}
                  placeholder="Seansı kısaca özetle: neler konuşuldu, danışanın durumu, öne çıkan temalar..."
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none"
                  style={{ borderColor: '#dde5e2', color: '#334155' }}
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex-1">
                    {aiSuccess && (
                      <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#065f46' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        SOAP dolduruldu — aşağıda düzenleyebilirsiniz.
                      </div>
                    )}
                    {aiError && (
                      <p className="text-xs" style={{ color: '#dc2626' }}>{aiError}</p>
                    )}
                  </div>
                  <button
                    onClick={handleAiSoap}
                    disabled={aiLoading || !form.seans_notu.trim()}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all disabled:opacity-50 ml-3 shrink-0"
                    style={{
                      background: 'linear-gradient(135deg, #4a7c6f 0%, #3d6b5f 100%)',
                      color: '#fff',
                    }}
                  >
                    {aiLoading ? (
                      <>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                        </svg>
                        Oluşturuluyor...
                      </>
                    ) : (
                      <>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        SOAP Oluştur
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* SOAP başlığı */}
              <div>
                <span className="text-xs font-semibold tracking-wide" style={{ color: '#94a3b8' }}>SOAP NOTLARI</span>
              </div>

              {/* SOAP Kartları */}
              {SOAP_CARDS.map(card => (
                <div
                  key={card.key}
                  className="rounded-xl border p-3"
                  style={{ background: card.bg, borderColor: card.border }}
                >
                  <div className="flex items-baseline gap-2 mb-2">
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded text-white"
                      style={{ background: card.badge, fontSize: '10px' }}
                    >
                      {card.key.replace('soap_', '').toUpperCase()}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: '#334155' }}>{card.sublabel}</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      value={form[card.key]}
                      onChange={e => setForm(p => ({ ...p, [card.key]: e.target.value }))}
                      rows={3}
                      placeholder={card.placeholder}
                      disabled={aiLoading}
                      className="w-full px-3 py-2 rounded-lg border text-sm outline-none resize-none bg-white"
                      style={{ borderColor: card.border, color: '#334155', opacity: aiLoading ? 0.5 : 1 }}
                    />
                    {aiLoading && (
                      <div
                        style={{
                          position: 'absolute', inset: 0, borderRadius: 8,
                          background: 'linear-gradient(90deg, transparent 0%, rgba(110,231,183,0.18) 50%, transparent 100%)',
                          backgroundSize: '200% 100%',
                          animation: 'aiShimmer 1.4s ease-in-out infinite',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}

              {/* Ev Ödevi */}
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748b' }}>EV ÖDEVİ</label>
                <textarea
                  value={form.ev_odevi}
                  onChange={e => setForm(p => ({ ...p, ev_odevi: e.target.value }))}
                  rows={3}
                  placeholder="Danışana verilecek ev ödevi..."
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
                  confirmDelete ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={handleDelete}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-white"
                        style={{ background: '#ef4444' }}
                      >
                        Evet, Sil
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        className="px-3 py-2 rounded-xl text-xs"
                        style={{ background: '#f1f5f9', color: '#64748b' }}
                      >
                        İptal
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="px-4 py-2 rounded-xl text-sm font-medium border"
                      style={{ borderColor: '#fca5a5', color: '#dc2626' }}
                    >
                      Sil
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes aiShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      </>}
    </div>
    </>
  )
}

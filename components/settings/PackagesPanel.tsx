'use client'
import { useState, useEffect } from 'react'

interface PaketSablon {
  id: string
  name: string
  session_count: number
  price_tl: number
  is_active: boolean
}

const EMPTY_FORM = { name: '', session_count: '', price_tl: '' }

export default function PackagesPanel() {
  const [packages, setPackages] = useState<PaketSablon[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    const res = await fetch('/api/packages')
    if (res.ok) setPackages(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setError('')
    setShowForm(true)
  }

  function openEdit(p: PaketSablon) {
    setEditId(p.id)
    setForm({ name: p.name, session_count: String(p.session_count), price_tl: String(p.price_tl) })
    setError('')
    setShowForm(true)
  }

  function cancel() {
    setShowForm(false)
    setEditId(null)
    setForm(EMPTY_FORM)
    setError('')
  }

  async function save() {
    if (!form.name.trim() || !form.session_count || !form.price_tl) {
      setError('Tüm alanlar zorunludur.')
      return
    }
    setSaving(true)
    setError('')
    const body = { name: form.name.trim(), session_count: Number(form.session_count), price_tl: Number(form.price_tl) }
    const res = editId
      ? await fetch(`/api/packages/${editId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/packages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setSaving(false)
    if (res.ok) { cancel(); load() }
    else { const d = await res.json(); setError(d.error ?? 'Hata oluştu.') }
  }

  async function toggleActive(p: PaketSablon) {
    await fetch(`/api/packages/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !p.is_active }),
    })
    load()
  }

  async function remove(id: string) {
    if (!confirm('Bu paketi silmek istediğinizden emin misiniz?')) return
    await fetch(`/api/packages/${id}`, { method: 'DELETE' })
    load()
  }

  const perSeans = (p: PaketSablon) => (p.price_tl / p.session_count).toFixed(0)

  return (
    <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#dde5e2' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold" style={{ color: '#0d1f18' }}>Seans Paketleri</h2>
          <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Danışanlar randevu alırken bu paketlerden birini seçebilir</p>
        </div>
        {!showForm && (
          <button
            onClick={openAdd}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
            style={{ background: '#4a7c6f' }}
          >
            + Paket Ekle
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-xl border p-4 mb-4 space-y-3" style={{ borderColor: '#e2e8f0', background: '#f8fafc' }}>
          <p className="text-xs font-semibold" style={{ color: '#334155' }}>{editId ? 'Paketi Düzenle' : 'Yeni Paket'}</p>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: '#64748b' }}>Paket Adı</label>
            <input
              type="text"
              placeholder="örn. 5 Seans Paketi"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
              style={{ borderColor: '#dde5e2' }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#64748b' }}>Seans Sayısı</label>
              <input
                type="number"
                min="1"
                placeholder="5"
                value={form.session_count}
                onChange={e => setForm(p => ({ ...p, session_count: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                style={{ borderColor: '#dde5e2' }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: '#64748b' }}>Toplam Fiyat (₺)</label>
              <input
                type="number"
                min="0"
                placeholder="2000"
                value={form.price_tl}
                onChange={e => setForm(p => ({ ...p, price_tl: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border outline-none"
                style={{ borderColor: '#dde5e2' }}
              />
            </div>
          </div>
          {form.session_count && form.price_tl && (
            <p className="text-xs" style={{ color: '#4a7c6f' }}>
              Seans başı: ₺{(Number(form.price_tl) / Number(form.session_count)).toFixed(0)}
            </p>
          )}
          {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ background: '#fee2e2', color: '#dc2626' }}>{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={cancel}
              className="flex-1 text-xs py-2 rounded-lg font-medium border"
              style={{ borderColor: '#dde5e2', color: '#64748b' }}
            >
              İptal
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 text-xs py-2 rounded-lg font-semibold text-white disabled:opacity-50"
              style={{ background: '#4a7c6f' }}
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <p className="text-xs text-center py-4" style={{ color: '#94a3b8' }}>Yükleniyor...</p>
      ) : packages.length === 0 ? (
        <p className="text-xs text-center py-6" style={{ color: '#94a3b8' }}>Henüz paket eklenmedi. Danışanlarınız randevu alırken paket seçebilmesi için en az bir paket ekleyin.</p>
      ) : (
        <div className="space-y-2">
          {packages.map(p => (
            <div
              key={p.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl border"
              style={{ borderColor: p.is_active ? '#dde5e2' : '#f1f5f9', background: p.is_active ? 'white' : '#f8fafc', opacity: p.is_active ? 1 : 0.6 }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: '#334155' }}>{p.name}</span>
                  {!p.is_active && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: '#f1f5f9', color: '#94a3b8' }}>Pasif</span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                  {p.session_count} seans · ₺{Number(p.price_tl).toLocaleString('tr-TR')} toplam · ₺{perSeans(p)}/seans
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-3">
                <button
                  onClick={() => openEdit(p)}
                  className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-gray-100"
                  style={{ color: '#4a7c6f' }}
                >
                  Düzenle
                </button>
                <button
                  onClick={() => toggleActive(p)}
                  className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-gray-100"
                  style={{ color: '#64748b' }}
                >
                  {p.is_active ? 'Pasife Al' : 'Aktif Et'}
                </button>
                <button
                  onClick={() => remove(p.id)}
                  className="text-xs px-2 py-1 rounded-lg transition-colors hover:bg-red-50"
                  style={{ color: '#ef4444' }}
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

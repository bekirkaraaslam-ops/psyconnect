'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Blog {
  id: string
  baslik: string
  slug: string
  kategori: string | null
  yayinda: boolean
  created_at: string
  icerik: string
}

interface Props {
  psychologistId: string
  bookingSlug: string
  bloglar: Blog[]
}

const KATEGORİLER = ['Kaygı', 'Depresyon', 'İlişkiler', 'Kişisel Gelişim', 'Ebeveynlik', 'Travma', 'Genel']

const KATRENKLERİ: Record<string, { bg: string; color: string }> = {
  'Kaygı':           { bg: '#fef3c7', color: '#92400e' },
  'Depresyon':       { bg: '#e0e7ff', color: '#3730a3' },
  'İlişkiler':       { bg: '#fce7f3', color: '#9d174d' },
  'Kişisel Gelişim': { bg: '#d1fae5', color: '#065f46' },
  'Ebeveynlik':      { bg: '#ffedd5', color: '#9a3412' },
  'Travma':          { bg: '#fee2e2', color: '#991b1b' },
  'Genel':           { bg: '#f1f5f9', color: '#475569' },
}

function makeSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

function readTime(text: string) {
  const wpm = 200
  const mins = Math.ceil(wordCount(text) / wpm)
  return `${mins} dk okuma`
}

export default function BloglarClient({ psychologistId, bookingSlug, bloglar: initial }: Props) {
  const supabase = createClient()
  const [bloglar, setBloglar] = useState<Blog[]>(initial)
  const [mode, setMode] = useState<'list' | 'edit'>('list')
  const [editing, setEditing] = useState<Blog | null>(null)
  const [baslik, setBaslik] = useState('')
  const [slug, setSlug] = useState('')
  const [kategori, setKategori] = useState('')
  const [icerik, setIcerik] = useState('')
  const [yayinda, setYayinda] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  function openNew() {
    setEditing(null)
    setBaslik(''); setSlug(''); setKategori(''); setIcerik(''); setYayinda(false); setErr('')
    setMode('edit')
  }

  function openEdit(b: Blog) {
    setEditing(b)
    setBaslik(b.baslik); setSlug(b.slug); setKategori(b.kategori ?? ''); setIcerik(b.icerik); setYayinda(b.yayinda); setErr('')
    setMode('edit')
  }

  function handleBaslikChange(v: string) {
    setBaslik(v)
    if (!editing) setSlug(makeSlug(v))
  }

  async function handleSave() {
    if (!baslik.trim() || !icerik.trim()) { setErr('Başlık ve içerik zorunlu.'); return }
    if (!slug.trim()) { setErr('Slug zorunlu.'); return }
    setSaving(true); setErr('')

    if (editing) {
      const { data, error } = await supabase
        .from('psikolog_bloglar')
        .update({ baslik, slug, kategori: kategori || null, icerik, yayinda, updated_at: new Date().toISOString() })
        .eq('id', editing.id)
        .select()
        .single()
      setSaving(false)
      if (error) { setErr(error.message); return }
      setBloglar(prev => prev.map(b => b.id === editing.id ? data : b))
    } else {
      const { data, error } = await supabase
        .from('psikolog_bloglar')
        .insert({ psychologist_id: psychologistId, baslik, slug, kategori: kategori || null, icerik, yayinda })
        .select()
        .single()
      setSaving(false)
      if (error) { setErr(error.message); return }
      setBloglar(prev => [data, ...prev])
    }
    setMode('list')
  }

  async function toggleYayinda(b: Blog) {
    const { data, error } = await supabase
      .from('psikolog_bloglar')
      .update({ yayinda: !b.yayinda })
      .eq('id', b.id)
      .select()
      .single()
    if (!error && data) setBloglar(prev => prev.map(x => x.id === b.id ? data : x))
  }

  async function handleDelete(id: string) {
    if (!confirm('Bu blogu silmek istediğinizden emin misiniz?')) return
    setDeleting(id)
    const { error } = await supabase.from('psikolog_bloglar').delete().eq('id', id)
    setDeleting(null)
    if (!error) setBloglar(prev => prev.filter(b => b.id !== id))
  }

  const formatDate = (s: string) => new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })

  const yayindaCount = bloglar.filter(b => b.yayinda).length

  // ── EDITOR ───────────────────────────────────────────────────────────
  if (mode === 'edit') return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Editor topbar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setMode('list')} style={{
            background: 'none', border: 'none', fontSize: 13, color: '#64748b',
            cursor: 'pointer', fontWeight: 600, padding: '6px 10px', borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Geri
          </button>
          <span style={{ color: '#e2e8f0' }}>|</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>
            {editing ? 'Yazıyı Düzenle' : 'Yeni Blog Yazısı'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icerik && <span style={{ fontSize: 12, color: '#94a3b8' }}>{wordCount(icerik)} kelime · {readTime(icerik)}</span>}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
            <div
              onClick={() => setYayinda(p => !p)}
              style={{
                width: 36, height: 20, borderRadius: 10, cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                background: yayinda ? '#4a7c6f' : '#e2e8f0',
              }}
            >
              <div style={{
                position: 'absolute', top: 2, left: yayinda ? 18 : 2, width: 16, height: 16,
                borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }} />
            </div>
            {yayinda ? 'Yayında' : 'Taslak'}
          </label>
          <button onClick={() => setMode('list')} style={{
            padding: '8px 16px', borderRadius: 10, border: '1px solid #dde5e2',
            background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#64748b',
          }}>
            İptal
          </button>
          <button onClick={handleSave} disabled={saving} style={{
            padding: '8px 20px', borderRadius: 10, border: 'none',
            background: '#4a7c6f', color: '#fff', fontSize: 13, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
          }}>
            {saving ? 'Kaydediliyor...' : editing ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        {err && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
            {err}
          </div>
        )}

        {/* Meta alanları */}
        <div style={{ background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', padding: 20, marginBottom: 20 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Başlık</label>
            <input
              style={{
                width: '100%', padding: '10px 0', fontSize: 22, fontWeight: 700,
                border: 'none', borderBottom: '2px solid #e2e8f0', outline: 'none',
                background: 'transparent', color: 'var(--foreground)', boxSizing: 'border-box',
              }}
              value={baslik}
              onChange={e => handleBaslikChange(e.target.value)}
              placeholder="Blog başlığını yazın..."
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Kategori</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {KATEGORİLER.map(k => {
                  const sel = kategori === k
                  const renk = KATRENKLERİ[k] ?? { bg: '#f1f5f9', color: '#475569' }
                  return (
                    <button key={k} onClick={() => setKategori(sel ? '' : k)} style={{
                      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
                      border: `1.5px solid ${sel ? renk.color : '#dde5e2'}`,
                      background: sel ? renk.bg : '#fff',
                      color: sel ? renk.color : '#94a3b8',
                    }}>{k}</button>
                  )
                })}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>URL</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '6px 10px' }}>
                <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{bookingSlug}.seansify.com/</span>
                <input
                  style={{ flex: 1, fontSize: 12, border: 'none', outline: 'none', background: 'transparent', color: '#334155', minWidth: 0 }}
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="blog-slug"
                />
              </div>
            </div>
          </div>
        </div>

        {/* İçerik */}
        <div style={{ background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', padding: 20 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>İçerik</label>
          <textarea
            style={{
              width: '100%', padding: '12px 0', fontSize: 15, lineHeight: 1.8,
              border: 'none', outline: 'none', resize: 'none', minHeight: 400,
              background: 'transparent', color: 'var(--foreground)', boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
            value={icerik}
            onChange={e => setIcerik(e.target.value)}
            placeholder="Yazınızı buraya yazın..."
          />
        </div>
      </div>
    </div>
  )

  // ── LIST ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--foreground)', margin: 0, marginBottom: 2 }}>Bloglarım</h1>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
            {bloglar.length} yazı · {yayindaCount} yayında
          </p>
        </div>
        <button
          onClick={openNew}
          style={{
            background: '#4a7c6f', color: '#fff', border: 'none', borderRadius: 12,
            padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yeni Yazı
        </button>
      </div>

      <div style={{ padding: '24px 28px', maxWidth: 800 }}>
        {bloglar.length === 0 ? (
          /* Empty state */
          <div style={{
            background: 'var(--card)', borderRadius: 20, border: '1px solid var(--border)',
            padding: '56px 32px', textAlign: 'center',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)', marginBottom: 8 }}>Henüz blog yazısı yok</h3>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>
              Yazılarınız profilinizde görünür ve danışan adaylarının sizi tanımasına yardımcı olur.
            </p>
            <button onClick={openNew} style={{
              background: '#4a7c6f', color: '#fff', border: 'none', borderRadius: 12,
              padding: '12px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}>
              İlk yazını oluştur
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {bloglar.map(b => {
              const renk = b.kategori ? (KATRENKLERİ[b.kategori] ?? { bg: '#f1f5f9', color: '#475569' }) : null
              const preview = b.icerik.slice(0, 120).trim()

              return (
                <div key={b.id} style={{
                  background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)',
                  padding: '16px 20px',
                  display: 'flex', alignItems: 'flex-start', gap: 16,
                  transition: 'box-shadow 0.15s',
                }}>
                  {/* Sol çizgi — yayın durumu */}
                  <div style={{
                    width: 3, alignSelf: 'stretch', borderRadius: 4, flexShrink: 0,
                    background: b.yayinda ? '#4a7c6f' : '#e2e8f0',
                    minHeight: 48,
                  }} />

                  {/* İçerik */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <h3 style={{
                        fontSize: 14, fontWeight: 700, color: 'var(--foreground)', margin: 0,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
                      }}>
                        {b.baslik}
                      </h3>
                      {renk && (
                        <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: renk.bg, color: renk.color, flexShrink: 0 }}>
                          {b.kategori}
                        </span>
                      )}
                    </div>
                    {preview && (
                      <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 6px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {preview}{b.icerik.length > 120 ? '…' : ''}
                      </p>
                    )}
                    <p style={{ fontSize: 11, color: '#cbd5e1', margin: 0 }}>
                      {formatDate(b.created_at)} · {readTime(b.icerik)}
                    </p>
                  </div>

                  {/* Aksiyonlar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={() => toggleYayinda(b)}
                      style={{
                        fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 8,
                        border: `1px solid ${b.yayinda ? '#4a7c6f' : '#dde5e2'}`,
                        background: b.yayinda ? '#f0fdf4' : '#f8fafc',
                        color: b.yayinda ? '#15803d' : '#94a3b8',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {b.yayinda ? '✓ Yayında' : 'Taslak'}
                    </button>
                    <button
                      onClick={() => openEdit(b)}
                      style={{
                        padding: '5px 12px', borderRadius: 8, border: '1px solid #dde5e2',
                        background: '#fff', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer',
                      }}
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      disabled={deleting === b.id}
                      style={{
                        width: 32, height: 32, borderRadius: 8, border: '1px solid #fecaca',
                        background: '#fef2f2', color: '#dc2626', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: deleting === b.id ? 0.5 : 1, flexShrink: 0,
                      }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Blog {
  id: string
  baslik: string
  slug: string
  kategori: string | null
  yayinda: boolean
  created_at: string
  icerik: string
  kapak_url: string | null
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
  const [kapakUrl, setKapakUrl] = useState<string | null>(null)
  const [uploadingKapak, setUploadingKapak] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const kapakInputRef = useRef<HTMLInputElement>(null)

  function openNew() {
    setEditing(null)
    setBaslik(''); setSlug(''); setKategori(''); setIcerik(''); setYayinda(false); setKapakUrl(null); setErr('')
    setMode('edit')
  }

  function openEdit(b: Blog) {
    setEditing(b)
    setBaslik(b.baslik); setSlug(b.slug); setKategori(b.kategori ?? ''); setIcerik(b.icerik); setYayinda(b.yayinda); setKapakUrl(b.kapak_url ?? null); setErr('')
    setMode('edit')
  }

  function handleBaslikChange(v: string) {
    setBaslik(v)
    if (!editing) setSlug(makeSlug(v))
  }

  async function handleKapakUpload(file: File) {
    setUploadingKapak(true)
    const ext = file.name.split('.').pop()
    const path = `${psychologistId}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('blog-kapaklar').upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) { setErr('Kapak yüklenemedi: ' + upErr.message); setUploadingKapak(false); return }
    const { data: { publicUrl } } = supabase.storage.from('blog-kapaklar').getPublicUrl(path)
    setKapakUrl(publicUrl)
    setUploadingKapak(false)
  }

  async function handleSave() {
    if (!baslik.trim() || !icerik.trim()) { setErr('Başlık ve içerik zorunlu.'); return }
    if (!slug.trim()) { setErr('Slug zorunlu.'); return }
    setSaving(true); setErr('')

    if (editing) {
      const { data, error } = await supabase
        .from('psikolog_bloglar')
        .update({ baslik, slug, kategori: kategori || null, icerik, yayinda, kapak_url: kapakUrl, updated_at: new Date().toISOString() })
        .eq('id', editing.id)
        .select()
        .single()
      setSaving(false)
      if (error) { setErr(error.message); return }
      setBloglar(prev => prev.map(b => b.id === editing.id ? data : b))
    } else {
      const { data, error } = await supabase
        .from('psikolog_bloglar')
        .insert({ psychologist_id: psychologistId, baslik, slug, kategori: kategori || null, icerik, yayinda, kapak_url: kapakUrl })
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

  async function copyLink(b: Blog) {
    const url = `https://seansify.com/${bookingSlug}/blog/${b.slug}`
    await navigator.clipboard.writeText(url)
    setCopied(b.id)
    setTimeout(() => setCopied(null), 2000)
  }

  const formatDate = (s: string) => new Date(s).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })
  const yayindaCount = bloglar.filter(b => b.yayinda).length

  // ── EDITOR ───────────────────────────────────────────────────────────
  if (mode === 'edit') return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', paddingBottom: 80 }}>
      <style>{`
        @media (max-width: 640px) {
          .editor-topbar { padding: 10px 16px !important; }
          .editor-topbar-left span.editor-sep,
          .editor-topbar-left span.editor-title { display: none !important; }
          .editor-topbar-right .editor-wordcount,
          .editor-topbar-right .editor-iptal { display: none !important; }
          .editor-body { padding: 16px 14px !important; }
          .editor-meta-grid { grid-template-columns: 1fr !important; }
          .editor-mobile-bar { display: flex !important; }
          .editor-container { padding-bottom: 140px !important; }
        }
        @media (min-width: 641px) {
          .editor-mobile-bar { display: none !important; }
        }
      `}</style>

      {/* Topbar */}
      <div className="editor-topbar" style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div className="editor-topbar-left" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
          <span className="editor-sep" style={{ color: '#e2e8f0' }}>|</span>
          <span className="editor-title" style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>
            {editing ? 'Yazıyı Düzenle' : 'Yeni Blog Yazısı'}
          </span>
        </div>
        <div className="editor-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icerik && (
            <span className="editor-wordcount" style={{ fontSize: 12, color: '#94a3b8' }}>
              {wordCount(icerik)} kelime · {readTime(icerik)}
            </span>
          )}
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
          <button className="editor-iptal" onClick={() => setMode('list')} style={{
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
            {saving ? 'Kaydediliyor…' : editing ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="editor-body editor-container" style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
        {err && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
            {err}
          </div>
        )}

        {/* Kapak Resmi */}
        <div style={{ background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', padding: 20, marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 12 }}>Kapak Resmi</label>
          <input ref={kapakInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleKapakUpload(e.target.files[0])} />
          {kapakUrl ? (
            <div>
              <img src={kapakUrl} alt="Kapak" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, display: 'block' }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={() => kapakInputRef.current?.click()} disabled={uploadingKapak} style={{
                  fontSize: 12, fontWeight: 600, color: '#4a7c6f', background: '#f0fdf4', border: '1px solid #d1fae5',
                  borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                }}>
                  {uploadingKapak ? 'Yükleniyor…' : 'Değiştir'}
                </button>
                <button onClick={() => setKapakUrl(null)} style={{
                  fontSize: 12, fontWeight: 600, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 8, padding: '6px 14px', cursor: 'pointer',
                }}>
                  Kaldır
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => kapakInputRef.current?.click()}
              disabled={uploadingKapak}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '20px', borderRadius: 12,
                border: '2px dashed #dde5e2', background: '#f8fafc',
                cursor: 'pointer', color: '#94a3b8', fontSize: 13, fontWeight: 600,
                justifyContent: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              {uploadingKapak ? 'Yükleniyor…' : 'Kapak resmi yükle'}
            </button>
          )}
        </div>

        {/* Meta alanları */}
        <div style={{ background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)', padding: 20, marginBottom: 16 }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Başlık</label>
            <input
              style={{
                width: '100%', padding: '10px 0', fontSize: 20, fontWeight: 700,
                border: 'none', borderBottom: '2px solid #e2e8f0', outline: 'none',
                background: 'transparent', color: 'var(--foreground)', boxSizing: 'border-box',
              }}
              value={baslik}
              onChange={e => handleBaslikChange(e.target.value)}
              placeholder="Blog başlığını yazın..."
            />
          </div>

          <div className="editor-meta-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Kategori</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {KATEGORİLER.map(k => {
                  const sel = kategori === k
                  const renk = KATRENKLERİ[k] ?? { bg: '#f1f5f9', color: '#475569' }
                  return (
                    <button key={k} onClick={() => setKategori(sel ? '' : k)} style={{
                      fontSize: 12, fontWeight: 600, padding: '5px 11px', borderRadius: 6, cursor: 'pointer',
                      border: `1.5px solid ${sel ? renk.color : '#dde5e2'}`,
                      background: sel ? renk.bg : '#fff',
                      color: sel ? renk.color : '#94a3b8',
                    }}>{k}</button>
                  )
                })}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>URL Slug</label>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px' }}>
                <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginBottom: 4 }}>
                  …/{bookingSlug}/blog/
                </span>
                <input
                  style={{ width: '100%', fontSize: 13, border: 'none', outline: 'none', background: 'transparent', color: '#334155', boxSizing: 'border-box' }}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>İçerik</label>
            {icerik && (
              <span style={{ fontSize: 11, color: '#cbd5e1' }}>{wordCount(icerik)} kelime · {readTime(icerik)}</span>
            )}
          </div>
          <textarea
            style={{
              width: '100%', padding: '4px 0', fontSize: 15, lineHeight: 1.8,
              border: 'none', outline: 'none', resize: 'none', minHeight: 360,
              background: 'transparent', color: 'var(--foreground)', boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
            value={icerik}
            onChange={e => setIcerik(e.target.value)}
            placeholder="Yazınızı buraya yazın... (Markdown desteklenir: ## Başlık, **kalın**, - liste)"
          />
        </div>
      </div>

      {/* Mobile sticky bottom bar — sits above MobileNav (~60px) */}
      <div className="editor-mobile-bar" style={{
        position: 'fixed', bottom: 60, left: 0, right: 0, zIndex: 55,
        background: 'var(--card)', borderTop: '1px solid var(--border)',
        padding: '12px 16px',
        alignItems: 'center', justifyContent: 'space-between', gap: 12,
        boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
          <div
            onClick={() => setYayinda(p => !p)}
            style={{
              width: 40, height: 22, borderRadius: 11, cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
              background: yayinda ? '#4a7c6f' : '#e2e8f0', flexShrink: 0,
            }}
          >
            <div style={{
              position: 'absolute', top: 3, left: yayinda ? 20 : 3, width: 16, height: 16,
              borderRadius: '50%', background: '#fff', transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
            }} />
          </div>
          {yayinda ? 'Yayında' : 'Taslak'}
        </label>
        <button onClick={handleSave} disabled={saving} style={{
          flex: 1, maxWidth: 200, padding: '12px 20px', borderRadius: 12, border: 'none',
          background: '#4a7c6f', color: '#fff', fontSize: 14, fontWeight: 700,
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
        }}>
          {saving ? 'Kaydediliyor…' : editing ? 'Güncelle' : 'Kaydet'}
        </button>
      </div>
    </div>
  )

  // ── LIST ─────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <style>{`
        @media (max-width: 640px) {
          .list-header { padding: 16px 16px !important; }
          .list-body { padding: 12px 12px !important; }
          .blog-card-actions { padding: 10px 12px !important; border-top: 1px solid var(--border); width: 100%; box-sizing: border-box; }
          .blog-card-actions-sep { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="list-header" style={{
        background: 'var(--card)', borderBottom: '1px solid var(--border)',
        padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
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
            padding: '10px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yeni Yazı
        </button>
      </div>

      <div className="list-body" style={{ padding: '20px 24px', maxWidth: 800 }}>
        {bloglar.length === 0 ? (
          <div style={{
            background: 'var(--card)', borderRadius: 20, border: '1px solid var(--border)',
            padding: '48px 24px', textAlign: 'center',
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
              const preview = b.icerik.replace(/#+\s/g, '').replace(/\*\*/g, '').slice(0, 110).trim()
              const isCopied = copied === b.id

              return (
                <div key={b.id} style={{
                  background: 'var(--card)', borderRadius: 16, border: '1px solid var(--border)',
                  overflow: 'hidden', display: 'flex', flexDirection: 'column',
                }}>
                  {/* Üst satır: thumbnail + içerik + (desktop aksiyonlar) */}
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    {/* Kapak thumbnail */}
                    {b.kapak_url && (
                      <div style={{
                        width: 72, flexShrink: 0,
                        background: `url(${b.kapak_url}) center/cover no-repeat`,
                      }} />
                    )}

                    {/* Sol çizgi — yayın durumu */}
                    <div style={{
                      width: 3, alignSelf: 'stretch', flexShrink: 0,
                      background: b.yayinda ? '#4a7c6f' : '#e2e8f0',
                    }} />

                    {/* İçerik */}
                    <div style={{ flex: 1, minWidth: 0, padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                        <h3 style={{
                          fontSize: 14, fontWeight: 700, color: 'var(--foreground)', margin: 0,
                          lineHeight: 1.4, flex: 1, minWidth: 0,
                        }}>
                          {b.baslik}
                        </h3>
                        {renk && (
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 5, background: renk.bg, color: renk.color, flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {b.kategori}
                          </span>
                        )}
                      </div>
                      {preview && (
                        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 5px', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                          {preview}{b.icerik.length > 110 ? '…' : ''}
                        </p>
                      )}
                      <p style={{ fontSize: 11, color: '#cbd5e1', margin: 0 }}>
                        {formatDate(b.created_at)} · {readTime(b.icerik)}
                      </p>
                    </div>

                    {/* Desktop aksiyonlar (sağda dikey hizalı) */}
                    <div className="blog-card-actions-sep" style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, padding: '0 14px' }}>
                      {b.yayinda && (
                        <button
                          onClick={() => copyLink(b)}
                          title="Linki kopyala"
                          style={{
                            width: 32, height: 32, borderRadius: 8, border: '1px solid #dde5e2',
                            background: isCopied ? '#f0fdf4' : '#f8fafc',
                            color: isCopied ? '#15803d' : '#94a3b8',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, transition: 'all 0.15s',
                          }}
                        >
                          {isCopied ? (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                            </svg>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => toggleYayinda(b)}
                        style={{
                          fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 8,
                          border: `1px solid ${b.yayinda ? '#4a7c6f' : '#dde5e2'}`,
                          background: b.yayinda ? '#f0fdf4' : '#f8fafc',
                          color: b.yayinda ? '#15803d' : '#94a3b8',
                          cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
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
                          <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Mobile aksiyonlar (altta, tam genişlik) */}
                  <div className="blog-card-actions" style={{ display: 'none', alignItems: 'center', gap: 8, padding: '10px 14px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => toggleYayinda(b)}
                      style={{
                        fontSize: 12, fontWeight: 700, padding: '7px 14px', borderRadius: 8,
                        border: `1px solid ${b.yayinda ? '#4a7c6f' : '#dde5e2'}`,
                        background: b.yayinda ? '#f0fdf4' : '#f8fafc',
                        color: b.yayinda ? '#15803d' : '#94a3b8',
                        cursor: 'pointer',
                      }}
                    >
                      {b.yayinda ? '✓ Yayında' : 'Taslak'}
                    </button>
                    <button
                      onClick={() => openEdit(b)}
                      style={{
                        flex: 1, padding: '7px 14px', borderRadius: 8, border: '1px solid #dde5e2',
                        background: '#fff', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer',
                        textAlign: 'center' as const,
                      }}
                    >
                      Düzenle
                    </button>
                    {b.yayinda && (
                      <button
                        onClick={() => copyLink(b)}
                        title="Linki kopyala"
                        style={{
                          width: 36, height: 36, borderRadius: 8, border: '1px solid #dde5e2',
                          background: isCopied ? '#f0fdf4' : '#f8fafc',
                          color: isCopied ? '#15803d' : '#94a3b8',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, transition: 'all 0.15s',
                        }}
                      >
                        {isCopied ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                          </svg>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(b.id)}
                      disabled={deleting === b.id}
                      style={{
                        width: 36, height: 36, borderRadius: 8, border: '1px solid #fecaca',
                        background: '#fef2f2', color: '#dc2626', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: deleting === b.id ? 0.5 : 1, flexShrink: 0,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                        <path d="M10 11v6M14 11v6M9 6V4h6v2" />
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

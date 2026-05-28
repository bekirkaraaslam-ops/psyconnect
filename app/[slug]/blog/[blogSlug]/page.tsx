import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import type { Metadata } from 'next'
import Link from 'next/link'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

interface Context {
  params: Promise<{ slug: string; blogSlug: string }>
}

export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const { slug, blogSlug } = await params
  const supabase = getSupabase()
  const { data: blog } = await supabase
    .from('psikolog_bloglar')
    .select('baslik, icerik, psychologists!inner(booking_slug)')
    .eq('slug', blogSlug)
    .eq('yayinda', true)
    .single()
  if (!blog) return { title: 'Seansify' }
  return {
    title: blog.baslik,
    description: blog.icerik.replace(/#+\s/g, '').replace(/\*\*/g, '').slice(0, 160),
  }
}

const KATEGORİ_RENK: Record<string, { bg: string; color: string }> = {
  'Kaygı':           { bg: '#fef3c7', color: '#92400e' },
  'Depresyon':       { bg: '#e0e7ff', color: '#3730a3' },
  'İlişkiler':       { bg: '#fce7f3', color: '#9d174d' },
  'Kişisel Gelişim': { bg: '#d1fae5', color: '#065f46' },
  'Ebeveynlik':      { bg: '#ffedd5', color: '#9a3412' },
  'Travma':          { bg: '#fee2e2', color: '#991b1b' },
  'Genel':           { bg: '#f1f5f9', color: '#475569' },
}

function renderIcerik(text: string) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let key = 0

  for (const line of lines) {
    const l = line.trim()
    if (!l) { elements.push(<div key={key++} style={{ height: 12 }} />); continue }

    if (l.startsWith('### ')) {
      elements.push(<h3 key={key++} style={{ fontSize: 17, fontWeight: 700, color: '#0d1f18', margin: '28px 0 10px', lineHeight: 1.4 }}>{l.slice(4)}</h3>)
    } else if (l.startsWith('## ')) {
      elements.push(<h2 key={key++} style={{ fontSize: 20, fontWeight: 800, color: '#0d1f18', margin: '36px 0 12px', lineHeight: 1.3 }}>{l.slice(3)}</h2>)
    } else if (l.startsWith('# ')) {
      elements.push(<h1 key={key++} style={{ fontSize: 24, fontWeight: 800, color: '#0d1f18', margin: '40px 0 14px', lineHeight: 1.3 }}>{l.slice(2)}</h1>)
    } else if (l.startsWith('- ') || l.startsWith('* ')) {
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
          <span style={{ color: '#4a7c6f', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>•</span>
          <p style={{ fontSize: 16, color: '#334155', lineHeight: 1.75, margin: 0 }}>{formatInline(l.slice(2))}</p>
        </div>
      )
    } else {
      elements.push(<p key={key++} style={{ fontSize: 16, color: '#334155', lineHeight: 1.85, margin: '0 0 4px' }}>{formatInline(l)}</p>)
    }
  }
  return elements
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 700, color: '#0d1f18' }}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default async function BlogDetayPage({ params }: Context) {
  const { slug, blogSlug } = await params
  const supabase = getSupabase()

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, full_name, unvan, booking_slug, foto_url, bio_text, subscription_status')
    .eq('booking_slug', slug)
    .single()

  if (!psych) notFound()
  if (!['active', 'trial'].includes(psych.subscription_status ?? '')) notFound()

  const { data: blog } = await supabase
    .from('psikolog_bloglar')
    .select('id, baslik, slug, kategori, icerik, created_at')
    .eq('psychologist_id', psych.id)
    .eq('slug', blogSlug)
    .eq('yayinda', true)
    .single()

  if (!blog) notFound()

  // Önceki / Sonraki
  const { data: diger } = await supabase
    .from('psikolog_bloglar')
    .select('id, baslik, slug, created_at')
    .eq('psychologist_id', psych.id)
    .eq('yayinda', true)
    .order('created_at', { ascending: false })

  const idx = diger?.findIndex(b => b.id === blog.id) ?? -1
  const onceki = idx > 0 ? diger![idx - 1] : null
  const sonraki = idx >= 0 && idx < (diger?.length ?? 0) - 1 ? diger![idx + 1] : null

  const ad = psych.unvan ? `${psych.unvan} ${psych.full_name}` : psych.full_name
  const initials = psych.full_name.split(' ').map((k: string) => k[0]).slice(0, 2).join('').toUpperCase()
  const mins = Math.max(1, Math.round(blog.icerik.split(/\s+/).length / 200))
  const renk = blog.kategori ? (KATEGORİ_RENK[blog.kategori] ?? { bg: '#f0fdf4', color: '#166534' }) : null

  return (
    <div style={{ background: '#f4f9f7', minHeight: '100vh' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(74,124,111,0.12)',
        padding: '0 20px', height: 54,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 12px rgba(74,124,111,0.08)',
      }}>
        <Link href="/" style={{ fontSize: 15, fontWeight: 800, color: '#4a7c6f', letterSpacing: '-0.5px', textDecoration: 'none' }}>
          sean<span style={{ color: '#0d1f18' }}>sify</span>
        </Link>
        <Link href={`/${slug}`} style={{ fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {ad}
        </Link>
        <Link
          href={`/book/${slug}`}
          style={{
            background: 'linear-gradient(135deg,#4a7c6f,#3d6b5e)',
            color: '#fff', borderRadius: 10, padding: '8px 18px',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
            boxShadow: '0 2px 8px rgba(74,124,111,0.35)',
          }}
        >
          Randevu Al
        </Link>
      </header>

      {/* Makale */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 20px 60px' }}>

        {/* Geri */}
        <Link href={`/${slug}/blog`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#4a7c6f', textDecoration: 'none', marginBottom: 28 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Tüm yazılar
        </Link>

        {/* Makale kartı */}
        <article style={{ background: '#fff', borderRadius: 24, padding: '36px 40px', border: '1px solid #e4eeea', boxShadow: '0 4px 24px rgba(74,124,111,0.08)' }}>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {renk && blog.kategori && (
              <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: renk.bg, color: renk.color }}>
                {blog.kategori}
              </span>
            )}
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              {new Date(blog.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
              {' · '}
              {mins} dk okuma
            </span>
          </div>

          {/* Başlık */}
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0d1f18', margin: '0 0 32px', lineHeight: 1.3, letterSpacing: '-0.5px' }}>
            {blog.baslik}
          </h1>

          {/* İçerik */}
          <div>{renderIcerik(blog.icerik)}</div>

          {/* Yazar kutusu */}
          <div style={{
            marginTop: 48, paddingTop: 28, borderTop: '1px solid #e4eeea',
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <Link href={`/${slug}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg,#4a7c6f,#6ee7b7)',
                overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #e4eeea',
              }}>
                {psych.foto_url
                  ? <img src={psych.foto_url} alt={ad} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>{initials}</span>
                }
              </div>
            </Link>
            <div style={{ flex: 1 }}>
              <Link href={`/${slug}`} style={{ textDecoration: 'none' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#0d1f18', margin: '0 0 3px' }}>{ad}</p>
              </Link>
              {psych.bio_text && (
                <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5 }}>
                  {psych.bio_text.slice(0, 100)}{psych.bio_text.length > 100 ? '…' : ''}
                </p>
              )}
            </div>
            <Link
              href={`/book/${slug}`}
              style={{
                background: '#4a7c6f', color: '#fff', borderRadius: 10, padding: '9px 18px',
                fontSize: 13, fontWeight: 700, textDecoration: 'none', flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              Randevu Al
            </Link>
          </div>
        </article>

        {/* Önceki / Sonraki */}
        {(onceki || sonraki) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
            <div>
              {sonraki && (
                <Link href={`/${slug}/blog/${sonraki.slug}`} style={{ textDecoration: 'none', display: 'block', background: '#fff', borderRadius: 16, padding: '16px 20px', border: '1px solid #e4eeea' }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, margin: '0 0 6px' }}>← Önceki yazı</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0d1f18', margin: 0, lineHeight: 1.4 }}>{sonraki.baslik}</p>
                </Link>
              )}
            </div>
            <div>
              {onceki && (
                <Link href={`/${slug}/blog/${onceki.slug}`} style={{ textDecoration: 'none', display: 'block', background: '#fff', borderRadius: 16, padding: '16px 20px', border: '1px solid #e4eeea', textAlign: 'right' }}>
                  <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, margin: '0 0 6px' }}>Sonraki yazı →</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0d1f18', margin: 0, lineHeight: 1.4 }}>{onceki.baslik}</p>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

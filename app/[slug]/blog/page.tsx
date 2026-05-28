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
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Context): Promise<Metadata> {
  const { slug } = await params
  const supabase = getSupabase()
  const { data: psych } = await supabase
    .from('psychologists')
    .select('full_name, unvan')
    .eq('booking_slug', slug)
    .single()
  if (!psych) return { title: 'Seansify' }
  const ad = psych.unvan ? `${psych.unvan} ${psych.full_name}` : psych.full_name
  return { title: `${ad} — Blog` }
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

function katRenk(kat: string | null) {
  if (!kat) return { bg: '#f0fdf4', color: '#166534' }
  return KATEGORİ_RENK[kat] ?? { bg: '#f0fdf4', color: '#166534' }
}

function readTime(text: string) {
  return Math.max(1, Math.round(text.split(/\s+/).length / 200))
}

function ozet(icerik: string) {
  return icerik.replace(/#+\s/g, '').replace(/\*\*/g, '').slice(0, 140).trim() + '...'
}

export default async function BlogListePage({ params }: Context) {
  const { slug } = await params
  const supabase = getSupabase()

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, full_name, unvan, booking_slug, foto_url, subscription_status')
    .eq('booking_slug', slug)
    .single()

  if (!psych) notFound()
  if (!['active', 'trial'].includes(psych.subscription_status ?? '')) notFound()

  const { data: bloglar } = await supabase
    .from('psikolog_bloglar')
    .select('id, baslik, slug, kategori, icerik, created_at')
    .eq('psychologist_id', psych.id)
    .eq('yayinda', true)
    .order('created_at', { ascending: false })

  const ad = psych.unvan ? `${psych.unvan} ${psych.full_name}` : psych.full_name
  const initials = psych.full_name.split(' ').map((k: string) => k[0]).slice(0, 2).join('').toUpperCase()

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

      {/* Blog hero */}
      <div style={{
        background: 'linear-gradient(150deg,#0b1c14 0%,#1e4535 60%,#2d6b52 100%)',
        padding: '44px 20px 40px', textAlign: 'center',
      }}>
        {/* Avatar */}
        <Link href={`/${slug}`} style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto',
            border: '2px solid rgba(110,231,183,0.4)', overflow: 'hidden',
            background: 'linear-gradient(135deg,#4a7c6f,#6ee7b7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {psych.foto_url
              ? <img src={psych.foto_url} alt={ad} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{initials}</span>
            }
          </div>
        </Link>
        <Link href={`/${slug}`} style={{ textDecoration: 'none' }}>
          <p style={{ fontSize: 13, color: 'rgba(110,231,183,0.8)', fontWeight: 600, margin: '0 0 6px' }}>{ad}</p>
        </Link>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Blog</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', margin: 0 }}>
          {bloglar?.length ?? 0} yazı
        </p>
      </div>

      {/* Liste */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
        {!bloglar || bloglar.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ fontSize: 15, color: '#94a3b8' }}>Henüz blog yazısı yok.</p>
            <Link href={`/${slug}`} style={{ fontSize: 13, color: '#4a7c6f', fontWeight: 600, textDecoration: 'none' }}>
              ← Profile dön
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bloglar.map(b => {
              const renk = katRenk(b.kategori)
              const mins = readTime(b.icerik)
              return (
                <Link
                  key={b.id}
                  href={`/${slug}/blog/${b.slug}`}
                  style={{ textDecoration: 'none', display: 'block' }}
                >
                  <article style={{
                    background: '#fff', borderRadius: 20, padding: '24px 28px',
                    border: '1px solid #e4eeea',
                    boxShadow: '0 2px 12px rgba(74,124,111,0.06)',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      {b.kategori && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: renk.bg, color: renk.color }}>
                          {b.kategori}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: '#cbd5e1' }}>
                        {new Date(b.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}
                        {mins} dk okuma
                      </span>
                    </div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0d1f18', margin: '0 0 10px', lineHeight: 1.35 }}>
                      {b.baslik}
                    </h2>
                    <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '0 0 16px' }}>
                      {ozet(b.icerik)}
                    </p>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#4a7c6f' }}>
                      Devamını oku →
                    </span>
                  </article>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 20px 40px' }}>
        <Link href={`/${slug}`} style={{ fontSize: 13, color: '#4a7c6f', fontWeight: 600, textDecoration: 'none' }}>
          ← {ad} profiline dön
        </Link>
      </div>
    </div>
  )
}

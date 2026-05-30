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

type TemaColors = {
  pageBg: string
  headerBg: string
  headerBorder: string
  heroBg: string
  heroAvtBorder: string
  heroAvtBg: string
  logoColor: string
  logoAccent: string
  btnBg: string
  accentColor: string
  cardDevam: string
}

const TEMA_COLORS: Record<string, TemaColors> = {
  blanc: {
    pageBg: '#f7f5f2', headerBg: 'rgba(255,255,255,0.96)', headerBorder: 'rgba(61,107,94,0.12)',
    heroBg: 'linear-gradient(150deg,#0d1f18 0%,#1e4535 60%,#2d5e44 100%)',
    heroAvtBorder: 'rgba(110,231,183,0.4)', heroAvtBg: 'linear-gradient(135deg,#3d6b5e,#6ee7b7)',
    logoColor: '#3d6b5e', logoAccent: '#0d1f18', btnBg: '#3d6b5e',
    accentColor: '#3d6b5e', cardDevam: '#3d6b5e',
  },
  doga: {
    pageBg: '#f9f5f0', headerBg: 'rgba(249,245,240,0.96)', headerBorder: 'rgba(74,103,65,0.15)',
    heroBg: 'linear-gradient(150deg,#2c2416 0%,#3d5229 60%,#4a6741 100%)',
    heroAvtBorder: 'rgba(166,209,113,0.4)', heroAvtBg: 'linear-gradient(135deg,#4a6741,#a6d171)',
    logoColor: '#4a6741', logoAccent: '#2c2416', btnBg: '#4a6741',
    accentColor: '#4a6741', cardDevam: '#4a6741',
  },
  guven: {
    pageBg: '#f0f9ff', headerBg: 'rgba(255,255,255,0.96)', headerBorder: 'rgba(11,29,58,0.1)',
    heroBg: 'linear-gradient(150deg,#0b1d3a 0%,#0f3460 60%,#1a5276 100%)',
    heroAvtBorder: 'rgba(6,182,212,0.4)', heroAvtBg: 'linear-gradient(135deg,#0e7490,#06b6d4)',
    logoColor: '#0e7490', logoAccent: '#0b1d3a', btnBg: '#06b6d4',
    accentColor: '#0e7490', cardDevam: '#0e7490',
  },
  sicak: {
    pageBg: '#fdf8f4', headerBg: 'rgba(253,248,244,0.96)', headerBorder: 'rgba(193,123,94,0.15)',
    heroBg: 'linear-gradient(150deg,#1a0f07 0%,#3d2010 60%,#6b3a20 100%)',
    heroAvtBorder: 'rgba(229,168,132,0.4)', heroAvtBg: 'linear-gradient(135deg,#c17b5e,#e8a87c)',
    logoColor: '#c17b5e', logoAccent: '#1a0f07', btnBg: '#c17b5e',
    accentColor: '#c17b5e', cardDevam: '#c17b5e',
  },
}

const DEFAULT_TEMA: TemaColors = {
  pageBg: '#f4f9f7', headerBg: 'rgba(255,255,255,0.96)', headerBorder: 'rgba(74,124,111,0.12)',
  heroBg: 'linear-gradient(150deg,#0b1c14 0%,#1e4535 60%,#2d6b52 100%)',
  heroAvtBorder: 'rgba(110,231,183,0.4)', heroAvtBg: 'linear-gradient(135deg,#4a7c6f,#6ee7b7)',
  logoColor: '#4a7c6f', logoAccent: '#0d1f18', btnBg: '#4a7c6f',
  accentColor: '#4a7c6f', cardDevam: '#4a7c6f',
}

export default async function BlogListePage({ params }: Context) {
  const { slug } = await params
  const supabase = getSupabase()

  const { data: psych } = await supabase
    .from('psychologists')
    .select('id, full_name, unvan, booking_slug, foto_url, subscription_status, tema')
    .eq('booking_slug', slug)
    .single()

  if (!psych) notFound()
  if (!['active', 'trial'].includes(psych.subscription_status ?? '')) notFound()

  const { data: bloglar } = await supabase
    .from('psikolog_bloglar')
    .select('id, baslik, slug, kategori, icerik, created_at, kapak_url')
    .eq('psychologist_id', psych.id)
    .eq('yayinda', true)
    .order('created_at', { ascending: false })

  const ad = psych.unvan ? `${psych.unvan} ${psych.full_name}` : psych.full_name
  const initials = psych.full_name.split(' ').map((k: string) => k[0]).slice(0, 2).join('').toUpperCase()
  const C = TEMA_COLORS[psych.tema ?? ''] ?? DEFAULT_TEMA

  return (
    <div style={{ background: C.pageBg, minHeight: '100vh' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: C.headerBg, backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${C.headerBorder}`,
        padding: '0 20px', height: 54,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
      }}>
        <Link href="/" style={{ fontSize: 15, fontWeight: 800, color: C.logoColor, letterSpacing: '-0.5px', textDecoration: 'none' }}>
          sean<span style={{ color: C.logoAccent }}>sify</span>
        </Link>
        <Link href={`/${slug}`} style={{ fontSize: 13, fontWeight: 600, color: '#475569', textDecoration: 'none', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          {ad}
        </Link>
        <Link
          href={`/book/${slug}`}
          style={{
            background: C.btnBg, color: '#fff', borderRadius: 10, padding: '8px 18px',
            fontSize: 13, fontWeight: 700, textDecoration: 'none',
            boxShadow: `0 2px 8px ${C.btnBg}55`,
          }}
        >
          Randevu Al
        </Link>
      </header>

      {/* Blog hero */}
      <div style={{
        background: C.heroBg,
        padding: '44px 20px 40px', textAlign: 'center',
      }}>
        <Link href={`/${slug}`} style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto',
            border: `2px solid ${C.heroAvtBorder}`, overflow: 'hidden',
            background: C.heroAvtBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {psych.foto_url
              ? <img src={psych.foto_url} alt={ad} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{initials}</span>
            }
          </div>
        </Link>
        <Link href={`/${slug}`} style={{ textDecoration: 'none' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 600, margin: '0 0 6px' }}>{ad}</p>
        </Link>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Blog</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
          {bloglar?.length ?? 0} yazı
        </p>
      </div>

      {/* Liste */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>
        {!bloglar || bloglar.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ fontSize: 15, color: '#94a3b8' }}>Henüz blog yazısı yok.</p>
            <Link href={`/${slug}`} style={{ fontSize: 13, color: C.accentColor, fontWeight: 600, textDecoration: 'none' }}>
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
                    background: '#fff', borderRadius: 20,
                    border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                  }}>
                    {/* Kapak resmi */}
                    {b.kapak_url && (
                      <div style={{
                        width: '100%', height: 180,
                        background: `url(${b.kapak_url}) center/cover no-repeat`,
                      }} />
                    )}
                    <div style={{ padding: '20px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
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
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0d1f18', margin: '0 0 8px', lineHeight: 1.35 }}>
                        {b.baslik}
                      </h2>
                      <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: '0 0 14px' }}>
                        {ozet(b.icerik)}
                      </p>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.cardDevam }}>
                        Devamını oku →
                      </span>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 20px 40px' }}>
        <Link href={`/${slug}`} style={{ fontSize: 13, color: C.accentColor, fontWeight: 600, textDecoration: 'none' }}>
          ← {ad} profiline dön
        </Link>
      </div>
    </div>
  )
}

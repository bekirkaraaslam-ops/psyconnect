'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Egitim {
  baslik: string
  kurum: string
  yil?: string
}

interface Paket {
  id: string
  name: string
  session_count: number
  price_tl: number
}

interface Blog {
  id: string
  baslik: string
  slug: string
  kategori: string | null
  icerik: string
  created_at: string
}

interface Yorum {
  id: string
  yildiz: number
  yorum_metni: string | null
  reviewer_init: string | null
  dolduruldu_at: string | null
}

interface ProfilGorunum {
  show_uzmanlik?: boolean
  show_paketler?: boolean
  show_yorumlar?: boolean
  show_blog?: boolean
  show_egitim?: boolean
  show_klinik?: boolean
  show_seans_sayisi?: boolean
  show_ilk_seans?: boolean
}

interface Psych {
  id: string
  full_name: string
  booking_slug: string
  unvan: string | null
  sehir: string | null
  bio_text: string | null
  uzmanlik_alanlari: string[] | null
  egitim: Egitim[] | null
  foto_url: string | null
  klinik_adi: string | null
  klinik_adres: string | null
  klinik_tel: string | null
  calisma_saatleri: string | null
  profil_alinti: string | null
  deneyim_yil: number | null
  dil: string[] | null
  session_duration_minutes: number | null
  profil_gorunum: ProfilGorunum | null
  ilk_seans_metni: string | null
}

interface Props {
  psych: Psych
  bloglar: Blog[]
  yorumlar: Yorum[]
  paketler: Paket[]
  tamamlananSeans: number
}

const KATEGORİ_RENK: Record<string, { bg: string; color: string }> = {
  'Anksiyete':  { bg: '#fef3c7', color: '#92400e' },
  'Depresyon':  { bg: '#fce7f3', color: '#9d174d' },
  'İlişkiler':  { bg: '#ede9fe', color: '#5b21b6' },
  'Öz Bakım':   { bg: '#e0f2fe', color: '#075985' },
  'Travma':     { bg: '#fef2f2', color: '#991b1b' },
  'Aile':       { bg: '#ecfdf5', color: '#065f46' },
}

function katRenk(kat: string | null) {
  if (!kat) return { bg: '#f0fdf4', color: '#166534' }
  return KATEGORİ_RENK[kat] ?? { bg: '#f0fdf4', color: '#166534' }
}

function blogOzet(icerik: string) {
  return icerik.replace(/#+\s/g, '').replace(/\*\*/g, '').slice(0, 90) + '...'
}

function tarihFormatla(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
}

function okumaMin(icerik: string) {
  return Math.max(1, Math.round(icerik.split(/\s+/).length / 200))
}

export default function ProfilClient({ psych, bloglar, yorumlar, paketler, tamamlananSeans }: Props) {
  const [bioExpanded, setBioExpanded] = useState(false)

  const g = psych.profil_gorunum ?? {}
  const show = {
    uzmanlik:    g.show_uzmanlik    !== false,
    paketler:    g.show_paketler    !== false,
    yorumlar:    g.show_yorumlar    !== false,
    blog:        g.show_blog        !== false,
    egitim:      g.show_egitim      !== false,
    klinik:      g.show_klinik      !== false,
    seansSayisi: g.show_seans_sayisi === true,
    ilkSeans:    g.show_ilk_seans    !== false,
  }

  const ad = psych.full_name
  const unvanTam = psych.unvan ? `${psych.unvan} ${ad}` : ad
  const initials = ad.split(' ').map(k => k[0]).slice(0, 2).join('').toUpperCase()

  const bioParagraphs = psych.bio_text?.split('\n\n') ?? []
  const bioShort = bioParagraphs[0] ?? ''
  const bioHasMore = bioParagraphs.length > 1

  return (
    <div style={{ background: '#f4f9f7', minHeight: '100vh', paddingBottom: 88 }}>

      {/* HEADER */}
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
        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569', position: 'absolute', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
          {unvanTam}
        </span>
        <Link
          href={`/book/${psych.booking_slug}`}
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

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(150deg,#0b1c14 0%,#152b1e 35%,#1e4535 70%,#2d6b52 100%)',
        padding: '36px 20px 0', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(110,231,183,0.07),transparent 70%)',
          top: -80, right: -80, pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Profil satırı */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {psych.foto_url ? (
                <img src={psych.foto_url} alt={ad} style={{ width: 80, height: 80, borderRadius: 20, objectFit: 'cover', border: '2px solid rgba(110,231,183,0.3)' }} />
              ) : (
                <div style={{
                  width: 80, height: 80, borderRadius: 20,
                  background: 'linear-gradient(135deg,#4a7c6f,#6ee7b7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 800, color: '#fff',
                  border: '2px solid rgba(110,231,183,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}>
                  {initials}
                </div>
              )}
              <div style={{
                position: 'absolute', bottom: -2, right: -2,
                width: 18, height: 18, borderRadius: '50%',
                background: '#22c55e', border: '3px solid #152b1e',
              }} />
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#6ee7b7', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>
                {psych.unvan ?? 'Psikolog'}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.15, marginBottom: 5 }}>
                {ad}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {psych.sehir && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {psych.sehir}
                  </span>
                )}
                {psych.deneyim_yil && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{psych.deneyim_yil} yıl deneyim</span>
                )}
              </div>
            </div>
          </div>

          {/* Alıntı */}
          {psych.profil_alinti && (
            <div style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderLeft: '3px solid #6ee7b7', borderRadius: '0 10px 10px 0',
              padding: '10px 14px', marginBottom: 18,
              fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, fontStyle: 'italic',
            }}>
              &quot;{psych.profil_alinti}&quot;
            </div>
          )}

          {/* Chip'ler */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 20, background: 'rgba(110,231,183,0.12)', border: '1px solid rgba(110,231,183,0.25)', color: '#6ee7b7' }}>● Randevu Mevcut</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}>Online</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}>Yüz Yüze</span>
            {psych.dil && psych.dil.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '5px 11px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}>
                {psych.dil.join(' · ')}
              </span>
            )}
          </div>

          {/* Stats bant — hero'nun alt kısmı, beyaza geçiş */}
          {(() => {
            const cols = [
              psych.deneyim_yil ? { value: `${psych.deneyim_yil}`, label: 'Yıl Deneyim' } : null,
              yorumlar.length > 0 ? { value: `${(yorumlar.reduce((s, y) => s + y.yildiz, 0) / yorumlar.length).toFixed(1)}★`, label: 'Değerlendirme' } : null,
              { value: `${psych.session_duration_minutes ?? 50} dk`, label: 'Seans Süresi' },
              show.seansSayisi && tamamlananSeans > 0 ? { value: `${tamamlananSeans}+`, label: 'Tamamlanan Seans' } : null,
            ].filter(Boolean) as { value: string; label: string }[]

            return (
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${cols.length}, 1fr)`,
                marginTop: 28,
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '14px 14px 0 0',
                border: '1px solid rgba(255,255,255,0.07)',
                borderBottom: 'none',
                overflow: 'hidden',
              }}>
                {cols.map((col, i) => (
                  <div key={col.label} style={{ padding: '16px 12px', textAlign: 'center', borderRight: i < cols.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{col.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{col.label}</div>
                  </div>
                ))}
              </div>
            )
          })()}

        </div>
      </section>

      {/* QUICK BAR */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e4eeea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', overflowX: 'auto' }}>
          {psych.calisma_saatleri && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 16px', borderRight: '1px solid #f0f7f4', flexShrink: 0, whiteSpace: 'nowrap' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ fontSize: 12, color: '#64748b' }}>{psych.calisma_saatleri}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 16px', borderRight: '1px solid #f0f7f4', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: 12, color: '#64748b' }}>İlk görüşme <strong style={{ color: '#1e293b' }}>ücretsiz</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 16px', borderRight: '1px solid #f0f7f4', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: 12, color: '#64748b' }}><strong style={{ color: '#1e293b' }}>48 saat</strong> içinde yanıt</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '11px 16px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span style={{ fontSize: 12, color: '#64748b' }}>Gizlilik <strong style={{ color: '#1e293b' }}>güvencesi</strong></span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* HAKKIMDA */}
        {psych.bio_text && (
          <>
            <div style={{ padding: '22px 20px' }}>
              <SectionTitle>Hakkımda</SectionTitle>
              <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #e4eeea', boxShadow: '0 2px 12px rgba(74,124,111,0.05)' }}>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, margin: 0 }}>
                  {bioExpanded ? psych.bio_text : bioShort}
                </p>
                {bioHasMore && (
                  <button
                    onClick={() => setBioExpanded(e => !e)}
                    style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#4a7c6f', fontWeight: 700, padding: 0 }}
                  >
                    {bioExpanded ? 'Daha az göster ↑' : 'Devamını oku →'}
                  </button>
                )}
              </div>
            </div>
            <Divider />
          </>
        )}

        {/* İLK SEANS */}
        {show.ilkSeans && psych.ilk_seans_metni && (
          <>
            <Divider />
            <div style={{ padding: '22px 20px' }}>
              <SectionTitle>İlk Seans Nasıl Geçer?</SectionTitle>
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e4eeea', overflow: 'hidden' }}>
                {psych.ilk_seans_metni.split('\n\n').filter(Boolean).map((paragraf, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 14, padding: '14px 18px',
                    borderBottom: i < psych.ilk_seans_metni!.split('\n\n').filter(Boolean).length - 1 ? '1px solid #f0f7f4' : 'none',
                    alignItems: 'flex-start',
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                      background: 'linear-gradient(135deg,#4a7c6f,#6ee7b7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: '#fff',
                    }}>
                      {i + 1}
                    </div>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.75, margin: 0 }}>{paragraf.trim()}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* UZMANLIK */}
        {show.uzmanlik && psych.uzmanlik_alanlari && psych.uzmanlik_alanlari.length > 0 && (
          <>
            <Divider />
            <div style={{ padding: '22px 20px' }}>
              <SectionTitle>Uzmanlık Alanları</SectionTitle>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {psych.uzmanlik_alanlari.map(alan => (
                  <span key={alan} style={{ fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 10, background: '#fff', color: '#15803d', border: '1.5px solid #bbf7d0', boxShadow: '0 1px 4px rgba(74,124,111,0.08)' }}>
                    {alan}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* EĞİTİM */}
        {show.egitim && psych.egitim && psych.egitim.length > 0 && (
          <>
            <Divider />
            <div style={{ padding: '22px 20px' }}>
              <SectionTitle>Eğitim & Sertifikalar</SectionTitle>
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e4eeea', overflow: 'hidden' }}>
                {psych.egitim.map((e, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 14, padding: '14px 18px',
                    borderBottom: i < psych.egitim!.length - 1 ? '1px solid #f0f7f4' : 'none',
                    alignItems: 'center',
                  }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{e.baslik}</div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>{e.kurum}{e.yil ? ` · ${e.yil}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* SEANS PAKETLERİ */}
        {show.paketler && paketler.length > 0 && (
          <>
            <Divider />
            <div style={{ padding: '22px 20px' }}>
              <SectionTitle>Seans Paketleri</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {paketler.map(p => (
                  <div key={p.id} style={{
                    background: '#fff', borderRadius: 14, padding: '16px 18px',
                    border: '1px solid #e4eeea', boxShadow: '0 1px 6px rgba(74,124,111,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 5 }}>{p.name}</div>
                      <div style={{ display: 'flex', gap: 7 }}>
                        <span style={{ fontSize: 11, color: '#64748b', background: '#f4f9f7', padding: '3px 9px', borderRadius: 6, border: '1px solid #e4eeea' }}>
                          {p.session_count} seans
                        </span>
                        <span style={{ fontSize: 11, color: '#4a7c6f', background: '#f0fdf4', padding: '3px 9px', borderRadius: 6, border: '1px solid #bbf7d0', fontWeight: 600 }}>
                          ₺{(p.price_tl / p.session_count).toFixed(0)}/seans
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 19, fontWeight: 800, color: '#0d1f18', lineHeight: 1 }}>
                        ₺{Number(p.price_tl).toLocaleString('tr-TR')}
                      </div>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>toplam</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <Link
                  href={`/book/${psych.booking_slug}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: 'linear-gradient(135deg,#4a7c6f,#3a6b5e)', color: '#fff',
                    borderRadius: 12, padding: '11px 24px', fontSize: 13, fontWeight: 700,
                    textDecoration: 'none', boxShadow: '0 3px 12px rgba(74,124,111,0.35)',
                  }}
                >
                  Paket Seç & Randevu Al →
                </Link>
              </div>
            </div>
          </>
        )}

        {/* YORUMLAR */}
        {show.yorumlar && yorumlar.length > 0 && (
          <>
            <Divider />
            <div style={{ padding: '22px 20px' }}>
              <SectionTitle>Danışan Deneyimleri</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {yorumlar.filter(y => y.yorum_metni).slice(0, 3).map(y => (
                  <div key={y.id} style={{
                    background: '#fff', borderRadius: 14, padding: '15px 18px',
                    border: '1px solid #e4eeea', borderLeft: '3px solid #4a7c6f',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#4a7c6f,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                        {y.reviewer_init ?? '?'}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{y.reviewer_init ?? 'Anonim'}</span>
                      <span style={{ marginLeft: 'auto', color: '#f59e0b', fontSize: 11 }}>{'★'.repeat(y.yildiz)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.65, fontStyle: 'italic', margin: 0 }}>
                      &quot;{y.yorum_metni}&quot;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* BLOG — yatay kaydırma */}
        {show.blog && bloglar.length > 0 && (
          <>
            <Divider />
            <div style={{ padding: '22px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, padding: '0 20px' }}>
                <SectionTitle noMargin>Blog Yazıları</SectionTitle>
                <Link href={`/${psych.booking_slug}/blog`} style={{ fontSize: 12, color: '#4a7c6f', fontWeight: 700, textDecoration: 'none' }}>Tümü →</Link>
              </div>
              <div style={{
                display: 'flex', gap: 12, overflowX: 'auto', paddingLeft: 20, paddingRight: 20, paddingBottom: 4,
                scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch',
              }}>
                {bloglar.map(b => {
                  const renk = katRenk(b.kategori)
                  return (
                    <Link
                      key={b.id}
                      href={`/${psych.booking_slug}/blog/${b.slug}`}
                      style={{
                        minWidth: 200, width: 200, flexShrink: 0, scrollSnapAlign: 'start',
                        background: '#fff', borderRadius: 16, padding: '16px',
                        border: '1px solid #e4eeea', textDecoration: 'none', display: 'block',
                        boxShadow: '0 2px 10px rgba(74,124,111,0.04)',
                      }}
                    >
                      {b.kategori && (
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', borderRadius: 5, display: 'inline-block', marginBottom: 8, background: renk.bg, color: renk.color }}>
                          {b.kategori}
                        </span>
                      )}
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', lineHeight: 1.45, marginBottom: 6, margin: '0 0 6px' }}>{b.baslik}</h3>
                      <p style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.55, margin: '0 0 10px' }}>{blogOzet(b.icerik)}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8' }}>
                        <span>{tarihFormatla(b.created_at)}</span>
                        <span style={{ color: '#4a7c6f', fontWeight: 600 }}>{okumaMin(b.icerik)} dk</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* KLİNİK — compact, haritasız */}
        {show.klinik && (psych.klinik_adi || psych.klinik_adres) && (
          <>
            <Divider />
            <div style={{ padding: '22px 20px' }}>
              <SectionTitle>Klinik & Konum</SectionTitle>
              <div style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #e4eeea', boxShadow: '0 2px 12px rgba(74,124,111,0.05)' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    {psych.klinik_adi && <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{psych.klinik_adi}</div>}
                    {psych.klinik_adres && <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 10 }}>{psych.klinik_adres}</div>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                      {psych.calisma_saatleri && (
                        <span style={{ fontSize: 11, color: '#475569', background: '#f4f9f7', border: '1px solid #e4eeea', borderRadius: 8, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {psych.calisma_saatleri}
                        </span>
                      )}
                      {psych.klinik_tel && (
                        <span style={{ fontSize: 11, color: '#475569', background: '#f4f9f7', border: '1px solid #e4eeea', borderRadius: 8, padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.38 2 2 0 0 1 3.6 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.98-.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          {psych.klinik_tel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* FOOTER */}
      <footer style={{ background: '#fff', borderTop: '1px solid #e4eeea', padding: '16px 24px', textAlign: 'center', fontSize: 11, color: '#94a3b8', marginBottom: 0 }}>
        Bu sayfa <Link href="/" style={{ color: '#4a7c6f', textDecoration: 'none', fontWeight: 700 }}>Seansify</Link> altyapısıyla oluşturulmuştur &nbsp;·&nbsp; seansify.com/{psych.booking_slug}
      </footer>

      {/* FLOATING RANDEVU BUTONU */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
        padding: '12px 16px 16px',
        background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(74,124,111,0.12)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}>
        <Link
          href={`/book/${psych.booking_slug}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: 'linear-gradient(135deg,#4a7c6f,#3a6b5e)', color: '#fff',
            borderRadius: 14, padding: '14px', fontSize: 15, fontWeight: 700,
            textDecoration: 'none', boxShadow: '0 4px 16px rgba(74,124,111,0.4)',
            maxWidth: 720, margin: '0 auto',
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Randevu Talebi Oluştur
        </Link>
      </div>

    </div>
  )
}

function SectionTitle({ children, noMargin }: { children: React.ReactNode; noMargin?: boolean }) {
  return (
    <div style={{ fontSize: 15, fontWeight: 800, color: '#0d1f18', marginBottom: noMargin ? 0 : 12, display: 'flex', alignItems: 'center', gap: 7 }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4a7c6f', display: 'inline-block', flexShrink: 0 }} />
      {children}
    </div>
  )
}

function Divider() {
  return <div style={{ height: 1, background: 'linear-gradient(90deg,#e4eeea,transparent)', margin: '0 20px' }} />
}

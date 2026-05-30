'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { WebsiteProps, blogOzet, tarih, okumaMin } from './websiteTypes'

const C = {
  terra: '#a85530',
  terraMid: '#c96a42',
  terraLight: '#faeae2',
  cream: '#faf6f1',
  warm: '#f3ebe1',
  white: '#ffffff',
  ink: '#2d1f1a',
  inkLight: '#7a5c52',
  border: '#e6d8cf',
  mauve: '#8b5e6e',
}

export default function TemaDalgaClient({ psych, bloglar, yorumlar, paketler }: WebsiteProps) {
  const [bioExpanded, setBioExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const els = document.querySelectorAll('.dalga-scroll-fade')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } }),
      { threshold: 0.07 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  const ad = psych.full_name
  const unvanTam = psych.unvan ? `${psych.unvan} ${ad}` : ad
  const initials = ad.split(' ').map(k => k[0]).slice(0, 2).join('').toUpperCase()
  const ortalamaPuan = yorumlar.length > 0 ? (yorumlar.reduce((s, y) => s + y.yildiz, 0) / yorumlar.length).toFixed(1) : null
  const bioParagraphs = psych.bio_text?.split('\n\n') ?? []
  const bioShort = bioParagraphs[0] ?? ''
  const bioHasMore = bioParagraphs.length > 1

  const navLinks = [
    { href: '#hakkimda', label: 'Hakkımda' },
    { href: '#yaklasim', label: 'Yaklaşımım' },
    { href: '#uzmanlik', label: 'Uzmanlık' },
    ...(bloglar.length > 0 ? [{ href: '#blog', label: 'Blog' }] : []),
    { href: '#iletisim', label: 'İletişim' },
  ]

  return (
    <div style={{ fontFamily: "'Nunito', system-ui, sans-serif", background: C.cream, color: C.ink, lineHeight: 1.6 }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,600&family=Nunito:wght@400;500;600;700&display=swap');

        @keyframes dalga-slide-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .dalga-hero-left > * {
          opacity: 0;
          animation: dalga-slide-up 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .dalga-hero-left > *:nth-child(1) { animation-delay: 0s; }
        .dalga-hero-left > *:nth-child(2) { animation-delay: 0.1s; }
        .dalga-hero-left > *:nth-child(3) { animation-delay: 0.2s; }
        .dalga-hero-left > *:nth-child(4) { animation-delay: 0.3s; }
        .dalga-hero-photo-anim {
          opacity: 0;
          animation: dalga-slide-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.18s forwards;
        }
        .dalga-scroll-fade {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .dalga-scroll-fade.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .dalga-btn-cta {
          transition: transform 0.18s ease, box-shadow 0.18s ease !important;
        }
        .dalga-btn-cta:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(168,85,48,0.35) !important;
        }
        .dalga-card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .dalga-card-hover:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 32px rgba(45,31,26,0.1) !important;
        }

        @media (max-width: 768px) {
          .dalga-nav-links { display: none !important; }
          .dalga-hamburger { display: block !important; }
          .dalga-hero-grid { grid-template-columns: 1fr !important; }
          .dalga-hero-photo { display: flex !important; justify-content: center; order: -1; margin-bottom: 28px; }
          .dalga-hero-photo img, .dalga-hero-photo > div:first-child { width: 140px !important; height: 140px !important; aspect-ratio: 1/1 !important; border-radius: 50% !important; }
          .dalga-hero-badge { display: none !important; }
          .dalga-bio-grid { grid-template-columns: 1fr !important; }
          .dalga-yaklasim-grid { grid-template-columns: 1fr !important; }
          .dalga-blog-grid { grid-template-columns: 1fr !important; }
          .dalga-yorumlar-grid { grid-template-columns: 1fr !important; }
          .dalga-cta-inner { grid-template-columns: 1fr !important; gap: 24px !important; }
          .dalga-section { padding: 48px 20px !important; }
          .dalga-hero-section { padding: 48px 20px 0 !important; }
          .dalga-stats-inner { grid-template-columns: 1fr 1fr !important; padding: 0 20px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(234,215,203,0.97)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${C.border}`, padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 19, fontWeight: 600, color: C.ink, letterSpacing: '-0.3px' }}>{unvanTam}</span>
        <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }} className="dalga-nav-links">
          {navLinks.map(l => (
            <li key={l.href}><a href={l.href} style={{ fontSize: 13, color: C.inkLight, textDecoration: 'none', padding: '6px 12px', borderRadius: 100, fontWeight: 600 }}>{l.label}</a></li>
          ))}
          <li><Link href={`https://seansify.com/book/${psych.booking_slug}`} className="dalga-btn-cta" style={{ background: C.terra, color: '#fff', borderRadius: 100, padding: '10px 22px', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginLeft: 8, display: 'inline-block' }}>Randevu Al</Link></li>
        </ul>
        <button onClick={() => setMenuOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: C.ink }} className="dalga-hamburger">{menuOpen ? '✕' : '☰'}</button>
      </nav>

      {menuOpen && (
        <div style={{ position: 'fixed', top: 68, left: 0, right: 0, zIndex: 99, background: C.white, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4, borderBottom: `1px solid ${C.border}` }}>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ fontSize: 15, color: C.ink, textDecoration: 'none', padding: '12px 0', borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>{l.label}</a>
          ))}
          <Link href={`https://seansify.com/book/${psych.booking_slug}`} onClick={() => setMenuOpen(false)} style={{ marginTop: 12, display: 'block', textAlign: 'center', background: C.terra, color: '#fff', borderRadius: 100, padding: '13px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>Randevu Al</Link>
        </div>
      )}

      {/* HERO */}
      <section className="dalga-hero-section" style={{ background: C.warm, padding: '72px 48px 0', position: 'relative', overflow: 'hidden' }}>
        {/* deco circles */}
        <div style={{ position: 'absolute', top: -100, right: 160, width: 440, height: 440, borderRadius: '50%', border: `72px solid rgba(168,85,48,0.07)`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 40, left: -60, width: 180, height: 180, borderRadius: '50%', background: 'rgba(168,85,48,0.05)', pointerEvents: 'none' }} />
        <div className="dalga-hero-grid" style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 64, alignItems: 'end', position: 'relative', zIndex: 2 }}>
          <div className="dalga-hero-left" style={{ paddingBottom: 72 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.terraLight, color: C.terra, borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 700 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.terra }} />
              {psych.unvan ?? 'Psikolog'}{psych.sehir ? ` · ${psych.sehir}` : ''}
            </div>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 'clamp(48px,5.5vw,64px)', fontWeight: 600, color: C.ink, lineHeight: 1.0, letterSpacing: '-2px', margin: 0 }}>
              {ad.split(' ').map((word, i, arr) => (
                <span key={i}>{i === arr.length - 1 ? <em style={{ fontStyle: 'italic', color: C.terraMid }}>{word}</em> : <>{word}<br /></>}</span>
              ))}
            </h1>
            {psych.profil_alinti && (
              <p style={{ fontSize: 15, color: C.inkLight, lineHeight: 1.85, margin: 0, maxWidth: 420 }}>{psych.profil_alinti}</p>
            )}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <Link href={`https://seansify.com/book/${psych.booking_slug}`} className="dalga-btn-cta" style={{ background: C.terra, color: '#fff', borderRadius: 100, padding: '14px 32px', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
                Randevu Talebi Oluştur
              </Link>
              <a href="#hakkimda" style={{ fontSize: 13, color: C.inkLight, textDecoration: 'none', border: `1.5px solid ${C.border}`, borderRadius: 100, padding: '13px 22px', fontWeight: 600 }}>Hakkımda ↓</a>
            </div>
          </div>
          <div className="dalga-hero-photo dalga-hero-photo-anim" style={{ position: 'relative', alignSelf: 'end' }}>
            {psych.foto_url ? (
              <img src={psych.foto_url} alt={ad} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '180px 180px 0 0', display: 'block' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: '180px 180px 0 0', background: `linear-gradient(160deg, #f0c4ae, ${C.terraLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Fraunces', serif", fontSize: 80, color: C.terra }}>
                {initials}
              </div>
            )}
            {psych.deneyim_yil && (
              <div className="dalga-hero-badge" style={{ position: 'absolute', bottom: 32, left: -24, background: C.white, borderRadius: 100, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 6px 24px rgba(45,31,26,0.12)' }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 22, color: C.terra, fontWeight: 700 }}>{psych.deneyim_yil}</span>
                <span style={{ fontSize: 12, color: C.inkLight, fontWeight: 600 }}>Yıl Deneyim</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* WAVE DIVIDER */}
      <div style={{ background: C.warm }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: 60 }}>
          <path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" fill={C.white} />
        </svg>
      </div>

      {/* STATS */}
      <div style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div className="dalga-stats-inner" style={{ maxWidth: 1160, margin: '0 auto', padding: '0 48px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {[
            psych.deneyim_yil ? { v: `${psych.deneyim_yil}`, l: 'Yıl Deneyim' } : null,
            ortalamaPuan ? { v: `${ortalamaPuan}★`, l: 'Değerlendirme' } : null,
            psych.session_duration_minutes ? { v: `${psych.session_duration_minutes} dk`, l: 'Seans Süresi' } : null,
            psych.calisma_saatleri ? { v: psych.calisma_saatleri, l: 'Çalışma' } : null,
          ].filter(Boolean).map((s, i, arr) => s && (
            <div key={i} style={{ padding: '20px 16px', textAlign: 'center', borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 26, color: C.terra, lineHeight: 1, marginBottom: 6 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: C.inkLight, fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HAKKIMDA */}
      {psych.bio_text && (
        <section id="hakkimda" className="dalga-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.terraLight, color: C.terra, borderRadius: 100, padding: '5px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 20 }}>01 — Hakkımda</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 600, color: C.ink, lineHeight: 1.2, margin: '0 0 36px' }}>
            Kendinizi anlamak için<br /><em style={{ fontStyle: 'italic', color: C.terraMid }}>buradayım</em>
          </h2>
          <div className="dalga-bio-grid dalga-scroll-fade" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 56, alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 15, color: C.inkLight, lineHeight: 1.85, margin: '0 0 16px' }}>{bioExpanded ? psych.bio_text : bioShort}</p>
              {bioHasMore && (
                <button onClick={() => setBioExpanded(e => !e)} style={{ background: 'none', border: `1.5px solid ${C.border}`, color: C.terra, borderRadius: 100, padding: '9px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {bioExpanded ? 'Daha az ↑' : 'Devamını oku →'}
                </button>
              )}
            </div>
            {psych.egitim && psych.egitim.length > 0 && (
              <div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: C.ink, marginBottom: 16 }}>Eğitim</div>
                {psych.egitim.slice(0, 3).map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.terraLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>🎓</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{e.baslik}</div>
                      <div style={{ fontSize: 12, color: C.inkLight, marginTop: 1 }}>{e.kurum}{e.yil ? ` · ${e.yil}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* WAVE */}
      <div style={{ background: C.cream }}>
        <svg viewBox="0 0 1440 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', width: '100%', height: 48 }}>
          <path d="M0,24 C360,48 720,0 1080,24 C1260,36 1380,20 1440,24 L1440,0 L0,0 Z" fill={C.warm} />
        </svg>
      </div>

      {/* YAKLAŞIM */}
      {psych.yaklasim && psych.yaklasim.length > 0 && (
        <section id="yaklasim" style={{ background: C.warm, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div className="dalga-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 48px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.terraLight, color: C.terra, borderRadius: 100, padding: '5px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 20 }}>02 — Yaklaşımım</div>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 600, color: C.ink, lineHeight: 1.2, margin: '0 0 36px' }}>
              Çalışma <em style={{ fontStyle: 'italic', color: C.terraMid }}>Felsefem</em>
            </h2>
            <div className="dalga-yaklasim-grid dalga-scroll-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {psych.yaklasim.map((y, i) => (
                <div key={i} className="dalga-card-hover" style={{ background: C.white, borderRadius: 24, padding: '28px', border: `1px solid ${C.border}` }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: C.terraLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, marginBottom: 18 }}>{y.ikon}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: '0 0 10px' }}>{y.baslik}</h3>
                  <p style={{ fontSize: 13, color: C.inkLight, lineHeight: 1.7, margin: 0 }}>{y.aciklama}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* UZMANLIK */}
      {psych.uzmanlik_alanlari && psych.uzmanlik_alanlari.length > 0 && (
        <section id="uzmanlik" className="dalga-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.terraLight, color: C.terra, borderRadius: 100, padding: '5px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 20 }}>03 — Uzmanlık</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 600, color: C.ink, lineHeight: 1.2, margin: '0 0 28px' }}>
            Uzmanlık <em style={{ fontStyle: 'italic', color: C.terraMid }}>Alanlarım</em>
          </h2>
          <div className="dalga-scroll-fade" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {psych.uzmanlik_alanlari.map(alan => (
              <span key={alan} style={{ fontSize: 13, fontWeight: 700, color: C.terra, background: C.terraLight, borderRadius: 100, padding: '9px 20px' }}>{alan}</span>
            ))}
          </div>
        </section>
      )}

      {/* BLOG */}
      {bloglar.length > 0 && (
        <section id="blog" style={{ background: C.warm, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div className="dalga-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 48px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.terraLight, color: C.terra, borderRadius: 100, padding: '5px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>04 — Blog</div>
              <Link href={`https://${psych.booking_slug}.seansify.com/blog`} style={{ fontSize: 13, fontWeight: 700, color: C.terra, textDecoration: 'none' }}>Tümünü gör →</Link>
            </div>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 600, color: C.ink, lineHeight: 1.2, margin: '16px 0 28px' }}>
              Son <em style={{ fontStyle: 'italic', color: C.terraMid }}>Yazılar</em>
            </h2>
            <div className="dalga-blog-grid dalga-scroll-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 20 }}>
              {bloglar.slice(0, 4).map(b => (
                <Link key={b.id} href={`https://${psych.booking_slug}.seansify.com/blog/${b.slug}`} className="dalga-card-hover" style={{ textDecoration: 'none', background: C.white, borderRadius: 24, padding: '28px', border: `1px solid ${C.border}`, display: 'block' }}>
                  {b.kategori && <div style={{ fontSize: 11, fontWeight: 700, color: C.terra, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 10 }}>{b.kategori}</div>}
                  <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: C.ink, lineHeight: 1.3, marginBottom: 10 }}>{b.baslik}</div>
                  <div style={{ fontSize: 13, color: C.inkLight, lineHeight: 1.7 }}>{blogOzet(b.icerik, 120)}</div>
                  <div style={{ fontSize: 12, color: C.inkLight, marginTop: 16 }}>{tarih(b.created_at)} · {okumaMin(b.icerik)} dk okuma</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* YORUMLAR */}
      {yorumlar.length > 0 && (
        <section className="dalga-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.terraLight, color: C.terra, borderRadius: 100, padding: '5px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 20 }}>05 — Yorumlar</div>
          <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 600, color: C.ink, lineHeight: 1.2, margin: '0 0 28px' }}>
            Danışan <em style={{ fontStyle: 'italic', color: C.terraMid }}>Deneyimleri</em>
          </h2>
          <div className="dalga-yorumlar-grid dalga-scroll-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {yorumlar.filter(y => y.yorum_metni).slice(0, 3).map(y => (
              <div key={y.id} className="dalga-card-hover" style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 20, padding: '24px' }}>
                <div style={{ color: C.terra, fontSize: 14, marginBottom: 12 }}>{'★'.repeat(y.yildiz)}</div>
                <p style={{ fontSize: 13, color: C.inkLight, lineHeight: 1.75, fontStyle: 'italic', margin: '0 0 14px' }}>&ldquo;{y.yorum_metni}&rdquo;</p>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{y.reviewer_init ?? 'Anonim'}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* RANDEVU / CTA */}
      <section style={{ background: C.terra, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -80, top: -80, width: 400, height: 400, borderRadius: '50%', border: '60px solid rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: -40, bottom: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div className="dalga-cta-inner" style={{ maxWidth: 1160, margin: '0 auto', padding: '80px 48px', display: 'grid', gridTemplateColumns: paketler.length > 0 ? '1fr 360px' : '1fr auto', gap: 56, alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 44, color: '#fff', lineHeight: 1.15, margin: '0 0 28px' }}>
              Bir adım atmaya<br /><em style={{ fontStyle: 'italic', color: 'rgba(255,255,255,0.75)' }}>hazır mısınız?</em>
            </h2>
            <Link href={`https://seansify.com/book/${psych.booking_slug}`} style={{ background: C.white, color: C.terra, borderRadius: 100, padding: '16px 36px', fontSize: 15, fontWeight: 700, textDecoration: 'none', display: 'inline-block', transition: 'transform 0.15s' }}>
              Randevu Talebi Oluştur →
            </Link>
          </div>
          {paketler.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.2)', padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Seans Paketleri</div>
              {paketler.map(p => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{p.session_count} seans · ₺{(p.price_tl / p.session_count).toFixed(0)}/seans</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>₺{Number(p.price_tl).toLocaleString('tr-TR')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* İLETİŞİM */}
      <section id="iletisim" className="dalga-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 48px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.terraLight, color: C.terra, borderRadius: 100, padding: '5px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 20 }}>06 — İletişim</div>
        <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: 36, fontWeight: 600, color: C.ink, lineHeight: 1.2, margin: '0 0 28px' }}>Bize Ulaşın</h2>
        <div className="dalga-scroll-fade" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {psych.klinik_adi && <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{psych.klinik_adi}</div>}
          {psych.klinik_adres && <div style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.6 }}>{psych.klinik_adres}</div>}
          {psych.klinik_tel && <a href={`tel:${psych.klinik_tel}`} style={{ fontSize: 14, color: C.terra, fontWeight: 700, textDecoration: 'none' }}>📞 {psych.klinik_tel}</a>}
          {psych.calisma_saatleri && <div style={{ fontSize: 14, color: C.inkLight }}>🕐 {psych.calisma_saatleri}</div>}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.warm, borderTop: `1px solid ${C.border}`, padding: '24px 48px', textAlign: 'center', fontSize: 12, color: C.inkLight }}>
        © {new Date().getFullYear()} {unvanTam}
        &nbsp;·&nbsp;
        Randevu sistemi <a href="https://seansify.com" style={{ color: C.terra, textDecoration: 'none', fontWeight: 700 }}>Seansify</a> tarafından sağlanmaktadır
      </footer>

      {/* Floating CTA - Mobil */}
      <style>{`.dalga-floating { display: none !important; } @media (max-width: 768px) { .dalga-floating { display: block !important; } }`}</style>
      <div className="dalga-floating" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, padding: '10px 16px 16px', background: 'rgba(250,246,241,0.97)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${C.border}` }}>
        <Link href={`https://seansify.com/book/${psych.booking_slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.terra, color: '#fff', borderRadius: 100, padding: '14px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Randevu Talebi Oluştur
        </Link>
      </div>

    </div>
  )
}

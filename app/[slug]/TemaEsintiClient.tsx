'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { WebsiteProps, blogOzet, tarih, okumaMin } from './websiteTypes'
import SectionDots from './SectionDots'

const C = {
  sage: '#5a7d6c',
  sageDark: '#3d5c4e',
  sageLight: '#e2ede7',
  sageMid: '#92b8a6',
  cream: '#fafaf8',
  white: '#ffffff',
  ink: '#1c2b25',
  inkLight: '#5a6b63',
  border: '#dce8e2',
  bgSection: '#f3f7f5',
}

export default function TemaEsintiClient({ psych, bloglar, yorumlar, paketler }: WebsiteProps) {
  const [bioExpanded, setBioExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const els = document.querySelectorAll('.esinti-scroll-fade')
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
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.cream, color: C.ink, lineHeight: 1.6 }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Inter:wght@300;400;500;600&display=swap');
        html { scroll-behavior: smooth; scroll-padding-top: 68px; }

        @keyframes esinti-slide-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .esinti-hero-left > * {
          opacity: 0;
          animation: esinti-slide-up 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .esinti-hero-left > *:nth-child(1) { animation-delay: 0s; }
        .esinti-hero-left > *:nth-child(2) { animation-delay: 0.1s; }
        .esinti-hero-left > *:nth-child(3) { animation-delay: 0.2s; }
        .esinti-hero-left > *:nth-child(4) { animation-delay: 0.3s; }
        .esinti-hero-photo-anim {
          opacity: 0;
          animation: esinti-slide-up 0.7s cubic-bezier(0.22,1,0.36,1) 0.18s forwards;
        }
        .esinti-scroll-fade {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .esinti-scroll-fade.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .esinti-btn-primary {
          transition: background 0.18s ease, transform 0.18s ease !important;
        }
        .esinti-btn-primary:hover {
          background: ${C.sageDark} !important;
          transform: translateY(-1px) !important;
        }
        .esinti-blog-item:hover .esinti-blog-arrow { transform: translateX(4px); }
        .esinti-blog-arrow { transition: transform 0.2s ease; }
        .esinti-yorum-card { transition: transform 0.2s ease, box-shadow 0.2s ease !important; }
        .esinti-yorum-card:hover { transform: translateY(-3px) !important; box-shadow: 0 10px 28px rgba(28,43,37,0.08) !important; }

        @media (max-width: 768px) {
          .esinti-nav-links { display: none !important; }
          .esinti-hamburger { display: block !important; }
          .esinti-hero-grid { grid-template-columns: 1fr !important; }
          .esinti-hero-photo { display: flex !important; justify-content: center; order: -1; margin-bottom: 28px; }
          .esinti-hero-photo img, .esinti-hero-photo > div:first-child { width: 140px !important; height: 140px !important; aspect-ratio: 1/1 !important; border-radius: 50% !important; }
          .esinti-hero-badge { display: none !important; }
          .esinti-bio-grid { grid-template-columns: 1fr !important; }
          .esinti-yaklasim-grid { grid-template-columns: 1fr !important; }
          .esinti-yorumlar-grid { grid-template-columns: 1fr !important; }
          .esinti-cta-inner { grid-template-columns: 1fr !important; gap: 24px !important; }
          .esinti-section { padding: 48px 20px !important; }
          .esinti-hero-section { padding: 48px 20px 64px !important; }
          .esinti-stats-inner { padding: 0 20px !important; overflow-x: auto; }
          .esinti-blog-item { grid-template-columns: 1fr !important; gap: 8px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(210,230,221,0.97)', backdropFilter: 'blur(14px)', borderBottom: `1px solid ${C.border}`, padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 19, fontWeight: 600, color: C.ink, letterSpacing: '-0.3px' }}>{unvanTam}</span>
        <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }} className="esinti-nav-links">
          {navLinks.map(l => (
            <li key={l.href}><a href={l.href} style={{ fontSize: 13, color: C.inkLight, textDecoration: 'none', padding: '6px 12px', borderRadius: 6, fontWeight: 500 }}>{l.label}</a></li>
          ))}
          <li><Link href={`https://seansify.com/book/${psych.booking_slug}`} className="esinti-btn-primary" style={{ background: C.ink, color: '#fff', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, textDecoration: 'none', marginLeft: 8, display: 'inline-block' }}>Randevu Al</Link></li>
        </ul>
        <button onClick={() => setMenuOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: C.ink }} className="esinti-hamburger">{menuOpen ? '✕' : '☰'}</button>
      </nav>

      {menuOpen && (
        <div style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99, background: C.white, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4, borderBottom: `1px solid ${C.border}` }}>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ fontSize: 15, color: C.ink, textDecoration: 'none', padding: '12px 0', borderBottom: `1px solid ${C.border}`, fontWeight: 500 }}>{l.label}</a>
          ))}
          <Link href={`https://seansify.com/book/${psych.booking_slug}`} onClick={() => setMenuOpen(false)} style={{ marginTop: 12, display: 'block', textAlign: 'center', background: C.ink, color: '#fff', borderRadius: 10, padding: '13px', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>Randevu Al</Link>
        </div>
      )}

      {/* HERO */}
      <section className="esinti-hero-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '80px 48px 72px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 72, alignItems: 'center' }} id="top">
        <div className="esinti-hero-left esinti-hero-grid">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 1, background: C.sage }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: C.sage, letterSpacing: '2px', textTransform: 'uppercase' }}>
              {psych.unvan ?? 'Psikolog'}{psych.sehir ? ` · ${psych.sehir}` : ''}
            </span>
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 'clamp(48px,6vw,68px)', fontWeight: 600, color: C.ink, lineHeight: 1.02, letterSpacing: '-2px', margin: '0' }}>
            {ad.split(' ').map((word, i) => (
              <span key={i}>{i === ad.split(' ').length - 1 ? <em style={{ fontStyle: 'italic', color: C.sage }}>{word}</em> : <>{word}<br /></>}</span>
            ))}
          </h1>
          {psych.profil_alinti && (
            <p style={{ fontSize: 15, color: C.inkLight, lineHeight: 1.85, margin: 0, paddingLeft: 16, borderLeft: `2px solid ${C.sageMid}` }}>
              &ldquo;{psych.profil_alinti}&rdquo;
            </p>
          )}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href={`https://seansify.com/book/${psych.booking_slug}`} className="esinti-btn-primary" style={{ background: C.ink, color: '#fff', borderRadius: 8, padding: '13px 28px', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>
              Randevu Talebi Oluştur
            </Link>
            <a href="#hakkimda" style={{ fontSize: 13, color: C.inkLight, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>Hakkımda ↓</a>
          </div>
        </div>
        <div className="esinti-hero-photo esinti-hero-photo-anim" style={{ position: 'relative' }}>
          {psych.foto_url ? (
            <img src={psych.foto_url} alt={ad} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '140px 140px 24px 24px', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: '140px 140px 24px 24px', background: `linear-gradient(160deg,${C.sageLight},${C.sageMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 72, fontWeight: 600, color: C.sage }}>
              {initials}
            </div>
          )}
          {psych.deneyim_yil && (
            <div className="esinti-hero-badge" style={{ position: 'absolute', bottom: 20, left: -18, background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '12px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: C.ink, lineHeight: 1 }}>{psych.deneyim_yil}</div>
              <div style={{ fontSize: 11, color: C.inkLight, fontWeight: 500, marginTop: 2 }}>Yıl Deneyim</div>
            </div>
          )}
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, background: C.white }}>
        <div className="esinti-stats-inner" style={{ maxWidth: 1160, margin: '0 auto', padding: '0 48px', display: 'flex' }}>
          {[
            ortalamaPuan ? { v: `${ortalamaPuan}★`, l: 'Değerlendirme' } : null,
            psych.session_duration_minutes ? { v: `${psych.session_duration_minutes} dk`, l: 'Seans Süresi' } : null,
            psych.calisma_saatleri ? { v: psych.calisma_saatleri, l: 'Çalışma Saatleri' } : null,
            psych.dil ? { v: psych.dil.join(' · '), l: 'Diller' } : null,
          ].filter(Boolean).map((s, i, arr) => s && (
            <div key={i} style={{ padding: '18px 28px', borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: C.ink }}>{s.v}</span>
              <span style={{ fontSize: 11, color: C.inkLight, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.8px' }}>{s.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HAKKIMDA */}
      {psych.bio_text && (
        <section id="hakkimda" className="esinti-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 48 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.sage, letterSpacing: '2px', textTransform: 'uppercase' }}>01</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: C.ink, letterSpacing: '-0.5px', margin: 0 }}>Hakkımda</h2>
          </div>
          <div className="esinti-bio-grid esinti-scroll-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 56, alignItems: 'start' }}>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, color: C.ink, lineHeight: 1.45, margin: 0 }}>
              {psych.bio_text.split(' ').slice(0, 12).join(' ')}...
            </p>
            <div>
              <p style={{ fontSize: 15, color: C.inkLight, lineHeight: 1.85, margin: '0 0 16px' }}>{bioExpanded ? psych.bio_text : bioShort}</p>
              {bioHasMore && (
                <button onClick={() => setBioExpanded(e => !e)} style={{ background: 'none', border: `1px solid ${C.border}`, color: C.sage, borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {bioExpanded ? 'Daha az ↑' : 'Devamını oku →'}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* YAKLAŞIM */}
      {psych.yaklasim && psych.yaklasim.length > 0 && (
        <section id="yaklasim" style={{ background: C.bgSection, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div className="esinti-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 48px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 48 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.sage, letterSpacing: '2px', textTransform: 'uppercase' }}>02</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: C.ink, letterSpacing: '-0.5px', margin: 0 }}>Çalışma Felsefem</h2>
            </div>
            <div className="esinti-scroll-fade" style={{ display: 'flex', flexDirection: 'column' }}>
              {psych.yaklasim.map((y, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 24, padding: '28px 0', borderBottom: i < psych.yaklasim!.length - 1 ? `1px solid ${C.border}` : 'none', alignItems: 'start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: C.sageLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{y.ikon}</div>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: C.ink, margin: '0 0 8px' }}>{y.baslik}</h3>
                    <p style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.7, margin: 0 }}>{y.aciklama}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* UZMANLIK */}
      {psych.uzmanlik_alanlari && psych.uzmanlik_alanlari.length > 0 && (
        <section id="uzmanlik" className="esinti-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 36 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.sage, letterSpacing: '2px', textTransform: 'uppercase' }}>03</span>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: C.ink, letterSpacing: '-0.5px', margin: 0 }}>Uzmanlık Alanları</h2>
          </div>
          <div className="esinti-scroll-fade" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {psych.uzmanlik_alanlari.map(alan => (
              <span key={alan} style={{ fontSize: 13, fontWeight: 500, color: C.sage, background: C.sageLight, borderRadius: 6, padding: '9px 18px' }}>{alan}</span>
            ))}
          </div>
        </section>
      )}

      {/* EĞİTİM */}
      {psych.egitim && psych.egitim.length > 0 && (
        <section style={{ background: C.bgSection, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div className="esinti-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 48px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 36 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.sage, letterSpacing: '2px', textTransform: 'uppercase' }}>04</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: C.ink, letterSpacing: '-0.5px', margin: 0 }}>Akademik Geçmiş</h2>
            </div>
            <div className="esinti-scroll-fade" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {psych.egitim.map((e, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 12, padding: '18px 22px', border: `1px solid ${C.border}`, display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.sageLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🎓</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{e.baslik}</div>
                    <div style={{ fontSize: 12, color: C.inkLight, marginTop: 2 }}>{e.kurum}{e.yil ? ` · ${e.yil}` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BLOG */}
      {bloglar.length > 0 && (
        <section id="blog" className="esinti-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.sage, letterSpacing: '2px', textTransform: 'uppercase' }}>05</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: C.ink, letterSpacing: '-0.5px', margin: 0 }}>Son Yazılar</h2>
            </div>
            <Link href={`https://${psych.booking_slug}.seansify.com/blog`} style={{ fontSize: 13, fontWeight: 600, color: C.sage, textDecoration: 'none' }}>Tümünü gör →</Link>
          </div>
          <div className="esinti-scroll-fade" style={{ display: 'flex', flexDirection: 'column' }}>
            {bloglar.slice(0, 3).map((b, i) => (
              <Link key={b.id} href={`https://${psych.booking_slug}.seansify.com/blog/${b.slug}`} className="esinti-blog-item" style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 28, padding: '28px 0', borderBottom: i < Math.min(bloglar.length - 1, 2) ? `1px solid ${C.border}` : 'none', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: C.inkLight, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>{tarih(b.created_at).split(' ').slice(0, 2).join(' ')}</div>
                <div>
                  {b.kategori && <div style={{ fontSize: 11, fontWeight: 600, color: C.sage, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 5 }}>{b.kategori}</div>}
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, color: C.ink, lineHeight: 1.3, marginBottom: 6 }}>{b.baslik}</div>
                  <div style={{ fontSize: 13, color: C.inkLight, lineHeight: 1.65 }}>{blogOzet(b.icerik, 100)}</div>
                </div>
                <div className="esinti-blog-arrow" style={{ fontSize: 18, color: C.inkLight }}>→</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* YORUMLAR */}
      {yorumlar.length > 0 && (
        <section style={{ background: C.bgSection, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div className="esinti-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 48px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 36 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.sage, letterSpacing: '2px', textTransform: 'uppercase' }}>06</span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: C.ink, letterSpacing: '-0.5px', margin: 0 }}>Danışan Deneyimleri</h2>
            </div>
            <div className="esinti-yaklasim-grid esinti-scroll-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {yorumlar.filter(y => y.yorum_metni).slice(0, 3).map(y => (
                <div key={y.id} className="esinti-yorum-card" style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px' }}>
                  <div style={{ color: C.sage, fontSize: 13, marginBottom: 12 }}>{'★'.repeat(y.yildiz)}</div>
                  <p style={{ fontSize: 13, color: C.inkLight, lineHeight: 1.75, fontStyle: 'italic', margin: '0 0 14px' }}>&ldquo;{y.yorum_metni}&rdquo;</p>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{y.reviewer_init ?? 'Anonim'}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RANDEVU / CTA */}
      <section style={{ background: C.ink }}>
        <div className="esinti-cta-inner" style={{ maxWidth: 1160, margin: '0 auto', padding: '80px 48px', display: 'grid', gridTemplateColumns: paketler.length > 0 ? '1fr 360px' : '1fr auto', gap: 56, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 44, fontWeight: 600, color: '#fff', letterSpacing: '-1px', lineHeight: 1.15, margin: '0 0 28px' }}>
              Profesyonel destek almaya<br /><em style={{ fontStyle: 'italic', color: C.sageMid }}>hazır mısınız?</em>
            </h2>
            <Link href={`https://seansify.com/book/${psych.booking_slug}`} className="esinti-btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.white, color: C.ink, borderRadius: 8, padding: '14px 32px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              Randevu Talebi Oluştur →
            </Link>
          </div>
          {paketler.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: C.sageMid, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Seans Paketleri</div>
              {paketler.map(p => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{p.session_count} seans · ₺{(p.price_tl / p.session_count).toFixed(0)}/seans</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>₺{Number(p.price_tl).toLocaleString('tr-TR')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* İLETİŞİM */}
      <section id="iletisim" className="esinti-section" style={{ maxWidth: 1160, margin: '0 auto', padding: '72px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 36 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: C.sage, letterSpacing: '2px', textTransform: 'uppercase' }}>07</span>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 600, color: C.ink, letterSpacing: '-0.5px', margin: 0 }}>Bize Ulaşın</h2>
        </div>
        <div className="esinti-scroll-fade" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {psych.klinik_adi && <div style={{ fontSize: 15, fontWeight: 600, color: C.ink }}>{psych.klinik_adi}</div>}
          {psych.klinik_adres && <div style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.6 }}>{psych.klinik_adres}</div>}
          {psych.klinik_tel && <a href={`tel:${psych.klinik_tel}`} style={{ fontSize: 14, color: C.sage, fontWeight: 600, textDecoration: 'none' }}>📞 {psych.klinik_tel}</a>}
          {psych.calisma_saatleri && <div style={{ fontSize: 14, color: C.inkLight }}>🕐 {psych.calisma_saatleri}</div>}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.bgSection, borderTop: `1px solid ${C.border}`, padding: '24px 48px', textAlign: 'center', fontSize: 12, color: C.inkLight }}>
        © {new Date().getFullYear()} {unvanTam}
        &nbsp;·&nbsp;
        Randevu sistemi <a href="https://seansify.com" style={{ color: C.sage, textDecoration: 'none', fontWeight: 600 }}>Seansify</a> tarafından sağlanmaktadır
      </footer>

      {/* Floating CTA - Mobil */}
      <style>{`.esinti-floating { display: none !important; } @media (max-width: 768px) { .esinti-floating { display: block !important; } }`}</style>
      <div className="esinti-floating" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, padding: '10px 16px 16px', background: `rgba(250,250,248,0.97)`, backdropFilter: 'blur(12px)', borderTop: `1px solid ${C.border}` }}>
        <Link href={`https://seansify.com/book/${psych.booking_slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.ink, color: '#fff', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
          Randevu Talebi Oluştur
        </Link>
      </div>

      <SectionDots
        sections={[
          { id: 'hakkimda', label: 'Hakkımda' },
          { id: 'yaklasim', label: 'Yaklaşımım' },
          { id: 'uzmanlik', label: 'Uzmanlık' },
          { id: 'blog', label: 'Blog' },
          { id: 'randevu', label: 'Randevu' },
          { id: 'iletisim', label: 'İletişim' },
        ]}
        accentColor={C.sage}
      />

    </div>
  )
}

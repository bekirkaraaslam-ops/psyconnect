'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { WebsiteProps, blogOzet, tarih, okumaMin } from './websiteTypes'

const C = {
  ink: '#2c2416',
  inkLight: '#6b5e4a',
  bg: '#f5f0e8',
  bgLight: '#faf7f2',
  olive: '#5a6b3c',
  oliveLight: '#ecf0e3',
  sage: '#7c8c5a',
  earth: '#8b6d47',
  earthLight: '#f2e8d8',
  border: '#ddd4c4',
  white: '#ffffff',
}

export default function TemaDogaClient({ psych, bloglar, yorumlar, paketler }: WebsiteProps) {
  const [bioExpanded, setBioExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const ad = psych.full_name
  const unvanTam = psych.unvan ? `${psych.unvan} ${ad}` : ad
  const initials = ad.split(' ').map(k => k[0]).slice(0, 2).join('').toUpperCase()
  const ortalamaPuan = yorumlar.length > 0 ? (yorumlar.reduce((s, y) => s + y.yildiz, 0) / yorumlar.length).toFixed(1) : null
  const bioParagraphs = psych.bio_text?.split('\n\n') ?? []
  const bioShort = bioParagraphs[0] ?? ''
  const bioHasMore = bioParagraphs.length > 1

  useEffect(() => {
    const els = document.querySelectorAll('.doga-scroll-fade')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } }),
      { threshold: 0.08 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div style={{ fontFamily: "'Lato', system-ui, sans-serif", background: C.bg, color: C.ink, lineHeight: 1.6 }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(210,222,192,0.97)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#" style={{ fontSize: 16, fontWeight: 700, color: C.ink, textDecoration: 'none', letterSpacing: '-0.3px' }}>{unvanTam}</a>
        <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }} className="doga-nav-links">
          {[
            { href: '#hakkimda', label: 'Hakkımda' },
            { href: '#yaklasim', label: 'Yaklaşımım' },
            { href: '#uzmanlik', label: 'Uzmanlık' },
            ...(bloglar.length > 0 ? [{ href: '#blog', label: 'Blog' }] : []),
            { href: '#iletisim', label: 'İletişim' },
          ].map(l => (
            <li key={l.href}><a href={l.href} style={{ fontSize: 13, color: C.inkLight, textDecoration: 'none', padding: '6px 10px', borderRadius: 8 }}>{l.label}</a></li>
          ))}
          <li><Link href={`https://seansify.com/book/${psych.booking_slug}`} className="doga-btn-cta" style={{ background: C.olive, color: '#fff', borderRadius: 24, padding: '8px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginLeft: 8 }}>Randevu Al</Link></li>
        </ul>
        <button onClick={() => setMenuOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.ink }} className="doga-hamburger">{menuOpen ? '✕' : '☰'}</button>
      </nav>

      {menuOpen && (
        <div style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99, background: C.bg, borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[{ href: '#hakkimda', label: 'Hakkımda' }, { href: '#yaklasim', label: 'Yaklaşımım' }, { href: '#uzmanlik', label: 'Uzmanlık' }, { href: '#iletisim', label: 'İletişim' }].map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ fontSize: 15, color: C.ink, textDecoration: 'none', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>{l.label}</a>
          ))}
          <Link href={`https://seansify.com/book/${psych.booking_slug}`} onClick={() => setMenuOpen(false)} style={{ marginTop: 12, display: 'block', textAlign: 'center', background: C.olive, color: '#fff', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>Randevu Al</Link>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Lato:wght@300;400;700&display=swap');

        @keyframes doga-slide-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .doga-hero-left > * {
          opacity: 0;
          animation: doga-slide-up 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .doga-hero-left > *:nth-child(1) { animation-delay: 0s; }
        .doga-hero-left > *:nth-child(2) { animation-delay: 0.1s; }
        .doga-hero-left > *:nth-child(3) { animation-delay: 0.2s; }
        .doga-hero-left > *:nth-child(4) { animation-delay: 0.3s; }
        .doga-hero-left > *:nth-child(5) { animation-delay: 0.38s; }
        .doga-hero-photo-anim {
          opacity: 0;
          animation: doga-slide-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.22s forwards;
        }
        .doga-scroll-fade {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .doga-scroll-fade.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .doga-btn-cta {
          transition: transform 0.18s ease, box-shadow 0.18s ease !important;
        }
        .doga-btn-cta:hover {
          transform: translateY(-2px) scale(1.03) !important;
          box-shadow: 0 8px 22px rgba(90,107,60,0.36) !important;
        }
        .doga-card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .doga-card-hover:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 32px rgba(44,36,22,0.1) !important;
        }

        @media (max-width: 768px) {
          .doga-nav-links { display: none !important; }
          .doga-hamburger { display: block !important; }
          .doga-hero-grid { grid-template-columns: 1fr !important; }
          .doga-hero-photo { display: flex !important; justify-content: center; order: -1; margin-bottom: 20px; }
          .doga-hero-photo img, .doga-hero-photo > div:first-child { width: 130px !important; height: 130px !important; aspect-ratio: 1/1 !important; border-radius: 50% !important; }
          .doga-hero-badge { display: none !important; }
          .doga-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .doga-yaklasim-grid { grid-template-columns: 1fr !important; }
          .doga-blog-grid { grid-template-columns: 1fr !important; }
          .doga-yorumlar-grid { grid-template-columns: 1fr !important; }
          .doga-randevu-grid { grid-template-columns: 1fr !important; }
          .doga-contact-grid { grid-template-columns: 1fr !important; }
          .doga-section { padding: 48px 20px !important; }
          .doga-hakkimda-grid { grid-template-columns: 1fr !important; }
          .doga-hero-section { padding: 40px 20px 0 !important; }
        }
      `}</style>

      {/* HERO */}
      <section className="doga-hero-section" style={{ background: `linear-gradient(150deg,${C.oliveLight} 0%,${C.bg} 60%,${C.earthLight} 100%)`, padding: '72px 40px 0', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: 40, width: 300, height: 300, borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%', background: `${C.olive}12`, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: -40, width: 200, height: 200, borderRadius: '40% 60% 30% 70% / 60% 40% 60% 40%', background: `${C.earth}10`, pointerEvents: 'none' }} />
        <div className="doga-hero-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 56, alignItems: 'end', position: 'relative', zIndex: 1 }}>
          <div className="doga-hero-left" style={{ paddingBottom: 64 }}>
            {psych.unvan && <div style={{ fontSize: 11, fontWeight: 700, color: C.sage, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 14 }}>{psych.unvan}</div>}
            <h1 style={{ fontSize: 54, fontWeight: 800, color: C.ink, lineHeight: 1.05, letterSpacing: '-2.5px', margin: '0 0 18px', fontFamily: "'Playfair Display', Georgia, serif" }}>{ad}</h1>
            {psych.profil_alinti && (
              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: '16px 20px', border: `1px solid ${C.border}`, marginBottom: 24, fontSize: 16, color: C.inkLight, lineHeight: 1.8, fontStyle: 'italic' }}>
                🌿 &ldquo;{psych.profil_alinti}&rdquo;
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 28 }}>
              <span style={{ fontSize: 12, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '5px 12px', fontWeight: 600 }}>● Randevu Müsait</span>
              {psych.sehir && <span style={{ fontSize: 12, color: C.inkLight, background: 'rgba(255,255,255,0.7)', border: `1px solid ${C.border}`, borderRadius: 20, padding: '5px 12px' }}>📍 {psych.sehir}</span>}
              {psych.tpd_uye_no && <span style={{ fontSize: 12, color: C.inkLight, background: 'rgba(255,255,255,0.7)', border: `1px solid ${C.border}`, borderRadius: 20, padding: '5px 12px' }}>{psych.tpd_uye_no}</span>}
              {psych.dil && psych.dil.length > 0 && <span style={{ fontSize: 12, color: C.inkLight, background: 'rgba(255,255,255,0.7)', border: `1px solid ${C.border}`, borderRadius: 20, padding: '5px 12px' }}>🌐 {psych.dil.join(', ')}</span>}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link href={`https://seansify.com/book/${psych.booking_slug}`} className="doga-btn-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.olive, color: '#fff', borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 14px ${C.olive}40` }}>
                🌱 Randevu Al
              </Link>
              <a href="#hakkimda" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 14, fontWeight: 600, color: C.olive, textDecoration: 'none', padding: '13px 0' }}>
                Daha fazla →
              </a>
            </div>
          </div>
          <div className="doga-hero-photo doga-hero-photo-anim" style={{ alignSelf: 'end' }}>
            {psych.foto_url ? (
              <img src={psych.foto_url} alt={ad} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', borderRadius: '80px 80px 40px 40px', boxShadow: '0 20px 56px rgba(44,36,22,0.15)' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '4/5', borderRadius: '80px 80px 40px 40px', background: `linear-gradient(160deg,${C.oliveLight},${C.olive}60)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, fontWeight: 800, color: C.olive }}>
                {initials}
              </div>
            )}
            {psych.deneyim_yil && (
              <div className="doga-hero-badge" style={{ position: 'absolute', bottom: 24, left: -16, background: '#fff', borderRadius: 16, padding: '14px 18px', boxShadow: '0 8px 28px rgba(0,0,0,0.1)', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.olive, lineHeight: 1 }}>{psych.deneyim_yil}</div>
                <div style={{ fontSize: 11, color: C.inkLight, marginTop: 2 }}>yıl deneyim</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: C.white, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="doga-stats-grid doga-scroll-fade" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[
            psych.deneyim_yil ? { v: `${psych.deneyim_yil}+`, l: 'Yıl Deneyim' } : null,
            ortalamaPuan ? { v: `${ortalamaPuan}★`, l: 'Değerlendirme' } : null,
            { v: `${psych.session_duration_minutes ?? 50} dk`, l: 'Seans Süresi' },
          ].filter(Boolean).map((s, i, arr) => s && (
            <div key={i} style={{ padding: '24px 16px', textAlign: 'center', borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: C.olive, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.inkLight, marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HAKKIMDA */}
      {psych.bio_text && (
        <section id="hakkimda" className="doga-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px' }}>
          <div className="doga-scroll-fade">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 20 }}>🌿</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.olive, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Hakkımda</span>
            </div>
            <div className="doga-hakkimda-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40, alignItems: 'start' }}>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: C.ink, lineHeight: 1.25, letterSpacing: '-0.5px', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Doğal, güvenli bir alan yaratıyoruz.</h2>
              <div>
                <p style={{ fontSize: 16, color: C.inkLight, lineHeight: 1.85, margin: '0 0 16px' }}>{bioExpanded ? psych.bio_text : bioShort}</p>
                {bioHasMore && (
                  <button onClick={() => setBioExpanded(e => !e)} style={{ background: 'none', border: `1px solid ${C.olive}`, color: C.olive, borderRadius: 20, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    {bioExpanded ? 'Daha az göster ↑' : 'Devamını oku →'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* YAKLAŞIMIM */}
      {psych.yaklasim && psych.yaklasim.length > 0 && (
        <section id="yaklasim" style={{ background: C.bgLight, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div className="doga-section doga-scroll-fade" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 20 }}>🌸</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.olive, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Yaklaşımım</span>
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: '-0.5px', margin: '0 0 36px', fontFamily: "'Playfair Display', Georgia, serif" }}>Çalışma Felsefem</h2>
            <div className="doga-yaklasim-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
              {psych.yaklasim.map((y, i) => (
                <div key={i} className="doga-card-hover" style={{ background: C.white, borderRadius: 20, padding: 24, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(44,36,22,0.05)' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '12px', background: C.oliveLight, border: `1px solid ${C.olive}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14 }}>{y.ikon}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.ink, margin: '0 0 10px' }}>{y.baslik}</h3>
                  <p style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.7, margin: 0 }}>{y.aciklama}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* UZMANLIK */}
      {psych.uzmanlik_alanlari && psych.uzmanlik_alanlari.length > 0 && (
        <section id="uzmanlik" className="doga-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px' }}>
          <div className="doga-scroll-fade">
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 20 }}>🍃</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.olive, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Uzmanlık</span>
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: '-0.5px', margin: '0 0 28px', fontFamily: "'Playfair Display', Georgia, serif" }}>Uzmanlık Alanlarım</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {psych.uzmanlik_alanlari.map(alan => (
                <span key={alan} style={{ fontSize: 14, fontWeight: 600, color: C.olive, background: C.oliveLight, border: `1.5px solid ${C.olive}30`, borderRadius: 24, padding: '8px 18px' }}>{alan}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* EĞİTİM */}
      {psych.egitim && psych.egitim.length > 0 && (
        <section style={{ background: C.bgLight, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div className="doga-section doga-scroll-fade" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontSize: 20 }}>📚</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.olive, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Eğitim</span>
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: '-0.5px', margin: '0 0 28px', fontFamily: "'Playfair Display', Georgia, serif" }}>Akademik Geçmiş</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {psych.egitim.map((e, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 14, padding: '18px 22px', border: `1px solid ${C.border}`, display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: C.oliveLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🎓</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{e.baslik}</div>
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
        <section id="blog" className="doga-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px' }}>
          <div className="doga-scroll-fade">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36 }}>
              <div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>✍️</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.olive, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Blog</span>
                </div>
                <h2 style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: '-0.5px', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Yazılarım</h2>
              </div>
              <Link href={`https://${psych.booking_slug}.seansify.com/blog`} style={{ fontSize: 14, fontWeight: 700, color: C.olive, textDecoration: 'none' }}>Tümünü gör →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {bloglar.slice(0, 1).map(b => (
                <Link key={b.id} href={`https://${psych.booking_slug}.seansify.com/blog/${b.slug}`} className="doga-card-hover" style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 0, background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 16px rgba(44,36,22,0.06)' }}>
                  <div style={{ background: `linear-gradient(135deg,${C.oliveLight},${C.olive}40)`, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, fontSize: 64 }}>📖</div>
                  <div style={{ padding: 28 }}>
                    {b.kategori && <span style={{ fontSize: 10, fontWeight: 700, color: C.olive, textTransform: 'uppercase', letterSpacing: '1px' }}>{b.kategori}</span>}
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: C.ink, lineHeight: 1.35, margin: '8px 0' }}>{b.baslik}</h3>
                    <p style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.7, margin: 0 }}>{blogOzet(b.icerik, 140)}</p>
                    <div style={{ marginTop: 16, fontSize: 12, color: C.inkLight }}>{tarih(b.created_at)} · {okumaMin(b.icerik)} dk okuma</div>
                  </div>
                </Link>
              ))}
              <div className="doga-blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
                {bloglar.slice(1, 3).map(b => (
                  <Link key={b.id} href={`https://${psych.booking_slug}.seansify.com/blog/${b.slug}`} className="doga-card-hover" style={{ textDecoration: 'none', background: C.white, borderRadius: 16, padding: 22, border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.sage}`, display: 'block' }}>
                    {b.kategori && <span style={{ fontSize: 10, fontWeight: 700, color: C.olive, textTransform: 'uppercase', letterSpacing: '1px' }}>{b.kategori}</span>}
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: C.ink, lineHeight: 1.4, margin: '8px 0' }}>{b.baslik}</h3>
                    <p style={{ fontSize: 13, color: C.inkLight, lineHeight: 1.6, margin: 0 }}>{blogOzet(b.icerik)}</p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RANDEVU */}
      <section id="randevu" style={{ background: `linear-gradient(150deg,${C.olive},#3d5229)` }}>
        <div className="doga-randevu-grid doga-scroll-fade" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px', display: 'grid', gridTemplateColumns: paketler.length > 0 ? '1fr 1fr' : '1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>Randevu</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.15, letterSpacing: '-1px', margin: '0 0 16px', fontFamily: "'Playfair Display', Georgia, serif" }}>Doğal bir süreçle başlayalım.</h2>
            <Link href={`https://seansify.com/book/${psych.booking_slug}`} className="doga-btn-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: C.olive, borderRadius: 12, padding: '13px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              🌱 Randevu Al
            </Link>
          </div>
          {paketler.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {paketler.map((p, i) => (
                <div key={p.id} style={{ background: i === 0 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px 22px', border: `1px solid ${i === 0 ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{p.session_count} seans · ₺{(p.price_tl / p.session_count).toFixed(0)}/seans</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>₺{Number(p.price_tl).toLocaleString('tr-TR')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* YORUMLAR */}
      {yorumlar.length > 0 && (
        <section style={{ background: C.bgLight, borderBottom: `1px solid ${C.border}` }}>
          <div className="doga-section doga-scroll-fade" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px' }}>
            <div style={{ textAlign: 'center', marginBottom: 44 }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>💚</div>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: '-0.5px', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Danışan Deneyimleri</h2>
            </div>
            <div className="doga-yorumlar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
              {yorumlar.filter(y => y.yorum_metni).slice(0, 3).map(y => (
                <div key={y.id} className="doga-card-hover" style={{ background: C.white, borderRadius: 20, padding: 24, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(44,36,22,0.04)' }}>
                  <div style={{ color: '#f59e0b', fontSize: 16, marginBottom: 12 }}>{'★'.repeat(y.yildiz)}</div>
                  <p style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 16px' }}>&ldquo;{y.yorum_metni}&rdquo;</p>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{y.reviewer_init ?? 'Anonim'}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* İLETİŞİM */}
      <section id="iletisim" className="doga-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '72px 40px' }}>
        <div className="doga-scroll-fade">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 32 }}>
            <span style={{ fontSize: 20 }}>🤝</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.olive, letterSpacing: '1.5px', textTransform: 'uppercase' }}>İletişim</span>
          </div>
          <div className="doga-contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 48 }}>
            <div>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: '-0.5px', margin: '0 0 24px', fontFamily: "'Playfair Display', Georgia, serif" }}>Bize Ulaşın</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {psych.klinik_adi && <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{psych.klinik_adi}</div>}
                {psych.klinik_adres && <div style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.6 }}>{psych.klinik_adres}</div>}
                {psych.klinik_tel && <a href={`tel:${psych.klinik_tel}`} style={{ fontSize: 14, color: C.olive, fontWeight: 600, textDecoration: 'none' }}>📞 {psych.klinik_tel}</a>}
                {psych.calisma_saatleri && <div style={{ fontSize: 14, color: C.inkLight }}>🕐 {psych.calisma_saatleri}</div>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#2c2416', padding: '24px 40px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
        © {new Date().getFullYear()} {unvanTam}
        &nbsp;·&nbsp;
        Randevu sistemi <a href="https://seansify.com" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600 }}>Seansify</a> tarafından sağlanmaktadır
      </footer>

      {/* Floating CTA - Mobil */}
      <style>{`.doga-floating { display: none !important; } @media (max-width: 768px) { .doga-floating { display: block !important; } }`}</style>
      <div className="doga-floating" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, padding: '10px 16px 16px', background: 'rgba(245,240,232,0.97)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${C.border}` }}>
        <Link href={`https://seansify.com/book/${psych.booking_slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.olive, color: '#fff', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          🌱 Randevu Talebi Oluştur
        </Link>
      </div>

    </div>
  )
}

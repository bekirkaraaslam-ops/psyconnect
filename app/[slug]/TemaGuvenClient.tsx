'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { WebsiteProps, blogOzet, tarih, okumaMin } from './websiteTypes'

const C = {
  navy: '#1b2d4f',
  navyLight: '#243b63',
  bg: '#f5f7fa',
  bgLight: '#ffffff',
  teal: '#2a7d6f',
  tealBright: '#5fbfb0',
  tealLight: '#e8f6f4',
  inkLight: '#64748b',
  border: '#e2e8f0',
  white: '#ffffff',
}

function SecNum({ n, label }: { n: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 20 }}>
      <span style={{ fontSize: 11, fontWeight: 900, color: C.white, background: C.navy, padding: '4px 9px', borderRadius: 6, letterSpacing: '0.5px' }}>{n}</span>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.teal, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{label}</span>
    </div>
  )
}

export default function TemaGuvenClient({ psych, bloglar, yorumlar, paketler }: WebsiteProps) {
  const [bioExpanded, setBioExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const els = document.querySelectorAll('.guven-scroll-fade')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } }),
      { threshold: 0.08 }
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

  return (
    <div style={{ fontFamily: "'Lato', system-ui, sans-serif", background: C.bg, color: '#1e293b', lineHeight: 1.6 }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: C.navy, padding: '0 48px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#" style={{ fontSize: 15, fontWeight: 800, color: '#fff', textDecoration: 'none', letterSpacing: '-0.3px' }}>{unvanTam}</a>
        <ul style={{ display: 'flex', gap: 4, listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }} className="guven-nav-links">
          {[
            { href: '#hakkimda', label: 'Hakkımda' },
            { href: '#yaklasim', label: 'Yaklaşımım' },
            { href: '#uzmanlik', label: 'Uzmanlık' },
            ...(bloglar.length > 0 ? [{ href: '#blog', label: 'Blog' }] : []),
            { href: '#randevu', label: 'Randevu' },
            { href: '#iletisim', label: 'İletişim' },
          ].map(l => (
            <li key={l.href}><a href={l.href} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none', padding: '6px 10px', borderRadius: 6 }}>{l.label}</a></li>
          ))}
          <li><Link href={`https://seansify.com/book/${psych.booking_slug}`} style={{ background: C.tealBright, color: '#fff', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginLeft: 8 }}>Randevu Al</Link></li>
        </ul>
        <button onClick={() => setMenuOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#fff' }} className="guven-hamburger">{menuOpen ? '✕' : '☰'}</button>
      </nav>

      {menuOpen && (
        <div style={{ position: 'fixed', top: 68, left: 0, right: 0, zIndex: 99, background: C.navy, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[{ href: '#hakkimda', label: 'Hakkımda' }, { href: '#yaklasim', label: 'Yaklaşımım' }, { href: '#uzmanlik', label: 'Uzmanlık' }, { href: '#iletisim', label: 'İletişim' }].map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{l.label}</a>
          ))}
          <Link href={`https://seansify.com/book/${psych.booking_slug}`} onClick={() => setMenuOpen(false)} style={{ marginTop: 12, display: 'block', textAlign: 'center', background: C.tealBright, color: '#fff', borderRadius: 10, padding: '12px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>Randevu Al</Link>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Lato:wght@300;400;700&display=swap');

        @keyframes guven-slide-up {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .guven-hero-left > * {
          opacity: 0;
          animation: guven-slide-up 0.65s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .guven-hero-left > *:nth-child(1) { animation-delay: 0s; }
        .guven-hero-left > *:nth-child(2) { animation-delay: 0.1s; }
        .guven-hero-left > *:nth-child(3) { animation-delay: 0.2s; }
        .guven-hero-left > *:nth-child(4) { animation-delay: 0.3s; }
        .guven-hero-left > *:nth-child(5) { animation-delay: 0.38s; }
        .guven-hero-photo-anim {
          opacity: 0;
          animation: guven-slide-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.22s forwards;
        }
        .guven-scroll-fade {
          opacity: 0;
          transform: translateY(22px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }
        .guven-scroll-fade.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .guven-btn-cta {
          transition: transform 0.18s ease, box-shadow 0.18s ease !important;
        }
        .guven-btn-cta:hover {
          transform: translateY(-2px) scale(1.03) !important;
          box-shadow: 0 8px 22px rgba(95,191,176,0.4) !important;
        }
        .guven-card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease !important;
        }
        .guven-card-hover:hover {
          transform: translateY(-4px) !important;
          box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important;
        }

        @media (max-width: 768px) {
          .guven-nav-links { display: none !important; }
          .guven-hamburger { display: block !important; }
          .guven-hero-grid { grid-template-columns: 1fr !important; }
          .guven-hero-photo { display: flex !important; justify-content: center; order: -1; margin-bottom: 20px; }
          .guven-hero-photo img, .guven-hero-photo > div:first-child { width: 130px !important; height: 130px !important; aspect-ratio: 1/1 !important; border-radius: 50% !important; }
          .guven-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .guven-blog-grid { grid-template-columns: 1fr !important; }
          .guven-yorumlar-grid { grid-template-columns: 1fr !important; }
          .guven-randevu-grid { grid-template-columns: 1fr !important; }
          .guven-contact-grid { grid-template-columns: 1fr !important; }
          .guven-section { padding: 48px 20px !important; }
          .guven-hakkimda-grid { grid-template-columns: 1fr !important; }
          .guven-hero-section { padding: 48px 20px 0 !important; }
        }
      `}</style>

      {/* HERO */}
      <section className="guven-hero-section" style={{ background: `linear-gradient(150deg,#0f1e36 0%,${C.navy} 50%,#243b63 100%)`, color: '#fff', padding: '72px 48px 0', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: `radial-gradient(circle,${C.tealBright}18,transparent 70%)`, pointerEvents: 'none' }} />
        <div className="guven-hero-grid" style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, alignItems: 'end', position: 'relative', zIndex: 1 }}>
          <div className="guven-hero-left" style={{ paddingBottom: 56 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
              {psych.tpd_uye_no && <span style={{ fontSize: 11, background: 'rgba(95,191,176,0.15)', border: '1px solid rgba(95,191,176,0.3)', color: C.tealBright, borderRadius: 20, padding: '4px 12px', fontWeight: 600 }}>{psych.tpd_uye_no}</span>}
              {psych.sehir && <span style={{ fontSize: 11, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: '4px 12px' }}>📍 {psych.sehir}</span>}
              <span style={{ fontSize: 11, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', borderRadius: 20, padding: '4px 12px', fontWeight: 600 }}>● Randevu Müsait</span>
            </div>
            {psych.unvan && <div style={{ fontSize: 11, fontWeight: 700, color: C.tealBright, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 10 }}>{psych.unvan}</div>}
            <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-2px', margin: '0 0 16px', fontFamily: "'Playfair Display', Georgia, serif" }}>{ad}</h1>
            {psych.profil_alinti && (
              <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, margin: '0 0 28px', borderLeft: `3px solid ${C.tealBright}`, paddingLeft: 16 }}>
                &ldquo;{psych.profil_alinti}&rdquo;
              </p>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <Link href={`https://seansify.com/book/${psych.booking_slug}`} className="guven-btn-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.tealBright, color: '#fff', borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 16px ${C.tealBright}40` }}>
                Randevu Al →
              </Link>
              <a href="#hakkimda" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', padding: '13px 0' }}>
                Hakkımda ↓
              </a>
            </div>
          </div>
          <div className="guven-hero-photo guven-hero-photo-anim" style={{ alignSelf: 'end' }}>
            {psych.foto_url ? (
              <img src={psych.foto_url} alt={ad} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', borderRadius: '20px 20px 0 0', boxShadow: '0 -8px 32px rgba(0,0,0,0.3)' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '4/5', borderRadius: '20px 20px 0 0', background: `linear-gradient(160deg,${C.tealBright}30,${C.navy})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, fontWeight: 800, color: C.tealBright }}>
                {initials}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* QUICKBAR */}
      <div style={{ background: C.tealLight, borderBottom: `3px solid ${C.tealBright}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', display: 'flex', gap: 0, overflowX: 'auto' }}>
          {[
            psych.deneyim_yil ? `${psych.deneyim_yil} Yıl Deneyim` : null,
            psych.calisma_saatleri,
            ortalamaPuan ? `${ortalamaPuan}★ Değerlendirme` : null,
            psych.dil ? psych.dil.join(', ') : null,
          ].filter(Boolean).map((t, i) => (
            <div key={i} style={{ padding: '14px 20px', borderRight: `1px solid ${C.tealBright}30`, fontSize: 13, fontWeight: 600, color: C.teal, whiteSpace: 'nowrap', flexShrink: 0 }}>{t}</div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <section style={{ background: C.bgLight, borderBottom: `1px solid ${C.border}` }}>
        <div className="guven-stats-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[
            psych.deneyim_yil ? { v: `${psych.deneyim_yil}+`, l: 'Yıl Deneyim' } : null,
            ortalamaPuan ? { v: `${ortalamaPuan}★`, l: 'Değerlendirme' } : null,
            { v: `${psych.session_duration_minutes ?? 50} dk`, l: 'Seans Süresi' },
          ].filter(Boolean).map((s, i, arr) => s && (
            <div key={i} style={{ padding: '24px 16px', textAlign: 'center', borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.navy, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.inkLight, marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HAKKIMDA */}
      {psych.bio_text && (
        <section id="hakkimda" className="guven-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 48px' }}>
          <SecNum n="01" label="Hakkımda" />
          <div className="guven-hakkimda-grid guven-scroll-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 40, alignItems: 'start' }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px', lineHeight: 1.25, margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Sizinle açık ve dürüst bir şekilde çalışıyorum.</h2>
            <div>
              <p style={{ fontSize: 15, color: C.inkLight, lineHeight: 1.8, margin: '0 0 14px' }}>{bioExpanded ? psych.bio_text : bioShort}</p>
              {bioHasMore && (
                <button onClick={() => setBioExpanded(e => !e)} style={{ background: 'none', border: `1px solid ${C.teal}`, color: C.teal, borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {bioExpanded ? 'Daha az ↑' : 'Devamını oku →'}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* YAKLAŞIMIM */}
      {psych.yaklasim && psych.yaklasim.length > 0 && (
        <section id="yaklasim" style={{ background: C.bgLight, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div className="guven-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 48px' }}>
            <SecNum n="02" label="Yaklaşımım" />
            <h2 style={{ fontSize: 32, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px', margin: '0 0 36px', fontFamily: "'Playfair Display', Georgia, serif" }}>Çalışma Felsefem</h2>
            <div className="guven-scroll-fade" style={{ display: 'flex', flexDirection: 'column', gap: 0, borderLeft: `4px solid ${C.tealBright}` }}>
              {psych.yaklasim.map((y, i) => (
                <div key={i} style={{ paddingLeft: 28, paddingBottom: 28, paddingTop: i > 0 ? 28 : 0, borderTop: i > 0 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, background: C.tealLight, border: `1px solid ${C.tealBright}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{y.ikon}</div>
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, margin: '0 0 8px' }}>{y.baslik}</h3>
                      <p style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.7, margin: 0 }}>{y.aciklama}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* UZMANLIK */}
      {psych.uzmanlik_alanlari && psych.uzmanlik_alanlari.length > 0 && (
        <section id="uzmanlik" className="guven-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 48px' }}>
          <SecNum n="03" label="Uzmanlık" />
          <h2 style={{ fontSize: 32, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px', margin: '0 0 28px', fontFamily: "'Playfair Display', Georgia, serif" }}>Uzmanlık Alanlarım</h2>
          <div className="guven-scroll-fade" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {psych.uzmanlik_alanlari.map(alan => (
              <span key={alan} style={{ fontSize: 13, fontWeight: 600, color: C.navy, background: C.bgLight, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '8px 16px' }}>{alan}</span>
            ))}
          </div>
        </section>
      )}

      {/* EĞİTİM */}
      {psych.egitim && psych.egitim.length > 0 && (
        <section style={{ background: C.bgLight, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div className="guven-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 48px' }}>
            <SecNum n="04" label="Eğitim" />
            <h2 style={{ fontSize: 32, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px', margin: '0 0 28px', fontFamily: "'Playfair Display', Georgia, serif" }}>Akademik Geçmiş</h2>
            <div className="guven-scroll-fade" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {psych.egitim.map((e, i) => (
                <div key={i} style={{ background: C.bg, borderRadius: 12, padding: '18px 22px', border: `1px solid ${C.border}`, display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.tealLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🎓</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{e.baslik}</div>
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
        <section id="blog" className="guven-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 48px' }}>
          <SecNum n="05" label="Blog" />
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Yazılarım</h2>
            <Link href={`https://${psych.booking_slug}.seansify.com/blog`} style={{ fontSize: 14, fontWeight: 700, color: C.teal, textDecoration: 'none' }}>Tümünü gör →</Link>
          </div>
          <div className="guven-scroll-fade" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {bloglar.slice(0, 1).map(b => (
              <Link key={b.id} href={`https://${psych.booking_slug}.seansify.com/blog/${b.slug}`} className="guven-card-hover" style={{ textDecoration: 'none', display: 'block', background: C.bgLight, borderRadius: 16, padding: '28px 32px', border: `1px solid ${C.border}`, borderLeft: `4px solid ${C.tealBright}`, boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
                {b.kategori && <span style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '1px' }}>{b.kategori}</span>}
                <h3 style={{ fontSize: 22, fontWeight: 800, color: C.navy, lineHeight: 1.3, margin: '8px 0' }}>{b.baslik}</h3>
                <p style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.7, margin: 0 }}>{blogOzet(b.icerik, 160)}</p>
                <div style={{ marginTop: 14, fontSize: 12, color: C.inkLight }}>{tarih(b.created_at)} · {okumaMin(b.icerik)} dk okuma</div>
              </Link>
            ))}
            <div className="guven-blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
              {bloglar.slice(1, 3).map(b => (
                <Link key={b.id} href={`https://${psych.booking_slug}.seansify.com/blog/${b.slug}`} className="guven-card-hover" style={{ textDecoration: 'none', background: C.bgLight, borderRadius: 14, padding: '22px 24px', border: `1px solid ${C.border}`, display: 'block' }}>
                  {b.kategori && <span style={{ fontSize: 10, fontWeight: 700, color: C.teal, textTransform: 'uppercase', letterSpacing: '1px' }}>{b.kategori}</span>}
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, lineHeight: 1.4, margin: '6px 0' }}>{b.baslik}</h3>
                  <p style={{ fontSize: 13, color: C.inkLight, lineHeight: 1.6, margin: 0 }}>{blogOzet(b.icerik)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RANDEVU */}
      <section id="randevu" style={{ background: C.navy }}>
        <div className="guven-randevu-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 48px', display: 'grid', gridTemplateColumns: paketler.length > 0 ? '1fr 380px' : '1fr', gap: 48, alignItems: 'start' }}>
          <div>
            <SecNum n="06" label="Randevu" />
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.15, margin: '0 0 16px', fontFamily: "'Playfair Display', Georgia, serif" }}>Profesyonel destek almaya hazır mısınız?</h2>
            <Link href={`https://seansify.com/book/${psych.booking_slug}`} className="guven-btn-cta" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.tealBright, color: '#fff', borderRadius: 10, padding: '14px 30px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 16px ${C.tealBright}40` }}>
              Randevu Talebi Oluştur →
            </Link>
          </div>
          {paketler.length > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.tealBright, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Seans Paketleri</div>
              {paketler.map(p => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{p.session_count} seans · ₺{(p.price_tl / p.session_count).toFixed(0)}/seans</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>₺{Number(p.price_tl).toLocaleString('tr-TR')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* YORUMLAR */}
      {yorumlar.length > 0 && (
        <section style={{ background: C.bgLight, borderBottom: `1px solid ${C.border}` }}>
          <div className="guven-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 48px' }}>
            <SecNum n="07" label="Yorumlar" />
            <h2 style={{ fontSize: 32, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px', margin: '0 0 28px', fontFamily: "'Playfair Display', Georgia, serif" }}>Danışan Deneyimleri</h2>
            <div className="guven-yorumlar-grid guven-scroll-fade" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {yorumlar.filter(y => y.yorum_metni).slice(0, 3).map(y => (
                <div key={y.id} className="guven-card-hover" style={{ background: C.bg, borderRadius: 14, padding: '22px 24px', border: `1px solid ${C.border}` }}>
                  <div style={{ color: '#f59e0b', fontSize: 14, marginBottom: 10 }}>{'★'.repeat(y.yildiz)}</div>
                  <p style={{ fontSize: 13, color: C.inkLight, lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 14px' }}>&ldquo;{y.yorum_metni}&rdquo;</p>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{y.reviewer_init ?? 'Anonim'}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* İLETİŞİM */}
      <section id="iletisim" className="guven-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '72px 48px' }}>
        <SecNum n="08" label="İletişim" />
        <div className="guven-contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 48 }}>
          <div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px', margin: '0 0 24px', fontFamily: "'Playfair Display', Georgia, serif" }}>Bize Ulaşın</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {psych.klinik_adi && <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{psych.klinik_adi}</div>}
              {psych.klinik_adres && <div style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.6 }}>{psych.klinik_adres}</div>}
              {psych.klinik_tel && <a href={`tel:${psych.klinik_tel}`} style={{ fontSize: 14, color: C.teal, fontWeight: 600, textDecoration: 'none' }}>📞 {psych.klinik_tel}</a>}
              {psych.calisma_saatleri && <div style={{ fontSize: 14, color: C.inkLight }}>🕐 {psych.calisma_saatleri}</div>}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.navy, padding: '24px 48px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>
        © {new Date().getFullYear()} {unvanTam}
        &nbsp;·&nbsp;
        Randevu sistemi <a href="https://seansify.com" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600 }}>Seansify</a> tarafından sağlanmaktadır
      </footer>

      {/* Floating CTA - Mobil */}
      <style>{`.guven-floating { display: none !important; } @media (max-width: 768px) { .guven-floating { display: block !important; } }`}</style>
      <div className="guven-floating" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, padding: '10px 16px 16px', background: `rgba(27,45,79,0.97)`, backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <Link href={`https://seansify.com/book/${psych.booking_slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.tealBright, color: '#fff', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Randevu Talebi Oluştur
        </Link>
      </div>

    </div>
  )
}

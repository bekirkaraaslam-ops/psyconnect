'use client'

import Link from 'next/link'
import { useState } from 'react'
import { WebsiteProps, blogOzet, tarih, okumaMin } from './websiteTypes'

const C = {
  ink: '#111827',
  inkLight: '#6b7280',
  bg: '#ffffff',
  bg2: '#f9fafb',
  accent: '#3d6b5e',
  accentLight: '#e8f2ef',
  border: '#e5e7eb',
  white: '#ffffff',
}

export default function TemaBlancClient({ psych, bloglar, yorumlar, paketler }: WebsiteProps) {
  const [bioExpanded, setBioExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

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
    { href: '#randevu', label: 'Randevu' },
    { href: '#iletisim', label: 'İletişim' },
  ]

  return (
    <div style={{ fontFamily: "'Lato', system-ui, sans-serif", background: C.bg, color: C.ink, lineHeight: 1.6 }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <a href="#" style={{ fontSize: 16, fontWeight: 800, color: C.ink, textDecoration: 'none', letterSpacing: '-0.5px' }}>
          {unvanTam}
        </a>
        <ul style={{ display: 'flex', gap: 8, listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }} className="blanc-nav-links">
          {navLinks.map(l => (
            <li key={l.href}>
              <a href={l.href} style={{ fontSize: 13, fontWeight: 500, color: C.inkLight, textDecoration: 'none', padding: '6px 10px', borderRadius: 6, transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = C.accent)}
                onMouseLeave={e => (e.currentTarget.style.color = C.inkLight)}
              >
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <Link href={`https://seansify.com/book/${psych.booking_slug}`} style={{ background: C.accent, color: '#fff', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginLeft: 8 }}>
              Randevu Al
            </Link>
          </li>
        </ul>
        {/* Mobil hamburger */}
        <button onClick={() => setMenuOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontSize: 20 }} className="blanc-hamburger">
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* Mobil menu */}
      {menuOpen && (
        <div style={{ position: 'fixed', top: 64, left: 0, right: 0, zIndex: 99, background: '#fff', borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navLinks.map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ fontSize: 15, fontWeight: 500, color: C.ink, textDecoration: 'none', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>
              {l.label}
            </a>
          ))}
          <Link href={`https://seansify.com/book/${psych.booking_slug}`} onClick={() => setMenuOpen(false)} style={{ marginTop: 12, display: 'block', textAlign: 'center', background: C.accent, color: '#fff', borderRadius: 10, padding: '12px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
            Randevu Al
          </Link>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400;1,700&family=Lato:wght@300;400;700&display=swap');
        @media (max-width: 768px) {
          .blanc-nav-links { display: none !important; }
          .blanc-hamburger { display: block !important; }
          .blanc-hero-grid { grid-template-columns: 1fr !important; }
          .blanc-hero-photo { display: flex !important; justify-content: center; order: -1; margin-bottom: 20px; }
          .blanc-hero-photo img, .blanc-hero-photo > div:first-child { width: 130px !important; height: 130px !important; aspect-ratio: 1/1 !important; border-radius: 50% !important; }
          .blanc-hero-badge { display: none !important; }
          .blanc-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .blanc-approach-grid { grid-template-columns: 1fr !important; }
          .blanc-uzmanlik-grid { grid-template-columns: 1fr 1fr !important; }
          .blanc-blog-grid { grid-template-columns: 1fr !important; }
          .blanc-yorumlar-grid { grid-template-columns: 1fr !important; }
          .blanc-section { padding: 48px 20px !important; }
          .blanc-hakkimda-grid { grid-template-columns: 1fr !important; }
          .blanc-hero-section { padding: 48px 20px 0 !important; }
        }
      `}</style>

      {/* HERO */}
      <section className="blanc-hero-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px 60px' }}>
        <div className="blanc-hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 64, alignItems: 'center' }}>
          <div>
            {psych.unvan && (
              <div style={{ fontSize: 12, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 12 }}>{psych.unvan}</div>
            )}
            <h1 style={{ fontSize: 52, fontWeight: 900, color: C.ink, lineHeight: 1.1, letterSpacing: '-2px', margin: '0 0 16px', fontFamily: "'Playfair Display', Georgia, serif" }}>{ad}</h1>
            {psych.profil_alinti && (
              <p style={{ fontSize: 18, color: C.inkLight, lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 24px', borderLeft: `3px solid ${C.accent}`, paddingLeft: 16 }}>
                &ldquo;{psych.profil_alinti}&rdquo;
              </p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '5px 12px' }}>● Randevu Müsait</span>
              {psych.sehir && <span style={{ fontSize: 12, color: C.inkLight, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: '5px 12px' }}>📍 {psych.sehir}</span>}
              {psych.dil && psych.dil.length > 0 && <span style={{ fontSize: 12, color: C.inkLight, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: '5px 12px' }}>🌐 {psych.dil.join(', ')}</span>}
              {psych.tpd_uye_no && <span style={{ fontSize: 12, color: C.inkLight, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 20, padding: '5px 12px' }}>TPD {psych.tpd_uye_no}</span>}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link href={`https://seansify.com/book/${psych.booking_slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accent, color: '#fff', borderRadius: 10, padding: '13px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: `0 4px 14px ${C.accent}40` }}>
                Randevu Al →
              </Link>
              <a href="#hakkimda" style={{ display: 'inline-flex', alignItems: 'center', fontSize: 14, fontWeight: 600, color: C.accent, textDecoration: 'none', padding: '13px 0' }}>
                Daha fazla bilgi
              </a>
            </div>
          </div>
          <div className="blanc-hero-photo" style={{ position: 'relative' }}>
            {psych.foto_url ? (
              <img src={psych.foto_url} alt={ad} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover', borderRadius: '24px 24px 80px 24px', boxShadow: '0 24px 64px rgba(0,0,0,0.12)' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '4/5', borderRadius: '24px 24px 80px 24px', background: `linear-gradient(135deg,${C.accentLight},${C.accent}30)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, fontWeight: 800, color: C.accent }}>
                {initials}
              </div>
            )}
            {psych.deneyim_yil && (
              <div className="blanc-hero-badge" style={{ position: 'absolute', bottom: 24, left: -24, background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: C.accent, lineHeight: 1 }}>{psych.deneyim_yil}</div>
                <div style={{ fontSize: 11, color: C.inkLight, marginTop: 2 }}>yıl deneyim</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: C.bg2, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="blanc-stats-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[
            psych.deneyim_yil ? { v: `${psych.deneyim_yil}+`, l: 'Yıl Deneyim' } : null,
            ortalamaPuan ? { v: `${ortalamaPuan}★`, l: 'Değerlendirme' } : null,
            { v: `${psych.session_duration_minutes ?? 50} dk`, l: 'Seans Süresi' },
          ].filter(Boolean).map((s, i, arr) => s && (
            <div key={i} style={{ padding: '28px 20px', textAlign: 'center', borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ fontSize: 30, fontWeight: 900, color: C.ink, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: C.inkLight, marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HAKKIMDA */}
      {psych.bio_text && (
        <section id="hakkimda" className="blanc-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
          <div className="blanc-hakkimda-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 48, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Hakkımda</div>
              <h2 style={{ fontSize: 32, fontWeight: 800, color: C.ink, lineHeight: 1.2, letterSpacing: '-1px', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Sizinle çalışmaktan onur duyarım.</h2>
            </div>
            <div>
              <p style={{ fontSize: 16, color: C.inkLight, lineHeight: 1.8, margin: '0 0 16px' }}>
                {bioExpanded ? psych.bio_text : bioShort}
              </p>
              {bioHasMore && (
                <button onClick={() => setBioExpanded(e => !e)} style={{ background: 'none', border: `1px solid ${C.accent}`, color: C.accent, borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  {bioExpanded ? 'Daha az göster ↑' : 'Devamını oku →'}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* YAKLAŞIMIM */}
      {psych.yaklasim && psych.yaklasim.length > 0 && (
        <section id="yaklasim" style={{ background: C.bg2, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Yaklaşımım</div>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: '-1px', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Çalışma Felsefem</h2>
            </div>
            <div className="blanc-approach-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
              {psych.yaklasim.map((y, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 16, padding: 28, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 32, marginBottom: 14 }}>{y.ikon}</div>
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
        <section id="uzmanlik" className="blanc-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Uzmanlık</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: '-1px', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Uzmanlık Alanlarım</h2>
          </div>
          <div className="blanc-uzmanlik-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {psych.uzmanlik_alanlari.map(alan => (
              <div key={alan} style={{ background: C.bg2, borderRadius: 12, padding: '16px 20px', border: `1px solid ${C.border}`, textAlign: 'center', fontSize: 14, fontWeight: 600, color: C.ink }}>
                {alan}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* EĞİTİM */}
      {psych.egitim && psych.egitim.length > 0 && (
        <section style={{ background: C.bg2, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Eğitim</div>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: '-1px', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Akademik Geçmiş</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderLeft: `2px solid ${C.accentLight}` }}>
              {psych.egitim.map((e, i) => (
                <div key={i} style={{ paddingLeft: 28, paddingBottom: 28, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -6, top: 4, width: 10, height: 10, borderRadius: '50%', background: C.accent }} />
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{e.baslik}</div>
                  <div style={{ fontSize: 13, color: C.inkLight, marginTop: 2 }}>{e.kurum}{e.yil ? ` · ${e.yil}` : ''}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BLOG */}
      {bloglar.length > 0 && (
        <section id="blog" className="blanc-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Blog</div>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: '-1px', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Yazılarım</h2>
            </div>
            <Link href={`https://${psych.booking_slug}.seansify.com/blog`} style={{ fontSize: 14, fontWeight: 700, color: C.accent, textDecoration: 'none' }}>Tümünü gör →</Link>
          </div>
          <div className="blanc-blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
            {bloglar.slice(0, 3).map(b => (
              <Link key={b.id} href={`https://${psych.booking_slug}.seansify.com/blog/${b.slug}`} style={{ textDecoration: 'none', display: 'block', background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s' }}>
                <div style={{ height: 180, background: `linear-gradient(135deg,${C.accentLight},${C.accent}20)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>
                  {b.kategori === 'Anksiyete' ? '💭' : b.kategori === 'Depresyon' ? '🌧' : b.kategori === 'İlişkiler' ? '💛' : '📝'}
                </div>
                <div style={{ padding: 20 }}>
                  {b.kategori && <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '1px' }}>{b.kategori}</span>}
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.ink, lineHeight: 1.4, margin: '8px 0' }}>{b.baslik}</h3>
                  <p style={{ fontSize: 13, color: C.inkLight, lineHeight: 1.6, margin: 0 }}>{blogOzet(b.icerik)}</p>
                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.inkLight }}>
                    <span>{tarih(b.created_at)}</span>
                    <span>{okumaMin(b.icerik)} dk okuma</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* RANDEVU */}
      <section id="randevu" style={{ background: C.ink, color: '#fff' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: paketler.length > 0 ? '1fr 1fr' : '1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent === '#3d6b5e' ? '#6ee7b7' : C.accentLight, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Randevu</div>
              <h2 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, letterSpacing: '-1.5px', margin: '0 0 16px', fontFamily: "'Playfair Display', Georgia, serif" }}>Birlikte çalışmaya hazır mısınız?</h2>
              <Link href={`https://seansify.com/book/${psych.booking_slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', color: C.ink, borderRadius: 10, padding: '14px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
                Randevu Al →
              </Link>
            </div>
            {paketler.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {paketler.map((p, i) => (
                  <div key={p.id} style={{ background: i === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 20px', border: `1px solid ${i === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{p.session_count} seans · ₺{(p.price_tl / p.session_count).toFixed(0)}/seans</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>₺{Number(p.price_tl).toLocaleString('tr-TR')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* YORUMLAR */}
      {yorumlar.length > 0 && (
        <section style={{ background: C.bg2, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Yorumlar</div>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: '-1px', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Danışan Deneyimleri</h2>
            </div>
            <div className="blanc-yorumlar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
              {yorumlar.filter(y => y.yorum_metni).slice(0, 3).map(y => (
                <div key={y.id} style={{ background: C.white, borderRadius: 16, padding: 24, border: `1px solid ${C.border}` }}>
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
      <section id="iletisim" className="blanc-section" style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 48 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>İletişim</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: '-1px', margin: '0 0 24px', fontFamily: "'Playfair Display', Georgia, serif" }}>Bize Ulaşın</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {psych.klinik_adi && <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{psych.klinik_adi}</div>}
              {psych.klinik_adres && <div style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.6 }}>{psych.klinik_adres}</div>}
              {psych.klinik_tel && <a href={`tel:${psych.klinik_tel}`} style={{ fontSize: 14, color: C.accent, fontWeight: 600, textDecoration: 'none' }}>📞 {psych.klinik_tel}</a>}
              {psych.calisma_saatleri && <div style={{ fontSize: 14, color: C.inkLight }}>🕐 {psych.calisma_saatleri}</div>}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.bg2, borderTop: `1px solid ${C.border}`, padding: '24px 40px', textAlign: 'center', fontSize: 12, color: C.inkLight }}>
        © {new Date().getFullYear()} {unvanTam} — {psych.sehir}
        &nbsp;·&nbsp;
        Randevu sistemi <a href="https://seansify.com" style={{ color: C.accent, textDecoration: 'none', fontWeight: 600 }}>Seansify</a> tarafından sağlanmaktadır
      </footer>

      {/* Floating CTA - Mobil */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, padding: '10px 16px 16px', background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)', borderTop: `1px solid ${C.border}`, display: 'none' }} className="blanc-floating-cta">
        <Link href={`https://seansify.com/book/${psych.booking_slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.accent, color: '#fff', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 16px rgba(61,107,94,0.4)' }}>
          Randevu Talebi Oluştur
        </Link>
      </div>
      <style>{`.blanc-floating-cta { display: none !important; } @media (max-width: 768px) { .blanc-floating-cta { display: block !important; } }`}</style>

    </div>
  )
}

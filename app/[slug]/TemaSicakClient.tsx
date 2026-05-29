'use client'

import Link from 'next/link'
import { useState } from 'react'
import { WebsiteProps, blogOzet, tarih, okumaMin } from './websiteTypes'

const C = {
  ink: '#2d1f14',
  inkLight: '#6b5344',
  bg: '#faf6f1',
  bgWarm: '#fdf0e8',
  accent: '#c17b5e',
  accent2: '#e8a98a',
  accentLight: '#fdf0e8',
  border: '#ecddd2',
  white: '#ffffff',
  dark: '#2d1f14',
}

export default function TemaSicakClient({ psych, bloglar, yorumlar, paketler }: WebsiteProps) {
  const [bioExpanded, setBioExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const ad = psych.full_name
  const unvanTam = psych.unvan ? `${psych.unvan} ${ad}` : ad
  const initials = ad.split(' ').map(k => k[0]).slice(0, 2).join('').toUpperCase()
  const ortalamaPuan = yorumlar.length > 0 ? (yorumlar.reduce((s, y) => s + y.yildiz, 0) / yorumlar.length).toFixed(1) : null
  const bioParagraphs = psych.bio_text?.split('\n\n') ?? []
  const bioShort = bioParagraphs[0] ?? ''
  const bioHasMore = bioParagraphs.length > 1

  return (
    <div style={{ fontFamily: '"Georgia", "Times New Roman", serif', background: C.bg, color: C.ink, lineHeight: 1.6 }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(250,246,241,0.97)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, padding: '0 40px', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#" style={{ fontSize: 17, fontWeight: 700, color: C.ink, textDecoration: 'none', fontStyle: 'italic' }}>
          {unvanTam}
        </a>
        <ul style={{ display: 'flex', gap: 6, listStyle: 'none', margin: 0, padding: 0, alignItems: 'center' }} className="sicak-nav-links">
          {[
            { href: '#hakkimda', label: 'Hakkımda' },
            { href: '#yaklasim', label: 'Yaklaşımım' },
            { href: '#uzmanlik', label: 'Uzmanlık' },
            ...(bloglar.length > 0 ? [{ href: '#blog', label: 'Blog' }] : []),
            { href: '#iletisim', label: 'İletişim' },
          ].map(l => (
            <li key={l.href}><a href={l.href} style={{ fontSize: 14, color: C.inkLight, textDecoration: 'none', padding: '6px 10px' }}>{l.label}</a></li>
          ))}
          <li><Link href={`/book/${psych.booking_slug}`} style={{ background: C.accent, color: '#fff', borderRadius: 24, padding: '8px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none', marginLeft: 8 }}>Randevu Al</Link></li>
        </ul>
        <button onClick={() => setMenuOpen(o => !o)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: C.ink }} className="sicak-hamburger">{menuOpen ? '✕' : '☰'}</button>
      </nav>

      {menuOpen && (
        <div style={{ position: 'fixed', top: 68, left: 0, right: 0, zIndex: 99, background: C.bg, borderBottom: `1px solid ${C.border}`, padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {[{ href: '#hakkimda', label: 'Hakkımda' }, { href: '#yaklasim', label: 'Yaklaşımım' }, { href: '#uzmanlik', label: 'Uzmanlık' }, { href: '#iletisim', label: 'İletişim' }].map(l => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} style={{ fontSize: 15, color: C.ink, textDecoration: 'none', padding: '10px 0', borderBottom: `1px solid ${C.border}` }}>{l.label}</a>
          ))}
          <Link href={`/book/${psych.booking_slug}`} onClick={() => setMenuOpen(false)} style={{ marginTop: 12, display: 'block', textAlign: 'center', background: C.accent, color: '#fff', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>Randevu Al</Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sicak-nav-links { display: none !important; }
          .sicak-hamburger { display: block !important; }
          .sicak-hero-grid { grid-template-columns: 1fr !important; }
          .sicak-hero-photo { display: none !important; }
          .sicak-stats-grid { grid-template-columns: 1fr 1fr !important; }
          .sicak-blog-grid { grid-template-columns: 1fr !important; }
          .sicak-yorumlar-grid { grid-template-columns: 1fr !important; }
          .sicak-randevu-grid { grid-template-columns: 1fr !important; }
          .sicak-contact-grid { grid-template-columns: 1fr !important; }
          .sicak-section { padding: 48px 20px !important; }
        }
      `}</style>

      {/* HERO */}
      <section style={{ background: `linear-gradient(160deg,${C.bgWarm},${C.bg})`, padding: '80px 40px 0', borderBottom: `1px solid ${C.border}` }}>
        <div className="sicak-hero-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 64, alignItems: 'end' }}>
          <div style={{ paddingBottom: 64 }}>
            {psych.unvan && <div style={{ fontSize: 12, fontWeight: 400, color: C.inkLight, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16, fontFamily: 'system-ui' }}>{psych.unvan}</div>}
            <h1 style={{ fontSize: 56, fontWeight: 700, color: C.ink, lineHeight: 1.05, letterSpacing: '-2px', margin: '0 0 20px', fontStyle: 'italic' }}>{ad}</h1>
            {psych.profil_alinti && (
              <p style={{ fontSize: 18, color: C.inkLight, lineHeight: 1.8, margin: '0 0 28px' }}>&ldquo;{psych.profil_alinti}&rdquo;</p>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
              <span style={{ fontSize: 12, color: '#16a34a', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '5px 12px', fontFamily: 'system-ui' }}>● Randevu Müsait</span>
              {psych.sehir && <span style={{ fontSize: 12, color: C.inkLight, background: 'rgba(255,255,255,0.7)', border: `1px solid ${C.border}`, borderRadius: 20, padding: '5px 12px', fontFamily: 'system-ui' }}>📍 {psych.sehir}</span>}
              {psych.tpd_uye_no && <span style={{ fontSize: 12, color: C.inkLight, background: 'rgba(255,255,255,0.7)', border: `1px solid ${C.border}`, borderRadius: 20, padding: '5px 12px', fontFamily: 'system-ui' }}>{psych.tpd_uye_no}</span>}
            </div>
            <Link href={`/book/${psych.booking_slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accent, color: '#fff', borderRadius: 12, padding: '14px 30px', fontSize: 16, fontWeight: 700, textDecoration: 'none', fontFamily: 'system-ui' }}>
              Randevu Al
            </Link>
          </div>
          <div className="sicak-hero-photo" style={{ position: 'relative', alignSelf: 'end' }}>
            {psych.foto_url ? (
              <img src={psych.foto_url} alt={ad} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '120px 120px 40px 40px', boxShadow: '0 20px 60px rgba(45,31,20,0.15)' }} />
            ) : (
              <div style={{ width: '100%', aspectRatio: '3/4', borderRadius: '120px 120px 40px 40px', background: `linear-gradient(160deg,${C.accent2},${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, fontWeight: 700, color: '#fff' }}>
                {initials}
              </div>
            )}
            {psych.deneyim_yil && (
              <div style={{ position: 'absolute', bottom: 24, right: -20, background: '#fff', borderRadius: 16, padding: '14px 18px', boxShadow: '0 8px 28px rgba(0,0,0,0.12)', fontFamily: 'system-ui' }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: C.accent, lineHeight: 1 }}>{psych.deneyim_yil}</div>
                <div style={{ fontSize: 11, color: C.inkLight, marginTop: 2 }}>yıl deneyim</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div className="sicak-stats-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', fontFamily: 'system-ui' }}>
          {[
            psych.deneyim_yil ? { v: `${psych.deneyim_yil}+`, l: 'Yıl Deneyim' } : null,
            ortalamaPuan ? { v: `${ortalamaPuan}★`, l: 'Değerlendirme' } : null,
            { v: `${psych.session_duration_minutes ?? 50} dk`, l: 'Seans Süresi' },
            { v: 'Ücretsiz', l: 'İlk Görüşme' },
          ].filter(Boolean).map((s, i, arr) => s && (
            <div key={i} style={{ padding: '24px 16px', textAlign: 'center', borderRight: i < arr.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.accent, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: C.inkLight, marginTop: 6 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HAKKIMDA */}
      {psych.bio_text && (
        <section id="hakkimda" className="sicak-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 48, alignItems: 'start' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'system-ui', marginBottom: 8 }}>Hakkımda</div>
              <div style={{ width: 40, height: 3, background: C.accent, borderRadius: 2 }} />
            </div>
            <div>
              <p style={{ fontSize: 17, color: C.inkLight, lineHeight: 1.9, margin: '0 0 16px' }}>{bioExpanded ? psych.bio_text : bioShort}</p>
              {bioHasMore && (
                <button onClick={() => setBioExpanded(e => !e)} style={{ background: 'none', border: 'none', color: C.accent, fontSize: 14, fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'system-ui' }}>
                  {bioExpanded ? 'Daha az göster ↑' : 'Devamını oku →'}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* YAKLAŞIMIM */}
      {psych.yaklasim && psych.yaklasim.length > 0 && (
        <section id="yaklasim" style={{ background: C.bgWarm, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px' }}>
            <div style={{ marginBottom: 48, fontFamily: 'system-ui' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Yaklaşımım</div>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: C.ink, fontFamily: '"Georgia",serif', margin: 0 }}>Çalışma Felsefem</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {psych.yaklasim.map((y, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 16, padding: '24px 28px', border: `1px solid ${C.border}`, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: C.accentLight, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{y.ikon}</div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: C.ink, margin: '0 0 8px', fontFamily: 'system-ui' }}>{y.baslik}</h3>
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
        <section id="uzmanlik" className="sicak-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px' }}>
          <div style={{ marginBottom: 40, fontFamily: 'system-ui' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Uzmanlık</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: C.ink, fontFamily: '"Georgia",serif', margin: 0 }}>Uzmanlık Alanlarım</h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {psych.uzmanlik_alanlari.map(alan => (
              <span key={alan} style={{ fontSize: 14, fontWeight: 600, color: C.ink, background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 24, padding: '8px 18px', fontFamily: 'system-ui' }}>{alan}</span>
            ))}
          </div>
        </section>
      )}

      {/* EĞİTİM */}
      {psych.egitim && psych.egitim.length > 0 && (
        <section style={{ background: C.bgWarm, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px', fontFamily: 'system-ui' }}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Eğitim</div>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: C.ink, fontFamily: '"Georgia",serif', margin: 0 }}>Akademik Geçmiş</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {psych.egitim.map((e, i) => (
                <div key={i} style={{ background: C.white, borderRadius: 14, padding: '18px 22px', border: `1px solid ${C.border}`, display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🎓</div>
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
        <section id="blog" className="sicak-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, fontFamily: 'system-ui' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Blog</div>
              <h2 style={{ fontSize: 36, fontWeight: 700, color: C.ink, fontFamily: '"Georgia",serif', margin: 0 }}>Yazılarım</h2>
            </div>
            <Link href={`/${psych.booking_slug}/blog`} style={{ fontSize: 14, fontWeight: 700, color: C.accent, textDecoration: 'none', fontFamily: 'system-ui' }}>Tümünü gör →</Link>
          </div>
          <div style={{ display: 'grid', gap: 24 }}>
            {bloglar.slice(0, 1).map(b => (
              <Link key={b.id} href={`/${psych.booking_slug}/blog/${b.slug}`} style={{ textDecoration: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, background: C.white, borderRadius: 20, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 2px 16px rgba(45,31,20,0.06)' }}>
                <div style={{ background: `linear-gradient(135deg,${C.accent2},${C.accent})`, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, fontSize: 64 }}>📖</div>
                <div style={{ padding: 28 }}>
                  {b.kategori && <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'system-ui' }}>{b.kategori}</span>}
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: C.ink, lineHeight: 1.35, margin: '10px 0' }}>{b.baslik}</h3>
                  <p style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.7, margin: 0, fontFamily: 'system-ui' }}>{blogOzet(b.icerik, 140)}</p>
                  <div style={{ marginTop: 16, fontSize: 12, color: C.inkLight, fontFamily: 'system-ui' }}>{tarih(b.created_at)} · {okumaMin(b.icerik)} dk okuma</div>
                </div>
              </Link>
            ))}
            <div className="sicak-blog-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
              {bloglar.slice(1, 3).map(b => (
                <Link key={b.id} href={`/${psych.booking_slug}/blog/${b.slug}`} style={{ textDecoration: 'none', background: C.white, borderRadius: 16, padding: 22, border: `1px solid ${C.border}`, display: 'block' }}>
                  {b.kategori && <span style={{ fontSize: 10, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: 'system-ui' }}>{b.kategori}</span>}
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.ink, lineHeight: 1.4, margin: '8px 0' }}>{b.baslik}</h3>
                  <p style={{ fontSize: 13, color: C.inkLight, lineHeight: 1.6, margin: 0, fontFamily: 'system-ui' }}>{blogOzet(b.icerik)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RANDEVU */}
      <section id="randevu" style={{ background: C.bgWarm, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div className="sicak-randevu-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: paketler.length > 0 ? '1fr 1fr' : '1fr', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', fontFamily: 'system-ui', marginBottom: 8 }}>Randevu</div>
            <h2 style={{ fontSize: 40, fontWeight: 700, color: C.ink, fontFamily: '"Georgia",serif', lineHeight: 1.2, margin: '0 0 16px' }}>Birlikte yola çıkalım.</h2>
            <p style={{ fontSize: 15, color: C.inkLight, lineHeight: 1.8, margin: '0 0 28px', fontFamily: 'system-ui' }}>İlk görüşme ücretsizdir, zorunluluk yaratmaz. Sadece tanışmak için gelin.</p>
            <Link href={`/book/${psych.booking_slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.accent, color: '#fff', borderRadius: 12, padding: '14px 28px', fontSize: 15, fontWeight: 700, textDecoration: 'none', fontFamily: 'system-ui' }}>
              Ücretsiz İlk Görüşme
            </Link>
          </div>
          {paketler.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'system-ui' }}>
              {paketler.map((p, i) => (
                <div key={p.id} style={{ background: i === 0 ? C.accent : C.white, borderRadius: 16, padding: '18px 22px', border: `1px solid ${i === 0 ? C.accent : C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: i === 0 ? '0 4px 16px rgba(193,123,94,0.25)' : 'none' }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: i === 0 ? '#fff' : C.ink }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: i === 0 ? 'rgba(255,255,255,0.7)' : C.inkLight, marginTop: 2 }}>{p.session_count} seans · ₺{(p.price_tl / p.session_count).toFixed(0)}/seans</div>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: i === 0 ? '#fff' : C.accent }}>₺{Number(p.price_tl).toLocaleString('tr-TR')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* YORUMLAR */}
      {yorumlar.length > 0 && (
        <section className="sicak-section" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48, fontFamily: 'system-ui' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>Yorumlar</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: C.ink, fontFamily: '"Georgia",serif', margin: 0 }}>Danışan Deneyimleri</h2>
          </div>
          <div className="sicak-yorumlar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, fontFamily: 'system-ui' }}>
            {yorumlar.filter(y => y.yorum_metni).slice(0, 3).map(y => (
              <div key={y.id} style={{ background: C.white, borderRadius: 20, padding: 24, border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(45,31,20,0.05)' }}>
                <div style={{ color: '#f59e0b', fontSize: 16, marginBottom: 12 }}>{'★'.repeat(y.yildiz)}</div>
                <p style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 16px' }}>&ldquo;{y.yorum_metni}&rdquo;</p>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.ink }}>{y.reviewer_init ?? 'Anonim'}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* İLETİŞİM */}
      <section id="iletisim" style={{ background: C.bgWarm, borderTop: `1px solid ${C.border}` }}>
        <div className="sicak-contact-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, fontFamily: 'system-ui' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 8 }}>İletişim</div>
            <h2 style={{ fontSize: 36, fontWeight: 700, color: C.ink, fontFamily: '"Georgia",serif', margin: '0 0 24px' }}>Bize Ulaşın</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {psych.klinik_adi && <div style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{psych.klinik_adi}</div>}
              {psych.klinik_adres && <div style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.6 }}>{psych.klinik_adres}</div>}
              {psych.klinik_tel && <a href={`tel:${psych.klinik_tel}`} style={{ fontSize: 14, color: C.accent, fontWeight: 600, textDecoration: 'none' }}>📞 {psych.klinik_tel}</a>}
              {psych.calisma_saatleri && <div style={{ fontSize: 14, color: C.inkLight }}>🕐 {psych.calisma_saatleri}</div>}
            </div>
          </div>
          <div style={{ background: C.white, borderRadius: 20, padding: 32, border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(45,31,20,0.07)' }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: C.ink, fontFamily: '"Georgia",serif', margin: '0 0 12px' }}>Kapımız açık</h3>
            <p style={{ fontSize: 14, color: C.inkLight, lineHeight: 1.7, margin: '0 0 22px' }}>Sormak istediğiniz her şey için buradayım. İlk adım zor — ama zorunlu değil.</p>
            <Link href={`/book/${psych.booking_slug}`} style={{ display: 'block', textAlign: 'center', background: C.accent, color: '#fff', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
              Randevu Al →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.dark, padding: '28px 40px', textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'system-ui' }}>
        © {new Date().getFullYear()} {unvanTam}
        &nbsp;·&nbsp;
        Randevu sistemi <a href="https://seansify.com" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 600 }}>Seansify</a> tarafından sağlanmaktadır
      </footer>

      {/* Floating CTA - Mobil */}
      <style>{`.sicak-floating { display: none !important; } @media (max-width: 768px) { .sicak-floating { display: block !important; } }`}</style>
      <div className="sicak-floating" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, padding: '10px 16px 16px', background: 'rgba(250,246,241,0.97)', backdropFilter: 'blur(12px)', borderTop: `1px solid ${C.border}` }}>
        <Link href={`/book/${psych.booking_slug}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.accent, color: '#fff', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          Randevu Talebi Oluştur
        </Link>
      </div>

    </div>
  )
}

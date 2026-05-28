'use client'

import Link from 'next/link'

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
}

interface Props {
  psych: Psych
  bloglar: Blog[]
  yorumlar: Yorum[]
  paketler: Paket[]
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
  return icerik.replace(/#+\s/g, '').replace(/\*\*/g, '').slice(0, 120) + '...'
}

function tarihFormatla(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function okumaMin(icerik: string) {
  const kelime = icerik.split(/\s+/).length
  return Math.max(1, Math.round(kelime / 200))
}

export default function ProfilClient({ psych, bloglar, yorumlar, paketler }: Props) {
  const g = psych.profil_gorunum ?? {}
  const show = {
    uzmanlik: g.show_uzmanlik !== false,
    paketler:  g.show_paketler  !== false,
    yorumlar:  g.show_yorumlar  !== false,
    blog:      g.show_blog      !== false,
    egitim:    g.show_egitim    !== false,
    klinik:    g.show_klinik    !== false,
  }

  const ad = psych.full_name
  const unvanTam = psych.unvan ? `${psych.unvan} ${ad}` : ad
  const initials = ad.split(' ').map(k => k[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={{ background: '#f4f9f7', minHeight: '100vh' }}>

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
        <span style={{ fontSize: 13, fontWeight: 600, color: '#475569', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
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
        padding: '40px 20px 0', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(110,231,183,0.07),transparent 70%)',
          top: -80, right: -80, pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Profil satırı */}
          <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', marginBottom: 22 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {psych.foto_url ? (
                <img src={psych.foto_url} alt={ad} style={{ width: 90, height: 90, borderRadius: 22, objectFit: 'cover', border: '2px solid rgba(110,231,183,0.3)' }} />
              ) : (
                <div style={{
                  width: 90, height: 90, borderRadius: 22,
                  background: 'linear-gradient(135deg,#4a7c6f,#6ee7b7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, fontWeight: 800, color: '#fff',
                  border: '2px solid rgba(110,231,183,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}>
                  {initials}
                </div>
              )}
              <div style={{
                position: 'absolute', bottom: -3, right: -3,
                width: 20, height: 20, borderRadius: '50%',
                background: '#22c55e', border: '3px solid #152b1e',
              }} />
            </div>
            <div style={{ paddingTop: 2 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6ee7b7', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 5 }}>
                {psych.unvan ?? 'Psikolog'}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.15, marginBottom: 7 }}>
                {ad}
              </div>
              {psych.sehir && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {psych.sehir}
                </div>
              )}
            </div>
          </div>

          {/* Alıntı */}
          {psych.profil_alinti && (
            <div style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderLeft: '3px solid #6ee7b7', borderRadius: '0 12px 12px 0',
              padding: '12px 16px', marginBottom: 22,
              fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, fontStyle: 'italic',
            }}>
              &quot;{psych.profil_alinti}&quot;
            </div>
          )}

          {/* Chip'ler */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 22 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: 'rgba(110,231,183,0.12)', border: '1px solid rgba(110,231,183,0.25)', color: '#6ee7b7' }}>● Randevu Mevcut</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}>✓ Online Seans</span>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}>✓ Yüz Yüze</span>
            {psych.dil && psych.dil.length > 0 && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}>
                {psych.dil.join(' · ')}
              </span>
            )}
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            background: 'rgba(0,0,0,0.25)', borderRadius: '16px 16px 0 0',
            border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', overflow: 'hidden',
          }}>
            {psych.deneyim_yil && (
              <div style={{ padding: '16px 12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{psych.deneyim_yil}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Yıl Deneyim</div>
              </div>
            )}
            <div style={{ padding: '16px 12px', textAlign: 'center', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{yorumlar.length > 0 ? `${(yorumlar.reduce((s, y) => s + y.yildiz, 0) / yorumlar.length).toFixed(1)}★` : '—'}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Değerlendirme</div>
            </div>
            <div style={{ padding: '16px 12px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{psych.session_duration_minutes ?? 50} dk</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Seans Süresi</div>
            </div>
          </div>

        </div>
      </section>

      {/* QUICK BAR */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e4eeea', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', overflowX: 'auto' }}>
          {psych.calisma_saatleri && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '13px 16px', borderRight: '1px solid #f0f7f4', flexShrink: 0, whiteSpace: 'nowrap' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span style={{ fontSize: 12, color: '#64748b' }}>{psych.calisma_saatleri}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '13px 16px', borderRight: '1px solid #f0f7f4', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: 12, color: '#64748b' }}>İlk görüşme <strong style={{ color: '#1e293b' }}>ücretsiz</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '13px 16px', borderRight: '1px solid #f0f7f4', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: 12, color: '#64748b' }}><strong style={{ color: '#1e293b' }}>48 saat</strong> içinde yanıt</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '13px 16px', flexShrink: 0, whiteSpace: 'nowrap' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <span style={{ fontSize: 12, color: '#64748b' }}>Gizlilik <strong style={{ color: '#1e293b' }}>güvencesi</strong></span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* HAKKIMDA */}
        {psych.bio_text && (
          <>
            <div style={{ padding: '26px 20px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0d1f18', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a7c6f', display: 'inline-block' }} />
                Hakkımda
              </div>
              <div style={{ background: '#fff', borderRadius: 18, padding: 22, border: '1px solid #e4eeea', boxShadow: '0 2px 16px rgba(74,124,111,0.06)' }}>
                {psych.bio_text.split('\n\n').map((p, i) => (
                  <p key={i} style={{ fontSize: 14, color: '#475569', lineHeight: 1.85, marginTop: i > 0 ? 12 : 0 }}>{p}</p>
                ))}
              </div>
            </div>
            <div style={{ height: 1, background: 'linear-gradient(90deg,#e4eeea,transparent)', margin: '0 20px' }} />
          </>
        )}

        {/* NEDEN BEN */}
        <div style={{ padding: '26px 20px' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#0d1f18', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a7c6f', display: 'inline-block' }} />
            Neden Benimle Çalışmalısınız?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { emoji: '🛡️', title: 'Güvenli Alan', desc: 'Yargılamadan, baskı yapmadan — sadece sizin hızınızda ilerliyoruz.' },
              { emoji: '🔬', title: 'Kanıta Dayalı', desc: 'Bilimsel temelli terapi yöntemlerini kullanıyorum.' },
              { emoji: '💻', title: 'Online & Yüz Yüze', desc: 'Türkiye\'nin her yerinden online seans imkânı.' },
              { emoji: '🤝', title: 'Uzun Vadeli Destek', desc: 'Süreci birlikte planlıyor, adım adım ilerliyoruz.' },
            ].map(item => (
              <div key={item.title} style={{ background: '#fff', borderRadius: 16, padding: '18px 16px', border: '1px solid #e4eeea', boxShadow: '0 2px 12px rgba(74,124,111,0.05)' }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 11, fontSize: 18 }}>
                  {item.emoji}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.55 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* UZMANLIK */}
        {show.uzmanlik && psych.uzmanlik_alanlari && psych.uzmanlik_alanlari.length > 0 && (
          <>
            <div style={{ height: 1, background: 'linear-gradient(90deg,#e4eeea,transparent)', margin: '0 20px' }} />
            <div style={{ padding: '26px 20px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0d1f18', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a7c6f', display: 'inline-block' }} />
                Uzmanlık Alanları
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {psych.uzmanlik_alanlari.map(alan => (
                  <span key={alan} style={{ fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 10, background: '#fff', color: '#15803d', border: '1.5px solid #bbf7d0', boxShadow: '0 1px 4px rgba(74,124,111,0.08)' }}>
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
            <div style={{ height: 1, background: 'linear-gradient(90deg,#e4eeea,transparent)', margin: '0 20px' }} />
            <div style={{ padding: '26px 20px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0d1f18', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a7c6f', display: 'inline-block' }} />
                Eğitim & Sertifikalar
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {psych.egitim.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '15px 0', borderBottom: i < psych.egitim!.length - 1 ? '1px solid #f0f7f4' : 'none' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4a7c6f', border: '2px solid #fff', boxShadow: '0 0 0 2px #4a7c6f', flexShrink: 0, marginTop: 3 }} />
                      {i < psych.egitim!.length - 1 && <div style={{ width: 2, flex: 1, background: '#e4eeea', marginTop: 4 }} />}
                    </div>
                    <div style={{ paddingBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{e.baslik}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{e.kurum}</div>
                      {e.yil && <span style={{ fontSize: 11, color: '#4a7c6f', fontWeight: 700, marginTop: 5, display: 'inline-block', background: '#f0fdf4', padding: '2px 9px', borderRadius: 6 }}>{e.yil}</span>}
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
            <div style={{ height: 1, background: 'linear-gradient(90deg,#e4eeea,transparent)', margin: '0 20px' }} />
            <div style={{ padding: '26px 20px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0d1f18', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a7c6f', display: 'inline-block' }} />
                Seans Paketleri
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {paketler.map(p => (
                  <div key={p.id} style={{
                    background: '#fff', borderRadius: 16, padding: '18px 20px',
                    border: '1px solid #e4eeea', boxShadow: '0 2px 10px rgba(74,124,111,0.04)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{p.name}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 12, color: '#64748b', background: '#f4f9f7', padding: '3px 10px', borderRadius: 6, border: '1px solid #e4eeea' }}>
                          {p.session_count} seans
                        </span>
                        <span style={{ fontSize: 12, color: '#4a7c6f', background: '#f0fdf4', padding: '3px 10px', borderRadius: 6, border: '1px solid #bbf7d0', fontWeight: 600 }}>
                          ₺{(p.price_tl / p.session_count).toFixed(0)}/seans
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#0d1f18', lineHeight: 1 }}>
                        ₺{Number(p.price_tl).toLocaleString('tr-TR')}
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>toplam</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, textAlign: 'center' }}>
                <Link
                  href={`/book/${psych.booking_slug}`}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'linear-gradient(135deg,#4a7c6f,#3a6b5e)', color: '#fff',
                    borderRadius: 12, padding: '12px 26px', fontSize: 14, fontWeight: 700,
                    textDecoration: 'none', boxShadow: '0 4px 14px rgba(74,124,111,0.35)',
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
            <div style={{ height: 1, background: 'linear-gradient(90deg,#e4eeea,transparent)', margin: '0 20px' }} />
            <div style={{ padding: '26px 20px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0d1f18', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a7c6f', display: 'inline-block' }} />
                Danışan Deneyimleri
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {yorumlar.map(y => y.yorum_metni && (
                  <div key={y.id} style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #e4eeea', borderLeft: '3px solid #4a7c6f', boxShadow: '0 2px 10px rgba(74,124,111,0.05)' }}>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12 }}>
                      &quot;{y.yorum_metni}&quot;
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#4a7c6f,#6ee7b7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                        {y.reviewer_init ?? '?'}
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#334155' }}>{y.reviewer_init ?? 'Anonim'} · Danışan</div>
                      <div style={{ marginLeft: 'auto', color: '#f59e0b', fontSize: 12, letterSpacing: 1 }}>{'★'.repeat(y.yildiz)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* BLOG */}
        {show.blog && bloglar.length > 0 && (
          <>
            <div style={{ height: 1, background: 'linear-gradient(90deg,#e4eeea,transparent)', margin: '0 20px' }} />
            <div style={{ padding: '26px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#0d1f18', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a7c6f', display: 'inline-block' }} />
                  Blog Yazıları
                </div>
                <Link href={`/${psych.booking_slug}/blog`} style={{ fontSize: 12, color: '#4a7c6f', fontWeight: 700, textDecoration: 'none' }}>Tümünü gör →</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {bloglar.map(b => {
                  const renk = katRenk(b.kategori)
                  return (
                    <Link key={b.id} href={`/${psych.booking_slug}/blog/${b.slug}`} style={{ background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid #e4eeea', textDecoration: 'none', display: 'block', boxShadow: '0 2px 10px rgba(74,124,111,0.04)' }}>
                      {b.kategori && (
                        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 9px', borderRadius: 6, display: 'inline-block', marginBottom: 9, background: renk.bg, color: renk.color }}>
                          {b.kategori}
                        </span>
                      )}
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', lineHeight: 1.45, marginBottom: 6 }}>{b.baslik}</h3>
                      <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.65 }}>{blogOzet(b.icerik)}</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 11, fontSize: 11, color: '#94a3b8' }}>
                        <span>{tarihFormatla(b.created_at)}</span>
                        <span style={{ color: '#4a7c6f', fontWeight: 600 }}>{okumaMin(b.icerik)} dk okuma →</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* KLİNİK */}
        {show.klinik && (psych.klinik_adi || psych.klinik_adres) && (
          <>
            <div style={{ height: 1, background: 'linear-gradient(90deg,#e4eeea,transparent)', margin: '0 20px' }} />
            <div style={{ padding: '26px 20px' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0d1f18', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4a7c6f', display: 'inline-block' }} />
                Klinik & Konum
              </div>
              <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', border: '1px solid #e4eeea', boxShadow: '0 2px 16px rgba(74,124,111,0.06)' }}>
                <div style={{ height: 130, background: 'linear-gradient(135deg,#e8f5f0,#d4ede7,#c4e4db)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span style={{ fontSize: 12, color: '#4a7c6f', fontWeight: 600 }}>Haritada Göster</span>
                </div>
                <div style={{ padding: 18 }}>
                  {psych.klinik_adi && <div style={{ fontSize: 14, fontWeight: 800, color: '#1e293b', marginBottom: 5 }}>{psych.klinik_adi}</div>}
                  {psych.klinik_adres && <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.65, marginBottom: 14 }}>{psych.klinik_adres}</div>}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {psych.calisma_saatleri && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f4f9f7', border: '1px solid #d4ede7', borderRadius: 9, padding: '7px 12px', fontSize: 12, color: '#334155', fontWeight: 500 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {psych.calisma_saatleri}
                      </div>
                    )}
                    {psych.klinik_tel && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f4f9f7', border: '1px solid #d4ede7', borderRadius: 9, padding: '7px 12px', fontSize: 12, color: '#334155', fontWeight: 500 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5"><rect x="5" y="2" width="14" height="20" rx="2"/></svg>
                        {psych.klinik_tel}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* RANDEVU CTA */}
      <section id="randevu" style={{
        background: 'linear-gradient(145deg,#0b1c14,#152b1e,#1e4535)',
        padding: '44px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle,rgba(110,231,183,0.08),transparent 70%)', top: -80, right: -60, pointerEvents: 'none' }} />
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px', marginBottom: 10, position: 'relative' }}>
          Randevu Almak İster Misiniz?
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 28, lineHeight: 1.7, position: 'relative' }}>
          İlk görüşmede neler üzerinde çalışabileceğimizi konuşur,<br />süreci birlikte planlarız.
        </p>
        <Link
          href={`/book/${psych.booking_slug}`}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 9,
            background: 'linear-gradient(135deg,#4a7c6f,#3a6b5e)', color: '#fff',
            borderRadius: 14, padding: '15px 30px', fontSize: 15, fontWeight: 700,
            textDecoration: 'none', position: 'relative',
            boxShadow: '0 4px 20px rgba(74,124,111,0.45)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Randevu Talebi Oluştur
        </Link>
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 18, marginTop: 22, position: 'relative' }}>
          {['İlk görüşme ücretsiz', '48 saat içinde yanıt', 'Online & Yüz Yüze'].map(t => (
            <span key={t} style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6ee7b7" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#fff', borderTop: '1px solid #e4eeea', padding: '18px 24px', textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
        Bu sayfa <Link href="/" style={{ color: '#4a7c6f', textDecoration: 'none', fontWeight: 700 }}>Seansify</Link> altyapısıyla oluşturulmuştur &nbsp;·&nbsp; seansify.com/{psych.booking_slug}
      </footer>

    </div>
  )
}

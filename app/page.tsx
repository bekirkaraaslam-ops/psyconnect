import Link from 'next/link'
import type { Metadata } from 'next'
import DemoTabs from '@/components/landing/DemoTabs'
import ScrollRevealInit from '@/components/landing/ScrollRevealInit'
import FeaturesCarousel from '@/components/landing/FeaturesCarousel'
import HowItWorks from '@/components/landing/HowItWorks'
import BeforeAfter from '@/components/landing/BeforeAfter'
import BlobBackground from '@/components/landing/BlobBackground'
import SectionDots from '@/app/[slug]/SectionDots'
import ShootingStars from '@/components/landing/ShootingStars'

export const metadata: Metadata = {
  title: 'Seansify — Psikologlar için Klinik Yönetim Platformu',
  description: 'Randevularınızı yönetin, WhatsApp ile otomatik hatırlatıcı gönderin. KVKK uyumlu, güvenli klinik yönetim sistemi.',
}

async function getPsychologistCount(): Promise<number> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/stats`, { next: { revalidate: 300 } })
    if (!res.ok) return 0
    const data = await res.json()
    return data.count ?? 0
  } catch {
    return 0
  }
}

export default async function LandingPage() {
  const psychologistCount = await getPsychologistCount()

  return (
    <div data-page="landing" className="min-h-screen" style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: '#f5faf8' }}>
      <BlobBackground />

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #c8e6dc' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="#hero" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#4a7c6f' }}>
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <rect x="6" y="11" width="28" height="24" rx="3" fill="white" />
                <rect x="6" y="11" width="28" height="10" rx="3" fill="white" fillOpacity="0.25" />
                <rect x="6" y="18" width="28" height="3" fill="white" fillOpacity="0.15" />
                <rect x="13" y="7" width="3" height="8" rx="1.5" fill="white" />
                <rect x="24" y="7" width="3" height="8" rx="1.5" fill="white" />
                <circle cx="20" cy="25" r="4" fill="#4a7c6f" />
                <path d="M13 35C13 31 16 28 20 28C24 28 27 31 27 35" fill="#4a7c6f" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight" style={{ color: '#0d1f18' }}>Seansify</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {['#ozellikler', '#fiyatlandirma', '#sss', '#iletisim'].map((href, i) => (
              <a key={href} href={href} className="text-sm font-medium transition-colors hover:text-green-700" style={{ color: '#3d5952' }}>
                {['Özellikler', 'Fiyatlandırma', 'SSS', 'İletişim'][i]}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium rounded-lg" style={{ color: '#3d5952' }}>Giriş Yap</Link>
            <Link href="/register" className="btn-primary px-4 py-2 text-sm font-semibold rounded-lg" style={{ background: '#4a7c6f', color: '#ffffff' }}>
              Kliniğini Dijitalleştir
            </Link>
          </div>

          <details className="md:hidden group relative">
            <summary className="list-none cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg" style={{ color: '#3d5952' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </summary>
            <div className="absolute right-0 top-12 w-56 rounded-xl shadow-2xl p-4 flex flex-col gap-2" style={{ background: 'white', border: '1px solid #c8e6dc' }}>
              {['#ozellikler', '#fiyatlandirma', '#sss', '#iletisim'].map((href, i) => (
                <a key={href} href={href} className="px-3 py-2 text-sm rounded-lg" style={{ color: '#3d5952' }}>
                  {['Özellikler', 'Fiyatlandırma', 'SSS', 'İletişim'][i]}
                </a>
              ))}
              <hr style={{ borderColor: '#c8e6dc' }} />
              <Link href="/login" className="px-3 py-2 text-sm rounded-lg" style={{ color: '#3d5952' }}>Giriş Yap</Link>
              <Link href="/register" className="px-3 py-2 text-sm font-semibold rounded-lg text-center" style={{ background: '#4a7c6f', color: 'white' }}>Kliniğini Dijitalleştir</Link>
            </div>
          </details>
        </div>
      </header>

      {/* ── Hero ── */}
      <section id="hero" style={{ background: 'linear-gradient(135deg, #1a3a2e 0%, #2d5a51 40%, #4a7c6f 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* Aurora blobs + rotating gradient */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '220%', height: '220%',
            background: 'conic-gradient(from 0deg at 50% 50%, rgba(110,231,183,0.0) 0deg, rgba(110,231,183,0.14) 60deg, rgba(74,124,111,0.18) 120deg, rgba(26,58,46,0.05) 180deg, rgba(45,90,81,0.16) 240deg, rgba(110,231,183,0.09) 300deg, rgba(110,231,183,0.0) 360deg)',
            animation: 'gradientRotate 28s linear infinite',
            willChange: 'transform',
          }} />
          <div style={{
            position: 'absolute', top: '-10%', right: '-5%',
            width: '55%', height: '70%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(110,231,183,0.16) 0%, transparent 70%)',
            animation: 'blobFloat1 14s ease-in-out infinite',
            willChange: 'transform',
          }} />
          <div style={{
            position: 'absolute', bottom: '5%', left: '-8%',
            width: '50%', height: '60%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(74,124,111,0.26) 0%, transparent 70%)',
            animation: 'blobFloat2 18s ease-in-out infinite',
            willChange: 'transform',
          }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-14" style={{ position: 'relative', zIndex: 1 }}>
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-10">

            {/* ── Sol: Metin ── */}
            <div className="flex-1 text-center md:text-left">
              <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6 tracking-wide" style={{ background: 'rgba(255,255,255,0.12)', color: '#d4f0e8', border: '1px solid rgba(255,255,255,0.2)' }}>
                <span>✦</span>
                <span>Türkiye'nin Psikolog Platformu</span>
              </div>

              <h1 className="animate-fade-up delay-100 text-3xl md:text-5xl font-extrabold leading-tight mb-4 tracking-tight text-white">
                Klinik Yönetimini<br />Otomatikleştir
              </h1>
              <p className="animate-fade-up delay-200 text-2xl md:text-3xl font-extrabold mb-5 tracking-tight" style={{ color: '#a8e6d4' }}>
                Danışanlara Odaklan
              </p>
              <p className="animate-fade-up delay-300 text-sm md:text-base max-w-md mb-8 leading-relaxed mx-auto md:mx-0" style={{ color: 'rgba(255,255,255,0.75)' }}>
                Pazartesi sabahı takvime bakıyorsunuz — bir randevu iptal, biri onaylamadı, biri saat değiştirmek istiyor. Gün daha başlamadı. <span style={{ color: '#6ee7b7', fontWeight: 700 }}>Seansify</span>, bu döngüyü sizin yerinize yönetir.
              </p>

              <div className="animate-fade-up delay-400 flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-8">
                <Link href="/register" className="btn-primary inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold shadow-lg" style={{ background: 'white', color: '#2d5a51' }}>
                  Kliniğini Dijitalleştir
                  <span className="btn-arrow">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </Link>
                <a href="#nasil-calisir" className="btn-ghost inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
                  Nasıl Çalışır?
                </a>
              </div>

              {/* Stats */}
              <div className="animate-fade-in delay-500 flex flex-wrap items-center justify-center md:justify-start gap-6 mb-4">
                {[
                  { value: '%60', label: 'Daha az no-show' },
                  { value: '4+ saat', label: 'Haftalık tasarruf' },
                  { value: '7/24', label: 'Otomatik randevu' },
                ].map((s, i) => (
                  <div key={i} className="flex flex-col items-center md:items-start gap-0.5">
                    <span className="text-xl font-extrabold text-white" style={{ letterSpacing: '-0.5px' }}>{s.value}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span className="flex items-center gap-1.5">🔒 256-bit SSL</span>
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                <span className="flex items-center gap-1.5">🇹🇷 KVKK Uyumlu</span>
                <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
                <span className="flex items-center gap-1.5">⚡ 5 dakikada kurulum</span>
              </div>
            </div>

            {/* ── Sağ: Demo Mockup ── */}
            <div className="flex-1 md:max-w-[52%]">
              <DemoTabs heroMode />
            </div>

          </div>
        </div>
      </section>

      {/* <DemoTabs /> */}

      {/* <BeforeAfter /> */}

      <HowItWorks />

      {/* ── Özellikler ── */}
      <section id="ozellikler" className="py-16 md:py-24" style={{ background: 'linear-gradient(180deg, #2d5a51 0%, #4a7c6f 100%)', backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(180deg, #2d5a51 0%, #4a7c6f 100%)', backgroundSize: '28px 28px, 100% 100%' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4 text-white scroll-reveal">Her Şey Tek Platformda</h2>
            <p className="text-base max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>Klinik yönetiminiz için ihtiyacınız olan tüm araçlar, tek çatı altında.</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <FeaturesCarousel />
        </div>
      </section>

      {/* ── Fiyatlandırma ── */}
      <section id="fiyatlandirma" className="py-16 md:py-24" style={{ position: 'relative', backgroundColor: '#eaf3ef', backgroundImage: 'radial-gradient(circle, rgba(74,124,111,0.13) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
        <ShootingStars />
        <div className="max-w-4xl mx-auto px-6" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-5">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4 scroll-reveal" style={{ color: '#0d1f18' }}>Şeffaf Fiyatlandırma</h2>
            <p className="text-base" style={{ color: '#5a7a72' }}>İstediğin zaman iptal et, taahhüt yok.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white rounded-2xl p-5 md:p-8" style={{ border: '1px solid #c8e6dc', boxShadow: '0 1px 6px rgba(74,124,111,0.08)' }}>
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1" style={{ color: '#0d1f18' }}>Seansify One</h3>
                <p className="text-xs mb-4" style={{ color: '#5a7a72' }}>Tüm özellikler, küçük pratikler için</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold" style={{ color: '#0d1f18' }}>749</span>
                  <span className="text-lg font-semibold mb-1" style={{ color: '#6b8c84' }}>₺/ay</span>
                </div>
              </div>
              <ul className="space-y-3 mb-5">
                {[
                  'Randevu takvimi',
                  'Seans notları ve ödev takibi',
                  'Anamnez & onam formları',
                  'Kişisel profil sayfası',
                  'Blog yazısı (5 adet)',
                  'Danışan değerlendirme sistemi',
                  'WhatsApp hatırlatıcı (60/ay)',
                ].map((text) => (
                  <li key={text} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex-shrink-0 font-bold" style={{ color: '#4a7c6f' }}>✓</span>
                    <span style={{ color: '#1e3d36' }}>{text}</span>
                  </li>
                ))}
              </ul>
              <ul className="space-y-1.5 mb-7 pl-1">
                {['20 aktif hasta limiti', '15 form/ay', 'Son 3 ay raporu'].map(l => (
                  <li key={l} className="text-xs" style={{ color: '#94a3b8' }}>· {l}</li>
                ))}
              </ul>
              <Link href="/register?plan=one" className="block w-full text-center py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90" style={{ border: '2px solid #4a7c6f', color: '#4a7c6f' }}>
                Seansify One Seç
              </Link>
            </div>

            <div className="pricing-pro rounded-2xl p-5 md:p-8 relative" style={{ background: '#4a7c6f', border: '2px solid #3a6b5e' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full text-xs font-bold" style={{ background: '#2d5a51', color: 'white' }}>EN POPÜLER</span>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1 text-white">Seansify Pro</h3>
                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>Sınırsız her şey, tam WhatsApp otomasyonu</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">1.850</span>
                  <span className="text-lg font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>₺/ay</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Sınırsız hasta kaydı',
                  'Sınırsız WhatsApp mesajı',
                  'Otomatik randevu asistanı',
                  'Tüm seans geçmişi',
                  'Sınırsız form gönderimi',
                  'Sınırsız blog yazısı',
                  'Tam rapor geçmişi',
                  'Bekleme listesi otomasyonu',
                  'Öncelikli destek',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex-shrink-0 font-bold text-white">✓</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register?plan=pro" className="block w-full text-center py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 shadow-lg" style={{ background: 'white', color: '#4a7c6f' }}>
                Pro'ya Geç
              </Link>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm mb-6" style={{ color: '#4a7c6f' }}>
              🎁 <strong>Referral programı:</strong> Her aktif referans için indirim kazan
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[{ icon: '🔒', text: 'SSL Güvenli Ödeme' }, { icon: '💳', text: 'Lemon Squeezy ile Güvenli' }, { icon: '↩️', text: 'İstediğin Zaman İptal' }].map((b) => (
                <div key={b.text} className="flex items-center gap-2 text-xs" style={{ color: '#5a7a72' }}>
                  <span>{b.icon}</span><span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SSS ── */}
      <section id="sss" className="py-16 md:py-24" style={{ position: 'relative', backgroundColor: '#f2f8f5', backgroundImage: 'radial-gradient(circle, rgba(74,124,111,0.10) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
        <ShootingStars />
        <div className="max-w-3xl mx-auto px-6" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4 scroll-reveal" style={{ color: '#0d1f18' }}>Sık Sorulan Sorular</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: 'Deneme süresi var mı?', a: 'Evet, 14 günlük deneme sunuyoruz. Bu süre zarfında tüm özelliklere tam erişimle randevu otomasyonunu, WhatsApp entegrasyonunu ve yapay zeka asistanını bizzat deneyimleyebilirsiniz. Beğenirsen devam et, beğenmezsen hiçbir şey ödemezsin.' },
              { q: 'Ödeme güvenli mi?', a: 'Tüm ödemeler Lemon Squeezy altyapısı üzerinden 256-bit SSL şifreleme ile güvenle işlenir. Kart bilgileriniz Seansify sunucularında saklanmaz.' },
              { q: 'WhatsApp numaramı kullanabilir miyim?', a: 'Evet, kendi kişisel veya iş WhatsApp numaranızı bağlayabilirsiniz. QR kod ile yapılan tek seferlik kurulum 2 dakikadan az sürer.' },
              { q: 'İstediğim zaman iptal edebilir miyim?', a: 'Evet. Herhangi bir taahhüt yoktur. Aboneliğinizi istediğiniz an iptal edebilirsiniz; mevcut dönem sonunda hizmet sona erer ve ücret alınmaz.' },
              { q: 'Verilerim güvende mi? KVKK uyumlu mu?', a: 'Seansify tamamen KVKK uyumludur. Tüm veriler Supabase altyapısında şifreli olarak saklanır. Hasta verileri üçüncü taraflarla asla paylaşılmaz.' },
              { q: 'Teknik destek nasıl çalışıyor?', a: 'Seansify One kullanıcıları e-posta desteğinden yararlanır. Pro kullanıcıları öncelikli destek alır ve genellikle 4 saat içinde yanıt verilir.' },
            ].map((item) => (
              <details key={item.q} className="rounded-2xl overflow-hidden group bg-white" style={{ border: '1px solid #c8e6dc' }}>
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-semibold text-sm select-none" style={{ color: '#0d1f18' }}>
                  <span>{item.q}</span>
                  <svg className="flex-shrink-0 ml-4 transition-transform group-open:rotate-180" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#5a7a72', borderTop: '1px solid #e8f5f1' }}>
                  <div className="pt-4">{item.a}</div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── İletişim ── */}
      <section id="iletisim" className="py-16 md:py-24" style={{ position: 'relative', backgroundColor: '#eaf3ef', backgroundImage: 'radial-gradient(circle, rgba(74,124,111,0.13) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
        <ShootingStars />
        <div className="max-w-3xl mx-auto px-6 text-center" style={{ position: 'relative', zIndex: 1 }}>
          <div className="mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: '#0d1f18' }}>Yardıma mı İhtiyacın Var?</h2>
            <p className="text-base max-w-md mx-auto" style={{ color: '#5a7a72' }}>Sorularında veya teknik konularda destek ekibimiz yardımcı olmaktan memnuniyet duyar.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 max-w-xl mx-auto">
            <a href="mailto:destek@seansify.com" className="flex flex-col items-center gap-3 rounded-2xl p-7 transition-all hover:shadow-md bg-white" style={{ border: '1px solid #c8e6dc' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#e8f5f1' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <div className="font-bold text-sm mb-1" style={{ color: '#0d1f18' }}>E-posta Desteği</div>
                <div className="text-sm font-medium" style={{ color: '#4a7c6f' }}>destek@seansify.com</div>
                <div className="text-xs mt-1" style={{ color: '#7a9e97' }}>Genellikle 4 saat içinde yanıt</div>
              </div>
            </a>
            <div className="flex flex-col items-center gap-3 rounded-2xl p-7 bg-white" style={{ border: '1px solid #c8e6dc' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#f3eeff' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div>
                <div className="font-bold text-sm mb-1" style={{ color: '#0d1f18' }}>Pro Öncelikli Destek</div>
                <div className="text-xs mt-1 leading-relaxed" style={{ color: '#5a7a72' }}>Pro paket kullanıcıları öncelikli<br />destek hattından yararlanır.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Son CTA ── */}
      <section className="py-16 md:py-24" style={{ background: 'linear-gradient(135deg, #1a3a2e 0%, #2d5a51 50%, #4a7c6f 100%)' }}>
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4 text-white">Kliniğini Bugün Dijitalleştir</h2>
          <p className="text-base mb-10" style={{ color: 'rgba(255,255,255,0.7)' }}>
            14 gün boyunca tüm özellikleri ücretsiz deneyin. Beğenmezseniz ödeme yapmayın.
          </p>
          <Link href="/register" className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm shadow-xl" style={{ background: 'white', color: '#2d5a51' }}>
            14 Gün Ücretsiz Dene
            <span className="btn-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#1a3a2e', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#4a7c6f' }}>
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none">
                    <rect x="6" y="11" width="28" height="24" rx="3" fill="white" />
                    <rect x="13" y="7" width="3" height="8" rx="1.5" fill="white" />
                    <rect x="24" y="7" width="3" height="8" rx="1.5" fill="white" />
                    <circle cx="20" cy="25" r="4" fill="#4a7c6f" />
                  </svg>
                </div>
                <span className="font-bold text-sm text-white">Seansify</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>Psikologlar için akıllı klinik yönetim ve WhatsApp otomasyon platformu.</p>
            </div>
            {[
              { title: 'Ürün', links: [{ label: 'Özellikler', href: '#ozellikler' }, { label: 'Fiyatlandırma', href: '#fiyatlandirma' }, { label: 'SSS', href: '#sss' }] },
              { title: 'Hesap', links: [{ label: 'Giriş Yap', href: '/login' }, { label: 'Kayıt Ol', href: '/register' }] },
              { title: 'İletişim', links: [{ label: 'destek@seansify.com', href: 'mailto:destek@seansify.com' }, { label: 'Destek Merkezi', href: '#iletisim' }] },
              { title: 'Yasal', links: [{ label: 'Gizlilik Politikası', href: '/gizlilik' }, { label: 'Kullanım Koşulları', href: '/kullanim-kosullari' }, { label: 'İptal ve İade', href: '/iptal-iade' }] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-xs transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.5)' }}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>© 2026 Seansify. Tüm hakları saklıdır.</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>KVKK kapsamında kişisel verileriniz korunmaktadır.</p>
          </div>
        </div>
      </footer>

      <ScrollRevealInit />
      <div className="hidden md:block">
        <SectionDots
          sections={[
            { id: 'hero', label: 'Başlık' },
            { id: 'nasil-calisir', label: 'Nasıl Çalışır' },
            { id: 'ozellikler', label: 'Özellikler' },
            { id: 'fiyatlandirma', label: 'Fiyatlandırma' },
            { id: 'sss', label: 'SSS' },
            { id: 'iletisim', label: 'İletişim' },
          ]}
          accentColor="#4a7c6f"
        />
      </div>
    </div>
  )
}

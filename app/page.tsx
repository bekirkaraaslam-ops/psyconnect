import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Seansify — Psikologlar için Klinik Yönetim Platformu',
  description: 'Randevularınızı yönetin, WhatsApp ile otomatik hatırlatıcı gönderin. KVKK uyumlu, güvenli klinik yönetim sistemi.',
}

async function getPsychologistCount(): Promise<number> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/stats`, {
      next: { revalidate: 300 },
    })
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
    <div className="min-h-screen" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 transition-all" style={{ background: 'rgba(13,31,24,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: '#4a7c6f' }}>
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="11" width="28" height="24" rx="3" fill="white" />
                <rect x="6" y="11" width="28" height="10" rx="3" fill="white" fillOpacity="0.25" />
                <rect x="6" y="18" width="28" height="3" fill="white" fillOpacity="0.15" />
                <rect x="13" y="7" width="3" height="8" rx="1.5" fill="white" />
                <rect x="24" y="7" width="3" height="8" rx="1.5" fill="white" />
                <circle cx="20" cy="25" r="4" fill="#4a7c6f" />
                <path d="M13 35C13 31 16 28 20 28C24 28 27 31 27 35" fill="#4a7c6f" />
              </svg>
            </div>
            <span className="font-bold text-base text-white tracking-tight">Seansify</span>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#ozellikler" className="text-sm font-medium transition-colors" style={{ color: '#94a3b8' }}>Özellikler</a>
            <a href="#fiyatlandirma" className="text-sm font-medium transition-colors" style={{ color: '#94a3b8' }}>Fiyatlandırma</a>
            <a href="#sss" className="text-sm font-medium transition-colors" style={{ color: '#94a3b8' }}>SSS</a>
            <a href="#iletisim" className="text-sm font-medium transition-colors" style={{ color: '#94a3b8' }}>İletişim</a>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium rounded-lg transition-colors" style={{ color: '#94a3b8' }}>
              Giriş Yap
            </Link>
            <Link href="/register" className="btn-primary px-4 py-2 text-sm font-semibold rounded-lg" style={{ background: '#4a7c6f', color: '#ffffff' }}>
              Kliniğini Dijitalleştir
            </Link>
          </div>

          {/* Mobile menu — CSS only with details/summary */}
          <details className="md:hidden group relative">
            <summary className="list-none cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg" style={{ color: '#94a3b8' }}>
              {/* Hamburger icon */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </summary>
            <div className="absolute right-0 top-12 w-56 rounded-xl shadow-2xl p-4 flex flex-col gap-2" style={{ background: '#0f2620', border: '1px solid rgba(255,255,255,0.1)' }}>
              <a href="#ozellikler" className="px-3 py-2 text-sm rounded-lg" style={{ color: '#cbd5e1' }}>Özellikler</a>
              <a href="#fiyatlandirma" className="px-3 py-2 text-sm rounded-lg" style={{ color: '#cbd5e1' }}>Fiyatlandırma</a>
              <a href="#sss" className="px-3 py-2 text-sm rounded-lg" style={{ color: '#cbd5e1' }}>SSS</a>
              <a href="#iletisim" className="px-3 py-2 text-sm rounded-lg" style={{ color: '#cbd5e1' }}>İletişim</a>
              <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
              <Link href="/login" className="px-3 py-2 text-sm rounded-lg" style={{ color: '#94a3b8' }}>Giriş Yap</Link>
              <Link href="/register" className="px-3 py-2 text-sm font-semibold rounded-lg text-center" style={{ background: '#4a7c6f', color: 'white' }}>Kliniğini Dijitalleştir</Link>
            </div>
          </details>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(160deg, #0d1f18 0%, #1a3a2e 60%, #0f2620 100%)', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-10 text-center">

          {/* Badge */}
          <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 tracking-wide" style={{ background: 'rgba(74,124,111,0.18)', color: '#6ee7b7', border: '1px solid rgba(74,124,111,0.35)' }}>
            <span>✦</span>
            <span>Türkiye'nin Psikolog Platformu</span>
          </div>

          {/* H1 */}
          <h1 className="animate-fade-up delay-100 text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight" style={{ color: '#f8fafc' }}>
            Klinik Yönetimini<br />
            Otomatikleştir
          </h1>
          <p className="animate-fade-up delay-200 text-3xl md:text-5xl font-extrabold mb-8 tracking-tight" style={{ background: 'linear-gradient(90deg, #4a7c6f, #6ee7b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Hastalara Odaklan
          </p>

          <p className="animate-fade-up delay-300 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: '#94a3b8' }}>
            Randevularınızı yönetin, WhatsApp hatırlatıcıları otomatik gönderin ve yapay zeka asistanıyla 7/24 randevu alın. Tüm bunları tek platformdan.
          </p>

          {/* CTA Buttons */}
          <div className="animate-fade-up delay-400 flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link href="/register" className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-bold shadow-lg" style={{ background: '#4a7c6f', color: '#ffffff' }}>
              Kliniğini Dijitalleştir
              <span className="btn-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>
            <a href="#nasil-calisir" className="btn-ghost inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.07)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.12)' }}>
              Nasıl Çalışır?
            </a>
          </div>

          {/* Trust bar */}
          <div className="animate-fade-in delay-500 flex flex-wrap items-center justify-center gap-6 text-xs" style={{ color: '#64748b' }}>
            <span className="flex items-center gap-1.5">
              <span>🔒</span> 256-bit SSL
            </span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
            <span className="flex items-center gap-1.5">
              <span>🇹🇷</span> KVKK Uyumlu
            </span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>·</span>
            <span className="flex items-center gap-1.5">
              <span>⚡</span> 5 dakikada kurulum
            </span>
          </div>
        </div>

        {/* Dashboard Mock-up */}
        <div className="max-w-3xl mx-auto px-6 animate-float" style={{ animationDelay: '0.5s' }}>
          <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.09)', background: '#0f1f19' }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#0a1812', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }}></span>
              <span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }}></span>
              <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }}></span>
              <span className="ml-3 text-xs px-3 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#475569' }}>seansify.app/dashboard</span>
            </div>

            {/* Stats row */}
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl p-4" style={{ background: 'rgba(74,124,111,0.12)', border: '1px solid rgba(74,124,111,0.25)' }}>
                <div className="text-2xl font-extrabold mb-1" style={{ color: '#4a7c6f' }}>24</div>
                <div className="text-xs font-medium" style={{ color: '#64748b' }}>Bu Hafta</div>
                <div className="text-xs mt-1" style={{ color: '#4a7c6f' }}>Randevu</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-extrabold" style={{ color: '#f59e0b' }}>3</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>Bekleyen</span>
                </div>
                <div className="text-xs" style={{ color: '#64748b' }}>Onay Bekliyor</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="text-2xl font-extrabold mb-1" style={{ color: '#3b82f6' }}>47</div>
                <div className="text-xs" style={{ color: '#64748b' }}>Toplam Hasta</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.2)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full inline-block animate-pulse" style={{ background: '#22c55e' }}></span>
                  <span className="text-xs font-bold" style={{ color: '#22c55e' }}>Aktif</span>
                </div>
                <div className="text-xs" style={{ color: '#64748b' }}>WhatsApp</div>
                <div className="text-xs mt-1" style={{ color: '#22c55e' }}>Bağlı</div>
              </div>
            </div>

            {/* Appointment list */}
            <div className="mx-5 mb-5 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs font-semibold" style={{ color: '#64748b' }}>Yaklaşan Randevular</span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,124,111,0.2)', color: '#4a7c6f' }}>Bugün 3</span>
              </div>
              {[
                { name: 'Ayşe K.', time: 'Bugün 14:00', status: 'Onaylandı', statusColor: '#4a7c6f' },
                { name: 'Mehmet D.', time: 'Bugün 16:30', status: 'Onaylandı', statusColor: '#4a7c6f' },
                { name: 'Fatma Y.', time: 'Yarın 10:00', status: 'Bekliyor', statusColor: '#f59e0b' },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(74,124,111,0.25)', color: '#4a7c6f' }}>
                    {item.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium" style={{ color: '#cbd5e1' }}>{item.name}</div>
                    <div className="text-xs" style={{ color: '#475569' }}>{item.time}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `rgba(${item.statusColor === '#4a7c6f' ? '74,124,111' : '245,158,11'},0.2)`, color: item.statusColor }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Canlı Stats Bar ── */}
      <section style={{ background: '#f0f9f6', borderTop: '1px solid #d1e9e2', borderBottom: '1px solid #d1e9e2' }}>
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1" style={{ background: 'rgba(74,124,111,0.12)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div className="text-3xl font-extrabold" style={{ color: '#4a7c6f' }}>
              {psychologistCount > 0 ? `${psychologistCount}+` : '100+'}
            </div>
            <div className="text-sm font-medium" style={{ color: '#334155' }}>Kayıtlı Psikolog</div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1" style={{ background: 'rgba(74,124,111,0.12)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </div>
            <div className="text-3xl font-extrabold" style={{ color: '#4a7c6f' }}>%98</div>
            <div className="text-sm font-medium" style={{ color: '#334155' }}>Hatırlatıcı Başarı Oranı</div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1" style={{ background: 'rgba(74,124,111,0.12)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="text-3xl font-extrabold" style={{ color: '#4a7c6f' }}>10.000+</div>
            <div className="text-sm font-medium" style={{ color: '#334155' }}>İletilen Mesaj</div>
          </div>
        </div>
      </section>

      {/* ── Özellikler ── */}
      <section id="ozellikler" style={{ background: '#F0F4F2' }} className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: '#0d1f18' }}>
              Her Şey Tek Platformda
            </h2>
            <p className="text-base max-w-md mx-auto" style={{ color: '#64748b' }}>
              Klinik yönetiminiz için ihtiyacınız olan tüm araçlar, tek çatı altında.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                emoji: '📅',
                title: 'Akıllı Randevu Yönetimi',
                desc: 'Takvim entegrasyonu, çakışma önleme ve tek tıkla randevu oluşturma. Haftalık görünümde tüm planınızı yönetin.',
                bg: '#e8f5f1',
                iconColor: '#4a7c6f',
              },
              {
                emoji: '💬',
                title: 'WhatsApp Otomasyonu',
                desc: 'Randevu hatırlatıcıları ve onay mesajları otomatik gönderilir. Hasta gelme oranını artırın, iptal oranını düşürün.',
                bg: '#e8f8ee',
                iconColor: '#25D366',
              },
              {
                emoji: '👥',
                title: 'Hasta Takibi',
                desc: 'Detaylı hasta profili, seans notları, ödev takibi ve iletişim geçmişi. Tüm bilgiler tek yerde, güvenle saklanır.',
                bg: '#f3eeff',
                iconColor: '#8b5cf6',
              },
              {
                emoji: '📊',
                title: 'Klinik Dashboard',
                desc: 'Gerçek zamanlı istatistikler, haftalık randevu sayıları ve hasta metrikleri. Kliniğinizin nabzını anlık takip edin.',
                bg: '#eff6ff',
                iconColor: '#3b82f6',
              },
              {
                emoji: '🤖',
                title: 'Yapay Zeka Asistan',
                desc: 'WhatsApp üzerinden 7/24 otomatik randevu alma. Hasta mesaj gönderir, sistem randevuyu oluşturur.',
                bg: '#fff7ed',
                iconColor: '#f59e0b',
              },
              {
                emoji: '🔒',
                title: 'Güvenli Altyapı',
                desc: 'KVKK uyumlu, 256-bit SSL şifreli veri depolama. Hasta verileriniz yasal güvence altında, erişim yalnızca size ait.',
                bg: '#fff0f6',
                iconColor: '#ec4899',
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="animate-fade-up bg-white rounded-2xl p-6 transition-all hover:shadow-md"
                style={{
                  border: '1px solid #dde5e2',
                  cursor: 'default',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-2xl" style={{ background: feature.bg }}>
                  {feature.emoji}
                </div>
                <h3 className="font-bold text-sm mb-2" style={{ color: '#0d1f18' }}>{feature.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nasıl Çalışır ── */}
      <section id="nasil-calisir" className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: '#0d1f18' }}>
              Nasıl Çalışır?
            </h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: '#64748b' }}>
              Seansify, psikologların klinik yönetimini uçtan uca otomatikleştiren bulut tabanlı bir platformdur. İşte adım adım nasıl çalıştığı:
            </p>
          </div>

          {/* Steps with detail cards */}
          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'Hesabını Oluştur, Paketini Seç',
                desc: 'Sadece adın, e-posta adresin ve şifrenle 2 dakikada kayıt ol. Ardından ihtiyacına göre Başlangıç veya Pro paketini seç. Ödeme Lemon Squeezy altyapısıyla güvenle yapılır.',
                details: ['Ad Soyad + E-posta + Şifre ile kayıt', 'Paket seçimi (Başlangıç veya Pro)', 'Güvenli ödeme → Anında aktifleşme'],
                icon: '👤',
                color: '#4a7c6f',
                bg: '#e8f5f1',
              },
              {
                step: '02',
                title: "Hastalarını Ekle, WhatsApp'ı Bağla",
                desc: "Dashboard'a giriş yaptıktan sonra hasta profillerini oluştur. Pro kullanıcılar kendi WhatsApp numaralarını QR kod ile sisteme bağlar — tek seferlik 2 dakikalık kurulum.",
                details: ['Hasta adı, iletişim bilgisi, seans geçmişi kaydet', 'WhatsApp QR kod ile bağlantı (Pro)', 'Randevu takvimini özelleştir'],
                icon: '⚙️',
                color: '#3b82f6',
                bg: '#eff6ff',
              },
              {
                step: '03',
                title: 'Randevular Oluştu — Sistem Devreye Giriyor',
                desc: "Randevu eklediğinde sistem otomatik olarak harekete geçer: hasta WhatsApp'tan hatırlatıcı mesaj alır, onay butonuna basar, sen randevu durumunu dashboard'dan takip edersin.",
                details: ['Randevu öncesi otomatik WhatsApp hatırlatıcısı', 'Hasta tek tıkla onar veya iptal eder', "Sen dashboard'dan her şeyi anlık görürsün"],
                icon: '🤖',
                color: '#25D366',
                bg: '#e8f8ee',
              },
              {
                step: '04',
                title: 'Yapay Zeka Asistanı 7/24 Çalışır',
                desc: 'Pro paketle WhatsApp üzerinden gelen hasta mesajlarını yapay zeka asistanımız yanıtlar, uygun saati bulur ve randevuyu otomatik oluşturur. Sen uyurken bile sisteme yeni randevular girer.',
                details: ['Hasta "randevu almak istiyorum" yazar', 'Asistan uygun saatleri önerir', 'Onaylanınca takvime otomatik işlenir'],
                icon: '✨',
                color: '#8b5cf6',
                bg: '#f3eeff',
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="animate-slide-right flex flex-col md:flex-row gap-6 rounded-2xl p-6"
                style={{ background: '#f8fafb', border: '1px solid #e2eae7', animationDelay: `${i * 0.12}s` }}
              >
                {/* Step number + icon */}
                <div className="flex items-start gap-4 md:w-48 flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: item.bg }}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-widest mb-1" style={{ color: item.color }}>ADIM {item.step}</div>
                    <h3 className="font-bold text-sm leading-snug" style={{ color: '#0d1f18' }}>{item.title}</h3>
                  </div>
                </div>

                {/* Description + bullets */}
                <div className="flex-1">
                  <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748b' }}>{item.desc}</p>
                  <ul className="flex flex-col gap-2">
                    {item.details.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-xs" style={{ color: '#334155' }}>
                        <span className="flex-shrink-0 mt-0.5" style={{ color: item.color }}>→</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fiyatlandırma ── */}
      <section id="fiyatlandirma" className="py-24" style={{ background: '#f0f9f6' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-5">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: '#0d1f18' }}>
              Şeffaf Fiyatlandırma
            </h2>
            <p className="text-base" style={{ color: '#64748b' }}>İstediğin zaman iptal et, taahhüt yok.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12">

            {/* Başlangıç Paketi */}
            <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #dde5e2' }}>
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1" style={{ color: '#0d1f18' }}>Başlangıç Paketi</h3>
                <p className="text-xs mb-4" style={{ color: '#64748b' }}>Klinik yönetiminin temelleri</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold" style={{ color: '#0d1f18' }}>950</span>
                  <span className="text-lg font-semibold mb-1" style={{ color: '#64748b' }}>₺/ay</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  { text: 'Sınırsız hasta kaydı', included: true },
                  { text: 'Randevu takvimi', included: true },
                  { text: 'Seans notları ve ödev takibi', included: true },
                  { text: 'Klinik dashboard', included: true },
                  { text: 'WhatsApp özellikleri', included: false, note: 'Pro gerektirir' },
                  { text: 'Otomatik randevu asistanı', included: false, note: 'Pro gerektirir' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3 text-sm">
                    {item.included ? (
                      <span className="mt-0.5 flex-shrink-0" style={{ color: '#4a7c6f' }}>✓</span>
                    ) : (
                      <span className="mt-0.5 flex-shrink-0" style={{ color: '#cbd5e1' }}>🔒</span>
                    )}
                    <span style={{ color: item.included ? '#334155' : '#94a3b8' }}>
                      {item.text}
                      {item.note && <span className="text-xs ml-1">({item.note})</span>}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/upgrade?plan=baslangic" className="block w-full text-center py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90" style={{ border: '2px solid #4a7c6f', color: '#4a7c6f' }}>
                Başlangıç Seç
              </Link>
            </div>

            {/* Seansify Pro */}
            <div className="rounded-2xl p-8 relative" style={{ background: '#0d1f18', border: '2px solid #4a7c6f' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full text-xs font-bold" style={{ background: '#4a7c6f', color: 'white' }}>
                  EN POPÜLER
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1 text-white">Seansify Pro</h3>
                <p className="text-xs mb-4" style={{ color: '#6ee7b7' }}>WhatsApp otomasyonu dahil</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">1.850</span>
                  <span className="text-lg font-semibold mb-1" style={{ color: '#64748b' }}>₺/ay</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  "Başlangıç'taki her şey",
                  'WhatsApp hatırlatıcı sistemi',
                  'Otomatik randevu asistanı',
                  'Öncelikli destek',
                  'Gelecek tüm özellikler',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex-shrink-0" style={{ color: '#6ee7b7' }}>✓</span>
                    <span style={{ color: '#cbd5e1' }}>{item}</span>
                  </li>
                ))}
              </ul>

              <Link href="/upgrade?plan=pro" className="block w-full text-center py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 shadow-lg" style={{ background: '#4a7c6f', color: 'white' }}>
                Pro'ya Geç
              </Link>
            </div>
          </div>

          {/* Referral ve güvenceler */}
          <div className="mt-8 text-center">
            <p className="text-sm mb-6" style={{ color: '#4a7c6f' }}>
              🎁 <strong>Referral programı:</strong> Her aktif referans için indirim kazan
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {[
                { icon: '🔒', text: 'SSL Güvenli Ödeme' },
                { icon: '💳', text: 'Lemon Squeezy ile Güvenli' },
                { icon: '↩️', text: 'İstediğin Zaman İptal' },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2 text-xs" style={{ color: '#64748b' }}>
                  <span>{badge.icon}</span>
                  <span>{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sosyal Kanıt ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: '#0d1f18' }}>
              Psikologlar Ne Diyor?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Dr. Ayşe K.',
                title: 'Klinik Psikolog',
                initials: 'AK',
                comment: 'Randevularımı artık manuel takip etmiyorum. Sistem her şeyi otomatik hallediyor, ben sadece seanslarıma odaklanıyorum. Fark inanılmaz.',
              },
              {
                name: 'Uzm. Psk. Mehmet T.',
                title: 'Uzman Psikolog',
                initials: 'MT',
                comment: 'WhatsApp entegrasyonu hasta gelme oranımı ciddi ölçüde artırdı. Artık "randevumu unutmuştum" bahanesini çok daha az duyuyorum.',
              },
              {
                name: 'Psk. Selin A.',
                title: 'Psikolog',
                initials: 'SA',
                comment: 'Kurulumu gerçekten 5 dakika sürdü. Çok sezgisel, hiç teknik bilgi gerektirmedi. Tüm meslektaşlarıma tavsiye ediyorum.',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="rounded-2xl p-6 flex flex-col gap-4" style={{ background: '#f8fafb', border: '1px solid #e2eae7' }}>
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm leading-relaxed flex-1" style={{ color: '#334155' }}>
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: '#4a7c6f', color: 'white' }}>
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="text-sm font-bold" style={{ color: '#0d1f18' }}>{testimonial.name}</div>
                    <div className="text-xs" style={{ color: '#64748b' }}>{testimonial.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SSS ── */}
      <section id="sss" className="py-24" style={{ background: '#f0f9f6' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: '#0d1f18' }}>
              Sık Sorulan Sorular
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Deneme süresi var mı?',
                a: 'Evet, 14 günlük deneme sunuyoruz. Bu süre zarfında tüm özelliklere tam erişimle randevu otomasyonunu, WhatsApp entegrasyonunu ve yapay zeka asistanını bizzat deneyimleyebilirsiniz. Beğenirsen devam et, beğenmezsen hiçbir şey ödemezsin.',
              },
              {
                q: 'Ödeme güvenli mi?',
                a: 'Tüm ödemeler Lemon Squeezy altyapısı üzerinden 256-bit SSL şifreleme ile güvenle işlenir. Kart bilgileriniz Seansify sunucularında saklanmaz.',
              },
              {
                q: 'WhatsApp numaramı kullanabilir miyim?',
                a: 'Evet, kendi kişisel veya iş WhatsApp numaranızı bağlayabilirsiniz. QR kod ile yapılan tek seferlik kurulum 2 dakikadan az sürer.',
              },
              {
                q: 'İstediğim zaman iptal edebilir miyim?',
                a: 'Evet. Herhangi bir taahhüt yoktur. Aboneliğinizi istediğiniz an iptal edebilirsiniz; mevcut dönem sonunda hizmet sona erer ve ücret alınmaz.',
              },
              {
                q: 'Verilerim güvende mi? KVKK uyumlu mu?',
                a: 'Seansify tamamen KVKK uyumludur. Tüm veriler Supabase altyapısında şifreli olarak saklanır. Hasta verileri üçüncü taraflarla asla paylaşılmaz. Gizlilik politikamızı inceleyebilirsiniz.',
              },
              {
                q: 'Teknik destek nasıl çalışıyor?',
                a: 'Başlangıç paketi kullanıcıları e-posta desteğinden yararlanır. Pro kullanıcıları öncelikli destek alır ve genellikle 4 saat içinde yanıt verilir. WhatsApp destek kanalı da planlanmaktadır.',
              },
            ].map((item) => (
              <details key={item.q} className="rounded-2xl overflow-hidden group" style={{ border: '1px solid #d1e9e2', background: 'white' }}>
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer font-semibold text-sm select-none" style={{ color: '#0d1f18' }}>
                  <span>{item.q}</span>
                  <svg className="flex-shrink-0 ml-4 transition-transform group-open:rotate-180" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#64748b', borderTop: '1px solid #e8f5f1' }}>
                  <div className="pt-4">{item.a}</div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── İletişim ── */}
      <section id="iletisim" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="mb-10">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: '#0d1f18' }}>
              Yardıma mı İhtiyacın Var?
            </h2>
            <p className="text-base max-w-md mx-auto" style={{ color: '#64748b' }}>
              Sorularında veya teknik konularda destek ekibimiz sana yardımcı olmaktan memnuniyet duyar.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 max-w-xl mx-auto">
            {/* E-posta desteği */}
            <a
              href="mailto:destek@seansify.com"
              className="flex flex-col items-center gap-3 rounded-2xl p-7 transition-all hover:shadow-md"
              style={{ background: '#f0f9f6', border: '1px solid #d1e9e2' }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#e8f5f1' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-sm mb-1" style={{ color: '#0d1f18' }}>E-posta Desteği</div>
                <div className="text-sm font-medium" style={{ color: '#4a7c6f' }}>destek@seansify.com</div>
                <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>Genellikle 4 saat içinde yanıt</div>
              </div>
            </a>

            {/* Öncelikli destek */}
            <div
              className="flex flex-col items-center gap-3 rounded-2xl p-7"
              style={{ background: '#f8fafb', border: '1px solid #e2eae7' }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: '#f3eeff' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-sm mb-1" style={{ color: '#0d1f18' }}>Pro Öncelikli Destek</div>
                <div className="text-xs mt-1 leading-relaxed" style={{ color: '#64748b' }}>Pro paket kullanıcıları öncelikli<br />destek hattından yararlanır.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Son CTA ── */}
      <section className="py-24" style={{ background: '#0d1f18' }}>
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4 text-white">
            Kliniğini Bugün Dijitalleştir
          </h2>
          <p className="text-base mb-10" style={{ color: '#94a3b8' }}>
            Seansify Pro ile randevularını otomatikleştir, hastalara daha fazla zaman ayır.
          </p>
          <Link
            href="/register"
            className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-sm shadow-xl"
            style={{ background: '#4a7c6f', color: '#ffffff' }}
          >
            Kliniğini Dijitalleştir
            <span className="btn-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0a1812', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">

            {/* Seansify */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#4a7c6f' }}>
                  <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="11" width="28" height="24" rx="3" fill="white" />
                    <rect x="13" y="7" width="3" height="8" rx="1.5" fill="white" />
                    <rect x="24" y="7" width="3" height="8" rx="1.5" fill="white" />
                    <circle cx="20" cy="25" r="4" fill="#4a7c6f" />
                  </svg>
                </div>
                <span className="font-bold text-sm text-white">Seansify</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
                Psikologlar için akıllı klinik yönetim ve WhatsApp otomasyon platformu.
              </p>
            </div>

            {/* Ürün */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>Ürün</h4>
              <ul className="space-y-3">
                <li><a href="#ozellikler" className="text-xs transition-colors" style={{ color: '#475569' }}>Özellikler</a></li>
                <li><a href="#fiyatlandirma" className="text-xs transition-colors" style={{ color: '#475569' }}>Fiyatlandırma</a></li>
                <li><a href="#sss" className="text-xs transition-colors" style={{ color: '#475569' }}>SSS</a></li>
              </ul>
            </div>

            {/* Hesap */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>Hesap</h4>
              <ul className="space-y-3">
                <li><Link href="/login" className="text-xs transition-colors" style={{ color: '#475569' }}>Giriş Yap</Link></li>
                <li><Link href="/register" className="text-xs transition-colors" style={{ color: '#475569' }}>Kayıt Ol</Link></li>
              </ul>
            </div>

            {/* İletişim */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>İletişim</h4>
              <ul className="space-y-3">
                <li><a href="mailto:destek@seansify.com" className="text-xs transition-colors" style={{ color: '#475569' }}>destek@seansify.com</a></li>
                <li><a href="#iletisim" className="text-xs transition-colors" style={{ color: '#475569' }}>Destek Merkezi</a></li>
              </ul>
            </div>

            {/* Yasal */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#64748b' }}>Yasal</h4>
              <ul className="space-y-3">
                <li><Link href="/gizlilik" className="text-xs transition-colors" style={{ color: '#475569' }}>Gizlilik Politikası</Link></li>
                <li><Link href="/kullanim-kosullari" className="text-xs transition-colors" style={{ color: '#475569' }}>Kullanım Koşulları</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: '#334155' }}>
              © 2026 Seansify. Tüm hakları saklıdır.
            </p>
            <p className="text-xs" style={{ color: '#334155' }}>
              KVKK kapsamında kişisel verileriniz korunmaktadır.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}

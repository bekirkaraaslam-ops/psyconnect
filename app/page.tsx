import Link from 'next/link'
import type { Metadata } from 'next'

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
    <div data-page="landing" className="min-h-screen" style={{ fontFamily: 'Inter, -apple-system, sans-serif', background: '#f4faf7' }}>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50" style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #c8e6dc' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
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
      <section style={{ background: 'linear-gradient(135deg, #1a3a2e 0%, #2d5a51 40%, #4a7c6f 100%)', paddingBottom: '80px' }}>
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-10 text-center">
          <div className="animate-fade-in inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-8 tracking-wide" style={{ background: 'rgba(255,255,255,0.12)', color: '#d4f0e8', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span>✦</span>
            <span>Türkiye'nin Psikolog Platformu</span>
          </div>

          <h1 className="animate-fade-up delay-100 text-4xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-white">
            Klinik Yönetimini<br />Otomatikleştir
          </h1>
          <p className="animate-fade-up delay-200 text-3xl md:text-5xl font-extrabold mb-8 tracking-tight" style={{ color: '#a8e6d4' }}>
            Hastalara Odaklan
          </p>
          <p className="animate-fade-up delay-300 text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Randevularınızı yönetin, WhatsApp hatırlatıcıları otomatik gönderin ve yapay zeka asistanıyla 7/24 randevu alın.
          </p>

          <div className="animate-fade-up delay-400 flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link href="/register" className="btn-primary inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-bold shadow-lg" style={{ background: 'white', color: '#2d5a51' }}>
              Kliniğini Dijitalleştir
              <span className="btn-arrow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>
            <a href="#nasil-calisir" className="btn-ghost inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)' }}>
              Nasıl Çalışır?
            </a>
          </div>

          <div className="animate-fade-in delay-500 flex flex-wrap items-center justify-center gap-6 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span className="flex items-center gap-1.5"><span>🔒</span> 256-bit SSL</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <span className="flex items-center gap-1.5"><span>🇹🇷</span> KVKK Uyumlu</span>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
            <span className="flex items-center gap-1.5"><span>⚡</span> 5 dakikada kurulum</span>
          </div>
        </div>

        {/* ── Dashboard Mockup ── */}
        <div className="max-w-4xl mx-auto px-6 animate-float" style={{ animationDelay: '0.5s' }}>
          <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.15)' }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#0a1812', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }} />
              <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }} />
              <span className="ml-3 text-xs px-3 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#6b8c84' }}>seansify.app/dashboard</span>
            </div>

            {/* App layout */}
            <div className="flex" style={{ background: '#0f1f19', minHeight: '320px' }}>
              {/* Sidebar */}
              <div className="w-14 flex flex-col items-center py-4 gap-3 flex-shrink-0" style={{ background: '#0a1812', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: '#4a7c6f' }}>
                  <svg width="14" height="14" viewBox="0 0 40 40" fill="none"><rect x="6" y="11" width="28" height="24" rx="3" fill="white" /><rect x="13" y="7" width="3" height="8" rx="1.5" fill="white" /><rect x="24" y="7" width="3" height="8" rx="1.5" fill="white" /></svg>
                </div>
                {[
                  <path key="home" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
                  <><rect key="cal-r" x="3" y="4" width="18" height="18" rx="2" /><line key="cal-l1" x1="16" y1="2" x2="16" y2="6" /><line key="cal-l2" x1="8" y1="2" x2="8" y2="6" /><line key="cal-l3" x1="3" y1="10" x2="21" y2="10" /></>,
                  <><path key="pat" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle key="pat-c" cx="9" cy="7" r="4" /></>,
                ].map((icon, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: i === 0 ? 'rgba(74,124,111,0.25)' : 'transparent' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={i === 0 ? '#4a7c6f' : '#2d4a43'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold" style={{ color: '#d4f0e8' }}>Genel Bakış</span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ background: '#22c55e' }} />
                      WA Bağlı
                    </div>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: '#4a7c6f', color: 'white' }}>AK</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { val: '24', label: 'Bu Hafta', color: '#4a7c6f', bg: 'rgba(74,124,111,0.12)' },
                    { val: '3', label: 'Onay Bekliyor', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
                    { val: '47', label: 'Toplam Hasta', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
                    { val: '2', label: 'Bekleme Listesi', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl p-2.5" style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
                      <div className="text-lg font-extrabold mb-0.5" style={{ color: s.color }}>{s.val}</div>
                      <div className="text-xs leading-tight" style={{ color: '#6b8c84' }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(74,124,111,0.2)' }}>
                    <div className="px-3 py-2 flex items-center justify-between" style={{ background: 'rgba(74,124,111,0.08)', borderBottom: '1px solid rgba(74,124,111,0.15)' }}>
                      <span className="text-xs font-semibold" style={{ color: '#6b8c84' }}>Bugün</span>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,124,111,0.2)', color: '#4a7c6f' }}>3 seans</span>
                    </div>
                    {[
                      { name: 'Ayşe K.', time: '10:00', status: 'Onaylı', ok: true },
                      { name: 'Mehmet D.', time: '13:30', status: 'Onaylı', ok: true },
                      { name: 'Fatma Y.', time: '16:00', status: 'Bekliyor', ok: false },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(74,124,111,0.2)', color: '#4a7c6f' }}>{item.name[0]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate" style={{ color: '#d4f0e8' }}>{item.name}</div>
                          <div className="text-xs font-mono" style={{ color: '#6b8c84' }}>{item.time}</div>
                        </div>
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: item.ok ? 'rgba(74,124,111,0.2)' : 'rgba(245,158,11,0.2)', color: item.ok ? '#4a7c6f' : '#f59e0b' }}>{item.status}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(245,158,11,0.3)' }}>
                    <div className="px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(245,158,11,0.08)', borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
                      <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>⏳ Onay Bekliyor</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold ml-auto" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>3</span>
                    </div>
                    {[
                      { name: 'Zeynep A.', time: 'Yarın 11:00' },
                      { name: 'Can B.', time: 'Cuma 14:30' },
                      { name: 'Elif S.', time: 'Cuma 17:00' },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }}>{item.name[0]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium truncate" style={{ color: '#d4f0e8' }}>{item.name}</div>
                          <div className="text-xs" style={{ color: '#6b8c84' }}>{item.time}</div>
                        </div>
                        <div className="flex gap-1">
                          <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: 'rgba(74,124,111,0.25)', color: '#4a7c6f' }}>✓</span>
                          <span className="text-xs px-1.5 py-0.5 rounded font-semibold" style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>✕</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: '#e8f5f1', borderTop: '1px solid #c8e6dc', borderBottom: '1px solid #c8e6dc' }}>
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
              value: psychologistCount > 0 ? `${psychologistCount}+` : '100+',
              label: 'Kayıtlı Psikolog',
            },
            {
              icon: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
              value: '%98',
              label: 'Hatırlatıcı Başarı Oranı',
            },
            {
              icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
              value: '4+ Saat',
              label: 'Haftalık Kazanılan Zaman',
            },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1" style={{ background: 'rgba(74,124,111,0.15)' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
              </div>
              <div className="text-3xl font-extrabold" style={{ color: '#2d5a51' }}>{s.value}</div>
              <div className="text-sm font-medium" style={{ color: '#3d5952' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Özellikler ── */}
      <section id="ozellikler" className="py-24" style={{ background: 'linear-gradient(180deg, #2d5a51 0%, #4a7c6f 100%)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4 text-white">Her Şey Tek Platformda</h2>
            <p className="text-base max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.7)' }}>Klinik yönetiminiz için ihtiyacınız olan tüm araçlar, tek çatı altında.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: 'Akıllı Randevu Yönetimi',
                desc: 'Takvim entegrasyonu, çakışma önleme ve tek tıkla randevu oluşturma. Haftalık görünümde tüm planınızı yönetin.',
                bg: '#e8f5f1', iconColor: '#4a7c6f',
                icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
              },
              {
                title: 'WhatsApp Otomasyonu',
                desc: 'Randevu hatırlatıcıları ve onay mesajları otomatik gönderilir. Hasta gelme oranını artırın, iptal oranını düşürün.',
                bg: '#e8f8ee', iconColor: '#25D366',
                icon: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,
              },
              {
                title: 'Hasta Takibi',
                desc: 'Detaylı hasta profili, seans notları, ödev takibi ve iletişim geçmişi. Tüm bilgiler tek yerde, güvenle saklanır.',
                bg: '#f3eeff', iconColor: '#8b5cf6',
                icon: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
              },
              {
                title: 'Klinik Dashboard',
                desc: 'Gerçek zamanlı istatistikler, bugün/yarın timeline ve haftalık randevu sayıları. Kliniğinizin nabzını anlık takip edin.',
                bg: '#eff6ff', iconColor: '#3b82f6',
                icon: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
              },
              {
                title: 'Yapay Zeka Asistan',
                desc: 'WhatsApp üzerinden 7/24 otomatik randevu alma. Hasta mesaj gönderir, sistem randevuyu oluşturur, siz onaylarsınız.',
                bg: '#fff7ed', iconColor: '#f59e0b',
                icon: <><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></>,
              },
              {
                title: 'Bekleme Listesi',
                desc: 'İptal olan randevularda bekleme listesindeki hastaya otomatik teklif gönderilir. Boş kalan saatler otomatik dolur.',
                bg: '#fff0f6', iconColor: '#ec4899',
                icon: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="animate-fade-up bg-white rounded-2xl p-6 transition-all hover:shadow-lg"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)', animationDelay: `${i * 0.08}s` }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: feature.bg }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={feature.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {feature.icon}
                  </svg>
                </div>
                <h3 className="font-bold text-sm mb-2" style={{ color: '#0d1f18' }}>{feature.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#5a7a72' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nasıl Çalışır ── */}
      <section id="nasil-calisir" className="py-24" style={{ background: '#f0f9f6' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: '#0d1f18' }}>Nasıl Çalışır?</h2>
            <p className="text-base max-w-lg mx-auto" style={{ color: '#5a7a72' }}>
              Seansify, psikologların klinik yönetimini uçtan uca otomatikleştiren bulut tabanlı bir platformdur.
            </p>
          </div>
          <div className="space-y-5">
            {[
              {
                step: '01', title: 'Hesabını Oluştur, Paketini Seç',
                desc: 'Sadece adın, e-posta adresin ve şifrenle 2 dakikada kayıt ol. Ardından ihtiyacına göre Başlangıç veya Pro paketini seç.',
                details: ['Ad Soyad + E-posta + Şifre ile kayıt', 'Paket seçimi (Başlangıç veya Pro)', 'Güvenli ödeme → Anında aktifleşme'],
                icon: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
                color: '#4a7c6f', bg: '#e8f5f1',
              },
              {
                step: '02', title: "Hastalarını Ekle, WhatsApp'ı Bağla",
                desc: "Hasta profillerini oluştur. Pro kullanıcılar kendi WhatsApp numaralarını QR kod ile sisteme bağlar — tek seferlik 2 dakikalık kurulum.",
                details: ['Hasta adı, iletişim bilgisi, seans geçmişi kaydet', 'WhatsApp QR kod ile bağlantı (Pro)', 'Randevu takvimini özelleştir'],
                icon: <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
                color: '#3b82f6', bg: '#eff6ff',
              },
              {
                step: '03', title: 'Randevular Oluştu — Sistem Devreye Giriyor',
                desc: "Randevu eklediğinde sistem otomatik olarak harekete geçer: hasta WhatsApp'tan hatırlatıcı alır, onay butonuna basar.",
                details: ['Randevu öncesi otomatik WhatsApp hatırlatıcısı', 'Hasta tek tıkla onaylar veya iptal eder', "Sen dashboard'dan her şeyi anlık görürsün"],
                icon: <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></>,
                color: '#25D366', bg: '#e8f8ee',
              },
              {
                step: '04', title: 'Yapay Zeka Asistanı 7/24 Çalışır',
                desc: 'Pro paketle WhatsApp üzerinden gelen hasta mesajlarını yapay zeka asistanımız yanıtlar, uygun saati bulur ve randevuyu otomatik oluşturur.',
                details: ['Hasta "randevu almak istiyorum" yazar', 'Asistan uygun saatleri önerir', 'Onaylanınca takvime otomatik işlenir'],
                icon: <><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></>,
                color: '#8b5cf6', bg: '#f3eeff',
              },
            ].map((item, i) => (
              <div key={item.step} className="animate-slide-right flex flex-col md:flex-row gap-6 rounded-2xl p-6 bg-white" style={{ borderLeft: `4px solid ${item.color}`, boxShadow: '0 1px 6px rgba(74,124,111,0.08)', animationDelay: `${i * 0.12}s` }}>
                <div className="flex items-start gap-4 md:w-52 flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={item.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{item.icon}</svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-widest mb-1" style={{ color: item.color }}>ADIM {item.step}</div>
                    <h3 className="font-bold text-sm leading-snug" style={{ color: '#0d1f18' }}>{item.title}</h3>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed mb-4" style={{ color: '#5a7a72' }}>{item.desc}</p>
                  <ul className="flex flex-col gap-2">
                    {item.details.map((d) => (
                      <li key={d} className="flex items-start gap-2 text-xs" style={{ color: '#3d5952' }}>
                        <span className="flex-shrink-0 mt-0.5 font-bold" style={{ color: item.color }}>→</span>
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

      {/* ── Öncesi / Sonrası ── */}
      <section className="py-24" style={{ background: '#e8f5f1' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: '#0d1f18' }}>Kliniğinizde Ne Değişir?</h2>
            <p className="text-base max-w-md mx-auto" style={{ color: '#5a7a72' }}>Seansify öncesi ve sonrası — farkı kendiniz görün.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-8 bg-white" style={{ border: '1px solid #c8e6dc' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fef2f2' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <h3 className="font-bold text-base" style={{ color: '#0d1f18' }}>Eski Yöntemle</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Randevu saatini telefonda not defterine yazıyorsunuz',
                  'Hatırlatıcıyı manuel WhatsApp ile gönderiyorsunuz',
                  'İptal olan saati doldurmak için tek tek arıyorsunuz',
                  'Hasta gelip gelmeyeceğini gün gelene kadar bilmiyorsunuz',
                  'Anamnez formunu kağıda yazdırıp toplantıda veriyorsunuz',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: '#5a7a72' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fca5a5" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl p-8" style={{ background: '#4a7c6f', border: '2px solid #3a6b5e' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h3 className="font-bold text-base text-white">Seansify ile</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Randevu takvime otomatik işlenir, her yerden görürsünüz',
                  'Hatırlatıcı mesajlar sistem tarafından otomatik gönderilir',
                  'İptal = bekleme listesine otomatik teklif, saat dolar',
                  'Hasta WhatsApp üzerinden onaylar, siz anlık bilgilendirilirsiniz',
                  'Anamnez formu linke tıkla, dijital doldur, sistemde sakla',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" className="flex-shrink-0 mt-0.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fiyatlandırma ── */}
      <section id="fiyatlandirma" className="py-24" style={{ background: '#f0f9f6' }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-5">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: '#0d1f18' }}>Şeffaf Fiyatlandırma</h2>
            <p className="text-base" style={{ color: '#5a7a72' }}>İstediğin zaman iptal et, taahhüt yok.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #c8e6dc', boxShadow: '0 1px 6px rgba(74,124,111,0.08)' }}>
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1" style={{ color: '#0d1f18' }}>Başlangıç Paketi</h3>
                <p className="text-xs mb-4" style={{ color: '#5a7a72' }}>Klinik yönetiminin temelleri</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold" style={{ color: '#0d1f18' }}>950</span>
                  <span className="text-lg font-semibold mb-1" style={{ color: '#6b8c84' }}>₺/ay</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  { text: 'Sınırsız hasta kaydı', ok: true },
                  { text: 'Randevu takvimi', ok: true },
                  { text: 'Seans notları ve ödev takibi', ok: true },
                  { text: 'Klinik dashboard', ok: true },
                  { text: 'WhatsApp özellikleri', ok: false, note: 'Pro gerektirir' },
                  { text: 'Otomatik randevu asistanı', ok: false, note: 'Pro gerektirir' },
                ].map((item) => (
                  <li key={item.text} className="flex items-start gap-3 text-sm">
                    {item.ok
                      ? <span className="mt-0.5 flex-shrink-0 font-bold" style={{ color: '#4a7c6f' }}>✓</span>
                      : <span className="mt-0.5 flex-shrink-0" style={{ color: '#aacfc7' }}>🔒</span>}
                    <span style={{ color: item.ok ? '#1e3d36' : '#8aada7' }}>
                      {item.text}{item.note && <span className="text-xs ml-1">({item.note})</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <Link href="/upgrade?plan=baslangic" className="block w-full text-center py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90" style={{ border: '2px solid #4a7c6f', color: '#4a7c6f' }}>
                Başlangıç Seç
              </Link>
            </div>

            <div className="rounded-2xl p-8 relative" style={{ background: '#4a7c6f', border: '2px solid #3a6b5e', boxShadow: '0 4px 20px rgba(74,124,111,0.35)' }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full text-xs font-bold" style={{ background: '#2d5a51', color: 'white' }}>EN POPÜLER</span>
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1 text-white">Seansify Pro</h3>
                <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.7)' }}>WhatsApp otomasyonu dahil</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">1.850</span>
                  <span className="text-lg font-semibold mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>₺/ay</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {["Başlangıç'taki her şey", 'WhatsApp hatırlatıcı sistemi', 'Otomatik randevu asistanı', 'Bekleme listesi otomasyonu', 'Öncelikli destek', 'Gelecek tüm özellikler'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 flex-shrink-0 font-bold text-white">✓</span>
                    <span style={{ color: 'rgba(255,255,255,0.9)' }}>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/upgrade?plan=pro" className="block w-full text-center py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 shadow-lg" style={{ background: 'white', color: '#4a7c6f' }}>
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
      <section id="sss" className="py-24" style={{ background: '#e8f5f1' }}>
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: '#0d1f18' }}>Sık Sorulan Sorular</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: 'Deneme süresi var mı?', a: 'Evet, 14 günlük deneme sunuyoruz. Bu süre zarfında tüm özelliklere tam erişimle randevu otomasyonunu, WhatsApp entegrasyonunu ve yapay zeka asistanını bizzat deneyimleyebilirsiniz. Beğenirsen devam et, beğenmezsen hiçbir şey ödemezsin.' },
              { q: 'Ödeme güvenli mi?', a: 'Tüm ödemeler Lemon Squeezy altyapısı üzerinden 256-bit SSL şifreleme ile güvenle işlenir. Kart bilgileriniz Seansify sunucularında saklanmaz.' },
              { q: 'WhatsApp numaramı kullanabilir miyim?', a: 'Evet, kendi kişisel veya iş WhatsApp numaranızı bağlayabilirsiniz. QR kod ile yapılan tek seferlik kurulum 2 dakikadan az sürer.' },
              { q: 'İstediğim zaman iptal edebilir miyim?', a: 'Evet. Herhangi bir taahhüt yoktur. Aboneliğinizi istediğiniz an iptal edebilirsiniz; mevcut dönem sonunda hizmet sona erer ve ücret alınmaz.' },
              { q: 'Verilerim güvende mi? KVKK uyumlu mu?', a: 'Seansify tamamen KVKK uyumludur. Tüm veriler Supabase altyapısında şifreli olarak saklanır. Hasta verileri üçüncü taraflarla asla paylaşılmaz.' },
              { q: 'Teknik destek nasıl çalışıyor?', a: 'Başlangıç paketi kullanıcıları e-posta desteğinden yararlanır. Pro kullanıcıları öncelikli destek alır ve genellikle 4 saat içinde yanıt verilir.' },
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
      <section id="iletisim" className="py-24" style={{ background: '#f0f9f6' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
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
      <section className="py-24" style={{ background: 'linear-gradient(135deg, #1a3a2e 0%, #2d5a51 50%, #4a7c6f 100%)' }}>
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

    </div>
  )
}

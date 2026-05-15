import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, -apple-system, sans-serif' }}>

      {/* ── Navbar ── */}
      <header style={{ background: '#0d1f18' }}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#4a7c6f' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0h10m-10 0a2 2 0 0 1-2 2H3" />
              </svg>
            </div>
            <span className="font-semibold text-base text-white">PsyConnect</span>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ color: '#94a3b8' }}
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
              style={{ background: '#4a7c6f', color: '#ffffff' }}
            >
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ background: 'linear-gradient(160deg, #0d1f18 0%, #12302a 50%, #0f2620 100%)', paddingBottom: '96px' }}>
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ background: 'rgba(74,124,111,0.2)', color: '#6ee7b7', border: '1px solid rgba(74,124,111,0.3)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            Psikologlar için özel tasarlandı
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6" style={{ color: '#f8fafc' }}>
            Klinik Yönetimini<br />
            <span style={{ color: '#4a7c6f' }}>Otomatikleştir,</span><br />
            Hastalara Odaklan
          </h1>

          <p className="text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: '#94a3b8' }}>
            Randevularınızı yönetin, WhatsApp ile otomatik hatırlatıcı gönderin. Tüm bunları tek bir platformdan yapın.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: '#4a7c6f', color: '#ffffff' }}
            >
              Hemen Başla — Ücretsiz
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.07)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Giriş Yap
            </Link>
          </div>
        </div>

        {/* Dashboard preview card */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0f1f19' }}>
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#0a1812', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="w-3 h-3 rounded-full" style={{ background: '#ef4444' }}></span>
              <span className="w-3 h-3 rounded-full" style={{ background: '#f59e0b' }}></span>
              <span className="w-3 h-3 rounded-full" style={{ background: '#22c55e' }}></span>
              <span className="ml-3 text-xs px-3 py-1 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#475569' }}>psyconnect.app/dashboard</span>
            </div>
            {/* Mock dashboard content */}
            <div className="p-5 grid grid-cols-4 gap-3">
              {[
                { label: 'Toplam Hasta', value: '24', color: '#4a7c6f' },
                { label: 'Bugün', value: '3', color: '#3b82f6' },
                { label: 'Bu Hafta', value: '11', color: '#8b5cf6' },
                { label: 'WhatsApp', value: 'Bağlı', color: '#16a34a' },
              ].map(stat => (
                <div key={stat.label} className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs" style={{ color: '#475569' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="mx-5 mb-5 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-xs font-medium" style={{ color: '#64748b' }}>Yaklaşan Randevular</span>
              </div>
              {['Ayşe Kaya — Bugün 14:00', 'Mehmet Demir — Yarın 10:30', 'Fatma Yıldız — Cuma 16:00'].map(item => (
                <div key={item} className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="w-7 h-7 rounded-full flex-shrink-0" style={{ background: 'rgba(74,124,111,0.3)' }}></div>
                  <span className="text-xs" style={{ color: '#64748b' }}>{item}</span>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(74,124,111,0.2)', color: '#4a7c6f' }}>Onaylandı</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: '#f8faf9', borderTop: '1px solid #e2eae7', borderBottom: '1px solid #e2eae7' }}>
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-3 gap-8 text-center">
          {[
            { value: '500+', label: 'Aktif Psikolog' },
            { value: '%98', label: 'Hatırlatıcı İletim Başarısı' },
            { value: '10k+', label: 'Gönderilen Mesaj' },
          ].map(stat => (
            <div key={stat.label}>
              <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: '#4a7c6f' }}>{stat.value}</div>
              <div className="text-sm" style={{ color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ background: '#F0F4F2' }} className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1e293b' }}>
              İhtiyacınız olan her şey, tek yerde
            </h2>
            <p className="text-sm max-w-sm mx-auto" style={{ color: '#64748b' }}>
              Karmaşık yazılımlar yerine sizi tanıyan bir sistem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                ),
                title: 'Randevu Yönetimi',
                desc: 'Hastaların randevularını kolayca oluşturun, düzenleyin. Takvim görünümüyle tüm haftanızı tek bakışta görün.',
                bg: '#e8f5f1',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                ),
                title: 'WhatsApp Hatırlatıcı',
                desc: 'Randevu saatinden önce hastalara otomatik WhatsApp mesajı gönderilir. Seans kaçırma oranını sıfıra indirin.',
                bg: '#e8f8ee',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
                title: 'Hasta Takibi',
                desc: 'Tüm hasta bilgilerini tek profilden yönetin. Geçmiş randevular, iletişim bilgileri ve notlar bir arada.',
                bg: '#f3eeff',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                ),
                title: 'Genel Bakış Paneli',
                desc: 'Günlük ve haftalık randevu sayılarını, hasta istatistiklerini anlık olarak takip edin.',
                bg: '#eff6ff',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                ),
                title: 'Otomatik Zamanlama',
                desc: 'Sistem her saat çalışır, yaklaşan randevuları tespit eder ve hatırlatıcıları zamanında iletir.',
                bg: '#fffbeb',
              },
              {
                icon: (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                ),
                title: 'Güvenli Altyapı',
                desc: 'Verileriniz Supabase ile şifreli olarak saklanır. KVKK uyumlu, güvenli bağlantı.',
                bg: '#fff0f6',
              },
            ].map(feature => (
              <div key={feature.title} className="bg-white rounded-2xl p-6" style={{ border: '1px solid #dde5e2' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: feature.bg }}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-sm mb-2" style={{ color: '#1e293b' }}>{feature.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Nasıl Çalışır ── */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#1e293b' }}>
              3 adımda hazır
            </h2>
            <p className="text-sm" style={{ color: '#64748b' }}>Kurulum gerektirmez, hemen kullanmaya başlayın</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Hesap Oluştur',
                desc: 'E-posta ve şifrenizle ücretsiz hesap açın. Kredi kartı gerekmez.',
              },
              {
                step: '2',
                title: 'WhatsApp Bağla',
                desc: 'QR kod ile kendi WhatsApp numaranızı sisteme bağlayın. Tek seferlik işlem.',
              },
              {
                step: '3',
                title: 'Randevuları Girin',
                desc: 'Hastalarınızı ve randevularını ekleyin. Sistem otomatik olarak hatırlatıcı gönderir.',
              },
            ].map((item, i) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4"
                  style={{ background: '#4a7c6f', color: 'white' }}>
                  {item.step}
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute" style={{ display: 'none' }}></div>
                )}
                <h3 className="font-semibold mb-2" style={{ color: '#1e293b' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20" style={{ background: 'linear-gradient(135deg, #0d1f18 0%, #1a3d2e 100%)' }}>
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#f8fafc' }}>
            Klinik yönetimini bugün başlatın
          </h2>
          <p className="text-sm mb-8" style={{ color: '#94a3b8' }}>
            Hızlıca kayıt olun, birkaç dakika içinde ilk randevunuzu ekleyin.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
            style={{ background: '#4a7c6f', color: '#ffffff' }}
          >
            Ücretsiz Hesap Oluştur
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0a1812', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: '#4a7c6f' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11m0 0h10m-10 0a2 2 0 0 1-2 2H3" />
              </svg>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#64748b' }}>PsyConnect</span>
          </div>
          <p className="text-xs" style={{ color: '#334155' }}>
            © {new Date().getFullYear()} PsyConnect. Psikologlar için yapıldı.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs" style={{ color: '#475569' }}>Giriş Yap</Link>
            <Link href="/register" className="text-xs" style={{ color: '#475569' }}>Hesap Oluştur</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

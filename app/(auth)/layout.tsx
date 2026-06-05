export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex" style={{ background: '#f4faf7' }}>

      {/* ── Sol panel (branding) — sadece lg+ ── */}
      <div
        className="hidden lg:flex flex-col w-[440px] min-h-screen p-10 flex-shrink-0 relative overflow-hidden"
        style={{ background: 'linear-gradient(155deg, #0d1f18 0%, #1a3d2b 55%, #2a5446 100%)' }}
      >
        {/* Dekoratif blob'lar */}
        <div style={{ position: 'absolute', top: '-8%', right: '-18%', width: '65%', height: '55%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(110,231,183,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '8%', left: '-12%', width: '55%', height: '45%', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(74,124,111,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}>
            <svg width="22" height="22" viewBox="0 0 40 40" fill="none">
              <rect x="6" y="11" width="28" height="24" rx="3" fill="white" />
              <rect x="6" y="11" width="28" height="10" rx="3" fill="white" fillOpacity="0.25" />
              <rect x="6" y="18" width="28" height="3" fill="white" fillOpacity="0.15" />
              <rect x="13" y="7" width="3" height="8" rx="1.5" fill="white" />
              <rect x="24" y="7" width="3" height="8" rx="1.5" fill="white" />
              <circle cx="20" cy="25" r="4" fill="#4a7c6f" />
              <path d="M13 35C13 31 16 28 20 28C24 28 27 31 27 35" fill="#4a7c6f" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Seansify</span>
        </div>

        {/* Ana mesaj */}
        <div className="relative z-10 my-auto">
          <h2 className="text-3xl font-extrabold text-white mb-3 leading-tight tracking-tight">
            Kliniğinizi<br />dijitalleştirin
          </h2>
          <p className="mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.58)', fontSize: '15px' }}>
            Randevu yönetimi, WhatsApp otomasyonu ve yapay zeka asistanı — Türkiye'deki psikologlar için tasarlandı.
          </p>

          <div className="space-y-3.5">
            {[
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                text: 'Otomatik randevu hatırlatıcıları',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
                text: 'WhatsApp entegrasyonu',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
                text: 'Dijital anamnez formları',
              },
              {
                icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>,
                text: '7/24 yapay zeka asistanı',
              },
            ].map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(110,231,183,0.12)', border: '1px solid rgba(110,231,183,0.18)', color: '#6ee7b7' }}>
                  {f.icon}
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alt bilgi */}
        <div className="relative z-10 text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
          © 2026 Seansify · Türkiye'nin psikolog platformu
        </div>
      </div>

      {/* ── Sağ form paneli ── */}
      <div className="flex-1 flex items-center justify-center p-6 min-h-screen">
        <div className="w-full max-w-md">

          {/* Mobile logo (lg'de gizli) */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ background: '#4a7c6f' }}>
              <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                <rect x="6" y="11" width="28" height="24" rx="3" fill="white" />
                <rect x="13" y="7" width="3" height="8" rx="1.5" fill="white" />
                <rect x="24" y="7" width="3" height="8" rx="1.5" fill="white" />
                <circle cx="20" cy="25" r="4" fill="#4a7c6f" />
                <path d="M13 35C13 31 16 28 20 28C24 28 27 31 27 35" fill="#4a7c6f" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold" style={{ color: '#334155' }}>Seansify</h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Akıllı Klinik Yönetim Sistemi</p>
          </div>

          <div className="bg-white rounded-2xl p-8" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #e8f0ec' }}>
            {children}
          </div>
        </div>
      </div>

    </div>
  )
}

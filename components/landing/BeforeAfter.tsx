'use client'

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg" style={{ border: '1px solid #c8e6de' }}>
      <div style={{ background: '#0d1f18', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 5 }}>
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#ef4444', opacity: 0.7 }} />
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#f59e0b', opacity: 0.7 }} />
        <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#22c55e', opacity: 0.7 }} />
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 5, padding: '2px 8px', marginLeft: 6 }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>seansify.com</span>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function HatirlatmaWA() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F2', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #dde5e2', overflow: 'hidden' }}>
        <div style={{ background: '#25D366', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>S</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Seansify · Otomatik Hatırlatıcı</div>
        </div>
        <div style={{ background: '#e5ddd5', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ maxWidth: '90%', background: '#fff', borderRadius: '0 8px 8px 8px', padding: '7px 9px', boxShadow: '0 1px 2px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 10, color: '#334155', lineHeight: 1.5 }}>
              Sayın <strong>Mehmet Bey</strong>, yarın <strong>14:00</strong>'deki seansınızı hatırlatmak istedik 🗓️
            </div>
            <div style={{ marginTop: 5, display: 'flex', gap: 4 }}>
              <div style={{ flex: 1, background: '#e8f5f1', border: '1px solid #4a7c6f', borderRadius: 5, padding: '4px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#4a7c6f' }}>✓ Onaylıyorum</div>
              <div style={{ flex: 1, background: '#fff2f2', border: '1px solid #fca5a5', borderRadius: 5, padding: '4px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: '#ef4444' }}>İptal Et</div>
            </div>
            <div style={{ fontSize: 8, color: '#94a3b8', textAlign: 'right', marginTop: 3 }}>09:00 ✓✓</div>
          </div>
          <div style={{ maxWidth: '50%', marginLeft: 'auto', background: '#dcf8c6', borderRadius: '8px 0 8px 8px', padding: '7px 9px', boxShadow: '0 1px 2px rgba(0,0,0,0.07)' }}>
            <div style={{ fontSize: 10, color: '#334155' }}>✓ Onaylıyorum</div>
            <div style={{ fontSize: 8, color: '#94a3b8', textAlign: 'right', marginTop: 2 }}>09:03 ✓✓</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, background: '#e8f5f1', borderRadius: 8, padding: '7px 11px', fontSize: 10, color: '#2d5a51', fontWeight: 600 }}>
        ✓ Dashboard'da "Onaylı" olarak işaretlendi
      </div>
    </div>
  )
}

function AnamnezMockup() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F2', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #dde5e2', overflow: 'hidden' }}>
        <div style={{ background: '#4a7c6f', padding: '10px 14px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Dijital Anamnez Formu</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>Zeynep Demir · İlk Seans Öncesi</div>
        </div>
        <div style={{ padding: 12 }}>
          {[
            { label: 'Başvuru Nedeni', value: 'Kaygı bozukluğu, uyku sorunları' },
            { label: 'Geçmiş Tanılar', value: 'Yok' },
            { label: 'İlaç Kullanımı', value: 'Kullanmıyor' },
          ].map((f, i) => (
            <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: i < 2 ? '1px solid #f1f5f9' : undefined }}>
              <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: '#334155', fontWeight: 500 }}>{f.value}</div>
            </div>
          ))}
          <div style={{ background: '#e8f5f1', borderRadius: 7, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12 }}>✓</span>
            <div style={{ fontSize: 10, color: '#2d5a51', fontWeight: 600 }}>Form danışan tarafından dolduruldu</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, background: '#fff', borderRadius: 8, border: '1px solid #dde5e2', padding: '8px 12px', fontSize: 10, color: '#64748b' }}>
        🔗 Bağlantı danışana WhatsApp ile gönderildi — seans başlamadan hazır
      </div>
    </div>
  )
}

function RaporMockup() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F2', padding: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, marginBottom: 10 }}>
        {[
          { label: 'Tamamlanan Seans', value: '24', color: '#4a7c6f' },
          { label: 'Tahsil Edilen', value: '₺14.400', color: '#2563eb' },
          { label: 'Bekleyen Ödeme', value: '₺2.600', color: '#d97706' },
          { label: 'İptal / Gelmedi', value: '3', color: '#ef4444' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', border: '1px solid #dde5e2' }}>
            <div style={{ fontSize: 9, color: '#64748b', marginBottom: 3 }}>{c.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dde5e2', padding: '10px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginBottom: 5 }}>
          <span>Tahsil: <strong style={{ color: '#4a7c6f' }}>₺14.400</strong></span>
          <span>Toplam: <strong>₺17.000</strong></span>
        </div>
        <div style={{ background: '#dde5e2', borderRadius: 99, height: 6 }}>
          <div style={{ background: '#4a7c6f', borderRadius: 99, height: 6, width: '85%' }} />
        </div>
        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 3 }}>%85 tahsil edildi · Mayıs 2026</div>
      </div>
    </div>
  )
}

const scenarios = [
  {
    problem: {
      icon: '📱',
      title: 'Hatırlatmayı unuttunuz — danışan gelmedi.',
      desc: 'Her randevu için manuel WhatsApp mesajı, telefon araması. Bir gün atlandı mı, no-show.',
    },
    solution: {
      title: 'Hatırlatıcılar otomatik gönderilir.',
      desc: 'Randevu girdiğiniz an sistem devreye girer. Danışan onaylar, siz anlık bilgilendirilirsiniz.',
    },
    mockup: <HatirlatmaWA />,
  },
  {
    problem: {
      icon: '📋',
      title: 'Kağıt form, ilk seansin 15 dakikası boşa.',
      desc: 'Danışan kliniğe gelir, oturur, formu doldurmaya başlar. Siz beklersiniz.',
    },
    solution: {
      title: 'Form seans başlamadan hazır.',
      desc: 'WhatsApp ile link gönderilir, danışan evde doldurur. Siz seans odasına girdiğinizde anamnez ekranda.',
    },
    mockup: <AnamnezMockup />,
  },
  {
    problem: {
      icon: '🧮',
      title: 'Kim ödedi, kaç seans kaldı — hepsi aklınızda.',
      desc: 'Excel, not defteri, sözlü takip. Her ay sonunda hangi danışanın borcunu unuttunuz?',
    },
    solution: {
      title: 'Ödeme ve seans geçmişi otomatik izlenir.',
      desc: 'Ay sonunda tek bakışta tahsilat durumu, bekleyen ödemeler ve seans istatistikleri.',
    },
    mockup: <RaporMockup />,
  },
]

export default function BeforeAfter() {
  return (
    <section className="py-24" style={{ background: '#e8f5f1' }}>
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4 scroll-reveal" style={{ color: '#0d1f18' }}>Kliniğinizde Ne Değişir?</h2>
          <p className="text-base max-w-md mx-auto" style={{ color: '#5a7a72' }}>Günlük sorunların Seansify'daki karşılığı.</p>
        </div>

        <div className="space-y-8">
          {scenarios.map((s, i) => (
            <div
              key={i}
              className="scroll-reveal grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 2px 16px rgba(74,124,111,0.10)', border: '1px solid #c8e6dc' }}
            >
              {/* Problem */}
              <div className="flex flex-col justify-center p-6 md:p-8" style={{ background: '#fff' }}>
                <div className="flex items-start gap-4 mb-5">
                  <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{s.problem.icon}</div>
                  <div>
                    <div className="text-xs font-bold tracking-widest mb-2" style={{ color: '#ef4444' }}>ÖNCE</div>
                    <h3 className="font-bold text-base leading-snug mb-2" style={{ color: '#0d1f18' }}>{s.problem.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{s.problem.desc}</p>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
                  <div className="text-xs font-bold tracking-widest mb-2" style={{ color: '#4a7c6f' }}>SEANSİFY İLE</div>
                  <h3 className="font-bold text-base leading-snug mb-1" style={{ color: '#0d1f18' }}>{s.solution.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#5a7a72' }}>{s.solution.desc}</p>
                </div>
              </div>

              {/* Mockup */}
              <div style={{ background: '#f8fffe', borderLeft: '1px solid #c8e6dc' }}>
                <BrowserFrame>
                  {s.mockup}
                </BrowserFrame>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

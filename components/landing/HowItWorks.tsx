'use client'

import { useState, useEffect, useRef } from 'react'

function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: '1px solid #c8e6de' }}>
      <div style={{ background: '#0d1f18', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', opacity: 0.7 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', opacity: 0.7 }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', opacity: 0.7 }} />
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 10px', marginLeft: 8 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{url}</span>
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}

function KurulumMockup() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F2', padding: 20, minHeight: 340 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 16 }}>Profil Bilgileri</div>
      {[
        { label: 'Ad Soyad', value: 'Dr. Ayşe Kaya' },
        { label: 'Uzmanlık', value: 'Klinik Psikolog' },
        { label: 'E-posta', value: 'aysekaya@gmail.com' },
      ].map(f => (
        <div key={f.label} style={{ background: '#fff', borderRadius: 10, padding: '10px 14px', marginBottom: 8, border: '1px solid #dde5e2' }}>
          <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 3 }}>{f.label}</div>
          <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{f.value}</div>
        </div>
      ))}
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, background: '#f8fafc', border: '2px solid #dde5e2', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>Seansify One</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#334155' }}>₺749<span style={{ fontSize: 10, fontWeight: 400, color: '#94a3b8' }}>/ay</span></div>
        </div>
        <div style={{ flex: 1, background: '#4a7c6f', borderRadius: 10, padding: '10px', textAlign: 'center', border: '2px solid #3a6259' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Seansify Pro</div>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>₺1.850<span style={{ fontSize: 10, fontWeight: 400, color: 'rgba(255,255,255,0.6)' }}>/ay</span></div>
        </div>
      </div>
      <div style={{ marginTop: 10, background: '#e8f5f1', border: '1px solid #a8d5c4', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#2d5a51' }}>✓ Hesap Oluşturuldu — Kliniğin Hazır</div>
      </div>
    </div>
  )
}

function WhatsAppBaglantiMockup() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F2', padding: 20, minHeight: 340 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>WhatsApp Bağlantısı</div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 16 }}>Kendi numaranla bağlan — tek seferlik 2 dakika</div>
      <div style={{ background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #dde5e2', textAlign: 'center', marginBottom: 12 }}>
        <div style={{ width: 110, height: 110, margin: '0 auto 10px', background: '#f8fafc', border: '1px solid #dde5e2', borderRadius: 8, display: 'grid', gridTemplateColumns: 'repeat(9, 1fr)', gap: 2, padding: 8 }}>
          {Array.from({ length: 81 }).map((_, i) => {
            const filled = [0,1,2,3,4,5,6,9,15,18,19,20,21,22,23,24,27,33,36,37,38,39,40,41,42,45,51,54,55,56,57,58,59,60,63,69,72,73,74,75,76,77,78,29,31,47,49,10,12,64,66,7,25,43,61].includes(i)
            return <div key={i} style={{ background: filled ? '#0d1f18' : 'transparent', borderRadius: 1 }} />
          })}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>WhatsApp Web'i Tara</div>
        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Telefonundaki WhatsApp → Bağlı Cihazlar</div>
      </div>
      <div style={{ background: '#dcfce7', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>✓</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#166534' }}>Bağlantı Başarılı</div>
          <div style={{ fontSize: 10, color: '#4ade80' }}>+90 532 xxx xx xx · Aktif</div>
        </div>
      </div>
      <div style={{ marginTop: 10, background: '#fff', borderRadius: 10, border: '1px solid #dde5e2', padding: '10px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Hasta Profili — Zeynep Demir</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Randevu: 12', 'Seans: 8', 'WA: ✓'].map(t => (
            <div key={t} style={{ background: '#e8f5f1', borderRadius: 6, padding: '3px 8px', fontSize: 10, color: '#4a7c6f', fontWeight: 600 }}>{t}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function HatirlatmaMockup() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F2', padding: 20, minHeight: 340 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Otomatik Hatırlatıcı Gönderildi</div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>Randevudan 24 saat önce — otomatik</div>
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #dde5e2', overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ background: '#25D366', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>S</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Seansify</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>çevrimiçi</div>
          </div>
        </div>
        <div style={{ background: '#e5ddd5', padding: '12px 10px' }}>
          <div style={{ maxWidth: '88%', background: '#fff', borderRadius: '0 10px 10px 10px', padding: '8px 10px', marginBottom: 8, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 11, color: '#334155', lineHeight: 1.55 }}>
              Sayın <strong>Ayşe Hanım</strong>, yarın <strong>10:00</strong>'daki seansınızı hatırlatmak istedik 🗓️
            </div>
            <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
              <div style={{ flex: 1, background: '#e8f5f1', border: '1px solid #4a7c6f', borderRadius: 6, padding: '5px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#4a7c6f' }}>✓ Onaylıyorum</div>
              <div style={{ flex: 1, background: '#fff2f2', border: '1px solid #fca5a5', borderRadius: 6, padding: '5px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#ef4444' }}>İptal Et</div>
            </div>
            <div style={{ fontSize: 9, color: '#94a3b8', textAlign: 'right', marginTop: 4 }}>09:00 ✓✓</div>
          </div>
          <div style={{ maxWidth: '55%', marginLeft: 'auto', background: '#dcf8c6', borderRadius: '10px 0 10px 10px', padding: '8px 10px', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 11, color: '#334155' }}>✓ Onaylıyorum</div>
            <div style={{ fontSize: 9, color: '#94a3b8', textAlign: 'right', marginTop: 2 }}>09:02 ✓✓</div>
          </div>
        </div>
      </div>
      <div style={{ background: '#e8f5f1', borderRadius: 8, padding: '8px 12px', fontSize: 11, color: '#2d5a51', fontWeight: 600 }}>
        ✓ Dashboard'da "Onaylı" olarak güncellendi
      </div>
    </div>
  )
}

function AIAsistanMockup() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F2', padding: 20, minHeight: 340 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 4 }}>AI Randevu Asistanı</div>
      <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>Gece 23:15 — sen uyurken takvim doluyor</div>
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #dde5e2', overflow: 'hidden' }}>
        <div style={{ background: '#25D366', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>S</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Seansify</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)' }}>Bot · 23:15</div>
          </div>
        </div>
        <div style={{ background: '#e5ddd5', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { text: 'Merhaba, randevu almak istiyorum 🙏', mine: false, time: '23:15' },
            { text: 'Merhaba! Uygun saatler:\n📅 Salı 14:00\n📅 Çarşamba 10:00\n📅 Perşembe 16:00', mine: true, time: '23:15' },
            { text: 'Salı 14:00 olur', mine: false, time: '23:16' },
            { text: '✅ Randevunuz oluşturuldu!\nSalı, 14:00 · Onay mesajı gönderildi', mine: true, time: '23:16' },
          ].map((m, i) => (
            <div key={i} style={{ maxWidth: '82%', marginLeft: m.mine ? 'auto' : 0, background: m.mine ? '#dcf8c6' : '#fff', borderRadius: m.mine ? '10px 0 10px 10px' : '0 10px 10px 10px', padding: '7px 9px', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 11, color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.5 }}>{m.text}</div>
              <div style={{ fontSize: 9, color: '#94a3b8', textAlign: 'right', marginTop: 2 }}>{m.time}{m.mine ? ' ✓✓' : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const steps = [
  {
    num: '01',
    color: '#4a7c6f',
    title: 'Hesabını Oluştur, Paketini Seç',
    desc: 'Sadece adın, e-posta adresin ve şifrenle 2 dakikada kayıt ol. Seansify One veya Pro paketini seç — anında aktif.',
    url: 'seansify.com/register',
    mockup: <KurulumMockup />,
  },
  {
    num: '02',
    color: '#3b82f6',
    title: "Hastalarını Ekle, WhatsApp'ı Bağla",
    desc: 'Hasta profillerini oluştur. Kendi WhatsApp numaranı QR kodla sisteme bağla — tek seferlik, 2 dakika.',
    url: 'seansify.com/settings',
    mockup: <WhatsAppBaglantiMockup />,
  },
  {
    num: '03',
    color: '#25D366',
    title: 'Randevu Gir — Sistem Devreye Girer',
    desc: "Randevu eklediğinde sistem otomatik harekete geçer: danışan WhatsApp'tan hatırlatıcı alır, onaylar. Sen dashboard'dan anlık görürsün.",
    url: 'seansify.com/appointments',
    mockup: <HatirlatmaMockup />,
  },
  {
    num: '04',
    color: '#8b5cf6',
    title: 'Yapay Zeka Asistanı 7/24 Çalışır',
    desc: "Mesai dışında gelen randevu talepleri? AI asistan WhatsApp'ta sohbet eder, uygun saati bulur, takvime işler. Sen uyurken.",
    url: 'seansify.com/whatsapp',
    mockup: <AIAsistanMockup />,
  },
]

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0)
  const [expandedMobile, setExpandedMobile] = useState<number | null>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const handleScroll = () => {
      const target = window.innerHeight * 0.38
      let closestIdx = 0
      let closestDist = Infinity
      stepRefs.current.forEach((ref, i) => {
        if (!ref) return
        const rect = ref.getBoundingClientRect()
        const mid = (rect.top + rect.bottom) / 2
        const dist = Math.abs(mid - target)
        if (dist < closestDist) { closestDist = dist; closestIdx = i }
      })
      setActiveStep(closestIdx)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const active = steps[activeStep]

  return (
    <section id="nasil-calisir" className="py-16 md:py-24" style={{ background: 'transparent' }}>
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4 scroll-reveal" style={{ color: '#0d1f18' }}>Nasıl Çalışır?</h2>
          <p className="text-base max-w-md mx-auto" style={{ color: '#5a7a72' }}>
            Dört adımda tam otomatik klinik.
          </p>
        </div>

        {/* Desktop: sticky mockup + scrollable steps */}
        <div className="hidden md:grid grid-cols-2 gap-12 items-start">
          {/* Left: sticky mockup */}
          <div style={{ position: 'sticky', top: 100 }}>
            {/* All mockups stacked, CSS fade between them */}
            <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: '1px solid #c8e6de' }}>
              {/* Browser chrome — url transitions */}
              <div style={{ background: '#0d1f18', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', opacity: 0.7 }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', opacity: 0.7 }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', opacity: 0.7 }} />
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 10px', marginLeft: 8, overflow: 'hidden' }}>
                  {steps.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.4)',
                        position: i === 0 ? 'relative' : 'absolute',
                        opacity: activeStep === i ? 1 : 0,
                        transition: 'opacity 0.4s ease',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.url}
                    </span>
                  ))}
                </div>
              </div>
              {/* Mockup content: all layers stacked */}
              <div style={{ position: 'relative' }}>
                {steps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      position: i === 0 ? 'relative' : 'absolute',
                      top: 0, left: 0, right: 0,
                      opacity: activeStep === i ? 1 : 0,
                      transform: activeStep === i ? 'translateY(0px)' : 'translateY(10px)',
                      transition: 'opacity 0.45s ease, transform 0.45s ease',
                      pointerEvents: activeStep === i ? 'auto' : 'none',
                    }}
                  >
                    {step.mockup}
                  </div>
                ))}
              </div>
            </div>
            {/* Step indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {steps.map((s, i) => (
                <div
                  key={i}
                  style={{
                    width: i === activeStep ? 24 : 8,
                    height: 8,
                    borderRadius: 99,
                    background: i === activeStep ? s.color : '#c8e6dc',
                    transition: 'all 0.4s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right: scrollable steps */}
          <div>
            {steps.map((step, i) => (
              <div
                key={i}
                ref={el => { stepRefs.current[i] = el }}
                style={{ minHeight: 260, paddingTop: 40, paddingBottom: 40 }}
              >
                <div
                  style={{
                    padding: '28px',
                    borderRadius: 20,
                    background: activeStep === i ? '#fff' : 'transparent',
                    border: `2px solid ${activeStep === i ? step.color + '35' : 'transparent'}`,
                    transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
                    boxShadow: activeStep === i ? '0 4px 24px rgba(74,124,111,0.12)' : 'none',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: '0.12em',
                      marginBottom: 8, color: step.color,
                      opacity: activeStep === i ? 1 : 0.45,
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    ADIM {step.num}
                  </div>
                  <h3
                    style={{
                      fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#0d1f18',
                      opacity: activeStep === i ? 1 : 0.5,
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    {step.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 14, lineHeight: 1.65, color: '#5a7a72',
                      opacity: activeStep === i ? 1 : 0.45,
                      transition: 'opacity 0.4s ease',
                    }}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: accordion — karta tıklayınca mockup açılır */}
        <div className="md:hidden space-y-4">
          {steps.map((step, i) => {
            const isOpen = expandedMobile === i
            return (
              <div key={i}>
                <button
                  onClick={() => setExpandedMobile(isOpen ? null : i)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '20px', borderRadius: isOpen ? '16px 16px 0 0' : 16,
                    background: '#fff', border: `2px solid ${step.color}${isOpen ? '60' : '30'}`,
                    borderBottom: isOpen ? 'none' : undefined,
                    cursor: 'pointer', display: 'block',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: step.color, marginBottom: 4 }}>ADIM {step.num}</div>
                    <svg
                      width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke={step.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease', flexShrink: 0 }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0d1f18', marginBottom: 6 }}>{step.title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: '#5a7a72' }}>{step.desc}</div>
                </button>
                <div style={{
                  display: 'grid',
                  gridTemplateRows: isOpen ? '1fr' : '0fr',
                  transition: 'grid-template-rows 0.35s ease, opacity 0.25s ease',
                  borderRadius: '0 0 16px 16px',
                  border: `2px solid ${step.color}60`,
                  borderTop: 'none',
                  opacity: isOpen ? 1 : 0,
                }}>
                  <div style={{ overflow: 'hidden' }}>
                    <BrowserFrame url={step.url}>
                      {step.mockup}
                    </BrowserFrame>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

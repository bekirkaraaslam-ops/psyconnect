'use client'

import { useState, useEffect, useRef } from 'react'
import ShootingStars from './ShootingStars'
import WaAnimasyonMockup from './WaAnimasyonMockup'

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
        <div style={{ fontSize: 12, fontWeight: 700, color: '#2d5a51' }}>✓ Hesap Oluşturuldu — Pratiğin Hazır</div>
      </div>
    </div>
  )
}

function HastalarVeRandevuMockup() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F2', padding: 20, minHeight: 340 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', marginBottom: 12 }}>Danışan Listesi</div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dde5e2', overflow: 'hidden', marginBottom: 10 }}>
        {[
          { name: 'Ayşe Kaya', meta: '5. seans · Yüz yüze', avatar: 'AK', color: '#4a7c6f' },
          { name: 'Mehmet Yılmaz', meta: '3. seans · Online', avatar: 'MY', color: '#3b82f6' },
          { name: 'Zeynep Demir', meta: '1. seans · Yeni', avatar: 'ZD', color: '#8b5cf6' },
        ].map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderBottom: i < 2 ? '1px solid #f1f5f9' : undefined }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: p.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: p.color, flexShrink: 0 }}>{p.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{p.name}</div>
              <div style={{ fontSize: 10, color: '#94a3b8' }}>{p.meta}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dde5e2', padding: '10px 12px' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#334155', marginBottom: 8 }}>Yeni Randevu</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
          {['Ayşe Kaya', '27 May, 10:00', '50 dakika', 'Yüz yüze'].map((v, i) => (
            <div key={i} style={{ background: '#f8fafc', borderRadius: 6, padding: '6px 8px', fontSize: 11, color: '#64748b' }}>{v}</div>
          ))}
        </div>
        <div style={{ background: '#4a7c6f', borderRadius: 8, padding: '8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
          ✓ Randevu Kaydedildi
        </div>
      </div>
    </div>
  )
}

function WaBagliVeHatirlaticiMockup() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F2', padding: 20, minHeight: 340 }}>
      <div style={{ background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#fff', flexShrink: 0 }}>✓</div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>WhatsApp Bağlı — Sistem Aktif</div>
          <div style={{ fontSize: 10, color: '#16a34a' }}>+90 532 xxx xx xx · Hatırlatıcılar açık</div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #dde5e2', overflow: 'hidden' }}>
        <div style={{ background: '#25D366', padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>S</div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>Seansify</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.8)' }}>Otomatik hatırlatıcı · 09:00</div>
          </div>
        </div>
        <div style={{ background: '#e5ddd5', padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ maxWidth: '88%', background: '#fff', borderRadius: '0 10px 10px 10px', padding: '8px 10px', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 11, color: '#334155', lineHeight: 1.55 }}>
              Sayın <strong>Ayşe Hanım</strong>, yarın <strong>10:00</strong>'daki seansınızı hatırlatmak istedik 🗓️
            </div>
            <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
              <div style={{ flex: 1, background: '#e8f5f1', border: '1px solid #4a7c6f', borderRadius: 6, padding: '4px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#4a7c6f' }}>✓ Onaylıyorum</div>
              <div style={{ flex: 1, background: '#fff2f2', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#ef4444' }}>İptal Et</div>
            </div>
            <div style={{ fontSize: 9, color: '#94a3b8', textAlign: 'right', marginTop: 4 }}>09:00 ✓✓</div>
          </div>
          <div style={{ maxWidth: '50%', marginLeft: 'auto', background: '#dcf8c6', borderRadius: '10px 0 10px 10px', padding: '7px 10px', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 11, color: '#334155' }}>✓ Onaylıyorum</div>
            <div style={{ fontSize: 9, color: '#94a3b8', textAlign: 'right', marginTop: 2 }}>09:02 ✓✓</div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 8, background: '#e8f5f1', borderRadius: 8, padding: '7px 12px', fontSize: 11, color: '#2d5a51', fontWeight: 600 }}>
        ✓ Takvimde otomatik "Onaylı" olarak güncellendi
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
    title: 'Danışanlarını Ekle, Randevuyu Oluştur',
    desc: 'Danışan profillerini sisteme ekle. İlk randevuyu birkaç tıkla oluştur — isim, tarih, saat kaydedildi, takip başladı.',
    url: 'seansify.com/patients',
    mockup: <HastalarVeRandevuMockup />,
  },
  {
    num: '03',
    color: '#25D366',
    title: "WhatsApp'ı Bağla — Hatırlatıcılar Otomatik Gider",
    desc: 'Kendi numaranı QR kodla bağla, tek seferlik 2 dakika. Bundan sonra her randevu öncesi hatırlatıcı otomatik gönderilir, onaylar takvime yansır.',
    url: 'seansify.com/settings',
    mockup: <WaBagliVeHatirlaticiMockup />,
  },
  {
    num: '04',
    color: '#8b5cf6',
    title: 'Yapay Zeka Asistanı 7/24 Çalışır',
    desc: "Mesai dışında gelen randevu talepleri? AI asistan WhatsApp'ta sohbet eder, uygun saati bulur, takvime işler. Sen uyurken.",
    url: 'seansify.com/whatsapp',
    mockup: null,
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

  return (
    <section id="nasil-calisir" className="py-16 md:py-24" style={{ position: 'relative', backgroundColor: '#f2f8f5', backgroundImage: 'radial-gradient(circle, rgba(74,124,111,0.10) 1px, transparent 1px)', backgroundSize: '28px 28px' }}>
      <ShootingStars />
      <div className="max-w-5xl mx-auto px-4 md:px-6" style={{ position: 'relative', zIndex: 1 }}>
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4" style={{ color: '#0d1f18' }}>Nasıl Çalışır?</h2>
          <p className="text-base max-w-md mx-auto" style={{ color: '#5a7a72' }}>
            Dört adımda tam otomatik pratik.
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden md:grid grid-cols-2 gap-12 items-start">
          <div style={{ position: 'sticky', top: 100 }}>
            <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: '1px solid #c8e6de' }}>
              <div style={{ background: '#0d1f18', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', opacity: 0.7 }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', opacity: 0.7 }} />
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', opacity: 0.7 }} />
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 10px', marginLeft: 8, overflow: 'hidden' }}>
                  {steps.map((s, i) => (
                    <span key={i} style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', position: i === 0 ? 'relative' : 'absolute', opacity: activeStep === i ? 1 : 0, transition: 'opacity 0.4s ease', whiteSpace: 'nowrap' }}>
                      {s.url}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ position: 'relative' }}>
                {steps.map((step, i) => (
                  <div key={i} style={{ position: i === 0 ? 'relative' : 'absolute', top: 0, left: 0, right: 0, opacity: activeStep === i ? 1 : 0, transform: activeStep === i ? 'translateY(0px)' : 'translateY(10px)', transition: 'opacity 0.45s ease, transform 0.45s ease', pointerEvents: activeStep === i ? 'auto' : 'none' }}>
                    {i === 3 ? <WaAnimasyonMockup isActive={activeStep === 3} /> : step.mockup}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {steps.map((s, i) => (
                <div key={i} style={{ width: i === activeStep ? 24 : 8, height: 8, borderRadius: 99, background: i === activeStep ? s.color : '#c8e6dc', transition: 'all 0.4s ease' }} />
              ))}
            </div>
          </div>

          <div>
            {steps.map((step, i) => (
              <div key={i} ref={el => { stepRefs.current[i] = el }} style={{ minHeight: 260, paddingTop: 40, paddingBottom: 40 }}>
                <div style={{ padding: '28px', borderRadius: 20, background: activeStep === i ? '#fff' : 'transparent', border: `2px solid ${activeStep === i ? step.color + '35' : 'transparent'}`, transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease', boxShadow: activeStep === i ? '0 4px 24px rgba(74,124,111,0.12)' : 'none' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', marginBottom: 8, color: step.color, opacity: activeStep === i ? 1 : 0.45, transition: 'opacity 0.4s ease' }}>
                    ADIM {step.num}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#0d1f18', opacity: activeStep === i ? 1 : 0.5, transition: 'opacity 0.4s ease' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: '#5a7a72', opacity: activeStep === i ? 1 : 0.45, transition: 'opacity 0.4s ease' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: accordion */}
        <div className="md:hidden space-y-4">
          {steps.map((step, i) => {
            const isOpen = expandedMobile === i
            return (
              <div key={i}>
                <button
                  onClick={() => setExpandedMobile(isOpen ? null : i)}
                  style={{ width: '100%', textAlign: 'left', padding: '20px', borderRadius: isOpen ? '16px 16px 0 0' : 16, background: '#fff', border: `2px solid ${step.color}${isOpen ? '60' : '30'}`, borderBottom: isOpen ? 'none' : undefined, cursor: 'pointer', display: 'block' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: step.color, marginBottom: 4 }}>ADIM {step.num}</div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s ease', flexShrink: 0 }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#0d1f18', marginBottom: 6 }}>{step.title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.6, color: '#5a7a72' }}>{step.desc}</div>
                </button>
                <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', transition: 'grid-template-rows 0.35s ease, opacity 0.25s ease', borderRadius: '0 0 16px 16px', border: `2px solid ${step.color}60`, borderTop: 'none', opacity: isOpen ? 1 : 0 }}>
                  <div style={{ overflow: 'hidden' }}>
                    <BrowserFrame url={step.url}>
                      {i === 3 ? <WaAnimasyonMockup isActive={isOpen} /> : step.mockup}
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

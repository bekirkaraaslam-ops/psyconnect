'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const FEATURES = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    icon: (
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    ),
    color: '#25D366',
    bg: 'rgba(37,211,102,0.12)',
    title: 'WhatsApp Otomasyonu',
    tagline: 'Hatırlatıcıları sistem gönderir, siz unutmazsınız.',
    old: 'Her randevu için manuel mesaj atmak, aramak, takip etmek.',
    benefits: [
      'Randevu girdiğiniz an otomatik hatırlatma planlanır',
      'Danışan tek tıkla onaylar veya iptal eder',
      'No-show oranı ortalama %60 azalır',
      'Kendi WhatsApp numaranız bağlanır, QR ile 2 dakika',
    ],
  },
  {
    id: 'randevu',
    label: 'Randevu',
    icon: (
      <><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>
    ),
    color: '#4a7c6f',
    bg: 'rgba(74,124,111,0.12)',
    title: 'Randevu Yönetimi',
    tagline: 'Takvim entegrasyonu, çakışma önleme, tek tıkla oluşturma.',
    old: 'Dolu saatlere randevu vermek, çift kayıt, telefon karmaşası.',
    benefits: [
      'Dolu saatler otomatik bloke edilir, çakışma olmaz',
      'Online form veya siz ekleyebilirsiniz',
      'Danışana QR veya link ile randevu sayfanız gönderilir',
      'Günlük timeline ile sabah tek bakışta program',
    ],
  },
  {
    id: 'ai',
    label: 'YZ Asistan',
    icon: (
      <><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" /></>
    ),
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    title: 'Yapay Zeka Asistan',
    tagline: 'SOAP notu, seans analizi, ölçek yorumu, randevu botu — hepsi AI ile.',
    old: 'Seans sonrası not yazmak, anamnez okumak, ilerlemeyi elle takip etmek için saatler harcamak.',
    benefits: [
      'Seans notundan tek tıkla SOAP formatı oluşturulur',
      'Danışanın anamnez formu AI tarafından özetlenir, ilk görüşmeye hazır gelirsin',
      'Son seansların tamamı analiz edilir, danışanın ilerlemesi tek paragrafta özetlenir',
      'PHQ-9, GAD-7 gibi ölçek sonuçları AI tarafından klinik olarak yorumlanır',
      'Danışan istediği saatte WhatsApp\'tan randevu alır, takvim otomatik dolar',
    ],
  },
  {
    id: 'anamnez',
    label: 'Anamnez',
    icon: (
      <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></>
    ),
    color: '#16a34a',
    bg: 'rgba(22,163,74,0.12)',
    title: 'Dijital Anamnez Formu',
    tagline: 'Danışan seans öncesi kendi cihazından doldurur.',
    old: 'Kağıt form, ilk seansın 15 dakikası doldurmayla geçer.',
    benefits: [
      'QR veya WhatsApp linki ile danışana otomatik gönderilir',
      'Seans odasına girdiğinizde form ekranınızda hazır',
      'KVKK uyumlu, dijital imza ve açık rıza onayı ile',
      'Yanıtlar danışan profiline otomatik kaydedilir',
    ],
  },
  {
    id: 'soap',
    label: 'SOAP Notu',
    icon: (
      <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></>
    ),
    color: '#ca8a04',
    bg: 'rgba(202,138,4,0.12)',
    title: 'SOAP Seans Notu',
    tagline: 'Yapılandırılmış şablon: Subjective, Objective, Assessment, Plan.',
    old: 'Dağınık notlar, bir önceki seansı bulmak için sayfalar arasında kaybolmak.',
    benefits: [
      'Seans başlamadan şablon hazır, doldurmak dakika sürer',
      'Tüm seans geçmişi danışan profilinde kronolojik sırada',
      'Ödev takibi, bir sonraki seansta otomatik hatırlatma',
      'Notlara güvenli, şifreli erişim — KVKK uyumlu',
    ],
  },
  {
    id: 'odeme',
    label: 'Ödeme',
    icon: (
      <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>
    ),
    color: '#0284c7',
    bg: 'rgba(2,132,199,0.12)',
    title: 'Ücret & Ödeme Takibi',
    tagline: 'Bekleyen tahsilatları anlık görün, hiçbirini atlamayın.',
    old: 'Kim ödedi, kim borçlu? Excel, not defteri, ay sonunda sürpriz.',
    benefits: [
      'Her seans sonrası ödeme durumu tek tıkla işaretlenir',
      'Bekleyen ödemeler dashboard\'da sarı kart olarak görünür',
      'Aylık rapor: tahsil edilen, bekleyen, toplam gelir',
      'Danışan bazında seans ve ödeme geçmişi tek sayfada',
    ],
  },
  {
    id: 'profil',
    label: 'Profil',
    icon: (
      <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>
    ),
    color: '#4a7c6f',
    bg: 'rgba(74,124,111,0.12)',
    title: 'Kişisel Profil Sayfası',
    tagline: 'seansify.com/adınız — fotoğraf, uzmanlık, randevu butonu.',
    old: 'Instagram bio\'suna link atmak, sözlü randevu almak, yönlendirme karmaşası.',
    benefits: [
      'Kendi URL\'niz: seansify.com/adınız — anında paylaşılabilir',
      'Fotoğraf, uzmanlık alanı, seans ücreti, biyografi',
      'Ziyaretçi doğrudan online randevu alabilir',
      'Onaylı danışan yorumları profilinizde otomatik yayınlanır',
    ],
  },
  {
    id: 'bekleme',
    label: 'Bekleme Listesi',
    icon: (
      <><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></>
    ),
    color: '#ec4899',
    bg: 'rgba(236,72,153,0.12)',
    title: 'Bekleme Listesi',
    tagline: 'İptal olan saatlerde listeye otomatik teklif gider.',
    old: 'İptal geldi, boş saat kayboldu. Kimi arayacağını hatırlamak.',
    benefits: [
      'İptal anında bekleme listesine WA bildirimi gider',
      'İlk yanıt veren o saati alır, takvim otomatik dolar',
      'Boş saat kalması minimize edilir',
      'Siz hiçbir şey yapmadan doluluk artar',
    ],
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: (
      <><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></>
    ),
    color: '#ca8a04',
    bg: 'rgba(202,138,4,0.12)',
    title: 'Blog & İçerik',
    tagline: 'Uzmanlığını yayınla, organik olarak keşfedil.',
    old: 'Sosyal medyaya zaman harcamak, görünürlük sıfır, SEO yok.',
    benefits: [
      'seansify.com/adınız/blog adresinde kendinize ait blog',
      'Yazdığınız içerik Google\'da sizi öne çıkarır',
      'Uzmanlık alanınız okuyucuya somut olarak görünür',
      'Yeni danışanlar sizi blog üzerinden bulur',
    ],
  },
  {
    id: 'yorumlar',
    label: 'Yorumlar',
    icon: (
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ),
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    title: 'Danışan Yorumları',
    tagline: 'Seans sonrası otomatik yorum linki, onayladıkların profilinde.',
    old: 'Yorum toplamak için ayrıca uğraşmak, güven oluşturmak yıllar alır.',
    benefits: [
      'Seans tamamlanınca danışana otomatik yorum linki gider',
      'Siz onayladıkça yorumlar profilinizde yayınlanır',
      'Yeni danışanlar gerçek yorumları görerek güven duyar',
      'Google\'daki "psikolog yorumları" aramalarında öne çıkma',
    ],
  },
]

function DetailPanel({ feature }: { feature: typeof FEATURES[0] }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: '32px 36px',
        border: '1px solid #e2ece9',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 32,
        alignItems: 'start',
        height: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Sol: Başlık + Eski yöntem */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: feature.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={feature.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {feature.icon}
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0d1f18', lineHeight: 1.2 }}>{feature.title}</div>
            <div style={{ fontSize: 15, color: '#5a7a72', marginTop: 4 }}>{feature.tagline}</div>
          </div>
        </div>

        <div style={{ background: '#fff5f5', borderRadius: 12, padding: '16px 18px', border: '1px solid #fecaca' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#ef4444', marginBottom: 7 }}>ESKİ YÖNTEM</div>
          <div style={{ fontSize: 15, color: '#7f1d1d', lineHeight: 1.6 }}>{feature.old}</div>
        </div>
      </div>

      {/* Sağ: Faydalar */}
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: feature.color, marginBottom: 16 }}>SEANSİFY İLE</div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {feature.benefits.map((b, i) => (
            <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: feature.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <polyline points="2 6 5 9 10 3" stroke={feature.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span style={{ fontSize: 15, color: '#1e3d36', lineHeight: 1.6 }}>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DetailPanelMobile({ feature }: { feature: typeof FEATURES[0] }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: '20px', border: '1px solid #e2ece9', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: feature.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={feature.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {feature.icon}
          </svg>
        </div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#0d1f18' }}>{feature.title}</div>
          <div style={{ fontSize: 13, color: '#5a7a72', marginTop: 2 }}>{feature.tagline}</div>
        </div>
      </div>

      <div style={{ background: '#fff5f5', borderRadius: 10, padding: '12px 14px', marginBottom: 14, border: '1px solid #fecaca' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#ef4444', marginBottom: 5 }}>ESKİ YÖNTEM</div>
        <div style={{ fontSize: 13, color: '#7f1d1d', lineHeight: 1.55 }}>{feature.old}</div>
      </div>

      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: feature.color, marginBottom: 10 }}>SEANSİFY İLE</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {feature.benefits.map((b, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', background: feature.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <polyline points="2 6 5 9 10 3" stroke={feature.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span style={{ fontSize: 13, color: '#1e3d36', lineHeight: 1.55 }}>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const CYCLE_MS = 3500

export default function FeaturesCarousel() {
  const [active, setActive] = useState(0)
  const [progress, setProgress] = useState(0)
  const tabsRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const activeRef = useRef(0)

  const scrollTabIntoView = useCallback((index: number) => {
    const container = tabsRef.current
    if (!container) return
    const tab = container.children[index] as HTMLElement
    if (!tab) return
    const target = tab.offsetLeft - container.offsetWidth / 2 + tab.offsetWidth / 2
    container.scrollTo({ left: target, behavior: 'smooth' })
  }, [])

  const resetProgress = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current)
    setProgress(0)
    const startTime = Date.now()
    progressRef.current = setInterval(() => {
      setProgress(Math.min((Date.now() - startTime) / CYCLE_MS, 1))
    }, 40)
  }, [])

  const startCycle = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    resetProgress()
    intervalRef.current = setInterval(() => {
      const next = (activeRef.current + 1) % FEATURES.length
      activeRef.current = next
      setActive(next)
      scrollTabIntoView(next)
      resetProgress()
    }, CYCLE_MS)
  }, [resetProgress, scrollTabIntoView])

  useEffect(() => {
    startCycle()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (progressRef.current) clearInterval(progressRef.current)
    }
  }, [startCycle])

  const handleSelect = (i: number) => {
    activeRef.current = i
    setActive(i)
    startCycle()
  }

  const handlePrev = () => handleSelect((activeRef.current - 1 + FEATURES.length) % FEATURES.length)
  const handleNext = () => handleSelect((activeRef.current + 1) % FEATURES.length)


  const feature = FEATURES[active]

  return (
    <>
      {/* Tab bar + arrows */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        {/* Prev arrow */}
        <button
          onClick={handlePrev}
          aria-label="Önceki"
          style={{
            flexShrink: 0,
            width: 36, height: 36,
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Scrollable tabs */}
        <div
          ref={tabsRef}
          style={{
            flex: 1,
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 2,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          className="hide-scrollbar"
        >
          {FEATURES.map((f, i) => {
            const isActive = active === i
            return (
              <button
                key={f.id}
                onClick={() => handleSelect(i)}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '9px 16px',
                  borderRadius: 100,
                  border: isActive ? `1.5px solid ${f.color}` : '1.5px solid rgba(255,255,255,0.15)',
                  background: isActive ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? f.color : 'rgba(255,255,255,0.4)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {f.icon}
                </svg>
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Next arrow */}
        <button
          onClick={handleNext}
          aria-label="Sonraki"
          style={{
            flexShrink: 0,
            width: 36, height: 36,
            borderRadius: '50%',
            border: '1.5px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            outline: 'none',
            transition: 'all 0.15s',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            background: 'rgba(255,255,255,0.7)',
            borderRadius: 2,
            width: `${progress * 100}%`,
            transition: 'width 40ms linear',
          }}
        />
      </div>

      {/* Detail panel - desktop */}
      <div className="hidden md:block" style={{ height: 320, overflow: 'hidden' }}>
        <DetailPanel feature={feature} />
      </div>

      {/* Detail panel - mobile */}
      <div className="md:hidden" style={{ height: 460, overflow: 'hidden' }}>
        <DetailPanelMobile feature={feature} />
      </div>

      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </>
  )
}

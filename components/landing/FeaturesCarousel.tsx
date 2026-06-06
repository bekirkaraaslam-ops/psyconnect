'use client'

import { useState } from 'react'

const FEATURES = [
  {
    title: 'Akıllı Randevu Yönetimi',
    desc: 'Takvim entegrasyonu, çakışma önleme ve tek tıkla randevu oluşturma. Haftalık görünümde tüm planınızı yönetin.',
    bg: '#e8f5f1', iconColor: '#4a7c6f',
    iconPath: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  },
  {
    title: 'WhatsApp Otomasyonu',
    desc: 'Randevu hatırlatıcıları ve onay mesajları otomatik gönderilir. Hasta gelme oranını artırın, iptal oranını düşürün.',
    bg: '#e8f8ee', iconColor: '#25D366',
    iconPath: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>,
  },
  {
    title: 'Hasta Takibi',
    desc: 'Detaylı hasta profili, seans notları, ödev takibi ve iletişim geçmişi. Tüm bilgiler tek yerde, güvenle saklanır.',
    bg: '#f3eeff', iconColor: '#8b5cf6',
    iconPath: <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></>,
  },
  {
    title: 'Klinik Dashboard',
    desc: 'Gerçek zamanlı istatistikler, bugün/yarın timeline ve haftalık randevu sayıları. Kliniğinizin nabzını anlık takip edin.',
    bg: '#eff6ff', iconColor: '#3b82f6',
    iconPath: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  },
  {
    title: 'Yapay Zeka Asistan',
    desc: 'WhatsApp üzerinden 7/24 otomatik randevu alma. Hasta mesaj gönderir, sistem randevuyu oluşturur, siz onaylarsınız.',
    bg: '#fff7ed', iconColor: '#f59e0b',
    iconPath: <><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></>,
  },
  {
    title: 'Bekleme Listesi',
    desc: 'İptal olan randevularda bekleme listesindeki hastaya otomatik teklif gönderilir. Boş kalan saatler otomatik dolur.',
    bg: '#fff0f6', iconColor: '#ec4899',
    iconPath: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
  },
  {
    title: 'Dijital Anamnez Formu',
    desc: 'Hasta seans öncesinde QR linkle kendi cihazından anamnez formunu doldurur. Kağıt yok, kayıt kaybı yok, tüm bilgiler sistemde.',
    bg: '#f0fdf4', iconColor: '#16a34a',
    iconPath: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
  },
  {
    title: 'SOAP Seans Notu',
    desc: 'Yapılandırılmış seans notu şablonu: Subjective, Objective, Assessment, Plan. Her seans sonrası sistematik kayıt tutun.',
    bg: '#fefce8', iconColor: '#ca8a04',
    iconPath: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  },
  {
    title: 'Ücret ve Ödeme Takibi',
    desc: 'Her seans için ücret girin, ödeme durumunu takip edin. Bekleyen tahsilatları anında görün, hiçbir ödeme atlamayın.',
    bg: '#f0f9ff', iconColor: '#0284c7',
    iconPath: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  },
  {
    title: 'Kişisel Profil Sayfası',
    desc: 'Danışan adaylarına özel bir profil sayfanız olsun. seansify.com/adınız adresinde fotoğrafınız, uzmanlıklarınız ve randevu butonu.',
    bg: '#f0fdf4', iconColor: '#4a7c6f',
    iconPath: <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  },
  {
    title: 'Blog & İçerik Yönetimi',
    desc: 'Profil sayfanızda yayınlayabileceğiniz blog sistemi. Danışan adaylarına uzman kimliğinizi gösterin ve organik olarak keşfedilmeyi artırın.',
    bg: '#fefce8', iconColor: '#ca8a04',
    iconPath: <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></>,
  },
  {
    title: 'Danışan Değerlendirmeleri',
    desc: 'Seans sonrası danışana otomatik yorum linki gönderilir. Onayladığınız değerlendirmeler profil sayfanızda görünür.',
    bg: '#fff7ed', iconColor: '#f59e0b',
    iconPath: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  },
]

const PER_PAGE = 6

export default function FeaturesCarousel() {
  const pages = Math.ceil(FEATURES.length / PER_PAGE)
  const [current, setCurrent] = useState(0)

  const prev = () => setCurrent(p => Math.max(0, p - 1))
  const next = () => setCurrent(p => Math.min(pages - 1, p + 1))

  const visible = FEATURES.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE)

  return (
    <div>
      {/* Mobile: scroll-snap carousel */}
      <div
        className="flex md:hidden scrollbar-none"
        style={{
          overflowX: 'scroll',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch' as never,
          scrollbarWidth: 'none' as never,
        }}
      >
        {Array.from({ length: pages }).map((_, pageIdx) => {
          const page = FEATURES.slice(pageIdx * PER_PAGE, pageIdx * PER_PAGE + PER_PAGE)
          return (
            <div
              key={pageIdx}
              style={{
                minWidth: '100%', flexShrink: 0, scrollSnapAlign: 'start',
                display: 'flex', flexDirection: 'column', gap: '12px',
                paddingLeft: '24px', paddingRight: '24px',
                boxSizing: 'border-box',
              }}
            >
              {page.map((f) => (
                <div key={f.title} className="feature-card bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={f.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {f.iconPath}
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm mb-2" style={{ color: '#0d1f18' }}>{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: '#5a7a72' }}>{f.desc}</p>
                </div>
              ))}
              {/* Mobile dots */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', paddingTop: '8px' }}>
                {Array.from({ length: pages }).map((_, di) => (
                  <span key={di} style={{
                    width: di === pageIdx ? 20 : 6, height: 6, borderRadius: 3,
                    background: di === pageIdx ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                    transition: 'width 0.3s', display: 'inline-block',
                  }} />
                ))}
                {pageIdx < pages - 1 && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'arrowBounce 1.4s ease-in-out infinite', marginLeft: 4 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop: arrow carousel */}
      <div className="hidden md:block">
        {/* Cards row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {visible.map((f) => (
            <div key={f.title} className="feature-card bg-white rounded-2xl p-6" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: f.bg }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={f.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {f.iconPath}
                </svg>
              </div>
              <h3 className="font-bold text-sm mb-2" style={{ color: '#0d1f18' }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#5a7a72' }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 32 }}>
          <button
            onClick={prev}
            disabled={current === 0}
            style={{
              width: 42, height: 42, borderRadius: '50%',
              border: `1.5px solid ${current === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)'}`,
              background: current === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)',
              color: current === 0 ? 'rgba(255,255,255,0.2)' : 'white',
              cursor: current === 0 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', flexShrink: 0,
            }}
            aria-label="Önceki"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: i === current ? 28 : 8, height: 8, borderRadius: 4,
                  background: i === current ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.3s',
                }}
                aria-label={`Sayfa ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            disabled={current === pages - 1}
            style={{
              width: 42, height: 42, borderRadius: '50%',
              border: `1.5px solid ${current === pages - 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.5)'}`,
              background: current === pages - 1 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.15)',
              color: current === pages - 1 ? 'rgba(255,255,255,0.2)' : 'white',
              cursor: current === pages - 1 ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s', flexShrink: 0,
            }}
            aria-label="Sonraki"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
          {current + 1} / {pages}
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'

const tabs = [
  { key: 'dashboard', label: 'Genel Bakış' },
  { key: 'takvim', label: 'Takvim' },
  { key: 'randevular', label: 'Randevular' },
  { key: 'raporlar', label: 'Raporlar' },
]

function DashboardMockup() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F2', minHeight: 440, padding: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'Bugün', value: '3 Randevu', color: '#4a7c6f', bg: '#e8f5f1' },
          { label: 'Bu Hafta Gelir', value: '₺4.200', color: '#2563eb', bg: '#eff6ff' },
          { label: 'WhatsApp', value: '✓ Bağlı', color: '#16a34a', bg: '#dcfce7' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid #dde5e2' }}>
            <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #dde5e2', overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #dde5e2', fontSize: 12, fontWeight: 600, color: '#334155' }}>Bugünkü Randevular</div>
        {[
          { time: '10:00', name: 'Ayşe Kaya', type: 'Yüz yüze', status: 'Onaylı', statusColor: '#2563eb', statusBg: '#eff6ff' },
          { time: '13:30', name: 'Mehmet Yılmaz', type: 'Online', status: 'Bekliyor', statusColor: '#d97706', statusBg: '#fef3c7' },
          { time: '16:00', name: 'Zeynep Demir', type: 'Yüz yüze', status: 'Onaylı', statusColor: '#2563eb', statusBg: '#eff6ff' },
        ].map((apt, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', borderBottom: i < 2 ? '1px solid #f1f5f9' : undefined, gap: 10 }}>
            <div style={{ background: '#e8f5f1', borderRadius: 8, padding: '4px 8px', fontSize: 11, fontWeight: 600, color: '#4a7c6f', minWidth: 40, textAlign: 'center' }}>{apt.time}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>{apt.name}</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>{apt.type}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: apt.statusBg, color: apt.statusColor }}>{apt.status}</span>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #dde5e2', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>💬</div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>WhatsApp Hatırlatıcılar Gönderildi</div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>3 danışana otomatik hatırlatma iletildi</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 600, color: '#16a34a' }}>✓</div>
      </div>
    </div>
  )
}

function TakvimMockup() {
  const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum']
  const dates = [26, 27, 28, 29, 30]
  const todayIdx = 1

  const events = [
    { day: 0, slot: 1, name: 'Ayşe K.', color: '#4a7c6f', bg: '#e8f5f1' },
    { day: 1, slot: 0, name: 'Mehmet Y.', color: '#3b82f6', bg: '#eff6ff' },
    { day: 1, slot: 4, name: 'Zeynep D.', color: '#4a7c6f', bg: '#e8f5f1' },
    { day: 2, slot: 2, name: 'Ali Ç.', color: '#8b5cf6', bg: '#f3eeff' },
    { day: 3, slot: 5, name: 'Fatma S.', color: '#4a7c6f', bg: '#e8f5f1' },
    { day: 4, slot: 1, name: 'Can B.', color: '#ec4899', bg: '#fff0f6' },
  ]

  const slots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00']

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F2', minHeight: 440, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>26–30 Mayıs 2026</div>
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ background: '#fff', border: '1px solid #dde5e2', borderRadius: 6, padding: '2px 8px', fontSize: 10, color: '#64748b' }}>◀</div>
          <div style={{ background: '#4a7c6f', borderRadius: 6, padding: '2px 9px', fontSize: 10, color: '#fff', fontWeight: 600 }}>Bu Hafta</div>
          <div style={{ background: '#fff', border: '1px solid #dde5e2', borderRadius: 6, padding: '2px 8px', fontSize: 10, color: '#64748b' }}>▶</div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dde5e2', overflow: 'hidden' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '36px repeat(5, 1fr)', borderBottom: '1px solid #e8f0ed' }}>
          <div />
          {days.map((d, i) => (
            <div key={d} style={{ padding: '6px 2px', textAlign: 'center', borderLeft: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{d}</div>
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: i === todayIdx ? '#fff' : '#334155',
                background: i === todayIdx ? '#4a7c6f' : 'transparent',
                borderRadius: '50%', width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '2px auto 0',
              }}>{dates[i]}</div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        {slots.map((time, tIdx) => (
          <div key={time} style={{
            display: 'grid',
            gridTemplateColumns: '36px repeat(5, 1fr)',
            borderBottom: tIdx < slots.length - 1 ? '1px solid #f8fafc' : undefined,
            minHeight: 34,
          }}>
            <div style={{ padding: '8px 4px 0', fontSize: 8, color: '#94a3b8', textAlign: 'right' }}>{time}</div>
            {days.map((_, dIdx) => {
              const evt = events.find(e => e.day === dIdx && e.slot === tIdx)
              return (
                <div key={dIdx} style={{
                  padding: '2px 2px',
                  borderLeft: '1px solid #f1f5f9',
                  background: dIdx === todayIdx ? 'rgba(74,124,111,0.025)' : undefined,
                }}>
                  {evt && (
                    <div style={{
                      background: evt.bg,
                      borderLeft: `2px solid ${evt.color}`,
                      borderRadius: 3,
                      padding: '2px 4px',
                      fontSize: 9,
                      fontWeight: 600,
                      color: evt.color,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }}>{evt.name}</div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function RandevularMockup() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F2', minHeight: 440, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>Randevular</div>
        <div style={{ background: '#4a7c6f', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 600 }}>+ Yeni Randevu</div>
      </div>
      {[
        { date: '27 May, 10:00', name: 'Ayşe Kaya', type: 'Yüz yüze', seans: '5. Seans', status: 'Onaylı', statusColor: '#2563eb', statusBg: '#eff6ff', ucret: '₺600' },
        { date: '27 May, 13:30', name: 'Mehmet Yılmaz', type: 'Online', seans: '3. Seans', status: 'Bekliyor', statusColor: '#d97706', statusBg: '#fef3c7', ucret: '₺500' },
        { date: '28 May, 09:00', name: 'Zeynep Demir', type: 'Yüz yüze', seans: '1. Seans', status: 'Onaylı', statusColor: '#2563eb', statusBg: '#eff6ff', ucret: '₺650' },
        { date: '28 May, 11:30', name: 'Ali Çelik', type: 'Online', seans: '8. Seans', status: 'Tamamlandı', statusColor: '#4a7c6f', statusBg: '#e8f5f1', ucret: '₺500' },
      ].map((apt, i) => (
        <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #dde5e2', padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: '#e8f5f1', borderRadius: 8, padding: '6px 10px', textAlign: 'center', minWidth: 52 }}>
            <div style={{ fontSize: 10, color: '#4a7c6f', fontWeight: 600 }}>{apt.date.split(',')[0]}</div>
            <div style={{ fontSize: 13, color: '#0d1f18', fontWeight: 700 }}>{apt.date.split(',')[1]?.trim()}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{apt.name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>{apt.type} · {apt.seans}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 3 }}>{apt.ucret}</div>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: apt.statusBg, color: apt.statusColor }}>{apt.status}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

function RaporlarMockup() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#F0F4F2', minHeight: 440, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ background: '#fff', border: '1px solid #dde5e2', borderRadius: 8, padding: '5px 8px', fontSize: 11, color: '#64748b' }}>◀</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>Mayıs 2026</div>
        <div style={{ background: '#fff', border: '1px solid #dde5e2', borderRadius: 8, padding: '5px 8px', fontSize: 11, color: '#64748b' }}>▶</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 12 }}>
        {[
          { label: 'Tamamlanan Seans', value: '24', color: '#4a7c6f' },
          { label: 'Tahsil Edilen', value: '₺14.400', color: '#2563eb' },
          { label: 'Bekleyen Ödeme', value: '₺2.600', color: '#d97706' },
          { label: 'İptal / Gelmedi', value: '3', color: '#ef4444' },
        ].map(c => (
          <div key={c.label} style={{ background: '#fff', borderRadius: 10, padding: '10px 12px', border: '1px solid #dde5e2' }}>
            <div style={{ fontSize: 10, color: '#64748b', marginBottom: 4 }}>{c.label}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dde5e2', padding: '10px 12px', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#64748b', marginBottom: 6 }}>
          <span>Tahsil: <strong style={{ color: '#4a7c6f' }}>₺14.400</strong></span>
          <span>Toplam: <strong>₺17.000</strong></span>
        </div>
        <div style={{ background: '#dde5e2', borderRadius: 99, height: 6 }}>
          <div style={{ background: '#4a7c6f', borderRadius: 99, height: 6, width: '85%' }} />
        </div>
        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>%85 tahsil edildi</div>
      </div>
      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #dde5e2', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', padding: '7px 12px', borderBottom: '1px solid #f1f5f9', fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
          <span>Danışan</span><span>Tarih</span><span>Ödeme</span>
        </div>
        {[
          { name: 'Ayşe Kaya', date: '27 May', odeme: '✓ Ödendi', oColor: '#16a34a', oBg: '#dcfce7' },
          { name: 'Mehmet Yılmaz', date: '25 May', odeme: 'Bekliyor →', oColor: '#ca8a04', oBg: '#fef9c3' },
          { name: 'Zeynep Demir', date: '22 May', odeme: '✓ Ödendi', oColor: '#16a34a', oBg: '#dcfce7' },
        ].map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', padding: '8px 12px', borderBottom: i < 2 ? '1px solid #f1f5f9' : undefined, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>{row.name}</span>
            <span style={{ fontSize: 11, color: '#94a3b8' }}>{row.date}</span>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: row.oBg, color: row.oColor }}>{row.odeme}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const mockups: Record<string, React.ReactNode> = {
  dashboard: <DashboardMockup />,
  takvim: <TakvimMockup />,
  randevular: <RandevularMockup />,
  raporlar: <RaporlarMockup />,
}

export default function DemoTabs() {
  const [active, setActive] = useState('dashboard')

  return (
    <section className="py-20" style={{ background: '#f8fffe' }}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 scroll-reveal" style={{ color: '#0d1f18' }}>Sistemi Keşfedin</h2>
          <p className="text-sm md:text-base scroll-reveal" style={{ color: '#4a7c6f' }}>Klinik yönetiminizi Seansify ile nasıl dönüştüreceğinizi görün</p>
        </div>

        {/* Tab buttons */}
        <div className="flex justify-center gap-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActive(tab.key)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: active === tab.key ? '#4a7c6f' : '#fff',
                color: active === tab.key ? '#fff' : '#4a7c6f',
                border: `1px solid ${active === tab.key ? '#4a7c6f' : '#c8e6de'}`,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Browser frame */}
        <div className="rounded-2xl overflow-hidden shadow-xl" style={{ border: '1px solid #c8e6de' }}>
          {/* Browser chrome */}
          <div style={{ background: '#0d1f18', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', opacity: 0.7 }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', opacity: 0.7 }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', opacity: 0.7 }} />
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 10px', marginLeft: 8 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>seansify.com/{active}</span>
            </div>
          </div>

          {/* App chrome (sidebar + content) */}
          <div style={{ display: 'flex', background: '#fff', minHeight: 440 }}>
            {/* Mini sidebar */}
            <div style={{ width: 44, background: '#fff', borderRight: '1px solid #dde5e2', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 16, gap: 4 }}>
              <div style={{ width: 24, height: 24, borderRadius: 6, background: '#4a7c6f', marginBottom: 12 }} />
              {[
                { key: 'dashboard', label: '⊞' },
                { key: 'takvim', label: '📅' },
                { key: 'randevular', label: '📋' },
                { key: 'raporlar', label: '📊' },
              ].map(item => (
                <button
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: active === item.key ? '#4a7c6f' : 'transparent',
                    border: 'none', cursor: 'pointer', fontSize: 14,
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Page content */}
            <div key={active} style={{ flex: 1, overflow: 'hidden', animation: 'fadeInUp 0.22s ease forwards' }}>
              {mockups[active]}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

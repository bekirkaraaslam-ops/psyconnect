import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Seansify – Psikologlar için Klinik Yönetim'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: 'radial-gradient(ellipse at 50% 45%, #c8e6db 0%, #ddf0e9 35%, #edf7f3 70%, #f5faf8 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            fontSize: '14px',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#4a7c6f',
            fontWeight: 600,
            marginBottom: '28px',
          }}
        >
          PSİKOLOG YÖNETİM PLATFORMU
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: '96px',
            fontWeight: 800,
            color: '#0d1f18',
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            marginBottom: '8px',
          }}
        >
          Seansify
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '24px',
            fontWeight: 500,
            color: '#4a7c6f',
            letterSpacing: '0.02em',
            marginBottom: '36px',
          }}
        >
          Pratiğini otomatikleştir. Danışanlarına odaklan.
        </div>

        {/* Divider */}
        <div
          style={{
            width: '60px',
            height: '3px',
            background: 'rgba(74,124,111,0.4)',
            borderRadius: '2px',
            marginBottom: '36px',
          }}
        />

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: '32px',
            fontSize: '15px',
            color: '#1c3028',
            fontWeight: 500,
          }}
        >
          <span>WhatsApp Randevu</span>
          <span style={{ color: '#4a7c6f' }}>•</span>
          <span>Dijital Anamnez</span>
          <span style={{ color: '#4a7c6f' }}>•</span>
          <span>SOAP Seans Notu</span>
          <span style={{ color: '#4a7c6f' }}>•</span>
          <span>Ödeme Takibi</span>
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            fontSize: '13px',
            letterSpacing: '0.2em',
            color: 'rgba(74,124,111,0.5)',
            fontWeight: 600,
            textTransform: 'uppercase',
          }}
        >
          • &nbsp; SEANSIFY.COM &nbsp; •
        </div>
      </div>
    ),
    { ...size }
  )
}

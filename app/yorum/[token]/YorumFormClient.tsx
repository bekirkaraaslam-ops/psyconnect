'use client'

import { useState } from 'react'

interface Props {
  token: string
  yorumId: string
  alreadyFilled: boolean
  psychName: string
}

export default function YorumFormClient({ token, alreadyFilled, psychName }: Props) {
  const [yildiz, setYildiz] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [yorumMetni, setYorumMetni] = useState('')
  const [isimsiz, setIsimsiz] = useState(false)
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [err, setErr] = useState('')

  if (alreadyFilled || done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20 }}>
        <div style={{ maxWidth: 440, width: '100%', textAlign: 'center', background: '#fff', borderRadius: 20, padding: '40px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✓</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0d1f18', marginBottom: 8 }}>Teşekkürler!</h2>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
            Değerlendirmeniz başarıyla alındı. Geri bildiriminiz {psychName} için çok değerli.
          </p>
        </div>
      </div>
    )
  }

  async function handleSubmit() {
    if (yildiz === 0) { setErr('Lütfen bir yıldız seçin.'); return }
    setSending(true); setErr('')

    const res = await fetch('/api/yorum/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, yildiz, yorum_metni: yorumMetni || null, isimsiz }),
    })

    setSending(false)
    if (res.ok) {
      setDone(true)
    } else {
      const d = await res.json().catch(() => ({}))
      setErr(d.error ?? 'Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  const display = hovered || yildiz

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 20 }}>
      <div style={{ maxWidth: 480, width: '100%', background: '#fff', borderRadius: 20, padding: '40px 32px', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#e8f5f1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>
            💬
          </div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0d1f18', marginBottom: 8 }}>Seans Değerlendirmesi</h1>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>
            <strong style={{ color: '#0d1f18' }}>{psychName}</strong> ile olan seans deneyiminizi paylaşın.
          </p>
        </div>

        {/* Stars */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 12, textAlign: 'center' }}>Genel Değerlendirme</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {[1,2,3,4,5].map(i => (
              <button
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setYildiz(i)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  fontSize: 36, lineHeight: 1,
                  color: i <= display ? '#f59e0b' : '#e2e8f0',
                  transform: i <= display ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.1s',
                }}
              >
                ★
              </button>
            ))}
          </div>
          {yildiz > 0 && (
            <p style={{ textAlign: 'center', fontSize: 13, color: '#4a7c6f', fontWeight: 600, marginTop: 8 }}>
              {['', 'Çok kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'][yildiz]}
            </p>
          )}
        </div>

        {/* Yorum */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>
            Yorumunuz <span style={{ fontWeight: 400, color: '#94a3b8' }}>(isteğe bağlı)</span>
          </label>
          <textarea
            style={{
              width: '100%', padding: '12px', borderRadius: 12, fontSize: 13,
              border: '1px solid #dde5e2', color: '#334155', outline: 'none',
              background: '#f8fafc', resize: 'vertical', minHeight: 100, lineHeight: 1.6,
              boxSizing: 'border-box',
            }}
            value={yorumMetni}
            onChange={e => setYorumMetni(e.target.value)}
            placeholder="Deneyiminizi birkaç cümleyle anlatabilirsiniz..."
            maxLength={500}
          />
          <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'right', marginTop: 4 }}>{yorumMetni.length}/500</p>
        </div>

        {/* Isimsiz */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <input
            type="checkbox"
            id="isimsiz"
            checked={isimsiz}
            onChange={e => setIsimsiz(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: '#4a7c6f' }}
          />
          <label htmlFor="isimsiz" style={{ fontSize: 13, color: '#64748b', cursor: 'pointer' }}>
            İsmim görünmesin
          </label>
        </div>

        {err && <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 12, textAlign: 'center' }}>{err}</p>}

        <button
          onClick={handleSubmit}
          disabled={sending}
          style={{
            width: '100%', padding: '14px', borderRadius: 12, border: 'none',
            background: '#4a7c6f', color: '#fff', fontSize: 14, fontWeight: 700,
            cursor: sending ? 'not-allowed' : 'pointer', opacity: sending ? 0.7 : 1,
          }}
        >
          {sending ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#cbd5e1', marginTop: 16 }}>
          Gizliliğiniz korunur · Seansify
        </p>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'

const MSGS: { text: string; mine: boolean; delay: number }[] = [
  { text: 'Randevu almak istiyorum 🙏', mine: false, delay: 600 },
  { text: '📅 Müsait günler:\n\n1️⃣ Salı, 10 Haziran\n2️⃣ Çarşamba, 11 Haziran\n3️⃣ Perşembe, 12 Haziran\n\nTercih ettiğiniz günün numarasını yazın.', mine: true, delay: 1800 },
  { text: '1', mine: false, delay: 1200 },
  { text: '🕐 *Salı, 10 Haziran* için müsait saatler:\n\n1️⃣ 10:00\n2️⃣ 11:00\n3️⃣ 14:00\n\nTercih ettiğiniz saatin numarasını yazın.', mine: true, delay: 1600 },
  { text: '2', mine: false, delay: 1000 },
  { text: 'Seansınız nasıl gerçekleşecek?\n\n1️⃣ Yüz yüze\n2️⃣ Online', mine: true, delay: 1400 },
  { text: '1', mine: false, delay: 900 },
  { text: '✅ Randevu talebiniz alındı!\n\n📋 *Özet:*\n👤 Ayşe Yılmaz\n📅 Salı, 10 Haziran — 11:00\n🏢 Yüz yüze\n\nPsikoloğunuz onayladıktan sonra bildirim alacaksınız.', mine: true, delay: 1600 },
]

const TYPING_DURATION = 900
export const RESTART_DELAY = 3500

// toplam animasyon süresi — DemoTabs'ın ne kadar bekleyeceğini bilmesi için
export const WA_TOTAL_DURATION = (() => {
  let cursor = 0
  for (const msg of MSGS) {
    cursor += msg.delay
    if (msg.mine) cursor += TYPING_DURATION
  }
  return cursor + RESTART_DELAY
})()

export default function WaAnimasyonMockup({ isActive }: { isActive: boolean }) {
  const [visible, setVisible] = useState<number[]>([])
  const [typing, setTyping] = useState(false)
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const runningRef = useRef(false)
  const chatRef = useRef<HTMLDivElement>(null)

  function clearAll() {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }

  function runAnimation() {
    if (runningRef.current) return
    runningRef.current = true
    setVisible([])
    setTyping(false)

    let cursor = 0
    MSGS.forEach((msg, idx) => {
      const waitBefore = cursor
      cursor += msg.delay

      if (msg.mine) {
        timeoutsRef.current.push(setTimeout(() => setTyping(true), waitBefore))
        cursor += TYPING_DURATION
      }

      const showAt = msg.mine ? waitBefore + TYPING_DURATION : waitBefore
      timeoutsRef.current.push(
        setTimeout(() => {
          if (msg.mine) setTyping(false)
          setVisible(v => [...v, idx])
        }, showAt)
      )
    })

    timeoutsRef.current.push(
      setTimeout(() => {
        runningRef.current = false
        runAnimation()
      }, cursor + RESTART_DELAY)
    )
  }

  useEffect(() => {
    if (isActive) {
      clearAll()
      runningRef.current = false
      runAnimation()
    } else {
      clearAll()
      runningRef.current = false
      setVisible([])
      setTyping(false)
    }
    return clearAll
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive])

  // her yeni mesaj veya typing değişince en alta kaydır
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [visible, typing])

  const shownMsgs = MSGS.filter((_, i) => visible.includes(i))

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

        {/* scroll container — sabit yükseklik, yeni mesajda aşağı kayar */}
        <div
          ref={chatRef}
          style={{
            background: '#e5ddd5',
            padding: '10px 8px',
            height: 220,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            scrollBehavior: 'smooth',
          }}
        >
          {shownMsgs.map((msg, i) => (
            <div
              key={visible[i]}
              style={{
                maxWidth: '85%',
                marginLeft: msg.mine ? 'auto' : 0,
                flexShrink: 0,
                background: msg.mine ? '#dcf8c6' : '#fff',
                borderRadius: msg.mine ? '10px 0 10px 10px' : '0 10px 10px 10px',
                padding: '7px 9px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                animation: 'waMsgIn 0.2s ease forwards',
              }}
            >
              <div style={{ fontSize: 11, color: '#334155', whiteSpace: 'pre-line', lineHeight: 1.55 }}>{msg.text}</div>
              <div style={{ fontSize: 9, color: '#94a3b8', textAlign: 'right', marginTop: 2 }}>
                23:15{msg.mine ? ' ✓✓' : ''}
              </div>
            </div>
          ))}

          {typing && (
            <div style={{
              flexShrink: 0,
              width: 60,
              background: '#fff',
              borderRadius: '0 10px 10px 10px',
              padding: '10px 14px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              display: 'flex',
              gap: 4,
              alignItems: 'center',
            }}>
              {[0, 1, 2].map(d => (
                <div key={d} style={{
                  width: 6, height: 6, borderRadius: '50%', background: '#94a3b8',
                  animation: `waTyping 1.2s ease-in-out infinite`,
                  animationDelay: `${d * 0.2}s`,
                }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes waMsgIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes waTyping {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

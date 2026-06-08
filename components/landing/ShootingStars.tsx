'use client'

// Her yıldız farklı yönde: sağ-aşağı, sol-aşağı, sağ-yukarı, sol-yukarı
const STARS = [
  { top: '3%',   left: '18%',  angle: 44,   delay: '0s',   dur: '3.2s' }, // sağ-aşağı
  { top: '5%',   left: '75%',  angle: 136,  delay: '1.8s', dur: '2.8s' }, // sol-aşağı
  { top: '78%',  left: '8%',   angle: -42,  delay: '3.1s', dur: '3.6s' }, // sağ-yukarı
  { top: '70%',  left: '82%',  angle: -136, delay: '0.7s', dur: '2.6s' }, // sol-yukarı
  { top: '2%',   left: '48%',  angle: 52,   delay: '4.3s', dur: '3.0s' }, // sağ-aşağı dik
  { top: '10%',  left: '92%',  angle: 128,  delay: '2.5s', dur: '3.4s' }, // sol-aşağı geniş
  { top: '60%',  left: '3%',   angle: -36,  delay: '5.1s', dur: '2.9s' }, // sağ-yukarı yatık
]

export default function ShootingStars({ color = 'rgba(74,124,111,0.55)' }: { color?: string }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {STARS.map((s, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: 90,
            height: 1.5,
            borderRadius: 99,
            background: `linear-gradient(90deg, transparent 0%, ${color} 55%, rgba(110,231,183,0.9) 100%)`,
            opacity: 0,
            willChange: 'transform, opacity',
            animation: `ss${i} ${s.dur} ${s.delay} infinite`,
          }}
        />
      ))}
      <style>{`
        ${STARS.map((s, i) => `
          @keyframes ss${i} {
            0%   { transform: rotate(${s.angle}deg) translateX(-300px); opacity: 0; }
            5%   { opacity: 1; }
            75%  { opacity: 0.75; }
            100% { transform: rotate(${s.angle}deg) translateX(900px); opacity: 0; }
          }
        `).join('')}
      `}</style>
    </div>
  )
}

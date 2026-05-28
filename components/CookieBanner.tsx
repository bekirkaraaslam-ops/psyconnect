'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) {
      setVisible(true)
    }
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-3 md:p-4"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="max-w-2xl mx-auto bg-white rounded-2xl border p-4 flex items-start gap-4 shadow-lg"
        style={{ borderColor: '#dde5e2', pointerEvents: 'auto' }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#334155' }}>
            Bu site çerez kullanmaktadır
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: '#64748b' }}>
            Oturum yönetimi ve hizmet kalitesi için zorunlu çerezler kullanıyoruz.
            Ayrıntılar için{' '}
            <a href="/kvkk" style={{ color: '#4a7c6f' }} className="underline">
              KVKK Aydınlatma Metni
            </a>
            &apos;ni inceleyebilirsiniz.
          </p>
        </div>
        <button
          onClick={accept}
          className="shrink-0 text-sm font-semibold px-4 py-2 rounded-xl text-white"
          style={{ background: '#4a7c6f' }}
        >
          Kabul Et
        </button>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'

type Status = 'idle' | 'loading' | 'qr' | 'connected' | 'disconnected' | 'error'

export default function QRConnect({ isConnected }: { isConnected: boolean }) {
  const [status, setStatus] = useState<Status>(isConnected ? 'connected' : 'idle')
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }

  async function startConnection() {
    setStatus('loading')
    setQrDataUrl(null)
    setErrorMsg('')
    stopPolling()

    try {
      const res = await fetch('/api/whatsapp/qr', { method: 'POST' })
      if (!res.ok) throw new Error('Servis hatası')

      // Railway'den QR ve durum bilgisini her 2 saniyede bir sorgula
      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch('/api/whatsapp/qr')
          const data = await r.json()

          if (data.status === 'qr' && data.qr) {
            setQrDataUrl(data.qr)
            setStatus('qr')
          } else if (data.status === 'connected') {
            setStatus('connected')
            setQrDataUrl(null)
            stopPolling()
          } else if (data.status === 'disconnected') {
            setStatus('disconnected')
            stopPolling()
          }
        } catch {
          // polling hatası — sessizce devam et
        }
      }, 2000)

      // 3 dakika sonra timeout
      setTimeout(() => {
        if (pollRef.current) {
          stopPolling()
          setStatus('error')
          setErrorMsg('QR kod zaman aşımına uğradı. Lütfen tekrar deneyin.')
        }
      }, 180000)

    } catch (err: any) {
      setErrorMsg(err.message || 'Bağlantı hatası oluştu. Lütfen tekrar deneyin.')
      setStatus('error')
    }
  }

  async function handleDisconnect() {
    stopPolling()
    const res = await fetch('/api/whatsapp/disconnect', { method: 'POST' })
    if (res.ok) setStatus('idle')
  }

  useEffect(() => {
    return () => stopPolling()
  }, [])

  return (
    <div className="bg-white rounded-2xl border p-6 max-w-sm w-full" style={{ borderColor: '#dde5e2' }}>
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#e8f5f1' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a7c6f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <h2 className="font-semibold" style={{ color: '#334155' }}>WhatsApp Bağlantısı</h2>
          <p className="text-xs" style={{ color: '#94a3b8' }}>Kendi numaranızdan hatırlatıcı gönderin</p>
        </div>
      </div>

      {/* connected */}
      {status === 'connected' && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#dcfce7' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="font-medium mb-1" style={{ color: '#334155' }}>WhatsApp Bağlandı</p>
          <p className="text-sm mb-5" style={{ color: '#64748b' }}>Hatırlatıcılar aktif numaranızdan gönderilecek.</p>
          <button
            onClick={handleDisconnect}
            className="w-full py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-red-50"
            style={{ borderColor: '#fca5a5', color: '#dc2626' }}
          >
            Bağlantıyı Kes
          </button>
        </div>
      )}

      {/* idle / disconnected */}
      {(status === 'idle' || status === 'disconnected') && (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: '#f1f5f9' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          {status === 'disconnected' && (
            <p className="text-sm mb-3" style={{ color: '#dc2626' }}>Bağlantı kesildi.</p>
          )}
          <p className="text-sm mb-5" style={{ color: '#64748b' }}>
            WhatsApp hesabınızı bağlamak için QR kodu taratın.
          </p>
          <button
            onClick={startConnection}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: '#4a7c6f' }}
          >
            QR Kod Oluştur
          </button>
        </div>
      )}

      {/* loading */}
      {status === 'loading' && (
        <div className="text-center py-6">
          <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#4a7c6f', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: '#64748b' }}>QR kod hazırlanıyor...</p>
        </div>
      )}

      {/* qr */}
      {status === 'qr' && qrDataUrl && (
        <div className="text-center">
          <div className="p-3 rounded-2xl inline-block mb-4" style={{ background: '#f8fafc' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="WhatsApp QR" width={200} height={200} className="rounded-lg" />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: '#334155' }}>QR Kodu Taratın</p>
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            WhatsApp → Bağlı Cihazlar → Cihaz Bağla
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: '#94a3b8' }}>
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Taranmayı bekleniyor...
          </div>
        </div>
      )}

      {/* error */}
      {status === 'error' && (
        <div className="text-center">
          <p className="text-sm mb-4" style={{ color: '#dc2626' }}>{errorMsg}</p>
          <button onClick={startConnection} className="w-full py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#4a7c6f' }}>
            Tekrar Dene
          </button>
        </div>
      )}

      {(status === 'idle' || status === 'qr') && (
        <div className="mt-5 pt-5 border-t" style={{ borderColor: '#f1f5f9' }}>
          <p className="text-xs" style={{ color: '#94a3b8' }}>
            Oturum bilgileriniz şifreli olarak saklanır. Bir kez bağlandıktan sonra tekrar QR taramanıza gerek kalmaz.
          </p>
        </div>
      )}
    </div>
  )
}

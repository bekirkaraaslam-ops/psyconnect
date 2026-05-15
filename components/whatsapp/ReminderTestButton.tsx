'use client'

import { useState } from 'react'

export default function ReminderTestButton() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  async function handleTest() {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/reminders/test', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setResult({ ok: true, message: data.message })
      } else {
        setResult({ ok: false, message: data.error })
      }
    } catch {
      setResult({ ok: false, message: 'Bağlantı hatası' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-2">
      <button
        onClick={handleTest}
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity disabled:opacity-60"
        style={{ background: '#0ea5e9' }}
      >
        {loading ? 'Gönderiliyor...' : 'Test Hatırlatıcısı Gönder'}
      </button>
      {result && (
        <p className={`text-sm text-center px-3 py-2 rounded-lg ${result.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {result.message}
        </p>
      )}
      <p className="text-xs text-center" style={{ color: '#94a3b8' }}>
        Sistemdeki ilk gelecek randevu için test mesajı gönderir
      </p>
    </div>
  )
}

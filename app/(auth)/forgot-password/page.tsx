'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <>
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#dcfce7' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#334155' }}>E-posta gönderildi</h2>
          <p className="text-sm" style={{ color: '#64748b' }}>
            <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik. Gelen kutunuzu kontrol edin.
          </p>
        </div>
        <Link
          href="/login"
          className="block w-full py-2.5 rounded-lg text-sm font-medium text-center"
          style={{ background: '#f1f5f9', color: '#334155' }}
        >
          Giriş sayfasına dön
        </Link>
      </>
    )
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-2" style={{ color: '#334155' }}>Şifremi Unuttum</h2>
      <p className="text-sm mb-6" style={{ color: '#64748b' }}>
        E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>E-posta</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-150"
            style={{ borderColor: '#dde5e2', color: '#334155' }}
            placeholder="ornek@mail.com"
            onFocus={e => { e.target.style.borderColor = '#4a7c6f'; e.target.style.boxShadow = '0 0 0 3px rgba(74,124,111,0.12)' }}
            onBlur={e => { e.target.style.borderColor = '#dde5e2'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #4a7c6f 0%, #2a5446 100%)' }}
        >
          {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: '#64748b' }}>
        <Link href="/login" className="font-medium" style={{ color: '#4a7c6f' }}>
          Giriş sayfasına dön
        </Link>
      </p>
    </>
  )
}

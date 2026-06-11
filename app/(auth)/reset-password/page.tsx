'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Şifreler eşleşmiyor.')
      return
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    setLoading(false)
    if (error) {
      setError('Şifre güncellenemedi. Bağlantınızın süresi dolmuş olabilir, tekrar deneyin.')
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-2" style={{ color: '#334155' }}>Yeni Şifre Belirle</h2>
      <p className="text-sm mb-6" style={{ color: '#64748b' }}>
        Hesabınız için yeni bir şifre girin.
      </p>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Yeni Şifre</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-150"
            style={{ borderColor: '#dde5e2', color: '#334155' }}
            placeholder="••••••••"
            onFocus={e => { e.target.style.borderColor = '#4a7c6f'; e.target.style.boxShadow = '0 0 0 3px rgba(74,124,111,0.12)' }}
            onBlur={e => { e.target.style.borderColor = '#dde5e2'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Şifre Tekrar</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-150"
            style={{ borderColor: '#dde5e2', color: '#334155' }}
            placeholder="••••••••"
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
          {loading ? 'Kaydediliyor...' : 'Şifremi Güncelle'}
        </button>
      </form>
    </>
  )
}

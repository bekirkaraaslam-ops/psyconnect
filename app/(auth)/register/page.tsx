'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function RegisterForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/upgrade')
    router.refresh()
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-6" style={{ color: '#334155' }}>Kayıt Ol</h2>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>
            Ad Soyad
          </label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-150"
            style={{ borderColor: '#dde5e2', color: '#334155' }}
            placeholder="Dr. Ayşe Yılmaz"
            onFocus={e => { e.target.style.borderColor = '#4a7c6f'; e.target.style.boxShadow = '0 0 0 3px rgba(74,124,111,0.12)' }}
            onBlur={e => { e.target.style.borderColor = '#dde5e2'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>
            E-posta
          </label>
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

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>
            Şifre
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-150"
            style={{ borderColor: '#dde5e2', color: '#334155' }}
            placeholder="En az 6 karakter"
            onFocus={e => { e.target.style.borderColor = '#4a7c6f'; e.target.style.boxShadow = '0 0 0 3px rgba(74,124,111,0.12)' }}
            onBlur={e => { e.target.style.borderColor = '#dde5e2'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #4a7c6f 0%, #2a5446 100%)' }}
        >
          {loading && <span className="btn-spinner" />}
          {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm" style={{ color: '#64748b' }}>
        Hesabın var mı?{' '}
        <Link href="/login" className="font-medium" style={{ color: '#4a7c6f' }}>
          Giriş Yap
        </Link>
      </p>
    </>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  )
}

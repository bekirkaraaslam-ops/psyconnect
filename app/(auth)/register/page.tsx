'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setReferralCode(ref.toUpperCase())
  }, [searchParams])

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
          referral_code: referralCode.trim().toUpperCase() || undefined,
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
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
            style={{ borderColor: '#dde5e2', color: '#334155' }}
            placeholder="Dr. Ayşe Yılmaz"
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
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
            style={{ borderColor: '#dde5e2', color: '#334155' }}
            placeholder="ornek@mail.com"
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
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
            style={{ borderColor: '#dde5e2', color: '#334155' }}
            placeholder="En az 6 karakter"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>
            Referral Kodu{' '}
            <span className="font-normal" style={{ color: '#94a3b8' }}>(opsiyonel)</span>
          </label>
          <input
            type="text"
            value={referralCode}
            onChange={e => setReferralCode(e.target.value.toUpperCase())}
            maxLength={8}
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none font-mono tracking-widest"
            style={{ borderColor: '#dde5e2', color: '#334155' }}
            placeholder="XXXXXXXX"
          />
          {referralCode && (
            <p className="text-xs mt-1" style={{ color: '#4a7c6f' }}>
              İlk ay %10 indirim kazanacaksın.
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-60"
          style={{ background: '#4a7c6f' }}
        >
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

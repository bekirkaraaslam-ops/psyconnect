'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

function getPasswordStrength(pw: string): 0 | 1 | 2 | 3 | 4 {
  if (pw.length === 0) return 0
  if (pw.length < 6) return 1
  let score = 1
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return Math.min(score, 4) as 0 | 1 | 2 | 3 | 4
}

const STRENGTH_LABEL = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü']
const STRENGTH_COLOR = ['', '#ef4444', '#f97316', '#84cc16', '#22c55e']

const PLAN_LABELS: Record<string, { name: string; price: string; color: string; bg: string }> = {
  one: { name: 'Seansify One', price: '749 ₺/ay', color: '#4a7c6f', bg: '#e8f5f1' },
  pro: { name: 'Seansify Pro', price: '1.850 ₺/ay', color: '#ffffff', bg: '#4a7c6f' },
}

const inputClass = 'w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-150'
const inputStyle = { borderColor: '#dde5e2', color: '#334155' }
const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = '#4a7c6f'
  e.target.style.boxShadow = '0 0 0 3px rgba(74,124,111,0.12)'
}
const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = '#dde5e2'
  e.target.style.boxShadow = 'none'
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') ?? ''
  const planInfo = PLAN_LABELS[plan] ?? null

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const strength = getPasswordStrength(password)

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
          phone_number: phone,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push(plan ? `/upgrade?plan=${plan}` : '/upgrade')
    router.refresh()
  }

  return (
    <>
      <h2 className="text-xl font-semibold mb-4" style={{ color: '#334155' }}>Kayıt Ol</h2>

      {planInfo && (
        <div className="mb-5 px-4 py-3 rounded-xl flex items-center justify-between gap-3" style={{ background: planInfo.bg, border: `1.5px solid ${planInfo.color === '#ffffff' ? '#4a7c6f' : planInfo.color}` }}>
          <div>
            <p className="text-xs font-medium" style={{ color: planInfo.color === '#ffffff' ? 'rgba(255,255,255,0.75)' : '#4a7c6f' }}>Seçilen plan</p>
            <p className="text-sm font-bold" style={{ color: planInfo.color === '#ffffff' ? '#ffffff' : '#0d1f18' }}>{planInfo.name}</p>
          </div>
          <p className="text-sm font-semibold whitespace-nowrap" style={{ color: planInfo.color === '#ffffff' ? '#ffffff' : '#4a7c6f' }}>{planInfo.price}</p>
        </div>
      )}

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Ad Soyad</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
            placeholder="Dr. Ayşe Yılmaz"
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Telefon Numarası</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
            placeholder="05XX XXX XX XX"
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>E-posta</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className={inputClass}
            style={inputStyle}
            placeholder="ornek@mail.com"
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Şifre</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className={inputClass}
            style={inputStyle}
            placeholder="En az 6 karakter"
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {password.length > 0 && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map(i => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-all duration-300"
                    style={{ background: i <= strength ? STRENGTH_COLOR[strength] : '#e2e8f0' }}
                  />
                ))}
              </div>
              <p className="text-xs" style={{ color: STRENGTH_COLOR[strength] }}>
                {STRENGTH_LABEL[strength]}
              </p>
            </div>
          )}
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

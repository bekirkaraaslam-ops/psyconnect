'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  psychologist: {
    id: string
    full_name: string
    phone_number: string | null
  } | null
  email: string
}

export default function SettingsForm({ psychologist, email }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState(psychologist?.full_name ?? '')
  const [phone, setPhone] = useState(psychologist?.phone_number ?? '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const supabase = createClient()
    const { error } = await supabase
      .from('psychologists')
      .update({ full_name: fullName, phone_number: phone })
      .eq('id', psychologist!.id)

    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border p-5 space-y-5" style={{ borderColor: '#dde5e2' }}>
      <h3 className="font-semibold" style={{ color: '#334155' }}>Profil Bilgileri</h3>

      {success && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ background: '#dcfce7', color: '#16a34a' }}>
          Bilgileriniz güncellendi.
        </div>
      )}
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>E-posta</label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm"
          style={{ borderColor: '#dde5e2', color: '#94a3b8', background: '#f8fafc' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Ad Soyad</label>
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Telefon</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
          placeholder="0532 123 45 67"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60"
        style={{ background: '#4a7c6f' }}
      >
        {loading ? 'Kaydediliyor...' : 'Kaydet'}
      </button>
    </form>
  )
}

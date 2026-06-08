'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  psychologistId: string
  initialName: string
  initialPhone: string
  initialUcret: number | null
}

type Step = 1 | 2 | 3

const inputBase = 'w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-150'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>{label}</label>
      {children}
    </div>
  )
}

export default function SetupWizard({ psychologistId, initialName, initialPhone, initialUcret }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)

  const [fullName, setFullName] = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [ucret, setUcret] = useState(initialUcret != null ? String(initialUcret) : '')
  const [saving1, setSaving1] = useState(false)
  const [error1, setError1] = useState('')

  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [saving2, setSaving2] = useState(false)
  const [error2, setError2] = useState('')

  async function handleStep1() {
    if (!fullName.trim()) { setError1('Ad soyad zorunludur.'); return }
    setSaving1(true); setError1('')
    const supabase = createClient()
    const { error } = await supabase
      .from('psychologists')
      .update({
        full_name: fullName.trim(),
        phone_number: phone.trim() || null,
        varsayilan_seans_ucreti: ucret ? Number(ucret) : null,
      })
      .eq('id', psychologistId)
    setSaving1(false)
    if (error) { setError1(error.message); return }
    setStep(2)
  }

  async function markComplete() {
    await fetch('/api/setup/complete', { method: 'POST' })
    setStep(3)
  }

  async function handleStep2() {
    if (!patientName.trim() || !patientPhone.trim()) {
      setError2('Ad soyad ve telefon zorunludur.'); return
    }
    setSaving2(true); setError2('')
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name_surname: patientName.trim(), phone_number: patientPhone.trim() }),
    })
    setSaving2(false)
    if (!res.ok) {
      const d = await res.json()
      setError2(d.error ?? 'Hata oluştu.'); return
    }
    await markComplete()
  }

  function goToDashboard() {
    router.push('/dashboard')
    router.refresh()
  }

  const stepLabels = ['Profil', 'İlk Danışan', 'Hazırsın']

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
        <span className="font-semibold text-sm" style={{ color: '#0d1f18' }}>🌿 Seansify</span>
        {step < 3 && (
          <button
            onClick={markComplete}
            className="text-xs"
            style={{ color: '#94a3b8' }}
          >
            Şimdi atla →
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex items-center justify-center gap-2 py-8">
        {stepLabels.map((label, i) => {
          const s = i + 1
          const active = step === s
          const done = step > s
          return (
            <div key={s} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300"
                  style={{
                    background: done ? '#4a7c6f' : active ? '#4a7c6f' : '#e2e8f0',
                    color: done || active ? '#fff' : '#94a3b8',
                  }}
                >
                  {done ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : s}
                </div>
                <span className="text-xs font-medium" style={{ color: active ? '#334155' : '#94a3b8' }}>
                  {label}
                </span>
              </div>
              {s < 3 && (
                <div
                  className="w-12 h-0.5 mb-5 transition-all duration-300"
                  style={{ background: step > s ? '#4a7c6f' : '#e2e8f0' }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4">
        <div className="w-full max-w-2xl">

          {/* ─── Step 1: Profil ─── */}
          {step === 1 && (
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
              <div className="md:flex">
                {/* Sol — açıklama */}
                <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-center" style={{ background: 'linear-gradient(160deg, #f0f7f5, #e8f5f2)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: '#4a7c6f' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: '#0d1f18' }}>Seni tanıyalım</h2>
                  <p className="text-sm leading-relaxed" style={{ color: '#4a7c6f' }}>
                    Adın ve seans ücretin, danışanların göreceği booking sayfanda görünür. Şimdi ekle, istediğinde değiştir.
                  </p>
                </div>

                {/* Sağ — form */}
                <div className="md:flex-1 p-6 md:p-8 space-y-4">
                  <Field label="Ad Soyad *">
                    <input
                      className={inputBase}
                      style={{ borderColor: '#dde5e2', color: '#334155' }}
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="Dr. Ayşe Yılmaz"
                      onFocus={e => { e.target.style.borderColor = '#4a7c6f'; e.target.style.boxShadow = '0 0 0 3px rgba(74,124,111,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = '#dde5e2'; e.target.style.boxShadow = 'none' }}
                    />
                  </Field>

                  <Field label="Telefon Numarası">
                    <input
                      className={inputBase}
                      style={{ borderColor: '#dde5e2', color: '#334155' }}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      onFocus={e => { e.target.style.borderColor = '#4a7c6f'; e.target.style.boxShadow = '0 0 0 3px rgba(74,124,111,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = '#dde5e2'; e.target.style.boxShadow = 'none' }}
                    />
                  </Field>

                  <Field label="Varsayılan Seans Ücreti (₺)">
                    <input
                      className={inputBase}
                      style={{ borderColor: '#dde5e2', color: '#334155' }}
                      type="number"
                      value={ucret}
                      onChange={e => setUcret(e.target.value)}
                      placeholder="1500"
                      onFocus={e => { e.target.style.borderColor = '#4a7c6f'; e.target.style.boxShadow = '0 0 0 3px rgba(74,124,111,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = '#dde5e2'; e.target.style.boxShadow = 'none' }}
                    />
                  </Field>

                  {error1 && (
                    <p className="text-xs" style={{ color: '#dc2626' }}>{error1}</p>
                  )}

                  <button
                    onClick={handleStep1}
                    disabled={saving1}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60 transition-all"
                    style={{ background: 'linear-gradient(135deg, #4a7c6f, #2a5446)' }}
                  >
                    {saving1 ? 'Kaydediliyor...' : 'Devam Et →'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 2: İlk Hasta ─── */}
          {step === 2 && (
            <div className="rounded-2xl overflow-hidden border" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
              <div className="md:flex">
                <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-center" style={{ background: 'linear-gradient(160deg, #f0f7f5, #e8f5f2)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: '#4a7c6f' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold mb-2" style={{ color: '#0d1f18' }}>İlk danışanını ekle</h2>
                  <p className="text-sm leading-relaxed" style={{ color: '#4a7c6f' }}>
                    Sistemin çalışması için en az bir danışan gerekir. Hemen ekle, istersen randevu da oluşturalım.
                  </p>
                </div>

                <div className="md:flex-1 p-6 md:p-8 space-y-4">
                  <Field label="Ad Soyad *">
                    <input
                      className={inputBase}
                      style={{ borderColor: '#dde5e2', color: '#334155' }}
                      value={patientName}
                      onChange={e => setPatientName(e.target.value)}
                      placeholder="Ahmet Yıldız"
                      onFocus={e => { e.target.style.borderColor = '#4a7c6f'; e.target.style.boxShadow = '0 0 0 3px rgba(74,124,111,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = '#dde5e2'; e.target.style.boxShadow = 'none' }}
                    />
                  </Field>

                  <Field label="Telefon *">
                    <input
                      className={inputBase}
                      style={{ borderColor: '#dde5e2', color: '#334155' }}
                      value={patientPhone}
                      onChange={e => setPatientPhone(e.target.value)}
                      placeholder="05XX XXX XX XX"
                      onFocus={e => { e.target.style.borderColor = '#4a7c6f'; e.target.style.boxShadow = '0 0 0 3px rgba(74,124,111,0.1)' }}
                      onBlur={e => { e.target.style.borderColor = '#dde5e2'; e.target.style.boxShadow = 'none' }}
                    />
                  </Field>

                  {error2 && (
                    <p className="text-xs" style={{ color: '#dc2626' }}>{error2}</p>
                  )}

                  <button
                    onClick={handleStep2}
                    disabled={saving2}
                    className="w-full py-2.5 rounded-xl text-sm font-medium text-white disabled:opacity-60 transition-all"
                    style={{ background: 'linear-gradient(135deg, #4a7c6f, #2a5446)' }}
                  >
                    {saving2 ? 'Ekleniyor...' : 'Danışan Ekle ve Devam Et →'}
                  </button>

                  <button
                    onClick={markComplete}
                    className="w-full py-2 text-xs"
                    style={{ color: '#94a3b8' }}
                  >
                    Şimdi atla, daha sonra eklerim
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Step 3: Tamamlandı ─── */}
          {step === 3 && (
            <div className="rounded-2xl border text-center p-10 md:p-14" style={{ borderColor: '#e2e8f0', background: '#fff' }}>
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, #4a7c6f, #2a5446)' }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>

              <h2 className="text-xl font-semibold mb-2" style={{ color: '#0d1f18' }}>
                Sistem hazır!
              </h2>
              <p className="text-sm mb-8" style={{ color: '#64748b' }}>
                Her şey yerli yerinde. Dashboard'dan tüm özelliklere ulaşabilirsin.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={goToDashboard}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #4a7c6f, #2a5446)' }}
                >
                  Dashboard'a Git →
                </button>
                <a
                  href="/appointments/new"
                  className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all border"
                  style={{ color: '#4a7c6f', borderColor: '#d1fae5', background: '#f0fdf4' }}
                >
                  İlk Randevuyu Oluştur
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alt boşluk */}
      <div className="h-16" />
    </div>
  )
}

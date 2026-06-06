'use client'

import { useState } from 'react'

interface Option {
  value: number
  label: string
}

interface Question {
  text: string
}

interface ScoringRules {
  options: Option[]
}

interface Props {
  token: string
  patientName: string
  scaleName: string
  scaleSlug: string
  instructions: string
  questions: Question[]
  scoringRules: ScoringRules
}

export default function OlcekFormClient({
  token,
  patientName,
  scaleName,
  instructions,
  questions,
  scoringRules,
}: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  )
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const options: Option[] = scoringRules.options ?? []
  const answered = answers.filter(a => a !== null).length
  const total = questions.length
  const allAnswered = answered === total

  function setAnswer(qIdx: number, val: number) {
    setAnswers(prev => {
      const next = [...prev]
      next[qIdx] = val
      return next
    })
  }

  async function handleSubmit() {
    if (!allAnswered) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/olcek/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, answers }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Bir hata oluştu.')
      setDone(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#f0fdf4' }}>
        <div className="bg-white rounded-2xl border p-8 max-w-sm w-full text-center" style={{ borderColor: '#dde5e2' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#dcfce7' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="font-semibold text-base mb-1" style={{ color: '#334155' }}>Yanıtlarınız alındı</p>
          <p className="text-sm" style={{ color: '#64748b' }}>Psikoloğunuz sonuçları sizinle paylaşacaktır.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b" style={{ background: '#ffffff', borderColor: '#e2e8f0' }}>
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: '#4a7c6f' }}>Seansify</p>
            <p className="text-sm font-semibold truncate" style={{ color: '#334155' }}>{scaleName}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs" style={{ color: '#94a3b8' }}>{answered} / {total}</p>
            <div className="w-24 h-1.5 rounded-full mt-1" style={{ background: '#e2e8f0' }}>
              <div
                className="h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(answered / total) * 100}%`, background: '#4a7c6f' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-5">
        {/* Karşılama */}
        <div className="bg-white rounded-2xl border p-5" style={{ borderColor: '#dde5e2' }}>
          <p className="text-sm font-medium mb-1" style={{ color: '#334155' }}>
            {patientName ? `Merhaba ${patientName.split(' ')[0]},` : 'Merhaba,'}
          </p>
          <p className="text-sm" style={{ color: '#64748b' }}>{instructions}</p>
          <p className="text-xs mt-2" style={{ color: '#94a3b8' }}>
            Lütfen her soruyu dürüstçe yanıtlayın. Doğru ya da yanlış cevap yoktur.
          </p>
        </div>

        {/* Sorular */}
        {questions.map((q, qi) => (
          <div key={qi} className="bg-white rounded-2xl border p-5" style={{ borderColor: answers[qi] !== null ? '#4a7c6f' : '#dde5e2' }}>
            <p className="text-xs font-medium mb-3" style={{ color: '#94a3b8' }}>SORU {qi + 1}</p>
            <p className="text-sm font-medium mb-4 leading-relaxed" style={{ color: '#334155' }}>{q.text}</p>
            <div className="space-y-2">
              {options.map((opt) => {
                const selected = answers[qi] === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => setAnswer(qi, opt.value)}
                    className="w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all"
                    style={{
                      background: selected ? '#e8f5f1' : '#f8fafc',
                      border: `1.5px solid ${selected ? '#4a7c6f' : '#e2e8f0'}`,
                      color: selected ? '#1a4035' : '#475569',
                      fontWeight: selected ? 500 : 400,
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center"
                        style={{ borderColor: selected ? '#4a7c6f' : '#cbd5e1' }}
                      >
                        {selected && (
                          <span className="w-2 h-2 rounded-full" style={{ background: '#4a7c6f' }} />
                        )}
                      </span>
                      {opt.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {/* Hata */}
        {error && (
          <div className="px-4 py-3 rounded-xl text-sm" style={{ background: '#fee2e2', color: '#dc2626' }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2"
          style={{
            background: allAnswered ? 'linear-gradient(135deg, #4a7c6f 0%, #2a5446 100%)' : '#e2e8f0',
            color: allAnswered ? '#ffffff' : '#94a3b8',
            cursor: allAnswered ? 'pointer' : 'not-allowed',
          }}
        >
          {loading && (
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          )}
          {loading ? 'Gönderiliyor...' : !allAnswered ? `${total - answered} soru kaldı` : 'Yanıtları Gönder'}
        </button>

        <p className="text-center text-xs pb-4" style={{ color: '#94a3b8' }}>
          Yanıtlarınız güvenli şekilde şifreli olarak saklanır.
        </p>
      </div>
    </div>
  )
}

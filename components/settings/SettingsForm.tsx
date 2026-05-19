'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { normalizePhone } from '@/lib/utils'

interface Props {
  psychologist: {
    id: string
    full_name: string
    phone_number: string | null
    klinik_adresi: string | null
    harita_linki: string | null
    online_gorusme_linki: string | null
    hosgeldiniz_mesaji: string | null
    work_start_hour: number | null
    work_end_hour: number | null
    work_days: string[] | null
  } | null
  email: string
}

const ALL_DAYS = [
  { key: 'pazartesi', label: 'Pzt' },
  { key: 'salı', label: 'Sal' },
  { key: 'çarşamba', label: 'Çar' },
  { key: 'perşembe', label: 'Per' },
  { key: 'cuma', label: 'Cum' },
  { key: 'cumartesi', label: 'Cmt' },
  { key: 'pazar', label: 'Paz' },
]

export default function SettingsForm({ psychologist, email }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState(psychologist?.full_name ?? '')
  const [phone, setPhone] = useState(psychologist?.phone_number ?? '')
  const [klinikAdresi, setKlinikAdresi] = useState(psychologist?.klinik_adresi ?? '')
  const [haritaLinki, setHaritaLinki] = useState(psychologist?.harita_linki ?? '')
  const [onlineGorusmeLinki, setOnlineGorusmeLinki] = useState(psychologist?.online_gorusme_linki ?? '')
  const [hosgeldinizMesaji, setHosgeldinizMesaji] = useState(psychologist?.hosgeldiniz_mesaji ?? '')
  const [workStartHour, setWorkStartHour] = useState(psychologist?.work_start_hour ?? 9)
  const [workEndHour, setWorkEndHour] = useState(psychologist?.work_end_hour ?? 18)
  const [workDays, setWorkDays] = useState<string[]>(
    psychologist?.work_days ?? ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma']
  )
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
      .update({
        full_name: fullName,
        phone_number: phone ? normalizePhone(phone) : null,
        klinik_adresi: klinikAdresi || null,
        harita_linki: haritaLinki || null,
        online_gorusme_linki: onlineGorusmeLinki || null,
        hosgeldiniz_mesaji: hosgeldinizMesaji || null,
        work_start_hour: workStartHour,
        work_end_hour: workEndHour,
        work_days: workDays,
      })
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

      <h3 className="font-semibold pt-1" style={{ color: '#334155' }}>Klinik Bilgileri</h3>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Klinik Adresi</label>
        <textarea
          rows={3}
          value={klinikAdresi}
          onChange={e => setKlinikAdresi(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none resize-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Harita Linki (Google Maps vb.)</label>
        <input
          type="text"
          value={haritaLinki}
          onChange={e => setHaritaLinki(e.target.value)}
          placeholder="https://maps.google.com/..."
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Online Görüşme Linki (Zoom/Meet)</label>
        <input
          type="text"
          value={onlineGorusmeLinki}
          onChange={e => setOnlineGorusmeLinki(e.target.value)}
          placeholder="https://zoom.us/j/..."
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
        />
      </div>

      <h3 className="font-semibold pt-1" style={{ color: '#334155' }}>Mesai Saatleri</h3>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Mesai Başlangıcı</label>
          <select
            value={workStartHour}
            onChange={e => setWorkStartHour(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
            style={{ borderColor: '#dde5e2', color: '#334155' }}
          >
            {Array.from({ length: 17 }, (_, i) => i + 6).map(h => (
              <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Mesai Bitişi</label>
          <select
            value={workEndHour}
            onChange={e => setWorkEndHour(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
            style={{ borderColor: '#dde5e2', color: '#334155' }}
          >
            {Array.from({ length: 17 }, (_, i) => i + 6).map(h => (
              <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs -mt-3" style={{ color: '#94a3b8' }}>
        Mesai saatleri dışında gelen WhatsApp mesajlarına otomatik yanıt gönderilir.
      </p>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#334155' }}>Çalışma Günleri</label>
        <div className="flex gap-2 flex-wrap">
          {ALL_DAYS.map(day => {
            const active = workDays.includes(day.key)
            return (
              <button
                key={day.key}
                type="button"
                onClick={() =>
                  setWorkDays(prev =>
                    active ? prev.filter(d => d !== day.key) : [...prev, day.key]
                  )
                }
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background: active ? '#4a7c6f' : '#f1f5f9',
                  color: active ? '#fff' : '#64748b',
                }}
              >
                {day.label}
              </button>
            )
          })}
        </div>
        <p className="text-xs mt-1.5" style={{ color: '#94a3b8' }}>
          Bot bu günlerdeki boş slotları hastaya önerir.
        </p>
      </div>

      <h3 className="font-semibold pt-1" style={{ color: '#334155' }}>Hoş Geldiniz Mesajı</h3>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Hoş Geldiniz & Klinik Kuralları Mesajı</label>
        <textarea
          rows={5}
          value={hosgeldinizMesaji}
          onChange={e => setHosgeldinizMesaji(e.target.value)}
          placeholder="Merhaba! Kliniğimize hoş geldiniz..."
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none resize-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
        />
        <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
          İlk seans olarak işaretlenen randevularda bu mesaj otomatik gönderilir.
        </p>
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

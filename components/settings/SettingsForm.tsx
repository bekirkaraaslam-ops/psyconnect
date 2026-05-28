'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { normalizePhone } from '@/lib/utils'
import PackagesPanel from './PackagesPanel'

interface Props {
  psychologist: {
    id: string
    full_name: string
    phone_number: string | null
    klinik_adres: string | null
    harita_linki: string | null
    online_gorusme_linki: string | null
    hosgeldiniz_mesaji: string | null
    work_start_hour: number | null
    work_end_hour: number | null
    work_days: string[] | null
    session_duration_minutes: number | null
    buffer_minutes: number | null
    booking_slug: string | null
    varsayilan_seans_ucreti: number | null
    tatil_modu: boolean | null
  } | null
  email: string
  subscriptionStatus: string | null
  subscriptionEndsAt: string | null
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

export default function SettingsForm({ psychologist, email, subscriptionStatus, subscriptionEndsAt }: Props) {
  const router = useRouter()
  const [fullName, setFullName] = useState(psychologist?.full_name ?? '')
  const [phone, setPhone] = useState(psychologist?.phone_number ?? '')
const [haritaLinki, setHaritaLinki] = useState(psychologist?.harita_linki ?? '')
  const [onlineGorusmeLinki, setOnlineGorusmeLinki] = useState(psychologist?.online_gorusme_linki ?? '')
  const [hosgeldinizMesaji, setHosgeldinizMesaji] = useState(
    psychologist?.hosgeldiniz_mesaji ??
    'Merhaba! Randevunuz başarıyla oluşturuldu. Sizi karşılamaktan gerçekten memnuniyet duyacağım. İlk seansımız birbirimizi tanımak ve sizin için nasıl bir süreç işleyeceğini birlikte konuşmak üzerine olacak; hazırlıklı gelmenize gerek yok. Kafanıza takılan, merak ettiğiniz ya da öncesinde paylaşmak istediğiniz bir şey varsa bu numaradan bana ulaşabilirsiniz. Görüşmek üzere!'
  )
  const [workStartHour, setWorkStartHour] = useState(psychologist?.work_start_hour ?? 9)
  const [workEndHour, setWorkEndHour] = useState(psychologist?.work_end_hour ?? 18)
  const [workDays, setWorkDays] = useState<string[]>(
    psychologist?.work_days ?? ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma']
  )
  const [sessionDuration, setSessionDuration] = useState(psychologist?.session_duration_minutes ?? 50)
  const [bufferMinutes, setBufferMinutes] = useState(psychologist?.buffer_minutes ?? 10)
  const [varsayilanUcret, setVarsayilanUcret] = useState(psychologist?.varsayilan_seans_ucreti != null ? String(psychologist.varsayilan_seans_ucreti) : '')
  const [tatilModu, setTatilModu] = useState(psychologist?.tatil_modu ?? false)
  const [tatilSaving, setTatilSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleTatilToggle(val: boolean) {
    setTatilModu(val)
    setTatilSaving(true)
    const supabase = createClient()
    await supabase
      .from('psychologists')
      .update({ tatil_modu: val })
      .eq('id', psychologist!.id)
    setTatilSaving(false)
  }

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
        klinik_tel: phone ? normalizePhone(phone) : null,
harita_linki: haritaLinki || null,
        online_gorusme_linki: onlineGorusmeLinki || null,
        hosgeldiniz_mesaji: hosgeldinizMesaji || null,
        work_start_hour: workStartHour,
        work_end_hour: workEndHour,
        work_days: workDays,
        session_duration_minutes: sessionDuration,
        buffer_minutes: bufferMinutes,
        varsayilan_seans_ucreti: varsayilanUcret !== '' ? Number(varsayilanUcret) : null,
        tatil_modu: tatilModu,
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
    <form onSubmit={handleSubmit} className="space-y-5">

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

      {/* Satır 1: Profil | Klinik */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Profil Bilgileri */}
        <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: '#dde5e2' }}>
          <h3 className="text-sm font-semibold" style={{ color: '#334155' }}>Profil Bilgileri</h3>

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
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Klinik Numarası</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#dde5e2', color: '#334155' }}
              placeholder="0532 123 45 67"
            />
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
              WhatsApp hatırlatıcıları bu numaraya gönderilir ve profil sayfanızda görünür.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Varsayılan Seans Ücreti (₺)</label>
            <input
              type="number"
              min="0"
              value={varsayilanUcret}
              onChange={e => setVarsayilanUcret(e.target.value)}
              placeholder="Örn: 800"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#dde5e2', color: '#334155' }}
            />
            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
              Randevu onaylarken otomatik olarak önerilir.
            </p>
          </div>

          <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: '#f1f5f9' }}>
            <div>
              <p className="text-xs font-medium" style={{ color: '#64748b' }}>Abonelik</p>
              {subscriptionEndsAt && (
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                  Bitiş: {new Date(subscriptionEndsAt).toLocaleDateString('tr-TR')}
                </p>
              )}
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              subscriptionStatus === 'active' ? 'bg-green-100 text-green-700' :
              subscriptionStatus === 'trial' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-600'
            }`}>
              {subscriptionStatus === 'active' ? 'Aktif' :
               subscriptionStatus === 'trial' ? 'Deneme' : 'Pasif'}
            </span>
          </div>
        </div>

        {/* Klinik Bilgileri */}
        <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: '#dde5e2' }}>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#334155' }}>Klinik Bilgileri</h3>
            <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>Klinik adı ve adresi için <a href="/profil" className="underline" style={{ color: '#4a7c6f' }}>Profilim</a> sekmesine gidin.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Harita Linki</label>
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
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Online Görüşme Linki</label>
            <input
              type="text"
              value={onlineGorusmeLinki}
              onChange={e => setOnlineGorusmeLinki(e.target.value)}
              placeholder="https://zoom.us/j/..."
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#dde5e2', color: '#334155' }}
            />
          </div>

          {/* Tatil Modu */}
          <div className="pt-3 border-t" style={{ borderColor: '#f1f5f9' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: '#334155' }}>Tatil Modu</p>
                <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                  Açıkken yeni randevu talebi alınmaz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleTatilToggle(!tatilModu)}
                disabled={tatilSaving}
                className="relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 disabled:opacity-60"
                style={{ background: tatilModu ? '#f59e0b' : '#e2e8f0' }}
                role="switch"
                aria-checked={tatilModu}
              >
                <span
                  className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200"
                  style={{ transform: tatilModu ? 'translateX(20px)' : 'translateX(0px)' }}
                />
              </button>
            </div>
            {tatilModu && (
              <div className="mt-2 px-3 py-2 rounded-lg text-xs" style={{ background: '#fef3c7', color: '#92400e' }}>
                Tatil modu aktif — danışanlar randevu alamıyor.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Satır 2: Çalışma Saatleri | Randevu Ayarları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Çalışma Saatleri */}
        <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: '#dde5e2' }}>
          <h3 className="text-sm font-semibold" style={{ color: '#334155' }}>Çalışma Saatleri</h3>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Başlangıç</label>
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
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Bitiş</label>
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
          <p className="text-xs -mt-2" style={{ color: '#94a3b8' }}>
            Mesai saatleri dışındaki WhatsApp mesajlarına otomatik yanıt gönderilir.
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
          </div>
        </div>

        {/* Randevu Ayarları */}
        <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: '#dde5e2' }}>
          <h3 className="text-sm font-semibold" style={{ color: '#334155' }}>Randevu Ayarları</h3>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Seans Süresi</label>
            <select
              value={sessionDuration}
              onChange={e => setSessionDuration(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#dde5e2', color: '#334155' }}
            >
              {[30, 45, 50, 60, 90].map(m => (
                <option key={m} value={m}>{m} dakika</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: '#334155' }}>Seanslar Arası Tampon</label>
            <select
              value={bufferMinutes}
              onChange={e => setBufferMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none"
              style={{ borderColor: '#dde5e2', color: '#334155' }}
            >
              {[0, 5, 10, 15, 20, 30].map(m => (
                <option key={m} value={m}>{m === 0 ? 'Yok' : `${m} dakika`}</option>
              ))}
            </select>
          </div>
          <p className="text-xs -mt-2" style={{ color: '#94a3b8' }}>
            Booking sayfasındaki müsait slotlar bu ayarlara göre hesaplanır.
          </p>

        </div>
      </div>

      <PackagesPanel />

      {/* Satır 3: Hoş Geldiniz Mesajı */}
      <div className="bg-white rounded-2xl border p-5 space-y-4" style={{ borderColor: '#dde5e2' }}>
        <h3 className="text-sm font-semibold" style={{ color: '#334155' }}>Hoş Geldiniz Mesajı</h3>
        <textarea
          rows={4}
          value={hosgeldinizMesaji}
          onChange={e => setHosgeldinizMesaji(e.target.value)}
          placeholder="Merhaba! Kliniğimize hoş geldiniz..."
          className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none resize-none"
          style={{ borderColor: '#dde5e2', color: '#334155' }}
        />
        <p className="text-xs -mt-2" style={{ color: '#94a3b8' }}>
          İlk seans olarak işaretlenen randevularda otomatik gönderilir.
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

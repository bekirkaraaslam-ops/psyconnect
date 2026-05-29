'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Egitim { baslik: string; kurum: string; yil: string }
interface Yaklasim { ikon: string; baslik: string; aciklama: string }

interface ProfilGorunum {
  show_uzmanlik: boolean
  show_paketler: boolean
  show_yorumlar: boolean
  show_blog: boolean
  show_egitim: boolean
  show_klinik: boolean
  show_seans_sayisi: boolean
  show_ilk_seans: boolean
}

const DEFAULT_GORUNUM: ProfilGorunum = {
  show_uzmanlik: true, show_paketler: true, show_yorumlar: true,
  show_blog: true, show_egitim: true, show_klinik: true,
  show_seans_sayisi: false, show_ilk_seans: true,
}

function buildSlug(unvan: string, fullName: string): string {
  const toAscii = (s: string) => s.toLowerCase()
    .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/i̇/g, 'i')
    .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
    .replace(/[^a-z0-9]/g, '')
  return toAscii(unvan) + toAscii(fullName)
}

interface Psych {
  id: string; full_name: string; booking_slug: string; unvan: string | null; sehir: string | null
  bio_text: string | null; uzmanlik_alanlari: string[] | null; egitim: Egitim[] | null
  ilk_seans_metni: string | null
  foto_url: string | null; klinik_adi: string | null; klinik_adres: string | null
  klinik_tel: string | null; calisma_saatleri: string | null; profil_alinti: string | null
  deneyim_yil: number | null; dil: string[] | null
  work_start_hour: number | null; work_end_hour: number | null
  work_days: string[] | null; session_duration_minutes: number | null
  subscription_status: string | null; profil_gorunum: ProfilGorunum | null
  tema: string | null; yaklasim: Yaklasim[] | null; tpd_uye_no: string | null
}

interface Paket { id: string; name: string; session_count: number; price_tl: number; is_active: boolean }

interface Props { psych: Psych; paketler: Paket[]; subscriptionStatus: string | null }

const UZMANLIK_ONERILERI = [
  'Anksiyete', 'Depresyon', 'İlişki Sorunları', 'Öz Güven', 'Yas Süreci',
  'Travma (EMDR)', 'Bağlanma Sorunları', 'Panik Bozukluğu', 'Aile İçi İletişim',
  'Ergenlik', 'Çocuk Psikolojisi', 'Cinsel Sorunlar', 'Yeme Bozuklukları',
  'OKB', 'Sosyal Fobi', 'İş Stresi', 'Yas ve Kayıp',
]

const ALL_DAYS = [
  { key: 'pazartesi', label: 'Pzt' }, { key: 'salı', label: 'Sal' },
  { key: 'çarşamba', label: 'Çar' }, { key: 'perşembe', label: 'Per' },
  { key: 'cuma', label: 'Cum' }, { key: 'cumartesi', label: 'Cmt' },
  { key: 'pazar', label: 'Paz' },
]

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7)

const TABS = [
  { id: 'profil',    label: 'Profil' },
  { id: 'uzmanlik',  label: 'Uzmanlık' },
  { id: 'klinik',    label: 'Klinik' },
  { id: 'paketler',  label: 'Paketler' },
  { id: 'website',   label: 'Website' },
  { id: 'gorunum',   label: 'Görünüm' },
]

const TEMA_SECENEKLERI = [
  { id: 'blanc',  label: 'Blanc',  aciklama: 'Modern & Minimalist',     renk: '#3d6b5e', bg: '#fff',     border: '#e8f2ef' },
  { id: 'sicak',  label: 'Sıcak',  aciklama: 'Sıcak & İnsancıl',       renk: '#c17b5e', bg: '#faf6f1', border: '#f5e8d8' },
  { id: 'guven',  label: 'Güven',  aciklama: 'Uzman & Kurumsal',        renk: '#5fbfb0', bg: '#1b2d4f', border: '#2a4b7c' },
  { id: 'doga',   label: 'Doğa',   aciklama: 'Sakin & Organik',         renk: '#5a6b3c', bg: '#f5f0e8', border: '#d8cebc' },
]

const DEFAULT_YAKLASIM: Yaklasim[] = [
  { ikon: '🧠', baslik: 'Bilişsel Davranışçı Terapi', aciklama: 'Düşünce kalıplarının duygu ve davranışlar üzerindeki etkisini birlikte keşfediyoruz.' },
  { ikon: '🌱', baslik: 'Şema Terapi', aciklama: 'Erken dönem yaşantılardan gelen örüntülerin bugünkü ilişkilere yansımalarını ele alıyoruz.' },
  { ikon: '🤝', baslik: 'Kişiye Özel Yaklaşım', aciklama: 'Her danışanın hikâyesi farklıdır; süreci birlikte şekillendiriyoruz.' },
]

const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 9, fontSize: 13,
  border: '1px solid #dde5e2', color: '#334155', outline: 'none',
  background: '#fff', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = { fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5, display: 'block' }

export default function ProfilEditor({ psych, paketler, subscriptionStatus }: Props) {
  const isPro = subscriptionStatus === 'active'
  const supabase = createClient()

  const [tab, setTab] = useState('profil')
  const [unvan, setUnvan] = useState(psych.unvan ?? '')
  const [sehir, setSehir] = useState(psych.sehir ?? '')
  const [bioText, setBioText] = useState(psych.bio_text ?? '')
  const [ilkSeansMetni, setIlkSeansMetni] = useState(psych.ilk_seans_metni ?? '')
  const [profilAlinti, setProfilAlinti] = useState(psych.profil_alinti ?? '')
  const [deneyimYil, setDeneyimYil] = useState(psych.deneyim_yil?.toString() ?? '')
  const [dil, setDil] = useState(psych.dil?.join(', ') ?? '')
  const [uzmanliklar, setUzmanliklar] = useState<string[]>(psych.uzmanlik_alanlari ?? [])
  const [egitimler, setEgitimler] = useState<Egitim[]>(psych.egitim ?? [])
  const [klinikAdi, setKlinikAdi] = useState(psych.klinik_adi ?? '')
  const [klinikAdres, setKlinikAdres] = useState(psych.klinik_adres ?? '')
  const [klinikTel, setKlinikTel] = useState(psych.klinik_tel ?? '')
  const [calismaSaatleri, setCalismaSaatleri] = useState(psych.calisma_saatleri ?? '')
  const [workStartHour, setWorkStartHour] = useState(psych.work_start_hour ?? 9)
  const [workEndHour, setWorkEndHour] = useState(psych.work_end_hour ?? 18)
  const [workDays, setWorkDays] = useState<string[]>(psych.work_days ?? ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma'])
  const [sessionDuration, setSessionDuration] = useState(psych.session_duration_minutes ?? 50)
  const [gorunum, setGorunum] = useState<ProfilGorunum>({ ...DEFAULT_GORUNUM, ...(psych.profil_gorunum ?? {}) })
  const [tema, setTema] = useState(psych.tema ?? 'modern')
  const [yaklasimlar, setYaklasimlar] = useState<Yaklasim[]>(psych.yaklasim ?? DEFAULT_YAKLASIM)
  const [tpdUyeNo, setTpdUyeNo] = useState(psych.tpd_uye_no ?? '')
  const [fotoUrl, setFotoUrl] = useState(psych.foto_url ?? '')
  const [uploadingFoto, setUploadingFoto] = useState(false)
  const fotoInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggleUzmanlik(alan: string) {
    setUzmanliklar(prev => prev.includes(alan) ? prev.filter(u => u !== alan) : [...prev, alan])
  }
  function toggleDay(day: string) {
    setWorkDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }
  function addEgitim() { setEgitimler(prev => [...prev, { baslik: '', kurum: '', yil: '' }]) }
  function removeEgitim(i: number) { setEgitimler(prev => prev.filter((_, idx) => idx !== i)) }
  function updateEgitim(i: number, field: keyof Egitim, val: string) {
    setEgitimler(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e))
  }

  function addYaklasim() { setYaklasimlar(prev => [...prev, { ikon: '💡', baslik: '', aciklama: '' }]) }
  function removeYaklasim(i: number) { setYaklasimlar(prev => prev.filter((_, idx) => idx !== i)) }
  function updateYaklasim(i: number, field: keyof Yaklasim, val: string) {
    setYaklasimlar(prev => prev.map((y, idx) => idx === i ? { ...y, [field]: val } : y))
  }

  async function handleFotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingFoto(true)
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${psych.id}/profil.${ext}`
    const { error: upErr } = await supabase.storage.from('profil-resimleri').upload(path, file, { upsert: true, contentType: file.type })
    if (upErr) { setUploadingFoto(false); alert('Fotoğraf yüklenemedi: ' + upErr.message); return }
    const { data: { publicUrl } } = supabase.storage.from('profil-resimleri').getPublicUrl(path)
    const urlWithBust = `${publicUrl}?t=${Date.now()}`
    await supabase.from('psychologists').update({ foto_url: urlWithBust }).eq('id', psych.id)
    setFotoUrl(urlWithBust)
    setUploadingFoto(false)
  }

  async function handleSave() {
    setSaving(true)
    const newSlug = buildSlug(unvan, psych.full_name)
    const { error } = await supabase.from('psychologists').update({
      unvan: unvan || null, booking_slug: newSlug || psych.booking_slug,
      sehir: sehir || null, bio_text: bioText || null,
      profil_alinti: profilAlinti || null,
      deneyim_yil: deneyimYil ? parseInt(deneyimYil) : null,
      dil: dil ? dil.split(',').map(d => d.trim()).filter(Boolean) : null,
      uzmanlik_alanlari: uzmanliklar.length > 0 ? uzmanliklar : null,
      egitim: egitimler.filter(e => e.baslik).length > 0 ? egitimler.filter(e => e.baslik) : null,
      klinik_adi: klinikAdi || null, klinik_adres: klinikAdres || null,
      klinik_tel: klinikTel || null, calisma_saatleri: calismaSaatleri || null,
      work_start_hour: workStartHour, work_end_hour: workEndHour,
      work_days: workDays, session_duration_minutes: sessionDuration,
      ilk_seans_metni: ilkSeansMetni || null,
      profil_gorunum: isPro ? gorunum : DEFAULT_GORUNUM,
      tema: tema || 'modern',
      yaklasim: yaklasimlar.filter(y => y.baslik).length > 0 ? yaklasimlar.filter(y => y.baslik) : null,
      tpd_uye_no: tpdUyeNo || null,
    }).eq('id', psych.id)
    setSaving(false)
    if (!error) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
  }

  const currentSlug = buildSlug(unvan, psych.full_name) || psych.booking_slug
  const profilUrl = `https://${currentSlug}.seansify.com`
  const initials = currentSlug.slice(0, 2).toUpperCase()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* Sticky header */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--background)', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Mini avatar */}
          <div
            onClick={() => !uploadingFoto && fotoInputRef.current?.click()}
            style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
              background: fotoUrl ? 'transparent' : 'linear-gradient(135deg,#4a7c6f,#6ee7b7)',
              border: '2px solid #e4eeea', overflow: 'hidden', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {fotoUrl
              ? <img src={fotoUrl} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{initials}</span>
            }
            {uploadingFoto && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>…</span>
              </div>
            )}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2 }}>Profilim</div>
            <a href={profilUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#4a7c6f', textDecoration: 'none', fontWeight: 500 }}>
              {profilUrl} ↗
            </a>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {saved && <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>✓ Kaydedildi</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ background: '#4a7c6f', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
        <input ref={fotoInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFotoUpload} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, padding: '0 24px', borderBottom: '1px solid var(--border)', background: 'var(--background)', overflowX: 'auto' }}>
        {TABS.map(t => {
          const isGorunum = t.id === 'gorunum'
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '11px 16px', fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? '#4a7c6f' : '#64748b',
                background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                borderBottom: `2px solid ${tab === t.id ? '#4a7c6f' : 'transparent'}`,
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              {t.label}
              {isGorunum && (
                <span style={{ fontSize: 9, fontWeight: 700, background: isPro ? '#fef9c3' : '#f1f5f9', color: isPro ? '#a16207' : '#94a3b8', padding: '1px 6px', borderRadius: 10 }}>
                  {isPro ? 'Pro' : 'Pro'}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab içeriği */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: 700 }}>

        {/* ── PROFIL ── */}
        {tab === 'profil' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Fotoğraf + özet */}
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div
                onClick={() => !uploadingFoto && fotoInputRef.current?.click()}
                style={{
                  width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
                  background: fotoUrl ? 'transparent' : 'linear-gradient(135deg,#4a7c6f,#6ee7b7)',
                  border: '2px dashed #4a7c6f', cursor: 'pointer', overflow: 'hidden', position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {fotoUrl
                  ? <img src={fotoUrl} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>{initials}</span>
                }
                {uploadingFoto && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    <span style={{ color: '#fff', fontSize: 10, fontWeight: 700 }}>Yüklüyor</span>
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', margin: 0, marginBottom: 3 }}>Profil Fotoğrafı</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, marginBottom: 10 }}>JPG, PNG veya WebP · Maks. 5 MB</p>
                <button
                  onClick={() => fotoInputRef.current?.click()}
                  disabled={uploadingFoto}
                  style={{ fontSize: 12, fontWeight: 600, color: '#4a7c6f', background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', opacity: uploadingFoto ? 0.6 : 1 }}
                >
                  {uploadingFoto ? 'Yükleniyor…' : fotoUrl ? 'Değiştir' : 'Yükle'}
                </button>
              </div>
            </div>

            {/* Temel alanlar */}
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lbl}>Unvan</label>
                  <input style={inp} value={unvan} onChange={e => setUnvan(e.target.value)} placeholder="Uzm. Psk., PDR…" />
                </div>
                <div>
                  <label style={lbl}>Şehir</label>
                  <input style={inp} value={sehir} onChange={e => setSehir(e.target.value)} placeholder="İstanbul, Ankara…" />
                </div>
                <div>
                  <label style={lbl}>Deneyim (yıl)</label>
                  <input style={inp} type="number" value={deneyimYil} onChange={e => setDeneyimYil(e.target.value)} placeholder="8" />
                </div>
                <div>
                  <label style={lbl}>Konuşulan Diller</label>
                  <input style={inp} value={dil} onChange={e => setDil(e.target.value)} placeholder="Türkçe, İngilizce" />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Profil Alıntısı <span style={{ fontWeight: 400, color: '#94a3b8' }}>(öne çıkar)</span></label>
                <input style={inp} value={profilAlinti} onChange={e => setProfilAlinti(e.target.value)} placeholder="Danışanlarımla güvenli bir alan oluşturmak en büyük önceliğim…" />
              </div>
              <div>
                <label style={lbl}>Hakkımda</label>
                <textarea style={{ ...inp, resize: 'vertical', minHeight: 110, lineHeight: 1.7 }} value={bioText} onChange={e => setBioText(e.target.value)} placeholder="Kendinizi ve çalışma yaklaşımınızı anlatın…" />
              </div>
            </div>

            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
              <label style={{ ...lbl, fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>İlk Seans Nasıl Geçer?</label>
              <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>
                Her paragraf (boş satırla ayrılmış) numaralı adım olarak gösterilir. Danışan adayının kafasındaki soru işaretlerini giderin.
              </p>
              <textarea
                style={{ ...inp, resize: 'vertical', minHeight: 130, lineHeight: 1.7 }}
                value={ilkSeansMetni}
                onChange={e => setIlkSeansMetni(e.target.value)}
                placeholder={"İlk seansımızda birbirimizi tanımak için zaman ayırıyoruz.\n\nBana ne için geldiğinizi ve şu an neler yaşadığınızı anlatırsınız — hiçbir şeyi hazır getirmenize gerek yok.\n\nSeans sonunda nasıl devam edebileceğimizi birlikte değerlendiriyoruz."}
              />
            </div>
          </div>
        )}

        {/* ── UZMANLIK ── */}
        {tab === 'uzmanlik' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', marginBottom: 14 }}>Uzmanlık Alanları</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {UZMANLIK_ONERILERI.map(alan => {
                  const sec = uzmanliklar.includes(alan)
                  return (
                    <button key={alan} onClick={() => toggleUzmanlik(alan)} style={{ fontSize: 12, fontWeight: 600, padding: '6px 13px', borderRadius: 8, border: `1.5px solid ${sec ? '#4a7c6f' : '#dde5e2'}`, background: sec ? '#f0fdf4' : '#fff', color: sec ? '#15803d' : '#64748b', cursor: 'pointer' }}>
                      {sec ? '✓ ' : ''}{alan}
                    </button>
                  )
                })}
              </div>
              {uzmanliklar.length > 0 && (
                <p style={{ fontSize: 11, color: '#4a7c6f', marginTop: 12, fontWeight: 600 }}>{uzmanliklar.length} alan seçili</p>
              )}
            </div>

            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>Eğitim & Sertifikalar</p>
                <button onClick={addEgitim} style={{ fontSize: 12, fontWeight: 700, color: '#4a7c6f', background: '#f0fdf4', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}>+ Ekle</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {egitimler.map((e, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, alignItems: 'end' }}>
                    <div>
                      <label style={{ ...lbl, marginBottom: 4 }}>Program / Sertifika</label>
                      <input style={inp} value={e.baslik} onChange={ev => updateEgitim(i, 'baslik', ev.target.value)} placeholder="Klinik Psikoloji YL" />
                    </div>
                    <div>
                      <label style={{ ...lbl, marginBottom: 4 }}>Kurum</label>
                      <input style={inp} value={e.kurum} onChange={ev => updateEgitim(i, 'kurum', ev.target.value)} placeholder="İstanbul Üniversitesi" />
                    </div>
                    <div>
                      <label style={{ ...lbl, marginBottom: 4 }}>Yıl</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input style={{ ...inp, width: 68 }} value={e.yil} onChange={ev => updateEgitim(i, 'yil', ev.target.value)} placeholder="2020" />
                        <button onClick={() => removeEgitim(i)} style={{ padding: '9px 10px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: 13 }}>✕</button>
                      </div>
                    </div>
                  </div>
                ))}
                {egitimler.length === 0 && <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>Henüz eğitim eklenmedi</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── KLİNİK ── */}
        {tab === 'klinik' && (
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={lbl}>Klinik Adı</label>
              <input style={inp} value={klinikAdi} onChange={e => setKlinikAdi(e.target.value)} placeholder="Ayşe Kaya Psikoloji Kliniği" />
            </div>
            <div>
              <label style={lbl}>Adres</label>
              <textarea style={{ ...inp, resize: 'vertical', minHeight: 70 }} value={klinikAdres} onChange={e => setKlinikAdres(e.target.value)} placeholder={'Moda Caddesi No:42, Kat:3\nKadıköy / İstanbul'} />
            </div>
            <div>
              <label style={lbl}>Çalışma Saatleri <span style={{ fontWeight: 400, color: '#94a3b8' }}>(metin — profilde görünür)</span></label>
              <input style={inp} value={calismaSaatleri} onChange={e => setCalismaSaatleri(e.target.value)} placeholder="Pzt–Cum, 09:00–18:00" />
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Randevu saatlerini <Link href="/settings" style={{ color: '#4a7c6f', fontWeight: 600 }}>Ayarlar</Link>'dan ayarlayın.</p>
            </div>
          </div>
        )}

        {/* ── PAKETLER ── */}
        {tab === 'paketler' && (
          <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>Seans Paketleri</p>
              <Link href="/settings" style={{ fontSize: 12, fontWeight: 700, color: '#4a7c6f', background: '#f0fdf4', border: '1px solid #d1fae5', borderRadius: 8, padding: '5px 12px', textDecoration: 'none' }}>
                + Paket Ekle →
              </Link>
            </div>
            {paketler.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>Henüz aktif paket yok.</p>
                <Link href="/settings" style={{ fontSize: 13, color: '#4a7c6f', fontWeight: 700, textDecoration: 'none' }}>Ayarlar'dan paket ekle →</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {paketler.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', borderRadius: 12, padding: '12px 16px', border: '1px solid #e8f5f1' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#0d1f18', margin: 0, marginBottom: 2 }}>{p.name}</p>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{p.session_count} seans · ₺{(p.price_tl / p.session_count).toFixed(0)}/seans</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#4a7c6f', margin: 0 }}>₺{Number(p.price_tl).toLocaleString('tr-TR')}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>toplam</p>
                    </div>
                  </div>
                ))}
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                  Düzenlemek için <Link href="/settings" style={{ color: '#4a7c6f', fontWeight: 600 }}>Ayarlar</Link>'a gidin.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── WEBSİTE ── */}
        {tab === 'website' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Tema Seçici */}
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', marginBottom: 6 }}>Website Teması</p>
              <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14 }}>
                Seçtiğiniz tema <strong>slug.seansify.com</strong> adresinizdeki kişisel websitesinde görünür.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {TEMA_SECENEKLERI.map(t => {
                  const sec = tema === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setTema(t.id)}
                      style={{
                        borderRadius: 12, border: `2px solid ${sec ? t.renk : '#e2e8f0'}`,
                        padding: '14px 12px', cursor: 'pointer', textAlign: 'left',
                        background: sec ? t.bg : '#fafafa',
                        boxShadow: sec ? `0 0 0 1px ${t.renk}30` : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: t.renk, marginBottom: 8 }} />
                      <div style={{ fontSize: 13, fontWeight: 700, color: sec ? t.renk : '#334155', marginBottom: 2 }}>{t.label}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{t.aciklama}</div>
                      {sec && <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: t.renk }}>✓ Seçili</div>}
                    </button>
                  )
                })}
                {/* Modern (default / eski görünüm) */}
                <button
                  onClick={() => setTema('modern')}
                  style={{
                    borderRadius: 12, border: `2px solid ${tema === 'modern' ? '#4a7c6f' : '#e2e8f0'}`,
                    padding: '14px 12px', cursor: 'pointer', textAlign: 'left',
                    background: tema === 'modern' ? '#f0fdf4' : '#fafafa',
                    gridColumn: 'span 2',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: tema === 'modern' ? '#4a7c6f' : '#334155', marginBottom: 2 }}>
                    Klasik (Mevcut) {tema === 'modern' && '✓'}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Mevcut mobil profil sayfası — website teması uygulanmaz</div>
                </button>
              </div>
            </div>

            {/* Yaklaşımım */}
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>Yaklaşımım</p>
                <button onClick={addYaklasim} style={{ fontSize: 12, fontWeight: 700, color: '#4a7c6f', background: '#f0fdf4', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}>+ Ekle</button>
              </div>
              <p style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14 }}>
                Terapi yaklaşımlarınızı ve çalışma felsefenizi anlatın. Website temasında ayrı bir bölüm olarak görünür.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {yaklasimlar.map((y, i) => (
                  <div key={i} style={{ background: '#f8fafc', borderRadius: 12, padding: 14, border: '1px solid #e8edf2' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <div>
                        <label style={{ ...lbl, marginBottom: 4 }}>İkon</label>
                        <input style={{ ...inp, width: 54 }} value={y.ikon} onChange={ev => updateYaklasim(i, 'ikon', ev.target.value)} placeholder="🧠" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ ...lbl, marginBottom: 4 }}>Başlık</label>
                        <input style={inp} value={y.baslik} onChange={ev => updateYaklasim(i, 'baslik', ev.target.value)} placeholder="Bilişsel Davranışçı Terapi" />
                      </div>
                      <button onClick={() => removeYaklasim(i)} style={{ alignSelf: 'flex-end', padding: '9px 10px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: 13, marginBottom: 0 }}>✕</button>
                    </div>
                    <div>
                      <label style={{ ...lbl, marginBottom: 4 }}>Açıklama</label>
                      <textarea style={{ ...inp, resize: 'none', height: 62, lineHeight: 1.6 }} value={y.aciklama} onChange={ev => updateYaklasim(i, 'aciklama', ev.target.value)} placeholder="Bu yaklaşımı nasıl uyguladığınızı kısaca açıklayın…" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mesleki Kimlik */}
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', marginBottom: 14 }}>Mesleki Kimlik</p>
              <div>
                <label style={lbl}>Meslek Birliği Üye No <span style={{ fontWeight: 400, color: '#94a3b8' }}>(opsiyonel)</span></label>
                <input style={inp} value={tpdUyeNo} onChange={e => setTpdUyeNo(e.target.value)} placeholder="TPD-12345" />
                <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>TPD, TSPD veya başka bir birlik numarası. Websitede güven unsuru olarak görünür.</p>
              </div>
            </div>

          </div>
        )}

        {/* ── GÖRÜNÜM ── */}
        {tab === 'gorunum' && (
          isPro ? (
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 20, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)', margin: 0 }}>Profil Görünümü</p>
                <span style={{ fontSize: 10, fontWeight: 700, background: '#fef9c3', color: '#a16207', padding: '2px 8px', borderRadius: 10 }}>Pro</span>
              </div>
              <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Profil sayfanızda hangi bölümlerin görüneceğini seçin.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {([
                  { key: 'show_uzmanlik',    label: 'Uzmanlık Alanları' },
                  { key: 'show_paketler',    label: 'Seans Paketleri' },
                  { key: 'show_yorumlar',    label: 'Değerlendirmeler' },
                  { key: 'show_blog',        label: 'Blog Yazıları' },
                  { key: 'show_egitim',      label: 'Eğitim & Sertifikalar' },
                  { key: 'show_klinik',      label: 'Klinik Bilgileri' },
                  { key: 'show_seans_sayisi', label: 'Tamamlanan Seans Sayısı' },
                  { key: 'show_ilk_seans',    label: 'İlk Seans Nasıl Geçer?' },
                ] as { key: keyof ProfilGorunum; label: string }[]).map(({ key, label }) => {
                  const on = gorunum[key]
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{label}</span>
                      <button
                        onClick={() => setGorunum(prev => ({ ...prev, [key]: !on }))}
                        style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: on ? '#4a7c6f' : '#e2e8f0', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                      >
                        <span style={{ position: 'absolute', top: 3, left: on ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
                      </button>
                    </div>
                  )
                })}
              </div>
              <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 20 }}>Değişiklikleri uygulamak için <strong>Kaydet</strong> butonuna basın.</p>
            </div>
          ) : (
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 32, border: '1px solid var(--border)', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>🔒</div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)', marginBottom: 8 }}>Pro Özelliği</p>
              <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
                Profil sayfanızdaki bölümleri göster/gizle özelliği<br />sadece Pro planda kullanılabilir.
              </p>
              <Link href="/settings" style={{ fontSize: 13, fontWeight: 700, color: '#fff', background: '#4a7c6f', borderRadius: 10, padding: '9px 20px', textDecoration: 'none' }}>
                Pro'ya Geç →
              </Link>
            </div>
          )
        )}

      </div>
    </div>
  )
}

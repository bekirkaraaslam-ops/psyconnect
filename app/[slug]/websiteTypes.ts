export interface Egitim { baslik: string; kurum: string; yil?: string }
export interface Yaklasim { ikon: string; baslik: string; aciklama: string }

export interface WebsitePsych {
  id: string
  full_name: string
  booking_slug: string
  unvan: string | null
  sehir: string | null
  bio_text: string | null
  foto_url: string | null
  profil_alinti: string | null
  deneyim_yil: number | null
  dil: string[] | null
  uzmanlik_alanlari: string[] | null
  egitim: Egitim[] | null
  klinik_adi: string | null
  klinik_adres: string | null
  klinik_tel: string | null
  calisma_saatleri: string | null
  ilk_seans_metni: string | null
  tpd_uye_no: string | null
  yaklasim: Yaklasim[] | null
  session_duration_minutes: number | null
  profil_gorunum: Record<string, boolean> | null
  tema: string | null
}

export interface Blog {
  id: string
  baslik: string
  slug: string
  kategori: string | null
  icerik: string
  created_at: string
}

export interface Yorum {
  id: string
  yildiz: number
  yorum_metni: string | null
  reviewer_init: string | null
}

export interface Paket {
  id: string
  name: string
  session_count: number
  price_tl: number
}

export interface WebsiteProps {
  psych: WebsitePsych
  bloglar: Blog[]
  yorumlar: Yorum[]
  paketler: Paket[]
  tamamlananSeans: number
}

export function blogOzet(icerik: string, n = 100) {
  return icerik.replace(/#+\s/g, '').replace(/\*\*/g, '').slice(0, n) + '…'
}

export function tarih(iso: string) {
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function okumaMin(icerik: string) {
  return Math.max(1, Math.round(icerik.split(/\s+/).length / 200))
}

export type SubscriptionStatus = 'active' | 'inactive' | 'trial'
export type AppointmentStatus = 'waiting' | 'confirmed' | 'canceled' | 'completed' | 'cancelled_by_patient' | 'seansify_pending'
export type PlanType = 'free' | 'baslangic' | 'pro'

export interface Psychologist {
  id: string
  auth_user_id: string
  full_name: string
  phone_number: string | null
  klinik_adresi: string | null
  harita_linki: string | null
  online_gorusme_linki: string | null
  hosgeldiniz_mesaji: string | null
  whatsapp_session: Record<string, unknown> | null
  is_connected: boolean
  subscription_status: SubscriptionStatus
  subscription_ends_at: string | null
  plan_type: PlanType
  ls_customer_id?: string
  ls_subscription_id?: string
  ls_subscription_status?: string
  referral_code?: string
  referred_by_code?: string
  discount_percent: number
  created_at: string
  updated_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  referral_code: string
  status: 'pending' | 'active' | 'cancelled'
  created_at: string
  activated_at?: string
  cancelled_at?: string
}

export interface DiscountCode {
  id: string
  psychologist_id: string
  ls_discount_id?: string
  code: string
  percent_off: number
  valid_until?: string
  used: boolean
  created_at: string
}

export interface Patient {
  id: string
  psychologist_id: string
  name_surname: string
  phone_number: string
  date_of_birth: string | null
  notes_encrypted: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type AppointmentType = 'yuzyuze' | 'online'

export interface Appointment {
  id: string
  psychologist_id: string
  patient_id: string
  appointment_date: string
  duration_minutes: number
  status: AppointmentStatus
  appointment_type: AppointmentType
  toplam_paket_seansi: number | null
  mevcut_seans_no: number | null
  is_first_session: boolean
  reminder_sent: boolean
  reminder_sent_at: string | null
  session_notes_encrypted: string | null
  created_at: string
  updated_at: string
  // joined
  patient?: Patient
}

export interface ReminderLog {
  id: string
  appointment_id: string
  sent_at: string
  status: 'success' | 'failed'
  error_message: string | null
}

// Form types
export interface PatientFormData {
  name_surname: string
  phone_number: string
  date_of_birth?: string
  notes?: string
}

export interface AppointmentFormData {
  patient_id: string
  appointment_date: string
  duration_minutes: number
  status: AppointmentStatus
  appointment_type: AppointmentType
  toplam_paket_seansi: number | null
  mevcut_seans_no: number | null
  is_first_session: boolean
}

export interface HastaNotu {
  id: string
  psychologist_id: string
  hasta_id: string
  seans_tarihi: string
  seans_notu_encrypted: string | null
  gelecek_plan_encrypted: string | null
  ev_odevi_encrypted: string | null
  soap_s_encrypted?: string | null
  soap_o_encrypted?: string | null
  soap_a_encrypted?: string | null
  soap_p_encrypted?: string | null
  created_at: string
  updated_at: string
}

// Dashboard stats
export interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  weekAppointments: number
  pendingReminders: number
}

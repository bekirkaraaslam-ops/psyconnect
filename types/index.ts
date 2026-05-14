export type SubscriptionStatus = 'active' | 'inactive' | 'trial'
export type AppointmentStatus = 'waiting' | 'confirmed' | 'canceled' | 'completed'

export interface Psychologist {
  id: string
  auth_user_id: string
  full_name: string
  phone_number: string | null
  whatsapp_session: Record<string, unknown> | null
  is_connected: boolean
  subscription_status: SubscriptionStatus
  subscription_ends_at: string | null
  created_at: string
  updated_at: string
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

export interface Appointment {
  id: string
  psychologist_id: string
  patient_id: string
  appointment_date: string
  duration_minutes: number
  status: AppointmentStatus
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
}

// Dashboard stats
export interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  weekAppointments: number
  pendingReminders: number
}

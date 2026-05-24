import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

const TZ = 'Europe/Istanbul'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric', timeZone: TZ,
  })
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ,
  })
}

export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('tr-TR', {
    hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ,
  })
}

function istDayStr(d: Date): string {
  return d.toLocaleDateString('tr-TR', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' })
}

export function formatRelative(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  if (istDayStr(d) === istDayStr(now)) return `Bugün ${formatTime(d)}`
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  if (istDayStr(d) === istDayStr(tomorrow)) return `Yarın ${formatTime(d)}`
  return formatDateTime(d)
}

export function formatPhoneDisplay(phone: string): string {
  // 905xxxxxxxxx → +90 5xx xxx xx xx
  if (phone.startsWith('90') && phone.length === 12) {
    return `+90 ${phone.slice(2, 5)} ${phone.slice(5, 8)} ${phone.slice(8, 10)} ${phone.slice(10)}`
  }
  return phone
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '90' + digits.slice(1)
  if (digits.startsWith('90')) return digits
  if (digits.startsWith('5')) return '90' + digits
  return digits
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function randomDelay(minMs = 10000, maxMs = 25000): Promise<void> {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs
  return new Promise(resolve => setTimeout(resolve, delay))
}

export function appointmentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    waiting: 'Bekliyor',
    confirmed: 'Onaylandı',
    canceled: 'İptal Edildi',
    completed: 'Tamamlandı',
    cancelled_by_patient: 'Hasta İptal Etti',
    seansify_pending: 'Bot Talebi',
    no_show: 'Tamamlanamadı',
  }
  return map[status] ?? status
}

export function appointmentStatusColor(status: string): string {
  const map: Record<string, string> = {
    waiting: 'bg-amber-100 text-amber-800',
    confirmed: 'bg-green-100 text-green-800',
    canceled: 'bg-red-100 text-red-800',
    completed: 'bg-slate-100 text-slate-600',
    cancelled_by_patient: 'bg-red-100 text-red-700',
    seansify_pending: 'bg-amber-100 text-amber-800',
    no_show: 'bg-yellow-100 text-yellow-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

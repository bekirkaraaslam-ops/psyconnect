import { PlanType } from '@/types'

export interface PlanLimits {
  maxActivePatients: number
  monthlyWaMessages: number
  monthlyFormSends: number
  soapHistoryDays: number
  reportMonths: number
  maxBlogPosts: number
  profileWatermark: boolean
}

const ONE_LIMITS: PlanLimits = {
  maxActivePatients: 20,
  monthlyWaMessages: 60,
  monthlyFormSends: 15,
  soapHistoryDays: 90,
  reportMonths: 3,
  maxBlogPosts: 5,
  profileWatermark: true,
}

const PRO_LIMITS: PlanLimits = {
  maxActivePatients: Infinity,
  monthlyWaMessages: Infinity,
  monthlyFormSends: Infinity,
  soapHistoryDays: Infinity,
  reportMonths: Infinity,
  maxBlogPosts: Infinity,
  profileWatermark: false,
}

export function getLimits(planType: string): PlanLimits {
  if (planType === 'pro') return PRO_LIMITS
  return ONE_LIMITS
}

export function isProPlan(planType: string): boolean {
  return planType === 'pro'
}

export function planDisplayName(planType: string): string {
  if (planType === 'pro') return 'Seansify Pro'
  return 'Seansify One'
}

export function startOfCurrentMonth(): string {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

import Script from 'next/script'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'
import { createClient } from '@/lib/supabase/server'
import { PlanType } from '@/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let planType: PlanType = 'free'
  if (user) {
    const { data: psych } = await supabase
      .from('psychologists')
      .select('plan_type')
      .eq('auth_user_id', user.id)
      .single()
    if (psych?.plan_type) planType = psych.plan_type as PlanType
  }

  return (
    <>
      <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="afterInteractive" />
      <div className="flex min-h-screen" style={{ background: '#F0F4F2' }}>
        <Sidebar planType={planType} />
        <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
          {children}
        </div>
        <MobileNav />
      </div>
    </>
  )
}

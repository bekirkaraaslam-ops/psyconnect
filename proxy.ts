import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const protectedRoutes = ['/dashboard', '/appointments', '/patients', '/whatsapp', '/settings']
const authRoutes = ['/login', '/register']

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isProtectedRoute = protectedRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))
  const isAuthRoute = authRoutes.some(r => pathname.startsWith(r))

  // Optimistic check: Supabase session cookie var mı?
  const hasSession = request.cookies.getAll().some(
    c => c.name.includes('-auth-token') && c.value.length > 10
  )

  // Giriş yapmış kullanıcı / veya auth sayfasına gelirse dashboard'a yönlendir
  if (hasSession && (pathname === '/' || isAuthRoute)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Giriş yapmamış kullanıcı korumalı sayfaya girerse login'e yönlendir
  if (!hasSession && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Korumalı sayfalarda session refresh yap
  if (isProtectedRoute) {
    return await updateSession(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

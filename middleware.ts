import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const protectedRoutes = ['/dashboard', '/appointments', '/patients', '/whatsapp', '/settings', '/calendar', '/waiting-list', '/raporlar']
const authRoutes = ['/login', '/register']

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? 'seansify.com'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') ?? ''

  // Psikolog subdomain routing: ayse.seansify.com → /ayse
  const isSubdomain =
    hostname !== ROOT_DOMAIN &&
    hostname !== `www.${ROOT_DOMAIN}` &&
    !hostname.includes('localhost') &&
    !hostname.includes('netlify.app') &&
    hostname.endsWith(`.${ROOT_DOMAIN}`)

  if (isSubdomain) {
    const slug = hostname.replace(`.${ROOT_DOMAIN}`, '')
    const url = request.nextUrl.clone()
    url.pathname = `/${slug}${pathname === '/' ? '' : pathname}`
    return NextResponse.rewrite(url)
  }

  const isProtectedRoute = protectedRoutes.some(r => pathname === r || pathname.startsWith(r + '/'))
  const isAuthRoute = authRoutes.some(r => pathname.startsWith(r))

  // Optimistic check: Supabase session cookie var mı?
  const hasSession = request.cookies.getAll().some(
    c => c.name.includes('-auth-token') && c.value.length > 10
  )

  // Auth sayfalarında ve landing page'de gerçek session doğrulaması yap
  // (landing page: giriş yapmış kullanıcıyı dashboard'a yönlendirmek için)
  if (isAuthRoute || pathname === '/') {
    return await updateSession(request)
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

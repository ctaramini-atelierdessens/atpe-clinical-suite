import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PREFIXES = ['/patients', '/groups', '/clinical-admin']
const AUTH_PAGES = ['/login']

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

function hasSupabaseAuthCookies(request: NextRequest) {
  const cookieNames = request.cookies.getAll().map((cookie) => cookie.name)

  return cookieNames.some(
    (name) =>
      name.includes('sb-') &&
      (name.endsWith('-auth-token') ||
        name.endsWith('-access-token') ||
        name.endsWith('-refresh-token') ||
        name.includes('auth-token')),
  )
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const isProtected = startsWithAny(pathname, PROTECTED_PREFIXES)
  const isAuthPage = startsWithAny(pathname, AUTH_PAGES)
  const isLoggedIn = hasSupabaseAuthCookies(request)

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', request.url)
    const nextValue = `${pathname}${search || ''}`
    loginUrl.searchParams.set('next', nextValue)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/patients',
    '/patients/:path*',
    '/groups',
    '/groups/:path*',
    '/clinical-admin',
    '/clinical-admin/:path*',
    '/login',
  ],
}
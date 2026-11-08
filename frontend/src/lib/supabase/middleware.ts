import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

const PROTECTED_PREFIXES = [
  '/ai-assessment',
  '/assessment',
  '/predict',
  '/patient',
  '/healthcare-worker',
  '/clinical',
  '/admin',
  '/profile',
]

const AUTH_PAGES = [
  '/login',
  '/register',
  '/forgot-password',
]

/**
 * Refreshes auth tokens on incoming requests, enforces session persistence,
 * and handles server-side route guards and redirects.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { pathname } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  const isAuthPage = AUTH_PAGES.some((path) => pathname === path)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const hasDemoAuth = request.cookies.get('lungent_auth_demo')?.value === 'true'

  // If Supabase credentials are missing (e.g. local preview or dev)
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtected && !hasDemoAuth) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirect', pathname)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    if (isAuthPage && hasDemoAuth) {
      const target =
        request.nextUrl.searchParams.get('redirect') ||
        request.nextUrl.searchParams.get('redirectTo') ||
        request.nextUrl.searchParams.get('next') ||
        '/ai-assessment'
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = target
      redirectUrl.searchParams.delete('redirect')
      redirectUrl.searchParams.delete('redirectTo')
      redirectUrl.searchParams.delete('next')
      return NextResponse.redirect(redirectUrl)
    }
    return supabaseResponse
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = Boolean(user || hasDemoAuth)

  // Guard protected routes (including /ai-assessment)
  if (isProtected && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', pathname)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from login/register
  if (isAuthPage && isAuthenticated) {
    const target =
      request.nextUrl.searchParams.get('redirect') ||
      request.nextUrl.searchParams.get('redirectTo') ||
      request.nextUrl.searchParams.get('next') ||
      '/ai-assessment'
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = target
    redirectUrl.searchParams.delete('redirect')
    redirectUrl.searchParams.delete('redirectTo')
    redirectUrl.searchParams.delete('next')
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

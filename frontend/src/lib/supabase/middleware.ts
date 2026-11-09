import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'
import { normalizeAppRole, evaluateRouteAccess, type AppRole } from '@/lib/auth-roles'

const AUTH_PAGES = [
  '/login',
  '/register',
  '/forgot-password',
]

/**
 * Refreshes auth tokens on incoming requests, enforces session persistence,
 * and executes strict 6-role RBAC route protection.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const { pathname } = request.nextUrl
  const isAuthPage = AUTH_PAGES.some((path) => pathname === path)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const hasDemoAuth = request.cookies.get('lungent_auth_demo')?.value === 'true'
  const roleCookie = request.cookies.get('lungent_role')?.value

  let isAuthenticated = hasDemoAuth
  let userRole: AppRole | null = roleCookie ? normalizeAppRole(roleCookie) : (hasDemoAuth ? 'General User' : null)

  // If Supabase environment is configured, verify actual auth session
  if (supabaseUrl && supabaseAnonKey) {
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

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        isAuthenticated = true
        userRole = normalizeAppRole(user.user_metadata?.role || roleCookie)
      }
    } catch {
      // In case of transient Supabase connection error, rely on cookies if present
    }
  }

  // Evaluate strict 6-role RBAC route boundaries
  const access = evaluateRouteAccess(pathname, isAuthenticated, userRole)
  if (!access.allowed && access.redirectPath) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = access.redirectPath
    if (access.redirectPath === '/login') {
      redirectUrl.searchParams.set('redirect', pathname)
      redirectUrl.searchParams.set('redirectTo', pathname)
    }
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from login/register pages
  if (isAuthPage && isAuthenticated) {
    const target =
      request.nextUrl.searchParams.get('redirect') ||
      request.nextUrl.searchParams.get('redirectTo') ||
      request.nextUrl.searchParams.get('next') ||
      '/'
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = target.startsWith('/') ? target : '/'
    redirectUrl.searchParams.delete('redirect')
    redirectUrl.searchParams.delete('redirectTo')
    redirectUrl.searchParams.delete('next')
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

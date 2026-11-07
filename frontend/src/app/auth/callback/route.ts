import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') || '/patient'

  if (code) {
    const cookieStore = await cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
                // Handled in server response
              }
            },
          },
        }
      )

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.user) {
        // If password recovery link, direct to reset screen
        if (type === 'recovery') {
          return NextResponse.redirect(`${origin}/reset-password`)
        }

        // If email verification, activate user profile
        try {
          await supabase
            .from('user_profiles')
            .update({ status: 'active', updated_at: new Date().toISOString() })
            .eq('auth_user_id', data.user.id)
            .eq('status', 'pending_verification')
        } catch {
          // Continue if already active
        }

        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // If code exchange failed or expired
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

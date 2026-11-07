import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Checks whether Supabase environment credentials have been supplied.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== '' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() !== ''
  )
}

/**
 * Creates a browser-side Supabase client with public anon key.
 * This client is safe for use in Client Components.
 * Falls back to a non-crashing placeholder if environment variables are not configured.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return createBrowserClient<Database>(
      'https://placeholder-auth.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}

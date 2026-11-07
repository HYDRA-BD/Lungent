import 'server-only'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Creates an administrative Supabase client using the service role key.
 * 
 * CRITICAL SECURITY NOTICE:
 * This client bypasses Row Level Security (RLS) and possesses full administrative privileges.
 * - It is strictly guarded by 'server-only'.
 * - NEVER import or execute this client in client-facing code or expose its credentials.
 * - Restrict usage to trusted server workflows (e.g. system jobs, seed routines, administrative webhooks).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase administrative credentials: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in server environment.'
    )
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

import 'server-only'
import { createClient as createServerClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database'

export type AuditAction =
  | 'user.registered'
  | 'user.login'
  | 'user.logout'
  | 'user.password_reset_request'
  | 'user.password_reset_completed'
  | 'user.email_verified'
  | 'user.profile_updated'
  | 'user.suspended'
  | 'user.activated'
  | 'user.role_assigned'
  | 'user.role_removed'

export interface LogAuditEventParams {
  action: AuditAction
  actorId?: string | null
  targetUserId?: string | null
  details?: Record<string, Json>
  ipAddress?: string | null
}

/**
 * Records an immutable security audit event.
 * Never logs passwords, recovery tokens, or raw credentials.
 */
export async function logAuditEvent({
  action,
  actorId = null,
  targetUserId = null,
  details = {},
  ipAddress = null,
}: LogAuditEventParams): Promise<void> {
  try {
    const supabase = await createServerClient()
    await supabase.from('audit_logs').insert({
      action,
      actor_id: actorId,
      target_user_id: targetUserId,
      details,
      ip_address: ipAddress,
    })
  } catch (error) {
    // Audit failures should be recorded to server error telemetry without blocking the flow
    console.error(`[Security Audit Error] Failed to log action ${action}:`, error)
  }
}

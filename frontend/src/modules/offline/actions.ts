'use server'

import { createClient } from '@/lib/supabase/server'
import type { SyncPayload, SyncResponse, ConflictResolution } from './types'
import type { AssessmentType, Json } from '@/types/database'

/**
 * Server action to process an offline draft sync submission.
 * Enforces server-side authentication, authorization, duplicate prevention, and conflict detection.
 */
export async function syncAssessmentDraftAction(
  payload: SyncPayload
): Promise<SyncResponse> {
  const supabase = await createClient()

  // 1. Authentication and Authorization Check
  let currentUserId: string | null = null
  let userRole: string | null = null

  if (payload.formType !== 'self_check' || payload.userId !== 'anonymous') {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        status: 'auth_required',
        draftId: payload.draftId,
        clientOperationId: payload.clientOperationId,
        error: 'Authentication is required to synchronize protected patient assessment records.',
      }
    }

    currentUserId = user.id

    // Fetch user profile and roles
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle()

    const userProfileId = profile?.id || user.id
    currentUserId = userProfileId

    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userProfileId)

    const roles = (rolesData || []).map((r) => r.role_id)
    userRole = roles.includes('clinician')
      ? 'clinician'
      : roles.includes('healthcare_worker')
        ? 'healthcare_worker'
        : 'patient'

    // Patient authorization check
    if (userRole === 'patient') {
      const { data: patientRecord } = await supabase
        .from('patients')
        .select('id')
        .eq('associated_user_profile_id', userProfileId)
        .maybeSingle()

      if (!patientRecord || (payload.patientId && patientRecord.id !== payload.patientId)) {
        return {
          success: false,
          status: 'sync_failed',
          draftId: payload.draftId,
          clientOperationId: payload.clientOperationId,
          error: 'Unauthorized: Patient can only synchronize assessments for their own profile.',
        }
      }
    }
  }

  // 2. Idempotency Check (Duplicate Prevention)
  const { data: existingOp } = await supabase
    .from('assessment_sync_operations')
    .select('*')
    .eq('client_operation_id', payload.clientOperationId)
    .maybeSingle()

  if (existingOp && existingOp.status === 'completed') {
    return {
      success: true,
      status: 'synced',
      draftId: payload.draftId,
      clientOperationId: payload.clientOperationId,
      serverAssessmentId: existingOp.server_assessment_id || undefined,
      serverVersion: existingOp.server_version,
      isDuplicate: true,
    }
  }

  // 3. Conflict Detection (Optimistic Concurrency Control)
  if (payload.patientId && payload.baseVersion > 0) {
    const { data: latestAssessment } = await supabase
      .from('patient_assessments')
      .select('id, version, updated_at, assessment_type')
      .eq('patient_id', payload.patientId)
      .eq('assessment_type', payload.assessmentType as AssessmentType)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestAssessment && latestAssessment.version > payload.baseVersion) {
      // Conflicting concurrent update detected on server!
      const conflictDetails = {
        serverVersion: latestAssessment.version,
        serverUpdatedAt: latestAssessment.updated_at,
        serverData: { assessmentType: latestAssessment.assessment_type },
        clientData: payload.data,
        conflictingFields: ['assessment_version', 'intake_responses'],
        detectedAt: new Date().toISOString(),
      }

      await supabase.from('assessment_sync_operations').upsert({
        client_operation_id: payload.clientOperationId,
        draft_id: payload.draftId,
        user_id: currentUserId,
        patient_id: payload.patientId,
        assessment_type: payload.assessmentType,
        form_data: payload.data as unknown as Json,
        status: 'conflict',
        base_version: payload.baseVersion,
        server_version: latestAssessment.version,
        conflict_details: conflictDetails as unknown as Json,
        client_created_at: payload.clientCreatedAt,
        client_updated_at: payload.clientUpdatedAt,
      })

      return {
        success: false,
        status: 'conflict_detected',
        draftId: payload.draftId,
        clientOperationId: payload.clientOperationId,
        serverVersion: latestAssessment.version,
        conflictDetails,
        error: 'A newer version of this assessment was updated on the server. Please review and resolve the conflict.',
      }
    }
  }

  // 4. Server-Side Ingestion and Assessment Record Creation
  let newAssessmentId = crypto.randomUUID()
  const newVersion = payload.baseVersion + 1

  if (payload.patientId) {
    const summaryText = `Synchronized ${payload.assessmentType.replace(/_/g, ' ')} intake recorded offline at ${new Date(payload.clientCreatedAt).toLocaleString('en-US')}.`

    const { data: insertedAssessment, error: insertError } = await supabase
      .from('patient_assessments')
      .insert({
        id: newAssessmentId,
        patient_id: payload.patientId,
        assessment_type: payload.assessmentType as AssessmentType,
        status: 'submitted',
        initiated_at: payload.clientCreatedAt,
        submitted_at: new Date().toISOString(),
        facility_id: payload.facilityId || 'facility-dhaka-central',
        summary: summaryText,
        results: {
          offlineSynced: true,
          clientOperationId: payload.clientOperationId,
          formData: payload.data,
        } as unknown as Json,
        client_operation_id: payload.clientOperationId,
        version: newVersion,
      })
      .select('id')
      .single()

    if (insertError) {
      return {
        success: false,
        status: 'sync_failed',
        draftId: payload.draftId,
        clientOperationId: payload.clientOperationId,
        error: `Failed to create server assessment: ${insertError.message}`,
      }
    }

    newAssessmentId = insertedAssessment.id
  }

  // 5. Record Sync Operation Audit
  await supabase.from('assessment_sync_operations').upsert({
    client_operation_id: payload.clientOperationId,
    draft_id: payload.draftId,
    user_id: currentUserId,
    patient_id: payload.patientId || '00000000-0000-0000-0000-000000000000',
    assessment_type: payload.assessmentType,
    form_data: payload.data as unknown as Json,
    status: 'completed',
    server_assessment_id: payload.patientId ? newAssessmentId : null,
    base_version: payload.baseVersion,
    server_version: newVersion,
    client_created_at: payload.clientCreatedAt,
    client_updated_at: payload.clientUpdatedAt,
    synced_at: new Date().toISOString(),
  })

  return {
    success: true,
    status: 'synced',
    draftId: payload.draftId,
    clientOperationId: payload.clientOperationId,
    serverAssessmentId: payload.patientId ? newAssessmentId : undefined,
    serverVersion: newVersion,
  }
}

/**
 * Server action to resolve a conflicting draft update.
 */
export async function resolveConflictAction(
  resolution: ConflictResolution
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Authentication required to resolve sync conflicts.' }
  }

  const { data: syncOp } = await supabase
    .from('assessment_sync_operations')
    .select('*')
    .eq('client_operation_id', resolution.clientOperationId)
    .single()

  if (!syncOp) {
    return { success: false, error: 'Target sync operation not found.' }
  }

  if (resolution.choice === 'use_server') {
    // Discard client changes and keep server record
    await supabase
      .from('assessment_sync_operations')
      .update({
        status: 'completed',
        resolved_by: user.id,
        resolution_notes: resolution.resolutionNotes || 'Resolved using server version.',
        updated_at: new Date().toISOString(),
      })
      .eq('id', syncOp.id)

    return { success: true }
  }

  // Apply client overwrite or merged data
  const dataToApply = resolution.resolvedData || syncOp.form_data
  const nextVersion = syncOp.server_version + 1

  if (syncOp.server_assessment_id) {
    await supabase
      .from('patient_assessments')
      .update({
        version: nextVersion,
        results: {
          offlineSynced: true,
          resolvedConflict: true,
          resolutionChoice: resolution.choice,
          formData: dataToApply,
        } as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', syncOp.server_assessment_id)
  }

  await supabase
    .from('assessment_sync_operations')
    .update({
      status: 'completed',
      server_version: nextVersion,
      form_data: dataToApply as unknown as Json,
      resolved_by: user.id,
      resolution_notes: resolution.resolutionNotes || `Resolved using ${resolution.choice}.`,
      synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', syncOp.id)

  return { success: true }
}

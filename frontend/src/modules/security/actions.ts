'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUserWithRoles } from '@/modules/authentication/service'
import { CentralSecurityService } from './service'
import type {
  AuditSeverity,
  AuditOutcome,
  PrivacyRequestType,
  PrivacyRequestStatus,
  ConsentCategory,
  ConsentCollectionMethod,
  IncidentCategory,
  IncidentSeverity,
  IncidentStatus,
} from './types'

async function resolveActor() {
  const user = await getCurrentUserWithRoles().catch(() => null)
  return {
    id: user?.id || 'usr-sec-officer-01',
    name: user?.full_name || 'Chief Security & Compliance Officer',
    role: (user?.roles?.[0] || 'administrator') as string,
  }
}

export async function logSecurityEventAction(params: {
  eventType: string
  severity: AuditSeverity
  outcome: AuditOutcome
  targetResource?: string | null
  facilityId?: string | null
  metadata?: Record<string, unknown>
}) {
  try {
    const actor = await resolveActor()
    const event = await CentralSecurityService.logSecurityEvent({
      ...params,
      actorId: actor.id,
      actorRole: actor.role,
    })
    return { success: true, data: event }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record security event'
    return { success: false, error: message }
  }
}

export async function submitPrivacyRequestAction(data: {
  patientId: string
  requestType: PrivacyRequestType
  requestDetails: string
}) {
  try {
    const actor = await resolveActor()
    const request = await CentralSecurityService.submitPrivacyRequest({
      ...data,
      actorId: actor.id,
    })

    revalidatePath('/admin/security')
    revalidatePath('/patient/privacy')
    return { success: true, data: request }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit privacy request'
    return { success: false, error: message }
  }
}

export async function reviewPrivacyRequestAction(
  requestId: string,
  status: PrivacyRequestStatus,
  reviewNotes: string,
  retentionHoldApplied: boolean = false,
  retentionHoldReason?: string
) {
  try {
    const actor = await resolveActor()
    const request = await CentralSecurityService.reviewPrivacyRequest(
      requestId,
      status,
      reviewNotes,
      actor.name,
      retentionHoldApplied,
      retentionHoldReason
    )

    revalidatePath('/admin/security')
    revalidatePath('/patient/privacy')
    return { success: true, data: request }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to review privacy request'
    return { success: false, error: message }
  }
}

export async function recordConsentAction(data: {
  patientId: string
  consentCategory: ConsentCategory
  purpose: string
  isGranted: boolean
  collectionMethod: ConsentCollectionMethod
  witnessId?: string
}) {
  try {
    const consent = await CentralSecurityService.recordConsent(data)
    revalidatePath('/patient/privacy')
    revalidatePath('/admin/security')
    return { success: true, data: consent }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record consent'
    return { success: false, error: message }
  }
}

export async function withdrawConsentAction(
  patientId: string,
  consentCategory: ConsentCategory,
  reason: string
) {
  try {
    const consent = await CentralSecurityService.withdrawConsent(
      patientId,
      consentCategory,
      reason
    )
    revalidatePath('/patient/privacy')
    revalidatePath('/admin/security')
    return { success: true, data: consent }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to withdraw consent'
    return { success: false, error: message }
  }
}

export async function reportIncidentAction(data: {
  title: string
  category: IncidentCategory
  severity: IncidentSeverity
  affectedSystems: string[]
  containmentNotes?: string
}) {
  try {
    const actor = await resolveActor()
    const incident = await CentralSecurityService.reportIncident({
      ...data,
      reporterId: actor.id,
      reporterName: actor.name,
    })

    revalidatePath('/admin/security')
    return { success: true, data: incident }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to report security incident'
    return { success: false, error: message }
  }
}

export async function updateIncidentStatusAction(
  incidentId: string,
  status: IncidentStatus,
  notes: string
) {
  try {
    const actor = await resolveActor()
    const incident = await CentralSecurityService.updateIncidentStatus(
      incidentId,
      status,
      notes,
      actor.id
    )

    revalidatePath('/admin/security')
    return { success: true, data: incident }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update incident'
    return { success: false, error: message }
  }
}

export async function getSecurityDashboardDataAction() {
  try {
    const [
      summary,
      auditLogs,
      privacyRequests,
      incidents,
      retentionPolicies,
      complianceControls,
      backupVerifications,
    ] = await Promise.all([
      CentralSecurityService.getSecurityDashboardSummary(),
      CentralSecurityService.getSecurityAuditLogs({ limit: 50 }),
      CentralSecurityService.getPrivacyRequests(),
      CentralSecurityService.getIncidents(),
      CentralSecurityService.getRetentionPolicies(),
      CentralSecurityService.getComplianceControls(),
      CentralSecurityService.getBackupVerifications(),
    ])

    return {
      success: true,
      data: {
        summary,
        auditLogs,
        privacyRequests,
        incidents,
        retentionPolicies,
        complianceControls,
        backupVerifications,
      },
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load security dashboard data'
    return { success: false, error: message }
  }
}


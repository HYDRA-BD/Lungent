'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUserWithRoles } from '@/modules/authentication/service'
import { ClinicalGovernanceService } from './service'
import type {
  GovernanceLifecycleStatus,
  OverrideReasonCategory,
  ClinicianOverrideRecord,
} from './types'

async function resolveActor() {
  const user = await getCurrentUserWithRoles().catch(() => null)
  return {
    id: user?.id || 'usr-cab-chair-01',
    name: user?.full_name || 'Prof. Dr. Farhana Ahmed',
    role: (user?.roles?.[0] || 'chair') as string,
  }
}

export async function transitionLifecycleAction(
  versionId: string,
  targetStatus: GovernanceLifecycleStatus,
  justification: string,
  meetingReference?: string
) {
  try {
    const actor = await resolveActor()
    const updated = await ClinicalGovernanceService.transitionLifecycle(
      versionId,
      targetStatus,
      actor,
      justification,
      meetingReference
    )

    revalidatePath('/clinical/governance')
    revalidatePath('/admin/governance')
    return { success: true, data: updated }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to transition lifecycle status'
    return { success: false, error: message }
  }
}

export async function recordClinicianOverrideAction(input: {
  assessmentId: string
  patientId: string
  facilityId?: string | null
  engineSubsystem: ClinicianOverrideRecord['engineSubsystem']
  methodologyVersionId?: string | null
  automatedResult: Record<string, unknown>
  overriddenResult: Record<string, unknown>
  overrideReasonCategory: OverrideReasonCategory
  overrideRationale: string
}) {
  try {
    const actor = await resolveActor()
    const record = await ClinicalGovernanceService.recordClinicianOverride({
      ...input,
      clinicianId: actor.id,
      clinicianName: actor.name,
    })

    revalidatePath('/clinical/governance')
    return { success: true, data: record }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record clinician override'
    return { success: false, error: message }
  }
}

export async function verifyMemberCredentialsAction(memberId: string) {
  try {
    const actor = await resolveActor()
    const updated = await ClinicalGovernanceService.verifyMemberCredentials(
      memberId,
      actor.id,
      actor.role
    )

    revalidatePath('/clinical/governance')
    return { success: true, data: updated }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to verify member credentials'
    return { success: false, error: message }
  }
}

export async function recordReviewOutcomeAction(
  versionId: string,
  outcome: 'continued_use' | 'revision_required' | 'suspended' | 'deprecated',
  notes: string
) {
  try {
    const actor = await resolveActor()
    const updated = await ClinicalGovernanceService.recordReviewOutcome(
      versionId,
      outcome,
      notes,
      actor
    )

    revalidatePath('/clinical/governance')
    return { success: true, data: updated }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record review outcome'
    return { success: false, error: message }
  }
}

export async function getGovernanceDashboardDataAction() {
  try {
    const [summary, methodologies, members, meetings, overrides, reviewSchedule, auditEvents] =
      await Promise.all([
        ClinicalGovernanceService.getDashboardSummary(),
        ClinicalGovernanceService.getMethodologies(),
        ClinicalGovernanceService.getMembers(),
        ClinicalGovernanceService.getMeetings(),
        ClinicalGovernanceService.getClinicianOverrides(),
        ClinicalGovernanceService.getPeriodicReviewSchedule(),
        ClinicalGovernanceService.getAuditEvents(),
      ])

    return {
      success: true,
      data: {
        summary,
        methodologies,
        members,
        meetings,
        overrides,
        reviewSchedule,
        auditEvents,
      },
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load governance data'
    return { success: false, error: message }
  }
}

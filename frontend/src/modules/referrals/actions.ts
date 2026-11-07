'use server'

import { revalidatePath } from 'next/cache'
import { getCurrentUserWithRoles } from '@/modules/authentication/service'
import { ReferralService, FollowUpService } from './service'
import {
  createReferralSchema,
  updateReferralStatusSchema,
  assignReferralSchema,
  scheduleFollowUpSchema,
  rescheduleFollowUpSchema,
  updateFollowUpStatusSchema,
} from './validation'
import type {
  CreateReferralInput,
  UpdateReferralStatusInput,
  AssignReferralInput,
  ScheduleFollowUpInput,
  RescheduleFollowUpInput,
  UpdateFollowUpStatusInput,
  ReferralPriority,
  ReferralLifecycleStatus,
  PatientFollowUpStatus,
} from './types'

async function resolveActorUser() {
  const user = await getCurrentUserWithRoles().catch(() => null)
  return {
    id: user?.id || 'usr-clinician-001',
    name: user?.full_name || 'Dr. Clinical User',
    role: (user?.roles?.[0] || 'clinician') as string,
  }
}

export async function createReferralAction(rawInput: CreateReferralInput) {
  try {
    const validated = createReferralSchema.parse(rawInput)
    const actor = await resolveActorUser()

    const referral = await ReferralService.createReferral(validated, actor)

    revalidatePath('/clinical/referrals')
    revalidatePath('/healthcare-worker/referrals')
    revalidatePath('/patient/referrals')
    if (referral.patientId) {
      revalidatePath(`/clinical/patients/${referral.patientId}`)
      revalidatePath(`/healthcare-worker/patients/${referral.patientId}`)
    }

    return { success: true, data: referral }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create healthcare referral'
    return { success: false, error: message }
  }
}

export async function getReferralsAction(options: {
  patientId?: string
  referringFacilityId?: string
  destinationFacilityId?: string
  priority?: ReferralPriority
  status?: ReferralLifecycleStatus
  search?: string
} = {}) {
  try {
    const referrals = await ReferralService.getReferrals(options)
    return { success: true, data: referrals }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve referrals'
    return { success: false, error: message }
  }
}

export async function getReferralByIdAction(referralIdOrUuid: string) {
  try {
    const referral = await ReferralService.getReferralById(referralIdOrUuid)
    if (!referral) {
      return { success: false, error: 'Healthcare referral record not found' }
    }
    return { success: true, data: referral }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve referral details'
    return { success: false, error: message }
  }
}

export async function updateReferralStatusAction(rawInput: UpdateReferralStatusInput) {
  try {
    const validated = updateReferralStatusSchema.parse(rawInput)
    const actor = await resolveActorUser()

    const referral = await ReferralService.updateReferralStatus(validated, actor)

    revalidatePath('/clinical/referrals')
    revalidatePath('/healthcare-worker/referrals')
    revalidatePath('/patient/referrals')
    if (referral.patientId) {
      revalidatePath(`/clinical/patients/${referral.patientId}`)
      revalidatePath(`/healthcare-worker/patients/${referral.patientId}`)
    }

    return { success: true, data: referral }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update referral status'
    return { success: false, error: message }
  }
}

export async function assignReferralAction(rawInput: AssignReferralInput) {
  try {
    const validated = assignReferralSchema.parse(rawInput)
    const actor = await resolveActorUser()

    const referral = await ReferralService.assignReferral(validated, actor)

    revalidatePath('/clinical/referrals')
    revalidatePath('/healthcare-worker/referrals')
    return { success: true, data: referral }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to assign referral clinician'
    return { success: false, error: message }
  }
}

export async function scheduleFollowUpAction(rawInput: ScheduleFollowUpInput) {
  try {
    const validated = scheduleFollowUpSchema.parse(rawInput)
    const actor = await resolveActorUser()

    const followUp = await FollowUpService.scheduleFollowUp(validated, actor)

    revalidatePath('/clinical/referrals')
    revalidatePath('/healthcare-worker/referrals')
    revalidatePath('/patient/referrals')
    if (followUp.patientId) {
      revalidatePath(`/clinical/patients/${followUp.patientId}`)
      revalidatePath(`/healthcare-worker/patients/${followUp.patientId}`)
    }

    return { success: true, data: followUp }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to schedule follow-up appointment'
    return { success: false, error: message }
  }
}

export async function getFollowUpsAction(options: {
  patientId?: string
  referralId?: string
  status?: PatientFollowUpStatus
  facilityId?: string
  responsibleUserId?: string
} = {}) {
  try {
    const followUps = await FollowUpService.getFollowUps(options)
    return { success: true, data: followUps }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve follow-up appointments'
    return { success: false, error: message }
  }
}

export async function rescheduleFollowUpAction(rawInput: RescheduleFollowUpInput) {
  try {
    const validated = rescheduleFollowUpSchema.parse(rawInput)
    const actor = await resolveActorUser()

    const followUp = await FollowUpService.rescheduleFollowUp(validated, actor)

    revalidatePath('/clinical/referrals')
    revalidatePath('/healthcare-worker/referrals')
    revalidatePath('/patient/referrals')
    if (followUp.patientId) {
      revalidatePath(`/clinical/patients/${followUp.patientId}`)
      revalidatePath(`/healthcare-worker/patients/${followUp.patientId}`)
    }

    return { success: true, data: followUp }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reschedule follow-up appointment'
    return { success: false, error: message }
  }
}

export async function recordFollowUpOutcomeAction(rawInput: UpdateFollowUpStatusInput) {
  try {
    const validated = updateFollowUpStatusSchema.parse(rawInput)
    const actor = await resolveActorUser()

    const followUp = await FollowUpService.recordFollowUpOutcome(validated, actor)

    revalidatePath('/clinical/referrals')
    revalidatePath('/healthcare-worker/referrals')
    revalidatePath('/patient/referrals')
    if (followUp.patientId) {
      revalidatePath(`/clinical/patients/${followUp.patientId}`)
      revalidatePath(`/healthcare-worker/patients/${followUp.patientId}`)
    }

    return { success: true, data: followUp }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record follow-up outcome'
    return { success: false, error: message }
  }
}

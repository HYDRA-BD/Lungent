'use server'

import { revalidatePath } from 'next/cache'
import { PatientService } from './service'
import { getCurrentUserWithRoles } from '@/modules/authentication/service'
import type {
  CreatePatientInput,
  UpdatePatientInput,
  SearchPatientsInput,
  ReviewDuplicateInput,
  MergePatientsInput,
  LinkAccountInput,
  LinkAnonymousSelfCheckInput,
  PatientCandidateCriteria,
  PatientVerificationStatus,
} from './types'

export async function searchPatientsAction(input: SearchPatientsInput) {
  try {
    const result = await PatientService.searchPatients(input)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search patients'
    return { success: false, error: message }
  }
}

export async function searchBeforeRegisterAction(criteria: PatientCandidateCriteria) {
  try {
    const result = await PatientService.searchBeforeRegister(criteria)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Search verification failed'
    return { success: false, error: message }
  }
}

export async function registerPatientAction(input: CreatePatientInput) {
  try {
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id
    const primaryFacility = user?.facilities?.[0]?.facility_id || 'facility-dhaka-central'

    const result = await PatientService.registerPatient(input, actorId, primaryFacility)
    revalidatePath('/healthcare-worker/patients')
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to register patient'
    return { success: false, error: message }
  }
}

export async function updatePatientAction(id: string, input: UpdatePatientInput) {
  try {
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id

    const updated = await PatientService.updatePatientIdentity(id, input, actorId)
    revalidatePath(`/healthcare-worker/patients/${id}`)
    revalidatePath('/healthcare-worker/patients')
    return { success: true, data: updated }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update patient identity'
    return { success: false, error: message }
  }
}

export async function verifyPatientAction(
  id: string,
  status: PatientVerificationStatus,
  source: string
) {
  try {
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id || 'system-admin'

    const verified = await PatientService.verifyPatientIdentity(id, status, source, actorId)
    revalidatePath(`/healthcare-worker/patients/${id}`)
    return { success: true, data: verified }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to verify patient identity'
    return { success: false, error: message }
  }
}

export async function reviewDuplicateAction(input: ReviewDuplicateInput) {
  try {
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id || 'system-admin'

    const review = await PatientService.reviewDuplicateCandidate(input, actorId)
    revalidatePath('/healthcare-worker/patients/duplicates')
    return { success: true, data: review }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record duplicate review'
    return { success: false, error: message }
  }
}

export async function mergePatientsAction(input: MergePatientsInput) {
  try {
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id || 'system-admin'

    const mergeResult = await PatientService.mergePatientRecords(input, actorId)
    revalidatePath('/healthcare-worker/patients')
    revalidatePath('/healthcare-worker/patients/duplicates')
    return { success: true, data: mergeResult }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to execute record merge'
    return { success: false, error: message }
  }
}

export async function linkAccountAction(input: LinkAccountInput) {
  try {
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id || 'system-admin'

    const linked = await PatientService.linkPatientToUserAccount(input, actorId)
    revalidatePath(`/healthcare-worker/patients/${input.patientId}`)
    return { success: true, data: linked }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to link account'
    return { success: false, error: message }
  }
}

export async function linkAnonymousSelfCheckAction(input: LinkAnonymousSelfCheckInput) {
  try {
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id

    const result = await PatientService.linkAnonymousSelfCheck(input, actorId)
    revalidatePath(`/healthcare-worker/patients/${input.patientId}`)
    return { success: true, data: result }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to link anonymous self-check'
    return { success: false, error: message }
  }
}

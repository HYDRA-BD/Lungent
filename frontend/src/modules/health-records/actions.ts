'use server'

import { revalidatePath } from 'next/cache'
import { HealthRecordService } from './service'
import { getCurrentUserWithRoles } from '@/modules/authentication/service'
import {
  medicalConditionSchema,
  medicationSchema,
  allergySchema,
  smokingHistorySchema,
  environmentalExposureSchema,
  familyHistorySchema,
  lifestyleSchema,
  measurementSchema,
  symptomSchema,
  clinicianReviewSchema,
} from './validation'

export async function getHealthRecordAction(patientId: string) {
  try {
    const record = await HealthRecordService.getComprehensiveHealthRecord(patientId)
    return { success: true, data: record }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve health record'
    return { success: false, error: message }
  }
}

export async function addMedicalConditionAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = medicalConditionSchema.parse(rawInput)
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id || null
    const facilityId = user?.facilities?.[0]?.facility_id || 'facility-dhaka-central'

    const result = await HealthRecordService.addMedicalCondition(
      patientId,
      parsed,
      actorId,
      facilityId
    )
    revalidatePath(`/healthcare-worker/patients/${patientId}/health-record`)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save medical condition'
    return { success: false, error: message }
  }
}

export async function addMedicationAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = medicationSchema.parse(rawInput)
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id || null
    const facilityId = user?.facilities?.[0]?.facility_id || 'facility-dhaka-central'

    const result = await HealthRecordService.addMedication(patientId, parsed, actorId, facilityId)
    revalidatePath(`/healthcare-worker/patients/${patientId}/health-record`)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save medication'
    return { success: false, error: message }
  }
}

export async function addAllergyAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = allergySchema.parse(rawInput)
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id || null
    const facilityId = user?.facilities?.[0]?.facility_id || 'facility-dhaka-central'

    const result = await HealthRecordService.addAllergy(patientId, parsed, actorId, facilityId)
    revalidatePath(`/healthcare-worker/patients/${patientId}/health-record`)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record allergy'
    return { success: false, error: message }
  }
}

export async function saveSmokingHistoryAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = smokingHistorySchema.parse(rawInput)
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id || null
    const facilityId = user?.facilities?.[0]?.facility_id || 'facility-dhaka-central'

    const result = await HealthRecordService.saveSmokingHistory(
      patientId,
      parsed,
      actorId,
      facilityId
    )
    revalidatePath(`/healthcare-worker/patients/${patientId}/health-record`)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save smoking history'
    return { success: false, error: message }
  }
}

export async function addEnvironmentalExposureAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = environmentalExposureSchema.parse(rawInput)
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id || null
    const facilityId = user?.facilities?.[0]?.facility_id || 'facility-dhaka-central'

    const result = await HealthRecordService.addEnvironmentalExposure(
      patientId,
      parsed,
      actorId,
      facilityId
    )
    revalidatePath(`/healthcare-worker/patients/${patientId}/health-record`)
    return { success: true, data: result }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to save environmental exposure'
    return { success: false, error: message }
  }
}

export async function addFamilyHistoryAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = familyHistorySchema.parse(rawInput)
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id || null
    const facilityId = user?.facilities?.[0]?.facility_id || 'facility-dhaka-central'

    const result = await HealthRecordService.addFamilyHistory(
      patientId,
      parsed,
      actorId,
      facilityId
    )
    revalidatePath(`/healthcare-worker/patients/${patientId}/health-record`)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record family history'
    return { success: false, error: message }
  }
}

export async function saveLifestyleAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = lifestyleSchema.parse(rawInput)
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id || null
    const facilityId = user?.facilities?.[0]?.facility_id || 'facility-dhaka-central'

    const result = await HealthRecordService.saveLifestyle(patientId, parsed, actorId, facilityId)
    revalidatePath(`/healthcare-worker/patients/${patientId}/health-record`)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update lifestyle information'
    return { success: false, error: message }
  }
}

export async function recordMeasurementAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = measurementSchema.parse(rawInput)
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id || null
    const facilityId = user?.facilities?.[0]?.facility_id || 'facility-dhaka-central'

    const result = await HealthRecordService.recordMeasurement(
      patientId,
      parsed,
      actorId,
      facilityId
    )
    revalidatePath(`/healthcare-worker/patients/${patientId}/health-record`)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record measurement'
    return { success: false, error: message }
  }
}

export async function recordSymptomAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = symptomSchema.parse(rawInput)
    const user = await getCurrentUserWithRoles()
    const actorId = user?.id || null
    const facilityId = user?.facilities?.[0]?.facility_id || 'facility-dhaka-central'

    const result = await HealthRecordService.recordSymptom(patientId, parsed, actorId, facilityId)
    revalidatePath(`/healthcare-worker/patients/${patientId}/health-record`)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to record symptom'
    return { success: false, error: message }
  }
}

export async function submitClinicianReviewAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = clinicianReviewSchema.parse(rawInput)
    const user = await getCurrentUserWithRoles()
    const reviewerId = user?.id || 'usr-clinician-001'
    const facilityId = user?.facilities?.[0]?.facility_id || 'facility-dhaka-central'

    const result = await HealthRecordService.submitClinicianReview(
      patientId,
      {
        ...parsed,
        reviewerName: user?.full_name || 'Attending Clinician',
        reviewerRole: user?.roles?.[0] || 'clinician',
      },
      reviewerId,
      facilityId
    )
    revalidatePath(`/healthcare-worker/patients/${patientId}/health-record`)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit review'
    return { success: false, error: message }
  }
}

export async function getPointInTimeSnapshotAction(
  patientId: string,
  asOfIsoTimestamp: string
) {
  try {
    const result = await HealthRecordService.getPointInTimeSnapshot(patientId, asOfIsoTimestamp)
    return { success: true, data: result }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to retrieve point-in-time snapshot'
    return { success: false, error: message }
  }
}

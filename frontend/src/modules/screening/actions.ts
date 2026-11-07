'use server'

import { revalidatePath } from 'next/cache'
import { ScreeningEligibilityService } from './service'
import { evaluateScreeningSchema } from './validation'
import type { EvaluateScreeningInput } from './types'

export async function getAvailableGuidelinesAction() {
  try {
    const guidelines = await ScreeningEligibilityService.getAvailableGuidelines()
    return { success: true, data: guidelines }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve guidelines',
    }
  }
}

export async function getGuidelineDetailsAction(guidelineId: string) {
  try {
    const details = await ScreeningEligibilityService.getGuidelineDetails(guidelineId)
    if (!details) {
      return { success: false, error: `Screening guideline "${guidelineId}" not found` }
    }
    return { success: true, data: details }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve guideline details',
    }
  }
}

export async function evaluateScreeningEligibilityAction(input: EvaluateScreeningInput) {
  try {
    const validated = evaluateScreeningSchema.parse(input)
    const record = await ScreeningEligibilityService.evaluateScreeningEligibility(validated)

    revalidatePath('/clinical')
    revalidatePath('/clinical/assessments')
    revalidatePath(`/clinical/patients/${input.patientId}`)
    revalidatePath('/healthcare-worker/assessments')
    revalidatePath('/patient/assessments')
    revalidatePath('/patient/screening')

    return { success: true, data: record }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to evaluate screening eligibility',
    }
  }
}

export async function getScreeningRecordAction(recordId: string) {
  try {
    const record = await ScreeningEligibilityService.getScreeningRecord(recordId)
    if (!record) {
      return { success: false, error: 'Screening eligibility record not found' }
    }
    return { success: true, data: record }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve screening record',
    }
  }
}

export async function getPatientScreeningRecordsAction(patientId: string) {
  try {
    const records = await ScreeningEligibilityService.getPatientScreeningRecords(patientId)
    return { success: true, data: records }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve patient screening history',
    }
  }
}


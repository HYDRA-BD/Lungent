'use server'

import { revalidatePath } from 'next/cache'
import { PatientPortalService } from './service'
import {
  updatePatientProfileSchema,
  startAssessmentSchema,
  correctionRequestSchema,
  linkAnonymousSelfCheckSchema,
  updateConsentSchema,
} from './validation'

export async function getDashboardSummaryAction(patientId: string) {
  try {
    const summary = await PatientPortalService.getDashboardSummary(patientId)
    return { success: true, data: summary }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve dashboard summary'
    return { success: false, error: message }
  }
}

export async function updatePatientProfileAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = updatePatientProfileSchema.parse(rawInput)
    const result = await PatientPortalService.updatePatientProfile(patientId, parsed)
    revalidatePath('/patient')
    revalidatePath('/patient/profile')
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile'
    return { success: false, error: message }
  }
}

export async function startAssessmentAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = startAssessmentSchema.parse(rawInput)
    const result = await PatientPortalService.startAssessment(patientId, {
      assessmentType: parsed.assessmentType,
    })
    revalidatePath('/patient')
    revalidatePath('/patient/assessments')
    revalidatePath('/patient/assessments/history')
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to initiate assessment'
    return { success: false, error: message }
  }
}

export async function getAssessmentByIdAction(patientId: string, assessmentId: string) {
  try {
    const result = await PatientPortalService.getAssessmentById(patientId, assessmentId)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load assessment'
    return { success: false, error: message }
  }
}

export async function markNotificationReadAction(patientId: string, notificationId: string) {
  try {
    await PatientPortalService.markNotificationRead(patientId, notificationId)
    revalidatePath('/patient')
    revalidatePath('/patient/notifications')
    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to mark notification as read'
    return { success: false, error: message }
  }
}

export async function updateConsentAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = updateConsentSchema.parse(rawInput)
    const result = await PatientPortalService.updateConsent(
      patientId,
      parsed.consentType,
      parsed.isGranted
    )
    revalidatePath('/patient/privacy')
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update consent'
    return { success: false, error: message }
  }
}

export async function submitCorrectionRequestAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = correctionRequestSchema.parse(rawInput)
    const result = await PatientPortalService.submitCorrectionRequest(patientId, parsed)
    revalidatePath('/patient/health-record')
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to submit correction request'
    return { success: false, error: message }
  }
}

export async function linkAnonymousSelfCheckAction(patientId: string, rawInput: unknown) {
  try {
    const parsed = linkAnonymousSelfCheckSchema.parse(rawInput)
    const result = await PatientPortalService.linkAnonymousSelfCheck(
      patientId,
      parsed.sessionCode
    )
    revalidatePath('/patient')
    revalidatePath('/patient/assessments')
    return { success: result.success, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to link anonymous self-check'
    return { success: false, error: message }
  }
}


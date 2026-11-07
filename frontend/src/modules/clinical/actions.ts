'use server'

import { revalidatePath } from 'next/cache'
import { ClinicalService } from './service'
import {
  createClinicalReviewSchema,
  documentClinicalDecisionSchema,
  amendClinicalDecisionSchema,
  acknowledgeClinicalAlertSchema,
  createFollowUpPlanSchema,
  updateFollowUpStatusSchema,
} from './validation'
import type {
  CreateClinicalReviewInput,
  DocumentClinicalDecisionInput,
  AmendClinicalDecisionInput,
  AcknowledgeClinicalAlertInput,
  CreateFollowUpPlanInput,
  UpdateFollowUpStatusInput,
} from './types'
import type { ClinicalReviewStatus, ClinicalAlertStatus, ClinicalAlertSeverity, ClinicalFollowUpStatus, AssessmentStatus } from '@/types/database'

export async function getClinicalDashboardAction() {
  try {
    const stats = await ClinicalService.getClinicalDashboardStats()
    const activeAlerts = await ClinicalService.getClinicalAlerts({ status: 'active' })
    const pendingAssessments = await ClinicalService.getAssessmentReviewSummaries()
    const recentActivities = await ClinicalService.getClinicalActivities({ limit: 8 })
    const followUps = await ClinicalService.getFollowUpPlans({ status: 'planned' })

    return {
      success: true,
      data: {
        stats,
        activeAlerts: activeAlerts.slice(0, 5),
        pendingAssessments: pendingAssessments.slice(0, 5),
        recentActivities,
        followUps: followUps.slice(0, 5),
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve clinical dashboard metrics',
    }
  }
}

export async function searchClinicalPatientsAction(options: {
  query?: string
  facilityId?: string
  reviewStatus?: ClinicalReviewStatus
  hasAlerts?: boolean
  page?: number
  limit?: number
}) {
  try {
    const result = await ClinicalService.searchClinicalPatients(options)
    return { success: true, data: result }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search clinical patients',
    }
  }
}

export async function getClinicalPatientProfileAction(patientId: string) {
  try {
    const profile = await ClinicalService.getClinicalPatientProfile(patientId)
    if (!profile) {
      return { success: false, error: 'Patient clinical profile not found' }
    }
    return { success: true, data: profile }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve patient clinical profile',
    }
  }
}

export async function recordClinicalReviewAction(input: CreateClinicalReviewInput) {
  try {
    const validated = createClinicalReviewSchema.parse(input)
    const review = await ClinicalService.recordClinicalReview(validated)
    revalidatePath('/clinical')
    revalidatePath(`/clinical/patients/${input.patientId}`)
    revalidatePath(`/clinical/patients/${input.patientId}/review`)
    revalidatePath('/clinical/activity')
    return { success: true, data: review }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to record clinical review',
    }
  }
}

export async function documentClinicalDecisionAction(input: DocumentClinicalDecisionInput) {
  try {
    const validated = documentClinicalDecisionSchema.parse(input)
    const decision = await ClinicalService.documentClinicalDecision(validated)
    revalidatePath('/clinical')
    revalidatePath(`/clinical/patients/${input.patientId}`)
    revalidatePath(`/clinical/patients/${input.patientId}/review`)
    revalidatePath('/clinical/assessments')
    revalidatePath('/clinical/activity')
    return { success: true, data: decision }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to document clinical decision',
    }
  }
}

export async function amendClinicalDecisionAction(input: AmendClinicalDecisionInput) {
  try {
    const validated = amendClinicalDecisionSchema.parse(input)
    const decision = await ClinicalService.amendClinicalDecision(validated)
    revalidatePath('/clinical')
    revalidatePath(`/clinical/patients/${decision.patientId}`)
    revalidatePath('/clinical/activity')
    return { success: true, data: decision }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to amend clinical decision',
    }
  }
}

export async function getClinicalAlertsAction(options: {
  patientId?: string
  facilityId?: string
  status?: ClinicalAlertStatus
  severity?: ClinicalAlertSeverity
} = {}) {
  try {
    const alerts = await ClinicalService.getClinicalAlerts(options)
    return { success: true, data: alerts }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve clinical alerts',
    }
  }
}

export async function acknowledgeClinicalAlertAction(input: AcknowledgeClinicalAlertInput) {
  try {
    const validated = acknowledgeClinicalAlertSchema.parse(input)
    const alert = await ClinicalService.acknowledgeClinicalAlert(validated)
    revalidatePath('/clinical')
    revalidatePath('/clinical/alerts')
    revalidatePath(`/clinical/patients/${alert.patientId}`)
    revalidatePath('/clinical/activity')
    return { success: true, data: alert }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update clinical alert',
    }
  }
}

export async function getClinicalFollowUpsAction(options: {
  patientId?: string
  facilityId?: string
  status?: ClinicalFollowUpStatus
} = {}) {
  try {
    const followUps = await ClinicalService.getFollowUpPlans(options)
    return { success: true, data: followUps }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve follow-up plans',
    }
  }
}

export async function createFollowUpPlanAction(input: CreateFollowUpPlanInput) {
  try {
    const validated = createFollowUpPlanSchema.parse(input)
    const plan = await ClinicalService.createFollowUpPlan(validated)
    revalidatePath('/clinical')
    revalidatePath('/clinical/follow-ups')
    revalidatePath(`/clinical/patients/${input.patientId}`)
    revalidatePath('/clinical/activity')
    return { success: true, data: plan }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create follow-up plan',
    }
  }
}

export async function updateFollowUpPlanStatusAction(input: UpdateFollowUpStatusInput) {
  try {
    const validated = updateFollowUpStatusSchema.parse(input)
    const plan = await ClinicalService.updateFollowUpStatus(validated)
    revalidatePath('/clinical')
    revalidatePath('/clinical/follow-ups')
    revalidatePath(`/clinical/patients/${plan.patientId}`)
    revalidatePath('/clinical/activity')
    return { success: true, data: plan }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update follow-up plan status',
    }
  }
}

export async function getClinicalActivitiesAction(options: {
  patientId?: string
  facilityId?: string
  limit?: number
} = {}) {
  try {
    const activities = await ClinicalService.getClinicalActivities(options)
    return { success: true, data: activities }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve clinical activities',
    }
  }
}

export async function getAssessmentReviewSummariesAction(options: {
  patientId?: string
  facilityId?: string
  status?: AssessmentStatus
} = {}) {
  try {
    const assessments = await ClinicalService.getAssessmentReviewSummaries(options)
    return { success: true, data: assessments }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve assessment review summaries',
    }
  }
}


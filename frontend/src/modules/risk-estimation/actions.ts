'use server'

import { revalidatePath } from 'next/cache'
import { RiskEstimationService } from './service'
import { executeRiskAssessmentSchema } from './validation'
import type { ExecuteRiskAssessmentInput } from './types'

export async function getAvailableMethodologiesAction() {
  try {
    const methodologies = await RiskEstimationService.getAvailableMethodologies()
    return { success: true, data: methodologies }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve methodologies',
    }
  }
}

export async function getMethodologyDetailsAction(methodologyId: string) {
  try {
    const details = await RiskEstimationService.getMethodologyDetails(methodologyId)
    if (!details) {
      return { success: false, error: `Methodology "${methodologyId}" not found` }
    }
    return { success: true, data: details }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve methodology details',
    }
  }
}

export async function executeRiskEstimationAction(input: ExecuteRiskAssessmentInput) {
  try {
    const validated = executeRiskAssessmentSchema.parse(input)
    const record = await RiskEstimationService.executeRiskAssessment(validated)

    revalidatePath('/clinical')
    revalidatePath('/clinical/assessments')
    revalidatePath(`/clinical/patients/${input.patientId}`)
    revalidatePath('/healthcare-worker/assessments')
    revalidatePath('/patient/assessments')

    return { success: true, data: record }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute risk assessment',
    }
  }
}

export async function getRiskAssessmentRecordAction(recordId: string) {
  try {
    const record = await RiskEstimationService.getRiskAssessmentRecord(recordId)
    if (!record) {
      return { success: false, error: 'Risk assessment record not found' }
    }
    return { success: true, data: record }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve risk assessment record',
    }
  }
}

export async function getPatientRiskAssessmentsAction(patientId: string) {
  try {
    const records = await RiskEstimationService.getPatientRiskAssessments(patientId)
    return { success: true, data: records }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve patient risk assessments',
    }
  }
}

export async function getExperimentalModelsAction() {
  try {
    const models = await RiskEstimationService.getExperimentalModels()
    return { success: true, data: models }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve experimental models',
    }
  }
}


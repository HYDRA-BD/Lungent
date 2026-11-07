'use server'

/**
 * Phase 2.5: Server Actions for Anomaly Detection & Workflow Management
 */

import { AnomalyDetectionService } from './service'
import type { PatientDetectionInput } from './detectors/patient-detector'
import type { AssessmentDetectionInput } from './detectors/assessment-detector'
import type {
  AnomalyFilter,
  AnomalyRecord,
  AnomalyStatus,
  AnomalySummary,
  DataQualityReport,
  ResolutionOutcome,
} from './types'

export async function fetchAnomaliesAction(filter?: AnomalyFilter): Promise<{
  success: boolean
  data?: AnomalyRecord[]
  error?: string
}> {
  try {
    const data = await AnomalyDetectionService.getAnomalies(filter)
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch anomalies'
    return { success: false, error: message }
  }
}

export async function fetchAnomalyByIdAction(id: string): Promise<{
  success: boolean
  data?: AnomalyRecord | null
  error?: string
}> {
  try {
    const data = await AnomalyDetectionService.getAnomalyById(id)
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch anomaly'
    return { success: false, error: message }
  }
}

export async function scanPatientDataAction(input: PatientDetectionInput): Promise<{
  success: boolean
  data?: AnomalyRecord[]
  error?: string
}> {
  try {
    const data = await AnomalyDetectionService.scanPatientData(input)
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to scan patient data'
    return { success: false, error: message }
  }
}

export async function scanAssessmentAction(input: AssessmentDetectionInput): Promise<{
  success: boolean
  data?: AnomalyRecord[]
  error?: string
}> {
  try {
    const data = await AnomalyDetectionService.scanAssessment(input)
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to scan assessment'
    return { success: false, error: message }
  }
}

export async function updateAnomalyStatusAction(
  anomalyId: string,
  newStatus: AnomalyStatus,
  actorId: string,
  actorRole: string,
  notes?: string
): Promise<{
  success: boolean
  data?: AnomalyRecord
  error?: string
}> {
  try {
    const data = await AnomalyDetectionService.updateStatus(
      anomalyId,
      newStatus,
      actorId,
      actorRole,
      notes
    )
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update anomaly status'
    return { success: false, error: message }
  }
}

export async function resolveAnomalyAction(
  anomalyId: string,
  outcome: ResolutionOutcome,
  resolvedBy: string,
  actorRole: string,
  resolutionNotes: string
): Promise<{
  success: boolean
  data?: AnomalyRecord
  error?: string
}> {
  try {
    const data = await AnomalyDetectionService.resolveAnomaly(
      anomalyId,
      outcome,
      resolvedBy,
      actorRole,
      resolutionNotes
    )
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to resolve anomaly'
    return { success: false, error: message }
  }
}

export async function dismissAnomalyAction(
  anomalyId: string,
  dismissedBy: string,
  actorRole: string,
  reason: string
): Promise<{
  success: boolean
  data?: AnomalyRecord
  error?: string
}> {
  try {
    const data = await AnomalyDetectionService.dismissAnomaly(
      anomalyId,
      dismissedBy,
      actorRole,
      reason
    )
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to dismiss anomaly'
    return { success: false, error: message }
  }
}

export async function fetchAnomalySummaryAction(facilityId?: string): Promise<{
  success: boolean
  data?: AnomalySummary
  error?: string
}> {
  try {
    const data = await AnomalyDetectionService.getSummary(facilityId)
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch summary'
    return { success: false, error: message }
  }
}

export async function fetchDataQualityReportsAction(facilityId?: string): Promise<{
  success: boolean
  data?: DataQualityReport[]
  error?: string
}> {
  try {
    const data = await AnomalyDetectionService.getDataQualityReports(facilityId)
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch data quality reports'
    return { success: false, error: message }
  }
}


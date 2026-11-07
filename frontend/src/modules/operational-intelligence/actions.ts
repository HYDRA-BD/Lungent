'use server'

/**
 * Phase 2.10: Operational Intelligence Server Actions
 * Next.js Server Actions for institutional reporting, facility peer benchmarking,
 * predictive forecasting, clinical provenance summaries, and custom report exports.
 */

import { defaultOperationalIntelligenceService } from './service'
import type {
  InstitutionalReportFilter,
  FacilityTier,
  ForecastingTargetMetric,
  ForecastingModelType,
  CustomReportConfiguration,
  FacilityUtilizationSummary,
} from './types'
import type { RawFacilityActivityInput } from './services/facility-benchmarking-service'
import type { HistoricalSeriesPoint } from './services/predictive-forecasting-service'
import type { RawClinicalAssessmentInput } from './services/clinical-reporting-service'

export async function getInstitutionalReportAction(filter: InstitutionalReportFilter) {
  try {
    const report = defaultOperationalIntelligenceService.getInstitutionalReport(filter)
    return { success: true, data: report }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate institutional report',
    }
  }
}

export async function benchmarkFacilitiesAction(
  cohort: RawFacilityActivityInput[],
  targetTier?: FacilityTier
) {
  try {
    const result = defaultOperationalIntelligenceService.benchmarkFacilities(cohort, targetTier)
    return { success: true, data: result }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to benchmark facilities',
    }
  }
}

export async function generateOperationalForecastAction(
  history: HistoricalSeriesPoint[],
  options: {
    targetMetric: ForecastingTargetMetric
    modelType?: ForecastingModelType
    forecastHorizonDays?: number
    operationalCapacityLimit?: number
    facilityId?: string
    facilityName?: string
  }
) {
  try {
    const forecast = defaultOperationalIntelligenceService.generateForecast(history, options)
    return { success: true, data: forecast }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to generate operational forecast',
    }
  }
}

export async function getClinicalSummaryAction(input: RawClinicalAssessmentInput) {
  try {
    const summary = defaultOperationalIntelligenceService.getClinicalSummary(input)
    return { success: true, data: summary }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve clinical summary',
    }
  }
}

export async function getGeographicOperationalSummaryAction(kThreshold = 5) {
  try {
    const summaries = defaultOperationalIntelligenceService.getGeographicIntelligence(kThreshold)
    return { success: true, data: summaries }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve geographic summaries',
    }
  }
}

export async function exportCustomReportAction(
  config: CustomReportConfiguration,
  rows: FacilityUtilizationSummary[]
) {
  try {
    const doc = defaultOperationalIntelligenceService.exportReport(config, rows)
    return { success: true, data: doc }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to export custom report',
    }
  }
}


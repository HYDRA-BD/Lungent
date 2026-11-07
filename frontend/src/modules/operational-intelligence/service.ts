/**
 * Phase 2.10: Operational Intelligence Service Façade
 * Unified coordinator for institutional reporting, facility peer benchmarking,
 * predictive time-series forecasting, clinical provenance reporting, and custom document exports.
 */

import { FacilityBenchmarkingService, type RawFacilityActivityInput } from './services/facility-benchmarking-service'
import { PredictiveForecastingService, type HistoricalSeriesPoint } from './services/predictive-forecasting-service'
import { InstitutionalReportingService } from './services/institutional-reporting-service'
import { ClinicalReportingService, type RawClinicalAssessmentInput } from './services/clinical-reporting-service'
import { CustomReportExporter } from './services/custom-report-exporter'
import type {
  InstitutionalReportFilter,
  FacilityTier,
  ForecastingTargetMetric,
  ForecastingModelType,
  CustomReportConfiguration,
  FacilityUtilizationSummary,
} from './types'

export class OperationalIntelligenceService {
  /**
   * Generates a consolidated institutional operational report
   */
  public getInstitutionalReport(filter: InstitutionalReportFilter) {
    return InstitutionalReportingService.generateReport(filter)
  }

  /**
   * Benchmarks a cohort of facilities against their peers
   */
  public benchmarkFacilities(cohort: RawFacilityActivityInput[], targetTier?: FacilityTier) {
    return FacilityBenchmarkingService.benchmarkCohort(cohort, targetTier)
  }

  /**
   * Generates predictive time-series projections and bottleneck alerts
   */
  public generateForecast(
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
    return PredictiveForecastingService.forecastMetric(history, options)
  }

  /**
   * Generates advanced clinical assessment report with full provenance details
   */
  public getClinicalSummary(input: RawClinicalAssessmentInput) {
    return ClinicalReportingService.generateClinicalSummary(input)
  }

  /**
   * Retrieves geographic operational intelligence across Bangladesh administrative divisions
   */
  public getGeographicIntelligence(kThreshold = 5) {
    return InstitutionalReportingService.getGeographicSummaries(kThreshold)
  }

  /**
   * Exports custom reports in CSV or HTML format with audit hash
   */
  public exportReport(config: CustomReportConfiguration, rows: FacilityUtilizationSummary[]) {
    if (config.exportFormat === 'csv') {
      return CustomReportExporter.generateCSV(config, rows)
    }
    return CustomReportExporter.generateHTML(config, rows)
  }
}

export const defaultOperationalIntelligenceService = new OperationalIntelligenceService()


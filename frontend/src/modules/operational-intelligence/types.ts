/**
 * Phase 2.10: Advanced Reporting & Operational Intelligence Types & Domain Definitions
 */

export type InstitutionalReportCategory =
  | 'institutional_summary'
  | 'facility_utilization'
  | 'worker_activity'
  | 'clinical_workflow'
  | 'referral_followup'
  | 'population_research'
  | 'geographic_intelligence'

export type FacilityTier =
  | 'national_specialized'
  | 'tertiary_medical_college'
  | 'district_hospital'
  | 'upazila_health_complex'
  | 'community_clinic'

export type ClinicalDataProvenance =
  | 'measured'
  | 'patient_reported'
  | 'estimated_model'
  | 'imported_external'

export type ForecastingTargetMetric =
  | 'assessment_volume'
  | 'referral_workload'
  | 'clinical_review_queue'
  | 'facility_capacity_strain'

export type ForecastingModelType =
  | 'holt_winters_exponential_smoothing'
  | 'moving_average_baseline'
  | 'trend_seasonal_decomposition'

export type ExportFormat = 'csv' | 'html' | 'pdf' | 'json'

// ==============================================================================
// 1. Institutional Reporting Models
// ==============================================================================

export interface InstitutionalReportFilter {
  facilityId?: string
  facilityTier?: FacilityTier
  division?: string
  district?: string
  startDate: string
  endDate: string
  category?: InstitutionalReportCategory
  status?: string
}

export interface FacilityUtilizationSummary {
  facilityId: string
  facilityName: string
  facilityTier: FacilityTier
  division: string
  district: string
  totalRegisteredPatients: number
  totalAssessmentsConducted: number
  activeHealthcareWorkers: number
  completedReviews: number
  pendingReviews: number
  meanReviewTurnaroundHours: number
  referralsInitiated: number
  referralsCompleted: number
  referralResolutionRatePct: number
  dataCompletenessPct: number
}

export interface WorkerActivityReportItem {
  workerId: string
  workerName: string
  facilityId: string
  facilityName: string
  assessmentsConducted: number
  patientsRegistered: number
  referralsAssisted: number
  lastActiveTimestamp: string
  averageAssessmentDurationMinutes: number
}

export interface InstitutionalReportRecord {
  id: string
  reportReference: string
  facilityId?: string | null
  facilityName?: string
  reportingPeriodStart: string
  reportingPeriodEnd: string
  reportCategory: InstitutionalReportCategory
  title: string
  utilizationSummaries: FacilityUtilizationSummary[]
  workerSummaries: WorkerActivityReportItem[]
  screeningEligibilityCounts: {
    eligible: number
    ineligible: number
    requiresClinicalReview: number
  }
  environmentalContextSummary?: {
    meanPm25: number
    hotspotDistricts: string[]
  }
  generatedAt: string
  generatedByUserId?: string | null
  status: 'draft' | 'final' | 'archived'
}

// ==============================================================================
// 2. Advanced Clinical Reporting Models
// ==============================================================================

export interface ClinicalDataPointProvenance {
  field: string
  value: unknown
  provenance: ClinicalDataProvenance
  sourceSystemOrTool: string
  measuredOrReportedAt: string
  isClinicianValidated: boolean
}

export interface ClinicalAssessmentSummaryReport {
  reportId: string
  patientId: string
  patientCanonicalId: string
  patientAge: number
  patientGender: string
  district: string
  assessmentDate: string
  methodologyVersion: string
  guidelineVersion: string
  riskCategory: 'low' | 'moderate' | 'high' | 'very_high'
  estimatedRiskScore: number
  screeningEligibility: 'eligible' | 'ineligible' | 'requires_review'
  triageUrgency: 'routine' | 'priority' | 'urgent' | 'emergency'
  reviewStatus: 'unreviewed' | 'under_review' | 'verified_by_clinician' | 'overridden'
  reviewingClinicianName?: string
  provenanceDetails: ClinicalDataPointProvenance[]
  missingOrConflictingFields: string[]
  historicalAssessmentCount: number
  longitudinalRiskTrend: 'stable' | 'increasing' | 'decreasing' | 'insufficient_history'
  nonDiagnosticNoticeEn: string
  nonDiagnosticNoticeBn: string
}

// ==============================================================================
// 3. Facility Benchmarking Models
// ==============================================================================

export interface FacilityBenchmarkSnapshot {
  facilityId: string
  facilityName: string
  facilityTier: FacilityTier
  division: string
  assessmentCompletionRate: number // 0.0 to 1.0
  meanProcessingTimeHours: number
  meanReviewTurnaroundHours: number
  referralCompletionRate: number // 0.0 to 1.0
  workerProductivityScore: number // assessments per active worker
  dataCompletenessPct: number
  compositeOperationalIndex: number // 0.0 to 100.0 scale
  peerTierPercentile: number // 0 to 100
  relativeRankInTier: number
  totalTierPeers: number
  operationalStatus: 'high_performing' | 'nominal' | 'requires_support'
}

export interface FacilityBenchmarkComparison {
  benchmarkDate: string
  facilityTier: FacilityTier
  tierAverageCompletionRate: number
  tierAverageTurnaroundHours: number
  tierAverageReferralRate: number
  tierAverageOperationalIndex: number
  facilities: FacilityBenchmarkSnapshot[]
}

// ==============================================================================
// 4. Predictive Operational Analytics Models
// ==============================================================================

export interface ForecastPoint {
  date: string
  projectedValue: number
  lowerBound95: number
  upperBound95: number
}

export interface OperationalForecastResult {
  facilityId?: string
  facilityName?: string
  targetMetric: ForecastingTargetMetric
  modelType: ForecastingModelType
  historicalWindowDays: number
  forecastHorizonDays: number
  forecastPoints: ForecastPoint[]
  errorMetrics: {
    meanAbsoluteError: number
    rootMeanSquaredError: number
    meanAbsolutePercentageError: number
  }
  capacityBottleneckDetected: boolean
  bottleneckDetails?: {
    projectedPeakDate: string
    projectedPeakValue: number
    operationalCapacityLimit: number
    excessCapacityPct: number
    recommendedMitigation: string
  }
  generatedAt: string
  operationalNoticeEn: string
}

// ==============================================================================
// 5. Geographic Intelligence & Population Reporting Models
// ==============================================================================

export interface GeographicOperationalSummary {
  division: string
  divisionBn: string
  districtCount: number
  totalRegisteredPatients: number
  totalAssessments: number
  activeFacilities: number
  meanPm25Exposure: number
  screeningEligibilityRatePct: number
  referralResolutionRatePct: number
  isSuppressedForPrivacy: boolean // cell < 5 check
}

// ==============================================================================
// 6. Custom Report Generation & Export Models
// ==============================================================================

export interface CustomReportConfiguration {
  title: string
  reportCategory: InstitutionalReportCategory
  selectedMetrics: string[]
  facilityIds?: string[]
  division?: string
  startDate: string
  endDate: string
  exportFormat: ExportFormat
  includeBilingualLabels: boolean
}

export interface GeneratedExportDocument {
  reportReference: string
  title: string
  exportFormat: ExportFormat
  content: string // CSV text or HTML string
  fileName: string
  fileSizeBytes: number
  sha256Digest: string
  generatedAt: string
}


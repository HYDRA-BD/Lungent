/**
 * Phase 2.8: Population-Level Intelligence Types & Domain Definitions
 */

export type PopulationSamplingMethodology =
  | 'clinical_convenience_sample'
  | 'stratified_sentinel_surveillance'
  | 'community_screening_pilot'
  | 'demographic_health_survey_benchmark'

export type PopulationAggregationLevel = 'national' | 'division' | 'district' | 'upazila'

export type DemographicAgeGroup =
  | 'under_40'
  | '40_49'
  | '50_59'
  | '60_69'
  | '70_plus'

export type BiologicalSex = 'male' | 'female' | 'other_undisclosed'

export interface DemographicStratumCount {
  ageGroup: DemographicAgeGroup
  sex: BiologicalSex
  rawCount: number
  displayCount: string
  percentage: number
  isSuppressed: boolean
}

export interface RiskFactorPrevalenceMetric {
  factorCode: string
  nameEn: string
  nameBn: string
  category: 'tobacco_bidi' | 'biomass_fuel' | 'occupational' | 'respiratory_history' | 'environmental'
  numeratorCount: number
  denominatorCount: number
  prevalencePct: number
  displayPrevalence: string
  missingnessPct: number
  isSuppressed: boolean
}

export interface CoOccurrencePair {
  factorA: string
  factorB: string
  labelEn: string
  labelBn: string
  jointCount: number
  displayJointCount: string
  coOccurrencePct: number
  relativeOddsRatio: number
  isSuppressed: boolean
}

export interface GeographicRiskMetric {
  division: string
  district: string
  upazila?: string
  totalAssessments: number
  displayTotalAssessments: string
  smokingPrevalencePct: number
  biomassPrevalencePct: number
  ambientPm25Avg: number
  screeningEligibilityPct: number
  urgentSymptomAlertPct: number
  dataCompletenessPct: number
  coverageTier: 'robust' | 'moderate' | 'sparse'
  isSuppressed: boolean
}

export interface LongitudinalPopulationTrendPoint {
  periodLabel: string // e.g. "2024-Q1", "2024-Q2", etc.
  year: number
  quarter: number
  totalAssessments: number
  currentSmokerPct: number
  bidiSmokerPct: number
  biomassCookingPct: number
  screeningEligiblePct: number
  urgentReferralPct: number
  platformAdoptionGrowthPct: number
  isSuppressed: boolean
}

export interface EnvironmentalPopulationCorrelation {
  division: string
  district: string
  ambientPm25AnnualAvg: number
  hotspotSeverity: 'extreme' | 'high' | 'moderate' | 'low'
  recordedBiomassPrevalencePct: number
  recordedSmokingPrevalencePct: number
  chronicRespiratorySymptomPct: number
  sampleSize: number
  isSuppressed: boolean
  nonCausalNotice: string
}

export interface PopulationIntelligenceSummary {
  cohortCode: string
  cohortNameEn: string
  cohortNameBn: string
  samplingMethodology: PopulationSamplingMethodology
  observationPeriod: {
    start: string
    end: string
  }
  totalSampleAnalyzed: number
  activePrivacyKThreshold: number
  overallSuppressedCellsCount: number
  riskFactorPrevalences: RiskFactorPrevalenceMetric[]
  topCoOccurringFactors: CoOccurrencePair[]
  demographicDistribution: DemographicStratumCount[]
  geographicSummary: GeographicRiskMetric[]
  longitudinalTrends: LongitudinalPopulationTrendPoint[]
  environmentalCorrelations: EnvironmentalPopulationCorrelation[]
  clinicalGovernanceNotices: {
    representativenessCaveatEn: string
    representativenessCaveatBn: string
    nonCausalNoticeEn: string
    nonCausalNoticeBn: string
    nonDiagnosticNoticeEn: string
    nonDiagnosticNoticeBn: string
  }
}

export interface PopulationFilterQuery {
  division?: string
  district?: string
  ageGroup?: DemographicAgeGroup
  sex?: BiologicalSex
  startDate?: string
  endDate?: string
  samplingMethodology?: PopulationSamplingMethodology
  kThreshold?: number
}


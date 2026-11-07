/**
 * Phase 1.23: Operational Analytics Types & Interfaces
 *
 * Defines domain structures, metric schemas, dashboard filters,
 * aggregation models, data quality indicators, and telemetry DTOs.
 */

import type { FacilityStatus } from '@/types/database'

export type AnalyticsMetricCategory =
  | 'patient'
  | 'assessment'
  | 'facility'
  | 'worker'
  | 'workflow'
  | 'referral'
  | 'geographic'
  | 'environmental'
  | 'data_quality'
  | 'performance'

export type AnalyticsDateRange = 'today' | '7d' | '30d' | '90d' | 'all'

export interface OperationalAnalyticsFilter {
  dateRange: AnalyticsDateRange
  startDate?: string
  endDate?: string
  facilityId?: string
  division?: string
  assessmentType?: string
}

export interface MetricDefinition {
  metricId: string
  nameEn: string
  nameBn: string
  category: AnalyticsMetricCategory
  descriptionEn: string
  descriptionBn: string
  calculationMethodEn: string
  calculationMethodBn: string
  sourceRecords: string
  inclusionRulesEn: string
  inclusionRulesBn: string
  exclusionRulesEn: string
  exclusionRulesBn: string
  refreshFrequency: 'real_time' | '15_minutes' | '1_hour' | 'daily'
  limitationsEn: string
  limitationsBn: string
}

export interface TimeSeriesDataPoint {
  date: string
  label: string
  value: number
}

export interface FacilityActivityItem {
  facilityId: string
  facilityName: string
  facilityNameBn?: string
  division: string
  status: FacilityStatus
  isVerified: boolean
  patientRegistrations: number
  assessmentsConducted: number
  pendingReviews: number
  referralsInitiated: number
  activeWorkers: number
}

export interface GeographicCellDistribution {
  division: string
  divisionBn: string
  patientCount: number
  facilityCount: number
  assessmentCount: number
  workerCount: number
  referralCount: number
  isSuppressed: boolean // True when count is < 5 to protect individual patient privacy
}

export interface PatientStatisticsSummary {
  totalRegistered: number
  newRegistrations: number
  activeRecords: number
  registrationsOverTime: TimeSeriesDataPoint[]
  anonymousSelfChecks: number
  averageProfileCompleteness: number
  distributionByFacility: { facilityName: string; count: number }[]
  distributionByGeographicArea: { division: string; count: number; isSuppressed: boolean }[]
}

export interface AssessmentStatisticsSummary {
  totalInitiated: number
  totalSubmitted: number
  completed: number
  incomplete: number
  cancelled: number
  volumeOverTime: TimeSeriesDataPoint[]
  distributionByType: { type: string; labelEn: string; labelBn: string; count: number }[]
  distributionByFacility: { facilityName: string; count: number }[]
  distributionByGeographicArea: { division: string; count: number; isSuppressed: boolean }[]
}

export interface FacilityStatisticsSummary {
  totalFacilities: number
  activeFacilities: number
  verifiedFacilities: number
  pendingFacilities: number
  facilities: FacilityActivityItem[]
}

export interface HealthcareWorkerStatisticsSummary {
  totalWorkers: number
  activeWorkers: number
  patientsOnboarded: number
  healthRecordsCompleted: number
  assessmentsInitiated: number
  assessmentsSubmitted: number
  pendingTasksCount: number
}

export interface WorkflowReviewSummary {
  awaitingSubmission: number
  awaitingClinicalReview: number
  underReview: number
  reviewed: number
  unresolvedInfoCount: number
  reviewTurnaroundHoursAvg: number
  pendingAgeDistribution: {
    under24Hours: number
    oneToThreeDays: number
    fourToSevenDays: number
    overSevenDays: number
  }
}

export interface ReferralFollowUpSummary {
  referralsTotal: number
  referralsByStatus: {
    pending: number
    accepted: number
    rejected: number
    scheduled: number
    inProgress: number
    completed: number
    cancelled: number
  }
  turnaroundDaysAvg: number
  followUpsTotal: number
  upcomingFollowUps: number
  completedFollowUps: number
  overdueFollowUps: number
  cancelledFollowUps: number
}

export interface EnvironmentalAvailabilitySummary {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  availabilityPercent: number
  freshnessMinutes: number
  cacheHitRatioPercent: number
  isOperational: boolean
  dataGapsCount: number
  latestSuccessfulRetrieval: string | null
  providerName: string
}

export interface DataQualitySummary {
  incompletePatientProfilesCount: number
  missingCriticalAgeCount: number
  missingCriticalSmokingCount: number
  missingCriticalGenderCount: number
  missingGeographicInfoCount: number
  missingFacilityInfoCount: number
  syncFailuresCount: number
  recordsRequiringReviewCount: number
  overallQualityScorePercent: number
}

export interface PlatformPerformanceSummary {
  uptimePercent: number
  apiRequestVolume: number
  apiErrorRatePercent: number
  avgResponseTimeMs: number
  authFailuresCount: number
  notificationDeliverySuccessRate: number
  reportGenerationFailuresCount: number
  offlineSyncFailuresCount: number
  lastTelemetryTimestamp: string
}

export interface OperationalAnalyticsDashboardData {
  generatedAt: string
  filterApplied: OperationalAnalyticsFilter
  patients: PatientStatisticsSummary
  assessments: AssessmentStatisticsSummary
  facilities: FacilityStatisticsSummary
  workers: HealthcareWorkerStatisticsSummary
  workflows: WorkflowReviewSummary
  referrals: ReferralFollowUpSummary
  geographics: GeographicCellDistribution[]
  environmental: EnvironmentalAvailabilitySummary
  dataQuality: DataQualitySummary
  performance: PlatformPerformanceSummary
}

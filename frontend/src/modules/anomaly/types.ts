/**
 * Phase 2.5: Anomaly Detection Types & Domain Definitions
 *
 * Defines categories, subtypes, severities, workflow states, and data models
 * for patient data, assessment inconsistency, data quality, environmental,
 * and operational anomaly detection.
 */

export type AnomalyCategory =
  | 'patient_data'
  | 'assessment_inconsistency'
  | 'data_quality'
  | 'environmental'
  | 'operational'

export type PatientAnomalySubtype =
  | 'demographic_conflict'
  | 'implausible_physical_measurement'
  | 'inconsistent_medical_history'
  | 'unusual_tobacco_history'
  | 'longitudinal_drift'
  | 'duplicate_candidate'
  | 'suspicious_data_entry'

export type AssessmentAnomalySubtype =
  | 'profile_assessment_mismatch'
  | 'contradictory_responses'
  | 'abrupt_consecutive_shift'
  | 'submission_burst'
  | 'duplicate_assessment'
  | 'incomplete_assessment'

export type DataQualityAnomalySubtype =
  | 'missing_critical_fields'
  | 'invalid_format'
  | 'stale_data'
  | 'unverified_provenance'
  | 'potential_corruption'
  | 'distribution_shift'

export type EnvironmentalAnomalySubtype =
  | 'unphysical_pollutant_reading'
  | 'sudden_extreme_spike'
  | 'sensor_stuck_constant'
  | 'provider_discrepancy'
  | 'delayed_update'
  | 'geographic_coordinate_mismatch'

export type OperationalAnomalySubtype =
  | 'submission_volume_spike_or_drop'
  | 'facility_inactivity'
  | 'referral_bottleneck'
  | 'high_notification_failure_rate'
  | 'sync_conflict_burst'
  | 'api_latency_degradation'

export type AnomalySubtype =
  | PatientAnomalySubtype
  | AssessmentAnomalySubtype
  | DataQualityAnomalySubtype
  | EnvironmentalAnomalySubtype
  | OperationalAnomalySubtype

export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical'

export type AnomalyStatus =
  | 'detected'
  | 'pending_review'
  | 'under_review'
  | 'confirmed'
  | 'dismissed'
  | 'resolved'
  | 'escalated'

export type ResolutionOutcome =
  | 'data_corrected'
  | 'false_positive_clinical_variation'
  | 'sensor_recalibrated'
  | 'system_bug_logged'
  | 'acknowledged_acceptable_deviation'

export type DetectionMethodology =
  | 'deterministic_rule'
  | 'statistical_mad'
  | 'statistical_iqr'
  | 'rolling_zscore'
  | 'multivariate_isolation'

export type DataQualityClassification =
  | 'missing'
  | 'invalid'
  | 'inconsistent'
  | 'stale'
  | 'estimated'
  | 'unverified'
  | 'confirmed'

export interface AnomalyRecord {
  id: string
  anomalyNumber: string
  category: AnomalyCategory
  subtype: AnomalySubtype
  severity: AnomalySeverity
  status: AnomalyStatus
  entityType: 'patient' | 'assessment' | 'facility' | 'environmental_reading' | 'operational_telemetry'
  entityId: string
  facilityId?: string | null
  titleEn: string
  titleBn: string
  descriptionEn: string
  descriptionBn: string
  detectionMethodology: DetectionMethodology
  ruleId?: string | null
  ruleVersion: string
  triggeringFields: string[]
  observedValue: Record<string, unknown>
  expectedReference: Record<string, unknown>
  contextMetadata: Record<string, unknown>
  assignedRole?: 'clinician' | 'healthcare_worker' | 'administrator' | null
  assignedTo?: string | null
  resolutionOutcome?: ResolutionOutcome | null
  resolutionNotes?: string | null
  resolvedBy?: string | null
  resolvedAt?: string | null
  detectedAt: string
  updatedAt: string
}

export interface AnomalyReviewEvent {
  id: string
  anomalyId: string
  previousStatus: AnomalyStatus
  newStatus: AnomalyStatus
  actorId: string
  actorRole: string
  action: 'detect' | 'assign' | 'start_review' | 'confirm' | 'dismiss' | 'resolve' | 'escalate' | 'reopen'
  notes?: string | null
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface DataQualityReport {
  id: string
  snapshotDate: string
  facilityId?: string | null
  domain: 'patients' | 'assessments' | 'environmental' | 'operational' | 'overall'
  totalRecords: number
  missingCount: number
  invalidCount: number
  inconsistentCount: number
  staleCount: number
  confirmedCount: number
  qualityScore: number
  metadata: Record<string, unknown>
  createdAt: string
}

export interface AnomalyFilter {
  category?: AnomalyCategory
  subtype?: AnomalySubtype
  severity?: AnomalySeverity
  status?: AnomalyStatus
  facilityId?: string
  entityId?: string
  assignedRole?: 'clinician' | 'healthcare_worker' | 'administrator'
  searchQuery?: string
  dateFrom?: string
  dateTo?: string
}

export interface AnomalySummary {
  total: number
  unresolved: number
  byCategory: Record<AnomalyCategory, number>
  bySeverity: Record<AnomalySeverity, number>
  byStatus: Record<AnomalyStatus, number>
  criticalCount: number
  highCount: number
}


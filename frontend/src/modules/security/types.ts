/**
 * Phase 1.25: Centralized Security, Privacy & Compliance Domain Types
 */

export type AuditSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical'
export type AuditOutcome = 'success' | 'failure' | 'blocked' | 'flagged'

export type PrivacyRequestType =
  | 'access_export'
  | 'correction'
  | 'erasure_restriction'
  | 'consent_withdrawal'
  | 'processing_objection'

export type PrivacyRequestStatus =
  | 'submitted'
  | 'under_review'
  | 'approved_fulfilled'
  | 'rejected'
  | 'partially_fulfilled_with_retention_hold'

export type ConsentCategory =
  | 'service_terms'
  | 'clinical_decision_support'
  | 'care_team_sharing'
  | 'sms_notifications'
  | 'email_notifications'
  | 'environmental_analysis'
  | 'anonymized_research'

export type ConsentCollectionMethod =
  | 'electronic_portal'
  | 'worker_witnessed_digital'
  | 'paper_scanned'
  | 'verbal_witnessed_emergency'

export type IncidentCategory =
  | 'unauthorized_access_attempt'
  | 'credential_compromise'
  | 'data_exposure_suspected'
  | 'cross_facility_violation'
  | 'brute_force_attack'
  | 'policy_violation'
  | 'system_anomaly'

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical'

export type IncidentStatus =
  | 'reported'
  | 'investigating'
  | 'contained'
  | 'resolved'
  | 'closed'

export type DataCategory =
  | 'clinical_records'
  | 'diagnostic_imaging_reports'
  | 'security_audit_logs'
  | 'temporary_assessment_drafts'
  | 'platform_telemetry'
  | 'notifications_history'
  | 'patient_consents'

export type ComplianceFramework =
  | 'BD_CYBER_SECURITY_ACT_2023'
  | 'BD_DRAFT_DATA_PROTECTION_ACT'
  | 'BMDC_CODE_OF_ETHICS'
  | 'DGHS_DIGITAL_HEALTH_GUIDELINES'
  | 'ISO_27001_READINESS'
  | 'HIPAA_SECURITY_READINESS'
  | 'GDPR_READINESS'

export type ImplementationStatus =
  | 'implemented'
  | 'in_progress'
  | 'planned'
  | 'requires_legal_review'

export type BackupType =
  | 'automated_daily_snapshot'
  | 'point_in_time_wal'
  | 'pre_migration_dump'
  | 'cold_storage_archive'

export type BackupVerificationStatus =
  | 'verified_successful'
  | 'verification_failed'
  | 'remediation_in_progress'

export interface SecurityAuditEvent {
  id: string
  eventType: string
  severity: AuditSeverity
  outcome: AuditOutcome
  actorId?: string | null
  actorRole?: string | null
  targetResource?: string | null
  facilityId?: string | null
  clientIp?: string | null
  userAgent?: string | null
  metadata: Record<string, unknown>
  createdAt: string
}

export interface PrivacySubjectRequest {
  id: string
  requestNumber: string
  patientId: string
  requestType: PrivacyRequestType
  status: PrivacyRequestStatus
  requestDetails: string
  reviewNotes?: string | null
  reviewedBy?: string | null
  retentionHoldApplied: boolean
  retentionHoldReason?: string | null
  createdAt: string
  resolvedAt?: string | null
}

export interface PatientConsentRecord {
  id: string
  patientId: string
  consentCategory: ConsentCategory
  purpose: string
  version: string
  isGranted: boolean
  collectionMethod: ConsentCollectionMethod
  witnessId?: string | null
  withdrawalReason?: string | null
  grantedAt: string
  withdrawnAt?: string | null
}

export interface SecurityIncident {
  id: string
  incidentNumber: string
  title: string
  category: IncidentCategory
  severity: IncidentSeverity
  status: IncidentStatus
  affectedSystems: string[]
  reporterId: string
  reporterName: string
  assigneeId?: string | null
  containmentNotes?: string | null
  resolutionSummary?: string | null
  reportedAt: string
  resolvedAt?: string | null
}

export interface DataRetentionPolicy {
  id: string
  dataCategory: DataCategory
  retentionPeriodDays: number
  legalBasis: string
  deletionMethod: string
  isImmutable: boolean
  reviewStatus: string
  updatedAt: string
}

export interface ComplianceControl {
  id: string
  controlId: string
  framework: ComplianceFramework
  jurisdiction: string
  category: string
  controlName: string
  description: string
  implementationStatus: ImplementationStatus
  evidenceSummary: string
  responsibleOwner: string
  lastAuditedAt: string
}

export interface BackupVerification {
  id: string
  backupType: BackupType
  targetSystem: string
  snapshotTimestamp: string
  verificationStatus: BackupVerificationStatus
  verifiedBy: string
  verificationNotes: string
  recoveryDrillDate?: string | null
  createdAt: string
}

export interface SecurityDashboardSummary {
  activeSessionsEstimated: number
  totalAuditLogsRecorded: number
  flaggedSecurityEvents: number
  openIncidentsCount: number
  pendingPrivacyRequestsCount: number
  activeRetentionPoliciesCount: number
  complianceControlsCount: number
  complianceImplementedCount: number
  latestBackupStatus: BackupVerificationStatus
  lastBackupVerifiedAt: string
}


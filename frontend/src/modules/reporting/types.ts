/**
 * Phase 1.22: Reporting System - Domain Types
 *
 * Defines report types, generation payloads, filter criteria,
 * access audit records, and template property interfaces.
 */

export type ReportType =
  | 'patient_assessment'
  | 'clinical_assessment'
  | 'risk_estimation'
  | 'screening_eligibility'
  | 'symptom_triage'
  | 'referral_followup'
  | 'consolidated_history'

export type ReportStatus = 'draft' | 'final' | 'archived' | 'revoked'

export type ReportLanguage = 'en' | 'bn'

export type ReportAccessType = 'view' | 'download_pdf' | 'download_html' | 'print'

export type UserRoleType = 'patient' | 'clinician' | 'healthcare_worker' | 'admin' | 'system'

export interface ReportMetadata {
  reportReference: string
  patientId: string
  patientCanonicalId: string
  patientName: string
  patientAge: number
  patientGender: string
  facilityId?: string | null
  facilityName?: string
  methodologyVersion?: string
  guidelineVersion?: string
  protocolVersion?: string
  inputSnapshotHash?: string
  riskCategory?: 'low' | 'moderate' | 'high' | 'very_high' | string
  screeningEligibility?: 'eligible' | 'ineligible' | 'requires_review' | string
  triageUrgency?: string
  reviewingClinicianName?: string
  reviewingClinicianLicense?: string
  clinicianNotes?: string
  clinicalOverrides?: {
    overriddenField: string
    originalValue: string
    overriddenValue: string
    reason: string
    timestamp: string
  }[]
  generatedAt: string
  language: ReportLanguage
  templateVersion: string
}

export interface GeneratedReportRecord {
  id: string
  reportReference: string
  patientId: string
  patientCanonicalId: string
  patientName: string
  reportType: ReportType
  title: string
  summary: string | null
  language: ReportLanguage
  templateVersion: string
  sourceAssessmentId: string | null
  sourceReferralId: string | null
  sourceMetadata: ReportMetadata
  contentHtml: string
  fileSizeBytes: number
  storagePath: string | null
  generatedByUserId: string | null
  generatedByRole: string
  facilityId: string | null
  status: ReportStatus
  isPatientAccessible: boolean
  createdAt: string
  updatedAt: string
}

export interface ReportAccessAuditRecord {
  id: string
  reportId: string
  userId: string | null
  userRole: string
  accessType: ReportAccessType
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

export interface GenerateReportInput {
  patientId: string
  reportType: ReportType
  language?: ReportLanguage
  sourceAssessmentId?: string
  sourceReferralId?: string
  facilityId?: string
  generatedByUserId?: string
  generatedByRole?: UserRoleType
  customNotes?: string
  isPatientAccessible?: boolean
}

export interface ReportFilterOptions {
  patientId?: string
  reportType?: ReportType
  language?: ReportLanguage
  status?: ReportStatus
  facilityId?: string
  startDate?: string
  endDate?: string
  limit?: number
  offset?: number
}

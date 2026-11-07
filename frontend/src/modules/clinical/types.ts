import type {
  ClinicalReviewStatus,
  ClinicalReviewType,
  ClinicalObservationCategory,
  ClinicalDecisionType,
  ClinicalDecisionStatus,
  ClinicalAlertType,
  ClinicalAlertSeverity,
  ClinicalAlertStatus,
  ClinicalFollowUpStatus,
  ClinicalActivityType,
  AssessmentType,
  AssessmentStatus,
} from '@/types/database'
import type { Patient } from '@/modules/patients/types'
import type {
  ComprehensivePatientHealthRecord,
  PatientMedicalConditionItem,
  PatientMedicationItem,
  PatientAllergyItem,
  PatientFamilyHistoryItem,
  PatientSmokingHistoryRecord,
  PatientEnvironmentalExposureItem,
  PatientSymptomItem,
  PatientHealthMeasurementItem,
} from '@/modules/health-records/types'

export interface ClinicalReviewItem {
  id: string
  patientId: string
  patientCanonicalId?: string
  patientName?: string
  patientNameBn?: string | null
  facilityId: string
  facilityName?: string
  clinicianId: string
  clinicianName?: string
  assessmentId?: string | null
  assessmentType?: AssessmentType | null
  reviewStatus: ClinicalReviewStatus
  reviewType: ClinicalReviewType
  summary: string
  missingInformationNotes?: string | null
  conflictingInformationNotes?: string | null
  verifiedInformationNotes?: string | null
  requestedInformation?: string | null
  closedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface ClinicalObservationItem {
  id: string
  clinicalReviewId: string
  patientId: string
  clinicianId: string
  clinicianName?: string
  category: ClinicalObservationCategory
  observationText: string
  clinicalInterpretation?: string | null
  createdAt: string
}

export interface ClinicalDecisionItem {
  id: string
  clinicalReviewId: string
  patientId: string
  patientCanonicalId?: string
  patientName?: string
  clinicianId: string
  clinicianName?: string
  clinicianDesignation?: string
  decisionType: ClinicalDecisionType
  rationale: string
  disagreementWithAutomatedOutput: boolean
  disagreementReason?: string | null
  recommendedNextSteps: string
  referralTarget?: string | null
  status: ClinicalDecisionStatus
  finalizedAt?: string | null
  createdAt: string
  updatedAt: string
  amendments?: ClinicalDecisionAmendmentItem[]
}

export interface ClinicalDecisionAmendmentItem {
  id: string
  clinicalDecisionId: string
  clinicianId: string
  clinicianName?: string
  amendmentReason: string
  previousContent: Record<string, unknown>
  amendedContent: Record<string, unknown>
  createdAt: string
}

export interface ClinicalAlertItem {
  id: string
  patientId: string
  patientCanonicalId?: string
  patientName?: string
  patientNameBn?: string | null
  facilityId: string
  facilityName?: string
  assessmentId?: string | null
  alertType: ClinicalAlertType
  severity: ClinicalAlertSeverity
  title: string
  titleBn?: string | null
  description: string
  descriptionBn?: string | null
  source: string
  status: ClinicalAlertStatus
  acknowledgedBy?: string | null
  acknowledgedByName?: string | null
  acknowledgedAt?: string | null
  resolutionNotes?: string | null
  resolvedBy?: string | null
  resolvedByName?: string | null
  resolvedAt?: string | null
  createdAt: string
}

export interface ClinicalFollowUpPlanItem {
  id: string
  patientId: string
  patientCanonicalId?: string
  patientName?: string
  facilityId: string
  facilityName?: string
  clinicianId: string
  clinicianName?: string
  clinicalReviewId?: string | null
  instructions: string
  recommendedReviewDate: string
  status: ClinicalFollowUpStatus
  notes?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface ClinicalActivityItem {
  id: string
  clinicianId: string
  clinicianName?: string
  patientId?: string | null
  patientCanonicalId?: string | null
  patientName?: string | null
  facilityId: string
  facilityName?: string
  activityType: ClinicalActivityType
  summary: string
  summaryBn?: string | null
  metadata?: Record<string, unknown>
  createdAt: string
}

export interface ClinicalDashboardStats {
  totalPatientsUnderCare: number
  pendingReviewsCount: number
  unresolvedAlertsCount: number
  criticalAlertsCount: number
  followUpsDueCount: number
  completedReviewsThisMonth: number
  recentDecisionsCount: number
}

export interface ClinicalPatientSummary {
  id: string
  canonicalId: string
  fullName: string
  fullNameBn?: string | null
  dateOfBirth?: string | null
  age: number
  gender: string
  primaryPhone: string
  facilityId: string
  facilityName: string
  facilityDistrict?: string
  reviewStatus: ClinicalReviewStatus
  activeAlertsCount: number
  hasCriticalAlert: boolean
  lastAssessmentType?: AssessmentType | null
  lastAssessmentDate?: string | null
  lastAssessmentStatus?: AssessmentStatus | null
  lastReviewDate?: string | null
  nextFollowUpDate?: string | null
  assignedClinicianName?: string | null
}

export interface AssessmentReviewSummary {
  id: string
  patientId: string
  patientCanonicalId: string
  patientName: string
  assessmentType: AssessmentType
  status: AssessmentStatus
  initiatedAt: string
  submittedAt?: string | null
  algorithmicCategory?: string
  algorithmicScore?: number | null
  riskSummary?: string
  isNonDiagnosticNoticeConfirmed: boolean
  clinicalReviewStatus: ClinicalReviewStatus
  hasClinicianDecision: boolean
  clinicianDecisionType?: ClinicalDecisionType
}

export interface ConsolidatedClinicalProfile {
  // Section A: Patient Identity & Facility Association
  identity: {
    patient: Patient
    primaryFacilityName: string
    primaryFacilityDistrict?: string
    assignedClinicianName?: string
    registrationDate: string
  }
  // Section B: Medical History
  medicalHistory: {
    conditions: PatientMedicalConditionItem[]
    medications: PatientMedicationItem[]
    allergies: PatientAllergyItem[]
    familyHistory: PatientFamilyHistoryItem[]
  }
  // Section C: Lung Health & Risk-Related Factors
  lungHealthAndExposures: {
    smoking: PatientSmokingHistoryRecord | null
    environmentalBiomass: PatientEnvironmentalExposureItem[]
    occupationalExposures: PatientEnvironmentalExposureItem[]
    symptoms: PatientSymptomItem[]
    vitalsAndMeasurements: PatientHealthMeasurementItem[]
    hasHemoptysis: boolean
    hasUnexplainedWeightLoss: boolean
    packYearsCalculated: number
  }
  // Section D: Assessment History
  assessmentHistory: AssessmentReviewSummary[]
  // Section E: Clinical History
  clinicalHistory: {
    reviews: ClinicalReviewItem[]
    observations: ClinicalObservationItem[]
    decisions: ClinicalDecisionItem[]
    alerts: ClinicalAlertItem[]
    followUpPlans: ClinicalFollowUpPlanItem[]
  }
  rawHealthRecord?: ComprehensivePatientHealthRecord | null
}

// Input DTOs
export interface CreateClinicalReviewInput {
  patientId: string
  facilityId?: string | null
  assessmentId?: string | null
  reviewType: ClinicalReviewType
  reviewStatus: ClinicalReviewStatus
  summary: string
  missingInformationNotes?: string | null
  conflictingInformationNotes?: string | null
  verifiedInformationNotes?: string | null
  requestedInformation?: string | null
  observations?: Array<{
    category: ClinicalObservationCategory
    observationText: string
    clinicalInterpretation?: string | null
  }>
}

export interface DocumentClinicalDecisionInput {
  clinicalReviewId: string
  patientId: string
  decisionType: ClinicalDecisionType
  rationale: string
  disagreementWithAutomatedOutput: boolean
  disagreementReason?: string | null
  recommendedNextSteps: string
  referralTarget?: string | null
  status?: ClinicalDecisionStatus
}

export interface AmendClinicalDecisionInput {
  decisionId: string
  amendmentReason: string
  amendedContent: {
    decisionType?: ClinicalDecisionType
    rationale?: string
    recommendedNextSteps?: string
    referralTarget?: string | null
    disagreementWithAutomatedOutput?: boolean
    disagreementReason?: string | null
  }
}

export interface AcknowledgeClinicalAlertInput {
  alertId: string
  resolutionNotes?: string | null
  markResolved?: boolean
}

export interface CreateFollowUpPlanInput {
  patientId: string
  facilityId?: string | null
  clinicalReviewId?: string | null
  instructions: string
  recommendedReviewDate: string
  notes?: string | null
}

export interface UpdateFollowUpStatusInput {
  followUpId: string
  status: ClinicalFollowUpStatus
  notes?: string | null
}

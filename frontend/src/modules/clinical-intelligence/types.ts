/**
 * Phase 2.6: Advanced Clinical Intelligence Types & Domain Definitions
 *
 * Defines evidence sources, knowledge management, contextual decision support,
 * traceable recommendation assistance, and clinician interaction models.
 */

export type ClinicalEvidenceType =
  | 'guideline'
  | 'systematic_review'
  | 'randomized_trial'
  | 'observational_study'
  | 'national_protocol'
  | 'expert_consensus'

export type EvidenceTier =
  | 'Level 1a'
  | 'Level 1b'
  | 'Level 2a'
  | 'Level 2b'
  | 'Level 3'
  | 'Grade A'
  | 'Grade B'
  | 'Grade C'
  | 'Consensus'

export type ClinicalTopic =
  | 'risk_factors'
  | 'tobacco_exposure'
  | 'environmental_exposure'
  | 'screening_guidance'
  | 'symptom_triage'
  | 'diagnostic_pathways'
  | 'referral_criteria'
  | 'patient_education'

export type GuidelineJurisdiction =
  | 'Bangladesh'
  | 'International'
  | 'United States'
  | 'United Kingdom'
  | 'WHO'

export type GuidelineApprovalStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'active'
  | 'superseded'
  | 'withdrawn'

export type CDSInsightCategory =
  | 'risk_factor_alert'
  | 'screening_consideration'
  | 'symptom_warning'
  | 'environmental_hazard'
  | 'data_incompleteness'
  | 'referral_prompt'

export type CDSRecommendationCategory =
  | 'screening'
  | 'diagnostic_workup'
  | 'urgent_referral'
  | 'smoking_cessation'
  | 'environmental_mitigation'
  | 'routine_followup'

export type ProvenanceType =
  | 'patient_reported'
  | 'healthcare_worker_entered'
  | 'retrieved_evidence'
  | 'system_generated_decision_support'

export type ClinicianActionStatus =
  | 'pending'
  | 'accepted'
  | 'modified'
  | 'dismissed'
  | 'overridden'

export interface ClinicalEvidenceSource {
  id: string
  code: string
  titleEn: string
  titleBn: string
  issuingOrganization: string
  sourceType: ClinicalEvidenceType
  evidenceTier: EvidenceTier
  primaryTopic: ClinicalTopic
  jurisdiction: GuidelineJurisdiction
  publicationReference: string
  officialUrl?: string | null
  doi?: string | null
  publicationDate: string
  lastReviewedDate?: string | null
  versionTag: string
  approvalStatus: GuidelineApprovalStatus
  approvedForBangladesh: boolean
  bangladeshAdaptationNotes?: string | null
  summaryEn: string
  summaryBn: string
  keyRecommendationsEn: string[]
  keyRecommendationsBn: string[]
  clinicalLimitations?: string | null
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ClinicalKnowledgeArticle {
  id: string
  slug: string
  topic: ClinicalTopic
  titleEn: string
  titleBn: string
  contentEn: string
  contentBn: string
  targetAudience: 'clinician' | 'healthcare_worker' | 'patient' | 'public'
  primaryEvidenceSourceId?: string | null
  evidenceGrade?: string | null
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface ClinicalDecisionSupportInsight {
  id: string
  patientId: string
  assessmentId: string
  facilityId?: string | null
  insightCategory: CDSInsightCategory
  titleEn: string
  titleBn: string
  explanationEn: string
  explanationBn: string
  clinicalJustification: string
  provenanceType: ProvenanceType
  triggerAttributes: Record<string, unknown>
  supportingEvidenceIds: string[]
  confidenceTier: 'high' | 'moderate' | 'low' | 'provisional'
  clinicianActionStatus: ClinicianActionStatus
  clinicianActionNotes?: string | null
  actedBy?: string | null
  actedAt?: string | null
  createdAt: string
}

export interface ClinicalRecommendationAssistance {
  id: string
  patientId: string
  assessmentId: string
  insightId?: string | null
  recommendationCategory: CDSRecommendationCategory
  recommendationCode: string
  statementEn: string
  statementBn: string
  evidenceSourceId?: string | null
  evidenceStrength: string
  applicabilityConditions: string[]
  contraindications: string[]
  actionStatus: ClinicianActionStatus
  clinicianRationale?: string | null
  clinicianId?: string | null
  documentedAt?: string | null
  createdAt: string
}

export interface ClinicalEvidenceFilter {
  topic?: ClinicalTopic
  sourceType?: ClinicalEvidenceType
  evidenceTier?: EvidenceTier
  jurisdiction?: GuidelineJurisdiction
  approvalStatus?: GuidelineApprovalStatus
  approvedForBangladeshOnly?: boolean
  searchQuery?: string
}

export interface PatientCDSContextInput {
  patientId: string
  assessmentId: string
  facilityId?: string | null
  age: number
  gender: string
  smokingStatus: string
  packYears?: number
  yearsSmoked?: number
  usesBidi?: boolean
  usesBiomassChula?: boolean
  ambientPm25?: number
  hasHemoptysis?: boolean
  hasPersistentCough?: boolean
  hasUnexplainedWeightLoss?: boolean
  hasStridor?: boolean
  calculatedPlcomRiskPercent?: number
  screeningEligibilityStatus?: string
  detectedAnomaliesCount?: number
}


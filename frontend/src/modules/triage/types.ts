/**
 * Phase 1.14: Symptom-Based Clinical Triage Engine - Domain Types & Interfaces
 */

import type {
  TriageExecutionStatus,
  TriageUrgencyLevel,
  SymptomPresenceStatus,
  SymptomDataProvenance,
  TriageCriterionStatus,
  EscalationStatus,
  MethodologyLifecycleStatus,
} from '@/types/database'

export type {
  TriageExecutionStatus,
  TriageUrgencyLevel,
  SymptomPresenceStatus,
  SymptomDataProvenance,
  TriageCriterionStatus,
  EscalationStatus,
  MethodologyLifecycleStatus,
}

export type SymptomCategory = 'respiratory' | 'constitutional' | 'general'

export type SymptomSeverityLevel = 'mild' | 'moderate' | 'severe' | 'life_threatening'

export type SymptomProgression = 'worsening' | 'stable' | 'improving' | 'fluctuating'

export interface SymptomDetailItem {
  status: SymptomPresenceStatus
  durationWeeks?: number | null
  progression?: SymptomProgression | null
  severity?: SymptomSeverityLevel | null
  isPersistent?: boolean | null
  isNewOnChange?: boolean | null
  notes?: string | null
}

export interface PatientSymptomIntakePayload {
  // Respiratory
  cough?: SymptomDetailItem
  coughChanges?: SymptomDetailItem
  hemoptysis?: SymptomDetailItem & { isMassive?: boolean }
  dyspnea?: SymptomDetailItem & { mMRCGrade?: number }
  chestPain?: SymptomDetailItem
  wheezing?: SymptomDetailItem
  stridor?: SymptomDetailItem
  hoarseness?: SymptomDetailItem
  recurrentChestInfections?: SymptomDetailItem

  // Constitutional & General
  unexplainedWeightLoss?: SymptomDetailItem & { percentageLoss?: number }
  fatigue?: SymptomDetailItem
  appetiteLoss?: SymptomDetailItem
  unexplainedWeakness?: SymptomDetailItem
  nightSweats?: SymptomDetailItem

  // Additional relevant clinical observations
  cervicalLymphadenopathy?: SymptomDetailItem
  fingerClubbing?: SymptomDetailItem
  svcoSigns?: SymptomDetailItem // Superior vena cava obstruction (facial swelling, distended neck veins)
}

export interface TriagePatientContext {
  age: number
  smokingStatus: 'current' | 'former' | 'never' | 'unknown'
  packYears: number
  hasBiomassExposure: boolean
  hasOccupationalExposure: boolean
  hasPreviousTuberculosis: boolean
  hasCopdOrAsthma: boolean
  hasActiveMalignancy: boolean
  // Provenance & Source Metadata
  provenance: SymptomDataProvenance
  recordedByUserId?: string | null
  recordedByUserName?: string | null
  facilityId?: string | null
  facilityName?: string | null
}

export interface PreparedTriageInput {
  patientId: string
  patientCanonicalId: string
  patientName: string
  symptoms: PatientSymptomIntakePayload
  context: TriagePatientContext
  snapshotHash: string
  isComplete: boolean
  missingRequiredSymptoms: string[]
  unansweredCount: number
}

export interface TriageCriterionDefinition {
  key: string
  label: string
  category: 'emergency' | 'urgent' | 'prompt' | 'routine'
  ruleDescription: string
  requiredConditionExpression: string
  isRedFlag: boolean
}

export interface SymptomTriageProtocolItem {
  id: string
  protocolCode: string
  name: string
  issuingOrganization: string
  officialSourceUrl: string | null
  publicationReference: string
  jurisdiction: string
  intendedPopulation: string
  publicationDate: string
  lastUpdatedDate: string
  lifecycleStatus: MethodologyLifecycleStatus
  approvalAuthority: string
  approvedForBangladesh: boolean
  approvedAt: string | null
  reviewDate: string | null
  knownLimitations: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SymptomTriageProtocolVersionItem {
  id: string
  protocolId: string
  versionTag: string
  specificationReference: string
  criteriaDefinitions: TriageCriterionDefinition[]
  lifecycleStatus: MethodologyLifecycleStatus
  effectiveDate: string
  changelog: string
  createdAt: string
}

export interface TriageCriterionEvaluationResult {
  criterionKey: string
  criterionLabel: string
  criterionRuleDescription: string
  patientActualValue: string
  status: TriageCriterionStatus
  isRedFlag: boolean
  clinicalExplanation: string
}

export interface TriageEvaluationOutput {
  protocolId: string
  protocolCode: string
  protocolName: string
  protocolVersion: string
  executionMode: 'clinical_production' | 'research_simulation' | 'validation_audit'
  executionStatus: TriageExecutionStatus
  urgencyLevel: TriageUrgencyLevel
  isClinicallyApproved: boolean
  isResearchExecution: boolean
  recommendedEscalationPathway: string
  recommendedTimeframeDays: number | null
  governanceNotice: string
  clinicalSummary: string
  criteriaEvaluations: TriageCriterionEvaluationResult[]
  redFlagCount: number
  urgentCriteriaCount: number
  missingCriticalParameters: string[]
  inputSnapshotHash: string
  timestamp: string
}

export interface TriageExplanationResult {
  headlineOutcome: string
  urgencyBadge: {
    label: string
    color: 'red' | 'amber' | 'blue' | 'green' | 'gray'
    timeframe: string
  }
  triggeringSymptomsSummary: string[]
  criteriaBreakdown: TriageCriterionEvaluationResult[]
  missingInformationImpact: string | null
  clinicalConsiderations: string[]
  whatThisMeans: string
  whatThisDoesNotMean: string
  protocolCitation: string
  emergencyWarningNotice: string | null
}

export interface SymptomTriageDeterminationRecord {
  id: string
  patientId: string
  patientCanonicalId: string
  patientName: string
  facilityId: string | null
  symptomAssessmentId: string
  protocolId: string
  protocolCode: string
  protocolName: string
  protocolVersion: string
  executionMode: 'clinical_production' | 'research_simulation' | 'validation_audit'
  executionStatus: TriageExecutionStatus
  urgencyLevel: TriageUrgencyLevel
  recommendedEscalationPathway: string | null
  recommendedTimeframeDays: number | null
  clinicalAlertId: string | null
  governanceNotice: string | null
  clinicalExplanation: TriageExplanationResult
  disclaimers: string
  inputSnapshotHash: string
  evaluatedBy: string | null
  evaluatedByName: string | null
  evaluatedAt: string
  createdAt: string
}

export interface SymptomEscalationRecordItem {
  id: string
  determinationId: string
  patientId: string
  facilityId: string
  clinicalAlertId: string | null
  urgencyLevel: TriageUrgencyLevel
  escalationReason: string
  escalatedBy: string | null
  assignedToRole: string
  assignedClinicianId: string | null
  status: EscalationStatus
  acknowledgedBy: string | null
  acknowledgedAt: string | null
  actionDocumentedAt: string | null
  actionNotes: string | null
  resolvedBy: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface EvaluateSymptomTriageInput {
  patientId: string
  symptomsPayload: PatientSymptomIntakePayload
  protocolId?: string
  executionMode?: 'clinical_production' | 'research_simulation' | 'validation_audit'
  facilityId?: string
  provenance?: SymptomDataProvenance
  collectedByUserId?: string
}

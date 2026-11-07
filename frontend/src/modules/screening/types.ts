import type {
  MethodologyLifecycleStatus,
  RiskExecutionMode,
  ScreeningExecutionStatus,
  ScreeningEligibilityOutcome,
  CriterionEvaluationStatus,
} from '@/types/database'

export type {
  MethodologyLifecycleStatus,
  RiskExecutionMode,
  ScreeningExecutionStatus,
  ScreeningEligibilityOutcome,
  CriterionEvaluationStatus,
}

export interface ScreeningGuidelineItem {
  id: string
  guidelineCode: string
  name: string
  issuingOrganization: string
  officialSourceUrl?: string | null
  publicationReference?: string | null
  jurisdiction: string
  intendedPopulation: string
  publicationDate: string
  lastUpdatedDate?: string | null
  screeningIntervalMonths: number
  recommendedModality: string
  lifecycleStatus: MethodologyLifecycleStatus
  approvalAuthority?: string | null
  approvedForBangladesh: boolean
  approvedAt?: string | null
  reviewDate?: string | null
  knownLimitations: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ScreeningGuidelineVersionItem {
  id: string
  guidelineId: string
  versionTag: string
  specificationReference: string
  minAge: number
  maxAge: number
  minPackYears: number
  maxQuitYears: number | null
  requiresAsymptomatic: boolean
  exclusions: string[]
  criteriaDefinitions: Array<{
    key: string
    label: string
    ruleDescription: string
    requiredValueExpression: string
  }>
  lifecycleStatus: MethodologyLifecycleStatus
  effectiveDate: string
  changelog?: string | null
  createdAt: string
}

export interface ScreeningDerivedVariables {
  age: number
  isCurrentSmoker: boolean
  isFormerSmoker: boolean
  isNeverSmoker: boolean
  packYears: number
  yearsSmoked: number
  yearsSinceQuit: number | null
  hasActiveConcerningSymptoms: boolean
  concerningSymptomsList: string[]
  hasCurativeSurgeryContraindications: boolean
  contraindicationsList: string[]
  hasPriorLungMalignancy: boolean
}

export interface ScreeningValidationIssue {
  field: string
  type: 'missing' | 'implausible' | 'conflicting' | 'unverified'
  message: string
  severity: 'blocking' | 'warning'
}

export interface PreparedScreeningInput {
  patientId: string
  patientCanonicalId: string
  patientName: string
  demographics: {
    age: number
    gender: string
    dateOfBirth?: string | null
  }
  smokingHistory: {
    status: string
    cigarettesPerDay: number
    bidisPerDay: number
    yearsSmoked: number
    packYears: number
    yearsSinceQuit: number | null
    quitDate?: string | null
  }
  clinicalStatus: {
    hasActiveSymptoms: boolean
    activeSymptoms: string[]
    hasPriorLungCancer: boolean
    hasLimitedLifeExpectancy: boolean
    lifeExpectancyNotes?: string | null
  }
  derived: ScreeningDerivedVariables
  provenance: Record<string, { source: string; verified: boolean; timestamp: string }>
  validation: {
    isValid: boolean
    hasBlockingIssues: boolean
    issues: ScreeningValidationIssue[]
  }
  snapshotHash: string
}

export interface CriterionEvaluationResult {
  criterionKey: string
  criterionLabel: string
  criterionRuleDescription: string
  requiredValueExpression: string
  patientActualValue: string
  status: CriterionEvaluationStatus
  isBlockingExclusion: boolean
  clinicalExplanation: string
}

export interface ScreeningEvaluationOutput {
  guidelineId: string
  guidelineCode: string
  guidelineName: string
  guidelineVersion: string
  executionMode: RiskExecutionMode
  executionStatus: ScreeningExecutionStatus
  eligibilityOutcome: ScreeningEligibilityOutcome
  isClinicallyApproved: boolean
  isResearchExecution: boolean
  criteriaEvaluations: CriterionEvaluationResult[]
  recommendedIntervalMonths: number | null
  recommendedModality: string | null
  nextRecommendedScreeningDate: string | null
  governanceNotice: string
  clinicalSummary: string
  limitations: string
}

export interface ScreeningExplanationResult {
  headlineOutcome: string
  criteriaBreakdown: CriterionEvaluationResult[]
  missingInformationImpact: string | null
  clinicalConsiderations: string[]
  whatThisMeans: string
  whatThisDoesNotMean: string
  guidelineCitation: string
  symptomPriorityWarning?: string | null
}

export interface ScreeningEligibilityRecord {
  id: string
  assessmentId?: string | null
  patientId: string
  patientCanonicalId: string
  patientName: string
  facilityId: string
  guidelineId: string
  guidelineCode: string
  guidelineName: string
  guidelineVersion: string
  executionMode: RiskExecutionMode
  executionStatus: ScreeningExecutionStatus
  eligibilityOutcome: ScreeningEligibilityOutcome
  isClinicallyApproved: boolean
  isResearchExecution: boolean
  hasMissingRequiredInputs: boolean
  missingInputsList: string[]
  inconsistentInputsList: string[]
  recommendedIntervalMonths: number | null
  recommendedModality: string | null
  nextRecommendedScreeningDate: string | null
  governanceNotice: string
  clinicalSummary: string
  inputSnapshotHash: string
  inputSnapshot: PreparedScreeningInput
  criteriaEvaluations: CriterionEvaluationResult[]
  explanation: ScreeningExplanationResult
  executedBy?: string | null
  executedByName?: string | null
  executedAt: string
  createdAt: string
  updatedAt: string
}

export interface EvaluateScreeningInput {
  patientId: string
  guidelineId?: string
  executionMode?: RiskExecutionMode
  facilityId?: string
  clinicianOverrideId?: string | null
}


import type {
  MethodologyLifecycleStatus,
  RiskCalculationType,
  RiskExecutionMode,
  RiskExecutionStatus,
} from '@/types/database'

export type {
  MethodologyLifecycleStatus,
  RiskCalculationType,
  RiskExecutionMode,
  RiskExecutionStatus,
}

export interface RiskMethodologyItem {
  id: string
  name: string
  code: string
  authoritativeSource: string
  publicationReference?: string | null
  intendedPopulation: string
  calculationType: RiskCalculationType
  outputDefinition: string
  timeHorizonYears: number
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

export interface RiskMethodologyVersionItem {
  id: string
  methodologyId: string
  versionTag: string
  specificationReference: string
  parameters: Record<string, unknown>
  lifecycleStatus: MethodologyLifecycleStatus
  effectiveDate: string
  changelog?: string | null
  createdAt: string
}

export interface DerivedRiskVariables {
  age: number
  packYears: number
  yearsSmoked: number
  quitYearsAgo: number | null
  isCurrentSmoker: boolean
  isFormerSmoker: boolean
  isNeverSmoker: boolean
  cigarettesPerDay: number
  bmi: number | null
  hasCopdOrEmphysema: boolean
  hasPriorCancer: boolean
  hasFamilyLungCancer: boolean
  hasBiomassExposure: boolean
  hasOccupationalExposure: boolean
}

export interface InputValidationIssue {
  field: string
  type: 'missing' | 'implausible' | 'conflicting' | 'unverified'
  message: string
  severity: 'blocking' | 'warning'
}

export interface PreparedRiskInput {
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
    ageStarted?: number | null
    ageQuit?: number | null
    packYears: number
    yearsSinceQuit: number | null
  }
  medicalHistory: {
    hasCopd: boolean
    hasPriorMalignancy: boolean
    hasFamilyLungCancer: boolean
    conditionsSummary: string[]
  }
  environmentalAndOccupational: {
    hasBiomassCookingFuel: boolean
    biomassDurationYears?: number | null
    hasOccupationalCarcinogens: boolean
    occupationalTypes: string[]
  }
  derived: DerivedRiskVariables
  provenance: Record<string, { source: string; verified: boolean; timestamp: string }>
  validation: {
    isValid: boolean
    hasBlockingIssues: boolean
    issues: InputValidationIssue[]
  }
  snapshotHash: string
}

export interface RiskFactorAttribution {
  factorKey: string
  factorLabel: string
  valueDisplay: string
  direction: 'increases_risk' | 'decreases_risk' | 'neutral'
  relativeSignificance: 'high' | 'moderate' | 'low'
  clinicalExplanation: string
}

export interface RiskCalculationOutput {
  methodologyId: string
  methodologyVersion: string
  executionMode: RiskExecutionMode
  executionStatus: RiskExecutionStatus
  estimatedRiskPercentage: number | null
  riskCategory: 'low' | 'moderate' | 'elevated' | 'high' | null
  timeHorizonYears: number
  isClinicallyApproved: boolean
  isResearchExecution: boolean
  uncertaintyRange?: {
    lowerBound: number
    upperBound: number
    confidenceInterval: string
  } | null
  governanceNotice: string
  limitations: string
}

export interface RiskExplanationResult {
  contributingFactors: RiskFactorAttribution[]
  missingFactorsImpact: string | null
  assumptionsApplied: string[]
  interpretationSummary: string
  limitations: string
  whatThisMeans: string
  whatThisDoesNotMean: string
}

export interface RiskAssessmentRecord {
  id: string
  assessmentId?: string | null
  patientId: string
  patientCanonicalId: string
  patientName: string
  facilityId: string
  methodologyId: string
  methodologyName: string
  methodologyVersion: string
  executionMode: RiskExecutionMode
  executionStatus: RiskExecutionStatus
  estimatedRiskPercentage: number | null
  riskCategory?: string | null
  timeHorizonYears: number
  isClinicallyApproved: boolean
  isResearchExecution: boolean
  hasMissingRequiredInputs: boolean
  missingInputsList: string[]
  inconsistentInputsList: string[]
  uncertaintyRange?: {
    lowerBound: number
    upperBound: number
    confidenceInterval: string
  } | null
  clinicalDisclaimer: string
  inputSnapshot: PreparedRiskInput
  explanation: RiskExplanationResult
  executedBy?: string | null
  executedByName?: string | null
  executedAt: string
  createdAt: string
  updatedAt: string
}

export interface ExperimentalModelItem {
  id: string
  modelName: string
  datasetProvenance: string
  datasetLimitations: string
  modelArchitecture: string
  trainingDate?: string | null
  isExperimentalOnly: boolean
  canInfluenceClinicalPipeline: boolean
  auditNotes?: string | null
  createdAt: string
}

// Input DTOs
export interface ExecuteRiskAssessmentInput {
  patientId: string
  methodologyId?: string
  executionMode?: RiskExecutionMode
  facilityId?: string
  clinicianOverrideId?: string | null
}

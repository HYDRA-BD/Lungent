/**
 * Phase 1.24: Clinical Governance Domain Types
 * Controls CAB, Methodology Registry, Lifecycles, Rule Versioning,
 * Clinician Overrides, Periodic Reviews, and Immutable Audit Trail.
 */

export type GovernanceRole =
  | 'chair'
  | 'vice_chair'
  | 'clinical_reviewer'
  | 'methodology_author'
  | 'biostatistician'
  | 'secretary'
  | 'observer'

export type MemberStatus =
  | 'active'
  | 'on_leave'
  | 'emeritus'
  | 'resigned'
  | 'terminated'

export type MethodologyType =
  | 'risk_prediction'
  | 'screening_eligibility'
  | 'symptom_triage'
  | 'combined_protocol'

export type EvidenceGrade =
  | 'Level 1a'
  | 'Level 1b'
  | 'Level 2a'
  | 'Level 2b'
  | 'Level 3'
  | 'Expert Consensus'

export type GovernanceLifecycleStatus =
  | 'draft'
  | 'submitted_for_review'
  | 'under_clinical_review'
  | 'revisions_requested'
  | 'awaiting_formal_approval'
  | 'approved'
  | 'active'
  | 'suspended'
  | 'deprecated'
  | 'rejected'

// Alias for governance methodology version lifecycle
export type MethodologyVersionLifecycle = GovernanceLifecycleStatus

export type OverrideReasonCategory =
  | 'clinical_contraindication'
  | 'patient_preference'
  | 'comorbidity_precaution'
  | 'diagnostic_discordance'
  | 'expert_judgment'
  | 'other'

export type GovernanceActionType =
  | 'created'
  | 'status_changed'
  | 'approved'
  | 'activated'
  | 'suspended'
  | 'deprecated'
  | 'rejected'
  | 'reviewed'
  | 'credential_verified'

export interface GovernanceBody {
  id: string
  name: string
  jurisdiction: string
  charterSummary: string
  establishedAt: string
  status: 'active' | 'inactive' | 'dissolved'
  metadata?: Record<string, unknown>
}

export interface GovernanceMember {
  id: string
  bodyId: string
  userId?: string | null
  fullName: string
  role: GovernanceRole
  specialization: string
  medicalRegistrationNumber?: string | null
  credentialsVerified: boolean
  verifiedBy?: string | null
  verifiedAt?: string | null
  institutionalAffiliation: string
  termStartDate: string
  termEndDate?: string | null
  conflictOfInterestDeclaration?: string | null
  hasActiveConflict: boolean
  status: MemberStatus
}

export interface GovernanceMeeting {
  id: string
  bodyId: string
  meetingNumber: string
  title: string
  scheduledAt: string
  heldAt?: string | null
  chairId?: string | null
  quorumPresent: boolean
  agenda: string
  minutes?: string | null
  resolutions?: string | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  attendees: string[]
}

export interface ClinicalRuleVersion {
  id: string
  methodologyVersionId: string
  ruleIdentifier: string
  ruleName: string
  parameterThresholds: Record<string, unknown>
  logicDescription: string
  isMandatorySafetyRule: boolean
  createdAt: string
}

export interface ClinicalMethodologyVersion {
  id: string
  methodologyId: string
  versionString: string
  semver: string
  status: GovernanceLifecycleStatus
  changelog: string
  ruleDefinitions: Record<string, unknown>
  rules?: ClinicalRuleVersion[]
  approvedByMemberId?: string | null
  approvedByMemberName?: string | null
  approvedAt?: string | null
  meetingId?: string | null
  approvalNotes?: string | null
  reviewCycleMonths: number
  nextReviewDueDate: string
  lastReviewedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface ClinicalMethodology {
  id: string
  code: string
  type: MethodologyType
  name: string
  description: string
  issuingOrganization: string
  primaryReference: string
  targetPopulation: string
  clinicalLimitations: string
  evidenceGrade: EvidenceGrade
  activeVersionId?: string | null
  activeVersionString?: string | null
  governanceStatus: 'draft' | 'under_review' | 'active' | 'suspended' | 'deprecated'
  versions?: ClinicalMethodologyVersion[]
  createdAt: string
  updatedAt: string
}

export interface ClinicalRecommendation {
  id: string
  methodologyId: string
  code: string
  category: 'screening' | 'referral' | 'urgent_action' | 'follow_up' | 'lifestyle_counseling'
  titleEn: string
  titleBn: string
  descriptionEn: string
  descriptionBn: string
  clinicalRationale: string
  evidenceStrength: string
  status: 'active' | 'deprecated' | 'suspended'
}

export interface ClinicianOverrideRecord {
  id: string
  assessmentId: string
  patientId: string
  clinicianId: string
  clinicianName: string
  facilityId?: string | null
  engineSubsystem: 'risk_estimation' | 'screening_eligibility' | 'symptom_triage' | 'clinical_decision_support'
  methodologyVersionId?: string | null
  automatedResult: Record<string, unknown>
  overriddenResult: Record<string, unknown>
  overrideReasonCategory: OverrideReasonCategory
  overrideRationale: string
  createdAt: string
}

export interface GovernanceAuditEvent {
  id: string
  entityType: 'board' | 'member' | 'meeting' | 'methodology' | 'version' | 'rule' | 'recommendation' | 'override_review'
  entityId: string
  action: GovernanceActionType
  previousState?: Record<string, unknown> | null
  newState: Record<string, unknown>
  actorId: string
  actorName: string
  actorRole: string
  justification: string
  meetingReference?: string | null
  createdAt: string
}

export interface PeriodicReviewItem {
  methodologyId: string
  methodologyCode: string
  methodologyName: string
  versionId: string
  versionString: string
  status: GovernanceLifecycleStatus
  reviewCycleMonths: number
  lastReviewedAt?: string | null
  nextReviewDueDate: string
  isOverdue: boolean
  daysRemainingOrOverdue: number
  assignedReviewerName?: string | null
}

export interface GovernanceDashboardSummary {
  totalMethodologies: number
  activeMethodologies: number
  underReviewMethodologies: number
  suspendedMethodologies: number
  totalBoardMembers: number
  verifiedMembers: number
  totalCompletedMeetings: number
  totalOverridesRecorded: number
  overdueReviewsCount: number
  boardName: string
  jurisdiction: string
}

export interface GovernanceCheckResult {
  allowed: boolean
  methodologyCode: string
  versionString: string
  lifecycleStatus: GovernanceLifecycleStatus
  notice?: string
  isEmergencyOverrideAllowed?: boolean
}

// =============================================================================
// Phase 2.3: Clinical Model Validation Domain Types
// =============================================================================

export type ValidationStage =
  | 'internal_evaluation'
  | 'independent_validation'
  | 'bangladesh_external_validation'
  | 'clinical_performance'
  | 'clinical_utility'
  | 'subgroup_fairness'
  | 'governance_review'

export type ModelValidationStatus =
  | 'pending'
  | 'in_progress'
  | 'validated'
  | 'validation_failed'
  | 'insufficient_evidence'
  | 'rejected'

export type CABModelDecision =
  | 'approved_for_defined_use'
  | 'approved_subject_to_conditions'
  | 'requires_additional_evidence'
  | 'rejected'
  | 'suspended_or_withdrawn'

export type ModelLifecycleTier =
  | 'experimental'
  | 'validated'
  | 'approved'
  | 'operationally_activated'
  | 'prohibited'

export interface ValidationDatasetProfile {
  id: string
  name: string
  source: string
  jurisdiction: string
  collectionMethodology: string
  sampleSize: number
  outcomeVariable: string
  populationCharacteristics: string
  isIndependent: boolean
  isBangladeshSpecific: boolean
  isAuthorized: boolean
  limitations: string[]
}

export interface DiscriminationMetrics {
  rocAuc: number
  prAuc: number
  sensitivity: number
  specificity: number
  ppv: number
  npv: number
  f1Score: number
  accuracy: number
  brierScore: number
  confusionMatrix: {
    tp: number
    fp: number
    tn: number
    fn: number
  }
  thresholdUsed: number
  confidenceIntervals95?: Record<string, [number, number]>
}

export interface CalibrationDecile {
  decile: number
  meanPredictedProb: number
  observedFrequency: number
  count: number
}

export interface CalibrationMetrics {
  calibrationSlope: number
  calibrationIntercept: number
  brierScore: number
  deciles: CalibrationDecile[]
  overconfidenceAssessment: 'none' | 'mild' | 'moderate' | 'severe'
  underconfidenceAssessment: 'none' | 'mild' | 'moderate' | 'severe'
  recalibrationRecommended: boolean
  recalibrationRationale?: string
}

export interface NetBenefitThreshold {
  thresholdProbability: number
  modelNetBenefit: number
  allNetBenefit: number
  noneNetBenefit: number
}

export interface ClinicalUtilityMetrics {
  intendedUse: string
  targetPopulation: string
  netBenefitAtThresholds: NetBenefitThreshold[]
  falsePositiveClinicalCost: string
  falseNegativeClinicalRisk: string
  bangladeshWorkflowApplicability: string
  practicalFeasibilityScore: 'high' | 'moderate' | 'low' | 'inapplicable'
}

export interface SubgroupEvaluationRow {
  groupName: string
  sampleSize: number
  prevalence: number
  rocAuc?: number
  sensitivity: number
  specificity: number
  disparityFlag: boolean
  disparityNote?: string
}

export interface SubgroupFairnessResult {
  dimension: 'age' | 'sex' | 'race_ethnicity' | 'cost_barrier' | 'geography'
  subgroups: SubgroupEvaluationRow[]
  overallFairnessVerdict: 'acceptable' | 'conditional_disparities_noted' | 'unacceptable_disparity'
}

export interface BangladeshGeneralizabilityAssessment {
  evaluated: boolean
  datasetAvailable: boolean
  evidenceGapSummary: string
  distributionShiftIdentified: boolean
  missingVariables: string[]
  prospectiveRequirements: string
}

export interface CABReviewRecord {
  decision: CABModelDecision
  reviewedAt: string
  reviewedByMemberId: string
  reviewedByMemberName: string
  conditionsOrRestrictions?: string[]
  clinicalRationale: string
  nextReassessmentDate?: string
}

export interface OperationalActivationRecord {
  isActivated: boolean
  activatedAt?: string | null
  activatedBy?: string | null
  activationBlockedReason?: string | null
}

export interface AIModelValidationRecord {
  id: string
  modelId: string
  modelName: string
  modelVersion: string
  lifecycleTier: ModelLifecycleTier
  originalExperimentRef: string
  developmentDatasetRef: string
  validationDatasetProfile: ValidationDatasetProfile
  validationProtocol: string
  validationDate: string
  validationStatus: ModelValidationStatus
  discriminationMetrics?: DiscriminationMetrics
  calibrationMetrics?: CalibrationMetrics
  clinicalUtilityMetrics?: ClinicalUtilityMetrics
  subgroupFairness?: SubgroupFairnessResult
  bangladeshGeneralizability: BangladeshGeneralizabilityAssessment
  cabReviewDecision?: CABReviewRecord
  operationalActivation: OperationalActivationRecord
  safetyInvariantsEnforced: boolean
  createdAt: string
  updatedAt: string
}

// =============================================================================
// Phase 2.4: Explainable AI (XAI) Domain Types
// =============================================================================

export interface FeatureExplanationItem {
  feature: string
  labelEn: string
  labelBn: string
  domain: string
  value?: number | string
  importanceScore?: number
  oddsRatio?: number
  shapValue?: number
  direction: 'increases_risk' | 'decreases_risk' | 'neutral'
}

export interface ModelUncertaintyProfile {
  ensembleStdDev: number
  predictionInterval95: [number, number]
  treeProbRange?: [number, number]
  missingFeaturesCount: number
  imputationIndex: number
  outOfDistributionFlag: boolean
  outOfDistributionReasons?: string[]
  confidenceTier: 'high' | 'moderate' | 'low_uncertain'
  unmeasuredContextWarning: string
}

export interface LocalProfileExplanation {
  profileId: string
  profileLabel: string
  predictedProbability: number
  baselineProbability: number
  topContributions: FeatureExplanationItem[]
  uncertainty: ModelUncertaintyProfile
}

export interface ExplanationStabilityAssessment {
  repeatabilityDiscrepancy: number
  meanProbabilityShift: number
  maxProbabilityShift?: number
  stabilityVerdict: 'highly_stable' | 'moderately_sensitive' | 'unstable'
  methodologicalNote: string
}

export interface ModelXAIProfile {
  id: string
  modelId: string
  modelName: string
  modelVersion: string
  supportedExplainerTypes: Array<'LinearExplainer' | 'TreeExplainer' | 'Permutation' | 'NotApplicable'>
  nonCausalDisclaimerEn: string
  nonCausalDisclaimerBn: string
  baselineProbability: number
  globalFeatureImportance: FeatureExplanationItem[]
  localProfileExplanations: LocalProfileExplanation[]
  stabilityAssessment: ExplanationStabilityAssessment
  governanceNotice: string
  createdAt: string
  updatedAt: string
}

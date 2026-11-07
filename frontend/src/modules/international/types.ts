/**
 * Phase 2.12: International Expansion Domain Types
 * Multi-country configuration, clinical guideline governance,
 * regulatory and privacy compliance, generalized geographic hierarchy,
 * environmental provider abstraction, and international rollout readiness.
 */

export type CountryStatus =
  | 'active'
  | 'provisional'
  | 'disabled'
  | 'synthetic_example'

export type MeasurementSystem = 'metric' | 'imperial'

export interface GeographicHierarchyLevel {
  level: number
  nameEn: string
  nameNative: string
  description?: string
}

export interface InternationalCountryProfile {
  id: string
  countryCode: string // ISO 3166-1 alpha-2 (e.g. 'BD', 'MY')
  isoAlpha3: string   // ISO 3166-1 alpha-3 (e.g. 'BGD', 'MYS')
  numericCode: string // ISO 3166-1 numeric (e.g. '050', '458')
  nameEn: string
  nameNative: string
  officialLanguages: string[]
  supportedLocales: string[]
  defaultLocale: string
  timeZones: string[]
  dateFormat: string
  timeFormat: '12h' | '24h'
  measurementSystem: MeasurementSystem
  currencyCode: string
  currencySymbol: string
  geographicHierarchyLevels: GeographicHierarchyLevel[]
  environmentalProvider: string
  status: CountryStatus
  isDefault: boolean
  regulatoryFramework: string
  dataResidencyRequired: boolean
  dataResidencyRegion?: string | null
  clinicalExecutionEnabled: boolean
  version: number
  createdAt: string
  updatedAt: string
}

// ==============================================================================
// 2. Clinical Guideline Governance Models
// ==============================================================================

export type CountryGuidelineApprovalStatus =
  | 'approved'
  | 'pending_clinical_advisory_board'
  | 'under_review'
  | 'retired'
  | 'synthetic_draft'

export interface CountryClinicalGuideline {
  id: string
  countryCode: string
  guidelineKey: string
  title: string
  titleNative: string
  sourceOrganization: string
  publicationYear: number
  effectiveDate: string
  reviewCycleMonths: number
  intendedPopulation: string
  clinicalScope: string[]
  approvalStatus: CountryGuidelineApprovalStatus
  approvedByBoardAt?: string | null
  approvedByBoardReference?: string | null
  riskEstimationModelAllowed: boolean
  screeningEligibilityCriteria: Record<string, unknown>
  referralPathwaySpecification: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ClinicalGuidelineEvaluation {
  isExecutionAllowed: boolean
  activeGuideline?: CountryClinicalGuideline
  warningMessage?: string
}

// ==============================================================================
// 3. Regulatory & Privacy Governance Models
// ==============================================================================

export type LegalVerificationStatus =
  | 'verified'
  | 'pending_legal_review'
  | 'unverified_synthetic'

export type ConsentModel =
  | 'explicit_opt_in'
  | 'opt_out'
  | 'delegated_care_team'

export interface CountryRegulatoryPrivacyProfile {
  id: string
  countryCode: string
  dataProtectionActName: string
  legalVerificationStatus: LegalVerificationStatus
  consentModel: ConsentModel
  patientDataRetentionYears: number
  crossBorderTransferAllowed: boolean
  crossBorderSafeguards?: string | null
  patientExportRightsSupported: boolean
  patientDeletionRightsSupported: boolean
  breachNotificationWindowHours: number
  privacyOfficerContact?: string | null
  createdAt: string
  updatedAt: string
}

export interface CrossBorderTransferEvaluation {
  isPermitted: boolean
  legalBasis: string
  auditLogId: string
  restrictionReason?: string
}

// ==============================================================================
// 4. Generalized Geographic Administrative Models
// ==============================================================================

export interface CountryGeographicNode {
  id: string
  countryCode: string
  nodeCode: string
  nameEn: string
  nameNative: string
  level: number // 1: State/Division, 2: District/County, 3: Upazila/City
  parentNodeCode?: string | null
  latitude?: number | null
  longitude?: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ==============================================================================
// 5. Environmental Provider Abstraction Models
// ==============================================================================

export type EnvironmentalProviderType =
  | 'open_meteo'
  | 'copernicus_cams'
  | 'epa_airnow'
  | 'custom_adapter'

export interface StandardizedEnvironmentalObservation {
  countryCode: string
  provider: EnvironmentalProviderType
  pm25: number
  pm10: number
  no2?: number
  so2?: number
  o3?: number
  aqi?: number
  dataSourceType: 'measured' | 'modelled' | 'satellite_derived' | 'forecast'
  observedAt: string
}

// ==============================================================================
// 6. International Rollout & Readiness Models (12-Step Framework)
// ==============================================================================

export type ReadinessStepCategory =
  | 'governance'
  | 'clinical'
  | 'technical'
  | 'regulatory'
  | 'operational'

export interface CountryReadinessStep {
  stepNumber: number // 1 to 12
  stepName: string
  stepNameBn?: string
  category: ReadinessStepCategory
  isCompleted: boolean
  verificationNotes?: string | null
  verifiedBy?: string | null
  verifiedAt?: string | null
}

export interface CountryReadinessScorecard {
  countryCode: string
  countryName: string
  totalSteps: number
  completedSteps: number
  readinessScorePct: number
  isDeploymentAuthorized: boolean
  categoryScores: Record<ReadinessStepCategory, { completed: number; total: number; scorePct: number }>
  unfulfilledPrerequisites: string[]
}

/**
 * Phase 2.11: Regional & Nationwide Expansion Types & Domain Definitions
 */

export type FacilityOnboardingStatus =
  | 'draft'
  | 'pending_verification'
  | 'verified'
  | 'active'
  | 'suspended'
  | 'deactivated'

export type NetworkTier =
  | 'national_network'
  | 'divisional_network'
  | 'district_consortium'

export type NetworkMemberRole =
  | 'hub_lead'
  | 'specialty_referral_center'
  | 'primary_intake_spoke'
  | 'community_clinic_node'

export type NetworkCrossAccessPurpose =
  | 'referral_consultation'
  | 'diagnostic_review'
  | 'emergency_care'
  | 'clinical_audit'

export type SubsystemType =
  | 'database'
  | 'api_gateway'
  | 'auth_service'
  | 'fhir_gateway'
  | 'dicom_pacs_bridge'
  | 'environmental_feed'
  | 'notification_gateway'

export type SubsystemHealthStatus =
  | 'healthy'
  | 'degraded'
  | 'unavailable'
  | 'not_configured'
  | 'unknown'

// ==============================================================================
// 1. Regional Healthcare Network Models
// ==============================================================================

export interface RegionalHealthcareNetworkMeta {
  id: string
  networkCode: string
  networkName: string
  networkNameBn: string
  leadHubFacilityId?: string | null
  leadHubFacilityName?: string
  division: string
  coverageDistricts: string[]
  tier: NetworkTier
  status: 'active' | 'provisional' | 'inactive'
  memberCount: number
  operationalSettings: {
    autoRoutingEnabled: boolean
    maxCrossFacilityReferralHops: number
    consentVerificationEnforced: boolean
  }
  createdAt: string
}

export interface FacilityNetworkMembershipMeta {
  id: string
  networkId: string
  networkName: string
  facilityId: string
  facilityName: string
  facilityTier: string
  division: string
  district: string
  memberRole: NetworkMemberRole
  crossFacilitySharingEnabled: boolean
  status: 'active' | 'pending_onboarding' | 'suspended'
  joinedAt: string
}

// ==============================================================================
// 2. Regional Facility Onboarding Models
// ==============================================================================

export interface OnboardingChecklistItems {
  physicalInfrastructureVerified: boolean
  powerAndInternetRedundancyVerified: boolean
  dghsRegistryCodeVerified: boolean
  administratorsAssigned: boolean
  chwAndClinicianAccountsProvisioned: boolean
  staffTrainedOnClinicalSafety: boolean
  sandboxFhirAndDicomPingVerified: boolean
  localConsentProtocolsConfigured: boolean
}

export interface FacilityOnboardingRecord {
  id: string
  facilityId: string
  facilityName: string
  dghsFacilityCode: string
  division: string
  district: string
  upazila: string
  facilityTier: 'national_specialized' | 'tertiary_medical_college' | 'district_hospital' | 'upazila_health_complex' | 'community_clinic'
  onboardingStatus: FacilityOnboardingStatus
  readinessScore: number // 0 to 100
  checklistItems: OnboardingChecklistItems
  primaryAdminUserId?: string | null
  primaryAdminName?: string
  verifiedByUserId?: string | null
  verifiedAt?: string | null
  activatedAt?: string | null
  suspensionReason?: string | null
  createdAt: string
  updatedAt: string
}

// ==============================================================================
// 3. Cross-Facility Access & Referral Models
// ==============================================================================

export interface CrossFacilityAccessRequest {
  requestingFacilityId: string
  originatingFacilityId: string
  patientId: string
  accessorUserId: string
  accessorRole: string
  accessPurpose: NetworkCrossAccessPurpose
  consentCode: string
}

export interface CrossFacilityAccessLogItem {
  id: string
  requestingFacilityId: string
  requestingFacilityName?: string
  originatingFacilityId: string
  originatingFacilityName?: string
  patientId: string
  accessorUserId: string
  accessorRole: string
  accessPurpose: NetworkCrossAccessPurpose
  consentCodeVerified: string
  isAuthorized: boolean
  accessedAt: string
}

// ==============================================================================
// 4. Centralized Monitoring & Subsystem Health Models
// ==============================================================================

export interface SubsystemHealthIndicator {
  subsystem: SubsystemType
  nameEn: string
  nameBn: string
  status: SubsystemHealthStatus
  latencyMs: number
  endpoint?: string
  lastCheckedAt: string
  activeIncidentsCount: number
  details?: string
}

export interface ServiceHealthIncidentItem {
  id: string
  subsystem: SubsystemType
  regionOrFacility: string
  healthStatus: SubsystemHealthStatus
  incidentDescription: string
  latencyMs: number
  isResolved: boolean
  resolvedAt?: string | null
  createdAt: string
}

// ==============================================================================
// 5. Regional Rollout & Expansion Readiness Models
// ==============================================================================

export interface RolloutMilestone {
  stepNumber: number
  code: string
  titleEn: string
  titleBn: string
  isCompleted: boolean
  completedAt?: string
  responsibleAuthority: string
  verificationRequirements: string[]
}

export interface RegionalExpansionSummary {
  totalConfiguredNetworks: number
  totalOnboardedFacilities: number
  activeFacilitiesCount: number
  pendingVerificationCount: number
  crossFacilityReferralsCount: number
  nationwideSystemHealth: SubsystemHealthStatus
  subsystems: SubsystemHealthIndicator[]
  rolloutMilestones: RolloutMilestone[]
}

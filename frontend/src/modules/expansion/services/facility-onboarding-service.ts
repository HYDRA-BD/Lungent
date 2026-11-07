/**
 * Phase 2.11: Regional Facility Onboarding Service
 * Manages multi-tier facility onboarding, administrative assignment,
 * readiness scoring, duplicate registration prevention, and lifecycle state transitions.
 */

import type {
  FacilityOnboardingRecord,
  OnboardingChecklistItems,
} from '../types'

export interface RegisterFacilityOnboardingInput {
  facilityId: string
  facilityName: string
  dghsFacilityCode: string
  division: string
  district: string
  upazila: string
  facilityTier: 'national_specialized' | 'tertiary_medical_college' | 'district_hospital' | 'upazila_health_complex' | 'community_clinic'
  primaryAdminUserId?: string
  primaryAdminName?: string
}

export class FacilityOnboardingService {
  private static registeredDghsCodes = new Set<string>()

  /**
   * Calculates facility readiness score (0 to 100) based on verified checklist items
   */
  public static calculateReadinessScore(checklist: OnboardingChecklistItems): number {
    const keys: Array<keyof OnboardingChecklistItems> = [
      'physicalInfrastructureVerified',
      'powerAndInternetRedundancyVerified',
      'dghsRegistryCodeVerified',
      'administratorsAssigned',
      'chwAndClinicianAccountsProvisioned',
      'staffTrainedOnClinicalSafety',
      'sandboxFhirAndDicomPingVerified',
      'localConsentProtocolsConfigured',
    ]

    const checkedCount = keys.filter(k => checklist[k] === true).length
    return Math.round((checkedCount / keys.length) * 100)
  }

  /**
   * Registers a new facility into the regional onboarding workflow
   */
  public static initiateOnboarding(input: RegisterFacilityOnboardingInput): FacilityOnboardingRecord {
    const normalizedCode = input.dghsFacilityCode.trim().toUpperCase()

    // Prevent accidental duplicate facility registration
    if (this.registeredDghsCodes.has(normalizedCode)) {
      throw new Error(`Duplicate Facility Registration: DGHS code ${normalizedCode} is already registered`)
    }

    this.registeredDghsCodes.add(normalizedCode)

    const initialChecklist: OnboardingChecklistItems = {
      physicalInfrastructureVerified: false,
      powerAndInternetRedundancyVerified: false,
      dghsRegistryCodeVerified: true, // DGHS code provided during intake
      administratorsAssigned: Boolean(input.primaryAdminUserId),
      chwAndClinicianAccountsProvisioned: false,
      staffTrainedOnClinicalSafety: false,
      sandboxFhirAndDicomPingVerified: false,
      localConsentProtocolsConfigured: false,
    }

    const now = new Date().toISOString()
    const readinessScore = this.calculateReadinessScore(initialChecklist)

    return {
      id: `onboard-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      facilityId: input.facilityId,
      facilityName: input.facilityName,
      dghsFacilityCode: normalizedCode,
      division: input.division,
      district: input.district,
      upazila: input.upazila,
      facilityTier: input.facilityTier,
      onboardingStatus: 'draft',
      readinessScore,
      checklistItems: initialChecklist,
      primaryAdminUserId: input.primaryAdminUserId || null,
      primaryAdminName: input.primaryAdminName,
      createdAt: now,
      updatedAt: now,
    }
  }

  /**
   * Updates checklist items and recalculates facility readiness score
   */
  public static updateChecklist(
    record: FacilityOnboardingRecord,
    updates: Partial<OnboardingChecklistItems>
  ): FacilityOnboardingRecord {
    const updatedChecklist = { ...record.checklistItems, ...updates }
    const readinessScore = this.calculateReadinessScore(updatedChecklist)

    let newStatus = record.onboardingStatus
    if (readinessScore >= 50 && record.onboardingStatus === 'draft') {
      newStatus = 'pending_verification'
    }

    return {
      ...record,
      checklistItems: updatedChecklist,
      readinessScore,
      onboardingStatus: newStatus,
      updatedAt: new Date().toISOString(),
    }
  }

  /**
   * Validates and activates a facility for live regional clinical operations
   */
  public static activateFacility(
    record: FacilityOnboardingRecord,
    verifierUserId: string
  ): FacilityOnboardingRecord {
    if (record.readinessScore < 75) {
      throw new Error(
        `Activation Blocked: Readiness score (${record.readinessScore}%) must be at least 75% before activating clinical operations`
      )
    }

    if (!record.checklistItems.dghsRegistryCodeVerified) {
      throw new Error('Activation Blocked: DGHS official registry code verification is mandatory')
    }

    const now = new Date().toISOString()
    return {
      ...record,
      onboardingStatus: 'active',
      verifiedByUserId: verifierUserId,
      verifiedAt: now,
      activatedAt: now,
      updatedAt: now,
    }
  }

  /**
   * Suspends a facility temporarily for operational or audit reasons
   */
  public static suspendFacility(record: FacilityOnboardingRecord, reason: string): FacilityOnboardingRecord {
    return {
      ...record,
      onboardingStatus: 'suspended',
      suspensionReason: reason,
      updatedAt: new Date().toISOString(),
    }
  }
}

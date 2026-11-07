import { describe, it, expect } from 'vitest'
import {
  // Services
  FacilityOnboardingService,
  HealthcareNetworkService,
  CentralizedMonitoringService,
  RolloutManagementService,
  RegionalExpansionService,
  defaultRegionalExpansionService,
  REQUIRED_NETWORK_SHARING_CONSENT_CODE,
  NATIONWIDE_SUBSYSTEMS,
  // Types
  type FacilityOnboardingRecord,
  type OnboardingChecklistItems,
  type CrossFacilityAccessRequest,
  // Server Actions
  registerFacilityOnboardingAction,
  updateFacilityChecklistAction,
  activateFacilityAction,
  getRegionalNetworksAction,
  authorizeCrossFacilityAccessAction,
  checkSubsystemHealthAction,
  getRolloutMilestonesAction,
  evaluateExpansionReadinessAction,
} from '@/modules/expansion'

describe('Phase 2.11: Regional & Nationwide Expansion Suite', () => {
  // ============================================================================
  // 1. Regional Facility Onboarding Service
  // ============================================================================
  describe('Regional Facility Onboarding Service', () => {
    it('initiates onboarding record with draft status and base readiness score', () => {
      const record = FacilityOnboardingService.initiateOnboarding({
        facilityId: 'fac-test-uhc-01',
        facilityName: 'Sreepur Upazila Health Complex',
        dghsFacilityCode: 'DGHS-UHC-10099',
        division: 'Dhaka',
        district: 'Gazipur',
        upazila: 'Sreepur',
        facilityTier: 'upazila_health_complex',
      })

      expect(record.id).toMatch(/^onboard-/)
      expect(record.facilityName).toBe('Sreepur Upazila Health Complex')
      expect(record.dghsFacilityCode).toBe('DGHS-UHC-10099')
      expect(record.onboardingStatus).toBe('draft')
      expect(record.readinessScore).toBe(13) // dghsRegistryCodeVerified = true by default (1/8 ≈ 13%)
      expect(record.checklistItems.physicalInfrastructureVerified).toBe(false)
      expect(record.checklistItems.dghsRegistryCodeVerified).toBe(true)
    })

    it('calculates readiness score accurately across checklist items (12.5% each)', () => {
      const itemsAllFalse: OnboardingChecklistItems = {
        physicalInfrastructureVerified: false,
        powerAndInternetRedundancyVerified: false,
        dghsRegistryCodeVerified: false,
        administratorsAssigned: false,
        chwAndClinicianAccountsProvisioned: false,
        staffTrainedOnClinicalSafety: false,
        sandboxFhirAndDicomPingVerified: false,
        localConsentProtocolsConfigured: false,
      }
      expect(FacilityOnboardingService.calculateReadinessScore(itemsAllFalse)).toBe(0)

      const itemsHalfTrue: OnboardingChecklistItems = {
        ...itemsAllFalse,
        physicalInfrastructureVerified: true,
        powerAndInternetRedundancyVerified: true,
        dghsRegistryCodeVerified: true,
        administratorsAssigned: true,
      }
      expect(FacilityOnboardingService.calculateReadinessScore(itemsHalfTrue)).toBe(50)

      const itemsAllTrue: OnboardingChecklistItems = {
        physicalInfrastructureVerified: true,
        powerAndInternetRedundancyVerified: true,
        dghsRegistryCodeVerified: true,
        administratorsAssigned: true,
        chwAndClinicianAccountsProvisioned: true,
        staffTrainedOnClinicalSafety: true,
        sandboxFhirAndDicomPingVerified: true,
        localConsentProtocolsConfigured: true,
      }
      expect(FacilityOnboardingService.calculateReadinessScore(itemsAllTrue)).toBe(100)
    })

    it('prevents duplicate DGHS facility code registrations', () => {
      const code = 'DGHS-UHC-DUPLICATE-TEST'
      FacilityOnboardingService.initiateOnboarding({
        facilityId: 'fac-dup-01',
        facilityName: 'First Registration',
        dghsFacilityCode: code,
        division: 'Dhaka',
        district: 'Gazipur',
        upazila: 'Kapasia',
        facilityTier: 'upazila_health_complex',
      })

      expect(() => {
        FacilityOnboardingService.initiateOnboarding({
          facilityId: 'fac-dup-02',
          facilityName: 'Second Duplicate Registration',
          dghsFacilityCode: code,
          division: 'Dhaka',
          district: 'Gazipur',
          upazila: 'Kapasia',
          facilityTier: 'upazila_health_complex',
        })
      }).toThrow(/already registered/)
    })

    it('promotes draft facility to pending_verification when score reaches >= 50%', () => {
      const initial = FacilityOnboardingService.initiateOnboarding({
        facilityId: 'fac-test-02',
        facilityName: 'Kapasia Upazila Health Complex',
        dghsFacilityCode: 'DGHS-UHC-PROMO-10088',
        division: 'Dhaka',
        district: 'Gazipur',
        upazila: 'Kapasia',
        facilityTier: 'upazila_health_complex',
      })
      expect(initial.onboardingStatus).toBe('draft')

      const updated = FacilityOnboardingService.updateChecklist(initial, {
        physicalInfrastructureVerified: true,
        powerAndInternetRedundancyVerified: true,
        dghsRegistryCodeVerified: true,
        administratorsAssigned: true,
      })

      expect(updated.readinessScore).toBe(50)
      expect(updated.onboardingStatus).toBe('pending_verification')
    })

    it('enforces activation gate (requires verified status AND readiness score >= 75%)', () => {
      const record = FacilityOnboardingService.initiateOnboarding({
        facilityId: 'fac-test-05',
        facilityName: 'Manikganj 250 Bed District Hospital',
        dghsFacilityCode: 'DGHS-DH-30044',
        division: 'Dhaka',
        district: 'Manikganj',
        upazila: 'Sadar',
        facilityTier: 'district_hospital',
      })

      // Attempt activation with initial low score
      expect(() => {
        FacilityOnboardingService.activateFacility(record, 'verifier-01')
      }).toThrow(/Readiness score \(.*\) must be at least 75%/)

      // Update to 75% score (6 checklist items)
      const readyChecklist = FacilityOnboardingService.updateChecklist(record, {
        physicalInfrastructureVerified: true,
        powerAndInternetRedundancyVerified: true,
        dghsRegistryCodeVerified: true,
        administratorsAssigned: true,
        chwAndClinicianAccountsProvisioned: true,
        staffTrainedOnClinicalSafety: true,
      })
      expect(readyChecklist.readinessScore).toBe(75)

      const activated = FacilityOnboardingService.activateFacility(readyChecklist, 'verifier-01')
      expect(activated.onboardingStatus).toBe('active')
      expect(activated.verifiedByUserId).toBe('verifier-01')
      expect(activated.activatedAt).toBeTruthy()
    })

    it('suspends an active facility with suspension reason recorded', () => {
      const initial = FacilityOnboardingService.initiateOnboarding({
        facilityId: 'fac-test-suspend',
        facilityName: 'Feni District Hospital',
        dghsFacilityCode: 'DGHS-DH-FENI-101',
        division: 'Chattogram',
        district: 'Feni',
        upazila: 'Sadar',
        facilityTier: 'district_hospital',
      })

      const suspended = FacilityOnboardingService.suspendFacility(
        initial,
        'Scheduled security infrastructure maintenance and firewall upgrade'
      )

      expect(suspended.onboardingStatus).toBe('suspended')
      expect(suspended.suspensionReason).toContain('firewall upgrade')
    })
  })

  // ============================================================================
  // 2. Healthcare Network Integration Service
  // ============================================================================
  describe('Healthcare Network Integration Service', () => {
    it('retrieves preconfigured regional hub-and-spoke networks across Bangladesh', () => {
      const networks = HealthcareNetworkService.getNetworks()
      expect(networks.length).toBeGreaterThanOrEqual(3)

      const dhakaNet = networks.find(n => n.networkCode === 'dhaka-central-oncology-network')
      expect(dhakaNet).toBeDefined()
      expect(dhakaNet?.leadHubFacilityId).toBe('fac-nicrh-dhaka')
      expect(dhakaNet?.coverageDistricts).toContain('Dhaka')
      expect(dhakaNet?.coverageDistricts).toContain('Gazipur')

      const ctgNet = networks.find(n => n.networkCode === 'chattogram-respiratory-consortium')
      expect(ctgNet).toBeDefined()
      expect(ctgNet?.division).toBe('Chattogram')
      expect(ctgNet?.leadHubFacilityName).toContain('CMCH')

      const rajNet = networks.find(n => n.networkCode === 'rajshahi-northern-chest-network')
      expect(rajNet).toBeDefined()
      expect(rajNet?.leadHubFacilityName).toContain('RMCH')
    })

    it('authorizes cross-facility patient access only when consent code matches CONSENT-NETWORK-SHARING-2026', () => {
      const validReq: CrossFacilityAccessRequest = {
        requestingFacilityId: 'fac-nicrh-dhaka',
        originatingFacilityId: 'fac-gazipur-sadar',
        patientId: 'pat-dhaka-2026-9001',
        accessorUserId: 'usr-oncologist-12',
        accessorRole: 'senior_thoracic_oncologist',
        accessPurpose: 'referral_consultation',
        consentCode: REQUIRED_NETWORK_SHARING_CONSENT_CODE,
      }

      const validResult = HealthcareNetworkService.authorizeCrossFacilityAccess(validReq)
      expect(validResult.isAuthorized).toBe(true)
      expect(validResult.rejectionReason).toBeUndefined()
      expect(validResult.log.isAuthorized).toBe(true)
      expect(validResult.log.patientId).toBe('pat-dhaka-2026-9001')
      expect(validResult.log.requestingFacilityId).toBe('fac-nicrh-dhaka')
    })

    it('denies cross-facility access and logs security incident when consent code is invalid or missing', () => {
      const invalidReq: CrossFacilityAccessRequest = {
        requestingFacilityId: 'fac-nicrh-dhaka',
        originatingFacilityId: 'fac-gazipur-sadar',
        patientId: 'pat-dhaka-2026-9001',
        accessorUserId: 'usr-oncologist-12',
        accessorRole: 'senior_thoracic_oncologist',
        accessPurpose: 'referral_consultation',
        consentCode: 'EXPIRED-CONSENT-2025',
      }

      const result = HealthcareNetworkService.authorizeCrossFacilityAccess(invalidReq)
      expect(result.isAuthorized).toBe(false)
      expect(result.rejectionReason).toContain('Missing mandatory patient consent')
      expect(result.log.isAuthorized).toBe(false)
      expect(result.log.consentCodeVerified).toBe('EXPIRED-CONSENT-2025')
    })

    it('resolves hierarchical referral pathway from primary intake spoke to specialized hub', () => {
      const spokeToDistrict = HealthcareNetworkService.resolveReferralPathway(
        'primary_intake_spoke',
        'specialty_referral_center'
      )
      expect(spokeToDistrict.isValidPathway).toBe(true)
      expect(spokeToDistrict.pathwayDescription).toContain('Standard Secondary Escalation')

      const districtToHub = HealthcareNetworkService.resolveReferralPathway(
        'specialty_referral_center',
        'hub_lead'
      )
      expect(districtToHub.isValidPathway).toBe(true)
      expect(districtToHub.pathwayDescription).toContain('Tertiary Specialist Referral')

      const clinicToHub = HealthcareNetworkService.resolveReferralPathway(
        'community_clinic_node',
        'hub_lead'
      )
      expect(clinicToHub.isValidPathway).toBe(true)
      expect(clinicToHub.pathwayDescription).toContain('Expedited Direct Hub Escalation')
    })
  })

  // ============================================================================
  // 3. Centralized Monitoring Service & Zero-PHI Invariant
  // ============================================================================
  describe('Centralized Monitoring Service & Zero-PHI Invariant', () => {
    it('probes all 7 subsystems and returns latency within operational SLAs', async () => {
      const probeResult = await CentralizedMonitoringService.checkSubsystemHealth()
      expect(probeResult.subsystems.length).toBe(7)
      expect(probeResult.nationwideStatus).toMatch(/healthy|degraded/)

      for (const expected of NATIONWIDE_SUBSYSTEMS) {
        const found = probeResult.subsystems.find(s => s.subsystem === expected.subsystem)
        expect(found).toBeDefined()
        expect(found?.status).toMatch(/healthy|degraded/)
        expect(found?.latencyMs).toBeGreaterThan(0)
        expect(found?.latencyMs).toBeLessThan(1000)
        expect(found?.lastCheckedAt).toBeTruthy()
      }
    })

    it('enforces strict Zero-PHI Invariant: rejects logs with unmasked Bangladesh phone numbers', () => {
      const dirtyLog1 = 'Error connecting clinician phone: +8801712345678 during referral alert'
      const check1 = CentralizedMonitoringService.verifyZeroPhiInvariant(dirtyLog1)
      expect(check1.isCompliant).toBe(false)
      expect(check1.flaggedPattern).toBe('DETECTED_UNMASKED_PHONE_NUMBER')

      const dirtyLog2 = 'SMS delivery failed to 01812345678'
      const check2 = CentralizedMonitoringService.verifyZeroPhiInvariant(dirtyLog2)
      expect(check2.isCompliant).toBe(false)
      expect(check2.flaggedPattern).toBe('DETECTED_UNMASKED_PHONE_NUMBER')
    })

    it('enforces strict Zero-PHI Invariant: rejects logs with unmasked National ID sequences', () => {
      const dirtyLogNid10 = 'Record lookup failed for citizen NID 1982345678'
      const check10 = CentralizedMonitoringService.verifyZeroPhiInvariant(dirtyLogNid10)
      expect(check10.isCompliant).toBe(false)
      expect(check10.flaggedPattern).toBe('DETECTED_RAW_NATIONAL_ID_DIGITS')

      const dirtyLogNid17 = 'Patient NID string 19851234567890123 logged by worker'
      const check17 = CentralizedMonitoringService.verifyZeroPhiInvariant(dirtyLogNid17)
      expect(check17.isCompliant).toBe(false)
      expect(check17.flaggedPattern).toBe('DETECTED_RAW_NATIONAL_ID_DIGITS')
    })

    it('permits sanitized operational telemetry logs without PHI', () => {
      const cleanLog = 'Database connection pool acquired 12 connections; DICOM PACS latency 42ms'
      const check = CentralizedMonitoringService.verifyZeroPhiInvariant(cleanLog)
      expect(check.isCompliant).toBe(true)
      expect(check.flaggedPattern).toBeUndefined()
    })

    it('logs incidents only when Zero-PHI check passes, throwing if PHI is detected', () => {
      expect(() => {
        CentralizedMonitoringService.recordIncident({
          subsystem: 'api_gateway',
          regionOrFacility: 'Dhaka',
          healthStatus: 'degraded',
          incidentDescription: 'Error handling patient call: +8801912345678',
        })
      }).toThrow(/Zero-PHI Violation/)

      const cleanIncident = CentralizedMonitoringService.recordIncident({
        subsystem: 'fhir_gateway',
        regionOrFacility: 'fac-nicrh-dhaka',
        healthStatus: 'healthy',
        incidentDescription: 'FHIR Observation resource validation warning: code LOINC 72166-2 mapped successfully',
        latencyMs: 38,
      })

      expect(cleanIncident.id).toMatch(/^inc-/)
      expect(cleanIncident.isResolved).toBe(false)
      expect(cleanIncident.incidentDescription).toContain('LOINC 72166-2')
    })
  })

  // ============================================================================
  // 4. Phased Rollout Management Service
  // ============================================================================
  describe('Phased Rollout Management Service', () => {
    it('retrieves the 8-step phased rollout framework with verification requirements', () => {
      const milestones = RolloutManagementService.getRolloutMilestones()
      expect(milestones.length).toBe(8)

      expect(milestones[0].code).toBe('STEP-01-PILOT-SIGN-OFF')
      expect(milestones[0].isCompleted).toBe(true)

      expect(milestones[1].code).toBe('STEP-02-SITE-SELECTION')
      expect(milestones[1].isCompleted).toBe(true)

      const nationwideMilestone = milestones[7]
      expect(nationwideMilestone.code).toBe('STEP-08-NATIONWIDE-AUTHORIZATION')
      expect(nationwideMilestone.responsibleAuthority).toContain('MOHFW')
    })

    it('evaluates nationwide expansion readiness based on milestone completion and mean facility readiness', () => {
      const facilities: FacilityOnboardingRecord[] = [
        {
          id: 'fac-1',
          facilityId: 'f1',
          facilityName: 'Hospital 1',
          dghsFacilityCode: 'DGHS-1',
          division: 'Dhaka',
          district: 'Dhaka',
          upazila: 'Sadar',
          facilityTier: 'national_specialized',
          onboardingStatus: 'active',
          readinessScore: 88,
          checklistItems: {
            physicalInfrastructureVerified: true,
            powerAndInternetRedundancyVerified: true,
            dghsRegistryCodeVerified: true,
            administratorsAssigned: true,
            chwAndClinicianAccountsProvisioned: true,
            staffTrainedOnClinicalSafety: true,
            sandboxFhirAndDicomPingVerified: true,
            localConsentProtocolsConfigured: false,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]
      const readiness = RolloutManagementService.evaluateExpansionReadiness(facilities)

      expect(readiness.totalMilestonesCount).toBe(8)
      expect(readiness.completedMilestonesCount).toBeGreaterThanOrEqual(4)
      expect(readiness.totalFacilities).toBe(1)
      expect(readiness.meanReadinessScore).toBe(88)
      // Since later milestones are pending in default template, nationwide should not yet be authorized
      expect(readiness.isNationwideRolloutAuthorized).toBe(false)
    })
  })

  // ============================================================================
  // 5. Regional Expansion Service Façade & Default Singleton
  // ============================================================================
  describe('Regional Expansion Service Façade', () => {
    it('exposes cohesive unified API through defaultRegionalExpansionService', async () => {
      const facade = defaultRegionalExpansionService
      expect(facade).toBeInstanceOf(RegionalExpansionService)

      const networks = facade.getNetworks()
      expect(networks.length).toBe(3)

      const health = await facade.getSubsystemHealth()
      expect(health.subsystems.length).toBe(7)

      const milestones = facade.getRolloutMilestones()
      expect(milestones.length).toBe(8)
    })
  })

  // ============================================================================
  // 6. Server Actions
  // ============================================================================
  describe('Regional Expansion Server Actions', () => {
    it('registerFacilityOnboardingAction creates new facility record', async () => {
      const res = await registerFacilityOnboardingAction({
        facilityId: 'fac-action-uhc-01',
        facilityName: 'Action Upazila Health Complex',
        dghsFacilityCode: 'DGHS-UHC-88771',
        division: 'Dhaka',
        district: 'Gazipur',
        upazila: 'Kaliakair',
        facilityTier: 'upazila_health_complex',
      })

      expect(res.success).toBe(true)
      expect(res.data?.facilityName).toBe('Action Upazila Health Complex')
      expect(res.data?.onboardingStatus).toBe('draft')
    })

    it('updateFacilityChecklistAction updates items and activates facility via activateFacilityAction', async () => {
      const reg = await registerFacilityOnboardingAction({
        facilityId: 'fac-action-uhc-02',
        facilityName: 'Activation Test UHC',
        dghsFacilityCode: 'DGHS-UHC-88772',
        division: 'Dhaka',
        district: 'Gazipur',
        upazila: 'Tongi',
        facilityTier: 'upazila_health_complex',
      })
      expect(reg.success).toBe(true)
      const record = reg.data!

      // Update to 100%
      const updateRes = await updateFacilityChecklistAction(record, {
        physicalInfrastructureVerified: true,
        powerAndInternetRedundancyVerified: true,
        dghsRegistryCodeVerified: true,
        administratorsAssigned: true,
        chwAndClinicianAccountsProvisioned: true,
        staffTrainedOnClinicalSafety: true,
        sandboxFhirAndDicomPingVerified: true,
        localConsentProtocolsConfigured: true,
      })
      expect(updateRes.success).toBe(true)
      expect(updateRes.data?.readinessScore).toBe(100)

      // Activate
      const activateRes = await activateFacilityAction(updateRes.data!, 'verifier-admin-dghs')
      expect(activateRes.success).toBe(true)
      expect(activateRes.data?.onboardingStatus).toBe('active')
    })

    it('getRegionalNetworksAction returns all configured regional networks', async () => {
      const res = await getRegionalNetworksAction()
      expect(res.success).toBe(true)
      expect(res.data?.length).toBeGreaterThanOrEqual(3)
    })

    it('authorizeCrossFacilityAccessAction evaluates consent code correctly', async () => {
      const res = await authorizeCrossFacilityAccessAction({
        requestingFacilityId: 'fac-nicrh-dhaka',
        originatingFacilityId: 'fac-gazipur-sadar',
        patientId: 'pat-action-test-01',
        accessorUserId: 'usr-doctor-01',
        accessorRole: 'pulmonologist',
        accessPurpose: 'diagnostic_review',
        consentCode: REQUIRED_NETWORK_SHARING_CONSENT_CODE,
      })

      expect(res.success).toBe(true)
      expect(res.data?.isAuthorized).toBe(true)
    })

    it('checkSubsystemHealthAction runs live health probe on all 7 subsystems', async () => {
      const res = await checkSubsystemHealthAction()
      expect(res.success).toBe(true)
      expect(res.data?.subsystems.length).toBe(7)
    })

    it('getRolloutMilestonesAction returns phased rollout status and nationwide readiness assessment', async () => {
      const res = await getRolloutMilestonesAction()
      expect(res.success).toBe(true)
      expect(res.data?.length).toBe(8)
    })

    it('evaluateExpansionReadinessAction returns overall readiness scorecard', async () => {
      const res = await evaluateExpansionReadinessAction([])
      expect(res.success).toBe(true)
      expect(res.data?.totalMilestonesCount).toBe(8)
    })
  })
})

import { describe, it, expect } from 'vitest'
import {
  // Services
  CountryConfigurationService,
  CountryClinicalGuidelineService,
  CountryRegulatoryPrivacyService,
  InternationalGeographicService,
  InternationalEnvironmentalProviderService,
  CountryOnboardingReadinessService,
  InternationalExpansionService,
  defaultInternationalExpansionService,
  DEFAULT_12_STEP_ROLLOUT_FRAMEWORK,
  // Server Actions
  getAllCountriesAction,
  getCountryAction,
  evaluateClinicalExecutionAction,
  evaluateCrossBorderTransferAction,
  getGeographicNodesAction,
  getReadinessScorecardAction,
} from '@/modules/international'

describe('Phase 2.12: International Expansion Suite', () => {
  // ============================================================================
  // 1. Centralized Multi-Country Configuration Service
  // ============================================================================
  describe('Country Configuration Service', () => {
    it('retrieves default active country (Bangladesh) with complete profile metadata', () => {
      const defaultCountry = CountryConfigurationService.getDefaultCountry()
      expect(defaultCountry.countryCode).toBe('BD')
      expect(defaultCountry.isoAlpha3).toBe('BGD')
      expect(defaultCountry.numericCode).toBe('050')
      expect(defaultCountry.nameEn).toBe('Bangladesh')
      expect(defaultCountry.nameNative).toBe('বাংলাদেশ')
      expect(defaultCountry.defaultLocale).toBe('bn')
      expect(defaultCountry.measurementSystem).toBe('metric')
      expect(defaultCountry.currencyCode).toBe('BDT')
      expect(defaultCountry.currencySymbol).toBe('৳')
      expect(defaultCountry.isDefault).toBe(true)
      expect(defaultCountry.status).toBe('active')
      expect(defaultCountry.clinicalExecutionEnabled).toBe(true)
    })

    it('retrieves country by ISO alpha-2 or alpha-3 code case-insensitively', () => {
      const byAlpha2 = CountryConfigurationService.getCountryByCode('my')
      expect(byAlpha2).toBeDefined()
      expect(byAlpha2?.countryCode).toBe('MY')
      expect(byAlpha2?.isoAlpha3).toBe('MYS')
      expect(byAlpha2?.status).toBe('synthetic_example')

      const byAlpha3 = CountryConfigurationService.getCountryByCode('BGD')
      expect(byAlpha3).toBeDefined()
      expect(byAlpha3?.countryCode).toBe('BD')
    })

    it('validates ISO 3166-1 alpha-2 and alpha-3 formats accurately', () => {
      expect(CountryConfigurationService.isValidIsoAlpha2('BD')).toBe(true)
      expect(CountryConfigurationService.isValidIsoAlpha2('my')).toBe(true)
      expect(CountryConfigurationService.isValidIsoAlpha2('BGD')).toBe(false)
      expect(CountryConfigurationService.isValidIsoAlpha2('12')).toBe(false)

      expect(CountryConfigurationService.isValidIsoAlpha3('BGD')).toBe(true)
      expect(CountryConfigurationService.isValidIsoAlpha3('mys')).toBe(true)
      expect(CountryConfigurationService.isValidIsoAlpha3('BD')).toBe(false)
      expect(CountryConfigurationService.isValidIsoAlpha3('1234')).toBe(false)
    })

    it('formats currency according to sovereign country configuration', () => {
      const bdAmount = CountryConfigurationService.formatCurrency(1500.5, 'BD')
      expect(bdAmount).toContain('৳')
      expect(bdAmount).toContain('1,500.50')

      const myAmount = CountryConfigurationService.formatCurrency(250.75, 'MY')
      expect(myAmount).toContain('RM')
      expect(myAmount).toContain('250.75')
    })

    it('formats measurement units according to sovereign metric or imperial systems', () => {
      const metricDist = CountryConfigurationService.formatMeasurement(12.4, 'distance', 'BD')
      expect(metricDist).toBe('12.4 km')

      const metricWeight = CountryConfigurationService.formatMeasurement(65.0, 'weight', 'BD')
      expect(metricWeight).toBe('65.0 kg')
    })

    it('enforces safety invariant: blocks activating country without approved clinical guidelines', () => {
      // Malaysia has clinicalExecutionEnabled: false in its preconfigured profile
      expect(() => {
        CountryConfigurationService.setCountryStatus('MY', 'active')
      }).toThrow(/Activation Blocked: Country .* cannot be activated without approved clinical guidelines/)
    })
  })

  // ============================================================================
  // 2. Country-Specific Clinical Guideline Governance Service
  // ============================================================================
  describe('Country-Specific Clinical Guideline Governance Service', () => {
    it('retrieves registered clinical guidelines for Bangladesh with approved status', () => {
      const guidelines = CountryClinicalGuidelineService.getGuidelinesForCountry('BD')
      expect(guidelines.length).toBeGreaterThanOrEqual(1)

      const bdGuideline = guidelines[0]
      expect(bdGuideline.guidelineKey).toBe('guideline-bd-nicrh-2026')
      expect(bdGuideline.approvalStatus).toBe('approved')
      expect(bdGuideline.sourceOrganization).toContain('NICRH')
      expect(bdGuideline.approvedByBoardReference).toBe('CAB-BD-ONC-2026-04')
      expect(bdGuideline.riskEstimationModelAllowed).toBe(true)
    })

    it('permits clinical execution for countries with active CAB-approved guidelines (Bangladesh)', () => {
      const evaluation = CountryClinicalGuidelineService.evaluateClinicalExecutionStatus('BD')
      expect(evaluation.isExecutionAllowed).toBe(true)
      expect(evaluation.activeGuideline?.guidelineKey).toBe('guideline-bd-nicrh-2026')
      expect(evaluation.warningMessage).toBeUndefined()
    })

    it('blocks clinical execution for countries with pending or unapproved guidelines (Malaysia)', () => {
      const evaluation = CountryClinicalGuidelineService.evaluateClinicalExecutionStatus('MY')
      expect(evaluation.isExecutionAllowed).toBe(false)
      expect(evaluation.warningMessage).toContain('Clinical Execution Blocked')
      expect(evaluation.warningMessage).toContain('does not have Clinical Advisory Board approved guidelines')
    })

    it('allows Clinical Advisory Board to approve a pending guideline, unlocking execution', () => {
      const updated = CountryClinicalGuidelineService.approveGuideline(
        'guideline-my-cpg-lung-2024-synthetic',
        'CAB-MOH-MY-2026-01'
      )

      expect(updated.approvalStatus).toBe('approved')
      expect(updated.approvedByBoardReference).toBe('CAB-MOH-MY-2026-01')
      expect(updated.riskEstimationModelAllowed).toBe(true)

      // Now execution evaluation should succeed
      const reEvaluation = CountryClinicalGuidelineService.evaluateClinicalExecutionStatus('MY')
      expect(reEvaluation.isExecutionAllowed).toBe(true)
      expect(reEvaluation.activeGuideline?.approvedByBoardReference).toBe('CAB-MOH-MY-2026-01')
    })
  })

  // ============================================================================
  // 3. Country-Specific Regulatory & Privacy Governance Service
  // ============================================================================
  describe('Country-Specific Regulatory & Privacy Governance Service', () => {
    it('retrieves jurisdiction privacy profiles with verified and pending statuses', () => {
      const bdProfile = CountryRegulatoryPrivacyService.getPrivacyProfile('BD')
      expect(bdProfile).toBeDefined()
      expect(bdProfile?.legalVerificationStatus).toBe('verified')
      expect(bdProfile?.consentModel).toBe('explicit_opt_in')
      expect(bdProfile?.patientDataRetentionYears).toBe(10)

      const myProfile = CountryRegulatoryPrivacyService.getPrivacyProfile('MY')
      expect(myProfile).toBeDefined()
      expect(myProfile?.legalVerificationStatus).toBe('pending_legal_review')
    })

    it('authorizes domestic in-country health data access without cross-border restrictions', () => {
      const domestic = CountryRegulatoryPrivacyService.evaluateCrossBorderTransfer({
        requestingCountry: 'BD',
        patientOriginCountry: 'BD',
        patientId: 'pat-bd-1001',
        accessorUserId: 'usr-clinician-01',
        accessorRole: 'senior_thoracic_oncologist',
        jurisdictionLegalBasis: 'Domestic Hospital Admission & Care Protocol',
        explicitPatientConsentGiven: true,
      })

      expect(domestic.isPermitted).toBe(true)
      expect(domestic.legalBasis).toContain('Domestic jurisdiction access')
      expect(domestic.auditLogId).toBeTruthy()
    })

    it('blocks cross-border transfer when prohibited by sovereign data protection act', () => {
      const transfer = CountryRegulatoryPrivacyService.evaluateCrossBorderTransfer({
        requestingCountry: 'GB',
        patientOriginCountry: 'BD',
        patientId: 'pat-bd-1002',
        accessorUserId: 'usr-uk-consultant-01',
        accessorRole: 'visiting_specialist',
        jurisdictionLegalBasis: 'International Clinical Consultation',
        explicitPatientConsentGiven: true,
      })

      expect(transfer.isPermitted).toBe(false)
      expect(transfer.restrictionReason).toContain('Cross-border patient record export is prohibited')
      expect(transfer.auditLogId).toBeTruthy()
    })

    it('blocks cross-border transfer if explicit patient consent is missing', () => {
      // Temporarily mock permission on origin profile
      const myProfile = CountryRegulatoryPrivacyService.getPrivacyProfile('MY')!
      myProfile.crossBorderTransferAllowed = true

      const transferNoConsent = CountryRegulatoryPrivacyService.evaluateCrossBorderTransfer({
        requestingCountry: 'BD',
        patientOriginCountry: 'MY',
        patientId: 'pat-my-2001',
        accessorUserId: 'usr-bd-specialist-01',
        accessorRole: 'pulmonologist',
        jurisdictionLegalBasis: 'Cross-Border Referral',
        explicitPatientConsentGiven: false,
      })

      expect(transferNoConsent.isPermitted).toBe(false)
      expect(transferNoConsent.restrictionReason).toContain('Patient has not granted explicit informed consent')

      // Reset
      myProfile.crossBorderTransferAllowed = false
    })
  })

  // ============================================================================
  // 4. Generalized Geographic Administrative Hierarchy Service
  // ============================================================================
  describe('Generalized Geographic Administrative Hierarchy Service', () => {
    it('retrieves geographic administrative nodes by country code and administrative level', () => {
      const bdNodes = InternationalGeographicService.getNodesForCountry('BD')
      expect(bdNodes.length).toBeGreaterThanOrEqual(3)

      const bdLevel1 = InternationalGeographicService.getNodesByLevel('BD', 1)
      expect(bdLevel1.length).toBeGreaterThanOrEqual(1)
      expect(bdLevel1[0].nameEn).toContain('Dhaka Division')

      const bdLevel2 = InternationalGeographicService.getNodesByLevel('BD', 2)
      expect(bdLevel2[0].nameEn).toContain('Gazipur District')

      const bdLevel3 = InternationalGeographicService.getNodesByLevel('BD', 3)
      expect(bdLevel3[0].nameEn).toContain('Sreepur Upazila')
    })

    it('supports child administrative node resolution across multi-tier hierarchy', () => {
      const gazipurChildren = InternationalGeographicService.getChildNodes('BD-DIST-GAZIPUR')
      expect(gazipurChildren.length).toBeGreaterThanOrEqual(1)
      expect(gazipurChildren[0].nodeCode).toBe('BD-UPZ-SREEPUR')
      expect(gazipurChildren[0].level).toBe(3)
    })

    it('supports international administrative structures (e.g. State -> District -> Municipality)', () => {
      const myNodes = InternationalGeographicService.getNodesForCountry('MY')
      expect(myNodes.length).toBe(3)

      const stateNode = myNodes.find(n => n.level === 1)
      expect(stateNode?.nameEn).toBe('Selangor State')
      expect(stateNode?.nameNative).toBe('Negeri Selangor')

      const districtNode = myNodes.find(n => n.level === 2)
      expect(districtNode?.nameEn).toBe('Petaling District')

      const municipalNode = myNodes.find(n => n.level === 3)
      expect(municipalNode?.nameEn).toBe('Shah Alam City Council')
    })
  })

  // ============================================================================
  // 5. International Environmental Data Provider Service
  // ============================================================================
  describe('International Environmental Data Provider Service', () => {
    it('resolves primary environmental provider dynamically based on country code', () => {
      expect(InternationalEnvironmentalProviderService.resolveProviderForCountry('BD')).toBe('open_meteo')
      expect(InternationalEnvironmentalProviderService.resolveProviderForCountry('MY')).toBe('open_meteo')
      expect(InternationalEnvironmentalProviderService.resolveProviderForCountry('US')).toBe('epa_airnow')
      expect(InternationalEnvironmentalProviderService.resolveProviderForCountry('FR')).toBe('copernicus_cams')
      expect(InternationalEnvironmentalProviderService.resolveProviderForCountry('DE')).toBe('copernicus_cams')
    })

    it('normalizes environmental observations and calculates US EPA AQI break-points accurately', () => {
      const obsGood = InternationalEnvironmentalProviderService.normalizeEnvironmentalData({
        countryCode: 'BD',
        provider: 'open_meteo',
        rawPm25: 10.0,
      })
      expect(obsGood.pm25).toBe(10.0)
      expect(obsGood.aqi).toBeLessThanOrEqual(50)
      expect(obsGood.dataSourceType).toBe('measured')

      const obsUnhealthy = InternationalEnvironmentalProviderService.normalizeEnvironmentalData({
        countryCode: 'BD',
        provider: 'open_meteo',
        rawPm25: 85.4,
        isSatelliteOrModelled: true,
      })
      expect(obsUnhealthy.pm25).toBe(85.4)
      expect(obsUnhealthy.aqi).toBeGreaterThanOrEqual(150)
      expect(obsUnhealthy.dataSourceType).toBe('satellite_derived')
    })
  })

  // ============================================================================
  // 6. Country Onboarding & 12-Step Readiness Management Service
  // ============================================================================
  describe('Country Onboarding & 12-Step Readiness Management Service', () => {
    it('retrieves the 12-step phased international rollout framework', () => {
      expect(DEFAULT_12_STEP_ROLLOUT_FRAMEWORK.length).toBe(12)
      expect(DEFAULT_12_STEP_ROLLOUT_FRAMEWORK[0].stepName).toContain('Target Country Selection')
      expect(DEFAULT_12_STEP_ROLLOUT_FRAMEWORK[11].stepName).toContain('Formal Ministry/Health Authority Launch')
    })

    it('evaluates readiness scorecard for Bangladesh (100% complete, fully authorized)', () => {
      const bdScorecard = CountryOnboardingReadinessService.evaluateReadinessScorecard('BD', 'Bangladesh')
      expect(bdScorecard.totalSteps).toBe(12)
      expect(bdScorecard.completedSteps).toBe(12)
      expect(bdScorecard.readinessScorePct).toBe(100)
      expect(bdScorecard.isDeploymentAuthorized).toBe(true)
      expect(bdScorecard.unfulfilledPrerequisites.length).toBe(0)
      expect(bdScorecard.categoryScores.governance.scorePct).toBe(100)
      expect(bdScorecard.categoryScores.clinical.scorePct).toBe(100)
    })

    it('evaluates readiness scorecard for synthetic example (incomplete, deployment blocked)', () => {
      const myScorecard = CountryOnboardingReadinessService.evaluateReadinessScorecard('MY', 'Malaysia')
      expect(myScorecard.totalSteps).toBe(12)
      expect(myScorecard.completedSteps).toBe(4)
      expect(myScorecard.readinessScorePct).toBe(33)
      expect(myScorecard.isDeploymentAuthorized).toBe(false)
      expect(myScorecard.unfulfilledPrerequisites.length).toBe(8)
      expect(myScorecard.unfulfilledPrerequisites.some(p => p.includes('Clinical Advisory Board'))).toBe(true)
    })
  })

  // ============================================================================
  // 7. International Expansion Service Façade & Singleton
  // ============================================================================
  describe('International Expansion Service Façade', () => {
    it('exposes cohesive unified API through defaultInternationalExpansionService', () => {
      const facade = defaultInternationalExpansionService
      expect(facade).toBeInstanceOf(InternationalExpansionService)

      const countries = facade.getAllCountries()
      expect(countries.length).toBeGreaterThanOrEqual(2)

      const defaultCountry = facade.getDefaultCountry()
      expect(defaultCountry.countryCode).toBe('BD')

      const guidelines = facade.getClinicalGuidelines('BD')
      expect(guidelines.length).toBeGreaterThanOrEqual(1)

      const privacy = facade.getPrivacyProfile('BD')
      expect(privacy).toBeDefined()

      const nodes = facade.getGeographicNodes('BD')
      expect(nodes.length).toBeGreaterThanOrEqual(3)

      const provider = facade.resolveEnvironmentalProvider('BD')
      expect(provider).toBe('open_meteo')

      const scorecard = facade.evaluateReadinessScorecard('BD', 'Bangladesh')
      expect(scorecard.readinessScorePct).toBe(100)
    })
  })

  // ============================================================================
  // 8. Server Actions
  // ============================================================================
  describe('International Expansion Server Actions', () => {
    it('getAllCountriesAction returns list of registered countries', async () => {
      const res = await getAllCountriesAction()
      expect(res.success).toBe(true)
      expect(res.data?.length).toBeGreaterThanOrEqual(2)
    })

    it('getCountryAction returns country profile for valid country code', async () => {
      const res = await getCountryAction('BD')
      expect(res.success).toBe(true)
      expect(res.data?.nameEn).toBe('Bangladesh')
    })

    it('evaluateClinicalExecutionAction accurately determines execution authorization', async () => {
      const bdRes = await evaluateClinicalExecutionAction('BD')
      expect(bdRes.success).toBe(true)
      expect(bdRes.data?.isExecutionAllowed).toBe(true)
    })

    it('evaluateCrossBorderTransferAction enforces cross-border transfer rules', async () => {
      const domesticRes = await evaluateCrossBorderTransferAction({
        requestingCountry: 'BD',
        patientOriginCountry: 'BD',
        patientId: 'pat-action-01',
        accessorUserId: 'usr-clinician-01',
        accessorRole: 'pulmonologist',
        jurisdictionLegalBasis: 'Domestic Protocol',
        explicitPatientConsentGiven: true,
      })

      expect(domesticRes.success).toBe(true)
      expect(domesticRes.data?.isPermitted).toBe(true)
    })

    it('getGeographicNodesAction returns geographic nodes for requested country', async () => {
      const res = await getGeographicNodesAction('BD', 1)
      expect(res.success).toBe(true)
      expect(res.data?.length).toBeGreaterThanOrEqual(1)
      expect(res.data?.[0].level).toBe(1)
    })

    it('getReadinessScorecardAction evaluates 12-step readiness scorecard', async () => {
      const res = await getReadinessScorecardAction('BD')
      expect(res.success).toBe(true)
      expect(res.data?.totalSteps).toBe(12)
      expect(res.data?.readinessScorePct).toBe(100)
    })
  })
})

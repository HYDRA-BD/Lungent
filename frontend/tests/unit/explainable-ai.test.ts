import { describe, it, expect, beforeEach } from 'vitest'
import { ClinicalGovernanceService } from '@/modules/governance/service'
import { ModelXAIProfile } from '@/modules/governance/types'

describe('Phase 2.4: Explainable AI (XAI) Framework', () => {
  beforeEach(() => {
    ClinicalGovernanceService.resetForTesting()
  })

  describe('1. Model Explainability Registry & Retrieval', () => {
    it('returns all registered XAI profiles across evaluated models', async () => {
      const profiles = await ClinicalGovernanceService.getModelXAIProfiles()
      expect(profiles).toBeDefined()
      expect(profiles.length).toBeGreaterThanOrEqual(3)

      const exp01 = profiles.find((p) => p.modelId === 'exp01-copd-phenotype')
      const exp02 = profiles.find((p) => p.modelId === 'exp02-screening-non-adherence')
      const direct = profiles.find((p) => p.modelId === 'direct-lung-cancer-diagnosis')

      expect(exp01).toBeDefined()
      expect(exp02).toBeDefined()
      expect(direct).toBeDefined()
    })

    it('retrieves EXP-01 COPD XAI profile with linear odds ratios and SHAP attributions', async () => {
      const profile = await ClinicalGovernanceService.getModelXAIProfileByModelId('exp01-copd-phenotype')
      expect(profile).not.toBeNull()
      expect(profile?.modelName).toContain('COPD Phenotype')
      expect(profile?.supportedExplainerTypes).toContain('LinearExplainer')

      // Non-causal disclaimer in both languages
      expect(profile?.nonCausalDisclaimerEn).toContain('DO NOT imply biological causation')
      expect(profile?.nonCausalDisclaimerBn).toContain('জৈবিক কারণ নির্দেশ করে না')

      // Global Feature Importance
      expect(profile?.globalFeatureImportance.length).toBeGreaterThanOrEqual(5)
      const topFeature = profile?.globalFeatureImportance[0]
      expect(topFeature?.labelEn).toBeDefined()
      expect(topFeature?.labelBn).toBeDefined()
      expect(topFeature?.oddsRatio).toBeGreaterThan(1.0)

      // Local Explanations
      expect(profile?.localProfileExplanations.length).toBeGreaterThanOrEqual(2)
      const heavySmoker = profile?.localProfileExplanations.find((p) => p.profileId === 'profile-a-heavy-smoker')
      expect(heavySmoker).toBeDefined()
      expect(heavySmoker?.predictedProbability).toBeGreaterThan(0.90)
      expect(heavySmoker?.topContributions.length).toBeGreaterThan(0)

      // Uncertainty & OOD
      expect(heavySmoker?.uncertainty).toBeDefined()
      expect(heavySmoker?.uncertainty.confidenceTier).toBe('high')
      expect(heavySmoker?.uncertainty.predictionInterval95.length).toBe(2)
      expect(heavySmoker?.uncertainty.unmeasuredContextWarning).toContain('biomass')
    })

    it('retrieves EXP-02 screening non-adherence profile with TreeExplainer Gini attributions', async () => {
      const profile = await ClinicalGovernanceService.getModelXAIProfileByModelId('exp02-screening-non-adherence')
      expect(profile).not.toBeNull()
      expect(profile?.supportedExplainerTypes).toContain('TreeExplainer')
      expect(profile?.baselineProbability).toBeCloseTo(0.90, 1)

      const barrierFeature = profile?.globalFeatureImportance.find((f) => f.feature.includes('personal_doctor'))
      expect(barrierFeature).toBeDefined()
      expect(barrierFeature?.labelEn).toContain('Primary Care Doctor')
      expect(barrierFeature?.labelBn).toContain('চিকিৎসক')

      expect(profile?.governanceNotice).toContain('REJECTED_FOR_BANGLADESH_CLINICAL_USE')
    })

    it('confirms XAI rejection dossier for unsupported direct lung cancer target', async () => {
      const profile = await ClinicalGovernanceService.getModelXAIProfileByModelId('direct-lung-cancer-diagnosis')
      expect(profile).not.toBeNull()
      expect(profile?.supportedExplainerTypes).toContain('NotApplicable')
      expect(profile?.nonCausalDisclaimerEn).toContain('PROHIBITED TARGET')
      expect(profile?.globalFeatureImportance.length).toBe(0)
      expect(profile?.localProfileExplanations.length).toBe(0)
      expect(profile?.governanceNotice).toContain('PERMANENTLY_REJECTED')
    })
  })

  describe('2. Bilingual Labeling and Non-Causal Transparency', () => {
    it('verifies that all global features have accurate English and Bangla descriptions', async () => {
      const profile = await ClinicalGovernanceService.getModelXAIProfileByModelId('exp01-copd-phenotype')
      for (const feat of profile?.globalFeatureImportance ?? []) {
        expect(feat.labelEn.trim().length).toBeGreaterThan(0)
        expect(feat.labelBn.trim().length).toBeGreaterThan(0)
        expect(feat.domain.trim().length).toBeGreaterThan(0)
      }
    })

    it('verifies explanation stability assessments are recorded', async () => {
      const profile = await ClinicalGovernanceService.getModelXAIProfileByModelId('exp01-copd-phenotype')
      expect(profile?.stabilityAssessment).toBeDefined()
      expect(profile?.stabilityAssessment.stabilityVerdict).toBe('highly_stable')
      expect(profile?.stabilityAssessment.repeatabilityDiscrepancy).toBe(0.0)
      expect(profile?.stabilityAssessment.meanProbabilityShift).toBeLessThan(0.01)
    })
  })

  describe('3. Governance Registration & Audit Trail', () => {
    it('records an audit log event when an XAI profile is created or updated', async () => {
      const chairId = 'cab-mem-001'
      const mockProfile: ModelXAIProfile = {
        id: 'xai-prof-mock-audit',
        modelId: 'mock-model-xai',
        modelName: 'Mock Validation Model',
        modelVersion: '1.0.0',
        supportedExplainerTypes: ['LinearExplainer'],
        nonCausalDisclaimerEn: 'Mock non-causal disclaimer',
        nonCausalDisclaimerBn: 'মক সতর্কবার্তা',
        baselineProbability: 0.10,
        globalFeatureImportance: [],
        localProfileExplanations: [],
        stabilityAssessment: {
          repeatabilityDiscrepancy: 0.0,
          meanProbabilityShift: 0.0,
          stabilityVerdict: 'highly_stable',
          methodologicalNote: 'Mock note',
        },
        governanceNotice: 'TEST_ONLY',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await ClinicalGovernanceService.createOrUpdateXAIProfile(
        mockProfile,
        chairId,
        'chair'
      )

      const retrieved = await ClinicalGovernanceService.getModelXAIProfileByModelId('mock-model-xai')
      expect(retrieved).not.toBeNull()
      expect(retrieved?.id).toBe('xai-prof-mock-audit')

      const auditEvents = await ClinicalGovernanceService.getAuditEvents()
      const event = auditEvents.find((e) => e.entityId === 'xai-prof-mock-audit')
      expect(event).toBeDefined()
      expect(event?.action).toBe('reviewed')
      expect(event?.actorId).toBe(chairId)
    })
  })
})


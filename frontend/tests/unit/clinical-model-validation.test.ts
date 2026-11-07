import { describe, it, expect, beforeEach } from 'vitest'
import { ClinicalGovernanceService } from '@/modules/governance/service'
import {
  AIModelValidationRecord,
} from '@/modules/governance/types'

describe('Phase 2.3: Clinical Model Validation & CAB Governance Framework', () => {
  beforeEach(() => {
    ClinicalGovernanceService.resetForTesting()
  })

  describe('1. Model Validation Evidence Registry', () => {
    it('returns all registered clinical AI validation dossiers', async () => {
      const records = await ClinicalGovernanceService.getModelValidationRecords()
      expect(records).toBeDefined()
      expect(records.length).toBeGreaterThanOrEqual(3)

      const copd = records.find((r) => r.id === 'ai-val-exp01-copd')
      const lcs = records.find((r) => r.id === 'ai-val-exp02-screening')
      const direct = records.find((r) => r.id === 'ai-val-direct-cancer')

      expect(copd).toBeDefined()
      expect(lcs).toBeDefined()
      expect(direct).toBeDefined()
    })

    it('retrieves EXP-01 COPD validation dossier with rigorous discrimination and calibration data', async () => {
      const record = await ClinicalGovernanceService.getModelValidationRecordById('ai-val-exp01-copd')
      expect(record).not.toBeNull()
      expect(record?.modelId).toBe('exp01-copd-phenotype')
      expect(record?.lifecycleTier).toBe('experimental')

      // Discrimination
      expect(record?.discriminationMetrics).toBeDefined()
      expect(record?.discriminationMetrics?.rocAuc).toBeCloseTo(0.86, 1)
      expect(record?.discriminationMetrics?.sensitivity).toBeGreaterThan(0.70)
      expect(record?.discriminationMetrics?.specificity).toBeGreaterThan(0.75)
      expect(record?.discriminationMetrics?.brierScore).toBeLessThan(0.20)
      expect(record?.discriminationMetrics?.confusionMatrix).toBeDefined()
      expect(record?.discriminationMetrics?.confidenceIntervals95).toBeDefined()

      // Calibration
      expect(record?.calibrationMetrics).toBeDefined()
      expect(record?.calibrationMetrics?.deciles.length).toBe(10)
      expect(record?.calibrationMetrics?.calibrationSlope).toBeGreaterThan(0.85)

      // Clinical Utility (DCA)
      expect(record?.clinicalUtilityMetrics).toBeDefined()
      expect(record?.clinicalUtilityMetrics?.netBenefitAtThresholds.length).toBeGreaterThan(0)
    })

    it('confirms formal rejection and prohibited status of EXP-02 screening non-adherence model', async () => {
      const record = await ClinicalGovernanceService.getModelValidationRecordById('ai-val-exp02-screening')
      expect(record).not.toBeNull()
      expect(record?.validationStatus).toBe('rejected')
      expect(record?.lifecycleTier).toBe('prohibited')
      expect(record?.cabReviewDecision?.decision).toBe('rejected')
      expect(record?.operationalActivation.isActivated).toBe(false)
      expect(record?.operationalActivation.activationBlockedReason).toContain('rejected for Bangladesh clinical use')
    })

    it('confirms permanent prohibition of direct supervised lung cancer diagnosis without biopsy confirmation', async () => {
      const record = await ClinicalGovernanceService.getModelValidationRecordById('ai-val-direct-cancer')
      expect(record).not.toBeNull()
      expect(record?.lifecycleTier).toBe('prohibited')
      expect(record?.validationStatus).toBe('rejected')
      expect(record?.cabReviewDecision?.clinicalRationale).toContain('survivor')
      expect(record?.operationalActivation.isActivated).toBe(false)
    })
  })

  describe('2. Bangladesh External Generalizability & Evidence Gap Audit', () => {
    it('documents the empirical evidence gap and absence of validated Bangladesh datasets', async () => {
      const copd = await ClinicalGovernanceService.getModelValidationRecordById('ai-val-exp01-copd')
      expect(copd?.bangladeshGeneralizability.evaluated).toBe(true)
      expect(copd?.bangladeshGeneralizability.datasetAvailable).toBe(false)
      expect(copd?.bangladeshGeneralizability.distributionShiftIdentified).toBe(true)
      expect(copd?.bangladeshGeneralizability.missingVariables.length).toBeGreaterThanOrEqual(3)

      const missing = copd?.bangladeshGeneralizability.missingVariables ?? []
      expect(missing.some((v) => v.toLowerCase().includes('bidi'))).toBe(true)
      expect(missing.some((v) => v.toLowerCase().includes('biomass'))).toBe(true)
      expect(copd?.bangladeshGeneralizability.prospectiveRequirements).toContain('NIDCH')
    })

    it('documents structural inapplicability of USPSTF LDCT screening in Bangladesh', async () => {
      const lcs = await ClinicalGovernanceService.getModelValidationRecordById('ai-val-exp02-screening')
      expect(lcs?.bangladeshGeneralizability.evaluated).toBe(true)
      expect(lcs?.bangladeshGeneralizability.datasetAvailable).toBe(false)
      expect(lcs?.clinicalUtilityMetrics?.practicalFeasibilityScore).toBe('inapplicable')
      expect(lcs?.clinicalUtilityMetrics?.bangladeshWorkflowApplicability).toContain('Fundamentally inapplicable')
    })
  })

  describe('3. Clinical Advisory Board (CAB) Model Review Workflow', () => {
    it('allows authorized CAB members to record formal review decisions and conditions', async () => {
      const reviewerId = 'cab-mem-001' // Prof. Dr. Farhana Ahmed (Chair)
      const updated = await ClinicalGovernanceService.conductCABModelReview(
        'ai-val-exp01-copd',
        'approved_subject_to_conditions',
        'Conditionally approved exclusively for offline research exploration. Operational deployment remains blocked.',
        ['Research sandbox only', 'Biomass variables required before clinical pilot'],
        reviewerId
      )

      expect(updated.cabReviewDecision).toBeDefined()
      expect(updated.cabReviewDecision?.decision).toBe('approved_subject_to_conditions')
      expect(updated.lifecycleTier).toBe('validated')
      expect(updated.cabReviewDecision?.conditionsOrRestrictions?.length).toBe(2)
      expect(updated.cabReviewDecision?.reviewedByMemberName).toContain('Prof. Dr. Farhana Ahmed')
    })

    it('rejects CAB review submissions from non-authorized members', async () => {
      const observerId = 'cab-mem-005' // Dr. Sabrina Karim (Observer)
      await expect(
        ClinicalGovernanceService.conductCABModelReview(
          'ai-val-exp01-copd',
          'approved_for_defined_use',
          'Unauthorized approval attempt',
          [],
          observerId
        )
      ).rejects.toThrow(/not authorized/i)
    })

    it('rejects review on non-existent validation records', async () => {
      await expect(
        ClinicalGovernanceService.conductCABModelReview(
          'non-existent-record-id',
          'rejected',
          'Reason',
          [],
          'cab-mem-001'
        )
      ).rejects.toThrow(/not found/i)
    })
  })

  describe('4. Operational Activation Governance Gatekeeper', () => {
    it('blocks operational activation when model has not received formal CAB approval', async () => {
      const chairId = 'cab-mem-001'
      const result = await ClinicalGovernanceService.attemptOperationalActivation(
        'ai-val-exp01-copd',
        chairId,
        'chair'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Operational activation blocked')
      expect(result.error).toContain('has not received formal CAB approval for defined clinical use')
      expect(result.record.operationalActivation.isActivated).toBe(false)
      expect(result.record.operationalActivation.activationBlockedReason).not.toBeNull()
    })

    it('blocks operational activation when Bangladesh external validation data is missing even if CAB approved', async () => {
      // Temporarily mark as approved in test store
      const chairId = 'cab-mem-001'
      await ClinicalGovernanceService.conductCABModelReview(
        'ai-val-exp01-copd',
        'approved_for_defined_use',
        'Hypothetical approval without BD data',
        [],
        chairId
      )

      const result = await ClinicalGovernanceService.attemptOperationalActivation(
        'ai-val-exp01-copd',
        chairId,
        'chair'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('lacks validated Bangladesh-specific external data')
      expect(result.record.operationalActivation.isActivated).toBe(false)
    })

    it('blocks operational activation if non-executive user attempts authorization', async () => {
      const observerId = 'cab-mem-005'
      const result = await ClinicalGovernanceService.attemptOperationalActivation(
        'ai-val-exp01-copd',
        observerId,
        'observer'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Operational activation blocked')
      expect(result.record.operationalActivation.isActivated).toBe(false)
    })

    it('successfully activates only when all 3 governance invariants are satisfied', async () => {
      const chairId = 'cab-mem-001'

      // Prepare a fully validated mock record with verified BD data and CAB approval
      const mockFullyValidatedRecord: AIModelValidationRecord = {
        id: 'ai-val-mock-validated-bd',
        modelId: 'mock-validated-bd-model',
        modelName: 'Prospective NIDCH Validated COPD Phenotyper',
        modelVersion: '2.0.0-clinical',
        lifecycleTier: 'approved',
        originalExperimentRef: 'PROT-BD-VAL-01',
        developmentDatasetRef: 'NIDCH Prospective Cohort N=1500',
        validationDatasetProfile: {
          id: 'ds-nidch-bd-2026',
          name: 'NIDCH Multi-Center Prospective Validation Cohort',
          source: 'National Institute of Diseases of the Chest and Hospital',
          jurisdiction: 'Bangladesh',
          collectionMethodology: 'Prospective post-bronchodilator spirometric cohort',
          sampleSize: 1500,
          outcomeVariable: 'Post-bronchodilator FEV1/FVC < 0.70',
          populationCharacteristics: 'Bangladeshi adults with bidi and biomass exposure',
          isIndependent: true,
          isBangladeshSpecific: true,
          isAuthorized: true,
          limitations: [],
        },
        validationProtocol: 'PROT-BD-VAL-01',
        validationDate: '2026-11-06T10:00:00.000Z',
        validationStatus: 'validated',
        bangladeshGeneralizability: {
          evaluated: true,
          datasetAvailable: true,
          evidenceGapSummary: 'Verified on prospective NIDCH cohort.',
          distributionShiftIdentified: false,
          missingVariables: [],
          prospectiveRequirements: 'Completed.',
        },
        cabReviewDecision: {
          decision: 'approved_for_defined_use',
          reviewedAt: '2026-11-06T10:00:00.000Z',
          reviewedByMemberId: chairId,
          reviewedByMemberName: 'Prof. Dr. Farhana Ahmed (Chair)',
          clinicalRationale: 'Prospective clinical validation completed with spirometric endpoints.',
        },
        operationalActivation: {
          isActivated: false,
          activatedAt: null,
          activatedBy: null,
          activationBlockedReason: null,
        },
        safetyInvariantsEnforced: true,
        createdAt: '2026-11-06T10:00:00.000Z',
        updatedAt: '2026-11-06T10:00:00.000Z',
      }

      await ClinicalGovernanceService.createOrUpdateValidationRecord(
        mockFullyValidatedRecord,
        chairId,
        'chair'
      )

      const result = await ClinicalGovernanceService.attemptOperationalActivation(
        'ai-val-mock-validated-bd',
        chairId,
        'chair'
      )

      expect(result.success).toBe(true)
      expect(result.record.operationalActivation.isActivated).toBe(true)
      expect(result.record.lifecycleTier).toBe('operationally_activated')
      expect(result.record.operationalActivation.activatedBy).toContain('Prof. Dr. Farhana Ahmed')
    })
  })

  describe('5. Audit Logging and Invariant Enforcement', () => {
    it('records immutable audit events for CAB model reviews and activation attempts', async () => {
      const chairId = 'cab-mem-001'
      await ClinicalGovernanceService.conductCABModelReview(
        'ai-val-exp01-copd',
        'requires_additional_evidence',
        'Audit verification review test',
        ['Condition 1'],
        chairId
      )

      const auditEvents = await ClinicalGovernanceService.getAuditEvents()
      const reviewEvent = auditEvents.find(
        (e) => e.entityId === 'ai-val-exp01-copd' && e.action === 'reviewed'
      )

      expect(reviewEvent).toBeDefined()
      expect(reviewEvent?.actorId).toBe(chairId)
      expect(reviewEvent?.justification).toBe('Audit verification review test')
    })
  })
})

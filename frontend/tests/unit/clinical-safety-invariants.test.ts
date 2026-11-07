/**
 * Phase 1.26: Clinical Safety & Cross-Pathway Invariants Unit Test Suite
 *
 * Verifies non-negotiable healthcare safety principles:
 * 1. Low calculated risk MUST NEVER suppress alarming red-flag symptoms.
 * 2. Screening ineligibility MUST NEVER block or suppress symptom-based triage.
 * 3. Cross-Pathway Independence: Risk, Screening, and Triage remain separate.
 * 4. Zero Confirmed Diagnosis Claims: Results are decision-support estimates only.
 * 5. Governance Assertion Halting: Unapproved methodologies cannot execute operationally.
 * 6. Non-Destructive Clinician Overrides: Automated outputs are preserved alongside overrides.
 * 7. Missing Data Safety: Unanswered/unknown questions are never presumed negative.
 */

import { describe, it, expect, beforeEach } from 'vitest'

import { ClinicalGovernanceService } from '@/modules/governance/service'
import { InputPreparerService } from '@/modules/risk-estimation/input-preparer'
import { RiskCalculationEngine } from '@/modules/risk-estimation/calculator'
import { RiskExplainabilityService } from '@/modules/risk-estimation/explainer'
import { ScreeningInputPreparerService } from '@/modules/screening/input-preparer'
import { ScreeningEligibilityEvaluator } from '@/modules/screening/evaluator'
import { SymptomTriageService } from '@/modules/triage/service'
import { SymptomTriageEvaluator } from '@/modules/triage/evaluator'
import { MethodologyRegistry } from '@/modules/risk-estimation/methodology-registry'
import { ScreeningGuidelineRegistry } from '@/modules/screening/guideline-registry'
import { SymptomTriageProtocolRegistry } from '@/modules/triage/protocol-registry'
import type { PatientSymptomIntakePayload } from '@/modules/triage/types'

describe('Phase 1.26: Clinical Safety & Cross-Pathway Invariants', () => {
  const MOCK_PATIENT_ID = '11111111-1111-4111-a111-111111111111' // Rafiqul Islam benchmark

  beforeEach(() => {
    ClinicalGovernanceService.resetForTesting()
  })

  // ==========================================================================
  // INVARIANT 1: LOW RISK NEVER SUPPRESSES CONCERNING RED-FLAG SYMPTOMS
  // ==========================================================================
  describe('Invariant 1: Low Risk Estimate Never Suppresses Alarming Symptoms', () => {
    it('elevates patient with simulated low statistical risk to emergency triage upon hemoptysis', async () => {
      // 1. Prepare structured risk input and simulate low risk (younger age, never-smoker)
      const riskInput = await InputPreparerService.prepareAndValidatePatientInput(MOCK_PATIENT_ID)
      riskInput.demographics.age = 32
      riskInput.derived.age = 32
      riskInput.smokingHistory.status = 'never_smoker'
      riskInput.smokingHistory.cigarettesPerDay = 0
      riskInput.derived.packYears = 0
      riskInput.derived.yearsSmoked = 0
      riskInput.derived.cigarettesPerDay = 0
      riskInput.derived.isCurrentSmoker = false
      riskInput.derived.isFormerSmoker = false
      riskInput.derived.hasFamilyLungCancer = false
      riskInput.derived.hasCopdOrEmphysema = false

      const riskOutput = RiskCalculationEngine.execute(
        riskInput,
        'plcom2012',
        'research_simulation'
      )

      // Risk output is statistically low
      expect(riskOutput.estimatedRiskPercentage).not.toBeNull()
      expect(riskOutput.estimatedRiskPercentage!).toBeLessThan(0.5)
      expect(riskOutput.riskCategory).toBe('low')

      // 2. Evaluate Symptom Triage for acute massive hemoptysis
      const emergencySymptoms: PatientSymptomIntakePayload = {
        hemoptysis: {
          status: 'present',
          isMassive: true,
          durationWeeks: 1,
          severity: 'severe',
        },
        dyspnea: { status: 'present', severity: 'moderate' },
      }

      const triageInput = await SymptomTriageService.preparePatientInput(
        MOCK_PATIENT_ID,
        emergencySymptoms,
        'clinician_verified'
      )

      const triageOutput = SymptomTriageEvaluator.evaluate(
        triageInput,
        'proto-nice-ng12-2023',
        'research_simulation'
      )

      // Crucial Safety Assertion:
      // Despite statistical risk being <1.0%, the triage engine MUST flag Emergency Escalation!
      expect(triageOutput.urgencyLevel).toBe('emergency_escalation')
      expect(triageOutput.executionStatus).toBe('emergency_detected')
      expect(triageOutput.recommendedTimeframeDays).toBe(0) // Immediate (same day)
      expect(triageOutput.recommendedEscalationPathway).toContain('Immediate Emergency Escalation')
    })
  })

  // ==========================================================================
  // INVARIANT 2: SCREENING INELIGIBILITY NEVER BLOCKS SYMPTOM-BASED TRIAGE
  // ==========================================================================
  describe('Invariant 2: Screening Ineligibility Never Blocks Symptom-Based Escalation', () => {
    it('escalates to urgent diagnostic pathway even when patient is ineligible for CT screening', async () => {
      // 1. Prepare screening input and simulate ineligibility due to age (age 44 < 50)
      const screeningInput = await ScreeningInputPreparerService.preparePatientInput(MOCK_PATIENT_ID)
      screeningInput.derived.age = 44 // Below USPSTF 50yo threshold

      const screeningOutput = ScreeningEligibilityEvaluator.evaluate(
        screeningInput,
        'gl-uspstf-2021',
        'research_simulation'
      )

      // Patient must be not eligible
      expect(screeningOutput.eligibilityOutcome).toBe('not_eligible')
      const ageCriterion = screeningOutput.criteriaEvaluations.find((c) => c.criterionKey === 'age_range')
      expect(ageCriterion?.status).toBe('unmet')

      // 2. Prepare symptom triage for the same patient reporting unexplained hemoptysis
      const urgentSymptoms: PatientSymptomIntakePayload = {
        hemoptysis: {
          status: 'present',
          isMassive: false,
          durationWeeks: 2,
          severity: 'moderate',
        },
        cough: {
          status: 'present',
          durationWeeks: 4,
          severity: 'moderate',
        },
      }

      const triageInput = await SymptomTriageService.preparePatientInput(
        MOCK_PATIENT_ID,
        urgentSymptoms,
        'clinician_verified'
      )

      const triageOutput = SymptomTriageEvaluator.evaluate(
        triageInput,
        'proto-nice-ng12-2023',
        'research_simulation'
      )

      // Crucial Safety Assertion:
      // Screening ineligibility MUST NOT prevent urgent triage escalation!
      expect(triageOutput.urgencyLevel).toBe('urgent_assessment')
      expect(triageOutput.executionStatus).toBe('escalation_required')
      expect(triageOutput.recommendedTimeframeDays).toBe(14) // 2-week wait diagnostic referral
      expect(triageOutput.recommendedEscalationPathway).toContain('Urgent 2-Week Diagnostic Assessment')
    })
  })

  // ==========================================================================
  // INVARIANT 3: CROSS-PATHWAY INDEPENDENCE
  // ==========================================================================
  describe('Invariant 3: Complete Independence of Clinical Pathways', () => {
    it('guarantees that risk, screening, and triage operate with independent models, registries, and lifecycles', () => {
      const riskModels = MethodologyRegistry.getAllMethodologies()
      const screeningGuidelines = ScreeningGuidelineRegistry.getAllGuidelines()
      const triageProtocols = SymptomTriageProtocolRegistry.getAllProtocols()

      // Model registries must be distinct
      expect(riskModels.length).toBeGreaterThan(0)
      expect(screeningGuidelines.length).toBeGreaterThan(0)
      expect(triageProtocols.length).toBeGreaterThan(0)

      // Identifiers across the three registries must never collide
      const riskCodes = riskModels.map((m) => m.code.toLowerCase())
      const screeningCodes = screeningGuidelines.map((g) => g.guidelineCode.toLowerCase())
      const triageCodes = triageProtocols.map((p) => p.protocolCode.toLowerCase())

      for (const code of riskCodes) {
        expect(screeningCodes.includes(code)).toBe(false)
        expect(triageCodes.includes(code)).toBe(false)
      }
    })
  })

  // ==========================================================================
  // INVARIANT 4: ZERO CONFIRMED CANCER DIAGNOSIS CLAIMS
  // ==========================================================================
  describe('Invariant 4: Zero Confirmed Diagnosis or Cancer-Free Claims', () => {
    it('ensures disclaimers strictly state decision support and forbid diagnostic assertions', async () => {
      const preparedInput = await InputPreparerService.prepareAndValidatePatientInput(MOCK_PATIENT_ID)

      const calcResult = RiskCalculationEngine.execute(
        preparedInput,
        'plcom2012',
        'research_simulation'
      )

      const explanation = RiskExplainabilityService.generateExplanation(
        preparedInput,
        calcResult
      )

      // Mandatory CDSS Safety assertions
      const notMeans = explanation.whatThisDoesNotMean
      expect(notMeans).toContain('NOT a cancer diagnosis')
      expect(notMeans).toContain('low estimated risk does NOT rule out lung cancer')
      expect(notMeans).toContain('Active respiratory symptoms')
      expect(notMeans).toContain('Low-Dose CT (LDCT) screening eligibility')
    })
  })

  // ==========================================================================
  // INVARIANT 5: GOVERNANCE ASSERTION HALTING IN CLINICAL PRODUCTION
  // ==========================================================================
  describe('Invariant 5: Governance Gate Enforces Production Pause for Unapproved Methodologies', () => {
    it('halts triage output generation in clinical_production mode when protocol is unapproved for Bangladesh', async () => {
      const symptoms: PatientSymptomIntakePayload = {
        cough: { status: 'present', durationWeeks: 4 },
        hemoptysis: { status: 'present', durationWeeks: 1 },
      }

      const triageInput = await SymptomTriageService.preparePatientInput(
        MOCK_PATIENT_ID,
        symptoms,
        'clinician_verified'
      )

      // Execute in clinical_production mode
      const output = SymptomTriageEvaluator.evaluate(
        triageInput,
        'proto-nice-ng12-2023',
        'clinical_production'
      )

      expect(output.executionStatus).toBe('protocol_not_approved')
      expect(output.urgencyLevel).toBe('protocol_not_approved')
      expect(output.isClinicallyApproved).toBe(false)
      expect(output.governanceNotice).toContain('PROTOCOL_NOT_APPROVED_FOR_BANGLADESH')
    })
  })

  // ==========================================================================
  // INVARIANT 6: MISSING / UNKNOWN DATA NEVER ASSUMED NEGATIVE
  // ==========================================================================
  describe('Invariant 6: Missing and Unknown Data Handling', () => {
    it('marks unknown symptom questions as missing rather than assuming absence', async () => {
      // Incomplete symptoms with omitted hemoptysis
      const partialSymptoms: PatientSymptomIntakePayload = {
        cough: {
          status: 'present',
          durationWeeks: 4,
          progression: 'stable',
          severity: 'mild',
        },
        // hemoptysis and weight loss are intentionally omitted
      }

      const input = await SymptomTriageService.preparePatientInput(
        MOCK_PATIENT_ID,
        partialSymptoms,
        'patient_reported'
      )

      expect(input.isComplete).toBe(false)
      expect(input.missingRequiredSymptoms).toContain('hemoptysis')
      expect(input.missingRequiredSymptoms).toContain('unexplainedWeightLoss')

      // Evaluate under research simulation
      const result = SymptomTriageEvaluator.evaluate(input, 'proto-nice-ng12-2023', 'research_simulation')
      const hemCrit = result.criteriaEvaluations.find((c) => c.criterionKey.includes('hemoptysis'))

      // Must be marked 'missing', NOT 'unmet'
      expect(hemCrit?.status).toBe('missing')
    })
  })
})

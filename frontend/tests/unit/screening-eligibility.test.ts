import { describe, it, expect } from 'vitest'
import { ScreeningGuidelineRegistry } from '@/modules/screening/guideline-registry'
import { ScreeningInputPreparerService } from '@/modules/screening/input-preparer'
import { ScreeningEligibilityEvaluator } from '@/modules/screening/evaluator'
import { ScreeningExplainabilityService } from '@/modules/screening/explainer'
import { ScreeningEligibilityService } from '@/modules/screening/service'
import { evaluateScreeningSchema } from '@/modules/screening/validation'

describe('Phase 1.13 Lung Cancer Screening Eligibility Engine - Unit Tests', () => {
  const MOCK_PATIENT_ID = '11111111-1111-4111-a111-111111111111' // Rafiqul Islam (58yo, 25 pack-years, former smoker quit 15y ago)
  const MOCK_FACILITY_ID = 'fac-001'

  describe('1. Screening Guideline Registry & Governance', () => {
    it('initializes with authoritative international and regional guidelines', () => {
      const guidelines = ScreeningGuidelineRegistry.getAllGuidelines()
      expect(guidelines.length).toBeGreaterThanOrEqual(3)

      const uspstf = guidelines.find((g) => g.id === 'gl-uspstf-2021')
      expect(uspstf).toBeDefined()
      expect(uspstf?.guidelineCode).toBe('USPSTF-2021')
      expect(uspstf?.issuingOrganization).toContain('Preventive Services Task Force')
      expect(uspstf?.officialSourceUrl).toContain('10.1001/jama.2021.1117')
      expect(uspstf?.screeningIntervalMonths).toBe(12)
      expect(uspstf?.recommendedModality).toBe('low_dose_computed_tomography')
      expect(uspstf?.lifecycleStatus).toBe('awaiting_clinical_approval')

      const acs = guidelines.find((g) => g.id === 'gl-acs-2023')
      expect(acs).toBeDefined()
      expect(acs?.guidelineCode).toBe('ACS-2023')
      expect(acs?.publicationReference).toContain('CA Cancer J Clin')

      const nidch = guidelines.find((g) => g.id === 'gl-nidch-pilot')
      expect(nidch).toBeDefined()
      expect(nidch?.guidelineCode).toBe('NIDCH-PILOT-2026')
      expect(nidch?.lifecycleStatus).toBe('under_validation')
    })

    it('enforces that no unapproved guideline is marked as approved for Bangladesh', () => {
      const guidelines = ScreeningGuidelineRegistry.getAllGuidelines()
      const approved = guidelines.filter((g) => g.approvedForBangladesh)
      expect(approved.length).toBe(0) // Strict clinical governance gate
    })

    it('retrieves guideline details, versions, and criteria definitions', () => {
      const guideline = ScreeningGuidelineRegistry.getGuideline('gl-uspstf-2021')
      expect(guideline).toBeDefined()
      expect(guideline?.knownLimitations).toContain('multislice CT infrastructure')

      const versions = ScreeningGuidelineRegistry.getGuidelineVersions('gl-uspstf-2021')
      expect(versions.length).toBeGreaterThanOrEqual(1)
      expect(versions[0].minAge).toBe(50)
      expect(versions[0].maxAge).toBe(80)
      expect(versions[0].minPackYears).toBe(20.0)
      expect(versions[0].maxQuitYears).toBe(15)
      expect(versions[0].requiresAsymptomatic).toBe(true)
      expect(versions[0].criteriaDefinitions.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('2. Patient Input Preparation & Derived Variables', () => {
    it('prepares structured screening inputs for patient with verified smoking history', async () => {
      const input = await ScreeningInputPreparerService.preparePatientInput(MOCK_PATIENT_ID)

      expect(input.patientId).toBe(MOCK_PATIENT_ID)
      expect(input.patientName).toContain('Rafiqul Islam')
      expect(input.demographics.age).toBe(58)
      expect(input.smokingHistory.status).toBe('former')
      expect(input.derived.packYears).toBeGreaterThanOrEqual(25)
      expect(input.derived.yearsSinceQuit).toBe(15)
      expect(input.derived.hasActiveConcerningSymptoms).toBe(false)
      expect(input.snapshotHash).toBeDefined()
      expect(input.snapshotHash.length).toBe(64) // SHA-256
    })

    it('throws not found error for invalid patient ID', async () => {
      await expect(
        ScreeningInputPreparerService.preparePatientInput('non-existent-patient-uuid')
      ).rejects.toThrow('not found')
    })
  })

  describe('3. Clinical Governance Safety Gate (Critical CDSS Rule)', () => {
    it('PAUSES evaluation and produces NO operational recommendation in clinical production mode for unapproved guidelines', async () => {
      const input = await ScreeningInputPreparerService.preparePatientInput(MOCK_PATIENT_ID)

      // Execute in strict clinical production mode
      const result = ScreeningEligibilityEvaluator.evaluate(
        input,
        'gl-uspstf-2021',
        'clinical_production'
      )

      expect(result.executionStatus).toBe('guideline_not_approved')
      expect(result.eligibilityOutcome).toBe('guideline_not_approved')
      expect(result.isClinicallyApproved).toBe(false)
      expect(result.isResearchExecution).toBe(false)
      expect(result.recommendedIntervalMonths).toBeNull()
      expect(result.recommendedModality).toBeNull()
      expect(result.governanceNotice).toContain('Clinical screening evaluation paused')
      expect(result.governanceNotice).toContain('awaiting_clinical_approval')
    })
  })

  describe('4. Research Simulation Execution Mode', () => {
    it('evaluates criteria deterministically in research simulation mode for qualifying patient', async () => {
      const input = await ScreeningInputPreparerService.preparePatientInput(MOCK_PATIENT_ID)

      // Execute in research simulation mode
      const result = ScreeningEligibilityEvaluator.evaluate(
        input,
        'gl-uspstf-2021',
        'research_simulation'
      )

      expect(result.executionStatus).toBe('completed')
      expect(result.eligibilityOutcome).toBe('eligible')
      expect(result.isClinicallyApproved).toBe(false)
      expect(result.isResearchExecution).toBe(true)
      expect(result.recommendedIntervalMonths).toBe(12)
      expect(result.recommendedModality).toBe('low_dose_computed_tomography')
      expect(result.criteriaEvaluations.length).toBeGreaterThanOrEqual(5)

      // All criteria should be met for Rafiqul
      const ageCrit = result.criteriaEvaluations.find((c) => c.criterionKey === 'age_range')
      expect(ageCrit?.status).toBe('met')

      const packCrit = result.criteriaEvaluations.find((c) => c.criterionKey === 'pack_years')
      expect(packCrit?.status).toBe('met')

      const cessationCrit = result.criteriaEvaluations.find((c) => c.criterionKey === 'smoking_status_cessation')
      expect(cessationCrit?.status).toBe('met')

      const asymCrit = result.criteriaEvaluations.find((c) => c.criterionKey === 'asymptomatic_status')
      expect(asymCrit?.status).toBe('met')
    })
  })

  describe('5. Criterion-Level Evaluation Logic', () => {
    it('marks age criterion as unmet when patient is younger than minimum threshold', async () => {
      const input = await ScreeningInputPreparerService.preparePatientInput(MOCK_PATIENT_ID)
      input.derived.age = 44 // Below 50

      const result = ScreeningEligibilityEvaluator.evaluate(
        input,
        'gl-uspstf-2021',
        'research_simulation'
      )

      expect(result.eligibilityOutcome).toBe('not_eligible')
      const ageCrit = result.criteriaEvaluations.find((c) => c.criterionKey === 'age_range')
      expect(ageCrit?.status).toBe('unmet')
      expect(ageCrit?.clinicalExplanation).toContain('below the minimum')
    })

    it('marks pack-years criterion as unmet when cumulative exposure is under 20 pack-years', async () => {
      const input = await ScreeningInputPreparerService.preparePatientInput(MOCK_PATIENT_ID)
      input.derived.packYears = 12.0 // Below 20.0

      const result = ScreeningEligibilityEvaluator.evaluate(
        input,
        'gl-uspstf-2021',
        'research_simulation'
      )

      expect(result.eligibilityOutcome).toBe('not_eligible')
      const packCrit = result.criteriaEvaluations.find((c) => c.criterionKey === 'pack_years')
      expect(packCrit?.status).toBe('unmet')
      expect(packCrit?.clinicalExplanation).toContain('below the 20')
    })

    it('evaluates cessation under ACS 2023 without 15-year quit restriction', async () => {
      const input = await ScreeningInputPreparerService.preparePatientInput(MOCK_PATIENT_ID)
      input.derived.yearsSinceQuit = 22 // Quit 22 years ago (fails USPSTF, qualifies under ACS 2023)

      const acsResult = ScreeningEligibilityEvaluator.evaluate(
        input,
        'gl-acs-2023',
        'research_simulation'
      )

      const smkCrit = acsResult.criteriaEvaluations.find((c) => c.criterionKey === 'smoking_status_cessation')
      expect(smkCrit?.status).toBe('met')
      expect(acsResult.eligibilityOutcome).toBe('eligible')
    })
  })

  describe('6. Interaction with Symptom-Based Triage (Critical CDSS Rule)', () => {
    it('excludes patient from routine screening and issues urgent triage warning when concerning symptoms exist', async () => {
      const input = await ScreeningInputPreparerService.preparePatientInput(MOCK_PATIENT_ID)
      // Inject acute red-flag symptom
      input.derived.hasActiveConcerningSymptoms = true
      input.derived.concerningSymptomsList = ['Hemoptysis (Coughing blood)', 'Unexplained weight loss']

      const result = ScreeningEligibilityEvaluator.evaluate(
        input,
        'gl-uspstf-2021',
        'research_simulation'
      )

      // Crucial clinical safety check: symptomatic patient is NOT eligible for routine screening!
      expect(result.eligibilityOutcome).toBe('not_eligible')
      expect(result.executionStatus).toBe('excluded')

      const asymCrit = result.criteriaEvaluations.find((c) => c.criterionKey === 'asymptomatic_status')
      expect(asymCrit?.status).toBe('unmet')
      expect(asymCrit?.isBlockingExclusion).toBe(true)
      expect(asymCrit?.clinicalExplanation).toContain('CRITICAL CLINICAL ALERT')
      expect(asymCrit?.clinicalExplanation).toContain('diagnostic chest imaging')

      // Check explainer output
      const explanation = ScreeningExplainabilityService.generateExplanation(input, result)
      expect(explanation.symptomPriorityWarning).not.toBeNull()
      expect(explanation.symptomPriorityWarning).toContain('PRIORITY WARNING')
      expect(explanation.symptomPriorityWarning).toContain('diagnostic')
    })
  })

  describe('7. Explainability & Non-Diagnostic Disclaimers', () => {
    it('produces transparent explainability and mandatory non-diagnostic disclaimers', async () => {
      const input = await ScreeningInputPreparerService.preparePatientInput(MOCK_PATIENT_ID)

      const evalOutput = ScreeningEligibilityEvaluator.evaluate(
        input,
        'gl-uspstf-2021',
        'research_simulation'
      )

      const explanation = ScreeningExplainabilityService.generateExplanation(input, evalOutput)

      expect(explanation.headlineOutcome).toContain('Meets Guideline Eligibility Criteria')
      expect(explanation.clinicalConsiderations.length).toBeGreaterThanOrEqual(2)
      expect(explanation.clinicalConsiderations.some((c) => c.includes('Shared Decision-Making'))).toBe(true)

      // Mandatory CDSS Safety assertions
      const notMeans = explanation.whatThisDoesNotMean
      expect(notMeans).toContain('NOT a diagnosis of lung cancer')
      expect(notMeans).toContain('zero risk')
      expect(notMeans).toContain('ASYMPTOMATIC')
      expect(notMeans).toContain('clinical responsibility')
    })
  })

  describe('8. End-to-End Service & Record Persistence', () => {
    it('executes screening evaluation via ScreeningEligibilityService with tamper-evident audit record', async () => {
      const record = await ScreeningEligibilityService.evaluateScreeningEligibility({
        patientId: MOCK_PATIENT_ID,
        guidelineId: 'gl-uspstf-2021',
        executionMode: 'clinical_production',
        facilityId: MOCK_FACILITY_ID,
      })

      expect(record.id).toBeDefined()
      expect(record.patientId).toBe(MOCK_PATIENT_ID)
      expect(record.executionStatus).toBe('guideline_not_approved')
      expect(record.eligibilityOutcome).toBe('guideline_not_approved')
      expect(record.inputSnapshot).toBeDefined()
      expect(record.inputSnapshotHash.length).toBe(64)

      // Retrieve by ID
      const fetched = await ScreeningEligibilityService.getScreeningRecord(record.id)
      expect(fetched).toBeDefined()
      expect(fetched?.id).toBe(record.id)

      // Retrieve patient history
      const history = await ScreeningEligibilityService.getPatientScreeningRecords(MOCK_PATIENT_ID)
      expect(history.length).toBeGreaterThanOrEqual(1)
      expect(history[0].patientId).toBe(MOCK_PATIENT_ID)
    })
  })

  describe('9. Input Request Validation Schema', () => {
    it('validates request payload correctly with Zod schema', () => {
      const valid = evaluateScreeningSchema.parse({
        patientId: MOCK_PATIENT_ID,
        guidelineId: 'gl-uspstf-2021',
        executionMode: 'clinical_production',
        facilityId: 'fac-001',
      })
      expect(valid.patientId).toBe(MOCK_PATIENT_ID)

      expect(() => {
        evaluateScreeningSchema.parse({
          patientId: '',
        })
      }).toThrow()
    })
  })
})

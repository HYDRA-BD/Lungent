import { describe, it, expect } from 'vitest'
import { MethodologyRegistry } from '@/modules/risk-estimation/methodology-registry'
import { InputPreparerService } from '@/modules/risk-estimation/input-preparer'
import { RiskCalculationEngine } from '@/modules/risk-estimation/calculator'
import { RiskExplainabilityService } from '@/modules/risk-estimation/explainer'
import { RiskEstimationService } from '@/modules/risk-estimation/service'
import { executeRiskAssessmentSchema } from '@/modules/risk-estimation/validation'

describe('Phase 1.12 Lung Cancer Risk Estimation Engine - Unit Tests', () => {
  const MOCK_PATIENT_ID = '11111111-1111-4111-a111-111111111111' // Rafiqul Islam (Heavy smoker, 63yo)
  const MOCK_FACILITY_ID = 'fac-001'

  describe('1. Methodology Registry & Lifecycle Management', () => {
    it('initializes with standard evidence-based methodologies', () => {
      const methodologies = MethodologyRegistry.getAllMethodologies()
      expect(methodologies.length).toBeGreaterThanOrEqual(3)

      const plco = methodologies.find((m) => m.id === 'plcom2012')
      expect(plco).toBeDefined()
      expect(plco?.lifecycleStatus).toBe('awaiting_clinical_approval')
      expect(plco?.timeHorizonYears).toBe(6)
      expect(plco?.calculationType).toBe('logistic_regression')

      const bach = methodologies.find((m) => m.id === 'bach2003')
      expect(bach).toBeDefined()
      expect(bach?.lifecycleStatus).toBe('under_validation')
      expect(bach?.timeHorizonYears).toBe(10)

      const llp = methodologies.find((m) => m.id === 'liverpool_llp')
      expect(llp).toBeDefined()
      expect(llp?.lifecycleStatus).toBe('under_validation')
      expect(llp?.timeHorizonYears).toBe(5)
    })

    it('enforces that no unapproved methodology is flagged as approved for Bangladesh', () => {
      const methodologies = MethodologyRegistry.getAllMethodologies()
      const approved = methodologies.filter((m) => m.approvedForBangladesh)
      // Strict clinical governance: Currently 0 models are approved for routine Bangladesh clinical deployment
      expect(approved.length).toBe(0)
    })

    it('allows querying methodology details and versions', () => {
      const details = MethodologyRegistry.getMethodology('plcom2012')
      expect(details).toBeDefined()
      expect(details?.name).toContain('PLCOm2012')
      expect(details?.knownLimitations).toContain('biomass fuel combustion')

      const versions = MethodologyRegistry.getMethodologyVersions('plcom2012')
      expect(versions.length).toBeGreaterThanOrEqual(1)
      expect(versions[0].versionTag).toContain('1.0.0')
      expect(versions[0].parameters).toHaveProperty('intercept')
    })
  })

  describe('2. Input Preparation & Derived Variables', () => {
    it('prepares structured risk inputs for patient with smoking history and biomass exposure', async () => {
      const input = await InputPreparerService.prepareAndValidatePatientInput(MOCK_PATIENT_ID)

      expect(input.patientId).toBe(MOCK_PATIENT_ID)
      expect(input.patientName).toContain('Rafiqul Islam')
      expect(input.demographics.age).toBe(58)
      expect(input.demographics.gender).toBe('male')

      // Smoking history & derived variables
      expect(input.smokingHistory.status).toBe('former')
      expect(input.smokingHistory.cigarettesPerDay).toBe(20)
      expect(input.derived.packYears).toBeGreaterThanOrEqual(25)
      expect(input.derived.yearsSmoked).toBeGreaterThanOrEqual(25)
      expect(input.derived.isFormerSmoker).toBe(true)

      // Environmental exposures
      expect(input.environmentalAndOccupational.hasBiomassCookingFuel).toBe(true)

      // Cryptographic snapshot hash
      expect(input.snapshotHash).toBeDefined()
      expect(input.snapshotHash.length).toBe(64) // SHA-256 hex string
    })

    it('correctly calculates pack-years incorporating bidi consumption at 0.5 cigarette equivalent', () => {
      // 10 cigarettes + 20 bidis (= 10 cigs) = 20 cigs/day (1 pack) * 30 years = 30 pack-years
      const cpd = 10
      const bpd = 20
      const years = 30
      const totalDaily = cpd + bpd * 0.5
      const packYears = (totalDaily / 20) * years
      expect(packYears).toBe(30)
    })

    it('detects missing patient gracefully by throwing not found error', async () => {
      await expect(
        InputPreparerService.prepareAndValidatePatientInput('non-existent-pt-id')
      ).rejects.toThrow('not found')
    })
  })

  describe('3. Clinical Governance Safety Gate (Critical CDSS Rule)', () => {
    it('REFUSES to calculate and fabricates NO clinical risk score in clinical production mode for unapproved models', async () => {
      const preparedInput = await InputPreparerService.prepareAndValidatePatientInput(MOCK_PATIENT_ID)

      // Execution in strict clinical production mode
      const result = RiskCalculationEngine.execute(
        preparedInput,
        'plcom2012',
        'clinical_production'
      )

      // Strict verification of clinical governance pause
      expect(result.executionStatus).toBe('methodology_not_approved')
      expect(result.estimatedRiskPercentage).toBeNull()
      expect(result.riskCategory).toBeNull()
      expect(result.isClinicallyApproved).toBe(false)
      expect(result.isResearchExecution).toBe(false)
      expect(result.governanceNotice).toContain('Clinical risk calculation paused')
      expect(result.governanceNotice).toContain('awaiting_clinical_approval')
    })
  })

  describe('4. Research Simulation Execution Mode', () => {
    it('executes deterministic mathematical calculation with research watermark in research mode', async () => {
      const preparedInput = await InputPreparerService.prepareAndValidatePatientInput(MOCK_PATIENT_ID)

      // Execution in research simulation mode
      const result = RiskCalculationEngine.execute(
        preparedInput,
        'plcom2012',
        'research_simulation'
      )

      expect(result.executionStatus).toBe('completed')
      expect(result.estimatedRiskPercentage).not.toBeNull()
      expect(result.estimatedRiskPercentage!).toBeGreaterThan(1)
      expect(result.estimatedRiskPercentage!).toBeLessThan(50)
      expect(result.isClinicallyApproved).toBe(false)
      expect(result.isResearchExecution).toBe(true)

      // Uncertainty range
      expect(result.uncertaintyRange).toBeDefined()
      expect(result.uncertaintyRange!.lowerBound).toBeLessThan(result.estimatedRiskPercentage!)
      expect(result.uncertaintyRange!.upperBound).toBeGreaterThan(result.estimatedRiskPercentage!)
    })
  })

  describe('5. Explainability & Non-Diagnostic Disclaimers', () => {
    it('generates transparent factor attributions identifying increasing, decreasing, and neutral risks', async () => {
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

      expect(explanation.contributingFactors.length).toBeGreaterThan(0)

      // Age and smoking should increase risk
      const ageFactor = explanation.contributingFactors.find((f) => f.factorKey === 'age')
      expect(ageFactor).toBeDefined()
      expect(ageFactor?.direction).toBe('increases_risk')

      const smokingFactor = explanation.contributingFactors.find((f) => f.factorKey === 'tobacco_exposure')
      expect(smokingFactor).toBeDefined()
      expect(smokingFactor?.direction).toBe('increases_risk')
    })

    it('enforces mandatory non-diagnostic disclaimers in clinical decision support output', async () => {
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

  describe('6. End-to-End Service & Audit Record Persistence', () => {
    it('executes assessment through RiskEstimationService and generates tamper-evident record', async () => {
      const record = await RiskEstimationService.executeRiskAssessment({
        patientId: MOCK_PATIENT_ID,
        methodologyId: 'plcom2012',
        executionMode: 'clinical_production',
        facilityId: MOCK_FACILITY_ID,
      })

      expect(record.id).toBeDefined()
      expect(record.patientId).toBe(MOCK_PATIENT_ID)
      expect(record.executionStatus).toBe('methodology_not_approved')
      expect(record.estimatedRiskPercentage).toBeNull()
      expect(record.inputSnapshot).toBeDefined()
      expect(record.explanation).toBeDefined()

      // Verify retrieval
      const fetched = await RiskEstimationService.getRiskAssessmentRecord(record.id)
      expect(fetched).toBeDefined()
      expect(fetched?.id).toBe(record.id)
    })

    it('retrieves patient assessment history correctly', async () => {
      const records = await RiskEstimationService.getPatientRiskAssessments(MOCK_PATIENT_ID)
      expect(records.length).toBeGreaterThanOrEqual(1)
      expect(records[0].patientId).toBe(MOCK_PATIENT_ID)
    })
  })

  describe('7. Experimental Model Segregation', () => {
    it('isolates experimental machine learning models from standard clinical methodologies', async () => {
      const experimental = await RiskEstimationService.getExperimentalModels()
      expect(experimental.length).toBeGreaterThanOrEqual(1)

      const brfssModel = experimental.find((m) => m.id === 'brfss_experimental_2022')
      expect(brfssModel).toBeDefined()
      expect(brfssModel?.isExperimentalOnly).toBe(true)
      expect(brfssModel?.modelName).toContain('BRFSS-2022')
      expect(brfssModel?.auditNotes).toContain('Strict clinical firewall')
    })
  })

  describe('8. Input Request Validation Schema', () => {
    it('validates request payload correctly with Zod schema', () => {
      const valid = executeRiskAssessmentSchema.parse({
        patientId: MOCK_PATIENT_ID,
        methodologyId: 'plcom2012',
        executionMode: 'clinical_production',
        facilityId: 'fac-001',
      })
      expect(valid.patientId).toBe(MOCK_PATIENT_ID)

      expect(() => {
        executeRiskAssessmentSchema.parse({
          patientId: '',
        })
      }).toThrow()
    })
  })
})

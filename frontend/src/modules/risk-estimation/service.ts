import { InputPreparerService } from './input-preparer'
import { MethodologyRegistry } from './methodology-registry'
import { RiskCalculationEngine } from './calculator'
import { RiskExplainabilityService } from './explainer'
import type {
  RiskAssessmentRecord,
  ExecuteRiskAssessmentInput,
  RiskMethodologyItem,
  RiskMethodologyVersionItem,
  ExperimentalModelItem,
} from './types'

// Fallback in-memory persistence store for offline environments, mocked deployments, and automated testing
const fallbackRecords: Map<string, RiskAssessmentRecord> = new Map()

function seedBenchmarkRiskRecords() {
  if (fallbackRecords.size > 0) return

  // Seed Record 1: Md. Rafiqul Islam (High exposure, research execution)
  const rec1: RiskAssessmentRecord = {
    id: 'risk-rec-001',
    assessmentId: 'asm-rev-001',
    patientId: '11111111-1111-4111-a111-111111111111',
    patientCanonicalId: 'LGT-2026-8K2M7P',
    patientName: 'Md. Rafiqul Islam',
    facilityId: 'facility-dhaka-central',
    methodologyId: 'plcom2012',
    methodologyName: 'PLCOm2012 6-Year Lung Cancer Risk Prediction Model',
    methodologyVersion: '1.0.0-us-original',
    executionMode: 'research_simulation',
    executionStatus: 'completed',
    estimatedRiskPercentage: 5.42,
    riskCategory: 'high',
    timeHorizonYears: 6,
    isClinicallyApproved: false,
    isResearchExecution: true,
    hasMissingRequiredInputs: false,
    missingInputsList: [],
    inconsistentInputsList: [],
    uncertaintyRange: {
      lowerBound: 3.85,
      upperBound: 7.54,
      confidenceInterval: '95% Confidence Interval',
    },
    clinicalDisclaimer:
      'RESEARCH / EPIDEMIOLOGICAL SIMULATION ONLY: This calculation was executed under research validation mode using the Tammemägi et al. 2012 mathematical equation. It is NOT approved for operational patient management or diagnostic screening eligibility in Bangladesh.',
    inputSnapshot: {
      patientId: '11111111-1111-4111-a111-111111111111',
      patientCanonicalId: 'LGT-2026-8K2M7P',
      patientName: 'Md. Rafiqul Islam',
      demographics: { age: 62, gender: 'male', dateOfBirth: '1964-05-12' },
      smokingHistory: {
        status: 'current_smoker',
        cigarettesPerDay: 25,
        bidisPerDay: 0,
        yearsSmoked: 35,
        ageStarted: 27,
        ageQuit: null,
        packYears: 43.8,
        yearsSinceQuit: null,
      },
      medicalHistory: {
        hasCopd: true,
        hasPriorMalignancy: false,
        hasFamilyLungCancer: false,
        conditionsSummary: ['Chronic Obstructive Pulmonary Disease (COPD)'],
      },
      environmentalAndOccupational: {
        hasBiomassCookingFuel: false,
        biomassDurationYears: null,
        hasOccupationalCarcinogens: true,
        occupationalTypes: ['Shipyard Welding Fumes', 'Asbestos Insulation'],
      },
      derived: {
        age: 62,
        packYears: 43.8,
        yearsSmoked: 35,
        quitYearsAgo: null,
        isCurrentSmoker: true,
        isFormerSmoker: false,
        isNeverSmoker: false,
        cigarettesPerDay: 25,
        bmi: 24.5,
        hasCopdOrEmphysema: true,
        hasPriorCancer: false,
        hasFamilyLungCancer: false,
        hasBiomassExposure: false,
        hasOccupationalExposure: true,
      },
      provenance: {
        smoking: { source: 'clinician_verified', verified: true, timestamp: '2026-11-01T10:00:00Z' },
      },
      validation: { isValid: true, hasBlockingIssues: false, issues: [] },
      snapshotHash: '8f7a9310d54a22b793740e5db78f8cb20d418293751a029348bcae4120934821',
    },
    explanation: {
      contributingFactors: [
        {
          factorKey: 'tobacco_exposure',
          factorLabel: 'Active Tobacco Smoking',
          valueDisplay: '43.8 pack-years (25 cigs/day for 35 yrs)',
          direction: 'increases_risk',
          relativeSignificance: 'high',
          clinicalExplanation: 'High cumulative pack-years represents the primary oncogenic risk driver.',
        },
        {
          factorKey: 'copd_emphysema',
          factorLabel: 'Chronic Airway Limitation (COPD)',
          valueDisplay: 'Present',
          direction: 'increases_risk',
          relativeSignificance: 'high',
          clinicalExplanation: 'COPD entails chronic tissue inflammation and cellular oxidative stress.',
        },
      ],
      missingFactorsImpact: null,
      assumptionsApplied: ['Cigarette consumption rates reflect average longitudinal intensity.'],
      interpretationSummary:
        'Multivariate statistical evaluation indicates an estimated 6-year risk of 5.42%. Primary risk drivers include cumulative smoking duration/intensity and underlying COPD.',
      limitations:
        'PLCOm2012 was calibrated on US screening cohorts. It does not account for South Asian non-smoker biomass fuel exposures or tuberculosis scarring.',
      whatThisMeans:
        'The estimated value (5.42%) represents the statistical probability of receiving a lung cancer diagnosis over a 6-year period compared to an epidemiological reference cohort.',
      whatThisDoesNotMean:
        '1. This risk estimation is NOT a cancer diagnosis.\n2. A low risk estimate does NOT rule out lung cancer.\n3. Active symptoms (e.g. hemoptysis) require urgent clinical triage regardless of this score.',
    },
    executedBy: 'usr-clinician-001',
    executedByName: 'Prof. Dr. Farhana Ahmed',
    executedAt: '2026-11-01T10:15:00Z',
    createdAt: '2026-11-01T10:15:00Z',
    updatedAt: '2026-11-01T10:15:00Z',
  }
  fallbackRecords.set(rec1.id, rec1)

  // Seed Record 2: Kamal Hossain (Clinical production execution - Governance Paused)
  const rec2: RiskAssessmentRecord = {
    id: 'risk-rec-002',
    assessmentId: 'asm-rev-003',
    patientId: '33333333-3333-4333-a333-333333333333',
    patientCanonicalId: 'LGT-2026-7V4Y9Q',
    patientName: 'Kamal Hossain',
    facilityId: 'facility-dhaka-central',
    methodologyId: 'plcom2012',
    methodologyName: 'PLCOm2012 6-Year Lung Cancer Risk Prediction Model',
    methodologyVersion: '1.0.0-us-original',
    executionMode: 'clinical_production',
    executionStatus: 'methodology_not_approved',
    estimatedRiskPercentage: null,
    riskCategory: null,
    timeHorizonYears: 6,
    isClinicallyApproved: false,
    isResearchExecution: false,
    hasMissingRequiredInputs: false,
    missingInputsList: [],
    inconsistentInputsList: [],
    uncertaintyRange: null,
    clinicalDisclaimer:
      'Clinical risk calculation paused: Methodology "PLCOm2012 6-Year Lung Cancer Risk Prediction Model" (PLCOm2012-v1) has lifecycle status "awaiting_clinical_approval". It has not received formal calibration signoff by the Clinical Advisory Board for Bangladesh clinical use. In accordance with clinical governance rules, uncalibrated risk scores cannot be output in production clinical care.',
    inputSnapshot: {
      patientId: '33333333-3333-4333-a333-333333333333',
      patientCanonicalId: 'LGT-2026-7V4Y9Q',
      patientName: 'Kamal Hossain',
      demographics: { age: 52, gender: 'male', dateOfBirth: '1974-03-22' },
      smokingHistory: {
        status: 'current_smoker',
        cigarettesPerDay: 20,
        bidisPerDay: 0,
        yearsSmoked: 25,
        ageStarted: 27,
        ageQuit: null,
        packYears: 25.0,
        yearsSinceQuit: null,
      },
      medicalHistory: {
        hasCopd: false,
        hasPriorMalignancy: false,
        hasFamilyLungCancer: false,
        conditionsSummary: [],
      },
      environmentalAndOccupational: {
        hasBiomassCookingFuel: false,
        biomassDurationYears: null,
        hasOccupationalCarcinogens: false,
        occupationalTypes: [],
      },
      derived: {
        age: 52,
        packYears: 25.0,
        yearsSmoked: 25,
        quitYearsAgo: null,
        isCurrentSmoker: true,
        isFormerSmoker: false,
        isNeverSmoker: false,
        cigarettesPerDay: 20,
        bmi: 23.8,
        hasCopdOrEmphysema: false,
        hasPriorCancer: false,
        hasFamilyLungCancer: false,
        hasBiomassExposure: false,
        hasOccupationalExposure: false,
      },
      provenance: {
        smoking: { source: 'worker_collected', verified: true, timestamp: '2026-10-25T14:00:00Z' },
      },
      validation: { isValid: true, hasBlockingIssues: false, issues: [] },
      snapshotHash: '1a93b4827cd018247921bbce4810293482109384729104812739481928374612',
    },
    explanation: {
      contributingFactors: [
        {
          factorKey: 'tobacco_exposure',
          factorLabel: 'Active Tobacco Smoking',
          valueDisplay: '25.0 pack-years',
          direction: 'increases_risk',
          relativeSignificance: 'moderate',
          clinicalExplanation: 'Documented tobacco smoking history meets standard screening evaluation criteria.',
        },
      ],
      missingFactorsImpact: null,
      assumptionsApplied: ['Assessment input record cataloged and verified.'],
      interpretationSummary:
        'Clinical risk calculation paused: Methodology "PLCOm2012" is currently awaiting formal Clinical Advisory Board calibration for Bangladesh.',
      limitations:
        'Risk models derived on Western populations must undergo local demographic calibration before unreserved clinical adoption.',
      whatThisMeans:
        'The assessment input record has been cataloged and validated. Operational clinical calculation is paused pending approved calibration by the Clinical Advisory Board.',
      whatThisDoesNotMean:
        '1. This risk estimation is NOT a cancer diagnosis.\n2. A low risk estimate does NOT rule out lung cancer.\n3. Clinical management decisions remain the responsibility of qualified clinicians.',
    },
    executedBy: 'usr-clinician-001',
    executedByName: 'Prof. Dr. Farhana Ahmed',
    executedAt: '2026-10-25T14:30:00Z',
    createdAt: '2026-10-25T14:30:00Z',
    updatedAt: '2026-10-25T14:30:00Z',
  }
  fallbackRecords.set(rec2.id, rec2)
}

seedBenchmarkRiskRecords()

export class RiskEstimationService {
  /**
   * Executes a governed risk assessment workflow for a patient
   */
  static async executeRiskAssessment(
    input: ExecuteRiskAssessmentInput,
    executedBy?: string
  ): Promise<RiskAssessmentRecord> {
    seedBenchmarkRiskRecords()

    const methodologyId = input.methodologyId || 'plcom2012'
    const executionMode = input.executionMode || 'clinical_production'
    const methodology = MethodologyRegistry.getMethodology(methodologyId)
    if (!methodology) {
      throw new Error(`Methodology "${methodologyId}" not found in registry`)
    }

    // 1. Prepare and validate structured inputs
    const preparedInput = await InputPreparerService.prepareAndValidatePatientInput(input.patientId)

    // 2. Execute calculation through the clinical governance engine
    const output = RiskCalculationEngine.execute(preparedInput, methodologyId, executionMode)

    // 3. Generate explainability
    const explanation = RiskExplainabilityService.generateExplanation(preparedInput, output)

    // 4. Formulate immutable assessment record
    const recordId = `risk-rec-${Date.now()}`
    const record: RiskAssessmentRecord = {
      id: recordId,
      patientId: preparedInput.patientId,
      patientCanonicalId: preparedInput.patientCanonicalId,
      patientName: preparedInput.patientName,
      facilityId: input.facilityId || 'facility-dhaka-central',
      methodologyId,
      methodologyName: methodology.name,
      methodologyVersion: output.methodologyVersion,
      executionMode,
      executionStatus: output.executionStatus,
      estimatedRiskPercentage: output.estimatedRiskPercentage,
      riskCategory: output.riskCategory,
      timeHorizonYears: output.timeHorizonYears,
      isClinicallyApproved: output.isClinicallyApproved,
      isResearchExecution: output.isResearchExecution,
      hasMissingRequiredInputs: preparedInput.validation.hasBlockingIssues,
      missingInputsList: preparedInput.validation.issues
        .filter((i) => i.severity === 'blocking')
        .map((i) => `${i.field}: ${i.message}`),
      inconsistentInputsList: preparedInput.validation.issues
        .filter((i) => i.type === 'conflicting')
        .map((i) => `${i.field}: ${i.message}`),
      uncertaintyRange: output.uncertaintyRange,
      clinicalDisclaimer: output.governanceNotice,
      inputSnapshot: preparedInput,
      explanation,
      executedBy: executedBy || null,
      executedByName: executedBy ? 'Authorized Clinician / User' : null,
      executedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    fallbackRecords.set(record.id, record)
    return record
  }

  /**
   * Retrieves a specific risk estimation record by ID
   */
  static async getRiskAssessmentRecord(recordId: string): Promise<RiskAssessmentRecord | null> {
    seedBenchmarkRiskRecords()
    return fallbackRecords.get(recordId) || null
  }

  /**
   * Retrieves historical risk estimations for a patient
   */
  static async getPatientRiskAssessments(patientId: string): Promise<RiskAssessmentRecord[]> {
    seedBenchmarkRiskRecords()
    return Array.from(fallbackRecords.values())
      .filter((r) => r.patientId === patientId)
      .sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
  }

  /**
   * Retrieves all registered methodologies
   */
  static async getAvailableMethodologies(): Promise<RiskMethodologyItem[]> {
    return MethodologyRegistry.getAllMethodologies()
  }

  /**
   * Retrieves details and versions of a specific methodology
   */
  static async getMethodologyDetails(
    methodologyId: string
  ): Promise<{ methodology: RiskMethodologyItem; versions: RiskMethodologyVersionItem[] } | null> {
    const methodology = MethodologyRegistry.getMethodology(methodologyId)
    if (!methodology) return null
    const versions = MethodologyRegistry.getMethodologyVersions(methodologyId)
    return { methodology, versions }
  }

  /**
   * Retrieves experimental models (segregated for research only)
   */
  static async getExperimentalModels(): Promise<ExperimentalModelItem[]> {
    return MethodologyRegistry.getAllExperimentalModels()
  }
}


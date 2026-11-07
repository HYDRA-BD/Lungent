import { createAdminClient } from '@/lib/supabase/admin'
import { ScreeningGuidelineRegistry } from './guideline-registry'
import { ScreeningInputPreparerService } from './input-preparer'
import { ScreeningEligibilityEvaluator } from './evaluator'
import { ScreeningExplainabilityService } from './explainer'
import type {
  EvaluateScreeningInput,
  ScreeningEligibilityRecord,
  ScreeningGuidelineItem,
} from './types'

function getAdminSupabaseSafe() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

// In-memory fallback store for offline tests and development
const fallbackScreeningRecords: Map<string, ScreeningEligibilityRecord> = new Map()

// Benchmark seed data
let isSeeded = false

function seedBenchmarkScreeningRecords() {
  if (isSeeded) return
  isSeeded = true

  // Benchmark Seed 1: Rafiqul Islam (58yo, former smoker 25 pack-years quit 15y ago) - Eligible under research mode
  const record1: ScreeningEligibilityRecord = {
    id: 'scr-rec-seed-001',
    assessmentId: 'asm-seed-002',
    patientId: '11111111-1111-4111-a111-111111111111',
    patientCanonicalId: 'LGT-2026-7K8M9P',
    patientName: 'Md. Rafiqul Islam',
    facilityId: 'facility-dhaka-central',
    guidelineId: 'gl-uspstf-2021',
    guidelineCode: 'USPSTF-2021',
    guidelineName: 'USPSTF 2021 Lung Cancer Screening Recommendation',
    guidelineVersion: '2021.1-final',
    executionMode: 'research_simulation',
    executionStatus: 'completed',
    eligibilityOutcome: 'eligible',
    isClinicallyApproved: false,
    isResearchExecution: true,
    hasMissingRequiredInputs: false,
    missingInputsList: [],
    inconsistentInputsList: [],
    recommendedIntervalMonths: 12,
    recommendedModality: 'low_dose_computed_tomography',
    nextRecommendedScreeningDate: '2027-03-01',
    governanceNotice: 'RESEARCH SIMULATION ONLY: Evaluated under investigational parameters.',
    clinicalSummary: 'Eligible for annual LDCT lung cancer screening under USPSTF 2021 criteria: Age 58, 25.0 pack-years, quit 15 years ago, asymptomatic.',
    inputSnapshotHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    inputSnapshot: {
      patientId: '11111111-1111-4111-a111-111111111111',
      patientCanonicalId: 'LGT-2026-7K8M9P',
      patientName: 'Md. Rafiqul Islam',
      demographics: { age: 58, gender: 'male', dateOfBirth: '1968-04-12' },
      smokingHistory: {
        status: 'former',
        cigarettesPerDay: 20,
        bidisPerDay: 0,
        yearsSmoked: 25,
        packYears: 25.0,
        yearsSinceQuit: 15,
        quitDate: '2011-01-01',
      },
      clinicalStatus: {
        hasActiveSymptoms: false,
        activeSymptoms: [],
        hasPriorLungCancer: false,
        hasLimitedLifeExpectancy: false,
        lifeExpectancyNotes: null,
      },
      derived: {
        age: 58,
        isCurrentSmoker: false,
        isFormerSmoker: true,
        isNeverSmoker: false,
        packYears: 25.0,
        yearsSmoked: 25,
        yearsSinceQuit: 15,
        hasActiveConcerningSymptoms: false,
        concerningSymptomsList: [],
        hasCurativeSurgeryContraindications: false,
        contraindicationsList: [],
        hasPriorLungMalignancy: false,
      },
      provenance: {},
      validation: { isValid: true, hasBlockingIssues: false, issues: [] },
      snapshotHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    criteriaEvaluations: [
      {
        criterionKey: 'age_range',
        criterionLabel: 'Age Criterion (50–80 years)',
        criterionRuleDescription: 'Individual must be between 50 and 80 years of age.',
        requiredValueExpression: '50 <= age <= 80',
        patientActualValue: '58 years',
        status: 'met',
        isBlockingExclusion: false,
        clinicalExplanation: 'Age 58 is within 50–80 range.',
      },
      {
        criterionKey: 'pack_years',
        criterionLabel: 'Tobacco Exposure Criterion (≥20 pack-years)',
        criterionRuleDescription: 'Individual must have accumulated at least 20.0 pack-years.',
        requiredValueExpression: 'pack_years >= 20.0',
        patientActualValue: '25.0 pack-years',
        status: 'met',
        isBlockingExclusion: false,
        clinicalExplanation: '25.0 pack-years exceeds the 20.0 pack-year threshold.',
      },
      {
        criterionKey: 'smoking_status_cessation',
        criterionLabel: 'Cessation Window Criterion (Current or Quit ≤15 years)',
        criterionRuleDescription: 'Current smoker or former smoker quit 15 years ago or fewer.',
        requiredValueExpression: 'is_current_smoker OR (is_former_smoker AND quit_years <= 15)',
        patientActualValue: 'Former smoker (quit 15 years ago)',
        status: 'met',
        isBlockingExclusion: false,
        clinicalExplanation: 'Quit 15 years ago, meeting the cessation boundary.',
      },
      {
        criterionKey: 'asymptomatic_status',
        criterionLabel: 'Asymptomatic Status',
        criterionRuleDescription: 'Patient must be asymptomatic.',
        requiredValueExpression: 'has_active_concerning_symptoms == false',
        patientActualValue: 'Asymptomatic (No red-flag symptoms)',
        status: 'met',
        isBlockingExclusion: false,
        clinicalExplanation: 'No acute red-flag symptoms reported.',
      },
      {
        criterionKey: 'curative_candidacy',
        criterionLabel: 'Curative Treatment Candidacy & Life Expectancy',
        criterionRuleDescription: 'No severe comorbid contraindications.',
        requiredValueExpression: 'has_severe_life_limiting_contraindications == false',
        patientActualValue: 'Candidate for curative management',
        status: 'met',
        isBlockingExclusion: false,
        clinicalExplanation: 'No contraindications to curative resection.',
      },
    ],
    explanation: {
      headlineOutcome: 'Meets Guideline Eligibility Criteria for Annual Low-Dose CT Screening (USPSTF-2021)',
      criteriaBreakdown: [],
      missingInformationImpact: null,
      clinicalConsiderations: [
        'Shared Decision-Making Required prior to Low-Dose CT imaging.',
        'Smoking Cessation Counseling must be continuously offered.',
      ],
      whatThisMeans: 'The individual satisfies the inclusion criteria under USPSTF 2021 for annual Low-Dose CT screening.',
      whatThisDoesNotMean: 'Screening eligibility is NOT a diagnosis of lung cancer. Ineligibility does not mean zero risk.',
      guidelineCitation: 'JAMA. 2021;325(10):962–970.',
      symptomPriorityWarning: null,
    },
    executedBy: 'usr-clinician-001',
    executedByName: 'Prof. Dr. Farhana Ahmed',
    executedAt: '2026-03-01T10:35:00.000Z',
    createdAt: '2026-03-01T10:35:00.000Z',
    updatedAt: '2026-03-01T10:35:00.000Z',
  }
  fallbackScreeningRecords.set(record1.id, record1)
}

export class ScreeningEligibilityService {
  /**
   * Evaluates screening eligibility for a patient under clinical governance rules
   */
  static async evaluateScreeningEligibility(
    input: EvaluateScreeningInput,
    executedBy?: string
  ): Promise<ScreeningEligibilityRecord> {
    seedBenchmarkScreeningRecords()

    const guidelineId = input.guidelineId || 'gl-uspstf-2021'
    const executionMode = input.executionMode || 'clinical_production'
    const guideline = ScreeningGuidelineRegistry.getGuideline(guidelineId)
    if (!guideline) {
      throw new Error(`Screening guideline "${guidelineId}" not found in registry`)
    }

    // 1. Prepare and validate structured inputs
    const preparedInput = await ScreeningInputPreparerService.preparePatientInput(input.patientId)

    // 2. Evaluate criteria through the clinical governance evaluator
    const output = ScreeningEligibilityEvaluator.evaluate(preparedInput, guidelineId, executionMode)

    // 3. Generate clinical explainability
    const explanation = ScreeningExplainabilityService.generateExplanation(preparedInput, output)

    // 4. Formulate immutable record
    const recordId = `scr-rec-${Date.now()}`
    const record: ScreeningEligibilityRecord = {
      id: recordId,
      patientId: preparedInput.patientId,
      patientCanonicalId: preparedInput.patientCanonicalId,
      patientName: preparedInput.patientName,
      facilityId: input.facilityId || 'facility-dhaka-central',
      guidelineId,
      guidelineCode: guideline.guidelineCode,
      guidelineName: guideline.name,
      guidelineVersion: output.guidelineVersion,
      executionMode,
      executionStatus: output.executionStatus,
      eligibilityOutcome: output.eligibilityOutcome,
      isClinicallyApproved: output.isClinicallyApproved,
      isResearchExecution: output.isResearchExecution,
      hasMissingRequiredInputs: preparedInput.validation.hasBlockingIssues,
      missingInputsList: preparedInput.validation.issues.map((i) => i.field),
      inconsistentInputsList: preparedInput.validation.issues
        .filter((i) => i.type === 'conflicting')
        .map((i) => i.field),
      recommendedIntervalMonths: output.recommendedIntervalMonths,
      recommendedModality: output.recommendedModality,
      nextRecommendedScreeningDate: output.nextRecommendedScreeningDate,
      governanceNotice: output.governanceNotice,
      clinicalSummary: output.clinicalSummary,
      inputSnapshotHash: preparedInput.snapshotHash,
      inputSnapshot: preparedInput,
      criteriaEvaluations: output.criteriaEvaluations,
      explanation,
      executedBy: executedBy || null,
      executedByName: executedBy ? 'Authorized Clinician' : 'Clinical Decision Support System',
      executedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    fallbackScreeningRecords.set(record.id, record)

    // Attempt Supabase insert if available
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        await supabase.from('screening_eligibility_records').insert({
          id: record.id,
          patient_id: record.patientId,
          patient_canonical_id: record.patientCanonicalId,
          patient_name: record.patientName,
          facility_id: record.facilityId,
          guideline_id: record.guidelineId,
          guideline_code: record.guidelineCode,
          guideline_name: record.guidelineName,
          guideline_version: record.guidelineVersion,
          execution_mode: record.executionMode,
          execution_status: record.executionStatus,
          eligibility_outcome: record.eligibilityOutcome,
          is_clinically_approved: record.isClinicallyApproved,
          is_research_execution: record.isResearchExecution,
          has_missing_required_inputs: record.hasMissingRequiredInputs,
          missing_inputs_list: record.missingInputsList,
          inconsistent_inputs_list: record.inconsistentInputsList,
          recommended_interval_months: record.recommendedIntervalMonths,
          recommended_modality: record.recommendedModality,
          next_recommended_screening_date: record.nextRecommendedScreeningDate,
          governance_notice: record.governanceNotice,
          clinical_summary: record.clinicalSummary,
          input_snapshot_hash: record.inputSnapshotHash,
          executed_by: record.executedBy,
          executed_by_name: record.executedByName,
          executed_at: record.executedAt,
          created_at: record.createdAt,
          updated_at: record.updatedAt,
        })
      } catch (err) {
        console.warn('ScreeningEligibilityService: Supabase insert fallback', err)
      }
    }

    return record
  }

  static async getScreeningRecord(recordId: string): Promise<ScreeningEligibilityRecord | null> {
    seedBenchmarkScreeningRecords()
    return fallbackScreeningRecords.get(recordId) || null
  }

  static async getPatientScreeningRecords(patientId: string): Promise<ScreeningEligibilityRecord[]> {
    seedBenchmarkScreeningRecords()
    const records = Array.from(fallbackScreeningRecords.values()).filter(
      (r) => r.patientId === patientId
    )
    return records.sort((a, b) => new Date(b.executedAt).getTime() - new Date(a.executedAt).getTime())
  }

  static async getAvailableGuidelines(): Promise<ScreeningGuidelineItem[]> {
    return ScreeningGuidelineRegistry.getAllGuidelines()
  }

  static async getGuidelineDetails(guidelineId: string): Promise<ScreeningGuidelineItem | null> {
    return ScreeningGuidelineRegistry.getGuideline(guidelineId)
  }
}


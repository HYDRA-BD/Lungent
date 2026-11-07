import type {
  PreparedScreeningInput,
  ScreeningEvaluationOutput,
  ScreeningExplanationResult,
} from './types'
import { ScreeningGuidelineRegistry } from './guideline-registry'

export class ScreeningExplainabilityService {
  /**
   * Generates clinically grounded explanation and non-diagnostic disclaimers
   */
  static generateExplanation(
    input: PreparedScreeningInput,
    output: ScreeningEvaluationOutput
  ): ScreeningExplanationResult {
    const guideline = ScreeningGuidelineRegistry.getGuideline(output.guidelineId)
    const citation = guideline?.publicationReference || 'Official Clinical Screening Guideline'

    let headline = ''
    switch (output.eligibilityOutcome) {
      case 'eligible':
        headline = `Meets Guideline Eligibility Criteria for Annual Low-Dose CT Screening (${output.guidelineCode})`
        break
      case 'not_eligible':
        headline = `Does Not Meet Routine Screening Criteria under ${output.guidelineCode}`
        break
      case 'additional_info_required':
        headline = `Eligibility Cannot Be Determined: Additional Clinical Information Required`
        break
      case 'cannot_be_determined':
        headline = `Eligibility Determination Inconclusive under ${output.guidelineCode}`
        break
      case 'guideline_not_approved':
        headline = `Screening Determination Paused by Clinical Governance`
        break
      default:
        headline = `Screening Evaluation Status: ${output.eligibilityOutcome}`
    }

    const clinicalConsiderations: string[] = []

    if (output.eligibilityOutcome === 'eligible') {
      clinicalConsiderations.push(
        'Shared Decision-Making Required: Guidelines recommend a structured shared decision-making discussion prior to ordering Low-Dose CT, reviewing potential benefits, limitations, nodule follow-up protocols, and false-positive rates.',
        'Smoking Cessation Counseling: For active tobacco smokers, screening MUST be paired with evidence-based behavioral and pharmacological smoking cessation interventions.',
        'Quality-Assurance Standards: Low-Dose CT should be performed using standardized low-radiation dose protocols (CTDIvol ≤3.0 mGy for standard-size patients) at accredited imaging centers equipped with structured Lung-RADS reporting.'
      )
    } else if (output.eligibilityOutcome === 'not_eligible') {
      clinicalConsiderations.push(
        'Trial Evidence Base: International randomized trials (NLST, NELSON) established clear net benefit specifically in cohorts meeting the high-risk age and pack-year thresholds. In lower-risk cohorts, radiation exposure, false-positive nodule workups, and procedural complications outweigh early detection benefits.',
        'Longitudinal Monitoring: Individuals approaching the age or pack-year threshold should be reassessed longitudinally during routine health checkups.'
      )
    }

    let symptomWarning: string | null = null
    if (input.derived.hasActiveConcerningSymptoms) {
      symptomWarning = `PRIORITY WARNING: Patient reports active concerning symptoms (${input.derived.concerningSymptomsList.join(
        ', '
      )}). Screening guidelines apply exclusively to asymptomatic individuals. This patient requires prompt clinical diagnostic investigation (e.g. diagnostic contrast-enhanced chest CT or specialist consultation), NOT routine asymptomatic screening.`
    }

    const whatThisMeans =
      output.eligibilityOutcome === 'eligible'
        ? `The individual satisfies the epidemiological criteria (age, cumulative tobacco pack-years, and cessation timing) defined by ${output.guidelineName} for annual Low-Dose CT (LDCT) lung cancer screening.`
        : output.eligibilityOutcome === 'not_eligible'
        ? `The individual does not meet one or more specific inclusion criteria or meets exclusion criteria under ${output.guidelineName} for routine population screening.`
        : output.governanceNotice

    const whatThisDoesNotMean = `1. Screening eligibility is NOT a diagnosis of lung cancer, nor does it imply that cancer is present.
2. Ineligibility for routine screening does NOT mean an individual has zero risk of lung cancer or is immune to pulmonary disease.
3. Screening guidelines apply solely to ASYMPTOMATIC individuals; any active respiratory symptoms (e.g. coughing up blood, unexplained weight loss, new or changing cough) take absolute precedence and mandate diagnostic clinical workup.
4. Algorithmic eligibility determinations do not constitute a prescription, radiology order, or automated clinical directive.
5. All clinical evaluations, imaging requisitions, and shared decision-making counseling remain the sole legal and clinical responsibility of qualified medical practitioners.`

    const missingNotice =
      output.criteriaEvaluations.some((e) => e.status === 'missing')
        ? 'One or more required clinical parameters (e.g. exact smoking cessation year or date of birth) are unverified in the patient health file. Clinician or health-worker verification is required to complete eligibility evaluation.'
        : null

    return {
      headlineOutcome: headline,
      criteriaBreakdown: output.criteriaEvaluations,
      missingInformationImpact: missingNotice,
      clinicalConsiderations,
      whatThisMeans,
      whatThisDoesNotMean,
      guidelineCitation: citation,
      symptomPriorityWarning: symptomWarning,
    }
  }
}


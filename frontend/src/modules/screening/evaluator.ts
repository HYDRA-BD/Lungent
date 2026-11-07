import { ScreeningGuidelineRegistry } from './guideline-registry'
import type {
  PreparedScreeningInput,
  CriterionEvaluationResult,
  ScreeningEvaluationOutput,
  ScreeningEligibilityOutcome,
  ScreeningExecutionStatus,
  RiskExecutionMode,
} from './types'

export class ScreeningEligibilityEvaluator {
  /**
   * Evaluates patient information against a selected screening guideline
   */
  static evaluate(
    input: PreparedScreeningInput,
    guidelineId: string = 'gl-uspstf-2021',
    executionMode: RiskExecutionMode = 'clinical_production'
  ): ScreeningEvaluationOutput {
    const guideline = ScreeningGuidelineRegistry.getGuideline(guidelineId)
    const latestVersion = ScreeningGuidelineRegistry.getLatestVersion(guidelineId)

    if (!guideline || !latestVersion) {
      return {
        guidelineId,
        guidelineCode: 'UNKNOWN',
        guidelineName: 'Unknown Guideline',
        guidelineVersion: 'unknown',
        executionMode,
        executionStatus: 'guideline_not_approved',
        eligibilityOutcome: 'evaluation_unavailable',
        isClinicallyApproved: false,
        isResearchExecution: executionMode === 'research_simulation',
        criteriaEvaluations: [],
        recommendedIntervalMonths: null,
        recommendedModality: null,
        nextRecommendedScreeningDate: null,
        governanceNotice: `Guideline "${guidelineId}" is not registered in the system guideline catalog.`,
        clinicalSummary: 'Screening evaluation unavailable due to missing guideline configuration.',
        limitations: 'Unavailable guideline.',
      }
    }

    // 1. Strict Clinical Governance Safety Gate
    const isApprovedForClinical = ScreeningGuidelineRegistry.isApprovedForClinicalUse(guidelineId, 'BD')

    if (executionMode === 'clinical_production' && !isApprovedForClinical) {
      return {
        guidelineId: guideline.id,
        guidelineCode: guideline.guidelineCode,
        guidelineName: guideline.name,
        guidelineVersion: latestVersion.versionTag,
        executionMode: 'clinical_production',
        executionStatus: 'guideline_not_approved',
        eligibilityOutcome: 'guideline_not_approved',
        isClinicallyApproved: false,
        isResearchExecution: false,
        criteriaEvaluations: [],
        recommendedIntervalMonths: null,
        recommendedModality: null,
        nextRecommendedScreeningDate: null,
        governanceNotice: `Clinical screening evaluation paused: Guideline "${guideline.name}" (${guideline.guidelineCode}) has lifecycle status "${guideline.lifecycleStatus}". It has not received formal signoff by the Clinical Advisory Board for Bangladesh clinical deployment. To uphold clinical safety and avoid unverified imaging orders, automated clinical screening determinations cannot be issued in production care until formal approval is granted.`,
        clinicalSummary: 'Clinical screening eligibility determination is currently paused by Clinical Governance.',
        limitations: guideline.knownLimitations,
      }
    }

    // 2. Input Completeness Check
    if (input.validation.hasBlockingIssues) {
      const missingDescriptions = input.validation.issues.map((i) => i.message)
      return {
        guidelineId: guideline.id,
        guidelineCode: guideline.guidelineCode,
        guidelineName: guideline.name,
        guidelineVersion: latestVersion.versionTag,
        executionMode,
        executionStatus: 'insufficient_information',
        eligibilityOutcome: 'additional_info_required',
        isClinicallyApproved: isApprovedForClinical,
        isResearchExecution: executionMode === 'research_simulation',
        criteriaEvaluations: [],
        recommendedIntervalMonths: null,
        recommendedModality: null,
        nextRecommendedScreeningDate: null,
        governanceNotice: `Evaluation could not proceed due to missing mandatory inputs: ${missingDescriptions.join('; ')}`,
        clinicalSummary: 'Additional clinical information is required before screening eligibility can be determined.',
        limitations: guideline.knownLimitations,
      }
    }

    const d = input.derived
    const evaluations: CriterionEvaluationResult[] = []

    // 3. Criterion Evaluation
    // Criterion A: Age Range
    const ageMet = d.age >= latestVersion.minAge && d.age <= latestVersion.maxAge
    evaluations.push({
      criterionKey: 'age_range',
      criterionLabel: `Age Criterion (${latestVersion.minAge}–${latestVersion.maxAge} years)`,
      criterionRuleDescription: `Individual must be between ${latestVersion.minAge} and ${latestVersion.maxAge} years of age.`,
      requiredValueExpression: `${latestVersion.minAge} <= age <= ${latestVersion.maxAge}`,
      patientActualValue: `${d.age} years`,
      status: ageMet ? 'met' : 'unmet',
      isBlockingExclusion: false,
      clinicalExplanation: ageMet
        ? `Patient age (${d.age} years) falls within the guideline-specified screening window of ${latestVersion.minAge} to ${latestVersion.maxAge} years.`
        : d.age < latestVersion.minAge
        ? `Patient age (${d.age} years) is below the minimum screening threshold of ${latestVersion.minAge} years. Routine screening is not recommended in younger cohorts.`
        : `Patient age (${d.age} years) exceeds the upper guideline boundary of ${latestVersion.maxAge} years. Balance of screening benefit versus procedural harm shifts unfavorably in older cohorts.`,
    })

    // Criterion B: Cumulative Tobacco Pack-Years
    const packYearsMet = d.packYears >= latestVersion.minPackYears
    evaluations.push({
      criterionKey: 'pack_years',
      criterionLabel: `Tobacco Exposure Criterion (≥${latestVersion.minPackYears} pack-years)`,
      criterionRuleDescription: `Individual must have accumulated at least ${latestVersion.minPackYears} pack-years of tobacco smoking.`,
      requiredValueExpression: `pack_years >= ${latestVersion.minPackYears}`,
      patientActualValue: `${d.packYears.toFixed(1)} pack-years`,
      status: packYearsMet ? 'met' : 'unmet',
      isBlockingExclusion: false,
      clinicalExplanation: packYearsMet
        ? `Patient has accumulated ${d.packYears.toFixed(1)} pack-years, meeting the minimum threshold of ${latestVersion.minPackYears} pack-years required for elevated baseline risk.`
        : `Patient cumulative exposure of ${d.packYears.toFixed(1)} pack-years is below the ${latestVersion.minPackYears} pack-year guideline eligibility threshold.`,
    })

    // Criterion C: Smoking Status & Cessation Window
    let smokingMet = false
    let smokingExplanation = ''
    let smokingActual = ''

    if (d.isCurrentSmoker) {
      smokingMet = true
      smokingActual = 'Current active smoker'
      smokingExplanation = 'Patient currently smokes tobacco, satisfying the active smoking eligibility criterion.'
    } else if (d.isFormerSmoker) {
      if (latestVersion.maxQuitYears === null) {
        // e.g. ACS 2023: no quit window limitation
        smokingMet = true
        smokingActual = d.yearsSinceQuit !== null ? `Former smoker (quit ${d.yearsSinceQuit} years ago)` : 'Former smoker'
        smokingExplanation = `Under ${guideline.guidelineCode}, all former smokers with qualifying pack-years remain eligible regardless of years since quit.`
      } else if (d.yearsSinceQuit !== null) {
        smokingActual = `Former smoker (quit ${d.yearsSinceQuit} years ago)`
        if (d.yearsSinceQuit <= latestVersion.maxQuitYears) {
          smokingMet = true
          smokingExplanation = `Patient quit ${d.yearsSinceQuit} years ago, which is within the ${latestVersion.maxQuitYears}-year cessation window permitted by the guideline.`
        } else {
          smokingMet = false
          smokingExplanation = `Patient quit ${d.yearsSinceQuit} years ago, which exceeds the ${latestVersion.maxQuitYears}-year cessation limit under ${guideline.guidelineCode}. Cumulative biological risk attenuates below the trial screening benefit threshold.`
        }
      } else {
        smokingActual = 'Former smoker (cessation date unknown)'
        smokingMet = false
        smokingExplanation = 'Years since cessation could not be determined from the patient health file.'
      }
    } else {
      smokingActual = 'Never-smoker'
      smokingMet = false
      smokingExplanation = 'Never-smoker status. International guidelines do not recommend routine LDCT screening for individuals without significant primary tobacco exposure.'
    }

    evaluations.push({
      criterionKey: 'smoking_status_cessation',
      criterionLabel: latestVersion.maxQuitYears !== null
        ? `Cessation Window Criterion (Current or Quit ≤${latestVersion.maxQuitYears} years)`
        : 'Smoking Status Criterion (Current or Former Smoker)',
      criterionRuleDescription: latestVersion.maxQuitYears !== null
        ? `Current smoker or former smoker who quit ${latestVersion.maxQuitYears} years ago or fewer.`
        : 'Current smoker or former smoker regardless of cessation duration.',
      requiredValueExpression: latestVersion.maxQuitYears !== null
        ? `is_current_smoker OR (is_former_smoker AND quit_years <= ${latestVersion.maxQuitYears})`
        : 'is_current_smoker OR is_former_smoker',
      patientActualValue: smokingActual,
      status: smokingMet ? 'met' : d.isFormerSmoker && d.yearsSinceQuit === null ? 'missing' : 'unmet',
      isBlockingExclusion: false,
      clinicalExplanation: smokingExplanation,
    })

    // Criterion D: Asymptomatic Status (Mandatory CDSS Rule)
    const isAsymptomatic = !d.hasActiveConcerningSymptoms
    evaluations.push({
      criterionKey: 'asymptomatic_status',
      criterionLabel: 'Asymptomatic Status (Absence of Active Concerning Symptoms)',
      criterionRuleDescription: 'Patient must be asymptomatic. Active red-flag symptoms require urgent diagnostic workup, NOT routine preventive screening.',
      requiredValueExpression: 'has_active_concerning_symptoms == false',
      patientActualValue: isAsymptomatic
        ? 'Asymptomatic (No red-flag symptoms)'
        : `Symptomatic: ${d.concerningSymptomsList.join(', ')}`,
      status: isAsymptomatic ? 'met' : 'unmet',
      isBlockingExclusion: !isAsymptomatic,
      clinicalExplanation: isAsymptomatic
        ? 'No active red-flag respiratory symptoms reported. The patient is suitable for preventive asymptomatic screening pathway evaluation.'
        : `CRITICAL CLINICAL ALERT: Patient exhibits concerning symptoms (${d.concerningSymptomsList.join(', ')}). Screening eligibility applies exclusively to asymptomatic individuals. Symptomatic presentation mandates immediate clinical triage and diagnostic chest imaging (CT thorax with contrast or clinical referral), not routine screening.`,
    })

    // Criterion E: Curative Intervention Candidacy & Life Expectancy
    const hasSurgicalEligibility = !d.hasCurativeSurgeryContraindications
    evaluations.push({
      criterionKey: 'curative_candidacy',
      criterionLabel: 'Curative Treatment Candidacy & Life Expectancy',
      criterionRuleDescription: 'No severe comorbid contraindications that would substantially limit life expectancy or preclude curative thoracic surgery if cancer is identified.',
      requiredValueExpression: 'has_severe_life_limiting_contraindications == false',
      patientActualValue: hasSurgicalEligibility
        ? 'Candidate for curative management'
        : `Contraindications noted: ${d.contraindicationsList.join(', ')}`,
      status: hasSurgicalEligibility ? 'met' : 'unmet',
      isBlockingExclusion: !hasSurgicalEligibility,
      clinicalExplanation: hasSurgicalEligibility
        ? 'No documentation of terminal organ failure or contraindications to definitive lung cancer curative management.'
        : `Patient has documented severe comorbid conditions (${d.contraindicationsList.join(', ')}). Screening is not indicated if an individual is unable or unwilling to undergo curative pulmonary resection if a malignant nodule is detected.`,
    })

    // 4. Overall Outcome Determination
    let outcome: ScreeningEligibilityOutcome
    let execStatus: ScreeningExecutionStatus
    let summary: string

    if (!isAsymptomatic) {
      outcome = 'not_eligible'
      execStatus = 'excluded'
      summary = `Ineligible for routine screening due to active concerning respiratory symptoms (${d.concerningSymptomsList.join(', ')}). Requires immediate diagnostic triage rather than preventive screening.`
    } else if (!hasSurgicalEligibility) {
      outcome = 'not_eligible'
      execStatus = 'excluded'
      summary = 'Ineligible for routine screening due to severe comorbid contraindications precluding curative thoracic surgery.'
    } else if (evaluations.some((e) => e.status === 'missing')) {
      outcome = 'additional_info_required'
      execStatus = 'insufficient_information'
      summary = 'Eligibility cannot be fully determined; critical cessation or demographic parameters are unverified.'
    } else if (evaluations.every((e) => e.status === 'met')) {
      outcome = 'eligible'
      execStatus = 'completed'
      summary = `Eligible for lung cancer screening under ${guideline.name}. Meets all criteria: age ${d.age} (window ${latestVersion.minAge}–${latestVersion.maxAge}), ${d.packYears.toFixed(1)} pack-years (threshold ≥${latestVersion.minPackYears}), and qualifying smoking status.`
    } else {
      outcome = 'not_eligible'
      execStatus = 'completed'
      const unmet = evaluations.filter((e) => e.status === 'unmet').map((e) => e.criterionLabel)
      summary = `Not eligible for lung cancer screening under ${guideline.name}. Unmet criteria: ${unmet.join('; ')}.`
    }

    const nextScreeningDate =
      outcome === 'eligible'
        ? new Date(Date.now() + guideline.screeningIntervalMonths * 30.5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10)
        : null

    return {
      guidelineId: guideline.id,
      guidelineCode: guideline.guidelineCode,
      guidelineName: guideline.name,
      guidelineVersion: latestVersion.versionTag,
      executionMode,
      executionStatus: execStatus,
      eligibilityOutcome: outcome,
      isClinicallyApproved: isApprovedForClinical,
      isResearchExecution: executionMode === 'research_simulation',
      criteriaEvaluations: evaluations,
      recommendedIntervalMonths: outcome === 'eligible' ? guideline.screeningIntervalMonths : null,
      recommendedModality: outcome === 'eligible' ? guideline.recommendedModality : null,
      nextRecommendedScreeningDate: nextScreeningDate,
      governanceNotice:
        executionMode === 'research_simulation'
          ? 'RESEARCH SIMULATION ONLY: This evaluation was executed in research/investigational mode and cannot be used for clinical decision-making or imaging orders.'
          : 'Clinical decision-support evaluation under authorized clinical guidelines.',
      clinicalSummary: summary,
      limitations: guideline.knownLimitations,
    }
  }
}

/**
 * Phase 1.14: Symptom-Based Clinical Triage Engine - Evaluator
 * 
 * Clinical Safety Guarantees:
 * 1. Clinical Governance Gate: Unapproved protocols halt execution in production mode.
 * 2. Independence from Risk & Screening: Low risk scores or screening ineligibility NEVER suppress red-flag alerts!
 * 3. Never treat unanswered/missing questions as negative responses.
 * 4. Concerning symptoms trigger immediate emergency or urgent escalation pathways.
 */

import { SymptomTriageProtocolRegistry } from './protocol-registry'
import type {
  PreparedTriageInput,
  TriageCriterionEvaluationResult,
  TriageEvaluationOutput,
  TriageUrgencyLevel,
  TriageExecutionStatus,
} from './types'

export class SymptomTriageEvaluator {
  static evaluate(
    input: PreparedTriageInput,
    protocolId: string = 'proto-nice-ng12-2023',
    executionMode: 'clinical_production' | 'research_simulation' | 'validation_audit' = 'clinical_production'
  ): TriageEvaluationOutput {
    const protocol = SymptomTriageProtocolRegistry.getProtocolById(protocolId)
    if (!protocol) {
      throw new Error(`Symptom triage protocol "${protocolId}" is not registered in the system.`)
    }

    const latestVersion = SymptomTriageProtocolRegistry.getLatestVersion(protocol.id)
    if (!latestVersion) {
      throw new Error(`Protocol "${protocol.protocolCode}" has no registered active version specifications.`)
    }

    const timestamp = new Date().toISOString()

    // 1. MANDATORY CLINICAL GOVERNANCE SAFETY GATE
    // In clinical_production mode, protocols not formally approved for Bangladesh cannot generate operational outcomes.
    if (executionMode === 'clinical_production' && !protocol.approvedForBangladesh) {
      const governanceNotice = `Clinical Triage Evaluation Paused: Protocol "${protocol.name}" (${protocol.protocolCode}) has lifecycle status "${protocol.lifecycleStatus}". It has not received formal sign-off by the Clinical Advisory Board for routine clinical deployment in Bangladesh. To uphold clinical safety and avoid uncalibrated clinical escalations, automated clinical triage determinations cannot be issued in production care until formal approval is granted. Refusal Code: PROTOCOL_NOT_APPROVED_FOR_BANGLADESH.`

      return {
        protocolId: protocol.id,
        protocolCode: protocol.protocolCode,
        protocolName: protocol.name,
        protocolVersion: latestVersion.versionTag,
        executionMode: 'clinical_production',
        executionStatus: 'protocol_not_approved',
        urgencyLevel: 'protocol_not_approved',
        isClinicallyApproved: false,
        isResearchExecution: false,
        recommendedEscalationPathway: 'Operational triage determination paused by Clinical Governance. Direct clinical evaluation by an authorized physician is required.',
        recommendedTimeframeDays: null,
        governanceNotice,
        clinicalSummary: `Evaluation paused: Guideline "${protocol.protocolCode}" is not approved for routine clinical deployment in Bangladesh.`,
        criteriaEvaluations: [],
        redFlagCount: 0,
        urgentCriteriaCount: 0,
        missingCriticalParameters: [],
        inputSnapshotHash: input.snapshotHash,
        timestamp,
      }
    }

    // 2. INPUT COMPLETENESS & DATA INTEGRITY CHECK
    const s = input.symptoms
    const ctx = input.context

    // Check if user answered literally zero symptom questions
    const allSymptoms = Object.values(s)
    const hasAnyReportedData = allSymptoms.some((item) => item && item.status !== 'not_reported')

    if (!hasAnyReportedData) {
      return {
        protocolId: protocol.id,
        protocolCode: protocol.protocolCode,
        protocolName: protocol.name,
        protocolVersion: latestVersion.versionTag,
        executionMode,
        executionStatus: 'insufficient_information',
        urgencyLevel: 'triage_incomplete',
        isClinicallyApproved: protocol.approvedForBangladesh,
        isResearchExecution: executionMode === 'research_simulation',
        recommendedEscalationPathway: 'Complete symptom assessment questionnaire before determining clinical triage urgency.',
        recommendedTimeframeDays: null,
        governanceNotice: 'Assessment Incomplete: No symptom responses were recorded.',
        clinicalSummary: 'Triage cannot be executed because symptom questions were not answered.',
        criteriaEvaluations: [],
        redFlagCount: 0,
        urgentCriteriaCount: 0,
        missingCriticalParameters: ['All symptom questionnaire items'],
        inputSnapshotHash: input.snapshotHash,
        timestamp,
      }
    }

    // 3. DETERMINISTIC CLINICAL CRITERIA EVALUATION
    const evaluations: TriageCriterionEvaluationResult[] = []
    let hasEmergency = false
    let hasUrgent = false
    let hasPrompt = false
    let redFlagCount = 0
    let urgentCriteriaCount = 0
    const missingParams: string[] = []

    const isSmoker = ctx.smokingStatus === 'current' || ctx.smokingStatus === 'former'
    const isSmokerOrBiomass = isSmoker || ctx.hasBiomassExposure

    // --- Emergency Criterion 1: Acute Airway Obstruction / Stridor / SVCO / Massive Hemoptysis ---
    const isMassiveHemoptysis = s.hemoptysis?.status === 'present' && s.hemoptysis.isMassive === true
    const isStridor = s.stridor?.status === 'present'
    const isSvco = s.svcoSigns?.status === 'present'
    const isLifeThreateningDyspnea = s.dyspnea?.status === 'present' && s.dyspnea.severity === 'life_threatening'

    const emergencyMet = isMassiveHemoptysis || isStridor || isSvco || isLifeThreateningDyspnea

    if (emergencyMet) {
      hasEmergency = true
      redFlagCount++
    }

    const emergencyDetails: string[] = []
    if (isMassiveHemoptysis) emergencyDetails.push('Massive hemoptysis (>100mL blood in sputum)')
    if (isStridor) emergencyDetails.push('Acute inspiratory stridor (airway compromise)')
    if (isSvco) emergencyDetails.push('Signs of superior vena cava obstruction (facial edema, venous distension)')
    if (isLifeThreateningDyspnea) emergencyDetails.push('Severe life-threatening respiratory distress')

    evaluations.push({
      criterionKey: 'emergency_airway_vascular_compromise',
      criterionLabel: 'Emergency Airway, Hemorrhage, or Vascular Compromise',
      criterionRuleDescription: 'Patient presents with massive hemoptysis, acute stridor, severe acute respiratory distress, or superior vena cava obstruction signs.',
      patientActualValue: emergencyMet ? emergencyDetails.join('; ') : 'No emergency airway or vascular signs reported',
      status: emergencyMet ? 'met' : s.stridor?.status === 'unknown' || s.hemoptysis?.status === 'unknown' ? 'missing' : 'unmet',
      isRedFlag: true,
      clinicalExplanation: emergencyMet
        ? `CRITICAL EMERGENCY ALERT: Patient reports acute life-threatening features (${emergencyDetails.join(', ')}). Immediate emergency resuscitation and urgent thoracic/ICU intervention required.`
        : 'No acute emergency airway or vascular compromise reported.',
    })

    // --- Urgent Criterion 2: Hemoptysis in Patients Aged >= 40 (or >= 35) ---
    const ageThreshold = protocol.protocolCode.includes('NIDCH') ? 35 : 40
    const hasHemoptysis = s.hemoptysis?.status === 'present'
    const hemoptysisUnknown =
      !s.hemoptysis ||
      s.hemoptysis.status === 'unknown' ||
      s.hemoptysis.status === 'not_reported' ||
      s.hemoptysis.status === 'unable_to_assess'

    const urgentHemoptysisMet = hasHemoptysis && ctx.age >= ageThreshold

    if (urgentHemoptysisMet) {
      hasUrgent = true
      redFlagCount++
      urgentCriteriaCount++
    }

    evaluations.push({
      criterionKey: 'urgent_hemoptysis_age_threshold',
      criterionLabel: `Unexplained Hemoptysis in Adults (Age ≥${ageThreshold} years)`,
      criterionRuleDescription: `Any unexplained coughing of blood in patients aged ≥${ageThreshold} years mandates urgent 2-week diagnostic evaluation for pulmonary malignancy or active tuberculosis.`,
      patientActualValue: hasHemoptysis
        ? `Hemoptysis present (Age: ${ctx.age} yrs, Duration: ${s.hemoptysis?.durationWeeks || '<1'} wks)`
        : hemoptysisUnknown
        ? 'Hemoptysis status unknown / not reported'
        : 'No hemoptysis reported',
      status: urgentHemoptysisMet ? 'met' : hemoptysisUnknown ? 'missing' : 'unmet',
      isRedFlag: true,
      clinicalExplanation: urgentHemoptysisMet
        ? `Patient is ${ctx.age} years old and reports active hemoptysis. Under ${protocol.protocolCode}, unexplained hemoptysis in this age cohort mandates urgent diagnostic evaluation (CT thorax and pulmonology consultation within 14 days).`
        : hasHemoptysis
        ? `Patient reports hemoptysis at age ${ctx.age} (below protocol age threshold of ${ageThreshold}), but coughing up blood is an abnormal red flag requiring prompt diagnostic investigation.`
        : hemoptysisUnknown
        ? 'Hemoptysis response is unknown or unverified in the patient file.'
        : 'Patient reports absence of hemoptysis.',
    })

    // --- Urgent Criterion 3: Constitutional Syndrome in High-Risk Cohort ---
    const hasWeightLoss = s.unexplainedWeightLoss?.status === 'present'
    const weightLossUnknown =
      !s.unexplainedWeightLoss ||
      s.unexplainedWeightLoss.status === 'unknown' ||
      s.unexplainedWeightLoss.status === 'not_reported' ||
      s.unexplainedWeightLoss.status === 'unable_to_assess'
    const hasAppetiteLoss = s.appetiteLoss?.status === 'present'
    const hasConstitutionalSymptom = hasWeightLoss || hasAppetiteLoss
    const hasAssociatedRespSymptom =
      s.cough?.status === 'present' || s.dyspnea?.status === 'present' || s.fatigue?.status === 'present'

    const constitutionalMet =
      ctx.age >= ageThreshold && isSmokerOrBiomass && hasConstitutionalSymptom && hasAssociatedRespSymptom

    if (constitutionalMet) {
      hasUrgent = true
      redFlagCount++
      urgentCriteriaCount++
    }

    evaluations.push({
      criterionKey: 'urgent_constitutional_syndrome_high_risk',
      criterionLabel: 'Constitutional Syndrome (Weight Loss / Anorexia) with Respiratory Symptoms',
      criterionRuleDescription: `Unexplained weight loss or appetite loss accompanied by cough, dyspnea, or fatigue in a patient aged ≥${ageThreshold} with smoking or biomass exposure history.`,
      patientActualValue: constitutionalMet
        ? `Weight loss: ${hasWeightLoss ? 'Present' : 'None'}, Appetite loss: ${hasAppetiteLoss ? 'Present' : 'None'}, Smoking: ${ctx.smokingStatus}, Biomass: ${ctx.hasBiomassExposure ? 'Yes' : 'No'}`
        : 'Criteria not satisfied',
      status: constitutionalMet ? 'met' : weightLossUnknown ? 'missing' : 'unmet',
      isRedFlag: true,
      clinicalExplanation: constitutionalMet
        ? `Patient exhibits systemic constitutional wasting combined with respiratory complaints in the setting of tobacco/biomass exposure. Mandates urgent diagnostic workup for pulmonary neoplasm, chronic infection, or tuberculosis.`
        : 'No combined constitutional wasting and chronic respiratory symptoms detected in high-risk context.',
    })

    // --- Urgent Criterion 4: Persistent or Changing Cough (>3 Weeks) in Smoker (Age >= 40) ---
    const coughDuration = s.cough?.durationWeeks ?? 0
    const coughUnknown =
      !s.cough ||
      s.cough.status === 'unknown' ||
      s.cough.status === 'not_reported' ||
      s.cough.status === 'unable_to_assess'
    const hasCoughPersistent = s.cough?.status === 'present' && coughDuration >= 3
    const hasCoughChange = s.coughChanges?.status === 'present'

    const persistentCoughSmokerMet = ctx.age >= ageThreshold && isSmoker && (hasCoughPersistent || hasCoughChange)

    if (persistentCoughSmokerMet) {
      hasUrgent = true
      urgentCriteriaCount++
    }

    evaluations.push({
      criterionKey: 'urgent_persistent_or_changing_cough_smoker',
      criterionLabel: `Persistent or Changing Cough (>3 Weeks) in Smoker (Age ≥${ageThreshold})`,
      criterionRuleDescription: `Unexplained cough lasting ≥3 weeks or a change in preexisting chronic smoker cough in individuals aged ≥${ageThreshold}.`,
      patientActualValue: s.cough?.status === 'present'
        ? `Cough present (Duration: ${coughDuration} wks, Changes: ${hasCoughChange ? 'Yes' : 'No'}, Smoking: ${ctx.smokingStatus})`
        : coughUnknown
        ? 'Cough status unknown / not reported'
        : 'Cough absent',
      status: persistentCoughSmokerMet ? 'met' : coughUnknown ? 'missing' : 'unmet',
      isRedFlag: false,
      clinicalExplanation: persistentCoughSmokerMet
        ? `Patient is a ${ctx.smokingStatus} smoker aged ${ctx.age} with persistent or changing cough lasting ${coughDuration} weeks. Requires urgent chest radiography and diagnostic follow-up.`
        : 'Persistent or changing cough in smoker age threshold not met.',
    })

    // --- Urgent Criterion 5: Persistent Hoarseness, Cervical Lymphadenopathy, or Finger Clubbing ---
    const hoarsenessDuration = s.hoarseness?.durationWeeks ?? 0
    const hoarsenessUnknown =
      !s.hoarseness ||
      s.hoarseness.status === 'unknown' ||
      s.hoarseness.status === 'not_reported' ||
      s.hoarseness.status === 'unable_to_assess'
    const hasPersistentHoarseness = s.hoarseness?.status === 'present' && hoarsenessDuration >= 3
    const hasLymphadenopathy = s.cervicalLymphadenopathy?.status === 'present'
    const hasClubbing = s.fingerClubbing?.status === 'present'

    const hoarsenessClubbingMet = hasPersistentHoarseness || hasLymphadenopathy || hasClubbing

    if (hoarsenessClubbingMet) {
      hasUrgent = true
      redFlagCount++
      urgentCriteriaCount++
    }

    evaluations.push({
      criterionKey: 'urgent_hoarseness_lymphadenopathy_clubbing',
      criterionLabel: 'Persistent Hoarseness (>3 Weeks), Lymphadenopathy, or Finger Clubbing',
      criterionRuleDescription: 'Hoarseness persisting >3 weeks, supraclavicular/cervical lymph node enlargement, or newly documented digital clubbing.',
      patientActualValue: hoarsenessClubbingMet
        ? `Hoarseness: ${hasPersistentHoarseness ? `${hoarsenessDuration} wks` : 'No'}, Lymphadenopathy: ${hasLymphadenopathy ? 'Yes' : 'No'}, Clubbing: ${hasClubbing ? 'Yes' : 'No'}`
        : 'None detected',
      status: hoarsenessClubbingMet ? 'met' : hoarsenessUnknown ? 'missing' : 'unmet',
      isRedFlag: true,
      clinicalExplanation: hoarsenessClubbingMet
        ? 'Physical signs or laryngeal symptoms concerning for recurrent laryngeal nerve involvement, regional lymphatic spread, or paraneoplastic hypertrophic pulmonary osteoarthropathy.'
        : 'No persistent hoarseness, palpable cervical adenopathy, or digital clubbing reported.',
    })

    // --- Prompt Criterion 6: Persistent Cough in Non-Smoker or Recurrent Infections ---
    const hasRecurrentInfections = s.recurrentChestInfections?.status === 'present'
    const promptCoughMet = s.cough?.status === 'present' && coughDuration >= 3 && !isSmoker
    const promptMet = (promptCoughMet || hasRecurrentInfections) && !hasEmergency && !hasUrgent

    if (promptMet) {
      hasPrompt = true
    }

    evaluations.push({
      criterionKey: 'prompt_persistent_cough_recurrent_infection',
      criterionLabel: 'Persistent Cough (>3 Weeks) in Non-Smoker or Recurrent Infections',
      criterionRuleDescription: 'Unexplained cough persisting >3 weeks in a non-smoker or recurrent non-resolving lower respiratory tract infections.',
      patientActualValue: `Cough: ${coughDuration} wks (Smoking: ${ctx.smokingStatus}), Recurrent infections: ${hasRecurrentInfections ? 'Yes' : 'No'}`,
      status: promptMet ? 'met' : 'unmet',
      isRedFlag: false,
      clinicalExplanation: promptMet
        ? 'Persistent respiratory symptoms warranting non-urgent prompt outpatient review and chest imaging within 4 weeks.'
        : 'Does not qualify for isolated prompt review tier.',
    })

    // Missing critical parameters detection
    if (s.hemoptysis?.status === 'unknown' || s.hemoptysis?.status === 'not_reported') {
      missingParams.push('Hemoptysis presence/absence')
    }
    if (s.cough?.status === 'present' && s.cough.durationWeeks == null) {
      missingParams.push('Exact duration of cough in weeks')
    }

    // 4. OVERALL URGENCIES & ESCALATION DETERMINATION
    let urgencyLevel: TriageUrgencyLevel = 'routine_review'
    let executionStatus: TriageExecutionStatus = 'completed'
    let recommendedPathway = ''
    let timeframeDays: number | null = null
    let clinicalSummary = ''

    if (hasEmergency) {
      urgencyLevel = 'emergency_escalation'
      executionStatus = 'emergency_detected'
      timeframeDays = 0
      recommendedPathway =
        'Immediate Emergency Escalation: Immediate transfer to emergency medical department / acute respiratory unit. Urgent airway assessment, rigid bronchoscopy, or vascular intervention as indicated.'
      clinicalSummary = `CRITICAL EMERGENCY ALERT: Patient reports acute airway or vascular red-flags (${emergencyDetails.join(', ')}). Immediate emergency escalation required.`
    } else if (hasUrgent) {
      urgencyLevel = 'urgent_assessment'
      executionStatus = 'escalation_required'
      timeframeDays = 14
      recommendedPathway =
        'Urgent 2-Week Diagnostic Assessment: Contrast-enhanced chest CT (or urgent chest radiography within 48 hours), sputum microbiology/GeneXpert, and rapid pulmonology referral within 14 days.'
      clinicalSummary = `URGENT CLINICAL TRIAGE: Patient satisfies ${urgentCriteriaCount} high-risk red-flag criteria under ${protocol.protocolCode}. Urgent diagnostic thoracic evaluation within 14 days is required.`
    } else if (hasPrompt) {
      urgencyLevel = 'prompt_review'
      executionStatus = 'criteria_met'
      timeframeDays = 28
      recommendedPathway =
        'Prompt Clinical Review (within 4 weeks): Baseline chest radiograph, spirometry, and outpatient pulmonary or general medicine review.'
      clinicalSummary = `PROMPT REVIEW: Subacute persistent cough or recurrent infections present. Outpatient clinical review recommended within 4 weeks.`
    } else {
      urgencyLevel = 'routine_review'
      executionStatus = 'completed'
      timeframeDays = null
      recommendedPathway =
        'Routine Primary Care Review: Symptom monitoring and primary care consultation if symptoms persist beyond 3 weeks or new warning signs develop.'
      clinicalSummary = 'ROUTINE CARE: No emergency or urgent red-flag criteria identified. Routine primary care follow-up indicated.'
    }

    return {
      protocolId: protocol.id,
      protocolCode: protocol.protocolCode,
      protocolName: protocol.name,
      protocolVersion: latestVersion.versionTag,
      executionMode,
      executionStatus,
      urgencyLevel,
      isClinicallyApproved: protocol.approvedForBangladesh,
      isResearchExecution: executionMode === 'research_simulation',
      recommendedEscalationPathway: recommendedPathway,
      recommendedTimeframeDays: timeframeDays,
      governanceNotice: executionMode === 'research_simulation'
        ? 'Research & Validation Simulation: This triage determination was generated under research simulation mode for analytical benchmarking. It is strictly investigational and must not be used as an autonomous medical order or prescription.'
        : 'Clinical Production Execution: Protocol evaluated under governed clinical criteria.',
      clinicalSummary,
      criteriaEvaluations: evaluations,
      redFlagCount,
      urgentCriteriaCount,
      missingCriticalParameters: missingParams,
      inputSnapshotHash: input.snapshotHash,
      timestamp,
    }
  }
}

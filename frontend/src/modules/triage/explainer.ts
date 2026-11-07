/**
 * Phase 1.14: Symptom-Based Clinical Triage Engine - Explainability Service
 * 
 * Generates transparent, human-readable clinical explanations, criteria breakdowns,
 * urgency badges, and mandatory non-diagnostic clinical safety disclaimers.
 */

import type {
  PreparedTriageInput,
  TriageEvaluationOutput,
  TriageExplanationResult,
} from './types'

export class SymptomTriageExplainabilityService {
  static generateExplanation(
    input: PreparedTriageInput,
    output: TriageEvaluationOutput
  ): TriageExplanationResult {
    const s = input.symptoms
    const triggeringSymptoms: string[] = []

    if (s.hemoptysis?.status === 'present') {
      triggeringSymptoms.push(
        `Hemoptysis (Coughing blood)${s.hemoptysis.isMassive ? ' - MASSIVE' : ''} for ${s.hemoptysis.durationWeeks || '<1'} weeks`
      )
    }
    if (s.stridor?.status === 'present') {
      triggeringSymptoms.push('Acute inspiratory stridor (airway compromise)')
    }
    if (s.svcoSigns?.status === 'present') {
      triggeringSymptoms.push('Superior vena cava obstruction signs (facial edema, venous engorgement)')
    }
    if (s.unexplainedWeightLoss?.status === 'present') {
      triggeringSymptoms.push(
        `Unexplained weight loss (${s.unexplainedWeightLoss.percentageLoss ? `${s.unexplainedWeightLoss.percentageLoss}% loss` : 'Significant'})`
      )
    }
    if (s.appetiteLoss?.status === 'present') {
      triggeringSymptoms.push('Reduced appetite / anorexia')
    }
    if (s.cough?.status === 'present') {
      triggeringSymptoms.push(`Persistent cough lasting ${s.cough.durationWeeks || 0} weeks`)
    }
    if (s.coughChanges?.status === 'present') {
      triggeringSymptoms.push('Change in preexisting chronic smoker cough')
    }
    if (s.hoarseness?.status === 'present') {
      triggeringSymptoms.push(`Persistent hoarseness lasting ${s.hoarseness.durationWeeks || 0} weeks`)
    }
    if (s.dyspnea?.status === 'present') {
      triggeringSymptoms.push(`Shortness of breath (mMRC Grade ${s.dyspnea.mMRCGrade ?? 'Unspecified'})`)
    }
    if (s.cervicalLymphadenopathy?.status === 'present') {
      triggeringSymptoms.push('Enlarged cervical or supraclavicular lymph nodes')
    }
    if (s.fingerClubbing?.status === 'present') {
      triggeringSymptoms.push('Digital finger clubbing')
    }
    if (s.recurrentChestInfections?.status === 'present') {
      triggeringSymptoms.push('Recurrent or non-resolving lower respiratory infections')
    }

    // Headline and Urgency Badge Configuration
    let headline = ''
    let badgeColor: 'red' | 'amber' | 'blue' | 'green' | 'gray' = 'gray'
    let badgeLabel = ''
    let badgeTimeframe = ''
    let emergencyWarning: string | null = null

    switch (output.urgencyLevel) {
      case 'emergency_escalation':
        headline = 'Emergency Clinical Escalation: Immediate Resuscitation / Airway Assessment Required'
        badgeColor = 'red'
        badgeLabel = 'Emergency Tier'
        badgeTimeframe = 'Immediate (Same Day)'
        emergencyWarning =
          'CRITICAL EMERGENCY ALERT: Patient reports acute life-threatening respiratory symptoms (such as acute stridor or massive hemoptysis). Immediate emergency transfer to a hospital with respiratory resuscitation, rigid bronchoscopy, and ICU capabilities is mandatory. If acute distress is present, call local emergency services immediately.'
        break

      case 'urgent_assessment':
        headline = 'Urgent Clinical Assessment: 2-Week Diagnostic Workup Pathway'
        badgeColor = 'amber'
        badgeLabel = 'Urgent 2-Week Tier'
        badgeTimeframe = 'Within 14 Days'
        emergencyWarning =
          'URGENT CLINICAL ALERT: Patient satisfies high-risk red-flag criteria (e.g. hemoptysis, constitutional syndrome, or persistent cough in smoker). Urgent contrast-enhanced chest CT and rapid specialist pulmonology consultation within 14 days is clinically required.'
        break

      case 'prompt_review':
        headline = 'Prompt Clinical Review: Outpatient Evaluation Recommended'
        badgeColor = 'blue'
        badgeLabel = 'Prompt Outpatient Review'
        badgeTimeframe = 'Within 4 Weeks'
        break

      case 'routine_review':
        headline = 'Routine Primary Care Review: Standard Symptom Monitoring'
        badgeColor = 'green'
        badgeLabel = 'Routine Review Tier'
        badgeTimeframe = 'Routine Follow-Up'
        break

      case 'protocol_not_approved':
        headline = 'Clinical Triage Paused: Guideline Awaiting Formal Approval'
        badgeColor = 'gray'
        badgeLabel = 'Governance Paused'
        badgeTimeframe = 'Clinician Discretion'
        break

      default:
        headline = 'Clinical Triage Incomplete: Additional Information Required'
        badgeColor = 'gray'
        badgeLabel = 'Incomplete'
        badgeTimeframe = 'Action Required'
        break
    }

    // Clinical considerations
    const clinicalConsiderations: string[] = [
      'Diagnostic Chest Imaging: For patients qualifying for urgent or emergency escalation, contrast-enhanced computed tomography (CECT) of the chest is the diagnostic modality of choice to evaluate bronchial mucosal lesions, parenchymal masses, and mediastinal adenopathy.',
      'Bangladesh Differential Consideration (TB vs Malignancy): In Bangladesh and high-burden LMIC settings, constitutional symptoms (weight loss, chronic cough, fatigue) mandate concurrent GeneXpert MTB/RIF and sputum acid-fast bacilli (AFB) testing to exclude active pulmonary tuberculosis alongside oncologic evaluation.',
      'Independence from Screening & Risk: Crucial clinical rule: Low calculated lung cancer risk (e.g. PLCOm2012 < 1.5%) or ineligibility for LDCT screening does NOT diminish the urgency of symptomatic presentation. Red-flag symptoms take absolute precedence over predictive scores.',
    ]

    if (input.context.smokingStatus === 'current') {
      clinicalConsiderations.push(
        'Smoking Cessation Counseling: Active tobacco use significantly compounds pulmonary pathology. Structured cessation pharmacotherapy and behavioral support must be provided alongside diagnostic triage.'
      )
    }

    const whatThisMeans =
      output.executionStatus === 'protocol_not_approved'
        ? output.governanceNotice
        : output.urgencyLevel === 'emergency_escalation'
        ? `The individual exhibits critical warning signs that require same-day emergency hospital assessment to preserve airway patency and hemodynamics.`
        : output.urgencyLevel === 'urgent_assessment'
        ? `The individual satisfies clinical criteria under ${output.protocolName} for an urgent 2-week diagnostic pathway to rule out serious pulmonary malignancy or chronic infection.`
        : output.urgencyLevel === 'prompt_review'
        ? `The individual presents with subacute respiratory complaints (such as cough >3 weeks) warranting non-emergency outpatient review and chest radiography within 4 weeks.`
        : `No red-flag or acute criteria were detected. Routine primary care follow-up is appropriate unless symptoms worsen.`

    const whatThisDoesNotMean = `1. Symptom-based triage is NOT a diagnosis of lung cancer, nor does it confirm the presence of cancer. Many benign and infectious conditions (including tuberculosis, bronchiectasis, pneumonia, and COPD exacerbations) present with identical symptoms.
2. A routine review tier or absence of red-flag symptoms does NOT guarantee that serious pulmonary pathology is absent. Any new or worsening respiratory symptom requires clinical reevaluation.
3. A low calculated lung cancer risk score or ineligibility for routine LDCT screening does NOT mean symptoms can be dismissed; active symptoms take absolute precedence over screening criteria.
4. Algorithmic triage determinations do not constitute a prescription, radiology order, or automated clinical directive.
5. All clinical escalation decisions, emergency referrals, and diagnostic requisitions remain the sole legal and clinical responsibility of qualified medical practitioners.`

    const missingNotice =
      output.missingCriticalParameters.length > 0
        ? `Incomplete data: The following parameters are unverified: ${output.missingCriticalParameters.join(
            ', '
          )}. Clinician verification is required.`
        : null

    const citation = `${output.protocolName} (${output.protocolCode}) v${output.protocolVersion}. Evaluated: ${output.timestamp.slice(
      0,
      10
    )}.`

    return {
      headlineOutcome: headline,
      urgencyBadge: {
        label: badgeLabel,
        color: badgeColor,
        timeframe: badgeTimeframe,
      },
      triggeringSymptomsSummary: triggeringSymptoms,
      criteriaBreakdown: output.criteriaEvaluations,
      missingInformationImpact: missingNotice,
      clinicalConsiderations,
      whatThisMeans,
      whatThisDoesNotMean,
      protocolCitation: citation,
      emergencyWarningNotice: emergencyWarning,
    }
  }
}

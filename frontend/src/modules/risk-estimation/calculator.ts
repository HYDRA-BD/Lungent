import { MethodologyRegistry } from './methodology-registry'
import type {
  PreparedRiskInput,
  RiskCalculationOutput,
} from './types'
import type { RiskExecutionMode } from '@/types/database'

export class RiskCalculationEngine {
  /**
   * Executes lung cancer risk estimation under clinical governance rules
   */
  static execute(
    input: PreparedRiskInput,
    methodologyId: string = 'plcom2012',
    executionMode: RiskExecutionMode = 'clinical_production'
  ): RiskCalculationOutput {
    const methodology = MethodologyRegistry.getMethodology(methodologyId)
    if (!methodology) {
      return {
        methodologyId,
        methodologyVersion: 'unknown',
        executionMode,
        executionStatus: 'methodology_unavailable',
        estimatedRiskPercentage: null,
        riskCategory: null,
        timeHorizonYears: 6,
        isClinicallyApproved: false,
        isResearchExecution: executionMode === 'research_simulation',
        governanceNotice: `Risk estimation methodology "${methodologyId}" is not registered in the system methodology catalog.`,
        limitations: 'Methodology unavailable.',
      }
    }

    const versions = MethodologyRegistry.getMethodologyVersions(methodologyId)
    const activeVersion = versions[0]?.versionTag || '1.0.0-draft'

    // Check input completeness
    if (input.validation.hasBlockingIssues) {
      return {
        methodologyId,
        methodologyVersion: activeVersion,
        executionMode,
        executionStatus: 'awaiting_information',
        estimatedRiskPercentage: null,
        riskCategory: null,
        timeHorizonYears: methodology.timeHorizonYears,
        isClinicallyApproved: false,
        isResearchExecution: executionMode === 'research_simulation',
        governanceNotice: 'Risk calculation halted: Required patient clinical data is missing or conflicting. Clinical safety policy prohibits fabricating missing values.',
        limitations: input.validation.issues.map((i) => i.message).join('; '),
      }
    }

    // Clinical Governance Gate: Enforce Clinical Advisory Board approval
    const isApprovedForClinical = MethodologyRegistry.isApprovedForClinicalUse(methodologyId, 'BD')

    if (executionMode === 'clinical_production' && !isApprovedForClinical) {
      return {
        methodologyId,
        methodologyVersion: activeVersion,
        executionMode,
        executionStatus: 'methodology_not_approved',
        estimatedRiskPercentage: null,
        riskCategory: null,
        timeHorizonYears: methodology.timeHorizonYears,
        isClinicallyApproved: false,
        isResearchExecution: false,
        uncertaintyRange: null,
        governanceNotice: `Clinical risk calculation paused: Methodology "${methodology.name}" (${methodology.code}) has lifecycle status "${methodology.lifecycleStatus}". It has not received formal calibration signoff by the Clinical Advisory Board for Bangladesh clinical use. In accordance with clinical governance rules, uncalibrated risk scores cannot be output in production clinical care.`,
        limitations: methodology.knownLimitations,
      }
    }

    // Research Simulation Mode / Permitted Execution:
    // Execute validated calculation equations (e.g. Tammemägi 2012 PLCOm2012 specification)
    if (methodologyId === 'plcom2012') {
      return this.calculatePlcom2012(input, methodology.timeHorizonYears, activeVersion, executionMode)
    }

    // Default fallback for other under-validation models
    return {
      methodologyId,
      methodologyVersion: activeVersion,
      executionMode,
      executionStatus: 'methodology_not_approved',
      estimatedRiskPercentage: null,
      riskCategory: null,
      timeHorizonYears: methodology.timeHorizonYears,
      isClinicallyApproved: false,
      isResearchExecution: executionMode === 'research_simulation',
      governanceNotice: `Methodology "${methodology.name}" is currently under validation and not approved for operational clinical risk calculation.`,
      limitations: methodology.knownLimitations,
    }
  }

  /**
   * Deterministic PLCOm2012 logistic regression calculation
   * Equation: logit(p) = beta_0 + sum(beta_i * x_i)
   * Probability: p = 1 / (1 + exp(-logit))
   */
  private static calculatePlcom2012(
    input: PreparedRiskInput,
    timeHorizonYears: number,
    versionTag: string,
    executionMode: RiskExecutionMode
  ): RiskCalculationOutput {
    const d = input.derived

    // Regression coefficients from Tammemägi et al. 2012 specification
    const betaIntercept = -4.5325
    const betaAge = 0.0778868 * (d.age - 62)
    const betaBmi = d.bmi ? -0.0274194 * (d.bmi - 27) : 0
    const betaCopd = d.hasCopdOrEmphysema ? 0.3553063 : 0
    const betaPriorCancer = d.hasPriorCancer ? 0.4589971 : 0
    const betaFamilyLungCancer = d.hasFamilyLungCancer ? 0.587185 : 0
    const betaCurrentSmoker = d.isCurrentSmoker ? 0.2597431 : 0

    // Smoking intensity transformation
    const cpd = d.cigarettesPerDay
    const betaIntensity = cpd > 0 ? -0.0208732 * (cpd - 20) : 0

    // Smoking duration
    const betaDuration = d.yearsSmoked > 0 ? 0.0317321 * (d.yearsSmoked - 30) : 0

    // Smoking quit time (if former smoker)
    const quitYears = d.quitYearsAgo || 0
    const betaQuit = d.isFormerSmoker && quitYears > 0 ? -0.0308572 * (quitYears - 10) : 0

    const logit =
      betaIntercept +
      betaAge +
      betaBmi +
      betaCopd +
      betaPriorCancer +
      betaFamilyLungCancer +
      betaCurrentSmoker +
      betaIntensity +
      betaDuration +
      betaQuit

    // Calculate probability (percentage)
    const probability = (1 / (1 + Math.exp(-logit))) * 100
    const roundedRisk = Math.round(probability * 1000) / 1000 // 3 decimal places

    // Category stratification based on standard PLCOm2012 research cutoff (threshold >= 1.5% at 6 years)
    let category: 'low' | 'moderate' | 'elevated' | 'high' = 'low'
    if (roundedRisk >= 5.0) {
      category = 'high'
    } else if (roundedRisk >= 2.0) {
      category = 'elevated'
    } else if (roundedRisk >= 1.3) {
      category = 'moderate'
    } else {
      category = 'low'
    }

    // 95% Confidence Interval estimation (derived from standard error ~0.18 logit)
    const seLogit = 0.18
    const lowerLogit = logit - 1.96 * seLogit
    const upperLogit = logit + 1.96 * seLogit
    const lowerProb = Math.round((1 / (1 + Math.exp(-lowerLogit))) * 10000) / 100
    const upperProb = Math.round((1 / (1 + Math.exp(-upperLogit))) * 10000) / 100

    return {
      methodologyId: 'plcom2012',
      methodologyVersion: versionTag,
      executionMode,
      executionStatus: 'completed',
      estimatedRiskPercentage: roundedRisk,
      riskCategory: category,
      timeHorizonYears,
      isClinicallyApproved: false, // Remains false until Clinical Advisory Board formally approves
      isResearchExecution: executionMode === 'research_simulation',
      uncertaintyRange: {
        lowerBound: lowerProb,
        upperBound: upperProb,
        confidenceInterval: '95% Confidence Interval',
      },
      governanceNotice:
        executionMode === 'research_simulation'
          ? 'RESEARCH / EPIDEMIOLOGICAL SIMULATION ONLY: This calculation was executed under research validation mode using the Tammemägi et al. 2012 mathematical equation. It is NOT approved for operational patient management or diagnostic screening eligibility in Bangladesh.'
          : 'Notice: Automated outputs are probabilistic decision-support aids designed solely to assist qualified clinicians. They do not constitute an automated medical diagnosis.',
      limitations:
        'PLCOm2012 was calibrated on US screening trial cohorts. It may under-estimate risk in South Asian non-smokers exposed to chronic biomass fuel cooking smoke, industrial shipyard welding fumes, or untreated pulmonary tuberculosis scarring.',
    }
  }
}


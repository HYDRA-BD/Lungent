import type {
  PreparedRiskInput,
  RiskCalculationOutput,
  RiskExplanationResult,
  RiskFactorAttribution,
} from './types'

export class RiskExplainabilityService {
  /**
   * Generates clinically grounded explainability for risk estimation outputs
   */
  static generateExplanation(
    input: PreparedRiskInput,
    output: RiskCalculationOutput
  ): RiskExplanationResult {
    const d = input.derived
    const factors: RiskFactorAttribution[] = []
    const assumptions: string[] = []

    // 1. Age Factor
    if (d.age >= 60) {
      factors.push({
        factorKey: 'age',
        factorLabel: 'Age Group (60+)',
        valueDisplay: `${d.age} years`,
        direction: 'increases_risk',
        relativeSignificance: 'high',
        clinicalExplanation: 'Advancing chronological age is an established independent epidemiological driver of cumulative cellular mutations in pulmonary tissue.',
      })
    } else if (d.age >= 50) {
      factors.push({
        factorKey: 'age',
        factorLabel: 'Age Group (50–59)',
        valueDisplay: `${d.age} years`,
        direction: 'increases_risk',
        relativeSignificance: 'moderate',
        clinicalExplanation: 'Age falls within standard epidemiological risk elevation window.',
      })
    }

    // 2. Tobacco Exposure Factor
    if (d.isCurrentSmoker || d.isFormerSmoker) {
      const sig = d.packYears >= 30 ? 'high' : d.packYears >= 20 ? 'moderate' : 'low'
      factors.push({
        factorKey: 'tobacco_exposure',
        factorLabel: d.isCurrentSmoker ? 'Active Tobacco Smoking' : 'Former Tobacco Smoking',
        valueDisplay: `${d.packYears} pack-years (${d.cigarettesPerDay} cigs/day for ${d.yearsSmoked} yrs)`,
        direction: 'increases_risk',
        relativeSignificance: sig,
        clinicalExplanation: `Cumulative tobacco exposure (${d.packYears} pack-years) delivers carcinogenic polycyclic aromatic hydrocarbons and nitrosamines, multiplying baseline risk.`,
      })
    } else {
      factors.push({
        factorKey: 'tobacco_exposure',
        factorLabel: 'Non-Smoker Status',
        valueDisplay: 'Never smoked',
        direction: 'decreases_risk',
        relativeSignificance: 'high',
        clinicalExplanation: 'Absence of primary tobacco smoking significantly reduces cumulative lifetime pulmonary carcinogen burden.',
      })
    }

    // 3. Chronic Respiratory Disease Factor
    if (d.hasCopdOrEmphysema) {
      factors.push({
        factorKey: 'copd_emphysema',
        factorLabel: 'Chronic Airway Limitation (COPD / Emphysema)',
        valueDisplay: 'Present',
        direction: 'increases_risk',
        relativeSignificance: 'high',
        clinicalExplanation: 'Chronic obstructive pulmonary disease entails persistent inflammation, oxidative stress, and impaired mucociliary clearance independently correlated with increased malignancy risk.',
      })
    }

    // 4. Family History Factor
    if (d.hasFamilyLungCancer) {
      factors.push({
        factorKey: 'family_history',
        factorLabel: 'Family History of Lung Malignancy',
        valueDisplay: 'Present in first/second-degree relative',
        direction: 'increases_risk',
        relativeSignificance: 'moderate',
        clinicalExplanation: 'Familial clustering indicates potential shared genetic susceptibility (e.g. DNA repair polymorphisms) or shared domestic environmental exposures.',
      })
    }

    // 5. Environmental Biomass Smoke Factor
    if (d.hasBiomassExposure) {
      factors.push({
        factorKey: 'biomass_smoke',
        factorLabel: 'Indoor Biomass Fuel Combustion (Wood / Chula)',
        valueDisplay: input.environmentalAndOccupational.biomassDurationYears
          ? `${input.environmentalAndOccupational.biomassDurationYears} years exposure`
          : 'Documented domestic exposure',
        direction: 'increases_risk',
        relativeSignificance: 'moderate',
        clinicalExplanation: 'Incomplete combustion of biomass fuels produces fine particulate matter (PM2.5), carbon monoxide, and organic carcinogens contributing to chronic pulmonary inflammation.',
      })
    }

    // 6. Occupational Hazards
    if (d.hasOccupationalExposure) {
      factors.push({
        factorKey: 'occupational_carcinogens',
        factorLabel: 'Occupational Inhalation Hazards',
        valueDisplay: input.environmentalAndOccupational.occupationalTypes.join(', ') || 'Hazardous exposure',
        direction: 'increases_risk',
        relativeSignificance: 'moderate',
        clinicalExplanation: 'Workplace exposure to shipyard welding fumes, asbestos fibers, or industrial silica independently elevates oncogenic risk.',
      })
    }

    // Assumptions applied
    assumptions.push('Cigarette and bidi consumption rates reflect reported average longitudinal intensity.')
    if (d.isNeverSmoker) {
      assumptions.push('Patient-reported never-smoker status assumes minimal unquantified secondhand smoke exposure.')
    }
    assumptions.push('Environmental factors represent context indicators rather than laboratory-measured personal dosimetry.')

    // Missing factors impact
    let missingImpact: string | null = null
    if (input.validation.issues.length > 0) {
      missingImpact = input.validation.issues.map((i) => i.message).join(' ')
    }

    const interpretationSummary =
      output.executionStatus === 'completed'
        ? `Multivariate statistical evaluation indicates an estimated 6-year risk of ${output.estimatedRiskPercentage}%. Primary risk drivers include cumulative smoking duration/intensity and underlying respiratory health factors.`
        : output.governanceNotice

    const limitations =
      output.limitations ||
      'Risk models provide probabilistic epidemiological estimates based on historical cohort studies. They cannot account for unrecorded individual genetic mutations, acute clinical changes, or acute infectious exacerbations.'

    const whatThisMeans =
      output.executionStatus === 'completed'
        ? `The estimated value (${output.estimatedRiskPercentage}%) represents the statistical probability of receiving a lung cancer diagnosis over a ${output.timeHorizonYears}-year period compared to an epidemiological reference cohort with identical documented risk parameters.`
        : 'The assessment input record has been cataloged and validated. Operational clinical calculation is paused pending approved calibration by the Clinical Advisory Board.'

    const whatThisDoesNotMean = [
      '1. This risk estimation is NOT a cancer diagnosis and does not detect the presence or absence of a tumor.',
      '2. A low estimated risk does NOT rule out lung cancer, nor does it guarantee that cancer will not develop.',
      '3. A high estimated risk does NOT mean that an individual has lung cancer.',
      '4. Active respiratory symptoms (e.g., hemoptysis, unexplained weight loss, stridor, hoarseness) require urgent clinical triage and diagnostic workup regardless of any risk calculation.',
      '5. This module does not determine Low-Dose CT (LDCT) screening eligibility; screening evaluation must be conducted through the dedicated screening module.',
      '6. All clinical decisions, diagnostic orders, and interventions remain the exclusive responsibility of authorized medical practitioners.',
    ].join('\n')

    return {
      contributingFactors: factors,
      missingFactorsImpact: missingImpact,
      assumptionsApplied: assumptions,
      interpretationSummary,
      limitations,
      whatThisMeans,
      whatThisDoesNotMean,
    }
  }
}


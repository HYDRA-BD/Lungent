import type {
  RiskMethodologyItem,
  RiskMethodologyVersionItem,
  ExperimentalModelItem,
} from './types'

// Centralized In-Memory Methodology Registry
const registeredMethodologies: Map<string, RiskMethodologyItem> = new Map()
const methodologyVersions: Map<string, RiskMethodologyVersionItem[]> = new Map()
const experimentalModels: Map<string, ExperimentalModelItem> = new Map()

function initializeMethodologyRegistry() {
  if (registeredMethodologies.size > 0) return

  // 1. PLCOm2012 Model
  const plcom2012: RiskMethodologyItem = {
    id: 'plcom2012',
    name: 'PLCOm2012 6-Year Lung Cancer Risk Prediction Model',
    code: 'PLCOm2012-v1',
    authoritativeSource: 'Tammemägi et al., Selection criteria for lung-cancer screening. N Engl J Med 2012; 366:680-687',
    publicationReference: 'https://doi.org/10.1056/NEJMoa1112480',
    intendedPopulation: 'Asymptomatic individuals aged 55-74 with significant tobacco smoking history (>30 pack-years or former smokers within 15 years)',
    calculationType: 'logistic_regression',
    outputDefinition: '6-year empirical probability of developing lung cancer (%)',
    timeHorizonYears: 6,
    lifecycleStatus: 'awaiting_clinical_approval', // Governed status: awaiting Bangladesh clinical calibration
    approvalAuthority: 'Clinical Advisory Board for Pulmonary Oncology & Screening',
    approvedForBangladesh: false, // Mandatory clinical governance safety gate
    approvedAt: null,
    reviewDate: '2026-12-01T00:00:00Z',
    knownLimitations: 'Derived from the US PLCO trial cohort. Does not account for high indoor biomass fuel combustion smoke, bidi smoking ratios, or past pulmonary tuberculosis scarring common in Bangladesh.',
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  }
  registeredMethodologies.set(plcom2012.id, plcom2012)

  // PLCOm2012 Versions
  methodologyVersions.set(plcom2012.id, [
    {
      id: 'ver-plco-001',
      methodologyId: plcom2012.id,
      versionTag: '1.0.0-us-original',
      specificationReference: 'Tammemägi et al. 2012 Original PLCO Model Logistic Equation',
      parameters: {
        intercept: -4.5325,
        coefficients: {
          age: 0.0778868,
          educationCollegeOrHigher: -0.0812741,
          bmi: -0.0274194,
          copd: 0.3553063,
          priorCancer: 0.4589971,
          familyLungCancer: 0.587185,
          currentSmoker: 0.2597431,
          smokingIntensityCpd: -0.0208732,
          smokingDurationYears: 0.0317321,
          smokingQuitYears: -0.0308572,
        },
      },
      lifecycleStatus: 'awaiting_clinical_approval',
      effectiveDate: '2026-01-15T00:00:00Z',
      changelog: 'Initial validated implementation of Tammemägi 2012 model coefficients.',
      createdAt: '2026-01-15T00:00:00Z',
    },
  ])

  // 2. Bach 2003 Model
  const bach2003: RiskMethodologyItem = {
    id: 'bach2003',
    name: 'Bach 10-Year Lung Cancer Risk Model',
    code: 'Bach-2003-v1',
    authoritativeSource: 'Bach et al., Variations in lung cancer risk among smokers. J Natl Cancer Inst 2003; 95:470-478',
    publicationReference: 'https://doi.org/10.1093/jnci/95.6.470',
    intendedPopulation: 'Current and former tobacco smokers aged 50-75 without prior cancer history',
    calculationType: 'cox_proportional_hazards',
    outputDefinition: '10-year probability of lung cancer diagnosis (%)',
    timeHorizonYears: 10,
    lifecycleStatus: 'under_validation',
    approvalAuthority: 'Clinical Advisory Board for Pulmonary Oncology & Screening',
    approvedForBangladesh: false,
    approvedAt: null,
    reviewDate: '2027-01-15T00:00:00Z',
    knownLimitations: 'Derived from CARET heavy smoker and asbestos worker trial; underestimates risk in non-smokers and uncalibrated for South Asian environmental patterns.',
    isActive: true,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  }
  registeredMethodologies.set(bach2003.id, bach2003)

  // 3. Liverpool LLP Model
  const liverpoolLlp: RiskMethodologyItem = {
    id: 'liverpool_llp',
    name: 'Liverpool Lung Project (LLPv2) Risk Prediction Tool',
    code: 'LLP-v2',
    authoritativeSource: 'Cassidy et al., The LLP risk model: an internationally validated tool for lung cancer risk prediction. Br J Cancer 2008',
    publicationReference: 'https://doi.org/10.1038/sj.bjc.6604284',
    intendedPopulation: 'Individuals aged 40-80 with or without personal smoking history',
    calculationType: 'logistic_regression',
    outputDefinition: '5-year absolute probability of developing lung cancer (%)',
    timeHorizonYears: 5,
    lifecycleStatus: 'under_validation',
    approvalAuthority: 'Clinical Advisory Board for Pulmonary Oncology & Screening',
    approvedForBangladesh: false,
    approvedAt: null,
    reviewDate: '2027-02-01T00:00:00Z',
    knownLimitations: 'Incorporates pneumonia and prior asbestos exposure, but lacks parameters for chronic indoor biomass smoke.',
    isActive: true,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  }
  registeredMethodologies.set(liverpoolLlp.id, liverpoolLlp)

  // 4. Experimental Research Model (Strict Clinical Segregation)
  const brfssExp: ExperimentalModelItem = {
    id: 'brfss_experimental_2022',
    modelName: 'BRFSS-2022 Survey Exploratory Classifier (Research Prototype)',
    datasetProvenance: 'CDC Behavioral Risk Factor Surveillance System (BRFSS) 2022 cross-sectional survey data (US population)',
    datasetLimitations: 'Self-reported retrospective telephone survey; not a dedicated lung cancer cohort; lacks clinical staging and longitudinal follow-up; completely uncalibrated for Bangladesh.',
    modelArchitecture: 'Gradient Boosted Decision Trees (Research Prototype v0.2)',
    trainingDate: '2026-08-10T00:00:00Z',
    isExperimentalOnly: true,
    canInfluenceClinicalPipeline: false,
    auditNotes: 'Strict clinical firewall: results from this model are strictly research-only and cannot enter patient records or clinical triage boards.',
    createdAt: '2026-08-10T00:00:00Z',
  }
  experimentalModels.set(brfssExp.id, brfssExp)
}

initializeMethodologyRegistry()

export class MethodologyRegistry {
  static getAllMethodologies(): RiskMethodologyItem[] {
    initializeMethodologyRegistry()
    return Array.from(registeredMethodologies.values())
  }

  static getMethodology(id: string): RiskMethodologyItem | null {
    initializeMethodologyRegistry()
    return registeredMethodologies.get(id) || null
  }

  static getMethodologyVersions(methodologyId: string): RiskMethodologyVersionItem[] {
    initializeMethodologyRegistry()
    return methodologyVersions.get(methodologyId) || []
  }

  static isApprovedForClinicalUse(methodologyId: string, region: string = 'BD'): boolean {
    initializeMethodologyRegistry()
    const meth = registeredMethodologies.get(methodologyId)
    if (!meth) return false
    if (meth.lifecycleStatus !== 'approved_for_clinical_use') return false
    if (region === 'BD' && !meth.approvedForBangladesh) return false
    return true
  }

  static getAllExperimentalModels(): ExperimentalModelItem[] {
    initializeMethodologyRegistry()
    return Array.from(experimentalModels.values())
  }

  static getExperimentalModel(id: string): ExperimentalModelItem | null {
    initializeMethodologyRegistry()
    return experimentalModels.get(id) || null
  }
}


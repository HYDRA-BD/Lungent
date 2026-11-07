import type {
  ScreeningGuidelineItem,
  ScreeningGuidelineVersionItem,
} from './types'

// Centralized in-memory store for screening guidelines
const registeredGuidelines: Map<string, ScreeningGuidelineItem> = new Map()
const guidelineVersions: Map<string, ScreeningGuidelineVersionItem[]> = new Map()

function initializeGuidelineRegistry() {
  if (registeredGuidelines.size > 0) return

  // 1. USPSTF 2021 Recommendation Statement
  const uspstf2021: ScreeningGuidelineItem = {
    id: 'gl-uspstf-2021',
    guidelineCode: 'USPSTF-2021',
    name: 'USPSTF 2021 Lung Cancer Screening Recommendation',
    issuingOrganization: 'U.S. Preventive Services Task Force',
    officialSourceUrl: 'https://doi.org/10.1001/jama.2021.1117',
    publicationReference: 'US Preventive Services Task Force. Screening for Lung Cancer: US Preventive Services Task Force Recommendation Statement. JAMA. 2021;325(10):962–970.',
    jurisdiction: 'United States / International Reference',
    intendedPopulation: 'Asymptomatic adults aged 50 to 80 years who have a 20 pack-year smoking history and currently smoke or have quit within the past 15 years.',
    publicationDate: '2021-03-09',
    lastUpdatedDate: '2021-03-09',
    screeningIntervalMonths: 12,
    recommendedModality: 'low_dose_computed_tomography',
    lifecycleStatus: 'awaiting_clinical_approval',
    approvalAuthority: 'Clinical Advisory Board for Pulmonary Oncology & Screening',
    approvedForBangladesh: false, // Strict clinical governance gate
    approvedAt: null,
    reviewDate: '2026-12-01T00:00:00Z',
    knownLimitations: 'Requires quality-assured multislice CT infrastructure and thoracic surgery back-up. Does not account for high indoor biomass smoke exposure or prior healed tuberculosis prevalent in Bangladesh.',
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  }
  registeredGuidelines.set(uspstf2021.id, uspstf2021)

  guidelineVersions.set(uspstf2021.id, [
    {
      id: 'ver-uspstf-2021-v1',
      guidelineId: uspstf2021.id,
      versionTag: '2021.1-final',
      specificationReference: 'JAMA 2021;325(10):962-970 Specification',
      minAge: 50,
      maxAge: 80,
      minPackYears: 20.0,
      maxQuitYears: 15,
      requiresAsymptomatic: true,
      exclusions: [
        'Active symptoms concerning for lung cancer (hemoptysis, unexplained weight loss, acute stridor) requiring immediate diagnostic workup',
        'Health problem that substantially limits life expectancy (e.g. end-stage organ failure)',
        'Inability or unwillingness to undergo curative pulmonary resection surgery if cancer is detected',
      ],
      criteriaDefinitions: [
        {
          key: 'age_range',
          label: 'Chronological Age (50–80 years)',
          ruleDescription: 'Patient must be between 50 and 80 years of age inclusive.',
          requiredValueExpression: '50 <= age <= 80',
        },
        {
          key: 'pack_years',
          label: 'Cumulative Tobacco Exposure (≥20 pack-years)',
          ruleDescription: 'Patient must have at least 20.0 pack-years of lifetime cigarette/bidi smoking.',
          requiredValueExpression: 'pack_years >= 20.0',
        },
        {
          key: 'smoking_status_or_cessation',
          label: 'Current Smoker or Quit within Past 15 Years',
          ruleDescription: 'Patient currently smokes or ceased smoking 15 years ago or fewer.',
          requiredValueExpression: 'is_current_smoker OR (is_former_smoker AND quit_years <= 15)',
        },
        {
          key: 'asymptomatic_status',
          label: 'Absence of Active Concerning Respiratory Symptoms',
          ruleDescription: 'Patient must be asymptomatic; acute concerning symptoms mandate diagnostic pathway, not routine screening.',
          requiredValueExpression: 'has_concerning_symptoms == false',
        },
        {
          key: 'curative_intervention_eligibility',
          label: 'Candidate for Curative Treatment and Adequate Life Expectancy',
          ruleDescription: 'No severe comorbid contraindications that would preclude curative lung surgery.',
          requiredValueExpression: 'has_curative_contraindications == false',
        },
      ],
      lifecycleStatus: 'awaiting_clinical_approval',
      effectiveDate: '2021-03-09T00:00:00Z',
      changelog: 'Official USPSTF 2021 recommendation lowering eligibility age to 50 and pack-years to 20.',
      createdAt: '2026-01-15T00:00:00Z',
    },
  ])

  // 2. American Cancer Society (ACS) 2023 Guideline
  const acs2023: ScreeningGuidelineItem = {
    id: 'gl-acs-2023',
    guidelineCode: 'ACS-2023',
    name: 'American Cancer Society 2023 Lung Cancer Screening Guideline',
    issuingOrganization: 'American Cancer Society',
    officialSourceUrl: 'https://doi.org/10.3322/caac.21811',
    publicationReference: 'Wolf AMD, Oeffinger KC, Shih TYC, et al. Screening for lung cancer: 2023 guideline update from the American Cancer Society. CA Cancer J Clin. 2023;73(6):533-563.',
    jurisdiction: 'United States',
    intendedPopulation: 'Asymptomatic adults aged 50 to 80 years who have a ≥20 pack-year smoking history, regardless of how long ago they quit.',
    publicationDate: '2023-11-01',
    lastUpdatedDate: '2023-11-01',
    screeningIntervalMonths: 12,
    recommendedModality: 'low_dose_computed_tomography',
    lifecycleStatus: 'under_validation',
    approvalAuthority: 'Clinical Advisory Board for Pulmonary Oncology & Screening',
    approvedForBangladesh: false,
    approvedAt: null,
    reviewDate: '2026-12-01T00:00:00Z',
    knownLimitations: 'Eliminates the 15-year quit restriction based on persistent elevated risk; expands eligible cohort significantly; requires tertiary thoracic infrastructure.',
    isActive: true,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  }
  registeredGuidelines.set(acs2023.id, acs2023)

  guidelineVersions.set(acs2023.id, [
    {
      id: 'ver-acs-2023-v1',
      guidelineId: acs2023.id,
      versionTag: '2023.1-update',
      specificationReference: 'CA Cancer J Clin 2023;73(6):533-563',
      minAge: 50,
      maxAge: 80,
      minPackYears: 20.0,
      maxQuitYears: null, // ACS 2023 removed the 15-year quit window restriction
      requiresAsymptomatic: true,
      exclusions: [
        'Active symptoms of lung cancer',
        'Life expectancy < 5 years due to severe chronic illness',
        'Inability or unwillingness to undergo evaluation or curative treatment',
      ],
      criteriaDefinitions: [
        {
          key: 'age_range',
          label: 'Chronological Age (50–80 years)',
          ruleDescription: 'Patient must be between 50 and 80 years of age inclusive.',
          requiredValueExpression: '50 <= age <= 80',
        },
        {
          key: 'pack_years',
          label: 'Cumulative Tobacco Exposure (≥20 pack-years)',
          ruleDescription: 'Patient must have at least 20.0 pack-years of lifetime cigarette smoking.',
          requiredValueExpression: 'pack_years >= 20.0',
        },
        {
          key: 'smoking_status',
          label: 'Current Smoker or Any Former Smoker',
          ruleDescription: 'Patient is a current or former smoker (no maximum years since quit limit under ACS 2023).',
          requiredValueExpression: 'is_current_smoker OR is_former_smoker',
        },
        {
          key: 'asymptomatic_status',
          label: 'Absence of Active Concerning Respiratory Symptoms',
          ruleDescription: 'Patient must be asymptomatic; acute concerning symptoms require diagnostic evaluation.',
          requiredValueExpression: 'has_concerning_symptoms == false',
        },
      ],
      lifecycleStatus: 'under_validation',
      effectiveDate: '2023-11-01T00:00:00Z',
      changelog: 'Eliminated the 15-year quit restriction; individuals who quit >15 years ago remain eligible if age 50-80 with >=20 pack-years.',
      createdAt: '2026-01-15T00:00:00Z',
    },
  ])

  // 3. NIDCH Bangladesh Consensus Pilot Screening Protocol (Draft)
  const nidchPilot: ScreeningGuidelineItem = {
    id: 'gl-nidch-pilot',
    guidelineCode: 'NIDCH-PILOT-2026',
    name: 'NIDCH Bangladesh Consensus Pilot Protocol (Draft)',
    issuingOrganization: 'National Institute of Diseases of the Chest and Hospital Working Group',
    officialSourceUrl: null,
    publicationReference: 'NIDCH Multi-Disciplinary Thoracic Oncology Pilot Screening Consensus Document (2026 Working Draft).',
    jurisdiction: 'Bangladesh (Tertiary Centers)',
    intendedPopulation: 'High-risk individuals aged 50-75 with significant tobacco exposure or prolonged indoor biomass fuel smoke with severe airflow limitation.',
    publicationDate: '2026-02-01',
    lastUpdatedDate: '2026-09-01',
    screeningIntervalMonths: 12,
    recommendedModality: 'low_dose_computed_tomography',
    lifecycleStatus: 'under_validation',
    approvalAuthority: 'Bangladesh Ministry of Health & Family Welfare / DGHS Pulmonary Panel',
    approvedForBangladesh: false, // Under pilot clinical study
    approvedAt: null,
    reviewDate: '2026-12-31T00:00:00Z',
    knownLimitations: 'Pilot evaluation only; restricted to patients with access to multidisciplinary thoracic care; incorporates biomass exposure research criteria.',
    isActive: true,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  }
  registeredGuidelines.set(nidchPilot.id, nidchPilot)

  guidelineVersions.set(nidchPilot.id, [
    {
      id: 'ver-nidch-pilot-v1',
      guidelineId: nidchPilot.id,
      versionTag: '2026.0-draft',
      specificationReference: 'NIDCH Thoracic MDT Pilot Protocol Draft v0.9',
      minAge: 50,
      maxAge: 75,
      minPackYears: 20.0,
      maxQuitYears: 15,
      requiresAsymptomatic: true,
      exclusions: [
        'Active hemoptysis or acute respiratory emergency',
        'Active pulmonary tuberculosis under current DOTS treatment',
        'Lack of access to thoracic surgical intervention facilities',
      ],
      criteriaDefinitions: [
        {
          key: 'age_range',
          label: 'Chronological Age (50–75 years)',
          ruleDescription: 'Patient must be between 50 and 75 years of age inclusive.',
          requiredValueExpression: '50 <= age <= 75',
        },
        {
          key: 'pack_years',
          label: 'Tobacco Pack-Years (≥20 pack-years, bidi weighted)',
          ruleDescription: 'Patient has ≥20.0 pack-years including bidi consumption weighted at 0.5 cigarette equivalent.',
          requiredValueExpression: 'pack_years >= 20.0',
        },
        {
          key: 'smoking_cessation',
          label: 'Current Smoker or Quit ≤ 15 Years',
          ruleDescription: 'Patient currently smokes or ceased within the past 15 years.',
          requiredValueExpression: 'is_current_smoker OR (is_former_smoker AND quit_years <= 15)',
        },
        {
          key: 'asymptomatic_status',
          label: 'Absence of Acute Symptoms or Active TB',
          ruleDescription: 'Patient must be free of acute red-flag symptoms and active infectious TB.',
          requiredValueExpression: 'has_concerning_symptoms == false',
        },
      ],
      lifecycleStatus: 'under_validation',
      effectiveDate: '2026-02-01T00:00:00Z',
      changelog: 'Draft pilot specification for tertiary center validation in Dhaka.',
      createdAt: '2026-02-01T00:00:00Z',
    },
  ])
}

initializeGuidelineRegistry()

export class ScreeningGuidelineRegistry {
  static getAllGuidelines(): ScreeningGuidelineItem[] {
    initializeGuidelineRegistry()
    return Array.from(registeredGuidelines.values())
  }

  static getGuideline(id: string): ScreeningGuidelineItem | null {
    initializeGuidelineRegistry()
    return registeredGuidelines.get(id) || null
  }

  static getGuidelineVersions(guidelineId: string): ScreeningGuidelineVersionItem[] {
    initializeGuidelineRegistry()
    return guidelineVersions.get(guidelineId) || []
  }

  static getLatestVersion(guidelineId: string): ScreeningGuidelineVersionItem | null {
    initializeGuidelineRegistry()
    const versions = guidelineVersions.get(guidelineId) || []
    return versions[0] || null
  }

  static isApprovedForClinicalUse(guidelineId: string, region: string = 'BD'): boolean {
    initializeGuidelineRegistry()
    const gl = registeredGuidelines.get(guidelineId)
    if (!gl) return false
    if (gl.lifecycleStatus !== 'approved_for_clinical_use') return false
    if (region === 'BD' && !gl.approvedForBangladesh) return false
    return true
  }
}

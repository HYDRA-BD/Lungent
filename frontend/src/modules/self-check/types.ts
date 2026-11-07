export type AgeRange =
  | 'under_40'
  | '40_49'
  | '50_59'
  | '60_69'
  | '70_and_older'

export type BiologicalSex = 'female' | 'male' | 'prefer_not_to_say'

export type BangladeshDivision =
  | 'dhaka'
  | 'chattogram'
  | 'rajshahi'
  | 'khulna'
  | 'barishal'
  | 'sylhet'
  | 'rangpur'
  | 'mymensingh'
  | 'other'

export type SmokingStatus = 'never' | 'former' | 'current'

export type TobaccoType = 'cigarettes' | 'bidis' | 'both' | 'none'

export type SecondhandSmokeExposure =
  | 'none'
  | 'household'
  | 'workplace'
  | 'both'

export type RespiratoryCondition =
  | 'copd'
  | 'chronic_bronchitis'
  | 'emphysema'
  | 'asthma'
  | 'prior_tb'
  | 'pulmonary_fibrosis'
  | 'none'

export type FamilyHistoryLungCancer =
  | 'yes_first_degree' // Parent, sibling, child
  | 'yes_second_degree' // Grandparent, aunt/uncle
  | 'no'
  | 'unknown'

export type CookingFuelType =
  | 'lpg_gas'
  | 'electricity'
  | 'biomass_wood_dung' // Traditional chula
  | 'kerosene'
  | 'other'

export type OccupationalHazard =
  | 'silica_dust' // Stone-crushing, construction
  | 'asbestos' // Shipbreaking, roofing
  | 'shipbreaking_welding' // Heavy metal fumes
  | 'textile_dyeing_fumes' // Chemical vapors
  | 'pesticides_agriculture' // Chemical spraying
  | 'none'

export type SelfReportedAirPollution =
  | 'low'
  | 'moderate'
  | 'high_urban' // Heavy traffic/industrial zone

export type WarningSymptom =
  | 'coughing_blood' // Hemoptysis (Red flag)
  | 'cough_over_3_weeks' // Chronic persistent cough (Red flag)
  | 'unexplained_weight_loss' // Constitutional (Red flag)
  | 'persistent_chest_pain' // Thoracic pain (Red flag)
  | 'severe_breathlessness' // Dyspnea at rest or light exertion (Red flag)
  | 'hoarseness_unexplained' // Recurrent laryngeal involvement
  | 'frequent_chest_infections'
  | 'none'

export interface SelfCheckResponses {
  // Step 0: Acknowledgement
  acknowledgedLimitations: boolean

  // Step 1: Basic Demographics
  ageRange: AgeRange
  biologicalSex: BiologicalSex
  division: BangladeshDivision

  // Step 2: Smoking & Tobacco History
  smokingStatus: SmokingStatus
  tobaccoType?: TobaccoType
  cigarettesPerDay?: number
  smokingDurationYears?: number
  quitYearsAgo?: number
  secondhandSmoke: SecondhandSmokeExposure

  // Step 3: Health & Medical History
  respiratoryConditions: RespiratoryCondition[]
  familyLungCancer: FamilyHistoryLungCancer
  personalCancerHistory: boolean

  // Step 4: Lifestyle & Environmental Exposures
  cookingFuel: CookingFuelType
  biomassExposureYears?: number
  occupationalHazards: OccupationalHazard[]
  selfReportedAirPollution: SelfReportedAirPollution

  // Step 5: Symptoms Awareness (Independent)
  symptoms: WarningSymptom[]
}

export type RiskCategory =
  | 'baseline_general'
  | 'moderate_risk_factors'
  | 'elevated_screening_candidate'

export type SymptomTriageUrgency =
  | 'urgent_red_flags'
  | 'non_urgent_symptoms'
  | 'no_symptoms'

export interface SelfCheckResult {
  // Quantitative metrics
  packYears: number
  calculatedRiskCategory: RiskCategory

  // Independent Safety Pathway
  symptomUrgency: SymptomTriageUrgency
  hasUrgentSymptoms: boolean
  urgentSymptomsList: WarningSymptom[]
  nonUrgentSymptomsList: WarningSymptom[]

  // Screening eligibility (USPSTF 2021 criteria matching)
  isScreeningEligibleAgeAndSmoking: boolean

  // Explanatory breakdown
  identifiedRiskFactorsEn: string[]
  identifiedRiskFactorsBn: string[]

  recommendedNextStepsEn: string[]
  recommendedNextStepsBn: string[]

  // Non-diagnostic disclosure
  disclaimerEn: string
  disclaimerBn: string

  completedAt: string
}

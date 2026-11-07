import { z } from 'zod'

export const dataSourceEnum = z.enum([
  'patient_reported',
  'healthcare_worker_entered',
  'clinician_verified',
  'imported_external',
  'derived_calculated',
])

export const verificationStatusEnum = z.enum([
  'unverified',
  'pending_verification',
  'verified',
  'rejected',
  'disputed',
])

export const conditionCategoryEnum = z.enum([
  'respiratory',
  'oncological',
  'cardiovascular',
  'surgical',
  'infectious',
  'other',
])

export const clinicalStatusEnum = z.enum(['active', 'resolved', 'in_remission', 'unknown'])

export const medicationTypeEnum = z.enum([
  'respiratory_inhaler',
  'bronchodilator',
  'oral_steroid',
  'cancer_therapy',
  'cardiovascular',
  'antibiotic',
  'tuberculosis_regimen',
  'other',
])

export const allergenTypeEnum = z.enum([
  'medication',
  'environmental',
  'food',
  'other',
  'no_known_allergies',
])

export const allergySeverityEnum = z.enum([
  'mild',
  'moderate',
  'severe',
  'anaphylaxis',
  'unknown',
])

export const smokingStatusEnum = z.enum([
  'never',
  'current',
  'former',
  'unknown_unreported',
])

export const tobaccoTypeEnum = z.enum([
  'cigarettes',
  'bidi',
  'hookah',
  'smokeless_zarda_gul',
  'mixed',
  'none',
])

export const secondhandSmokeContextEnum = z.enum([
  'household',
  'workplace',
  'both',
  'none',
  'unknown',
])

export const exposureCategoryEnum = z.enum([
  'occupational',
  'indoor_biomass',
  'outdoor_air_pollution',
  'secondhand_smoke',
  'other',
])

export const cookingFuelTypeEnum = z.enum([
  'clean_lpg_electric',
  'biomass_wood_dung',
  'kerosene',
  'coal',
  'mixed',
])

export const exposureIntensityEnum = z.enum(['low', 'moderate', 'high', 'unknown'])

export const familyRelationshipEnum = z.enum([
  'parent',
  'sibling',
  'child',
  'grandparent',
  'uncle_aunt',
  'other',
])

export const familyConditionTypeEnum = z.enum([
  'lung_cancer',
  'other_cancer',
  'copd_respiratory',
  'cardiovascular',
  'other',
])

export const physicalActivityLevelEnum = z.enum([
  'sedentary',
  'light',
  'moderate',
  'active',
  'unknown',
])

export const alcoholConsumptionStatusEnum = z.enum([
  'never',
  'former',
  'occasional',
  'moderate',
  'heavy',
  'unknown',
])

export const measurementTypeEnum = z.enum([
  'height',
  'weight',
  'bmi',
  'blood_pressure_systolic',
  'blood_pressure_diastolic',
  'blood_pressure_combined',
  'heart_rate',
  'oxygen_saturation',
  'respiratory_rate',
])

export const measurementContextEnum = z.enum([
  'clinic_intake',
  'community_camp',
  'hospital_bedside',
  'self_reported',
])

export const symptomNameEnum = z.enum([
  'cough',
  'cough_with_hemoptysis',
  'dyspnea_breathlessness',
  'chest_pain',
  'unexplained_weight_loss',
  'persistent_hoarseness',
  'fatigue',
  'wheezing',
  'fever_night_sweats',
  'other',
])

export const symptomProgressionEnum = z.enum([
  'improving',
  'stable',
  'worsening',
  'fluctuating',
  'unknown',
])

export const symptomSeverityEnum = z.enum([
  'mild',
  'moderate',
  'severe',
  'acute_critical',
])

export const healthReviewDecisionEnum = z.enum([
  'verified',
  'amended_verified',
  'rejected_unreliable',
  'requires_followup',
])

// 1. Medical Condition Schema
export const medicalConditionSchema = z.object({
  conditionName: z.string().trim().min(2, 'Condition name is required').max(200),
  conditionCode: z.string().trim().max(100).optional().nullable(),
  conditionCategory: conditionCategoryEnum.default('respiratory'),
  clinicalStatus: clinicalStatusEnum.default('active'),
  onsetDate: z.string().trim().max(50).optional().nullable(),
  approximateOnsetAge: z.coerce.number().int().min(0).max(130).optional().nullable(),
  isPrimaryRespiratory: z.boolean().default(false),
  treatmentSummary: z.string().trim().max(1000).optional().nullable(),
  hospitalizationHistory: z.string().trim().max(1000).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  dataSource: dataSourceEnum.default('healthcare_worker_entered'),
  verificationStatus: verificationStatusEnum.default('unverified'),
})

// 2. Medication Schema
export const medicationSchema = z.object({
  medicationName: z.string().trim().min(2, 'Medication name is required').max(200),
  medicationType: medicationTypeEnum.default('other'),
  dosageInstructions: z.string().trim().max(300).optional().nullable(),
  prescribingSource: z.string().trim().max(200).optional().nullable(),
  startDate: z.string().trim().max(50).optional().nullable(),
  endDate: z.string().trim().max(50).optional().nullable(),
  isCurrent: z.boolean().default(true),
  notes: z.string().trim().max(1000).optional().nullable(),
  dataSource: dataSourceEnum.default('healthcare_worker_entered'),
  verificationStatus: verificationStatusEnum.default('unverified'),
})

// 3. Allergy Schema (handles 'no_known_allergies' gracefully)
export const allergySchema = z.object({
  allergenType: allergenTypeEnum,
  allergenName: z.string().trim().min(1, 'Allergen name is required').max(200),
  reactionDescription: z.string().trim().max(500).optional().nullable(),
  severity: allergySeverityEnum.default('unknown'),
  isActive: z.boolean().default(true),
  notes: z.string().trim().max(1000).optional().nullable(),
  dataSource: dataSourceEnum.default('healthcare_worker_entered'),
  verificationStatus: verificationStatusEnum.default('unverified'),
})

// 4. Smoking History Schema
export const smokingHistorySchema = z.object({
  smokingStatus: smokingStatusEnum,
  tobaccoType: tobaccoTypeEnum.default('cigarettes'),
  cigarettesPerDay: z.coerce.number().min(0).max(200).optional().nullable(),
  bidisPerDay: z.coerce.number().min(0).max(200).optional().nullable(),
  yearsSmoked: z.coerce.number().min(0).max(90).optional().nullable(),
  ageStarted: z.coerce.number().int().min(5).max(120).optional().nullable(),
  ageQuit: z.coerce.number().int().min(5).max(120).optional().nullable(),
  quitDate: z.string().trim().max(50).optional().nullable(),
  secondhandSmokeExposure: z.boolean().default(false),
  secondhandSmokeContext: secondhandSmokeContextEnum.default('none'),
  otherTobaccoDetails: z.string().trim().max(500).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  dataSource: dataSourceEnum.default('healthcare_worker_entered'),
  verificationStatus: verificationStatusEnum.default('unverified'),
})

// 5. Environmental Exposure Schema
export const environmentalExposureSchema = z.object({
  exposureCategory: exposureCategoryEnum,
  exposureType: z.string().trim().min(2, 'Exposure type is required').max(200),
  cookingFuelType: cookingFuelTypeEnum.optional().nullable(),
  durationYears: z.coerce.number().min(0).max(90).optional().nullable(),
  intensity: exposureIntensityEnum.default('moderate'),
  isCurrent: z.boolean().default(false),
  startYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  endYear: z.coerce.number().int().min(1900).max(2100).optional().nullable(),
  contextDetails: z.string().trim().max(1000).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  dataSource: dataSourceEnum.default('healthcare_worker_entered'),
  verificationStatus: verificationStatusEnum.default('unverified'),
})

// 6. Family History Schema
export const familyHistorySchema = z.object({
  relationship: familyRelationshipEnum,
  conditionType: familyConditionTypeEnum,
  specificCancerType: z.string().trim().max(200).optional().nullable(),
  ageAtDiagnosis: z.coerce.number().int().min(0).max(130).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  dataSource: dataSourceEnum.default('healthcare_worker_entered'),
  verificationStatus: verificationStatusEnum.default('unverified'),
})

// 7. Lifestyle Schema
export const lifestyleSchema = z.object({
  physicalActivityLevel: physicalActivityLevelEnum.default('unknown'),
  dietaryNotes: z.string().trim().max(1000).optional().nullable(),
  alcoholConsumptionStatus: alcoholConsumptionStatusEnum.default('unknown'),
  householdSmokersCount: z.coerce.number().int().min(0).max(50).default(0),
  notes: z.string().trim().max(1000).optional().nullable(),
  dataSource: dataSourceEnum.default('healthcare_worker_entered'),
  verificationStatus: verificationStatusEnum.default('unverified'),
})

// 8. Measurement Schema
export const measurementSchema = z.object({
  measurementType: measurementTypeEnum,
  numericValue: z.coerce.number(),
  unit: z.string().trim().min(1, 'Unit is required').max(20),
  secondaryValue: z.coerce.number().optional().nullable(),
  isCalculated: z.boolean().default(false),
  calculationFormula: z.string().trim().max(200).optional().nullable(),
  measuredAt: z.string().trim().max(50).optional().nullable(),
  measurementContext: measurementContextEnum.default('clinic_intake'),
  notes: z.string().trim().max(500).optional().nullable(),
  dataSource: dataSourceEnum.default('healthcare_worker_entered'),
  verificationStatus: verificationStatusEnum.default('unverified'),
})

// 9. Symptom Schema
export const symptomSchema = z.object({
  symptomName: symptomNameEnum,
  isPresent: z.boolean().default(true),
  onsetDate: z.string().trim().max(50).optional().nullable(),
  durationWeeks: z.coerce.number().min(0).max(520).optional().nullable(),
  progression: symptomProgressionEnum.default('stable'),
  severity: symptomSeverityEnum.default('moderate'),
  clinicalObservationType: z.string().trim().max(100).default('healthcare_worker_entered'),
  isActive: z.boolean().default(true),
  notes: z.string().trim().max(1000).optional().nullable(),
  dataSource: dataSourceEnum.default('healthcare_worker_entered'),
  verificationStatus: verificationStatusEnum.default('unverified'),
})

// 10. Clinician Review Schema
export const clinicianReviewSchema = z.object({
  categoryReviewed: z.string().trim().min(1, 'Category is required').max(100),
  targetRecordId: z.string().trim().uuid().optional().nullable(),
  reviewDecision: healthReviewDecisionEnum,
  clinicalRationale: z
    .string()
    .trim()
    .min(5, 'Clinical rationale must be at least 5 characters')
    .max(1000),
})


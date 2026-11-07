import type {
  AllergenType,
  AllergySeverity,
  AlcoholConsumptionStatus,
  ConditionCategory,
  ConditionClinicalStatus,
  CookingFuelType,
  ExposureCategory,
  ExposureIntensity,
  FamilyConditionType,
  FamilyRelationship,
  HealthRecordDataSource,
  HealthRecordVerificationStatus,
  HealthReviewDecision,
  MeasurementContext,
  MeasurementType,
  MedicationType,
  PhysicalActivityLevel,
  SecondhandSmokeContext,
  SmokingStatus,
  SymptomName,
  SymptomProgression,
  SymptomSeverity,
  TobaccoType,
} from '@/types/database'

export interface RecordProvenance {
  dataSource: HealthRecordDataSource
  verificationStatus: HealthRecordVerificationStatus
  verifiedBy?: string | null
  verifiedAt?: string | null
  recordedBy?: string | null
  facilityId?: string | null
}

export interface PatientMedicalConditionItem extends RecordProvenance {
  id: string
  patientId: string
  conditionName: string
  conditionCode?: string | null
  conditionCategory: ConditionCategory
  clinicalStatus: ConditionClinicalStatus
  onsetDate?: string | null
  approximateOnsetAge?: number | null
  isPrimaryRespiratory: boolean
  treatmentSummary?: string | null
  hospitalizationHistory?: string | null
  notes?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PatientMedicationItem extends RecordProvenance {
  id: string
  patientId: string
  medicationName: string
  medicationType: MedicationType
  dosageInstructions?: string | null
  prescribingSource?: string | null
  startDate?: string | null
  endDate?: string | null
  isCurrent: boolean
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface PatientAllergyItem extends RecordProvenance {
  id: string
  patientId: string
  allergenType: AllergenType
  allergenName: string
  reactionDescription?: string | null
  severity: AllergySeverity
  isActive: boolean
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface PatientSmokingHistoryRecord extends RecordProvenance {
  id: string
  patientId: string
  smokingStatus: SmokingStatus
  tobaccoType: TobaccoType
  cigarettesPerDay?: number | null
  bidisPerDay?: number | null
  yearsSmoked?: number | null
  ageStarted?: number | null
  ageQuit?: number | null
  quitDate?: string | null
  calculatedPackYears?: number | null
  packYearsCalculationMethod?: string | null
  secondhandSmokeExposure: boolean
  secondhandSmokeContext?: SecondhandSmokeContext | null
  otherTobaccoDetails?: string | null
  notes?: string | null
  isCurrent: boolean
  createdAt: string
  updatedAt: string
}

export interface PatientEnvironmentalExposureItem extends RecordProvenance {
  id: string
  patientId: string
  exposureCategory: ExposureCategory
  exposureType: string
  cookingFuelType?: CookingFuelType | null
  durationYears?: number | null
  intensity: ExposureIntensity
  isCurrent: boolean
  startYear?: number | null
  endYear?: number | null
  contextDetails?: string | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface PatientFamilyHistoryItem extends RecordProvenance {
  id: string
  patientId: string
  relationship: FamilyRelationship
  conditionType: FamilyConditionType
  specificCancerType?: string | null
  ageAtDiagnosis?: number | null
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface PatientLifestyleRecord extends RecordProvenance {
  id: string
  patientId: string
  physicalActivityLevel: PhysicalActivityLevel
  dietaryNotes?: string | null
  alcoholConsumptionStatus: AlcoholConsumptionStatus
  householdSmokersCount?: number | null
  notes?: string | null
  isCurrent: boolean
  createdAt: string
  updatedAt: string
}

export interface PatientHealthMeasurementItem extends RecordProvenance {
  id: string
  patientId: string
  measurementType: MeasurementType
  numericValue: number
  unit: string
  secondaryValue?: number | null
  isCalculated: boolean
  calculationFormula?: string | null
  measuredAt: string
  measurementContext?: MeasurementContext | null
  notes?: string | null
  createdAt: string
}

export interface PatientSymptomItem extends RecordProvenance {
  id: string
  patientId: string
  symptomName: SymptomName
  isPresent: boolean
  onsetDate?: string | null
  durationWeeks?: number | null
  progression: SymptomProgression
  severity: SymptomSeverity
  clinicalObservationType: string
  isActive: boolean
  notes?: string | null
  createdAt: string
  updatedAt: string
}

export interface PatientHealthReviewItem {
  id: string
  patientId: string
  categoryReviewed: string
  targetRecordId?: string | null
  reviewerId: string
  reviewerName?: string | null
  reviewerRole?: string | null
  reviewDecision: HealthReviewDecision
  clinicalRationale: string
  facilityId?: string | null
  reviewedAt: string
}

export interface ComprehensivePatientHealthRecord {
  patientId: string
  medicalConditions: PatientMedicalConditionItem[]
  medications: PatientMedicationItem[]
  allergies: PatientAllergyItem[]
  smokingHistory: PatientSmokingHistoryRecord | null
  environmentalExposures: PatientEnvironmentalExposureItem[]
  familyHistory: PatientFamilyHistoryItem[]
  lifestyle: PatientLifestyleRecord | null
  measurements: PatientHealthMeasurementItem[]
  symptoms: PatientSymptomItem[]
  reviews: PatientHealthReviewItem[]
  lastUpdated: string
}


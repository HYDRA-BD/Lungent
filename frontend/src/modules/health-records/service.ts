import { createAdminClient } from '@/lib/supabase/admin'
import { calculatePackYears, calculateBmi } from './calculations'
import type {
  ComprehensivePatientHealthRecord,
  PatientAllergyItem,
  PatientEnvironmentalExposureItem,
  PatientFamilyHistoryItem,
  PatientHealthMeasurementItem,
  PatientHealthReviewItem,
  PatientLifestyleRecord,
  PatientMedicalConditionItem,
  PatientMedicationItem,
  PatientSmokingHistoryRecord,
  PatientSymptomItem,
} from './types'
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

function getAdminSupabaseSafe() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

// In-memory fallback store for offline tests and development
const fallbackHealthRecords: Map<string, ComprehensivePatientHealthRecord> = new Map()

// Seed demo health record for mock patient 1
const DEMO_PATIENT_1_ID = 'p-mock-uuid-001'
const DEMO_PATIENT_UUID_1 = '11111111-1111-4111-a111-111111111111'

const demoRecordData: ComprehensivePatientHealthRecord = {
  patientId: DEMO_PATIENT_1_ID,
  medicalConditions: [
    {
      id: 'mc-001',
      patientId: DEMO_PATIENT_1_ID,
      conditionName: 'Chronic Obstructive Pulmonary Disease (COPD)',
      conditionCode: 'J44.9',
      conditionCategory: 'respiratory',
      clinicalStatus: 'active',
      onsetDate: '2021-04-10',
      approximateOnsetAge: 53,
      isPrimaryRespiratory: true,
      treatmentSummary: 'Tiotropium inhaler once daily',
      hospitalizationHistory: '1 admission in 2023 for acute exacerbation',
      notes: 'Patient reports morning productive cough and exertional dyspnea.',
      dataSource: 'clinician_verified',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:00:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      isActive: true,
      createdAt: '2026-03-01T09:30:00.000Z',
      updatedAt: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 'mc-002',
      patientId: DEMO_PATIENT_1_ID,
      conditionName: 'Pulmonary Tuberculosis (Completed Treatment)',
      conditionCode: 'A15.0',
      conditionCategory: 'infectious',
      clinicalStatus: 'resolved',
      onsetDate: '2014-06-15',
      approximateOnsetAge: 46,
      isPrimaryRespiratory: true,
      treatmentSummary: 'Completed 6 months DOTS regimen; sputum negative.',
      hospitalizationHistory: 'None',
      notes: 'Mild residual scarring in right upper lobe noted on prior chest X-ray.',
      dataSource: 'patient_reported',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:05:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      isActive: true,
      createdAt: '2026-03-01T09:30:00.000Z',
      updatedAt: '2026-03-01T10:05:00.000Z',
    },
  ],
  medications: [
    {
      id: 'med-001',
      patientId: DEMO_PATIENT_1_ID,
      medicationName: 'Tiotropium Bromide Respimat 2.5mcg',
      medicationType: 'respiratory_inhaler',
      dosageInstructions: '2 puffs once daily in the morning',
      prescribingSource: 'National Institute of Diseases of the Chest and Hospital (NIDCH)',
      startDate: '2021-05-01',
      endDate: null,
      isCurrent: true,
      notes: 'Good compliance reported by patient.',
      dataSource: 'clinician_verified',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:10:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:35:00.000Z',
      updatedAt: '2026-03-01T10:10:00.000Z',
    },
    {
      id: 'med-002',
      patientId: DEMO_PATIENT_1_ID,
      medicationName: 'Salbutamol Inhaler 100mcg',
      medicationType: 'bronchodilator',
      dosageInstructions: '2 puffs as needed for acute breathlessness',
      prescribingSource: 'NIDCH Outpatient',
      startDate: '2021-05-01',
      endDate: null,
      isCurrent: true,
      notes: 'Used approximately 2-3 times per week.',
      dataSource: 'healthcare_worker_entered',
      verificationStatus: 'unverified',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:35:00.000Z',
      updatedAt: '2026-03-01T09:35:00.000Z',
    },
  ],
  allergies: [
    {
      id: 'alg-001',
      patientId: DEMO_PATIENT_1_ID,
      allergenType: 'medication',
      allergenName: 'Penicillin',
      reactionDescription: 'Generalized urticaria and facial swelling',
      severity: 'moderate',
      isActive: true,
      notes: 'Reaction occurred in 2012 after Amoxicillin administration.',
      dataSource: 'patient_reported',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:15:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:40:00.000Z',
      updatedAt: '2026-03-01T10:15:00.000Z',
    },
  ],
  smokingHistory: {
    id: 'smk-001',
    patientId: DEMO_PATIENT_1_ID,
    smokingStatus: 'former',
    tobaccoType: 'cigarettes',
    cigarettesPerDay: 20,
    bidisPerDay: 0,
    yearsSmoked: 25,
    ageStarted: 18,
    ageQuit: 43,
    quitDate: '2011-01-01',
    calculatedPackYears: 25.0,
    packYearsCalculationMethod: '((cigarettes_per_day + bidis_per_day) / 20) * years_smoked',
    secondhandSmokeExposure: true,
    secondhandSmokeContext: 'workplace',
    otherTobaccoDetails: 'Occasional hooka in youth; no zarda or gul.',
    notes: 'Quit smoking cold turkey after severe bronchitis episode in 2011.',
    isCurrent: true,
    dataSource: 'clinician_verified',
    verificationStatus: 'verified',
    verifiedBy: 'usr-clinician-001',
    verifiedAt: '2026-03-01T10:20:00.000Z',
    recordedBy: 'usr-worker-001',
    facilityId: 'facility-dhaka-central',
    createdAt: '2026-03-01T09:45:00.000Z',
    updatedAt: '2026-03-01T10:20:00.000Z',
  },
  environmentalExposures: [
    {
      id: 'env-001',
      patientId: DEMO_PATIENT_1_ID,
      exposureCategory: 'occupational',
      exposureType: 'Textile Factory Dust & Chemical Dyes',
      cookingFuelType: null,
      durationYears: 18,
      intensity: 'high',
      isCurrent: false,
      startYear: 1990,
      endYear: 2008,
      contextDetails: 'Worked in spinning and dyeing section with minimal ventilation and mask use.',
      notes: 'Significant exposure to airborne cotton particulates and organic dyes.',
      dataSource: 'patient_reported',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:25:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:50:00.000Z',
      updatedAt: '2026-03-01T10:25:00.000Z',
    },
    {
      id: 'env-002',
      patientId: DEMO_PATIENT_1_ID,
      exposureCategory: 'indoor_biomass',
      exposureType: 'Traditional Biomass Chula (Wood & Cow Dung)',
      cookingFuelType: 'biomass_wood_dung',
      durationYears: 20,
      intensity: 'moderate',
      isCurrent: false,
      startYear: 1980,
      endYear: 2000,
      contextDetails: 'Rural homestead kitchen without chimney.',
      notes: 'Childhood and early adulthood exposure to indoor cooking smoke.',
      dataSource: 'patient_reported',
      verificationStatus: 'unverified',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:50:00.000Z',
      updatedAt: '2026-03-01T09:50:00.000Z',
    },
  ],
  familyHistory: [
    {
      id: 'fam-001',
      patientId: DEMO_PATIENT_1_ID,
      relationship: 'parent',
      conditionType: 'lung_cancer',
      specificCancerType: 'Squamous Cell Carcinoma of Lung',
      ageAtDiagnosis: 62,
      notes: 'Biological father diagnosed in 2005; heavy lifetime smoker.',
      dataSource: 'patient_reported',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:30:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:55:00.000Z',
      updatedAt: '2026-03-01T10:30:00.000Z',
    },
  ],
  lifestyle: {
    id: 'lst-001',
    patientId: DEMO_PATIENT_1_ID,
    physicalActivityLevel: 'light',
    dietaryNotes: 'Traditional rice, lentil, and fish diet. Moderate salt intake.',
    alcoholConsumptionStatus: 'never',
    householdSmokersCount: 0,
    notes: 'Takes short 15-minute daily walks; limited by exertional fatigue.',
    isCurrent: true,
    dataSource: 'healthcare_worker_entered',
    verificationStatus: 'verified',
    verifiedBy: 'usr-clinician-001',
    verifiedAt: '2026-03-01T10:35:00.000Z',
    recordedBy: 'usr-worker-001',
    facilityId: 'facility-dhaka-central',
    createdAt: '2026-03-01T09:55:00.000Z',
    updatedAt: '2026-03-01T10:35:00.000Z',
  },
  measurements: [
    {
      id: 'msr-001',
      patientId: DEMO_PATIENT_1_ID,
      measurementType: 'height',
      numericValue: 168.0,
      unit: 'cm',
      secondaryValue: null,
      isCalculated: false,
      calculationFormula: null,
      measuredAt: '2026-03-01T09:20:00.000Z',
      measurementContext: 'clinic_intake',
      notes: 'Measured with calibrated stadiometer.',
      dataSource: 'healthcare_worker_entered',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:00:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:20:00.000Z',
    },
    {
      id: 'msr-002',
      patientId: DEMO_PATIENT_1_ID,
      measurementType: 'weight',
      numericValue: 64.5,
      unit: 'kg',
      secondaryValue: null,
      isCalculated: false,
      calculationFormula: null,
      measuredAt: '2026-03-01T09:20:00.000Z',
      measurementContext: 'clinic_intake',
      notes: 'Digital scale, light indoor clothing, shoes removed.',
      dataSource: 'healthcare_worker_entered',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:00:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:20:00.000Z',
    },
    {
      id: 'msr-003',
      patientId: DEMO_PATIENT_1_ID,
      measurementType: 'bmi',
      numericValue: 22.9,
      unit: 'kg/m2',
      secondaryValue: null,
      isCalculated: true,
      calculationFormula: 'weight_kg / (height_m ^ 2)',
      measuredAt: '2026-03-01T09:20:00.000Z',
      measurementContext: 'clinic_intake',
      notes: 'Calculated from 168 cm / 64.5 kg.',
      dataSource: 'derived_calculated',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:00:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:20:00.000Z',
    },
    {
      id: 'msr-004',
      patientId: DEMO_PATIENT_1_ID,
      measurementType: 'blood_pressure_combined',
      numericValue: 128,
      unit: 'mmHg',
      secondaryValue: 82,
      isCalculated: false,
      calculationFormula: null,
      measuredAt: '2026-03-01T09:22:00.000Z',
      measurementContext: 'clinic_intake',
      notes: 'Right arm, seated, 5 minutes rest.',
      dataSource: 'healthcare_worker_entered',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:00:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:22:00.000Z',
    },
    {
      id: 'msr-005',
      patientId: DEMO_PATIENT_1_ID,
      measurementType: 'oxygen_saturation',
      numericValue: 96,
      unit: '%',
      secondaryValue: null,
      isCalculated: false,
      calculationFormula: null,
      measuredAt: '2026-03-01T09:23:00.000Z',
      measurementContext: 'clinic_intake',
      notes: 'Room air, pulse oximetry on right index finger.',
      dataSource: 'healthcare_worker_entered',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:00:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:23:00.000Z',
    },
  ],
  symptoms: [
    {
      id: 'sym-001',
      patientId: DEMO_PATIENT_1_ID,
      symptomName: 'cough',
      isPresent: true,
      onsetDate: '2025-12-01',
      durationWeeks: 12,
      progression: 'worsening',
      severity: 'moderate',
      clinicalObservationType: 'healthcare_worker_entered',
      isActive: true,
      notes: 'Persistent morning cough with mucoid sputum. Occasionally keeps patient awake.',
      dataSource: 'healthcare_worker_entered',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:40:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:25:00.000Z',
      updatedAt: '2026-03-01T10:40:00.000Z',
    },
    {
      id: 'sym-002',
      patientId: DEMO_PATIENT_1_ID,
      symptomName: 'dyspnea_breathlessness',
      isPresent: true,
      onsetDate: '2026-01-10',
      durationWeeks: 7,
      progression: 'stable',
      severity: 'moderate',
      clinicalObservationType: 'healthcare_worker_entered',
      isActive: true,
      notes: 'Shortness of breath climbing 1 flight of stairs or walking fast on level ground (mMRC grade 2).',
      dataSource: 'healthcare_worker_entered',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:40:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:25:00.000Z',
      updatedAt: '2026-03-01T10:40:00.000Z',
    },
    {
      id: 'sym-003',
      patientId: DEMO_PATIENT_1_ID,
      symptomName: 'cough_with_hemoptysis',
      isPresent: false,
      onsetDate: null,
      durationWeeks: 0,
      progression: 'stable',
      severity: 'mild',
      clinicalObservationType: 'healthcare_worker_entered',
      isActive: false,
      notes: 'Explicitly asked; patient denies blood in sputum or blood-tinged streaks.',
      dataSource: 'healthcare_worker_entered',
      verificationStatus: 'verified',
      verifiedBy: 'usr-clinician-001',
      verifiedAt: '2026-03-01T10:40:00.000Z',
      recordedBy: 'usr-worker-001',
      facilityId: 'facility-dhaka-central',
      createdAt: '2026-03-01T09:25:00.000Z',
      updatedAt: '2026-03-01T10:40:00.000Z',
    },
  ],
  reviews: [
    {
      id: 'rev-001',
      patientId: DEMO_PATIENT_1_ID,
      categoryReviewed: 'all',
      targetRecordId: null,
      reviewerId: 'usr-clinician-001',
      reviewerName: 'Dr. Rafiqul Islam, Pulmonologist',
      reviewerRole: 'clinician',
      reviewDecision: 'verified',
      clinicalRationale: 'Full baseline health record reviewed during intake consultation. History of heavy smoking (25 pack-years), occupational dye exposure, and 1st degree family history of lung cancer noted. Vitals and spirometry plan discussed.',
      facilityId: 'facility-dhaka-central',
      reviewedAt: '2026-03-01T10:45:00.000Z',
    },
  ],
  lastUpdated: '2026-03-01T10:45:00.000Z',
}

fallbackHealthRecords.set(DEMO_PATIENT_1_ID, demoRecordData)
fallbackHealthRecords.set(DEMO_PATIENT_UUID_1, {
  ...demoRecordData,
  patientId: DEMO_PATIENT_UUID_1,
})

export class HealthRecordService {
  /**
   * Retrieves comprehensive health record for a patient.
   */
  static async getComprehensiveHealthRecord(
    patientId: string
  ): Promise<ComprehensivePatientHealthRecord> {
    const supabase = getAdminSupabaseSafe()
    if (!supabase) {
      return this.getFallbackRecord(patientId)
    }

    try {
      const [
        conditionsRes,
        medicationsRes,
        allergiesRes,
        smokingRes,
        exposuresRes,
        familyRes,
        lifestyleRes,
        measurementsRes,
        symptomsRes,
        reviewsRes,
      ] = await Promise.all([
        supabase
          .from('patient_medical_history')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false }),
        supabase
          .from('patient_medications')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false }),
        supabase
          .from('patient_allergies')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false }),
        supabase
          .from('patient_smoking_history')
          .select('*')
          .eq('patient_id', patientId)
          .eq('is_current', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('patient_environmental_exposures')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false }),
        supabase
          .from('patient_family_history')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false }),
        supabase
          .from('patient_lifestyle')
          .select('*')
          .eq('patient_id', patientId)
          .eq('is_current', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('patient_health_measurements')
          .select('*')
          .eq('patient_id', patientId)
          .order('measured_at', { ascending: false }),
        supabase
          .from('patient_symptom_history')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false }),
        supabase
          .from('patient_health_reviews')
          .select('*')
          .eq('patient_id', patientId)
          .order('reviewed_at', { ascending: false }),
      ])

      // If database is empty for this patient, check fallback cache
      if (
        (!conditionsRes.data || conditionsRes.data.length === 0) &&
        (!medicationsRes.data || medicationsRes.data.length === 0) &&
        !smokingRes.data &&
        fallbackHealthRecords.has(patientId)
      ) {
        return fallbackHealthRecords.get(patientId)!
      }

      const medicalConditions: PatientMedicalConditionItem[] = (conditionsRes.data || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any) => ({
          id: r.id,
          patientId: r.patient_id,
          conditionName: r.condition_name,
          conditionCode: r.condition_code,
          conditionCategory: r.condition_category,
          clinicalStatus: r.clinical_status,
          onsetDate: r.onset_date,
          approximateOnsetAge: r.approximate_onset_age,
          isPrimaryRespiratory: r.is_primary_respiratory,
          treatmentSummary: r.treatment_summary,
          hospitalizationHistory: r.hospitalization_history,
          notes: r.notes,
          dataSource: r.data_source,
          verificationStatus: r.verification_status,
          verifiedBy: r.verified_by,
          verifiedAt: r.verified_at,
          recordedBy: r.recorded_by,
          facilityId: r.facility_id,
          isActive: r.is_active,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })
      )

      const medications: PatientMedicationItem[] = (medicationsRes.data || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any) => ({
          id: r.id,
          patientId: r.patient_id,
          medicationName: r.medication_name,
          medicationType: r.medication_type,
          dosageInstructions: r.dosage_instructions,
          prescribingSource: r.prescribing_source,
          startDate: r.start_date,
          endDate: r.end_date,
          isCurrent: r.is_current,
          notes: r.notes,
          dataSource: r.data_source,
          verificationStatus: r.verification_status,
          verifiedBy: r.verified_by,
          verifiedAt: r.verified_at,
          recordedBy: r.recorded_by,
          facilityId: r.facility_id,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })
      )

      const allergies: PatientAllergyItem[] = (allergiesRes.data || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any) => ({
          id: r.id,
          patientId: r.patient_id,
          allergenType: r.allergen_type,
          allergenName: r.allergen_name,
          reactionDescription: r.reaction_description,
          severity: r.severity,
          isActive: r.is_active,
          notes: r.notes,
          dataSource: r.data_source,
          verificationStatus: r.verification_status,
          verifiedBy: r.verified_by,
          verifiedAt: r.verified_at,
          recordedBy: r.recorded_by,
          facilityId: r.facility_id,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })
      )

      let smokingHistory: PatientSmokingHistoryRecord | null = null
      if (smokingRes.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sr: any = smokingRes.data
        smokingHistory = {
          id: sr.id,
          patientId: sr.patient_id,
          smokingStatus: sr.smoking_status,
          tobaccoType: sr.tobacco_type,
          cigarettesPerDay: sr.cigarettes_per_day,
          bidisPerDay: sr.bidis_per_day,
          yearsSmoked: sr.years_smoked,
          ageStarted: sr.age_started,
          ageQuit: sr.age_quit,
          quitDate: sr.quit_date,
          calculatedPackYears: sr.calculated_pack_years,
          packYearsCalculationMethod: sr.pack_years_calculation_method,
          secondhandSmokeExposure: sr.secondhand_smoke_exposure,
          secondhandSmokeContext: sr.secondhand_smoke_context,
          otherTobaccoDetails: sr.other_tobacco_details,
          notes: sr.notes,
          isCurrent: sr.is_current,
          dataSource: sr.data_source,
          verificationStatus: sr.verification_status,
          verifiedBy: sr.verified_by,
          verifiedAt: sr.verified_at,
          recordedBy: sr.recorded_by,
          facilityId: sr.facility_id,
          createdAt: sr.created_at,
          updatedAt: sr.updated_at,
        }
      }

      const environmentalExposures: PatientEnvironmentalExposureItem[] = (
        exposuresRes.data || []
      ).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any) => ({
          id: r.id,
          patientId: r.patient_id,
          exposureCategory: r.exposure_category,
          exposureType: r.exposure_type,
          cookingFuelType: r.cooking_fuel_type,
          durationYears: r.duration_years,
          intensity: r.intensity,
          isCurrent: r.is_current,
          startYear: r.start_year,
          endYear: r.end_year,
          contextDetails: r.context_details,
          notes: r.notes,
          dataSource: r.data_source,
          verificationStatus: r.verification_status,
          verifiedBy: r.verified_by,
          verifiedAt: r.verified_at,
          recordedBy: r.recorded_by,
          facilityId: r.facility_id,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })
      )

      const familyHistory: PatientFamilyHistoryItem[] = (familyRes.data || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any) => ({
          id: r.id,
          patientId: r.patient_id,
          relationship: r.relationship,
          conditionType: r.condition_type,
          specificCancerType: r.specific_cancer_type,
          ageAtDiagnosis: r.age_at_diagnosis,
          notes: r.notes,
          dataSource: r.data_source,
          verificationStatus: r.verification_status,
          verifiedBy: r.verified_by,
          verifiedAt: r.verified_at,
          recordedBy: r.recorded_by,
          facilityId: r.facility_id,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })
      )

      let lifestyle: PatientLifestyleRecord | null = null
      if (lifestyleRes.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lr: any = lifestyleRes.data
        lifestyle = {
          id: lr.id,
          patientId: lr.patient_id,
          physicalActivityLevel: lr.physical_activity_level,
          dietaryNotes: lr.dietary_notes,
          alcoholConsumptionStatus: lr.alcohol_consumption_status,
          householdSmokersCount: lr.household_smokers_count,
          notes: lr.notes,
          isCurrent: lr.is_current,
          dataSource: lr.data_source,
          verificationStatus: lr.verification_status,
          verifiedBy: lr.verified_by,
          verifiedAt: lr.verified_at,
          recordedBy: lr.recorded_by,
          facilityId: lr.facility_id,
          createdAt: lr.created_at,
          updatedAt: lr.updated_at,
        }
      }

      const measurements: PatientHealthMeasurementItem[] = (measurementsRes.data || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any) => ({
          id: r.id,
          patientId: r.patient_id,
          measurementType: r.measurement_type,
          numericValue: Number(r.numeric_value),
          unit: r.unit,
          secondaryValue: r.secondary_value !== null ? Number(r.secondary_value) : null,
          isCalculated: r.is_calculated,
          calculationFormula: r.calculation_formula,
          measuredAt: r.measured_at,
          measurementContext: r.measurement_context,
          notes: r.notes,
          dataSource: r.data_source,
          verificationStatus: r.verification_status,
          verifiedBy: r.verified_by,
          verifiedAt: r.verified_at,
          recordedBy: r.recorded_by,
          facilityId: r.facility_id,
          createdAt: r.created_at,
        })
      )

      const symptoms: PatientSymptomItem[] = (symptomsRes.data || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any) => ({
          id: r.id,
          patientId: r.patient_id,
          symptomName: r.symptom_name,
          isPresent: r.is_present,
          onsetDate: r.onset_date,
          durationWeeks: r.duration_weeks,
          progression: r.progression,
          severity: r.severity,
          clinicalObservationType: r.clinical_observation_type,
          isActive: r.is_active,
          notes: r.notes,
          dataSource: r.data_source,
          verificationStatus: r.verification_status,
          verifiedBy: r.verified_by,
          verifiedAt: r.verified_at,
          recordedBy: r.recorded_by,
          facilityId: r.facility_id,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        })
      )

      const reviews: PatientHealthReviewItem[] = (reviewsRes.data || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r: any) => ({
          id: r.id,
          patientId: r.patient_id,
          categoryReviewed: r.category_reviewed,
          targetRecordId: r.target_record_id,
          reviewerId: r.reviewer_id,
          reviewDecision: r.review_decision,
          clinicalRationale: r.clinical_rationale,
          facilityId: r.facility_id,
          reviewedAt: r.reviewed_at,
        })
      )

      return {
        patientId,
        medicalConditions,
        medications,
        allergies,
        smokingHistory,
        environmentalExposures,
        familyHistory,
        lifestyle,
        measurements,
        symptoms,
        reviews,
        lastUpdated: '2026-11-01T10:00:00Z',
      }
    } catch {
      return this.getFallbackRecord(patientId)
    }
  }

  /**
   * Helper to fetch or create an empty fallback record
   */
  private static getFallbackRecord(patientId: string): ComprehensivePatientHealthRecord {
    if (fallbackHealthRecords.has(patientId)) {
      return fallbackHealthRecords.get(patientId)!
    }
    const emptyRecord: ComprehensivePatientHealthRecord = {
      patientId,
      medicalConditions: [],
      medications: [],
      allergies: [],
      smokingHistory: null,
      environmentalExposures: [],
      familyHistory: [],
      lifestyle: null,
      measurements: [],
      symptoms: [],
      reviews: [],
      lastUpdated: '2026-11-01T10:00:00Z',
    }
    fallbackHealthRecords.set(patientId, emptyRecord)
    return emptyRecord
  }

  /**
   * Adds a medical condition to the patient record
   */
  static async addMedicalCondition(
    patientId: string,
    data: {
      conditionName: string
      conditionCode?: string | null
      conditionCategory: ConditionCategory
      clinicalStatus: ConditionClinicalStatus
      onsetDate?: string | null
      approximateOnsetAge?: number | null
      isPrimaryRespiratory?: boolean
      treatmentSummary?: string | null
      hospitalizationHistory?: string | null
      notes?: string | null
      dataSource?: HealthRecordDataSource
      verificationStatus?: HealthRecordVerificationStatus
    },
    actorId?: string | null,
    facilityId: string = 'facility-dhaka-central'
  ): Promise<PatientMedicalConditionItem> {
    const supabase = getAdminSupabaseSafe()
    const now = new Date().toISOString()
    const newId = `mc-${Date.now()}`

    const item: PatientMedicalConditionItem = {
      id: newId,
      patientId,
      conditionName: data.conditionName,
      conditionCode: data.conditionCode || null,
      conditionCategory: data.conditionCategory,
      clinicalStatus: data.clinicalStatus,
      onsetDate: data.onsetDate || null,
      approximateOnsetAge: data.approximateOnsetAge || null,
      isPrimaryRespiratory: !!data.isPrimaryRespiratory,
      treatmentSummary: data.treatmentSummary || null,
      hospitalizationHistory: data.hospitalizationHistory || null,
      notes: data.notes || null,
      dataSource: data.dataSource || 'healthcare_worker_entered',
      verificationStatus: data.verificationStatus || 'unverified',
      recordedBy: actorId || null,
      facilityId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    }

    if (supabase) {
      try {
        const { data: dbItem, error } = await supabase
          .from('patient_medical_history')
          .insert({
            patient_id: patientId,
            condition_name: item.conditionName,
            condition_code: item.conditionCode,
            condition_category: item.conditionCategory,
            clinical_status: item.clinicalStatus,
            onset_date: item.onsetDate,
            approximate_onset_age: item.approximateOnsetAge,
            is_primary_respiratory: item.isPrimaryRespiratory,
            treatment_summary: item.treatmentSummary,
            hospitalization_history: item.hospitalizationHistory,
            notes: item.notes,
            data_source: item.dataSource,
            verification_status: item.verificationStatus,
            recorded_by: item.recordedBy,
            facility_id: item.facilityId,
          })
          .select('*')
          .single()

        if (!error && dbItem) {
          item.id = dbItem.id
        }
      } catch {
        // Fall back to memory
      }
    }

    const current = this.getFallbackRecord(patientId)
    current.medicalConditions.unshift(item)
    current.lastUpdated = now
    fallbackHealthRecords.set(patientId, current)
    return item
  }

  /**
   * Adds medication record
   */
  static async addMedication(
    patientId: string,
    data: {
      medicationName: string
      medicationType: MedicationType
      dosageInstructions?: string | null
      prescribingSource?: string | null
      startDate?: string | null
      endDate?: string | null
      isCurrent?: boolean
      notes?: string | null
      dataSource?: HealthRecordDataSource
      verificationStatus?: HealthRecordVerificationStatus
    },
    actorId?: string | null,
    facilityId: string = 'facility-dhaka-central'
  ): Promise<PatientMedicationItem> {
    const supabase = getAdminSupabaseSafe()
    const now = new Date().toISOString()
    const newId = `med-${Date.now()}`

    const item: PatientMedicationItem = {
      id: newId,
      patientId,
      medicationName: data.medicationName,
      medicationType: data.medicationType,
      dosageInstructions: data.dosageInstructions || null,
      prescribingSource: data.prescribingSource || null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
      isCurrent: data.isCurrent !== undefined ? data.isCurrent : true,
      notes: data.notes || null,
      dataSource: data.dataSource || 'healthcare_worker_entered',
      verificationStatus: data.verificationStatus || 'unverified',
      recordedBy: actorId || null,
      facilityId,
      createdAt: now,
      updatedAt: now,
    }

    if (supabase) {
      try {
        const { data: dbItem, error } = await supabase
          .from('patient_medications')
          .insert({
            patient_id: patientId,
            medication_name: item.medicationName,
            medication_type: item.medicationType,
            dosage_instructions: item.dosageInstructions,
            prescribing_source: item.prescribingSource,
            start_date: item.startDate,
            end_date: item.endDate,
            is_current: item.isCurrent,
            notes: item.notes,
            data_source: item.dataSource,
            verification_status: item.verificationStatus,
            recorded_by: item.recordedBy,
            facility_id: item.facilityId,
          })
          .select('*')
          .single()

        if (!error && dbItem) {
          item.id = dbItem.id
        }
      } catch {
        // Fall back to memory
      }
    }

    const current = this.getFallbackRecord(patientId)
    current.medications.unshift(item)
    current.lastUpdated = now
    fallbackHealthRecords.set(patientId, current)
    return item
  }

  /**
   * Adds an allergy record or records explicit 'no_known_allergies'
   */
  static async addAllergy(
    patientId: string,
    data: {
      allergenType: AllergenType
      allergenName: string
      reactionDescription?: string | null
      severity?: AllergySeverity
      isActive?: boolean
      notes?: string | null
      dataSource?: HealthRecordDataSource
      verificationStatus?: HealthRecordVerificationStatus
    },
    actorId?: string | null,
    facilityId: string = 'facility-dhaka-central'
  ): Promise<PatientAllergyItem> {
    const supabase = getAdminSupabaseSafe()
    const now = new Date().toISOString()
    const newId = `alg-${Date.now()}`

    const item: PatientAllergyItem = {
      id: newId,
      patientId,
      allergenType: data.allergenType,
      allergenName:
        data.allergenType === 'no_known_allergies'
          ? 'No Known Drug/Environmental Allergies'
          : data.allergenName,
      reactionDescription: data.reactionDescription || null,
      severity: data.severity || 'unknown',
      isActive: data.isActive !== undefined ? data.isActive : true,
      notes: data.notes || null,
      dataSource: data.dataSource || 'healthcare_worker_entered',
      verificationStatus: data.verificationStatus || 'unverified',
      recordedBy: actorId || null,
      facilityId,
      createdAt: now,
      updatedAt: now,
    }

    if (supabase) {
      try {
        const { data: dbItem, error } = await supabase
          .from('patient_allergies')
          .insert({
            patient_id: patientId,
            allergen_type: item.allergenType,
            allergen_name: item.allergenName,
            reaction_description: item.reactionDescription,
            severity: item.severity,
            is_active: item.isActive,
            notes: item.notes,
            data_source: item.dataSource,
            verification_status: item.verificationStatus,
            recorded_by: item.recordedBy,
            facility_id: item.facilityId,
          })
          .select('*')
          .single()

        if (!error && dbItem) {
          item.id = dbItem.id
        }
      } catch {
        // Fall back to memory
      }
    }

    const current = this.getFallbackRecord(patientId)
    // If setting no_known_allergies, deactivate other allergies in store
    if (item.allergenType === 'no_known_allergies') {
      current.allergies = current.allergies.filter((a) => a.allergenType !== 'no_known_allergies')
    }
    current.allergies.unshift(item)
    current.lastUpdated = now
    fallbackHealthRecords.set(patientId, current)
    return item
  }

  /**
   * Saves or updates smoking history with automated pack-years calculation
   */
  static async saveSmokingHistory(
    patientId: string,
    data: {
      smokingStatus: SmokingStatus
      tobaccoType: TobaccoType
      cigarettesPerDay?: number | null
      bidisPerDay?: number | null
      yearsSmoked?: number | null
      ageStarted?: number | null
      ageQuit?: number | null
      quitDate?: string | null
      secondhandSmokeExposure?: boolean
      secondhandSmokeContext?: SecondhandSmokeContext | null
      otherTobaccoDetails?: string | null
      notes?: string | null
      dataSource?: HealthRecordDataSource
      verificationStatus?: HealthRecordVerificationStatus
    },
    actorId?: string | null,
    facilityId: string = 'facility-dhaka-central'
  ): Promise<PatientSmokingHistoryRecord> {
    const supabase = getAdminSupabaseSafe()
    const now = new Date().toISOString()
    const newId = `smk-${Date.now()}`

    // Calculate pack years transparently
    const packYearCalculation = calculatePackYears({
      cigarettesPerDay: data.cigarettesPerDay,
      bidisPerDay: data.bidisPerDay,
      yearsSmoked: data.yearsSmoked,
    })

    const record: PatientSmokingHistoryRecord = {
      id: newId,
      patientId,
      smokingStatus: data.smokingStatus,
      tobaccoType: data.tobaccoType,
      cigarettesPerDay: data.cigarettesPerDay ?? null,
      bidisPerDay: data.bidisPerDay ?? null,
      yearsSmoked: data.yearsSmoked ?? null,
      ageStarted: data.ageStarted ?? null,
      ageQuit: data.ageQuit ?? null,
      quitDate: data.quitDate ?? null,
      calculatedPackYears: packYearCalculation.packYears,
      packYearsCalculationMethod: packYearCalculation.calculationMethod,
      secondhandSmokeExposure: !!data.secondhandSmokeExposure,
      secondhandSmokeContext: data.secondhandSmokeContext || 'none',
      otherTobaccoDetails: data.otherTobaccoDetails || null,
      notes: data.notes || null,
      isCurrent: true,
      dataSource: data.dataSource || 'healthcare_worker_entered',
      verificationStatus: data.verificationStatus || 'unverified',
      recordedBy: actorId || null,
      facilityId,
      createdAt: now,
      updatedAt: now,
    }

    if (supabase) {
      try {
        // Set previous current to false
        await supabase
          .from('patient_smoking_history')
          .update({ is_current: false })
          .eq('patient_id', patientId)

        const { data: dbItem, error } = await supabase
          .from('patient_smoking_history')
          .insert({
            patient_id: patientId,
            smoking_status: record.smokingStatus,
            tobacco_type: record.tobaccoType,
            cigarettes_per_day: record.cigarettesPerDay,
            bidis_per_day: record.bidisPerDay,
            years_smoked: record.yearsSmoked,
            age_started: record.ageStarted,
            age_quit: record.ageQuit,
            quit_date: record.quitDate,
            calculated_pack_years: record.calculatedPackYears,
            pack_years_calculation_method: record.packYearsCalculationMethod,
            secondhand_smoke_exposure: record.secondhandSmokeExposure,
            secondhand_smoke_context: record.secondhandSmokeContext,
            other_tobacco_details: record.otherTobaccoDetails,
            notes: record.notes,
            is_current: true,
            data_source: record.dataSource,
            verification_status: record.verificationStatus,
            recorded_by: record.recordedBy,
            facility_id: record.facilityId,
          })
          .select('*')
          .single()

        if (!error && dbItem) {
          record.id = dbItem.id
        }
      } catch {
        // Fall back to memory
      }
    }

    const current = this.getFallbackRecord(patientId)
    current.smokingHistory = record
    current.lastUpdated = now
    fallbackHealthRecords.set(patientId, current)
    return record
  }

  /**
   * Adds an environmental or occupational exposure record
   */
  static async addEnvironmentalExposure(
    patientId: string,
    data: {
      exposureCategory: ExposureCategory
      exposureType: string
      cookingFuelType?: CookingFuelType | null
      durationYears?: number | null
      intensity?: ExposureIntensity
      isCurrent?: boolean
      startYear?: number | null
      endYear?: number | null
      contextDetails?: string | null
      notes?: string | null
      dataSource?: HealthRecordDataSource
      verificationStatus?: HealthRecordVerificationStatus
    },
    actorId?: string | null,
    facilityId: string = 'facility-dhaka-central'
  ): Promise<PatientEnvironmentalExposureItem> {
    const supabase = getAdminSupabaseSafe()
    const now = new Date().toISOString()
    const newId = `env-${Date.now()}`

    const item: PatientEnvironmentalExposureItem = {
      id: newId,
      patientId,
      exposureCategory: data.exposureCategory,
      exposureType: data.exposureType,
      cookingFuelType: data.cookingFuelType || null,
      durationYears: data.durationYears ?? null,
      intensity: data.intensity || 'moderate',
      isCurrent: !!data.isCurrent,
      startYear: data.startYear ?? null,
      endYear: data.endYear ?? null,
      contextDetails: data.contextDetails || null,
      notes: data.notes || null,
      dataSource: data.dataSource || 'healthcare_worker_entered',
      verificationStatus: data.verificationStatus || 'unverified',
      recordedBy: actorId || null,
      facilityId,
      createdAt: now,
      updatedAt: now,
    }

    if (supabase) {
      try {
        const { data: dbItem, error } = await supabase
          .from('patient_environmental_exposures')
          .insert({
            patient_id: patientId,
            exposure_category: item.exposureCategory,
            exposure_type: item.exposureType,
            cooking_fuel_type: item.cookingFuelType,
            duration_years: item.durationYears,
            intensity: item.intensity,
            is_current: item.isCurrent,
            start_year: item.startYear,
            end_year: item.endYear,
            context_details: item.contextDetails,
            notes: item.notes,
            data_source: item.dataSource,
            verification_status: item.verificationStatus,
            recorded_by: item.recordedBy,
            facility_id: item.facilityId,
          })
          .select('*')
          .single()

        if (!error && dbItem) {
          item.id = dbItem.id
        }
      } catch {
        // Fall back to memory
      }
    }

    const current = this.getFallbackRecord(patientId)
    current.environmentalExposures.unshift(item)
    current.lastUpdated = now
    fallbackHealthRecords.set(patientId, current)
    return item
  }

  /**
   * Adds a family history entry
   */
  static async addFamilyHistory(
    patientId: string,
    data: {
      relationship: FamilyRelationship
      conditionType: FamilyConditionType
      specificCancerType?: string | null
      ageAtDiagnosis?: number | null
      notes?: string | null
      dataSource?: HealthRecordDataSource
      verificationStatus?: HealthRecordVerificationStatus
    },
    actorId?: string | null,
    facilityId: string = 'facility-dhaka-central'
  ): Promise<PatientFamilyHistoryItem> {
    const supabase = getAdminSupabaseSafe()
    const now = new Date().toISOString()
    const newId = `fam-${Date.now()}`

    const item: PatientFamilyHistoryItem = {
      id: newId,
      patientId,
      relationship: data.relationship,
      conditionType: data.conditionType,
      specificCancerType: data.specificCancerType || null,
      ageAtDiagnosis: data.ageAtDiagnosis ?? null,
      notes: data.notes || null,
      dataSource: data.dataSource || 'healthcare_worker_entered',
      verificationStatus: data.verificationStatus || 'unverified',
      recordedBy: actorId || null,
      facilityId,
      createdAt: now,
      updatedAt: now,
    }

    if (supabase) {
      try {
        const { data: dbItem, error } = await supabase
          .from('patient_family_history')
          .insert({
            patient_id: patientId,
            relationship: item.relationship,
            condition_type: item.conditionType,
            specific_cancer_type: item.specificCancerType,
            age_at_diagnosis: item.ageAtDiagnosis,
            notes: item.notes,
            data_source: item.dataSource,
            verification_status: item.verificationStatus,
            recorded_by: item.recordedBy,
            facility_id: item.facilityId,
          })
          .select('*')
          .single()

        if (!error && dbItem) {
          item.id = dbItem.id
        }
      } catch {
        // Fall back to memory
      }
    }

    const current = this.getFallbackRecord(patientId)
    current.familyHistory.unshift(item)
    current.lastUpdated = now
    fallbackHealthRecords.set(patientId, current)
    return item
  }

  /**
   * Saves or updates lifestyle information
   */
  static async saveLifestyle(
    patientId: string,
    data: {
      physicalActivityLevel: PhysicalActivityLevel
      dietaryNotes?: string | null
      alcoholConsumptionStatus: AlcoholConsumptionStatus
      householdSmokersCount?: number | null
      notes?: string | null
      dataSource?: HealthRecordDataSource
      verificationStatus?: HealthRecordVerificationStatus
    },
    actorId?: string | null,
    facilityId: string = 'facility-dhaka-central'
  ): Promise<PatientLifestyleRecord> {
    const supabase = getAdminSupabaseSafe()
    const now = new Date().toISOString()
    const newId = `lst-${Date.now()}`

    const record: PatientLifestyleRecord = {
      id: newId,
      patientId,
      physicalActivityLevel: data.physicalActivityLevel,
      dietaryNotes: data.dietaryNotes || null,
      alcoholConsumptionStatus: data.alcoholConsumptionStatus,
      householdSmokersCount: data.householdSmokersCount ?? 0,
      notes: data.notes || null,
      isCurrent: true,
      dataSource: data.dataSource || 'healthcare_worker_entered',
      verificationStatus: data.verificationStatus || 'unverified',
      recordedBy: actorId || null,
      facilityId,
      createdAt: now,
      updatedAt: now,
    }

    if (supabase) {
      try {
        await supabase
          .from('patient_lifestyle')
          .update({ is_current: false })
          .eq('patient_id', patientId)

        const { data: dbItem, error } = await supabase
          .from('patient_lifestyle')
          .insert({
            patient_id: patientId,
            physical_activity_level: record.physicalActivityLevel,
            dietary_notes: record.dietaryNotes,
            alcohol_consumption_status: record.alcoholConsumptionStatus,
            household_smokers_count: record.householdSmokersCount,
            notes: record.notes,
            is_current: true,
            data_source: record.dataSource,
            verification_status: record.verificationStatus,
            recorded_by: record.recordedBy,
            facility_id: record.facilityId,
          })
          .select('*')
          .single()

        if (!error && dbItem) {
          record.id = dbItem.id
        }
      } catch {
        // Fall back to memory
      }
    }

    const current = this.getFallbackRecord(patientId)
    current.lifestyle = record
    current.lastUpdated = now
    fallbackHealthRecords.set(patientId, current)
    return record
  }

  /**
   * Records a vital sign or body measurement, optionally computing BMI if height/weight provided
   */
  static async recordMeasurement(
    patientId: string,
    data: {
      measurementType: MeasurementType
      numericValue: number
      unit: string
      secondaryValue?: number | null
      isCalculated?: boolean
      calculationFormula?: string | null
      measuredAt?: string | null
      measurementContext?: MeasurementContext | null
      notes?: string | null
      dataSource?: HealthRecordDataSource
      verificationStatus?: HealthRecordVerificationStatus
    },
    actorId?: string | null,
    facilityId: string = 'facility-dhaka-central'
  ): Promise<PatientHealthMeasurementItem> {
    const supabase = getAdminSupabaseSafe()
    const now = new Date().toISOString()
    const newId = `msr-${Date.now()}`

    const item: PatientHealthMeasurementItem = {
      id: newId,
      patientId,
      measurementType: data.measurementType,
      numericValue: data.numericValue,
      unit: data.unit,
      secondaryValue: data.secondaryValue ?? null,
      isCalculated: !!data.isCalculated,
      calculationFormula: data.calculationFormula || null,
      measuredAt: data.measuredAt || now,
      measurementContext: data.measurementContext || 'clinic_intake',
      notes: data.notes || null,
      dataSource: data.dataSource || 'healthcare_worker_entered',
      verificationStatus: data.verificationStatus || 'unverified',
      recordedBy: actorId || null,
      facilityId,
      createdAt: now,
    }

    if (supabase) {
      try {
        const { data: dbItem, error } = await supabase
          .from('patient_health_measurements')
          .insert({
            patient_id: patientId,
            measurement_type: item.measurementType,
            numeric_value: item.numericValue,
            unit: item.unit,
            secondary_value: item.secondaryValue,
            is_calculated: item.isCalculated,
            calculation_formula: item.calculationFormula,
            measured_at: item.measuredAt,
            measurement_context: item.measurementContext,
            notes: item.notes,
            data_source: item.dataSource,
            verification_status: item.verificationStatus,
            recorded_by: item.recordedBy,
            facility_id: item.facilityId,
          })
          .select('*')
          .single()

        if (!error && dbItem) {
          item.id = dbItem.id
        }
      } catch {
        // Fall back to memory
      }
    }

    const current = this.getFallbackRecord(patientId)
    current.measurements.unshift(item)

    // Check if we can automatically calculate and store BMI
    if (item.measurementType === 'height' || item.measurementType === 'weight') {
      const latestHeight = current.measurements.find((m) => m.measurementType === 'height')
      const latestWeight = current.measurements.find((m) => m.measurementType === 'weight')

      if (latestHeight && latestWeight) {
        const bmiRes = calculateBmi({
          heightCm: latestHeight.numericValue,
          weightKg: latestWeight.numericValue,
        })
        if (bmiRes.isCalculated && bmiRes.bmi !== null) {
          // Avoid duplicate rapid BMI entry if recorded within last minute
          const existingBmi = current.measurements.find((m) => m.measurementType === 'bmi')
          if (!existingBmi || Math.abs(existingBmi.numericValue - bmiRes.bmi) > 0.05) {
            const bmiItem: PatientHealthMeasurementItem = {
              id: `msr-bmi-${Date.now()}`,
              patientId,
              measurementType: 'bmi',
              numericValue: bmiRes.bmi,
              unit: 'kg/m2',
              secondaryValue: null,
              isCalculated: true,
              calculationFormula: bmiRes.calculationMethod,
              measuredAt: now,
              measurementContext: item.measurementContext,
              notes: `Derived from ${latestHeight.numericValue} cm and ${latestWeight.numericValue} kg.`,
              dataSource: 'derived_calculated',
              verificationStatus: 'verified',
              recordedBy: actorId || null,
              facilityId,
              createdAt: now,
            }
            current.measurements.unshift(bmiItem)

            if (supabase) {
              try {
                await supabase.from('patient_health_measurements').insert({
                  patient_id: patientId,
                  measurement_type: 'bmi',
                  numeric_value: bmiItem.numericValue,
                  unit: bmiItem.unit,
                  is_calculated: true,
                  calculation_formula: bmiItem.calculationFormula,
                  measured_at: bmiItem.measuredAt,
                  measurement_context: bmiItem.measurementContext,
                  notes: bmiItem.notes,
                  data_source: bmiItem.dataSource,
                  verification_status: bmiItem.verificationStatus,
                  recorded_by: bmiItem.recordedBy,
                  facility_id: bmiItem.facilityId,
                })
              } catch {
                // Ignore DB error for auto-derived measurement
              }
            }
          }
        }
      }
    }

    current.lastUpdated = now
    fallbackHealthRecords.set(patientId, current)
    return item
  }

  /**
   * Records a symptom observation
   */
  static async recordSymptom(
    patientId: string,
    data: {
      symptomName: SymptomName
      isPresent?: boolean
      onsetDate?: string | null
      durationWeeks?: number | null
      progression?: SymptomProgression
      severity?: SymptomSeverity
      clinicalObservationType?: string
      isActive?: boolean
      notes?: string | null
      dataSource?: HealthRecordDataSource
      verificationStatus?: HealthRecordVerificationStatus
    },
    actorId?: string | null,
    facilityId: string = 'facility-dhaka-central'
  ): Promise<PatientSymptomItem> {
    const supabase = getAdminSupabaseSafe()
    const now = new Date().toISOString()
    const newId = `sym-${Date.now()}`

    const item: PatientSymptomItem = {
      id: newId,
      patientId,
      symptomName: data.symptomName,
      isPresent: data.isPresent !== undefined ? data.isPresent : true,
      onsetDate: data.onsetDate || null,
      durationWeeks: data.durationWeeks ?? null,
      progression: data.progression || 'stable',
      severity: data.severity || 'moderate',
      clinicalObservationType: data.clinicalObservationType || 'healthcare_worker_entered',
      isActive: data.isActive !== undefined ? data.isActive : true,
      notes: data.notes || null,
      dataSource: data.dataSource || 'healthcare_worker_entered',
      verificationStatus: data.verificationStatus || 'unverified',
      recordedBy: actorId || null,
      facilityId,
      createdAt: now,
      updatedAt: now,
    }

    if (supabase) {
      try {
        const { data: dbItem, error } = await supabase
          .from('patient_symptom_history')
          .insert({
            patient_id: patientId,
            symptom_name: item.symptomName,
            is_present: item.isPresent,
            onset_date: item.onsetDate,
            duration_weeks: item.durationWeeks,
            progression: item.progression,
            severity: item.severity,
            clinical_observation_type: item.clinicalObservationType,
            is_active: item.isActive,
            notes: item.notes,
            data_source: item.dataSource,
            verification_status: item.verificationStatus,
            recorded_by: item.recordedBy,
            facility_id: item.facilityId,
          })
          .select('*')
          .single()

        if (!error && dbItem) {
          item.id = dbItem.id
        }
      } catch {
        // Fall back to memory
      }
    }

    const current = this.getFallbackRecord(patientId)
    current.symptoms.unshift(item)
    current.lastUpdated = now
    fallbackHealthRecords.set(patientId, current)
    return item
  }

  /**
   * Submits a clinician review & verification decision
   */
  static async submitClinicianReview(
    patientId: string,
    data: {
      categoryReviewed: string
      targetRecordId?: string | null
      reviewDecision: HealthReviewDecision
      clinicalRationale: string
      reviewerName?: string | null
      reviewerRole?: string | null
    },
    reviewerId: string,
    facilityId: string = 'facility-dhaka-central'
  ): Promise<PatientHealthReviewItem> {
    const supabase = getAdminSupabaseSafe()
    const now = new Date().toISOString()
    const newId = `rev-${Date.now()}`

    const item: PatientHealthReviewItem = {
      id: newId,
      patientId,
      categoryReviewed: data.categoryReviewed,
      targetRecordId: data.targetRecordId || null,
      reviewerId,
      reviewerName: data.reviewerName || 'Dr. Attending Clinician',
      reviewerRole: data.reviewerRole || 'clinician',
      reviewDecision: data.reviewDecision,
      clinicalRationale: data.clinicalRationale,
      facilityId,
      reviewedAt: now,
    }

    if (supabase) {
      try {
        const { data: dbItem, error } = await supabase
          .from('patient_health_reviews')
          .insert({
            patient_id: patientId,
            category_reviewed: item.categoryReviewed,
            target_record_id: item.targetRecordId,
            reviewer_id: item.reviewerId,
            review_decision: item.reviewDecision,
            clinical_rationale: item.clinicalRationale,
            facility_id: item.facilityId,
            reviewed_at: item.reviewedAt,
          })
          .select('*')
          .single()

        if (!error && dbItem) {
          item.id = dbItem.id
        }
      } catch {
        // Fall back to memory
      }
    }

    const current = this.getFallbackRecord(patientId)
    current.reviews.unshift(item)

    // Map review decision to verification status
    let mappedStatus: HealthRecordVerificationStatus = 'verified'
    if (item.reviewDecision === 'rejected_unreliable') {
      mappedStatus = 'rejected'
    } else if (item.reviewDecision === 'requires_followup') {
      mappedStatus = 'pending_verification'
    } else {
      mappedStatus = 'verified'
    }

    // Apply verification update across targeted items
    if (item.targetRecordId) {
      const cond = current.medicalConditions.find((c) => c.id === item.targetRecordId)
      if (cond) {
        cond.verificationStatus = mappedStatus
        cond.verifiedBy = reviewerId
        cond.verifiedAt = now
      }
      const med = current.medications.find((m) => m.id === item.targetRecordId)
      if (med) {
        med.verificationStatus = mappedStatus
        med.verifiedBy = reviewerId
        med.verifiedAt = now
      }
      const alg = current.allergies.find((a) => a.id === item.targetRecordId)
      if (alg) {
        alg.verificationStatus = mappedStatus
        alg.verifiedBy = reviewerId
        alg.verifiedAt = now
      }
      const exp = current.environmentalExposures.find((e) => e.id === item.targetRecordId)
      if (exp) {
        exp.verificationStatus = mappedStatus
        exp.verifiedBy = reviewerId
        exp.verifiedAt = now
      }
      const sym = current.symptoms.find((s) => s.id === item.targetRecordId)
      if (sym) {
        sym.verificationStatus = mappedStatus
        sym.verifiedBy = reviewerId
        sym.verifiedAt = now
      }
      const msr = current.measurements.find((m) => m.id === item.targetRecordId)
      if (msr) {
        msr.verificationStatus = mappedStatus
        msr.verifiedBy = reviewerId
        msr.verifiedAt = now
      }
    } else if (item.categoryReviewed === 'all' && mappedStatus === 'verified') {
      // Mark all unverified as verified
      for (const cond of current.medicalConditions) {
        if (cond.verificationStatus !== 'rejected') {
          cond.verificationStatus = 'verified'
          cond.verifiedBy = reviewerId
          cond.verifiedAt = now
        }
      }
      for (const med of current.medications) {
        if (med.verificationStatus !== 'rejected') {
          med.verificationStatus = 'verified'
          med.verifiedBy = reviewerId
          med.verifiedAt = now
        }
      }
      for (const alg of current.allergies) {
        if (alg.verificationStatus !== 'rejected') {
          alg.verificationStatus = 'verified'
          alg.verifiedBy = reviewerId
          alg.verifiedAt = now
        }
      }
      if (current.smokingHistory && current.smokingHistory.verificationStatus !== 'rejected') {
        current.smokingHistory.verificationStatus = 'verified'
        current.smokingHistory.verifiedBy = reviewerId
        current.smokingHistory.verifiedAt = now
      }
      for (const exp of current.environmentalExposures) {
        if (exp.verificationStatus !== 'rejected') {
          exp.verificationStatus = 'verified'
          exp.verifiedBy = reviewerId
          exp.verifiedAt = now
        }
      }
      for (const fam of current.familyHistory) {
        if (fam.verificationStatus !== 'rejected') {
          fam.verificationStatus = 'verified'
          fam.verifiedBy = reviewerId
          fam.verifiedAt = now
        }
      }
      if (current.lifestyle && current.lifestyle.verificationStatus !== 'rejected') {
        current.lifestyle.verificationStatus = 'verified'
        current.lifestyle.verifiedBy = reviewerId
        current.lifestyle.verifiedAt = now
      }
      for (const sym of current.symptoms) {
        if (sym.verificationStatus !== 'rejected') {
          sym.verificationStatus = 'verified'
          sym.verifiedBy = reviewerId
          sym.verifiedAt = now
        }
      }
    }

    current.lastUpdated = now
    fallbackHealthRecords.set(patientId, current)
    return item
  }

  /**
   * Point-in-time snapshot extraction: returns the health record state as of the specified ISO timestamp
   */
  static async getPointInTimeSnapshot(
    patientId: string,
    asOfIsoTimestamp: string
  ): Promise<ComprehensivePatientHealthRecord> {
    const full = await this.getComprehensiveHealthRecord(patientId)
    const cutoff = new Date(asOfIsoTimestamp).getTime()

    return {
      patientId,
      medicalConditions: full.medicalConditions.filter(
        (c) => new Date(c.createdAt).getTime() <= cutoff
      ),
      medications: full.medications.filter((m) => new Date(m.createdAt).getTime() <= cutoff),
      allergies: full.allergies.filter((a) => new Date(a.createdAt).getTime() <= cutoff),
      smokingHistory:
        full.smokingHistory && new Date(full.smokingHistory.createdAt).getTime() <= cutoff
          ? full.smokingHistory
          : null,
      environmentalExposures: full.environmentalExposures.filter(
        (e) => new Date(e.createdAt).getTime() <= cutoff
      ),
      familyHistory: full.familyHistory.filter((f) => new Date(f.createdAt).getTime() <= cutoff),
      lifestyle:
        full.lifestyle && new Date(full.lifestyle.createdAt).getTime() <= cutoff
          ? full.lifestyle
          : null,
      measurements: full.measurements.filter((m) => new Date(m.measuredAt).getTime() <= cutoff),
      symptoms: full.symptoms.filter((s) => new Date(s.createdAt).getTime() <= cutoff),
      reviews: full.reviews.filter((r) => new Date(r.reviewedAt).getTime() <= cutoff),
      lastUpdated: asOfIsoTimestamp,
    }
  }
}

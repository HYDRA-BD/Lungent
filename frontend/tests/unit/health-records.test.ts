import { describe, it, expect } from 'vitest'
import {
  calculatePackYears,
  calculateBmi,
  validateMeasurementRanges,
} from '@/modules/health-records/calculations'
import {
  medicalConditionSchema,
  medicationSchema,
  allergySchema,
  smokingHistorySchema,
  environmentalExposureSchema,
  familyHistorySchema,
  lifestyleSchema,
  measurementSchema,
  symptomSchema,
  clinicianReviewSchema,
} from '@/modules/health-records/validation'
import { HealthRecordService } from '@/modules/health-records/service'

describe('Phase 1.7: Health Records Clinical Calculations', () => {
  describe('calculatePackYears', () => {
    it('accurately calculates pack-years for standard cigarette smoking', () => {
      const res = calculatePackYears({
        cigarettesPerDay: 20,
        yearsSmoked: 20,
      })
      expect(res.isCalculated).toBe(true)
      expect(res.packYears).toBe(20.0)
      expect(res.calculationMethod).toBe('((cigarettes_per_day + bidis_per_day) / 20) * years_smoked')
    })

    it('accurately calculates pack-years for mixed cigarettes and bidis', () => {
      const res = calculatePackYears({
        cigarettesPerDay: 10,
        bidisPerDay: 10,
        yearsSmoked: 25,
      })
      expect(res.isCalculated).toBe(true)
      expect(res.packYears).toBe(25.0)
    })

    it('handles decimal results and rounds to 1 decimal place', () => {
      const res = calculatePackYears({
        cigarettesPerDay: 15,
        yearsSmoked: 17,
      })
      // 15/20 = 0.75 * 17 = 12.75 -> rounded to 12.8
      expect(res.isCalculated).toBe(true)
      expect(res.packYears).toBe(12.8)
    })

    it('does NOT calculate pack-years when years smoked is missing', () => {
      const res = calculatePackYears({
        cigarettesPerDay: 20,
        yearsSmoked: null,
      })
      expect(res.isCalculated).toBe(false)
      expect(res.packYears).toBeNull()
      expect(res.notes).toContain('Incomplete')
    })

    it('does NOT calculate pack-years when cigarettes and bidis are both missing', () => {
      const res = calculatePackYears({
        cigarettesPerDay: null,
        bidisPerDay: null,
        yearsSmoked: 15,
      })
      expect(res.isCalculated).toBe(false)
      expect(res.packYears).toBeNull()
    })

    it('returns 0 pack-years when 0 sticks per day reported', () => {
      const res = calculatePackYears({
        cigarettesPerDay: 0,
        bidisPerDay: 0,
        yearsSmoked: 10,
      })
      expect(res.isCalculated).toBe(true)
      expect(res.packYears).toBe(0)
    })
  })

  describe('calculateBmi', () => {
    it('calculates BMI accurately and categorizes normal weight', () => {
      const res = calculateBmi({
        heightCm: 175,
        weightKg: 70,
      })
      // 70 / (1.75^2) = 22.857 -> 22.9
      expect(res.isCalculated).toBe(true)
      expect(res.bmi).toBe(22.9)
      expect(res.category).toBe('normal')
      expect(res.calculationMethod).toBe('weight_kg / (height_m ^ 2)')
    })

    it('identifies underweight category', () => {
      const res = calculateBmi({
        heightCm: 170,
        weightKg: 48,
      })
      // 48 / (1.70^2) = 16.6
      expect(res.bmi).toBe(16.6)
      expect(res.category).toBe('underweight')
    })

    it('identifies overweight and obese categories', () => {
      const overweight = calculateBmi({ heightCm: 170, weightKg: 80 })
      expect(overweight.category).toBe('overweight')

      const obese = calculateBmi({ heightCm: 170, weightKg: 95 })
      expect(obese.category).toBe('obese')
    })

    it('returns null and does not calculate for invalid or non-biological heights/weights', () => {
      expect(calculateBmi({ heightCm: 0, weightKg: 70 }).isCalculated).toBe(false)
      expect(calculateBmi({ heightCm: 170, weightKg: -5 }).isCalculated).toBe(false)
      expect(calculateBmi({ heightCm: 350, weightKg: 70 }).isCalculated).toBe(false)
      expect(calculateBmi({ heightCm: 170, weightKg: 500 }).isCalculated).toBe(false)
    })
  })

  describe('validateMeasurementRanges', () => {
    it('validates height and weight within physiological ranges', () => {
      expect(validateMeasurementRanges('height', 165).isValid).toBe(true)
      expect(validateMeasurementRanges('height', 20).isValid).toBe(false)
      expect(validateMeasurementRanges('weight', 65).isValid).toBe(true)
      expect(validateMeasurementRanges('weight', 0.5).isValid).toBe(false)
    })

    it('validates blood pressure readings and ensures diastolic is lower than systolic', () => {
      expect(validateMeasurementRanges('blood_pressure_combined', 120, 80).isValid).toBe(true)
      expect(validateMeasurementRanges('blood_pressure_combined', 120, 130).isValid).toBe(false)
      expect(validateMeasurementRanges('blood_pressure_systolic', 40).isValid).toBe(false)
    })

    it('validates oxygen saturation', () => {
      expect(validateMeasurementRanges('oxygen_saturation', 98).isValid).toBe(true)
      expect(validateMeasurementRanges('oxygen_saturation', 105).isValid).toBe(false)
    })
  })
})

describe('Phase 1.7: Health Records Zod Schemas Validation', () => {
  it('validates a valid medical condition', () => {
    const valid = {
      conditionName: 'Chronic Obstructive Pulmonary Disease',
      conditionCategory: 'respiratory',
      clinicalStatus: 'active',
      isPrimaryRespiratory: true,
      onsetDate: '2020-03-15',
    }
    const parsed = medicalConditionSchema.parse(valid)
    expect(parsed.conditionName).toBe('Chronic Obstructive Pulmonary Disease')
    expect(parsed.isPrimaryRespiratory).toBe(true)
  })

  it('rejects medical condition with name too short', () => {
    expect(() =>
      medicalConditionSchema.parse({
        conditionName: 'A',
      })
    ).toThrow()
  })

  it('validates allergy with specific substance or no_known_allergies', () => {
    const penicillin = allergySchema.parse({
      allergenType: 'medication',
      allergenName: 'Penicillin',
      severity: 'severe',
    })
    expect(penicillin.allergenName).toBe('Penicillin')

    const nkda = allergySchema.parse({
      allergenType: 'no_known_allergies',
      allergenName: 'No Known Drug Allergies',
    })
    expect(nkda.allergenType).toBe('no_known_allergies')
  })

  it('validates smoking history with former smoker attributes', () => {
    const smoking = smokingHistorySchema.parse({
      smokingStatus: 'former',
      tobaccoType: 'cigarettes',
      cigarettesPerDay: 20,
      yearsSmoked: 25,
      ageStarted: 18,
      ageQuit: 43,
      quitDate: '2011-01-01',
      secondhandSmokeExposure: true,
      secondhandSmokeContext: 'workplace',
    })
    expect(smoking.smokingStatus).toBe('former')
    expect(smoking.yearsSmoked).toBe(25)
  })

  it('validates medication, exposure, family, lifestyle, measurement, and symptom schemas', () => {
    const med = medicationSchema.parse({
      medicationName: 'Tiotropium',
      medicationType: 'respiratory_inhaler',
    })
    expect(med.medicationName).toBe('Tiotropium')

    const exp = environmentalExposureSchema.parse({
      exposureCategory: 'occupational',
      exposureType: 'Asbestos',
    })
    expect(exp.exposureCategory).toBe('occupational')

    const fam = familyHistorySchema.parse({
      relationship: 'sibling',
      conditionType: 'lung_cancer',
    })
    expect(fam.relationship).toBe('sibling')

    const lst = lifestyleSchema.parse({
      physicalActivityLevel: 'moderate',
      alcoholConsumptionStatus: 'never',
    })
    expect(lst.physicalActivityLevel).toBe('moderate')

    const msr = measurementSchema.parse({
      measurementType: 'height',
      numericValue: 172,
      unit: 'cm',
    })
    expect(msr.numericValue).toBe(172)

    const sym = symptomSchema.parse({
      symptomName: 'persistent_hoarseness',
      isPresent: true,
    })
    expect(sym.symptomName).toBe('persistent_hoarseness')
  })

  it('validates clinician review schema', () => {
    const review = clinicianReviewSchema.parse({
      categoryReviewed: 'all',
      reviewDecision: 'verified',
      clinicalRationale: 'Verified complete patient health records during intake visit.',
    })
    expect(review.reviewDecision).toBe('verified')
  })
})

describe('Phase 1.7: HealthRecordService In-Memory & Data Flow', () => {
  const testPatientId = 'test-patient-uuid-101'

  it('initializes and returns baseline record with all 10 categories', async () => {
    const record = await HealthRecordService.getComprehensiveHealthRecord(testPatientId)
    expect(record.patientId).toBe(testPatientId)
    expect(Array.isArray(record.medicalConditions)).toBe(true)
    expect(Array.isArray(record.medications)).toBe(true)
    expect(Array.isArray(record.allergies)).toBe(true)
    expect(Array.isArray(record.environmentalExposures)).toBe(true)
    expect(Array.isArray(record.familyHistory)).toBe(true)
    expect(Array.isArray(record.measurements)).toBe(true)
    expect(Array.isArray(record.symptoms)).toBe(true)
    expect(Array.isArray(record.reviews)).toBe(true)
  })

  it('adds a medical condition and updates record', async () => {
    const item = await HealthRecordService.addMedicalCondition(
      testPatientId,
      {
        conditionName: 'Pulmonary Tuberculosis',
        conditionCategory: 'infectious',
        clinicalStatus: 'resolved',
        isPrimaryRespiratory: true,
      },
      'actor-worker-01'
    )
    expect(item.conditionName).toBe('Pulmonary Tuberculosis')
    expect(item.verificationStatus).toBe('unverified')

    const updated = await HealthRecordService.getComprehensiveHealthRecord(testPatientId)
    expect(updated.medicalConditions.some((c) => c.conditionName === 'Pulmonary Tuberculosis')).toBe(true)
  })

  it('records medication and allergy', async () => {
    const med = await HealthRecordService.addMedication(testPatientId, {
      medicationName: 'Salbutamol Inhaler',
      medicationType: 'bronchodilator',
      isCurrent: true,
    })
    expect(med.medicationName).toBe('Salbutamol Inhaler')

    const alg = await HealthRecordService.addAllergy(testPatientId, {
      allergenType: 'medication',
      allergenName: 'Sulfa Drugs',
      severity: 'moderate',
    })
    expect(alg.allergenName).toBe('Sulfa Drugs')
  })

  it('saves smoking history and automatically calculates pack-years', async () => {
    const smoking = await HealthRecordService.saveSmokingHistory(testPatientId, {
      smokingStatus: 'current',
      tobaccoType: 'cigarettes',
      cigarettesPerDay: 20,
      yearsSmoked: 30,
    })
    expect(smoking.calculatedPackYears).toBe(30.0)
    expect(smoking.packYearsCalculationMethod).toContain('years_smoked')

    const full = await HealthRecordService.getComprehensiveHealthRecord(testPatientId)
    expect(full.smokingHistory?.calculatedPackYears).toBe(30.0)
  })

  it('submits clinician review and updates verification provenance', async () => {
    const review = await HealthRecordService.submitClinicianReview(
      testPatientId,
      {
        categoryReviewed: 'all',
        reviewDecision: 'verified',
        clinicalRationale: 'Consultant pulmonologist verified all history with patient.',
      },
      'clinician-rafiq'
    )
    expect(review.reviewDecision).toBe('verified')

    const full = await HealthRecordService.getComprehensiveHealthRecord(testPatientId)
    expect(full.reviews.length).toBeGreaterThan(0)
    // All items should now reflect verified status
    const verifiedConds = full.medicalConditions.filter((c) => c.verificationStatus === 'verified')
    expect(verifiedConds.length).toBe(full.medicalConditions.length)
  })

  it('extracts point-in-time snapshot respecting timestamps', async () => {
    const pastTimestamp = '2020-01-01T00:00:00.000Z'
    const snapshot = await HealthRecordService.getPointInTimeSnapshot(testPatientId, pastTimestamp)
    // Items created recently in test should not be present in the 2020 snapshot
    expect(snapshot.medicalConditions.length).toBe(0)
    expect(snapshot.medications.length).toBe(0)
  })
})

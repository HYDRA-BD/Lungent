/**
 * Patient Health Measurements and Clinical Calculation Utilities
 * Phase 1.7: Patient Health Information Management
 *
 * All clinical formulas are explicitly defined, transparent, and do not make
 * speculative approximations on incomplete data.
 */

export interface PackYearInput {
  cigarettesPerDay?: number | null
  bidisPerDay?: number | null
  yearsSmoked?: number | null
}

export interface PackYearResult {
  packYears: number | null
  calculationMethod: string | null
  calculatedAt: string
  isCalculated: boolean
  notes?: string
}

/**
 * Calculates tobacco pack-years transparently.
 * Formula: ((cigarettes_per_day || 0) + (bidis_per_day || 0)) / 20 * years_smoked
 *
 * If smoking duration or quantity is missing or invalid, calculation is NOT performed
 * to prevent misleading clinicians with spurious zeroes or approximations.
 */
export function calculatePackYears(input: PackYearInput): PackYearResult {
  const timestamp = new Date().toISOString()
  const cigs = input.cigarettesPerDay
  const bidis = input.bidisPerDay
  const years = input.yearsSmoked

  // If years is missing or non-positive, or if neither cigs nor bidis is provided
  if (
    years === undefined ||
    years === null ||
    isNaN(years) ||
    years <= 0 ||
    (cigs === undefined && bidis === undefined) ||
    (cigs === null && bidis === null)
  ) {
    return {
      packYears: null,
      calculationMethod: null,
      calculatedAt: timestamp,
      isCalculated: false,
      notes: 'Incomplete tobacco duration or quantity data; pack-years cannot be calculated.',
    }
  }

  const validCigs = typeof cigs === 'number' && !isNaN(cigs) && cigs >= 0 ? cigs : 0
  const validBidis = typeof bidis === 'number' && !isNaN(bidis) && bidis >= 0 ? bidis : 0
  const totalSticksPerDay = validCigs + validBidis

  if (totalSticksPerDay === 0) {
    return {
      packYears: 0,
      calculationMethod: '((cigarettes_per_day + bidis_per_day) / 20) * years_smoked',
      calculatedAt: timestamp,
      isCalculated: true,
      notes: '0 sticks per day reported over recorded duration.',
    }
  }

  const rawPackYears = (totalSticksPerDay / 20) * years
  const roundedPackYears = Math.round(rawPackYears * 10) / 10

  return {
    packYears: roundedPackYears,
    calculationMethod: '((cigarettes_per_day + bidis_per_day) / 20) * years_smoked',
    calculatedAt: timestamp,
    isCalculated: true,
  }
}

export interface BmiInput {
  heightCm?: number | null
  weightKg?: number | null
}

export interface BmiResult {
  bmi: number | null
  category: 'underweight' | 'normal' | 'overweight' | 'obese' | null
  calculationMethod: string | null
  calculatedAt: string
  isCalculated: boolean
  notes?: string
}

/**
 * Calculates Body Mass Index (BMI).
 * Formula: weight_kg / ((height_cm / 100) ^ 2)
 */
export function calculateBmi(input: BmiInput): BmiResult {
  const timestamp = new Date().toISOString()
  const height = input.heightCm
  const weight = input.weightKg

  if (
    typeof height !== 'number' ||
    typeof weight !== 'number' ||
    isNaN(height) ||
    isNaN(weight) ||
    height <= 0 ||
    weight <= 0
  ) {
    return {
      bmi: null,
      category: null,
      calculationMethod: null,
      calculatedAt: timestamp,
      isCalculated: false,
      notes: 'Height and weight must both be positive numbers.',
    }
  }

  // Clinical safety limits: height 30cm to 260cm, weight 1kg to 350kg
  if (height < 30 || height > 260 || weight < 1 || weight > 350) {
    return {
      bmi: null,
      category: null,
      calculationMethod: null,
      calculatedAt: timestamp,
      isCalculated: false,
      notes: 'Height or weight falls outside plausible biological thresholds.',
    }
  }

  const heightM = height / 100
  const rawBmi = weight / (heightM * heightM)
  const roundedBmi = Math.round(rawBmi * 10) / 10

  let category: 'underweight' | 'normal' | 'overweight' | 'obese' = 'normal'
  if (roundedBmi < 18.5) {
    category = 'underweight'
  } else if (roundedBmi < 25) {
    category = 'normal'
  } else if (roundedBmi < 30) {
    category = 'overweight'
  } else {
    category = 'obese'
  }

  return {
    bmi: roundedBmi,
    category,
    calculationMethod: 'weight_kg / (height_m ^ 2)',
    calculatedAt: timestamp,
    isCalculated: true,
  }
}

export interface MeasurementRangeValidation {
  isValid: boolean
  error?: string
}

/**
 * Validates physiological measurement ranges for common vitals
 */
export function validateMeasurementRanges(
  type: string,
  value: number,
  secondaryValue?: number | null
): MeasurementRangeValidation {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: 'Value must be a valid number' }
  }

  switch (type) {
    case 'height':
      if (value < 30 || value > 260) {
        return { isValid: false, error: 'Height must be between 30 and 260 cm' }
      }
      return { isValid: true }

    case 'weight':
      if (value < 1 || value > 350) {
        return { isValid: false, error: 'Weight must be between 1 and 350 kg' }
      }
      return { isValid: true }

    case 'blood_pressure_systolic':
      if (value < 50 || value > 300) {
        return { isValid: false, error: 'Systolic blood pressure must be between 50 and 300 mmHg' }
      }
      return { isValid: true }

    case 'blood_pressure_diastolic':
      if (value < 30 || value > 200) {
        return { isValid: false, error: 'Diastolic blood pressure must be between 30 and 200 mmHg' }
      }
      return { isValid: true }

    case 'blood_pressure_combined':
      if (value < 50 || value > 300) {
        return { isValid: false, error: 'Systolic blood pressure must be between 50 and 300 mmHg' }
      }
      if (
        typeof secondaryValue === 'number' &&
        (secondaryValue < 30 || secondaryValue > 200 || secondaryValue >= value)
      ) {
        return {
          isValid: false,
          error: 'Diastolic blood pressure must be between 30 and 200 mmHg and lower than systolic',
        }
      }
      return { isValid: true }

    case 'heart_rate':
      if (value < 30 || value > 250) {
        return { isValid: false, error: 'Heart rate must be between 30 and 250 bpm' }
      }
      return { isValid: true }

    case 'oxygen_saturation':
      if (value < 50 || value > 100) {
        return { isValid: false, error: 'Oxygen saturation must be between 50% and 100%' }
      }
      return { isValid: true }

    case 'respiratory_rate':
      if (value < 5 || value > 80) {
        return { isValid: false, error: 'Respiratory rate must be between 5 and 80 breaths/min' }
      }
      return { isValid: true }

    default:
      return { isValid: true }
  }
}


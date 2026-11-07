/**
 * Phase 2.5: Statistical Outlier Detection Algorithms & Biological Reference Limits
 *
 * Implements robust statistical estimators:
 * - Median Absolute Deviation (MAD) & Modified Z-Score for skewed clinical & operational distributions
 * - Interquartile Range (IQR) standard & extreme Tukey fences
 * - Rolling window Moving Average and Standard Deviation
 * - Physical biological & environmental limits for deterministic boundary testing
 */

export const BIOLOGICAL_LIMITS = {
  ageYears: { min: 0, max: 125 },
  heightCm: { min: 45, max: 240 },
  weightKg: { min: 2.5, max: 280 },
  bmi: { min: 10, max: 75, maxDiscordance: 1.5 },
  systolicBp: { min: 50, max: 260 },
  diastolicBp: { min: 30, max: 160 },
  pulseBpm: { min: 25, max: 240 },
  oxygenSaturation: { min: 40, max: 100 },
  cigarettesPerDay: { min: 0, max: 120 },
  packYears: { min: 0, max: 150 },
} as const

export const ENVIRONMENTAL_LIMITS = {
  pm25: { min: 0, max: 1000 },
  pm10: { min: 0, max: 1500 },
  aqi: { min: 0, max: 500 },
  maxHourlyPm25Delta: 250,
  stuckSensorThresholdHours: 12,
} as const

export const OPERATIONAL_LIMITS = {
  maxNotificationFailureRate: 0.20, // 20%
  maxOfflineSyncConflictRate: 0.15, // 15%
  maxReferralTurnaroundDays: 14,
  maxDailySubmissionVolumeZScore: 3.5,
  minExpectedWeekdaySubmissions: 1,
} as const

/**
 * Calculates BMI from weight (kg) and height (cm)
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0
  const heightM = heightCm / 100
  return Number((weightKg / (heightM * heightM)).toFixed(2))
}

/**
 * Computes median of a numerical array
 */
export function computeMedian(values: number[]): number {
  if (!values || values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/**
 * Computes Median Absolute Deviation (MAD)
 * MAD = median(|x_i - median(X)|)
 */
export function computeMAD(values: number[]): { median: number; mad: number } {
  if (!values || values.length === 0) return { median: 0, mad: 0 }
  const med = computeMedian(values)
  const deviations = values.map((v) => Math.abs(v - med))
  const mad = computeMedian(deviations)
  return { median: med, mad }
}

/**
 * Computes Boris Iglewicz and David Hoaglin modified Z-score based on MAD:
 * M_i = 0.6745 * (x_i - median) / MAD
 * Score > 3.5 is generally flagged as a potential outlier.
 */
export function calculateModifiedZScore(value: number, median: number, mad: number): number {
  if (mad === 0) {
    return value === median ? 0 : 999.0 // Infinite or undefined outlier
  }
  return Number(((0.6745 * Math.abs(value - median)) / mad).toFixed(4))
}

/**
 * Computes empirical quantiles
 */
export function computeQuantile(values: number[], q: number): number {
  if (!values || values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const pos = (sorted.length - 1) * q
  const base = Math.floor(pos)
  const rest = pos - base
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base])
  }
  return sorted[base]
}

/**
 * Computes Interquartile Range (IQR) and Tukey outlier fences
 */
export function computeIQRBounds(
  values: number[],
  multiplier: number = 1.5
): {
  q1: number
  median: number
  q3: number
  iqr: number
  lowerBound: number
  upperBound: number
} {
  if (!values || values.length === 0) {
    return { q1: 0, median: 0, q3: 0, iqr: 0, lowerBound: 0, upperBound: 0 }
  }
  const q1 = computeQuantile(values, 0.25)
  const median = computeMedian(values)
  const q3 = computeQuantile(values, 0.75)
  const iqr = q3 - q1
  const lowerBound = Number((q1 - multiplier * iqr).toFixed(2))
  const upperBound = Number((q3 + multiplier * iqr).toFixed(2))
  return { q1, median, q3, iqr, lowerBound, upperBound }
}

/**
 * Computes rolling mean and standard deviation for time-series / operational metrics
 */
export function computeRollingZScore(
  currentValue: number,
  historicalValues: number[]
): {
  mean: number
  stdDev: number
  zScore: number
  isAnomaly: boolean
} {
  if (!historicalValues || historicalValues.length < 3) {
    return { mean: currentValue, stdDev: 0, zScore: 0, isAnomaly: false }
  }

  const n = historicalValues.length
  const mean = historicalValues.reduce((acc, v) => acc + v, 0) / n
  const variance =
    historicalValues.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1)
  const stdDev = Math.sqrt(variance)

  if (stdDev === 0) {
    const isAnomaly = currentValue !== mean
    return { mean, stdDev: 0, zScore: isAnomaly ? 99 : 0, isAnomaly }
  }

  const zScore = Number(((currentValue - mean) / stdDev).toFixed(2))
  const isAnomaly = Math.abs(zScore) >= OPERATIONAL_LIMITS.maxDailySubmissionVolumeZScore

  return {
    mean: Number(mean.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    zScore,
    isAnomaly,
  }
}


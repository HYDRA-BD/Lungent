/**
 * Phase 2.10: Predictive Operational Analytics Service
 * Generates statistical time-series forecasts for facility assessment volume,
 * referral workload, and clinical review bottlenecks with error quantification.
 */

import type {
  ForecastingTargetMetric,
  ForecastingModelType,
  ForecastPoint,
  OperationalForecastResult,
} from '../types'

export interface HistoricalSeriesPoint {
  date: string
  value: number
}

export class PredictiveForecastingService {
  /**
   * Generates time-series operational projection using Double Exponential Smoothing (Holt's linear trend)
   */
  public static forecastMetric(
    history: HistoricalSeriesPoint[],
    options: {
      targetMetric: ForecastingTargetMetric
      modelType?: ForecastingModelType
      forecastHorizonDays?: number
      operationalCapacityLimit?: number
      alpha?: number // Level smoothing parameter (0.0 to 1.0)
      beta?: number // Trend smoothing parameter (0.0 to 1.0)
      facilityId?: string
      facilityName?: string
    }
  ): OperationalForecastResult {
    const horizon = options.forecastHorizonDays || 14
    const modelType = options.modelType || 'holt_winters_exponential_smoothing'
    const capacityLimit = options.operationalCapacityLimit || 100

    if (history.length < 5) {
      throw new Error('Predictive forecasting requires at least 5 historical data points')
    }

    const values = history.map(p => p.value)
    const n = values.length

    // Fit Double Exponential Smoothing
    const alpha = options.alpha !== undefined ? options.alpha : 0.3
    const beta = options.beta !== undefined ? options.beta : 0.1

    let level = values[0]
    let trend = values[1] - values[0]

    const fitted: number[] = [level]

    for (let t = 1; t < n; t++) {
      const prevLevel = level
      const prevTrend = trend
      level = alpha * values[t] + (1 - alpha) * (prevLevel + prevTrend)
      trend = beta * (level - prevLevel) + (1 - beta) * prevTrend
      fitted.push(prevLevel + prevTrend)
    }

    // Calculate In-Sample Historical Error Metrics
    let sumAbsError = 0
    let sumSqError = 0
    let sumPctError = 0
    let validPctCount = 0

    for (let t = 1; t < n; t++) {
      const error = values[t] - fitted[t]
      sumAbsError += Math.abs(error)
      sumSqError += error * error
      if (values[t] > 0) {
        sumPctError += Math.abs(error) / values[t]
        validPctCount++
      }
    }

    const mae = Number((sumAbsError / (n - 1)).toFixed(2))
    const rmse = Number(Math.sqrt(sumSqError / (n - 1)).toFixed(2))
    const mape = Number(((sumPctError / Math.max(1, validPctCount)) * 100.0).toFixed(1))

    // Project Forward for Horizon Days
    const lastDate = new Date(history[n - 1].date)
    const forecastPoints: ForecastPoint[] = []

    let peakProjectedValue = 0
    let peakProjectedDate = ''

    for (let h = 1; h <= horizon; h++) {
      const nextDate = new Date(lastDate)
      nextDate.setDate(lastDate.getDate() + h)
      const dateStr = nextDate.toISOString().substring(0, 10)

      // Point forecast
      const rawProjection = level + h * trend
      const projectedValue = Number(Math.max(0, Math.round(rawProjection)))

      // 95% Confidence Interval (z = 1.96, variance expanding with horizon)
      const standardError = rmse * Math.sqrt(1 + (h / n) * 0.5)
      const lowerBound95 = Number(Math.max(0, Math.round(projectedValue - 1.96 * standardError)))
      const upperBound95 = Number(Math.round(projectedValue + 1.96 * standardError))

      forecastPoints.push({
        date: dateStr,
        projectedValue,
        lowerBound95,
        upperBound95,
      })

      if (projectedValue > peakProjectedValue) {
        peakProjectedValue = projectedValue
        peakProjectedDate = dateStr
      }
    }

    // Bottleneck detection (threshold: 15% above capacity limit)
    const capacityThreshold = capacityLimit * 1.15
    const bottleneckDetected = peakProjectedValue > capacityThreshold

    const excessPct = bottleneckDetected
      ? Number((((peakProjectedValue - capacityLimit) / capacityLimit) * 100.0).toFixed(1))
      : 0.0

    const bottleneckDetails = bottleneckDetected
      ? {
          projectedPeakDate: peakProjectedDate,
          projectedPeakValue: peakProjectedValue,
          operationalCapacityLimit: capacityLimit,
          excessCapacityPct: excessPct,
          recommendedMitigation:
            excessPct > 35.0
              ? 'Critical strain: Activate auxiliary community screening shift and re-route routine assessments to adjacent Upazila Health Complex.'
              : 'Moderate strain: Pre-allocate additional clinician review hours and stagger intake schedule.',
        }
      : undefined

    return {
      facilityId: options.facilityId,
      facilityName: options.facilityName,
      targetMetric: options.targetMetric,
      modelType,
      historicalWindowDays: n,
      forecastHorizonDays: horizon,
      forecastPoints,
      errorMetrics: {
        meanAbsoluteError: mae,
        rootMeanSquaredError: rmse,
        meanAbsolutePercentageError: mape,
      },
      capacityBottleneckDetected: bottleneckDetected,
      bottleneckDetails,
      generatedAt: new Date().toISOString(),
      operationalNoticeEn:
        'CRITICAL GOVERNANCE NOTICE: Operational analytics forecasts are strictly intended for administrative workload balancing, equipment preparedness, and healthcare worker staffing. They CANNOT be used to influence individual clinical risk evaluations, patient prioritization, or screening eligibility decisions.',
    }
  }
}


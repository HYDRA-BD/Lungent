import type { LongitudinalPopulationTrendPoint, PopulationFilterQuery } from '../types'
import { KAnonymityAggregator } from '../privacy/k-anonymity-aggregator'

export class PopulationTrendService {
  /**
   * Generates longitudinal population trend time series from 2024-Q1 to 2026-Q4
   */
  public static getLongitudinalTrends(
    totalCohortN = 5000,
    query?: PopulationFilterQuery
  ): LongitudinalPopulationTrendPoint[] {
    const kThreshold = query?.kThreshold || 5

    // 8 quarterly intervals representing platform adoption and behavioral monitoring
    const quarters = [
      { period: '2025-Q1', year: 2025, quarter: 1, volumeFrac: 0.08, smokerPct: 41.2, bidiPct: 24.5, biomassPct: 56.4, screenPct: 18.2, urgentPct: 8.5, growth: 0.0 },
      { period: '2025-Q2', year: 2025, quarter: 2, volumeFrac: 0.10, smokerPct: 40.8, bidiPct: 24.0, biomassPct: 55.8, screenPct: 18.0, urgentPct: 8.3, growth: 25.0 },
      { period: '2025-Q3', year: 2025, quarter: 3, volumeFrac: 0.12, smokerPct: 40.1, bidiPct: 23.6, biomassPct: 55.0, screenPct: 17.6, urgentPct: 8.1, growth: 20.0 },
      { period: '2025-Q4', year: 2025, quarter: 4, volumeFrac: 0.14, smokerPct: 39.5, bidiPct: 23.2, biomassPct: 54.5, screenPct: 17.4, urgentPct: 8.0, growth: 16.7 },
      { period: '2026-Q1', year: 2026, quarter: 1, volumeFrac: 0.16, smokerPct: 39.0, bidiPct: 23.0, biomassPct: 54.0, screenPct: 17.2, urgentPct: 7.9, growth: 14.3 },
      { period: '2026-Q2', year: 2026, quarter: 2, volumeFrac: 0.18, smokerPct: 38.6, bidiPct: 22.8, biomassPct: 53.6, screenPct: 17.0, urgentPct: 7.8, growth: 12.5 },
      { period: '2026-Q3', year: 2026, quarter: 3, volumeFrac: 0.20, smokerPct: 38.2, bidiPct: 22.5, biomassPct: 53.2, screenPct: 16.8, urgentPct: 7.8, growth: 11.1 },
      { period: '2026-Q4', year: 2026, quarter: 4, volumeFrac: 0.22, smokerPct: 37.8, bidiPct: 22.2, biomassPct: 52.8, screenPct: 16.5, urgentPct: 7.7, growth: 10.0 },
    ]

    return quarters.map((q) => {
      const quarterlyN = Math.round(totalCohortN * q.volumeFrac)
      const sanitized = KAnonymityAggregator.sanitizeCell(quarterlyN, totalCohortN, kThreshold)

      return {
        periodLabel: q.period,
        year: q.year,
        quarter: q.quarter,
        totalAssessments: sanitized.isSuppressed ? 0 : quarterlyN,
        currentSmokerPct: q.smokerPct,
        bidiSmokerPct: q.bidiPct,
        biomassCookingPct: q.biomassPct,
        screeningEligiblePct: q.screenPct,
        urgentReferralPct: q.urgentPct,
        platformAdoptionGrowthPct: q.growth,
        isSuppressed: sanitized.isSuppressed,
      }
    })
  }
}


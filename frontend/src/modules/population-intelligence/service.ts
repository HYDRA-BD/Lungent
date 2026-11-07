import type { PopulationIntelligenceSummary, PopulationFilterQuery } from './types'
import {
  PopulationRiskFactorService,
  NON_CAUSAL_POPULATION_NOTICE_EN,
  NON_CAUSAL_POPULATION_NOTICE_BN,
  REPRESENTATIVENESS_CAVEAT_EN,
  REPRESENTATIVENESS_CAVEAT_BN,
} from './services/risk-factor-service'
import { GeographicPopulationService } from './services/geographic-population-service'
import { PopulationTrendService } from './services/trend-service'
import { KAnonymityAggregator, DEFAULT_K_ANONYMITY_THRESHOLD } from './privacy/k-anonymity-aggregator'

export class PopulationIntelligenceService {
  private static totalSimulatedCohortSize = 5000

  /**
   * Resets or overrides cohort size for testing purposes
   */
  public static setCohortSizeForTesting(size: number): void {
    this.totalSimulatedCohortSize = size
  }

  public static resetForTesting(): void {
    this.totalSimulatedCohortSize = 5000
  }

  /**
   * Generates a comprehensive population-level intelligence summary with k-anonymity cell protection
   */
  public static async getPopulationSummary(
    query?: PopulationFilterQuery
  ): Promise<PopulationIntelligenceSummary> {
    const kThreshold = query?.kThreshold || DEFAULT_K_ANONYMITY_THRESHOLD
    const cohortN = this.totalSimulatedCohortSize

    const riskPrevalences = PopulationRiskFactorService.getRiskFactorPrevalences(cohortN, query)
    const topPairs = PopulationRiskFactorService.getCoOccurrencePairs(cohortN, query)
    const demographics = PopulationRiskFactorService.getDemographicStrata(cohortN, query)
    const geoMetrics = GeographicPopulationService.getGeographicMetrics(cohortN, query)
    const trends = PopulationTrendService.getLongitudinalTrends(cohortN, query)
    const envCorrelations = GeographicPopulationService.getEnvironmentalCorrelations(cohortN, query)

    // Calculate total suppressed cells
    const suppressedCount =
      riskPrevalences.filter((r) => r.isSuppressed).length +
      topPairs.filter((p) => p.isSuppressed).length +
      demographics.filter((d) => d.isSuppressed).length +
      geoMetrics.filter((g) => g.isSuppressed).length +
      trends.filter((t) => t.isSuppressed).length +
      envCorrelations.filter((e) => e.isSuppressed).length

    return {
      cohortCode: 'COHORT-LUNGENT-NATIONAL-2026',
      cohortNameEn: 'Lungent National Clinical Assessment Cohort (2025-2026)',
      cohortNameBn: 'লুনজেন্ট জাতীয় ক্লিনিকাল মূল্যায়ন দল (২০২৫-২০২৬)',
      samplingMethodology: query?.samplingMethodology || 'clinical_convenience_sample',
      observationPeriod: {
        start: query?.startDate || '2025-01-01',
        end: query?.endDate || '2026-12-31',
      },
      totalSampleAnalyzed: cohortN,
      activePrivacyKThreshold: kThreshold,
      overallSuppressedCellsCount: suppressedCount,
      riskFactorPrevalences: riskPrevalences,
      topCoOccurringFactors: topPairs,
      demographicDistribution: demographics,
      geographicSummary: geoMetrics,
      longitudinalTrends: trends,
      environmentalCorrelations: envCorrelations,
      clinicalGovernanceNotices: {
        representativenessCaveatEn: REPRESENTATIVENESS_CAVEAT_EN,
        representativenessCaveatBn: REPRESENTATIVENESS_CAVEAT_BN,
        nonCausalNoticeEn: NON_CAUSAL_POPULATION_NOTICE_EN,
        nonCausalNoticeBn: NON_CAUSAL_POPULATION_NOTICE_BN,
        nonDiagnosticNoticeEn:
          'Population intelligence describes macro-level risk distributions. It must NEVER be used to infer an individual patient\'s risk score or replace qualified clinician diagnostic assessment.',
        nonDiagnosticNoticeBn:
          'জনসংখ্যা-স্তরের তথ্য সামগ্রিক ঝুঁকির বিন্যাস বর্ণনা করে। এটি কখনোই রোগীর ব্যক্তিগত ঝুঁকি নির্ধারণ বা চিকিৎসকের রোগ নির্ণয় প্রতিস্থাপন করতে ব্যবহার করা যাবে না।',
      },
    }
  }

  /**
   * Generates a cryptographic audit record for authorized research queries
   */
  public static createAuditTrailRecord(
    queryParameters: Record<string, unknown>,
    recordsAnalyzed: number
  ) {
    return {
      queryCode: `QRY-POP-${Date.now()}`,
      auditHash: KAnonymityAggregator.generateAuditHash(queryParameters),
      recordsAnalyzed,
      timestamp: new Date().toISOString(),
      nonCausalEnforced: true,
    }
  }
}


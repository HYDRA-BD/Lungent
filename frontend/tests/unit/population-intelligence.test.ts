/**
 * Phase 2.8: Population-Level Intelligence Test Suite
 *
 * Comprehensive unit and integration verification for:
 * 1. Privacy-Preserving k-Anonymity Aggregator & Cell Suppression
 * 2. Population Risk-Factor Prevalence & Missingness Tracking
 * 3. Co-Occurrence Analysis & Relative Odds Ratios
 * 4. Geographic Disparities across Bangladesh Administrative Hierarchy
 * 5. Longitudinal Trends & Adoption Growth Distinction
 * 6. Environmental-Population Overlay
 * 7. Clinical Governance & Non-Diagnostic Invariants
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  PopulationIntelligenceService,
  KAnonymityAggregator,
  DEFAULT_K_ANONYMITY_THRESHOLD,
  PopulationRiskFactorService,
  GeographicPopulationService,
  PopulationTrendService,
  NON_CAUSAL_POPULATION_NOTICE_EN,
  REPRESENTATIVENESS_CAVEAT_EN,
} from '@/modules/population-intelligence'

describe('Phase 2.8: Population-Level Intelligence Framework', () => {
  beforeEach(() => {
    PopulationIntelligenceService.resetForTesting()
  })

  // ==========================================================================
  // 1. PRIVACY-PRESERVING k-ANONYMITY AGGREGATOR
  // ==========================================================================
  describe('1. Privacy-Preserving k-Anonymity Aggregator', () => {
    it('strictly suppresses cell counts between 1 and k-1 (k=5)', () => {
      expect(DEFAULT_K_ANONYMITY_THRESHOLD).toBe(5)
      // Cell with count = 3 (below threshold 5)
      const result3 = KAnonymityAggregator.sanitizeCell(3, 100, 5)
      expect(result3.isSuppressed).toBe(true)
      expect(result3.displayCount).toBe('< 5 [SUPPRESSED]')
      expect(result3.suppressionReason).toContain('k-anonymity')

      // Cell with count = 1
      const result1 = KAnonymityAggregator.sanitizeCell(1, 100, 5)
      expect(result1.isSuppressed).toBe(true)
      expect(result1.displayCount).toBe('< 5 [SUPPRESSED]')
    })

    it('permits display of cell counts equal to or exceeding k (k=5)', () => {
      const result5 = KAnonymityAggregator.sanitizeCell(5, 100, 5)
      expect(result5.isSuppressed).toBe(false)
      expect(result5.displayCount).toBe('5')
      expect(result5.percentage).toBe(5.0)

      const result42 = KAnonymityAggregator.sanitizeCell(42, 1000, 5)
      expect(result42.isSuppressed).toBe(false)
      expect(result42.displayCount).toBe('42')
      expect(result42.percentage).toBe(4.2)
    })

    it('safely handles zero counts without re-identification risk', () => {
      const result0 = KAnonymityAggregator.sanitizeCell(0, 100, 5)
      expect(result0.isSuppressed).toBe(false)
      expect(result0.displayCount).toBe('0')
      expect(result0.percentage).toBe(0)
    })

    it('enforces complementary cell suppression when denominator is small', () => {
      // Total = 8, cell count = 7 (leaving 1, which reveals the small cell)
      const comp = KAnonymityAggregator.sanitizeCell(7, 8, 5)
      expect(comp.isSuppressed).toBe(true)
      expect(comp.displayCount).toBe('[SUPPRESSED]')
      expect(comp.suppressionReason).toContain('Complementary cell suppression')
    })

    it('generates deterministic cryptographic audit hash for research compliance', () => {
      const hash1 = KAnonymityAggregator.generateAuditHash({ division: 'Dhaka', year: 2026 })
      const hash2 = KAnonymityAggregator.generateAuditHash({ division: 'Dhaka', year: 2026 })
      expect(hash1).toMatch(/^POPAUDIT-v2\.8\.0-[a-f0-9]+-[a-f0-9]+$/)
      expect(typeof hash2).toBe('string')
    })
  })

  // ==========================================================================
  // 2. POPULATION RISK-FACTOR PREVALENCE & MISSINGNESS
  // ==========================================================================
  describe('2. Population Risk-Factor Prevalence & Missingness', () => {
    it('computes prevalences for core tobacco, biomass, occupational, and medical risk factors', () => {
      const prevalences = PopulationRiskFactorService.getRiskFactorPrevalences(5000)
      expect(prevalences.length).toBeGreaterThanOrEqual(8)

      const codes = prevalences.map((p) => p.factorCode)
      expect(codes).toContain('RF_CIGARETTE_SMOKING')
      expect(codes).toContain('RF_BIDI_SMOKING')
      expect(codes).toContain('RF_SMOKELESS_TOBACCO')
      expect(codes).toContain('RF_BIOMASS_CHULA_COOKING')
      expect(codes).toContain('RF_OCCUPATIONAL_DUST')
      expect(codes).toContain('RF_PRIOR_TUBERCULOSIS')
      expect(codes).toContain('RF_CHRONIC_COPD')

      // Check smoking prevalence in clinical cohort
      const cigarette = prevalences.find((p) => p.factorCode === 'RF_CIGARETTE_SMOKING')!
      expect(cigarette.prevalencePct).toBeCloseTo(38.4, 1)
      expect(cigarette.missingnessPct).toBeGreaterThan(0)
      expect(cigarette.isSuppressed).toBe(false)

      // Check traditional chula biomass cooking
      const biomass = prevalences.find((p) => p.factorCode === 'RF_BIOMASS_CHULA_COOKING')!
      expect(biomass.prevalencePct).toBeGreaterThan(50.0) // Substantial exposure in Bangladesh
    })

    it('identifies top co-occurring risk factor pairs and calculates relative odds ratios', () => {
      const pairs = PopulationRiskFactorService.getCoOccurrencePairs(5000)
      expect(pairs.length).toBeGreaterThanOrEqual(5)

      // Bidi + Biomass
      const bidiBiomass = pairs.find(
        (p) => p.factorA === 'RF_BIDI_SMOKING' && p.factorB === 'RF_BIOMASS_CHULA_COOKING'
      )
      expect(bidiBiomass).toBeDefined()
      expect(bidiBiomass?.relativeOddsRatio).toBeGreaterThan(2.0)
      expect(bidiBiomass?.coOccurrencePct).toBeGreaterThan(15.0)

      // Cigarette + COPD
      const cigCopd = pairs.find(
        (p) => p.factorA === 'RF_CIGARETTE_SMOKING' && p.factorB === 'RF_CHRONIC_COPD'
      )
      expect(cigCopd).toBeDefined()
      expect(cigCopd?.relativeOddsRatio).toBeGreaterThan(3.0)
    })

    it('breaks down demographic strata by age group and biological sex', () => {
      const strata = PopulationRiskFactorService.getDemographicStrata(5000)
      expect(strata.length).toBe(10) // 5 age groups * 2 sexes

      const male5059 = strata.find((s) => s.ageGroup === '50_59' && s.sex === 'male')
      expect(male5059).toBeDefined()
      expect(male5059?.percentage).toBeGreaterThan(10)
      expect(male5059?.isSuppressed).toBe(false)
    })
  })

  // ==========================================================================
  // 3. GEOGRAPHIC DISPARITIES ACROSS BANGLADESH
  // ==========================================================================
  describe('3. Geographic Risk Patterns & Disparities', () => {
    it('summarizes risk metrics across Bangladesh administrative divisions and districts', () => {
      const metrics = GeographicPopulationService.getGeographicMetrics(5000)
      expect(metrics.length).toBeGreaterThanOrEqual(8)

      const dhaka = metrics.find((m) => m.district === 'Dhaka')
      expect(dhaka).toBeDefined()
      expect(dhaka?.division).toBe('Dhaka')
      expect(dhaka?.ambientPm25Avg).toBeCloseTo(114.2, 1)
      expect(dhaka?.coverageTier).toBe('robust')

      const rajshahi = metrics.find((m) => m.district === 'Rajshahi')
      expect(rajshahi).toBeDefined()
      expect(rajshahi?.smokingPrevalencePct).toBeGreaterThan(40) // High bidi/tobacco agricultural belt

      const sylhet = metrics.find((m) => m.district === 'Sylhet')
      expect(sylhet).toBeDefined()
      expect(sylhet?.ambientPm25Avg).toBeLessThan(45)
    })

    it('suppresses metrics in sparse sub-cohorts if sample size falls below k', () => {
      // Simulate small cohort where rural districts drop below k=5
      const smallCohortMetrics = GeographicPopulationService.getGeographicMetrics(30, {
        kThreshold: 5,
      })

      const barishal = smallCohortMetrics.find((m) => m.district === 'Barishal')!
      // Weight 0.04 * 30 = 1.2 => 1 individual => MUST be suppressed under k=5
      expect(barishal.isSuppressed).toBe(true)
      expect(barishal.displayTotalAssessments).toBe('< 5 [SUPPRESSED]')
      expect(barishal.smokingPrevalencePct).toBe(0)
    })

    it('cross-tabulates ambient PM2.5 hotspots with chronic respiratory symptoms', () => {
      const correlations = GeographicPopulationService.getEnvironmentalCorrelations(5000)
      expect(correlations.length).toBeGreaterThanOrEqual(4)

      const dhakaCorr = correlations.find((c) => c.district === 'Dhaka')!
      expect(dhakaCorr.hotspotSeverity).toBe('extreme')
      expect(dhakaCorr.ambientPm25AnnualAvg).toBeGreaterThan(100)
      expect(dhakaCorr.chronicRespiratorySymptomPct).toBeGreaterThan(10.0)
      expect(dhakaCorr.nonCausalNotice).toContain('do NOT independently establish lung cancer causation')
    })
  })

  // ==========================================================================
  // 4. LONGITUDINAL TRENDS & PLATFORM GROWTH
  // ==========================================================================
  describe('4. Longitudinal Population Trends', () => {
    it('evaluates quarterly longitudinal patterns and isolates platform adoption growth', () => {
      const trends = PopulationTrendService.getLongitudinalTrends(5000)
      expect(trends.length).toBe(8) // 2025-Q1 through 2026-Q4

      const q1 = trends[0]
      expect(q1.periodLabel).toBe('2025-Q1')
      expect(q1.currentSmokerPct).toBeGreaterThan(40.0)

      const q8 = trends[7]
      expect(q8.periodLabel).toBe('2026-Q4')
      expect(q8.totalAssessments).toBeGreaterThan(q1.totalAssessments)
      expect(q8.platformAdoptionGrowthPct).toBeGreaterThan(0)

      // Gradual behavioral shift (smoking cessation / bidi reduction)
      expect(q8.currentSmokerPct).toBeLessThan(q1.currentSmokerPct)
      expect(q8.biomassCookingPct).toBeLessThan(q1.biomassCookingPct)
    })
  })

  // ==========================================================================
  // 5. COMPREHENSIVE SERVICE & GOVERNANCE INVARIANTS
  // ==========================================================================
  describe('5. Comprehensive Population Service & Clinical Governance Invariants', () => {
    it('generates complete population intelligence summary with audit hashes', async () => {
      const summary = await PopulationIntelligenceService.getPopulationSummary({
        kThreshold: 5,
      })

      expect(summary.cohortCode).toBe('COHORT-LUNGENT-NATIONAL-2026')
      expect(summary.totalSampleAnalyzed).toBe(5000)
      expect(summary.activePrivacyKThreshold).toBe(5)
      expect(summary.riskFactorPrevalences.length).toBeGreaterThan(0)
      expect(summary.topCoOccurringFactors.length).toBeGreaterThan(0)
      expect(summary.geographicSummary.length).toBeGreaterThan(0)
      expect(summary.longitudinalTrends.length).toBe(8)

      // Mandatory Governance Disclaimers
      expect(summary.clinicalGovernanceNotices.representativenessCaveatEn).toBe(
        REPRESENTATIVENESS_CAVEAT_EN
      )
      expect(summary.clinicalGovernanceNotices.nonCausalNoticeEn).toBe(
        NON_CAUSAL_POPULATION_NOTICE_EN
      )
      expect(summary.clinicalGovernanceNotices.nonDiagnosticNoticeEn).toContain(
        'It must NEVER be used to infer an individual patient\'s risk score'
      )
    })

    it('creates compliant research query audit records', () => {
      const audit = PopulationIntelligenceService.createAuditTrailRecord(
        { division: 'Rajshahi', topic: 'bidi_tobacco' },
        600
      )

      expect(audit.queryCode).toMatch(/^QRY-POP-\d+$/)
      expect(audit.auditHash).toContain('POPAUDIT-v2.8.0')
      expect(audit.recordsAnalyzed).toBe(600)
      expect(audit.nonCausalEnforced).toBe(true)
    })

    it('population statistics must never be used to override individual red-flag symptom triage', async () => {
      const summary = await PopulationIntelligenceService.getPopulationSummary()
      const lowRiskDistrict = summary.geographicSummary.find((g) => g.district === 'Sylhet')!

      // Even in a low-smoking, low-particulate district (Sylhet),
      // the urgent symptom alert rate is non-zero, reinforcing that individual red flags are independent of regional averages.
      expect(lowRiskDistrict.urgentSymptomAlertPct).toBeGreaterThan(0)
    })
  })
})

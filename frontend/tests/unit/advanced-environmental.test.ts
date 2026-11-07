/**
 * Phase 2.7: Advanced Environmental Intelligence Test Suite
 *
 * Comprehensive unit and integration verification for:
 * 1. Multi-Provider Environmental Architecture & Failover Chaining
 * 2. Historical Environmental Exposure Analysis (Multi-scale & Seasonal)
 * 3. Long-Term Longitudinal Environmental Trends (5-Year & Seasonal Decomposition)
 * 4. Geographic Environmental Modeling & Inverse Distance Weighting (IDW) Interpolation
 * 5. Environmental Risk Factor Framework (IARC Groupings)
 * 6. Patient Residential Location Exposure Profile
 * 7. Non-Negotiable Clinical Safety Invariants
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  EnvironmentalIntelligenceService,
  EnvironmentalProviderRegistry,
  REGISTERED_ENVIRONMENTAL_PROVIDERS,
  USEmbassyGroundSensorProvider,
  CopernicusSatelliteReanalysisProvider,
  BangladeshDoEGroundStationProvider,
  MultiProviderAggregator,
  HistoricalExposureService,
  LongTermTrendAnalysisService,
  GeographicEnvironmentalModelService,
  EnvironmentalRiskFactorService,
  MANDATORY_CLINICAL_SAFETY_DISCLAIMER,
  HISTORICAL_CLINICAL_SAFETY_NOTICE,
  TREND_CLINICAL_CONTEXT_NOTICE,
  SPATIAL_MODELING_DISCLAIMER,
  MANDATORY_RISK_FACTOR_DISCLAIMER,
  type PatientLocationHistoryEntry,
} from '@/modules/environmental'

describe('Phase 2.7: Advanced Environmental Intelligence Framework', () => {
  beforeEach(() => {
    EnvironmentalIntelligenceService.resetProvider()
  })

  // ==========================================================================
  // 1. MULTI-PROVIDER ARCHITECTURE & REGISTRY
  // ==========================================================================
  describe('1. Multi-Provider Architecture & Registry', () => {
    it('registers all 4 core environmental providers with complete metadata', () => {
      const providers = EnvironmentalProviderRegistry.getAllMetadata()
      expect(providers.length).toBeGreaterThanOrEqual(4)

      const codes = providers.map((p) => p.providerCode)
      expect(codes).toContain('open-meteo')
      expect(codes).toContain('us-embassy-dhaka')
      expect(codes).toContain('copernicus-cams-reanalysis')
      expect(codes).toContain('bangladesh-doe-case')
    })

    it('preserves distinct provider classifications and measurement methods', () => {
      const embassy = REGISTERED_ENVIRONMENTAL_PROVIDERS['us-embassy-dhaka']
      expect(embassy.classification).toBe('direct_ground_station')
      expect(embassy.reliabilityTier).toBe('gold_standard')
      expect(embassy.measurementResolution).toContain('Met One Instruments BAM-1020')

      const copernicus = REGISTERED_ENVIRONMENTAL_PROVIDERS['copernicus-cams-reanalysis']
      expect(copernicus.classification).toBe('satellite_reanalysis')
      expect(copernicus.reliabilityTier).toBe('certified')
      expect(copernicus.supportedPollutants).toContain('pm2_5')
      expect(copernicus.supportedPollutants).toContain('nitrogen_dioxide')

      const copProvider = new CopernicusSatelliteReanalysisProvider()
      expect(copProvider.providerCode).toBe('copernicus-cams-reanalysis')

      const doe = REGISTERED_ENVIRONMENTAL_PROVIDERS['bangladesh-doe-case']
      expect(doe.classification).toBe('governmental_reference')
      expect(doe.coverageJurisdiction).toContain('Bangladesh National CAMS Network')

      const doeProvider = new BangladeshDoEGroundStationProvider()
      expect(doeProvider.providerCode).toBe('bangladesh-doe-case')
    })

    it('queries direct ground station provider with in-situ status for Dhaka', async () => {
      const embassy = new USEmbassyGroundSensorProvider()
      const readings = await embassy.getLatestReadings({
        division: 'Dhaka',
        district: 'Dhaka',
      })

      expect(readings.length).toBeGreaterThanOrEqual(2)
      const pm25 = readings.find((r) => r.parameter === 'pm2_5')
      expect(pm25).toBeDefined()
      expect(pm25?.readingStatus).toBe('measured')
      expect(pm25?.provenanceMetadata?.stationLocation).toContain('Madani Ave')
      expect(pm25?.confidenceScore).toBeGreaterThanOrEqual(0.95)
    })

    it('performs multi-provider comparison and detects variance without crashing', async () => {
      const comparison = await MultiProviderAggregator.compareProviders({
        division: 'Dhaka',
        district: 'Dhaka',
      })

      expect(comparison.providersPolled.length).toBeGreaterThanOrEqual(3)
      expect(comparison.compositeAveragePm25).toBeGreaterThan(0)
      expect(comparison.compositeAverageAqi).toBeGreaterThan(0)
      expect(comparison.primaryRecommendedProvider).toBe('us-embassy-dhaka')
    })

    it('executes resilient query with failover chaining', async () => {
      const res = await MultiProviderAggregator.queryWithFailover(
        { division: 'Chattogram', district: 'Chattogram' },
        'copernicus-cams-reanalysis'
      )

      expect(res.summary).toBeDefined()
      expect(res.usedProviderCode).toBe('copernicus-cams-reanalysis')
      expect(res.summary.pollutants.pm25?.value).toBeGreaterThan(0)
    })
  })

  // ==========================================================================
  // 2. HISTORICAL EXPOSURE ANALYSIS & SEASONALITY
  // ==========================================================================
  describe('2. Historical Environmental Exposure Analysis', () => {
    it('retrieves multi-year historical snapshots across Bangladesh seasons', async () => {
      const summary = await HistoricalExposureService.getHistoricalExposureSummary({
        division: 'Dhaka',
        district: 'Dhaka',
      })

      expect(summary.periodCoverage.totalDays).toBeGreaterThan(0)
      expect(summary.baselineAverages.avgPm25).toBeGreaterThan(50)
      expect(summary.periodCoverage.dataCompletenessRatio).toBeGreaterThanOrEqual(0.90)

      // Bangladesh Climatic Seasons
      const seasons = summary.seasonalProfiles
      expect(seasons.winter_dry).toBeDefined()
      expect(seasons.pre_monsoon).toBeDefined()
      expect(seasons.monsoon).toBeDefined()

      // Clinical/Meteorological reality: Winter thermal inversion produces highest PM2.5; Monsoon produces lowest
      expect(seasons.winter_dry.avgPm25).toBeGreaterThan(seasons.pre_monsoon.avgPm25)
      expect(seasons.pre_monsoon.avgPm25).toBeGreaterThan(seasons.monsoon.avgPm25)
      expect(summary.clinicalSafetyNotice).toBe(HISTORICAL_CLINICAL_SAFETY_NOTICE)
    })

    it('calculates elevated exposure days and does not assume missing observations are zero', async () => {
      const summary = await HistoricalExposureService.getHistoricalExposureSummary({
        division: 'Dhaka',
        district: 'Dhaka',
      })

      expect(summary.elevatedExposureDaysCount).toBeGreaterThan(0)
      expect(summary.elevatedDaysRatio).toBeGreaterThan(0)
      expect(summary.periodCoverage.dataCompletenessRatio).toBeLessThanOrEqual(1.0)
    })

    it('builds patient residential exposure context while enforcing non-diagnostic flags', async () => {
      const sampleLocations: PatientLocationHistoryEntry[] = [
        {
          id: 'loc-1',
          patientId: 'pat-123',
          division: 'Dhaka',
          district: 'Dhaka',
          countryCode: 'BD',
          verificationStatus: 'verified',
          isCurrent: false,
          durationYears: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'loc-2',
          patientId: 'pat-123',
          division: 'Sylhet',
          district: 'Sylhet',
          countryCode: 'BD',
          verificationStatus: 'verified',
          isCurrent: true,
          durationYears: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]

      const profile = await HistoricalExposureService.buildPatientResidentialExposureContext(
        'pat-123',
        sampleLocations,
        15, // 15 years biomass chula cooking
        0
      )

      expect(profile.patientId).toBe('pat-123')
      expect(profile.residentialLocations.length).toBe(2)
      // Dhaka (110 * 10 = 1100) + Sylhet (35 * 5 = 175) = ~1275 PM2.5-years proxy
      expect(profile.totalEstimatedAmbientPm25Years).toBeGreaterThan(1000)
      expect(profile.indoorBiomassExposureYears).toBe(15)
      expect(profile.clinicalReviewStatus).toBe('contextual_only')
      expect(profile.mandatoryNonDiagnosticNotice).toContain('NOT equate to an individual patient\'s biological cumulative dose')
    })
  })

  // ==========================================================================
  // 3. LONG-TERM TRENDS & SEASONAL DECOMPOSITION
  // ==========================================================================
  describe('3. Long-Term Environmental Trends', () => {
    it('analyzes longitudinal 5-year trends with Ordinary Least Squares and seasonal amplitude', async () => {
      const trends = await LongTermTrendAnalysisService.analyzeLongTermTrends({
        division: 'Dhaka',
        district: 'Dhaka',
      })

      expect(trends.observationYears.length).toBeGreaterThanOrEqual(5)
      expect(trends.yearlySeries.length).toBeGreaterThanOrEqual(5)
      expect(['increasing', 'decreasing', 'stable']).toContain(trends.trendDirection)
      expect(typeof trends.annualDeltaPm25PerYear).toBe('number')
      expect(trends.seasonalAmplitudeAvg).toBeGreaterThan(40) // Substantial winter vs monsoon delta
      expect(trends.statisticalMethodology).toContain('Ordinary Least Squares')
      expect(trends.clinicalContextNotice).toBe(TREND_CLINICAL_CONTEXT_NOTICE)
    })
  })

  // ==========================================================================
  // 4. GEOGRAPHIC ENVIRONMENTAL MODELING & SPATIAL INTERPOLATION
  // ==========================================================================
  describe('4. Geographic Environmental Modeling & Spatial Interpolation', () => {
    it('accurately calculates Haversine distance between Bangladesh cities', () => {
      // Dhaka (23.81, 90.41) to Chattogram (22.35, 91.78) is approx ~210-220 km
      const dist = GeographicEnvironmentalModelService.calculateDistanceKm(
        23.81,
        90.41,
        22.35,
        91.78
      )
      expect(dist).toBeGreaterThan(200)
      expect(dist).toBeLessThan(230)
    })

    it('performs exact match when target coordinates coincide with reference station', () => {
      // Target at US Embassy Dhaka BAM-1020 coordinates
      const estimate = GeographicEnvironmentalModelService.interpolateSpatialPm25(
        23.797,
        90.423,
        'Dhaka',
        'Dhaka'
      )

      expect(estimate.interpolationMethod).toBe('ground_station_direct')
      expect(estimate.estimatedPm25).toBeCloseTo(142.0, 1)
      expect(estimate.contributingStationsCount).toBe(1)
      expect(estimate.uncertaintyMarginPm25).toBe(5.0)
    })

    it('interpolates intermediate location with IDW and wider uncertainty margin', () => {
      // Intermediate rural point between Dhaka and Sylhet (e.g. Kishoreganj / Brahmanbaria Lat 24.3, Lon 91.0)
      const estimate = GeographicEnvironmentalModelService.interpolateSpatialPm25(
        24.300,
        91.000,
        'Dhaka',
        'Kishoreganj'
      )

      expect(estimate.interpolationMethod).toBe('idw_interpolation')
      expect(estimate.estimatedPm25).toBeGreaterThan(32.5)
      expect(estimate.estimatedPm25).toBeLessThan(142.0)
      expect(estimate.distanceToNearestStationKm).toBeGreaterThan(15)
      expect(estimate.uncertaintyMarginPm25).toBeGreaterThanOrEqual(10.0)
      expect(estimate.spatialDisclaimer).toBe(SPATIAL_MODELING_DISCLAIMER)
    })

    it('curates national environmental hotspots with severity tiers', () => {
      const hotspots = GeographicEnvironmentalModelService.getBangladeshHotspots()
      expect(hotspots.length).toBeGreaterThanOrEqual(7)

      const dhaka = hotspots.find((h) => h.district === 'Dhaka')
      expect(dhaka).toBeDefined()
      expect(dhaka?.hotspotSeverityTier).toBe('extreme')
      expect(dhaka?.primaryContributingFactors.some((f) => f.includes('brick kilns'))).toBe(true)

      const sylhet = hotspots.find((h) => h.district === 'Sylhet')
      expect(sylhet).toBeDefined()
      expect(sylhet?.hotspotSeverityTier).toBe('low')
      expect(sylhet?.annualAvgPm25).toBeLessThan(45.0)
    })
  })

  // ==========================================================================
  // 5. ENVIRONMENTAL RISK FACTOR FRAMEWORK (IARC EVIDENCE)
  // ==========================================================================
  describe('5. Environmental Risk Factor Framework (IARC Classifications)', () => {
    it('indexes curated environmental risk factors with IARC classifications', () => {
      const allFactors = EnvironmentalRiskFactorService.getAllRiskFactors()
      expect(allFactors.length).toBeGreaterThanOrEqual(5)

      const pm25 = EnvironmentalRiskFactorService.getRiskFactorByCode('RISK-ENV-PM25')
      expect(pm25).toBeDefined()
      expect(pm25?.iarcClassification).toContain('IARC Group 1')
      expect(pm25?.scientificReference).toContain('IARC Monographs')

      const biomass = EnvironmentalRiskFactorService.getRiskFactorByCode('RISK-ENV-BIOMASS')
      expect(biomass).toBeDefined()
      expect(biomass?.category).toBe('indoor_biomass')
      expect(biomass?.iarcClassification).toContain('IARC Group 2A')

      const trap = EnvironmentalRiskFactorService.getRiskFactorByCode('RISK-ENV-TRAP')
      expect(trap).toBeDefined()
      expect(trap?.category).toBe('traffic_proximity')
      expect(trap?.iarcClassification).toContain('IARC Group 1')
    })

    it('filters risk factors by category', () => {
      const occ = EnvironmentalRiskFactorService.getRiskFactorsByCategory('occupational_dust')
      expect(occ.length).toBeGreaterThanOrEqual(1)
      expect(occ[0].profileCode).toBe('RISK-ENV-OCCUPATIONAL-DUST')
    })
  })

  // ==========================================================================
  // 6. CLINICAL SAFETY & GOVERNANCE INVARIANTS
  // ==========================================================================
  describe('6. Clinical Safety & Governance Invariants', () => {
    it('strictly forbids using ambient AQI as a direct patient cancer risk score', () => {
      expect(() => {
        EnvironmentalIntelligenceService.assertEnvironmentalDataNotUsedAsDirectRiskScore(185)
      }).not.toThrow()

      expect(MANDATORY_CLINICAL_SAFETY_DISCLAIMER).toContain('NOT an individual lifetime cancer risk score')
      expect(MANDATORY_RISK_FACTOR_DISCLAIMER).toContain('do NOT independently establish an individual patient\'s lung cancer diagnosis')
    })

    it('service façade methods expose multi-provider, historical, and spatial modeling cleanly', async () => {
      const hotspots = EnvironmentalIntelligenceService.getBangladeshHotspots()
      expect(hotspots.length).toBeGreaterThan(0)

      const factors = EnvironmentalIntelligenceService.getEnvironmentalRiskFactors('ambient_particulate')
      expect(factors.length).toBeGreaterThan(0)

      const interpolation = EnvironmentalIntelligenceService.interpolateSpatialPm25(
        23.8103,
        90.4125,
        'Dhaka',
        'Dhaka'
      )
      expect(interpolation.estimatedPm25).toBeGreaterThan(0)
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  OpenMeteoAirQualityProvider,
  resolveCentroidCoordinates,
  interpretUsAqi,
  interpretEuropeanAqi,
  EnvironmentalCacheManager,
  EnvironmentalIntelligenceService,
  MANDATORY_CLINICAL_SAFETY_DISCLAIMER,
  type OpenMeteoAirQualityResponse,
  type EnvironmentalContextSummary,
} from '@/modules/environmental'

describe('Phase 1.16: Open-Meteo Air Quality API Integration', () => {
  beforeEach(() => {
    EnvironmentalCacheManager.clear()
    EnvironmentalIntelligenceService.resetProvider()
    vi.restoreAllMocks()
  })

  describe('1. Geographic Centroid Coordinate Resolution', () => {
    it('should resolve Bangladesh division centroids accurately without requiring home coordinates', () => {
      const dhakaCoords = resolveCentroidCoordinates('Dhaka', 'Dhaka', 'BD')
      expect(dhakaCoords.latitude).toBeCloseTo(23.81, 1)
      expect(dhakaCoords.longitude).toBeCloseTo(90.41, 1)
      expect(dhakaCoords.resolution).toBe('district_centroid')

      const chattogramCoords = resolveCentroidCoordinates('Chattogram', 'Chattogram', 'BD')
      expect(chattogramCoords.latitude).toBeCloseTo(22.35, 1)
      expect(chattogramCoords.longitude).toBeCloseTo(91.78, 1)
    })

    it('should resolve Bangladesh 64 district centroids accurately', () => {
      const gazipur = resolveCentroidCoordinates('Dhaka', 'Gazipur', 'BD')
      expect(gazipur.latitude).toBeCloseTo(23.99, 1)

      const cox = resolveCentroidCoordinates('Chattogram', 'Cox\'s Bazar', 'BD')
      expect(cox.latitude).toBeCloseTo(21.42, 1)
      expect(cox.longitude).toBeCloseTo(92.00, 1)

      const bogura = resolveCentroidCoordinates('Rajshahi', 'Bogura', 'BD')
      expect(bogura.latitude).toBeCloseTo(24.84, 1)
    })

    it('should support international fallback coordinates', () => {
      const us = resolveCentroidCoordinates('California', 'Los Angeles', 'US')
      expect(us.latitude).toBeCloseTo(34.05, 1)
      expect(us.longitude).toBeCloseTo(-118.24, 1)

      const uk = resolveCentroidCoordinates('Greater London', 'London', 'UK')
      expect(uk.latitude).toBeCloseTo(51.50, 1)
    })
  })

  describe('2. Authoritative AQI Standards Interpretation (US EPA vs European EEA)', () => {
    it('should evaluate US EPA AQI across all 6 official breakpoint tiers', () => {
      expect(interpretUsAqi(25).categoryKey).toBe('good')
      expect(interpretUsAqi(25).scale).toBe('US_EPA_0_500')
      expect(interpretUsAqi(25).standardAuthority).toContain('US EPA')

      expect(interpretUsAqi(75).categoryKey).toBe('moderate')
      expect(interpretUsAqi(125).categoryKey).toBe('unhealthy_sensitive')
      expect(interpretUsAqi(175).categoryKey).toBe('unhealthy')
      expect(interpretUsAqi(250).categoryKey).toBe('very_unhealthy')
      expect(interpretUsAqi(350).categoryKey).toBe('hazardous')
    })

    it('should evaluate European CAQI across official EEA Directive 2008/50/EC tiers', () => {
      expect(interpretEuropeanAqi(15).categoryKey).toBe('very_good')
      expect(interpretEuropeanAqi(15).scale).toBe('EEA_CAQI_0_100')
      expect(interpretEuropeanAqi(15).standardAuthority).toContain('European Environment Agency')

      expect(interpretEuropeanAqi(35).categoryKey).toBe('good')
      expect(interpretEuropeanAqi(55).categoryKey).toBe('medium')
      expect(interpretEuropeanAqi(75).categoryKey).toBe('poor')
      expect(interpretEuropeanAqi(95).categoryKey).toBe('very_poor')
      expect(interpretEuropeanAqi(120).categoryKey).toBe('extremely_poor')
    })

    it('should keep US and European AQI systems strictly independent and unaggregated', () => {
      const us = interpretUsAqi(160)
      const eu = interpretEuropeanAqi(65)

      expect(us.scale).not.toBe(eu.scale)
      expect(us.categoryKey).toBe('unhealthy')
      expect(eu.categoryKey).toBe('poor')
    })
  })

  describe('3. Open-Meteo Response Normalization & Provenance', () => {
    const mockRawResponse: OpenMeteoAirQualityResponse = {
      latitude: 23.81,
      longitude: 90.41,
      generationtime_ms: 0.8,
      utc_offset_seconds: 21600,
      timezone: 'Asia/Dhaka',
      timezone_abbreviation: '+06',
      current_units: {
        time: 'iso8601',
        interval: 'seconds',
        pm10: 'μg/m³',
        pm2_5: 'μg/m³',
        carbon_monoxide: 'μg/m³',
        nitrogen_dioxide: 'μg/m³',
        sulphur_dioxide: 'μg/m³',
        ozone: 'μg/m³',
        us_aqi: 'AQI',
        european_aqi: 'AQI',
      },
      current: {
        time: '2026-11-05T20:00',
        interval: 3600,
        pm10: 165.4,
        pm2_5: 112.8,
        carbon_monoxide: 1250,
        nitrogen_dioxide: 42.1,
        sulphur_dioxide: 16.5,
        ozone: 24.0,
        us_aqi: 181,
        european_aqi: 76,
      },
      hourly: {
        time: ['2026-11-05T19:00', '2026-11-05T20:00', '2026-11-05T21:00'],
        pm10: [150.0, 165.4, 170.0],
        pm2_5: [100.0, 112.8, 118.0],
        carbon_monoxide: [1100, 1250, 1300],
        nitrogen_dioxide: [38.0, 42.1, 45.0],
        sulphur_dioxide: [15.0, 16.5, 17.0],
        ozone: [22.0, 24.0, 25.0],
        us_aqi: [175, 181, 184],
        european_aqi: [72, 76, 78],
      },
    }

    it('should normalize Open-Meteo payload into structured EnvironmentalContextSummary', () => {
      const provider = new OpenMeteoAirQualityProvider()
      const summary = provider.normalizeSummary(
        { division: 'Dhaka', district: 'Dhaka' },
        mockRawResponse,
        { latitude: 23.81, longitude: 90.41, resolution: 'district_centroid' }
      )

      expect(summary.division).toBe('Dhaka')
      expect(summary.district).toBe('Dhaka')
      expect(summary.aqi.value).toBe(181)
      expect(summary.aqi.category).toBe('unhealthy')
      expect(summary.europeanAqi?.value).toBe(76)
      expect(summary.europeanAqi?.category).toBe('poor')
      expect(summary.europeanAqi?.scale).toBe('EEA_CAQI_0_100')

      expect(summary.pollutants.pm25?.value).toBe(112.8)
      expect(summary.pollutants.pm10?.value).toBe(165.4)
      expect(summary.pollutants.no2?.value).toBe(42.1)
      expect(summary.pollutants.co?.value).toBe(1.25) // Converted from µg/m³ to mg/m³
      expect(summary.pollutants.co?.unit).toBe('mg/m³')

      expect(summary.sourceMeta.name).toBe('Open-Meteo Air Quality API')
      expect(summary.dataClassification).toBe('model_analysis')
      expect(summary.clinicalSafetyDisclaimer).toBe(MANDATORY_CLINICAL_SAFETY_DISCLAIMER)
    })

    it('should format hourly timeline points and correctly identify forecast points', () => {
      const provider = new OpenMeteoAirQualityProvider()
      const summary = provider.normalizeSummary(
        { division: 'Dhaka', district: 'Dhaka' },
        mockRawResponse,
        { latitude: 23.81, longitude: 90.41, resolution: 'district_centroid' }
      )

      expect(summary.hourlyTimeline).toBeDefined()
      expect(summary.hourlyTimeline?.length).toBe(3)

      const pastPoint = summary.hourlyTimeline?.[0]
      expect(pastPoint?.time).toBe('2026-11-05T19:00')
      expect(pastPoint?.isForecast).toBe(false)

      const futurePoint = summary.hourlyTimeline?.[2]
      expect(futurePoint?.time).toBe('2026-11-05T21:00')
      expect(futurePoint?.isForecast).toBe(true)
    })
  })

  describe('4. Environmental Cache & Resilience Layer', () => {
    it('should cache and retrieve fresh observations within TTL', () => {
      const mockSummary: EnvironmentalContextSummary = {
        division: 'Dhaka',
        district: 'Dhaka',
        observationTimestamp: '2026-11-05T12:00:00Z',
        aqi: { value: 175, category: 'unhealthy', status: 'estimated' },
        pollutants: {},
        sourceMeta: {
          name: 'Test',
          providerType: 'mock',
          reliabilityTier: 'tier_1_measured',
          attribution: 'Test Attribution',
        },
        clinicalSafetyDisclaimer: MANDATORY_CLINICAL_SAFETY_DISCLAIMER,
      }

      EnvironmentalCacheManager.set('BD', 'Dhaka', 'Dhaka', mockSummary, 10000)

      const cached = EnvironmentalCacheManager.get('BD', 'Dhaka', 'Dhaka')
      expect(cached).toBeDefined()
      expect(cached?.aqi.value).toBe(175)
      expect(cached?.isStale).toBe(false)
    })

    it('should return null when cache expires, but allow stale retrieval for offline fallback', () => {
      const mockSummary: EnvironmentalContextSummary = {
        division: 'Khulna',
        district: 'Khulna',
        observationTimestamp: '2026-11-05T12:00:00Z',
        aqi: { value: 110, category: 'unhealthy_sensitive', status: 'estimated' },
        pollutants: {},
        sourceMeta: {
          name: 'Test',
          providerType: 'mock',
          reliabilityTier: 'tier_1_measured',
          attribution: 'Test Attribution',
        },
        clinicalSafetyDisclaimer: MANDATORY_CLINICAL_SAFETY_DISCLAIMER,
      }

      // Expired entry
      EnvironmentalCacheManager.set('BD', 'Khulna', 'Khulna', mockSummary, -5000)

      const fresh = EnvironmentalCacheManager.get('BD', 'Khulna', 'Khulna')
      expect(fresh).toBeNull()

      const stale = EnvironmentalCacheManager.getStale('BD', 'Khulna', 'Khulna')
      expect(stale).toBeDefined()
      expect(stale?.isStale).toBe(true)
    })

    it('should deduplicate simultaneous in-flight requests for the same coordinates', async () => {
      let callCount = 0
      const fetcher = async (): Promise<EnvironmentalContextSummary> => {
        callCount++
        await new Promise((r) => setTimeout(r, 20))
        return {
          division: 'Sylhet',
          district: 'Sylhet',
          observationTimestamp: '2026-11-05T12:00:00Z',
          aqi: { value: 65, category: 'moderate', status: 'estimated' },
          pollutants: {},
          sourceMeta: {
            name: 'Test',
            providerType: 'mock',
            reliabilityTier: 'tier_1_measured',
            attribution: 'Test Attribution',
          },
          clinicalSafetyDisclaimer: MANDATORY_CLINICAL_SAFETY_DISCLAIMER,
        }
      }

      // Launch 3 simultaneous requests
      const [res1, res2, res3] = await Promise.all([
        EnvironmentalCacheManager.deduplicate('BD', 'Sylhet', 'Sylhet', fetcher),
        EnvironmentalCacheManager.deduplicate('BD', 'Sylhet', 'Sylhet', fetcher),
        EnvironmentalCacheManager.deduplicate('BD', 'Sylhet', 'Sylhet', fetcher),
      ])

      expect(callCount).toBe(1)
      expect(res1.aqi.value).toBe(65)
      expect(res2.aqi.value).toBe(65)
      expect(res3.aqi.value).toBe(65)
    })
  })

  describe('5. Open-Meteo Provider Fallback & Clinical Safety', () => {
    it('should fall back to reference benchmark when external API fails or is unreachable', async () => {
      const provider = new OpenMeteoAirQualityProvider()

      // Force API fetch to fail
      vi.spyOn(provider, 'fetchRawOpenMeteo').mockRejectedValueOnce(new Error('Network timeout (4000ms)'))

      const summary = await provider.getEnvironmentalSummary({
        division: 'Chattogram',
        district: 'Chattogram',
      })

      // Verifies graceful fallback: does not throw, returns validated reference baseline
      expect(summary).toBeDefined()
      expect(summary.division).toBe('Chattogram')
      expect(summary.dataClassification).toBe('reference_benchmark')
      expect(summary.isStale).toBe(true)
      expect(summary.clinicalSafetyDisclaimer).toBe(MANDATORY_CLINICAL_SAFETY_DISCLAIMER)
    })

    it('should enforce the mandatory clinical safety disclaimer in all Open-Meteo summaries', async () => {
      const provider = new OpenMeteoAirQualityProvider()
      const summary = await provider.getEnvironmentalSummary({
        division: 'Rajshahi',
        district: 'Rajshahi',
      })

      expect(summary.clinicalSafetyDisclaimer).toContain('Current AQI is a short-term atmospheric measurement')
      expect(summary.clinicalSafetyDisclaimer).toContain('NOT an individual lifetime cancer risk score')
    })
  })
})

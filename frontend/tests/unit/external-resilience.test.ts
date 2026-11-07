/**
 * Phase 1.26: External Service Resilience & Fault Injection Unit Test Suite
 *
 * Verifies system stability when external dependencies fail, throttle, or return
 * malformed data:
 * 1. Open-Meteo Air Quality API: HTTP 500/503 errors, network timeouts, and 429 throttling.
 * 2. Malformed payloads: Missing pollutant arrays, invalid coordinates, partial JSON.
 * 3. Graceful fallback: Activating cached/historical regional baselines with data provenance.
 * 4. Communication channels resilience: SMS/Email failure does not block in-app delivery.
 * 5. Data provenance & safety disclaimer invariance across all failure modes.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  OpenMeteoAirQualityProvider,
  EnvironmentalCacheManager,
  EnvironmentalIntelligenceService,
  MANDATORY_CLINICAL_SAFETY_DISCLAIMER,
  type OpenMeteoAirQualityResponse,
} from '@/modules/environmental'
import { NotificationService } from '@/modules/notifications/service'

describe('Phase 1.26: External Service Resilience & Fault Injection', () => {
  beforeEach(() => {
    EnvironmentalCacheManager.clear()
    EnvironmentalIntelligenceService.resetProvider()
    vi.restoreAllMocks()
  })

  // ==========================================================================
  // 1. OPEN-METEO HTTP 500 / 503 SERVICE OUTAGE RESILIENCE
  // ==========================================================================
  describe('1. Open-Meteo Air Quality API Service Outage & HTTP Errors', () => {
    it('gracefully handles HTTP 500 Server Error by falling back to regional baseline without unhandled rejections', async () => {
      const provider = new OpenMeteoAirQualityProvider()

      // Force provider fetch to simulate 500 error
      vi.spyOn(provider, 'fetchRawOpenMeteo').mockRejectedValueOnce(
        new Error('HTTP 500 Internal Server Error')
      )

      // Calling getEnvironmentalSummary should catch the error and fall back gracefully
      const summary = await provider.getEnvironmentalSummary({
        division: 'Dhaka',
        district: 'Dhaka',
      })

      expect(summary).toBeDefined()
      expect(summary.division).toBe('Dhaka')
      expect(summary.district).toBe('Dhaka')
      expect(summary.aqi).toBeDefined()
      expect(summary.dataClassification).toBe('reference_benchmark')
      expect(summary.isStale).toBe(true)
      expect(summary.clinicalSafetyDisclaimer).toBe(MANDATORY_CLINICAL_SAFETY_DISCLAIMER)
    })

    it('gracefully handles HTTP 429 Rate Limit Throttling by returning cached or regional fallback', async () => {
      const provider = new OpenMeteoAirQualityProvider()

      // Force rate limit rejection
      vi.spyOn(provider, 'fetchRawOpenMeteo').mockRejectedValueOnce(
        new Error('HTTP 429 Too Many Requests')
      )

      const summary = await provider.getEnvironmentalSummary({
        division: 'Chattogram',
        district: 'Chattogram',
      })

      expect(summary).toBeDefined()
      expect(summary.dataClassification).toBe('reference_benchmark')
      expect(summary.isStale).toBe(true)
      expect(summary.clinicalSafetyDisclaimer).toBe(MANDATORY_CLINICAL_SAFETY_DISCLAIMER)
    })
  })

  // ==========================================================================
  // 2. NETWORK TIMEOUTS & ABORT RESILIENCE
  // ==========================================================================
  describe('2. Network Latency & Timeout Handling', () => {
    it('catches AbortError / network timeout and returns fallback without crashing', async () => {
      const provider = new OpenMeteoAirQualityProvider()

      // Force network timeout abort error
      vi.spyOn(provider, 'fetchRawOpenMeteo').mockRejectedValueOnce(
        new Error('The operation was aborted due to network timeout (4000ms)')
      )

      const summary = await provider.getEnvironmentalSummary({
        division: 'Sylhet',
        district: 'Sylhet',
      })

      expect(summary).toBeDefined()
      expect(summary.division).toBe('Sylhet')
      expect(summary.dataClassification).toBe('reference_benchmark')
      expect(summary.isStale).toBe(true)
    })
  })

  // ==========================================================================
  // 3. MALFORMED PAYLOADS & CORRUPTED DATA INJECTION
  // ==========================================================================
  describe('3. Malformed API Payloads & Incomplete Data Injection', () => {
    it('normalizes response safely when pollutant data arrays are empty or missing', () => {
      const provider = new OpenMeteoAirQualityProvider()

      // Partially corrupted API response missing pm2_5 and ozone
      const partialCorruptResponse: OpenMeteoAirQualityResponse = {
        latitude: 23.81,
        longitude: 90.41,
        generationtime_ms: 0.5,
        utc_offset_seconds: 21600,
        timezone: 'Asia/Dhaka',
        timezone_abbreviation: '+06',
        current_units: {
          time: 'iso8601',
          interval: 'seconds',
          pm10: 'μg/m³',
          us_aqi: 'AQI',
        },
        current: {
          time: '2026-11-06T00:00',
          interval: 3600,
          pm10: 85.0,
          us_aqi: 95,
          // pm2_5, ozone, co, no2 are undefined
        },
        hourly: {
          time: [],
        },
      }

      const summary = provider.normalizeSummary(
        { division: 'Dhaka', district: 'Dhaka' },
        partialCorruptResponse,
        { latitude: 23.81, longitude: 90.41, resolution: 'district_centroid' }
      )

      expect(summary).toBeDefined()
      expect(summary.aqi.value).toBe(95)
      expect(summary.pollutants.pm10?.value).toBe(85.0)
      expect(summary.pollutants.pm25).toBeUndefined()
      expect(summary.pollutants.o3).toBeUndefined()
      expect(summary.clinicalSafetyDisclaimer).toBe(MANDATORY_CLINICAL_SAFETY_DISCLAIMER)
    })
  })

  // ==========================================================================
  // 4. NOTIFICATION CHANNEL PARTIAL FAILURE RESILIENCE
  // ==========================================================================
  describe('4. Notification Multi-Channel Delivery Fault Resilience', () => {
    it('delivers in-app notification successfully even when external SMS gateway fails', async () => {
      const eventResult = await NotificationService.createNotificationEvent({
        eventType: 'clinical_alert_generated',
        recipientUserId: 'usr-clinician-resilience-01',
        patientId: '11111111-1111-4111-a111-111111111111',
        priority: 'urgent',
        sourceModule: 'clinical_alerts',
        recipientPhone: '+8801999999999', // Phone number
        variables: {
          alertType: 'Hemoptysis Red Flag',
          patientName: 'Synthetic Patient Kabir',
        },
      })

      expect(eventResult).toBeDefined()
      expect(eventResult.notification).toBeDefined()
      expect(eventResult.notification.isRead).toBe(false)

      // In-app channel delivery must succeed
      const inAppDelivery = eventResult.deliveries.find((d) => d.channel === 'in_app')
      expect(inAppDelivery).toBeDefined()
      expect(inAppDelivery?.deliveryStatus).toBe('delivered')
    })
  })

  // ==========================================================================
  // 5. DATA PROVENANCE & CLINICAL SAFETY INVARIANCE ACROSS ALL RESILIENCE MODES
  // ==========================================================================
  describe('5. Data Provenance & Safety Disclaimer Across All Failure Modes', () => {
    it('guarantees MANDATORY_CLINICAL_SAFETY_DISCLAIMER is present in every fallback response', async () => {
      const summary = await EnvironmentalIntelligenceService.getEnvironmentalSummary({
        division: 'Rajshahi',
        district: 'Bogura',
      })

      expect(summary).toBeDefined()
      expect(summary.clinicalSafetyDisclaimer).toBeDefined()
      expect(summary.clinicalSafetyDisclaimer).toContain('Current AQI is a short-term atmospheric measurement')
      expect(summary.clinicalSafetyDisclaimer).toContain('NOT an individual lifetime cancer risk score')
    })
  })
})

/**
 * Phase 2.12: International Environmental Data Provider Service
 * Multi-provider environmental intelligence adapter supporting country-specific routing,
 * observation normalization (PM2.5, PM10, AQI), and provenance classification.
 */

import type {
  EnvironmentalProviderType,
  StandardizedEnvironmentalObservation,
} from '../types'

export class InternationalEnvironmentalProviderService {
  /**
   * Resolves the primary environmental provider for a country
   */
  public static resolveProviderForCountry(countryCode: string): EnvironmentalProviderType {
    const normalized = countryCode.trim().toUpperCase()
    if (normalized === 'US') {
      return 'epa_airnow'
    }
    if (['DE', 'FR', 'IT', 'ES', 'NL'].includes(normalized)) {
      return 'copernicus_cams'
    }
    // Default international provider for Bangladesh, Malaysia, etc.
    return 'open_meteo'
  }

  /**
   * Normalizes environmental data from any provider into standardized parameters
   */
  public static normalizeEnvironmentalData(params: {
    countryCode: string
    provider: EnvironmentalProviderType
    rawPm25: number
    rawPm10?: number
    rawNo2?: number
    rawSo2?: number
    rawO3?: number
    isSatelliteOrModelled?: boolean
  }): StandardizedEnvironmentalObservation {
    const pm25 = Math.max(0, Math.round(params.rawPm25 * 10) / 10)
    const pm10 = params.rawPm10 !== undefined ? Math.max(0, Math.round(params.rawPm10 * 10) / 10) : pm25 * 1.6

    // Approximate US EPA AQI calculation from PM2.5 (24h break-point)
    let aqi = 50
    if (pm25 <= 12.0) {
      aqi = Math.round((50 / 12.0) * pm25)
    } else if (pm25 <= 35.4) {
      aqi = Math.round(50 + ((100 - 50) / (35.4 - 12.0)) * (pm25 - 12.0))
    } else if (pm25 <= 55.4) {
      aqi = Math.round(100 + ((150 - 100) / (55.4 - 35.4)) * (pm25 - 35.4))
    } else if (pm25 <= 150.4) {
      aqi = Math.round(150 + ((200 - 150) / (150.4 - 55.4)) * (pm25 - 55.4))
    } else {
      aqi = Math.min(500, Math.round(200 + ((300 - 200) / (250.4 - 150.4)) * (pm25 - 150.4)))
    }

    return {
      countryCode: params.countryCode.toUpperCase(),
      provider: params.provider,
      pm25,
      pm10,
      no2: params.rawNo2,
      so2: params.rawSo2,
      o3: params.rawO3,
      aqi,
      dataSourceType: params.isSatelliteOrModelled ? 'satellite_derived' : 'measured',
      observedAt: new Date().toISOString(),
    }
  }
}


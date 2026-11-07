import type {
  IAdvancedEnvironmentalProvider,
  GeographicLocationQuery,
  EnvironmentalReadingEntry,
  EnvironmentalContextSummary,
} from '../types'
import { OpenMeteoAirQualityProvider } from '../open-meteo-client'
import { USEmbassyGroundSensorProvider } from './us-embassy-provider'
import { CopernicusSatelliteReanalysisProvider } from './copernicus-reanalysis-provider'
import { BangladeshDoEGroundStationProvider } from './bangladesh-doe-provider'
import { EnvironmentalAnomalyDetector } from '../../anomaly/detectors/environmental-detector'
import type { AnomalyRecord } from '../../anomaly/types'

export interface MultiProviderComparisonResult {
  query: GeographicLocationQuery
  providersPolled: string[]
  providerSummaries: Record<string, EnvironmentalContextSummary>
  compositeAveragePm25: number
  compositeAverageAqi: number
  maxPm25Variance: number
  isHighDiscordance: boolean
  detectedAnomalies: AnomalyRecord[]
  primaryRecommendedProvider: string
}

export class MultiProviderAggregator {
  private static providers: IAdvancedEnvironmentalProvider[] = [
    new OpenMeteoAirQualityProvider() as unknown as IAdvancedEnvironmentalProvider,
    new USEmbassyGroundSensorProvider(),
    new CopernicusSatelliteReanalysisProvider(),
    new BangladeshDoEGroundStationProvider(),
  ]

  /**
   * Compares readings across all registered providers for a given location
   */
  public static async compareProviders(
    query: GeographicLocationQuery
  ): Promise<MultiProviderComparisonResult> {
    const summaries: Record<string, EnvironmentalContextSummary> = {}
    const polled: string[] = []
    const pm25Values: number[] = []

    for (const provider of this.providers) {
      try {
        const summary = await provider.getEnvironmentalSummary(query)
        summaries[provider.providerCode] = summary
        polled.push(provider.providerCode)
        if (summary.pollutants.pm25?.value !== undefined) {
          pm25Values.push(summary.pollutants.pm25.value)
        }
      } catch (err) {
        console.warn(`[MultiProviderAggregator] Provider ${provider.providerCode} failed query:`, err)
      }
    }

    if (pm25Values.length === 0) {
      throw new Error(`All environmental providers failed for ${query.division}/${query.district}`)
    }

    const minPm25 = Math.min(...pm25Values)
    const maxPm25 = Math.max(...pm25Values)
    const variance = maxPm25 - minPm25
    const ratio = minPm25 > 0 ? maxPm25 / minPm25 : 1.0

    // High discordance if ratio > 2.5 and absolute variance > 40 µg/m³
    const isHighDiscordance = ratio > 2.5 && variance > 40.0

    const sumPm25 = pm25Values.reduce((a, b) => a + b, 0)
    const avgPm25 = Number((sumPm25 / pm25Values.length).toFixed(1))
    const avgAqi = Math.round(avgPm25 * 1.55)

    // Check for anomalies via Phase 2.5 Environmental Detector
    const anomalies = EnvironmentalAnomalyDetector.scan({
      readingId: `multi-prov-${Date.now()}`,
      stationId: `COMPOSITE-${query.district.toUpperCase()}`,
      timestamp: new Date().toISOString(),
      pm25: avgPm25,
      aqi: avgAqi,
      provider: 'multi_provider_composite',
      secondaryProviderPm25: isHighDiscordance ? minPm25 : undefined,
    })

    // Preference: If Dhaka and US Embassy available, prefer US Embassy direct ground monitor;
    // Otherwise prefer Open-Meteo as default active operational provider
    let primary = 'open-meteo'
    if (
      (query.district.toLowerCase() === 'dhaka' || query.division.toLowerCase() === 'dhaka') &&
      summaries['us-embassy-dhaka']
    ) {
      primary = 'us-embassy-dhaka'
    }

    return {
      query,
      providersPolled: polled,
      providerSummaries: summaries,
      compositeAveragePm25: avgPm25,
      compositeAverageAqi: avgAqi,
      maxPm25Variance: Number(variance.toFixed(1)),
      isHighDiscordance,
      detectedAnomalies: anomalies,
      primaryRecommendedProvider: primary,
    }
  }

  /**
   * Resilient query with automatic failover chaining
   */
  public static async queryWithFailover(
    query: GeographicLocationQuery,
    preferredProviderCode?: string
  ): Promise<{ summary: EnvironmentalContextSummary; usedProviderCode: string; failoverOccurred: boolean }> {
    const chain = [...this.providers]

    if (preferredProviderCode) {
      const idx = chain.findIndex((p) => p.providerCode === preferredProviderCode)
      if (idx > -1) {
        const [preferred] = chain.splice(idx, 1)
        chain.unshift(preferred)
      }
    }

    let failoverOccurred = false
    let lastError: unknown

    for (let i = 0; i < chain.length; i++) {
      const provider = chain[i]
      try {
        const summary = await provider.getEnvironmentalSummary(query)
        return {
          summary,
          usedProviderCode: provider.providerCode,
          failoverOccurred,
        }
      } catch (err) {
        lastError = err
        failoverOccurred = true
        console.warn(`[MultiProviderAggregator] ${provider.providerCode} failed, failing over to next in chain...`)
      }
    }

    throw new Error(`All providers in failover chain exhausted: ${String(lastError)}`)
  }

  /**
   * Returns latest readings across failover chain
   */
  public static async getLatestReadingsWithFailover(
    query: GeographicLocationQuery,
    preferredProviderCode?: string
  ): Promise<EnvironmentalReadingEntry[]> {
    const chain = [...this.providers]
    if (preferredProviderCode) {
      const idx = chain.findIndex((p) => p.providerCode === preferredProviderCode)
      if (idx > -1) {
        const [preferred] = chain.splice(idx, 1)
        chain.unshift(preferred)
      }
    }

    for (const provider of chain) {
      try {
        const readings = await provider.getLatestReadings(query)
        if (readings && readings.length > 0) return readings
      } catch (err) {
        console.warn(`[MultiProviderAggregator] getLatestReadings failed for ${provider.providerCode}:`, err)
      }
    }

    return []
  }
}


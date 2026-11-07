import type {
  IEnvironmentalDataProvider,
  GeographicLocationQuery,
  EnvironmentalReadingEntry,
  EnvironmentalContextSummary,
  EnvironmentalDataSourceMeta,
} from './types'

export const MANDATORY_CLINICAL_SAFETY_DISCLAIMER =
  'Current AQI is a short-term atmospheric measurement, NOT an individual lifetime cancer risk score. ' +
  'It reflects acute ambient air conditions and does not measure accumulated personal biological dose. ' +
  'Clinical decision-support engines must NOT treat ambient readings as validated clinical risk predictors.'

interface BenchmarkDataPoint {
  aqi: number
  category: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous'
  pm25: number
  pm10: number
  no2: number
  so2: number
  co: number
  o3: number
}

const BANGLADESH_REGIONAL_BENCHMARKS: Record<string, BenchmarkDataPoint> = {
  dhaka: {
    aqi: 182,
    category: 'unhealthy',
    pm25: 115.4,
    pm10: 172.0,
    no2: 48.2,
    so2: 18.5,
    co: 1.8,
    o3: 32.1,
  },
  chattogram: {
    aqi: 138,
    category: 'unhealthy_sensitive',
    pm25: 72.1,
    pm10: 114.6,
    no2: 36.4,
    so2: 14.2,
    co: 1.2,
    o3: 28.5,
  },
  khulna: {
    aqi: 118,
    category: 'unhealthy_sensitive',
    pm25: 58.3,
    pm10: 95.2,
    no2: 24.1,
    so2: 12.0,
    co: 0.9,
    o3: 25.0,
  },
  rajshahi: {
    aqi: 126,
    category: 'unhealthy_sensitive',
    pm25: 64.8,
    pm10: 104.3,
    no2: 22.5,
    so2: 11.2,
    co: 0.8,
    o3: 26.4,
  },
  sylhet: {
    aqi: 68,
    category: 'moderate',
    pm25: 24.5,
    pm10: 48.0,
    no2: 14.1,
    so2: 6.5,
    co: 0.5,
    o3: 22.0,
  },
  rangpur: {
    aqi: 105,
    category: 'unhealthy_sensitive',
    pm25: 52.0,
    pm10: 88.4,
    no2: 20.1,
    so2: 9.8,
    co: 0.7,
    o3: 24.1,
  },
  barishal: {
    aqi: 76,
    category: 'moderate',
    pm25: 29.8,
    pm10: 54.2,
    no2: 16.2,
    so2: 7.1,
    co: 0.6,
    o3: 21.5,
  },
  mymensingh: {
    aqi: 112,
    category: 'unhealthy_sensitive',
    pm25: 54.6,
    pm10: 92.1,
    no2: 21.4,
    so2: 10.3,
    co: 0.8,
    o3: 23.8,
  },
}

const DEFAULT_BENCHMARK: BenchmarkDataPoint = {
  aqi: 95,
  category: 'moderate',
  pm25: 42.0,
  pm10: 70.0,
  no2: 18.0,
  so2: 8.0,
  co: 0.6,
  o3: 20.0,
}

/**
 * Standard benchmark provider used in Phase 1.15.
 * Implements IEnvironmentalDataProvider contract, allowing transparent replacement
 * by Open-Meteo or CAMS satellite feeds in Phase 1.16 without altering consuming modules.
 */
export class MockBenchmarkEnvironmentalProvider implements IEnvironmentalDataProvider {
  readonly providerCode = 'DOE_CASE_BENCHMARK'
  readonly providerName = 'Bangladesh Department of Environment CAMS (Benchmark)'

  getProviderMetadata(): EnvironmentalDataSourceMeta {
    return {
      id: 'src-benchmark-cams-001',
      sourceCode: this.providerCode,
      name: this.providerName,
      providerType: 'benchmark_reference',
      officialUrl: 'http://case.doe.gov.bd',
      coverageJurisdiction: 'Bangladesh National (Continuous Air Monitoring Stations)',
      updateFrequencyMinutes: 60,
      reliabilityTier: 'gold_standard',
      isActive: true,
    }
  }

  private resolveBenchmark(query: GeographicLocationQuery): BenchmarkDataPoint {
    const key = query.division.trim().toLowerCase()
    return BANGLADESH_REGIONAL_BENCHMARKS[key] || DEFAULT_BENCHMARK
  }

  async getLatestReadings(query: GeographicLocationQuery): Promise<EnvironmentalReadingEntry[]> {
    const data = this.resolveBenchmark(query)
    const benchmarkTimestamp = '2026-11-05T06:00:00.000Z'

    return [
      {
        id: `reading-aqi-${query.division.toLowerCase()}`,
        sourceId: this.providerCode,
        sourceName: this.providerName,
        division: query.division,
        district: query.district,
        parameter: 'aqi_us',
        value: data.aqi,
        unit: 'AQI index',
        readingStatus: 'measured',
        observationTimestamp: benchmarkTimestamp,
        retrievalTimestamp: benchmarkTimestamp,
        confidenceScore: 0.96,
      },
      {
        id: `reading-pm25-${query.division.toLowerCase()}`,
        sourceId: this.providerCode,
        sourceName: this.providerName,
        division: query.division,
        district: query.district,
        parameter: 'pm2_5',
        value: data.pm25,
        unit: 'µg/m³',
        readingStatus: 'measured',
        observationTimestamp: benchmarkTimestamp,
        retrievalTimestamp: benchmarkTimestamp,
        confidenceScore: 0.95,
      },
      {
        id: `reading-pm10-${query.division.toLowerCase()}`,
        sourceId: this.providerCode,
        sourceName: this.providerName,
        division: query.division,
        district: query.district,
        parameter: 'pm10',
        value: data.pm10,
        unit: 'µg/m³',
        readingStatus: 'measured',
        observationTimestamp: benchmarkTimestamp,
        retrievalTimestamp: benchmarkTimestamp,
        confidenceScore: 0.94,
      },
      {
        id: `reading-no2-${query.division.toLowerCase()}`,
        sourceId: this.providerCode,
        sourceName: this.providerName,
        division: query.division,
        district: query.district,
        parameter: 'nitrogen_dioxide',
        value: data.no2,
        unit: 'µg/m³',
        readingStatus: 'measured',
        observationTimestamp: benchmarkTimestamp,
        retrievalTimestamp: benchmarkTimestamp,
        confidenceScore: 0.92,
      },
      {
        id: `reading-so2-${query.division.toLowerCase()}`,
        sourceId: this.providerCode,
        sourceName: this.providerName,
        division: query.division,
        district: query.district,
        parameter: 'sulfur_dioxide',
        value: data.so2,
        unit: 'µg/m³',
        readingStatus: 'estimated',
        observationTimestamp: benchmarkTimestamp,
        retrievalTimestamp: benchmarkTimestamp,
        confidenceScore: 0.88,
      },
      {
        id: `reading-co-${query.division.toLowerCase()}`,
        sourceId: this.providerCode,
        sourceName: this.providerName,
        division: query.division,
        district: query.district,
        parameter: 'carbon_monoxide',
        value: data.co,
        unit: 'mg/m³',
        readingStatus: 'estimated',
        observationTimestamp: benchmarkTimestamp,
        retrievalTimestamp: benchmarkTimestamp,
        confidenceScore: 0.85,
      },
      {
        id: `reading-o3-${query.division.toLowerCase()}`,
        sourceId: this.providerCode,
        sourceName: this.providerName,
        division: query.division,
        district: query.district,
        parameter: 'ozone',
        value: data.o3,
        unit: 'µg/m³',
        readingStatus: 'estimated',
        observationTimestamp: benchmarkTimestamp,
        retrievalTimestamp: benchmarkTimestamp,
        confidenceScore: 0.86,
      },
    ]
  }

  async getEnvironmentalSummary(query: GeographicLocationQuery): Promise<EnvironmentalContextSummary> {
    const data = this.resolveBenchmark(query)
    const benchmarkTimestamp = '2026-11-05T06:00:00.000Z'
    const meta = this.getProviderMetadata()

    return {
      division: query.division,
      district: query.district,
      upazila: query.upazila || null,
      observationTimestamp: benchmarkTimestamp,
      aqi: {
        value: data.aqi,
        category: data.category,
        status: 'measured',
      },
      pollutants: {
        pm25: { value: data.pm25, unit: 'µg/m³', status: 'measured' },
        pm10: { value: data.pm10, unit: 'µg/m³', status: 'measured' },
        no2: { value: data.no2, unit: 'µg/m³', status: 'measured' },
        so2: { value: data.so2, unit: 'µg/m³', status: 'estimated' },
        co: { value: data.co, unit: 'mg/m³', status: 'estimated' },
        o3: { value: data.o3, unit: 'µg/m³', status: 'estimated' },
      },
      sourceMeta: {
        name: meta.name,
        providerType: meta.providerType,
        reliabilityTier: meta.reliabilityTier,
        attribution: 'Official Department of Environment CAMS Continuous Air Quality Monitoring Network',
      },
      clinicalSafetyDisclaimer: MANDATORY_CLINICAL_SAFETY_DISCLAIMER,
    }
  }
}

import type {
  GeographicAdministrativeLevel,
  LocationVerificationStatus,
  EnvironmentalDataStatus,
  EnvironmentalParameterType,
  ExposureCategory,
  HealthRecordVerificationStatus,
} from '@/types/database'

/**
 * Supported geographic schemes for multi-country extensibility
 */
export type SupportedCountryCode = 'BD' | 'US' | 'UK' | 'IN' | string

export interface GeographicHierarchyNode {
  id: string
  code: string
  name: string
  nameBn?: string
  level: GeographicAdministrativeLevel
  parentId?: string | null
  countryCode: string
  metadata?: Record<string, unknown>
  children?: GeographicHierarchyNode[]
}

export interface PatientLocationHistoryEntry {
  id: string
  patientId: string
  geographicEntityId?: string | null
  addressLine?: string | null
  division: string
  district: string
  upazila?: string | null
  unionOrWard?: string | null
  countryCode: string
  verificationStatus: LocationVerificationStatus
  isCurrent: boolean
  durationYears?: number | null
  startDate?: string | null
  endDate?: string | null
  recordedBy?: string | null
  createdAt: string
  updatedAt: string
}

export interface EnvironmentalDataSourceMeta {
  id: string
  sourceCode: string
  name: string
  providerType: 'governmental' | 'satellite' | 'sensor_network' | 'benchmark_reference' | 'academic'
  officialUrl?: string | null
  coverageJurisdiction: string
  updateFrequencyMinutes: number
  reliabilityTier: 'gold_standard' | 'certified' | 'standard' | 'experimental'
  isActive: boolean
}

export interface EnvironmentalReadingEntry {
  id: string
  sourceId: string
  sourceName?: string
  geographicEntityId?: string | null
  division?: string
  district?: string
  parameter: EnvironmentalParameterType
  value: number
  unit: string
  readingStatus: EnvironmentalDataStatus
  observationTimestamp: string
  retrievalTimestamp: string
  confidenceScore: number
  provenanceMetadata?: Record<string, unknown>
}

export interface HourlyEnvironmentalPoint {
  time: string
  usAqi: number
  europeanAqi: number
  pm25: number
  pm10: number
  no2?: number
  isForecast: boolean
}

export interface EnvironmentalContextSummary {
  division: string
  district: string
  upazila?: string | null
  observationTimestamp: string
  aqi: {
    value: number
    category: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous'
    status: EnvironmentalDataStatus
  }
  /**
   * European Common Air Quality Index (CAQI) 0-100 scale (EEA standard)
   * Maintained strictly separate from US EPA AQI (0-500 scale)
   */
  europeanAqi?: {
    value: number
    category: 'very_good' | 'good' | 'medium' | 'poor' | 'very_poor' | 'extremely_poor'
    scale: 'EEA_CAQI_0_100'
    status: EnvironmentalDataStatus
  }
  coordinates?: {
    latitude: number
    longitude: number
    resolution: 'district_centroid' | 'division_centroid' | 'custom'
  }
  pollutants: {
    pm25?: { value: number; unit: string; status: EnvironmentalDataStatus }
    pm10?: { value: number; unit: string; status: EnvironmentalDataStatus }
    no2?: { value: number; unit: string; status: EnvironmentalDataStatus }
    so2?: { value: number; unit: string; status: EnvironmentalDataStatus }
    co?: { value: number; unit: string; status: EnvironmentalDataStatus }
    o3?: { value: number; unit: string; status: EnvironmentalDataStatus }
  }
  hourlyTimeline?: HourlyEnvironmentalPoint[]
  sourceMeta: {
    name: string
    providerType: string
    reliabilityTier: string
    attribution: string
  }
  dataClassification?: 'model_analysis' | 'model_forecast' | 'historical_reanalysis' | 'reference_benchmark'
  isStale?: boolean
  retrievedAt?: string
  /**
   * MANDATORY CLINICAL SAFETY DISCLAIMER:
   * Ambient air quality is a short-term atmospheric observation and CANNOT be
   * interpreted as an individual lifetime cancer risk score or direct clinical determinant.
   */
  clinicalSafetyDisclaimer: string
}

export interface PatientExposureRecord {
  id: string
  patientId: string
  geographicEntityId?: string | null
  exposureCategory: ExposureCategory
  exposureType: string
  cookingFuelType?: string | null
  durationYears: number
  hoursPerDay?: number | null
  intensity: 'low' | 'moderate' | 'high' | 'unknown'
  isCurrent: boolean
  startYear?: number | null
  endYear?: number | null
  contextDetails?: string | null
  notes?: string | null
  verificationStatus: HealthRecordVerificationStatus
  createdAt: string
  updatedAt: string
}

export interface FacilityAccessibilityContext {
  patientDistrict: string
  patientDivision: string
  patientUpazila?: string | null
  nearbyFacilities: {
    id: string
    facilityCode: string
    name: string
    facilityType: string
    division: string
    district: string
    upazila?: string | null
    isDirectlyInZone: boolean
    capabilities: {
      hasLowDoseCT: boolean
      hasDiagnosticCT: boolean
      hasSpirometry: boolean
      hasGeneXpert: boolean
      hasThoracicSurgery: boolean
      hasPulmonologyConsultation: boolean
    }
    accessibilityCaveats: string[]
  }[]
  clinicalContextNote: string
}

/**
 * Standard Query Parameters for Environmental Data Providers
 */
export interface GeographicLocationQuery {
  countryCode?: string
  division: string
  district: string
  upazila?: string
}

export interface TimeRangeQuery {
  from: string
  to: string
}

export interface OpenMeteoAirQualityCurrentUnits {
  time: string
  interval: string
  pm10?: string
  pm2_5?: string
  carbon_monoxide?: string
  nitrogen_dioxide?: string
  sulphur_dioxide?: string
  ozone?: string
  us_aqi?: string
  european_aqi?: string
}

export interface OpenMeteoAirQualityCurrent {
  time: string
  interval: number
  pm10?: number
  pm2_5?: number
  carbon_monoxide?: number
  nitrogen_dioxide?: number
  sulphur_dioxide?: number
  ozone?: number
  us_aqi?: number
  european_aqi?: number
}

export interface OpenMeteoAirQualityHourly {
  time: string[]
  pm10?: (number | null)[]
  pm2_5?: (number | null)[]
  carbon_monoxide?: (number | null)[]
  nitrogen_dioxide?: (number | null)[]
  sulphur_dioxide?: (number | null)[]
  ozone?: (number | null)[]
  us_aqi?: (number | null)[]
  european_aqi?: (number | null)[]
}

export interface OpenMeteoAirQualityResponse {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation?: number
  current_units?: OpenMeteoAirQualityCurrentUnits
  current?: OpenMeteoAirQualityCurrent
  hourly_units?: Record<string, string>
  hourly?: OpenMeteoAirQualityHourly
}

/**
 * Abstract interface for external and mock environmental data providers
 * Allows plug-and-play integrations (e.g. Open-Meteo in Phase 1.16)
 */
export interface IEnvironmentalDataProvider {
  readonly providerCode: string
  readonly providerName: string
  getLatestReadings(query: GeographicLocationQuery): Promise<EnvironmentalReadingEntry[]>
  getEnvironmentalSummary(query: GeographicLocationQuery): Promise<EnvironmentalContextSummary>
  getProviderMetadata(): EnvironmentalDataSourceMeta
  getHourlyTimeline?(query: GeographicLocationQuery, hours?: number): Promise<HourlyEnvironmentalPoint[]>
}

// ==============================================================================
// Phase 2.7: Advanced Environmental Intelligence Types
// ==============================================================================

export type EnvironmentalProviderClassification =
  | 'direct_ground_station'
  | 'satellite_reanalysis'
  | 'atmospheric_model'
  | 'sensor_network_crowdsourced'
  | 'governmental_reference'
  | 'benchmark_composite'

export interface AdvancedEnvironmentalProviderMeta {
  providerCode: string
  name: string
  providerType: string
  classification: EnvironmentalProviderClassification
  officialUrl?: string
  coverageJurisdiction: string
  updateFrequencyMinutes: number
  reliabilityTier: 'gold_standard' | 'certified' | 'standard' | 'experimental'
  attributionText: string
  apiEndpoint?: string
  isActive: boolean
  supportedPollutants: EnvironmentalParameterType[]
  measurementResolution: string
  calibrationStandard?: string
}

export type HistoricalAggregationPeriod =
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'seasonal'
  | 'annual'
  | 'multi_year'

export type BangladeshClimaticSeason =
  | 'winter_dry'
  | 'pre_monsoon'
  | 'monsoon'
  | 'all_season'

export type SpatialModelingMethod =
  | 'ground_station_direct'
  | 'idw_interpolation'
  | 'satellite_reanalysis_grid'
  | 'hybrid_calibrated_model'
  | 'regional_centroid_benchmark'

export interface HistoricalEnvironmentalSnapshot {
  id: string
  geographicEntityId?: string | null
  division: string
  district: string
  upazila?: string | null
  aggregationPeriod: HistoricalAggregationPeriod
  periodStart: string
  periodEnd: string
  season: BangladeshClimaticSeason
  avgUsAqi?: number | null
  avgPm25: number
  avgPm10?: number | null
  avgNo2?: number | null
  avgSo2?: number | null
  avgCo?: number | null
  avgO3?: number | null
  maxPm25?: number | null
  minPm25?: number | null
  elevatedDaysCount: number
  totalObservationHours: number
  dataCompletenessRatio: number
  primaryProviderCode: string
  isModelled: boolean
  confidenceScore: number
  metadata?: Record<string, unknown>
}

export interface HistoricalExposureFilterQuery {
  division: string
  district: string
  upazila?: string
  aggregationPeriod?: HistoricalAggregationPeriod
  startDate?: string
  endDate?: string
  season?: BangladeshClimaticSeason
  providerCode?: string
}

export interface HistoricalExposureSummaryReport {
  division: string
  district: string
  upazila?: string | null
  periodCoverage: {
    start: string
    end: string
    totalDays: number
    dataCompletenessRatio: number
  }
  baselineAverages: {
    avgPm25: number
    avgPm10?: number
    avgUsAqi?: number
    maxRecordedPm25: number
    minRecordedPm25: number
  }
  seasonalProfiles: Record<
    BangladeshClimaticSeason,
    {
      avgPm25: number
      elevatedDaysCount: number
      dataCompletenessRatio: number
    }
  >
  elevatedExposureDaysCount: number
  elevatedDaysRatio: number
  snapshots: HistoricalEnvironmentalSnapshot[]
  clinicalSafetyNotice: string
}

export interface LongTermTrendPoint {
  year: number
  annualAvgPm25: number
  winterAvgPm25: number
  monsoonAvgPm25: number
  annualAvgAqi: number
  completenessRatio: number
  elevatedDaysCount: number
}

export interface LongTermEnvironmentalTrendAnalysis {
  division: string
  district: string
  observationYears: number[]
  yearlySeries: LongTermTrendPoint[]
  trendDirection: 'increasing' | 'decreasing' | 'stable'
  annualDeltaPm25PerYear: number
  overallPercentageChange: number
  seasonalAmplitudeAvg: number
  statisticalMethodology: string
  isModelledReanalysis: boolean
  clinicalContextNotice: string
}

export interface GeographicHotspotSummary {
  division: string
  district: string
  upazila?: string
  centroidLatitude: number
  centroidLongitude: number
  annualAvgPm25: number
  peakSeasonAvgPm25: number
  hotspotSeverityTier: 'extreme' | 'high' | 'moderate' | 'low'
  primaryContributingFactors: string[]
  nearestMonitoringStation: {
    stationName: string
    distanceKm: number
    stationType: string
  }
  dataConfidenceScore: number
}

export interface SpatialInterpolationEstimate {
  targetLatitude: number
  targetLongitude: number
  division: string
  district: string
  estimatedPm25: number
  estimatedAqi: number
  interpolationMethod: SpatialModelingMethod
  uncertaintyMarginPm25: number
  confidenceInterval95: [number, number]
  contributingStationsCount: number
  distanceToNearestStationKm: number
  spatialDisclaimer: string
}

export interface EnvironmentalRiskFactorDefinition {
  profileCode: string
  titleEn: string
  titleBn: string
  category:
    | 'ambient_particulate'
    | 'indoor_biomass'
    | 'traffic_proximity'
    | 'industrial_point_source'
    | 'occupational_dust'
  iarcClassification: string
  scientificReference: string
  measurementMethodology: string
  biologicalMechanism: string
  clinicalDisclaimer: string
  isActive: boolean
}

export interface PatientResidentialExposureContext {
  patientId: string
  residentialLocations: Array<{
    division: string
    district: string
    upazila?: string | null
    durationYears: number
    approximateAmbientPm25Years: number
    isCurrent: boolean
  }>
  totalEstimatedAmbientPm25Years: number
  indoorBiomassExposureYears: number
  occupationalDustExposureYears: number
  dataCompletenessScore: number
  clinicalReviewStatus: 'contextual_only' | 'reviewed' | 'unverified'
  mandatoryNonDiagnosticNotice: string
}

/**
 * Extended interface for Advanced Environmental Providers in Phase 2.7
 */
export interface IAdvancedEnvironmentalProvider extends IEnvironmentalDataProvider {
  readonly classification: EnvironmentalProviderClassification
  getAdvancedMetadata(): AdvancedEnvironmentalProviderMeta
  getHistoricalSnapshots?(query: HistoricalExposureFilterQuery): Promise<HistoricalEnvironmentalSnapshot[]>
  checkHealth?(): Promise<{ isAvailable: boolean; latencyMs: number; lastCheckedAt: string }>
}



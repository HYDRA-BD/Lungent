import type {
  AdvancedEnvironmentalProviderMeta,
  IAdvancedEnvironmentalProvider,
} from '../types'

export const REGISTERED_ENVIRONMENTAL_PROVIDERS: Record<string, AdvancedEnvironmentalProviderMeta> = {
  'open-meteo': {
    providerCode: 'open-meteo',
    name: 'Open-Meteo Atmospheric Air Quality API',
    providerType: 'atmospheric_model',
    classification: 'atmospheric_model',
    officialUrl: 'https://open-meteo.com/en/docs/air-quality-api',
    coverageJurisdiction: 'Global (0.25° grid, including Bangladesh 64 districts)',
    updateFrequencyMinutes: 60,
    reliabilityTier: 'standard',
    attributionText: 'Contains modified Copernicus Atmosphere Monitoring Service information 2026',
    apiEndpoint: 'https://air-quality-api.open-meteo.com/v1/air-quality',
    isActive: true,
    supportedPollutants: [
      'pm2_5',
      'pm10',
      'nitrogen_dioxide',
      'sulfur_dioxide',
      'carbon_monoxide',
      'ozone',
      'aqi_us',
    ],
    measurementResolution: '11km European CAMS Model & US NOAA GFS',
    calibrationStandard: 'WMO & ECMWF Operational Assimilation',
  },
  'us-embassy-dhaka': {
    providerCode: 'us-embassy-dhaka',
    name: 'U.S. Embassy Dhaka Reference Ground Station',
    providerType: 'direct_ground_station',
    classification: 'direct_ground_station',
    officialUrl: 'https://www.airnow.gov/international/us-embassies-and-consulates/',
    coverageJurisdiction: 'Dhaka Metropolitan (Madani Avenue, Baridhara, Dhaka 1212)',
    updateFrequencyMinutes: 60,
    reliabilityTier: 'gold_standard',
    attributionText: 'U.S. Department of State / EPA AirNow International Direct Ground Monitoring',
    apiEndpoint: 'https://api.airnow.gov/international/dhaka',
    isActive: true,
    supportedPollutants: ['pm2_5', 'aqi_us'],
    measurementResolution: 'Single In-Situ Point Monitor (Met One Instruments BAM-1020)',
    calibrationStandard: 'US EPA Federal Equivalent Method (FEM EQPM-0798-122)',
  },
  'copernicus-cams-reanalysis': {
    providerCode: 'copernicus-cams-reanalysis',
    name: 'Copernicus Atmosphere Reanalysis (CAMS / ERA5)',
    providerType: 'satellite_reanalysis',
    classification: 'satellite_reanalysis',
    officialUrl: 'https://atmosphere.copernicus.eu/',
    coverageJurisdiction: 'Global / Bangladesh Multi-Year Reanalysis (2021-2026)',
    updateFrequencyMinutes: 1440, // Daily reanalysis aggregation
    reliabilityTier: 'certified',
    attributionText: 'European Centre for Medium-Range Weather Forecasts (ECMWF) CAMS Reanalysis',
    apiEndpoint: 'https://ads.atmosphere.copernicus.eu/api/v2',
    isActive: true,
    supportedPollutants: ['pm2_5', 'pm10', 'nitrogen_dioxide', 'sulfur_dioxide', 'ozone'],
    measurementResolution: '0.1° × 0.1° (~10km) Integrated Satellite Reanalysis Grid',
    calibrationStandard: 'Multi-Satellite AOD Assimilation (MODIS, Sentinel-5P, VIIRS)',
  },
  'bangladesh-doe-case': {
    providerCode: 'bangladesh-doe-case',
    name: 'Bangladesh DoE Clean Air and Sustainable Environment (CASE)',
    providerType: 'governmental_reference',
    classification: 'governmental_reference',
    officialUrl: 'http://doe.gov.bd/',
    coverageJurisdiction: 'Bangladesh National CAMS Network (Dhaka, CTG, Rajshahi, Khulna, Sylhet, etc.)',
    updateFrequencyMinutes: 120,
    reliabilityTier: 'certified',
    attributionText: 'Department of Environment, Ministry of Environment, Forest and Climate Change, Bangladesh',
    apiEndpoint: 'http://case.doe.gov.bd/cams/api',
    isActive: true,
    supportedPollutants: ['pm2_5', 'pm10', 'nitrogen_dioxide', 'sulfur_dioxide', 'carbon_monoxide'],
    measurementResolution: 'Municipal Fixed Continuous Air Monitoring Stations (CAMS)',
    calibrationStandard: 'DoE National Ambient Air Quality Standards (NAAQS Bangladesh 2005/2022)',
  },
}

export class EnvironmentalProviderRegistry {
  private static providers: Map<string, IAdvancedEnvironmentalProvider> = new Map()

  public static register(provider: IAdvancedEnvironmentalProvider): void {
    this.providers.set(provider.providerCode, provider)
  }

  public static get(providerCode: string): IAdvancedEnvironmentalProvider | undefined {
    return this.providers.get(providerCode)
  }

  public static getAll(): IAdvancedEnvironmentalProvider[] {
    return Array.from(this.providers.values())
  }

  public static getAllMetadata(): AdvancedEnvironmentalProviderMeta[] {
    return Object.values(REGISTERED_ENVIRONMENTAL_PROVIDERS)
  }

  public static getMetadata(providerCode: string): AdvancedEnvironmentalProviderMeta | undefined {
    return REGISTERED_ENVIRONMENTAL_PROVIDERS[providerCode]
  }

  public static getActiveProviders(): AdvancedEnvironmentalProviderMeta[] {
    return Object.values(REGISTERED_ENVIRONMENTAL_PROVIDERS).filter((p) => p.isActive)
  }
}


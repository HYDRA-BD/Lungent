/**
 * Phase 2.12: Country Configuration Service
 * Centralized multi-country configuration registry, ISO standard identifiers,
 * localized formatting (dates, measurement, currency), and country lifecycle management.
 */

import type {
  InternationalCountryProfile,
  CountryStatus,
} from '../types'

export const PRECONFIGURED_COUNTRIES: InternationalCountryProfile[] = [
  {
    id: 'ctry-bd-001',
    countryCode: 'BD',
    isoAlpha3: 'BGD',
    numericCode: '050',
    nameEn: 'Bangladesh',
    nameNative: 'বাংলাদেশ',
    officialLanguages: ['bn'],
    supportedLocales: ['en', 'bn'],
    defaultLocale: 'bn',
    timeZones: ['Asia/Dhaka'],
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    measurementSystem: 'metric',
    currencyCode: 'BDT',
    currencySymbol: '৳',
    geographicHierarchyLevels: [
      { level: 1, nameEn: 'Division', nameNative: 'বিভাগ', description: 'Top administrative division (8 total)' },
      { level: 2, nameEn: 'District', nameNative: 'জেলা', description: 'Zila administrative district (64 total)' },
      { level: 3, nameEn: 'Upazila', nameNative: 'উপজেলা', description: 'Sub-district health complex jurisdiction' },
    ],
    environmentalProvider: 'open_meteo',
    status: 'active',
    isDefault: true,
    regulatoryFramework: 'DGHS_National_Health_Data_Guidelines',
    dataResidencyRequired: false,
    dataResidencyRegion: 'local',
    clinicalExecutionEnabled: true,
    version: 1,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-11-06T00:00:00.000Z',
  },
  {
    id: 'ctry-my-002',
    countryCode: 'MY',
    isoAlpha3: 'MYS',
    numericCode: '458',
    nameEn: 'Malaysia (Synthetic Example)',
    nameNative: 'Malaysia',
    officialLanguages: ['ms', 'en'],
    supportedLocales: ['en', 'ms'],
    defaultLocale: 'en',
    timeZones: ['Asia/Kuala_Lumpur'],
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    measurementSystem: 'metric',
    currencyCode: 'MYR',
    currencySymbol: 'RM',
    geographicHierarchyLevels: [
      { level: 1, nameEn: 'State', nameNative: 'Negeri', description: 'Federal state or territory (13 states, 3 FT)' },
      { level: 2, nameEn: 'District', nameNative: 'Daerah', description: 'Administrative district' },
      { level: 3, nameEn: 'Municipality', nameNative: 'Pihak Berkuasa Tempatan', description: 'Local municipal jurisdiction' },
    ],
    environmentalProvider: 'open_meteo',
    status: 'synthetic_example',
    isDefault: false,
    regulatoryFramework: 'PDPA_2010_Malaysia_Pending_Legal_Review',
    dataResidencyRequired: true,
    dataResidencyRegion: 'ap-southeast-1',
    clinicalExecutionEnabled: false, // Strict Clinical Governance Invariant: disabled until CAB approves local guidelines
    version: 1,
    createdAt: '2026-11-06T00:00:00.000Z',
    updatedAt: '2026-11-06T00:00:00.000Z',
  },
]

export class CountryConfigurationService {
  private static countries: Map<string, InternationalCountryProfile> = new Map(
    PRECONFIGURED_COUNTRIES.map(c => [c.countryCode.toUpperCase(), { ...c }])
  )

  /**
   * Retrieves all registered country profiles
   */
  public static getAllCountries(): InternationalCountryProfile[] {
    return Array.from(this.countries.values())
  }

  /**
   * Retrieves a country by ISO alpha-2 or alpha-3 code
   */
  public static getCountryByCode(code: string): InternationalCountryProfile | undefined {
    const normalized = code.trim().toUpperCase()
    if (normalized.length === 2) {
      return this.countries.get(normalized)
    }
    return Array.from(this.countries.values()).find(
      c => c.isoAlpha3.toUpperCase() === normalized
    )
  }

  /**
   * Retrieves the default active country (Bangladesh)
   */
  public static getDefaultCountry(): InternationalCountryProfile {
    const defaultCountry = Array.from(this.countries.values()).find(c => c.isDefault)
    if (!defaultCountry) {
      return PRECONFIGURED_COUNTRIES[0]
    }
    return defaultCountry
  }

  /**
   * Validates ISO 3166-1 alpha-2 format
   */
  public static isValidIsoAlpha2(code: string): boolean {
    return /^[A-Z]{2}$/.test(code.trim().toUpperCase())
  }

  /**
   * Validates ISO 3166-1 alpha-3 format
   */
  public static isValidIsoAlpha3(code: string): boolean {
    return /^[A-Z]{3}$/.test(code.trim().toUpperCase())
  }

  /**
   * Updates country activation status
   */
  public static setCountryStatus(countryCode: string, newStatus: CountryStatus): InternationalCountryProfile {
    const country = this.getCountryByCode(countryCode)
    if (!country) {
      throw new Error(`Country not found for code: ${countryCode}`)
    }

    // Safety Invariant: Cannot activate clinical execution on synthetic or unapproved country
    if (newStatus === 'active' && !country.clinicalExecutionEnabled) {
      throw new Error(
        `Activation Blocked: Country ${country.nameEn} cannot be activated without approved clinical guidelines`
      )
    }

    const updated: InternationalCountryProfile = {
      ...country,
      status: newStatus,
      version: country.version + 1,
      updatedAt: new Date().toISOString(),
    }

    this.countries.set(updated.countryCode, updated)
    return updated
  }

  /**
   * Formats a monetary amount according to country currency configuration
   */
  public static formatCurrency(amount: number, countryCode: string): string {
    const country = this.getCountryByCode(countryCode) || this.getDefaultCountry()
    return `${country.currencySymbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  /**
   * Formats distance or measurement label according to country unit preference
   */
  public static formatMeasurement(value: number, unitType: 'distance' | 'weight' | 'volume', countryCode: string): string {
    const country = this.getCountryByCode(countryCode) || this.getDefaultCountry()
    if (country.measurementSystem === 'imperial') {
      if (unitType === 'distance') return `${(value * 0.621371).toFixed(1)} miles`
      if (unitType === 'weight') return `${(value * 2.20462).toFixed(1)} lbs`
      return `${(value * 0.264172).toFixed(1)} gal`
    }
    // Metric default
    if (unitType === 'distance') return `${value.toFixed(1)} km`
    if (unitType === 'weight') return `${value.toFixed(1)} kg`
    return `${value.toFixed(1)} L`
  }
}


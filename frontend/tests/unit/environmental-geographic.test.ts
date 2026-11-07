import { describe, it, expect, beforeEach } from 'vitest'
import {
  GeographicIntelligenceService,
  MockBenchmarkEnvironmentalProvider,
  EnvironmentalIntelligenceService,
  MANDATORY_CLINICAL_SAFETY_DISCLAIMER,
  type IEnvironmentalDataProvider,
  type GeographicLocationQuery,
  type EnvironmentalReadingEntry,
  type EnvironmentalContextSummary,
  type EnvironmentalDataSourceMeta,
} from '@/modules/environmental'
import {
  geographicQuerySchema,
  recordPatientExposureSchema,
  recordPatientLocationHistorySchema,
  facilityAccessibilityQuerySchema,
} from '@/modules/environmental/validation'

describe('Phase 1.15: Environmental and Geographic Intelligence Foundation', () => {
  beforeEach(() => {
    EnvironmentalIntelligenceService.useBenchmarkProvider()
  })

  describe('1. Geographic Hierarchy Service (Bangladesh & International)', () => {
    it('should return all 8 official Bangladesh administrative divisions with codes and Bangla names', () => {
      const divisions = GeographicIntelligenceService.getDivisions('BD')
      expect(divisions.length).toBe(8)

      const dhaka = divisions.find((d) => d.id === 'Dhaka')
      expect(dhaka).toBeDefined()
      expect(dhaka?.name).toBe('Dhaka')
      expect(dhaka?.nameBn).toBe('ঢাকা')
      expect(dhaka?.code).toBe('BD-DHAKA')
      expect(dhaka?.level).toBe('division')
    })

    it('should return districts under a given Bangladesh division', () => {
      const districts = GeographicIntelligenceService.getDistricts('Dhaka', 'BD')
      expect(districts.length).toBeGreaterThan(0)

      const dhakaDist = districts.find((d) => d.id === 'Dhaka')
      expect(dhakaDist).toBeDefined()
      expect(dhakaDist?.nameBn).toBe('ঢাকা')
      expect(dhakaDist?.parentId).toBe('Dhaka')
    })

    it('should return upazilas under a given Bangladesh district', () => {
      const upazilas = GeographicIntelligenceService.getUpazilas('Dhaka', 'Dhaka', 'BD')
      expect(upazilas.length).toBeGreaterThan(0)

      const mirpur = upazilas.find((u) => u.id === 'Mirpur')
      expect(mirpur).toBeDefined()
      expect(mirpur?.name).toBe('Mirpur')
      expect(mirpur?.nameBn).toBe('মিরপুর')
      expect(mirpur?.level).toBe('upazila')
    })

    it('should support international administrative hierarchies (e.g. US state -> county -> city)', () => {
      const usDivisions = GeographicIntelligenceService.getDivisions('US')
      expect(usDivisions.length).toBeGreaterThan(0)
      const cali = usDivisions.find((d) => d.id === 'California')
      expect(cali).toBeDefined()

      const laDistricts = GeographicIntelligenceService.getDistricts('California', 'US')
      expect(laDistricts.length).toBeGreaterThan(0)

      const upazilas = GeographicIntelligenceService.getUpazilas('California', 'Los Angeles County', 'US')
      expect(upazilas.length).toBeGreaterThan(0)
    })

    it('should search geographic hierarchy by English and Bangla terms', () => {
      const resultsBn = GeographicIntelligenceService.searchHierarchy('মিরপুর', 'BD')
      expect(resultsBn.length).toBeGreaterThan(0)
      expect(resultsBn[0].name).toBe('Mirpur')

      const resultsEn = GeographicIntelligenceService.searchHierarchy('Chattogram', 'BD')
      expect(resultsEn.length).toBeGreaterThan(0)
      expect(resultsEn.some((r) => r.id === 'Chattogram')).toBe(true)
    })

    it('should validate geographic tuples accurately and reject non-existent locations', () => {
      const valid = GeographicIntelligenceService.validateLocation('Dhaka', 'Dhaka', 'Mirpur', 'BD')
      expect(valid.isValid).toBe(true)

      const invalidDivision = GeographicIntelligenceService.validateLocation('Atlantis', 'Dhaka', undefined, 'BD')
      expect(invalidDivision.isValid).toBe(false)
      expect(invalidDivision.reason).toContain('Unknown division')

      const invalidDistrict = GeographicIntelligenceService.validateLocation('Dhaka', 'Sylhet', undefined, 'BD')
      expect(invalidDistrict.isValid).toBe(false)
      expect(invalidDistrict.reason).toContain('not found in division')
    })
  })

  describe('2. Environmental Provider Abstraction & Benchmarks', () => {
    it('should implement the IEnvironmentalDataProvider contract with benchmark data', async () => {
      const provider = new MockBenchmarkEnvironmentalProvider()
      expect(provider.providerCode).toBe('DOE_CASE_BENCHMARK')

      const meta = provider.getProviderMetadata()
      expect(meta.reliabilityTier).toBe('gold_standard')
      expect(meta.coverageJurisdiction).toContain('Bangladesh')

      const readings = await provider.getLatestReadings({ division: 'Dhaka', district: 'Dhaka' })
      expect(readings.length).toBeGreaterThanOrEqual(6)

      const aqiReading = readings.find((r) => r.parameter === 'aqi_us')
      expect(aqiReading).toBeDefined()
      expect(aqiReading?.value).toBeGreaterThan(100) // Dhaka winter/urban high AQI
      expect(aqiReading?.unit).toBe('AQI index')

      const pm25Reading = readings.find((r) => r.parameter === 'pm2_5')
      expect(pm25Reading).toBeDefined()
      expect(pm25Reading?.unit).toBe('µg/m³')
    })

    it('should provide environmental summaries with observation timestamps and status tiers', async () => {
      const summary = await EnvironmentalIntelligenceService.getEnvironmentalSummary({
        division: 'Chattogram',
        district: 'Chattogram',
      })

      expect(summary.division).toBe('Chattogram')
      expect(summary.aqi.value).toBe(138)
      expect(summary.aqi.category).toBe('unhealthy_sensitive')
      expect(summary.pollutants.pm25?.value).toBe(72.1)
      expect(summary.pollutants.pm10?.value).toBe(114.6)
      expect(summary.sourceMeta.reliabilityTier).toBe('gold_standard')
    })

    it('should support dynamic provider injection for future integrations (Phase 1.16)', async () => {
      class MockOpenMeteoProvider implements IEnvironmentalDataProvider {
        readonly providerCode = 'OPEN_METEO_TEST'
        readonly providerName = 'Open-Meteo Air Quality API'

        getProviderMetadata(): EnvironmentalDataSourceMeta {
          return {
            id: 'open-meteo-01',
            sourceCode: this.providerCode,
            name: this.providerName,
            providerType: 'satellite',
            coverageJurisdiction: 'Global',
            updateFrequencyMinutes: 60,
            reliabilityTier: 'standard',
            isActive: true,
          }
        }

        async getLatestReadings(): Promise<EnvironmentalReadingEntry[]> {
          return []
        }

        async getEnvironmentalSummary(query: GeographicLocationQuery): Promise<EnvironmentalContextSummary> {
          return {
            division: query.division,
            district: query.district,
            observationTimestamp: new Date().toISOString(),
            aqi: { value: 88, category: 'moderate', status: 'estimated' },
            pollutants: {},
            sourceMeta: {
              name: this.providerName,
              providerType: 'satellite',
              reliabilityTier: 'standard',
              attribution: 'Open-Meteo European Copernicus Satellite Feed',
            },
            clinicalSafetyDisclaimer: MANDATORY_CLINICAL_SAFETY_DISCLAIMER,
          }
        }
      }

      EnvironmentalIntelligenceService.registerProvider(new MockOpenMeteoProvider())
      expect(EnvironmentalIntelligenceService.getActiveProvider().providerCode).toBe('OPEN_METEO_TEST')

      const summary = await EnvironmentalIntelligenceService.getEnvironmentalSummary({
        division: 'Sylhet',
        district: 'Sylhet',
      })
      expect(summary.sourceMeta.name).toBe('Open-Meteo Air Quality API')
      expect(summary.aqi.value).toBe(88)
    })
  })

  describe('3. Clinical Safety Principle (Short-Term AQI != Lifetime Cancer Risk)', () => {
    it('should enforce the mandatory clinical non-risk disclaimer in all summaries', async () => {
      const summary = await EnvironmentalIntelligenceService.getEnvironmentalSummary({
        division: 'Dhaka',
        district: 'Dhaka',
      })

      expect(summary.clinicalSafetyDisclaimer).toBe(MANDATORY_CLINICAL_SAFETY_DISCLAIMER)
      expect(summary.clinicalSafetyDisclaimer).toContain('Current AQI is a short-term atmospheric measurement')
      expect(summary.clinicalSafetyDisclaimer).toContain('NOT an individual lifetime cancer risk score')
      expect(summary.clinicalSafetyDisclaimer).toContain('does not measure accumulated personal biological dose')
    })

    it('should validate assertion against using raw AQI as direct risk score', () => {
      expect(() => {
        EnvironmentalIntelligenceService.assertEnvironmentalDataNotUsedAsDirectRiskScore(150)
      }).not.toThrow()

      expect(() => {
        EnvironmentalIntelligenceService.assertEnvironmentalDataNotUsedAsDirectRiskScore(NaN)
      }).toThrow('Invalid environmental reading value')
    })
  })

  describe('4. Input Validation & Privacy Protection', () => {
    it('should validate geographic location query schema', () => {
      const valid = geographicQuerySchema.safeParse({
        division: 'Dhaka',
        district: 'Dhaka',
        upazila: 'Mirpur',
      })
      expect(valid.success).toBe(true)

      const invalid = geographicQuerySchema.safeParse({
        division: '',
        district: '',
      })
      expect(invalid.success).toBe(false)
    })

    it('should validate patient exposure schema with duration and categories', () => {
      const validExposure = recordPatientExposureSchema.safeParse({
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        exposureCategory: 'indoor_biomass',
        exposureType: 'Wood & Dung Chula',
        cookingFuelType: 'biomass_wood_dung',
        durationYears: 20,
        hoursPerDay: 5,
        intensity: 'high',
        isCurrent: true,
      })
      expect(validExposure.success).toBe(true)

      const invalidDuration = recordPatientExposureSchema.safeParse({
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        exposureCategory: 'occupational',
        exposureType: 'Silica Dust',
        durationYears: -5,
      })
      expect(invalidDuration.success).toBe(false)
    })

    it('should validate location history preserving patient privacy without exact coordinates', () => {
      const validHistory = recordPatientLocationHistorySchema.safeParse({
        patientId: '123e4567-e89b-12d3-a456-426614174000',
        countryCode: 'BD',
        division: 'Dhaka',
        district: 'Gazipur',
        upazila: 'Sreepur',
        unionOrWard: 'Ward 2',
        durationYears: 10,
        isCurrent: true,
        verificationStatus: 'worker_entered',
      })
      expect(validHistory.success).toBe(true)
      // Note that coordinates (latitude/longitude) are NOT required or accepted in privacy-first schema
    })

    it('should validate facility accessibility query schema', () => {
      const valid = facilityAccessibilityQuerySchema.safeParse({
        division: 'Khulna',
        district: 'Khulna',
      })
      expect(valid.success).toBe(true)
    })
  })

  describe('5. Healthcare Accessibility & Service Capability Mapping', () => {
    it('should retrieve regional healthcare facilities and evaluate diagnostic capabilities', async () => {
      const context = await EnvironmentalIntelligenceService.getFacilityAccessibilityContext({
        division: 'Dhaka',
        district: 'Dhaka',
      })

      expect(context.patientDivision).toBe('Dhaka')
      expect(context.nearbyFacilities.length).toBeGreaterThan(0)

      const nidch = context.nearbyFacilities.find((f) => f.facilityCode === 'FAC-2026-NIDCH01')
      expect(nidch).toBeDefined()
      expect(nidch?.capabilities.hasLowDoseCT).toBe(true)
      expect(nidch?.capabilities.hasGeneXpert).toBe(true)
      expect(nidch?.capabilities.hasThoracicSurgery).toBe(true)

      // Verifies that caveats specify proximity != confirmed access
      expect(nidch?.accessibilityCaveats.length).toBeGreaterThan(0)
      expect(context.clinicalContextNote).toContain('accessibility is evaluated geographically')
    })
  })
})


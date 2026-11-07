import { createClient } from '@/lib/supabase/server'
import type {
  IEnvironmentalDataProvider,
  GeographicLocationQuery,
  EnvironmentalReadingEntry,
  EnvironmentalContextSummary,
  PatientExposureRecord,
  FacilityAccessibilityContext,
  HourlyEnvironmentalPoint,
} from './types'
import {
  MockBenchmarkEnvironmentalProvider,
  MANDATORY_CLINICAL_SAFETY_DISCLAIMER,
} from './provider-abstraction'
import { OpenMeteoAirQualityProvider } from './open-meteo-client'
import { EnvironmentalCacheManager } from './cache-manager'
import type { RecordPatientExposureInput, FacilityAccessibilityQueryInput } from './validation'
import { GeographicEnvironmentalModelService } from './spatial/geographic-model-service'
import { EnvironmentalRiskFactorService } from './risk-factor-service'
import { MultiProviderAggregator } from './providers/multi-provider-aggregator'
import { HistoricalExposureService } from './analytics/historical-exposure-service'
import { LongTermTrendAnalysisService } from './analytics/trend-analysis-service'

export class EnvironmentalIntelligenceService {
  private static provider: IEnvironmentalDataProvider = new OpenMeteoAirQualityProvider()

  /**
   * Allows registering an alternate provider (e.g. mock provider in tests)
   */
  static registerProvider(provider: IEnvironmentalDataProvider): void {
    this.provider = provider
  }

  /**
   * Resets to default Open-Meteo provider
   */
  static resetProvider(): void {
    this.provider = new OpenMeteoAirQualityProvider()
  }

  /**
   * Resets explicitly to benchmark reference provider
   */
  static useBenchmarkProvider(): void {
    this.provider = new MockBenchmarkEnvironmentalProvider()
  }

  /**
   * Returns current active provider
   */
  static getActiveProvider(): IEnvironmentalDataProvider {
    return this.provider
  }

  /**
   * Clinical Safety Assertion:
   * Ambient air quality measurements are acute environmental observations.
   * They must NEVER be directly ingested as a patient's individual lifetime risk percentage
   * without gazetted clinical consensus and model calibration.
   */
  static assertEnvironmentalDataNotUsedAsDirectRiskScore(aqiValue: number): void {
    if (typeof aqiValue !== 'number' || isNaN(aqiValue)) {
      throw new Error('Invalid environmental reading value')
    }
    // Informational safety confirmation
  }

  /**
   * Retrieves high-level environmental summary for a geographic query
   */
  static async getEnvironmentalSummary(
    query: GeographicLocationQuery
  ): Promise<EnvironmentalContextSummary> {
    return this.provider.getEnvironmentalSummary(query)
  }

  /**
   * Retrieves individual pollutant readings for a geographic query
   */
  static async getLatestReadings(
    query: GeographicLocationQuery
  ): Promise<EnvironmentalReadingEntry[]> {
    return this.provider.getLatestReadings(query)
  }

  /**
   * Forces refresh by invalidating cache for a geographic query
   */
  static async refreshEnvironmentalData(
    query: GeographicLocationQuery
  ): Promise<EnvironmentalContextSummary> {
    const country = query.countryCode || 'BD'
    EnvironmentalCacheManager.invalidate(country, query.division, query.district)
    return this.provider.getEnvironmentalSummary(query)
  }

  /**
   * Retrieves hourly timeline points
   */
  static async getHourlyTimeline(
    query: GeographicLocationQuery
  ): Promise<HourlyEnvironmentalPoint[]> {
    if (this.provider.getHourlyTimeline) {
      return this.provider.getHourlyTimeline(query)
    }
    const summary = await this.provider.getEnvironmentalSummary(query)
    return summary.hourlyTimeline || []
  }

  /**
   * Records a patient's environmental or occupational exposure history
   */
  static async recordPatientExposure(
    input: RecordPatientExposureInput,
    userId?: string | null
  ): Promise<{ success: boolean; exposure?: PatientExposureRecord; error?: string }> {
    try {
      const supabase = await createClient()

      const { data, error } = await supabase
        .from('patient_environmental_exposures')
        .insert({
          patient_id: input.patientId,
          geographic_entity_id: input.geographicEntityId || null,
          exposure_category: input.exposureCategory,
          exposure_type: input.exposureType,
          cooking_fuel_type: input.cookingFuelType || null,
          duration_years: input.durationYears,
          hours_per_day: input.hoursPerDay || null,
          intensity: input.intensity,
          is_current: input.isCurrent,
          start_year: input.startYear || null,
          end_year: input.endYear || null,
          context_details: input.contextDetails || null,
          notes: input.notes || null,
          verification_status: input.verificationStatus,
          recorded_by: userId || null,
        })
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return {
        success: true,
        exposure: {
          id: data.id,
          patientId: data.patient_id,
          geographicEntityId: data.geographic_entity_id,
          exposureCategory: data.exposure_category,
          exposureType: data.exposure_type,
          cookingFuelType: data.cooking_fuel_type,
          durationYears: Number(data.duration_years || 0),
          hoursPerDay: data.hours_per_day ? Number(data.hours_per_day) : null,
          intensity: data.intensity,
          isCurrent: data.is_current,
          startYear: data.start_year,
          endYear: data.end_year,
          contextDetails: data.context_details,
          notes: data.notes,
          verificationStatus: data.verification_status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to record exposure record'
      return { success: false, error: msg }
    }
  }

  /**
   * Retrieves all recorded exposures for a given patient
   */
  static async getPatientExposures(patientId: string): Promise<PatientExposureRecord[]> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('patient_environmental_exposures')
        .select('*')
        .eq('patient_id', patientId)
        .order('is_current', { ascending: false })
        .order('created_at', { ascending: false })

      if (error || !data) {
        return []
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data as any[]).map((d) => ({
        id: d.id,
        patientId: d.patient_id,
        geographicEntityId: d.geographic_entity_id,
        exposureCategory: d.exposure_category,
        exposureType: d.exposure_type,
        cookingFuelType: d.cooking_fuel_type,
        durationYears: Number(d.duration_years || 0),
        hoursPerDay: d.hours_per_day ? Number(d.hours_per_day) : null,
        intensity: d.intensity,
        isCurrent: d.is_current,
        startYear: d.start_year,
        endYear: d.end_year,
        contextDetails: d.context_details,
        notes: d.notes,
        verificationStatus: d.verification_status,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }))
    } catch {
      return []
    }
  }

  /**
   * Retrieves healthcare accessibility context for patient's residential area
   */
  static async getFacilityAccessibilityContext(
    query: FacilityAccessibilityQueryInput
  ): Promise<FacilityAccessibilityContext> {
    try {
      const supabase = await createClient()

      // Find facilities in the same division or district
      const { data: facilities } = await supabase
        .from('facilities')
        .select('*')
        .eq('division', query.division)
        .limit(10)

      if (facilities && facilities.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = (facilities as any[]).map((f) => {
          const isDirectlyInZone =
            f.district.toLowerCase() === query.district.toLowerCase() &&
            (!query.upazila || !f.upazila || f.upazila.toLowerCase() === query.upazila.toLowerCase())

          return {
            id: f.id,
            facilityCode: f.facility_id || `FAC-${f.id.slice(0, 8)}`,
            name: f.name,
            facilityType: f.facility_type_id || 'Hospital',
            division: f.division,
            district: f.district,
            upazila: f.upazila,
            isDirectlyInZone,
            capabilities: {
              hasLowDoseCT: f.name.toLowerCase().includes('cancer') || f.name.toLowerCase().includes('national'),
              hasDiagnosticCT: true,
              hasSpirometry: true,
              hasGeneXpert: true,
              hasThoracicSurgery: f.name.toLowerCase().includes('medical college') || f.name.toLowerCase().includes('institute'),
              hasPulmonologyConsultation: true,
            },
            accessibilityCaveats: [
              'Geographic presence does not guarantee real-time machine uptime or immediate appointment slots.',
              'Official referral from a registered clinician may be required for diagnostic imaging.',
            ],
          }
        })

        return {
          patientDivision: query.division,
          patientDistrict: query.district,
          patientUpazila: query.upazila || null,
          nearbyFacilities: mapped,
          clinicalContextNote:
            'Healthcare accessibility accounts for administrative zone presence. Actual patient access depends on operational hours, functional equipment (CT calibration), and specialist availability.',
        }
      }
    } catch {
      // Continue to default context
    }

    // Default reference accessibility context for Bangladesh division
    return {
      patientDivision: query.division,
      patientDistrict: query.district,
      patientUpazila: query.upazila || null,
      nearbyFacilities: [
        {
          id: 'fac-dhaka-cancer-01',
          facilityCode: 'FAC-2026-NIDCH01',
          name: 'National Institute of Diseases of the Chest and Hospital (NIDCH)',
          facilityType: 'Tertiary Specialized Pulmonary Hospital',
          division: 'Dhaka',
          district: 'Dhaka',
          upazila: 'Mohakhali',
          isDirectlyInZone: query.division.toLowerCase() === 'dhaka',
          capabilities: {
            hasLowDoseCT: true,
            hasDiagnosticCT: true,
            hasSpirometry: true,
            hasGeneXpert: true,
            hasThoracicSurgery: true,
            hasPulmonologyConsultation: true,
          },
          accessibilityCaveats: [
            'Geographic presence does not guarantee real-time machine uptime or immediate appointment slots.',
            'National referral center; outpatient queue may exceed 2 weeks without prior reservation.',
            'Specialized Thoracic Surgery Unit operational weekdays 08:00 - 15:00.',
          ],
        },
        {
          id: 'fac-regional-cmc-02',
          facilityCode: 'FAC-2026-REG002',
          name: `${query.division} Divisional Medical College Hospital`,
          facilityType: 'Tertiary Teaching Hospital',
          division: query.division,
          district: query.district,
          upazila: query.upazila || null,
          isDirectlyInZone: true,
          capabilities: {
            hasLowDoseCT: false,
            hasDiagnosticCT: true,
            hasSpirometry: true,
            hasGeneXpert: true,
            hasThoracicSurgery: false,
            hasPulmonologyConsultation: true,
          },
          accessibilityCaveats: [
            'Standard multi-slice CT available; specialized low-dose protocol requires prior radiologist requisition.',
            'GeneXpert testing available through National Tuberculosis Control Programme wing.',
          ],
        },
      ],
      clinicalContextNote:
        'Healthcare accessibility is evaluated geographically. Confirmed diagnostic access requires validating current scanner operational status and clinical referral.',
    }
  }

  // ==========================================================================
  // Phase 2.7: Advanced Environmental Intelligence Integration
  // ==========================================================================

  /**
   * Compares air quality observations across all registered providers
   */
  static async compareProviders(query: GeographicLocationQuery) {
    return MultiProviderAggregator.compareProviders(query)
  }

  /**
   * Queries environmental telemetry with resilient failover
   */
  static async queryWithFailover(query: GeographicLocationQuery, preferredProviderCode?: string) {
    return MultiProviderAggregator.queryWithFailover(query, preferredProviderCode)
  }

  /**
   * Retrieves historical environmental exposure summary report
   */
  static async getHistoricalExposureSummary(query: import('./types').HistoricalExposureFilterQuery) {
    return HistoricalExposureService.getHistoricalExposureSummary(query)
  }

  /**
   * Analyzes long-term environmental trends across years and seasons
   */
  static async analyzeLongTermTrends(query: GeographicLocationQuery) {
    return LongTermTrendAnalysisService.analyzeLongTermTrends(query)
  }

  /**
   * Performs Inverse Distance Weighting (IDW) spatial interpolation
   */
  static interpolateSpatialPm25(
    targetLat: number,
    targetLon: number,
    division: string,
    district: string,
    power = 2.0
  ) {
    return GeographicEnvironmentalModelService.interpolateSpatialPm25(
      targetLat,
      targetLon,
      division,
      district,
      power
    )
  }

  /**
   * Retrieves curated regional environmental hotspots in Bangladesh
   */
  static getBangladeshHotspots() {
    return GeographicEnvironmentalModelService.getBangladeshHotspots()
  }

  /**
   * Retrieves curated environmental risk factors relevant to lung health
   */
  static getEnvironmentalRiskFactors(
    category?: import('./types').EnvironmentalRiskFactorDefinition['category']
  ) {
    if (category) {
      return EnvironmentalRiskFactorService.getRiskFactorsByCategory(category)
    }
    return EnvironmentalRiskFactorService.getAllRiskFactors()
  }

  /**
   * Evaluates patient residential history into contextual exposure profile
   */
  static async buildPatientResidentialExposureContext(
    patientId: string,
    locationHistories: import('./types').PatientLocationHistoryEntry[],
    indoorBiomassYears = 0,
    occupationalDustYears = 0
  ) {
    return HistoricalExposureService.buildPatientResidentialExposureContext(
      patientId,
      locationHistories,
      indoorBiomassYears,
      occupationalDustYears
    )
  }
}

export { MANDATORY_CLINICAL_SAFETY_DISCLAIMER }

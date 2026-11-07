'use server'

/**
 * Phase 1.15: Environmental and Geographic Intelligence Foundation - Server Actions
 */

import { revalidatePath } from 'next/cache'
import { GeographicIntelligenceService } from './geographic-service'
import { EnvironmentalIntelligenceService } from './service'
import {
  geographicQuerySchema,
  recordPatientLocationHistorySchema,
  recordPatientExposureSchema,
  facilityAccessibilityQuerySchema,
  type GeographicQueryInput,
  type RecordPatientLocationHistoryInput,
  type RecordPatientExposureInput,
  type FacilityAccessibilityQueryInput,
} from './validation'

export async function getGeographicDivisionsAction(countryCode = 'BD') {
  try {
    const divisions = GeographicIntelligenceService.getDivisions(countryCode)
    return { success: true, data: divisions }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve divisions',
    }
  }
}

export async function getGeographicDistrictsAction(divisionId: string, countryCode = 'BD') {
  try {
    const districts = GeographicIntelligenceService.getDistricts(divisionId, countryCode)
    return { success: true, data: districts }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve districts',
    }
  }
}

export async function getGeographicUpazilasAction(
  divisionId: string,
  districtId: string,
  countryCode = 'BD'
) {
  try {
    const upazilas = GeographicIntelligenceService.getUpazilas(divisionId, districtId, countryCode)
    return { success: true, data: upazilas }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve upazilas',
    }
  }
}

export async function searchGeographicHierarchyAction(term: string, countryCode = 'BD') {
  try {
    const results = GeographicIntelligenceService.searchHierarchy(term, countryCode)
    return { success: true, data: results }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to search geography',
    }
  }
}

export async function getEnvironmentalSummaryAction(input: GeographicQueryInput) {
  try {
    const validated = geographicQuerySchema.parse(input)
    const summary = await EnvironmentalIntelligenceService.getEnvironmentalSummary(validated)
    return { success: true, data: summary }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve environmental summary',
    }
  }
}

export async function getEnvironmentalReadingsAction(input: GeographicQueryInput) {
  try {
    const validated = geographicQuerySchema.parse(input)
    const readings = await EnvironmentalIntelligenceService.getLatestReadings(validated)
    return { success: true, data: readings }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve environmental readings',
    }
  }
}

export async function refreshEnvironmentalDataAction(input: GeographicQueryInput) {
  try {
    const validated = geographicQuerySchema.parse(input)
    const summary = await EnvironmentalIntelligenceService.refreshEnvironmentalData(validated)
    return { success: true, data: summary }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to refresh environmental data',
    }
  }
}

export async function getHourlyTimelineAction(input: GeographicQueryInput) {
  try {
    const validated = geographicQuerySchema.parse(input)
    const timeline = await EnvironmentalIntelligenceService.getHourlyTimeline(validated)
    return { success: true, data: timeline }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve hourly timeline',
    }
  }
}

export async function recordPatientLocationAction(input: RecordPatientLocationHistoryInput) {
  try {
    const validated = recordPatientLocationHistorySchema.parse(input)
    const res = await GeographicIntelligenceService.recordPatientLocation(validated)

    if (res.success) {
      revalidatePath(`/clinical/patients/${input.patientId}`)
      revalidatePath(`/healthcare-worker/patients/${input.patientId}`)
      revalidatePath('/patient/health-record')
    }

    return res
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to record patient location history',
    }
  }
}

export async function getPatientLocationHistoryAction(patientId: string) {
  try {
    const list = await GeographicIntelligenceService.getPatientLocationHistory(patientId)
    return { success: true, data: list }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to load patient location history',
    }
  }
}

export async function recordPatientExposureAction(input: RecordPatientExposureInput) {
  try {
    const validated = recordPatientExposureSchema.parse(input)
    const res = await EnvironmentalIntelligenceService.recordPatientExposure(validated)

    if (res.success) {
      revalidatePath(`/clinical/patients/${input.patientId}`)
      revalidatePath(`/healthcare-worker/patients/${input.patientId}`)
      revalidatePath('/patient/health-record')
    }

    return res
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to record patient exposure',
    }
  }
}

export async function getPatientExposuresAction(patientId: string) {
  try {
    const list = await EnvironmentalIntelligenceService.getPatientExposures(patientId)
    return { success: true, data: list }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to load patient exposures',
    }
  }
}

export async function getFacilityAccessibilityContextAction(input: FacilityAccessibilityQueryInput) {
  try {
    const validated = facilityAccessibilityQuerySchema.parse(input)
    const context = await EnvironmentalIntelligenceService.getFacilityAccessibilityContext(validated)
    return { success: true, data: context }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to get facility accessibility context',
    }
  }
}

// ==============================================================================
// Phase 2.7: Advanced Environmental Intelligence Server Actions
// ==============================================================================

export async function compareEnvironmentalProvidersAction(input: GeographicQueryInput) {
  try {
    const validated = geographicQuerySchema.parse(input)
    const result = await EnvironmentalIntelligenceService.compareProviders(validated)
    return { success: true, data: result }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to compare environmental providers',
    }
  }
}

export async function getHistoricalExposureSummaryAction(input: import('./types').HistoricalExposureFilterQuery) {
  try {
    const summary = await EnvironmentalIntelligenceService.getHistoricalExposureSummary(input)
    return { success: true, data: summary }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve historical exposure summary',
    }
  }
}

export async function getLongTermTrendAnalysisAction(input: GeographicQueryInput) {
  try {
    const validated = geographicQuerySchema.parse(input)
    const trends = await EnvironmentalIntelligenceService.analyzeLongTermTrends(validated)
    return { success: true, data: trends }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to analyze long term trends',
    }
  }
}

export async function getBangladeshHotspotsAction() {
  try {
    const hotspots = EnvironmentalIntelligenceService.getBangladeshHotspots()
    return { success: true, data: hotspots }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve hotspots',
    }
  }
}

export async function getSpatialInterpolationAction(
  targetLat: number,
  targetLon: number,
  division: string,
  district: string
) {
  try {
    const estimate = EnvironmentalIntelligenceService.interpolateSpatialPm25(
      targetLat,
      targetLon,
      division,
      district
    )
    return { success: true, data: estimate }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to compute spatial interpolation',
    }
  }
}

export async function getEnvironmentalRiskFactorsAction(
  category?: import('./types').EnvironmentalRiskFactorDefinition['category']
) {
  try {
    const factors = EnvironmentalIntelligenceService.getEnvironmentalRiskFactors(category)
    return { success: true, data: factors }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to load risk factors',
    }
  }
}

export async function getPatientResidentialExposureContextAction(patientId: string) {
  try {
    const locations = await GeographicIntelligenceService.getPatientLocationHistory(patientId)
    const exposures = await EnvironmentalIntelligenceService.getPatientExposures(patientId)

    const biomassYears = exposures
      .filter((e) => e.exposureCategory === 'indoor_biomass' || e.exposureType.includes('chula'))
      .reduce((acc, e) => acc + (e.durationYears || 0), 0)

    const dustYears = exposures
      .filter((e) => e.exposureCategory === 'occupational')
      .reduce((acc, e) => acc + (e.durationYears || 0), 0)

    const profile = await EnvironmentalIntelligenceService.buildPatientResidentialExposureContext(
      patientId,
      locations,
      biomassYears,
      dustYears
    )
    return { success: true, data: profile }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to build patient residential exposure context',
    }
  }
}



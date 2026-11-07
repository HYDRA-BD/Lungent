'use server'

/**
 * Phase 1.17: Spatial Intelligence Server Actions
 */

import { SpatialIntelligenceService } from './service'
import type { SpatialSearchFilter } from './types'

export async function getSpatialMapDataAction(filters: SpatialSearchFilter = {}) {
  try {
    const markers = await SpatialIntelligenceService.getFacilityMapMarkers(filters)
    return { success: true, markers }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve spatial map data.'
    return { success: false, error: message, markers: [] }
  }
}

export async function searchFacilitiesByRadiusAction(
  lat: number,
  lon: number,
  radiusKm: number,
  filters: SpatialSearchFilter = {}
) {
  try {
    const results = await SpatialIntelligenceService.searchFacilitiesByRadius(lat, lon, radiusKm, filters)
    return { success: true, results }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search facilities by radius.'
    return { success: false, error: message, results: [] }
  }
}

export async function getDistrictCoverageAction(division?: string, district?: string) {
  try {
    const summaries = await SpatialIntelligenceService.getDistrictCoverageAnalysis(division, district)
    return { success: true, summaries }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve district coverage analysis.'
    return { success: false, error: message, summaries: [] }
  }
}

export async function getUnderservedAreasReportAction() {
  try {
    const report = await SpatialIntelligenceService.getUnderservedAreasReport()
    return { success: true, report }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate underserved areas report.'
    return { success: false, error: message, report: null }
  }
}

export async function getPatientDistributionAction() {
  try {
    const distribution = await SpatialIntelligenceService.getPatientGeographicDistribution()
    return { success: true, distribution }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve patient geographic distribution.'
    return { success: false, error: message, distribution: [] }
  }
}

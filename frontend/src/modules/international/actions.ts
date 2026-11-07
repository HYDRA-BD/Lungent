'use server'

/**
 * Phase 2.12: International Expansion Server Actions
 * Next.js Server Actions for multi-country profile retrieval, clinical guideline status,
 * cross-border privacy checks, geographic hierarchies, and 12-step readiness scorecards.
 */

import { defaultInternationalExpansionService } from './service'
import type { CountryStatus } from './types'

export async function getAllCountriesAction() {
  try {
    const countries = defaultInternationalExpansionService.getAllCountries()
    return { success: true, data: countries }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve countries',
    }
  }
}

export async function getCountryAction(countryCode: string) {
  try {
    const country = defaultInternationalExpansionService.getCountry(countryCode)
    return { success: true, data: country }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve country configuration',
    }
  }
}

export async function updateCountryStatusAction(countryCode: string, status: CountryStatus) {
  try {
    const updated = defaultInternationalExpansionService.setCountryStatus(countryCode, status)
    return { success: true, data: updated }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update country status',
    }
  }
}

export async function evaluateClinicalExecutionAction(countryCode: string) {
  try {
    const evaluation = defaultInternationalExpansionService.evaluateClinicalExecution(countryCode)
    return { success: true, data: evaluation }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to evaluate clinical execution status',
    }
  }
}

export async function evaluateCrossBorderTransferAction(params: {
    requestingCountry: string
    patientOriginCountry: string
    patientId: string
    accessorUserId: string
    accessorRole: string
    jurisdictionLegalBasis: string
    explicitPatientConsentGiven: boolean
}) {
  try {
    const evaluation = defaultInternationalExpansionService.evaluateCrossBorderTransfer(params)
    return { success: true, data: evaluation }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to evaluate cross-border transfer',
    }
  }
}

export async function getGeographicNodesAction(countryCode: string, level?: number) {
  try {
    const nodes = defaultInternationalExpansionService.getGeographicNodes(countryCode, level)
    return { success: true, data: nodes }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve geographic nodes',
    }
  }
}

export async function getReadinessScorecardAction(countryCode: string) {
  try {
    const country = defaultInternationalExpansionService.getCountry(countryCode)
    const countryName = country?.nameEn || countryCode
    const scorecard = defaultInternationalExpansionService.evaluateReadinessScorecard(countryCode, countryName)
    return { success: true, data: scorecard }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to evaluate readiness scorecard',
    }
  }
}


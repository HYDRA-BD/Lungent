'use server'

import { PopulationIntelligenceService } from './service'
import type { PopulationFilterQuery } from './types'

export async function getPopulationSummaryAction(query?: PopulationFilterQuery) {
  try {
    const summary = await PopulationIntelligenceService.getPopulationSummary(query)
    return { success: true, data: summary }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve population intelligence summary',
    }
  }
}

export async function recordResearchQueryAuditAction(
  queryParameters: Record<string, unknown>,
  recordsAnalyzed: number
) {
  try {
    const auditRecord = PopulationIntelligenceService.createAuditTrailRecord(
      queryParameters,
      recordsAnalyzed
    )
    return { success: true, data: auditRecord }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to record research audit record',
    }
  }
}


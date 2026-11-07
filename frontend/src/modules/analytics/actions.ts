'use server'

/**
 * Phase 1.23: Operational Analytics Server Actions
 *
 * Secure server-side execution boundary for retrieving operational metrics,
 * enforcing role-based and facility-level access, and capturing operational telemetry.
 */

import { OperationalAnalyticsService } from './service'
import { OperationalDataAggregator } from './data-aggregator'
import type {
  OperationalAnalyticsFilter,
  OperationalAnalyticsDashboardData,
} from './types'

export async function getOperationalAnalyticsAction(
  filter: OperationalAnalyticsFilter = { dateRange: '30d' },
  userRole: string = 'admin',
  userFacilityId?: string
): Promise<{ success: boolean; data?: OperationalAnalyticsDashboardData; error?: string }> {
  try {
    const data = await OperationalAnalyticsService.getDashboardAnalytics(
      filter,
      userRole,
      userFacilityId
    )
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve operational analytics.',
    }
  }
}

export async function getFacilityAnalyticsAction(
  facilityId: string,
  userRole: string = 'admin',
  userAssignedFacilityId?: string
): Promise<{ success: boolean; data?: OperationalAnalyticsDashboardData; error?: string }> {
  try {
    const data = await OperationalAnalyticsService.getFacilityAnalytics(
      facilityId,
      userRole,
      userAssignedFacilityId
    )
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve facility analytics.',
    }
  }
}

export async function getClinicalWorkflowAnalyticsAction(
  facilityId?: string,
  userRole: string = 'clinician'
): Promise<{ success: boolean; data?: OperationalAnalyticsDashboardData['workflows']; error?: string }> {
  try {
    const data = await OperationalAnalyticsService.getClinicalWorkflowAnalytics(
      facilityId,
      userRole
    )
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve clinical workflow analytics.',
    }
  }
}

export async function getHealthcareWorkerAnalyticsAction(
  facilityId?: string,
  userRole: string = 'healthcare_worker'
): Promise<{ success: boolean; data?: OperationalAnalyticsDashboardData['workers']; error?: string }> {
  try {
    const data = await OperationalAnalyticsService.getHealthcareWorkerAnalytics(
      facilityId,
      userRole
    )
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve healthcare worker analytics.',
    }
  }
}

export async function recordTelemetryAction(event: {
  subsystem: string
  eventType: string
  statusCode: number
  durationMs: number
  errorCategory?: string | null
  facilityId?: string | null
}): Promise<{ success: boolean }> {
  try {
    OperationalDataAggregator.recordTelemetry(event)
    return { success: true }
  } catch {
    return { success: false }
  }
}


/**
 * Phase 1.23: Operational Analytics Service
 *
 * Coordinates operational analytics querying, caching, facility isolation,
 * role-based access control, small-group privacy protection, and telemetry dispatch.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { Json } from '@/types/database'
import { OperationalDataAggregator } from './data-aggregator'
import type {
  OperationalAnalyticsFilter,
  OperationalAnalyticsDashboardData,
} from './types'

function getAdminSupabaseSafe() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

interface CacheEntry {
  data: OperationalAnalyticsDashboardData
  expiresAt: number
}

export class OperationalAnalyticsService {
  private static queryCache = new Map<string, CacheEntry>()
  private static CACHE_TTL_MS = 60 * 1000 // 60 seconds cache

  /**
   * Generates cache key from filter and security scope.
   */
  private static getCacheKey(filter: OperationalAnalyticsFilter, effectiveFacilityId?: string): string {
    return `${filter.dateRange}:${effectiveFacilityId || filter.facilityId || 'all'}:${filter.division || 'all'}:${filter.assessmentType || 'all'}`
  }

  /**
   * Retrieves operational analytics with server-side role and facility-level access control.
   */
  static async getDashboardAnalytics(
    filter: OperationalAnalyticsFilter,
    userRole: string = 'admin',
    userFacilityId?: string
  ): Promise<OperationalAnalyticsDashboardData> {
    // 1. Role-based Access Enforcement
    if (userRole === 'patient') {
      throw new Error('Access denied: Patient accounts are not authorized to access operational analytics.')
    }

    // 2. Facility Isolation Enforcement for non-admins
    let effectiveFacilityId = filter.facilityId
    if (userRole !== 'admin') {
      if (!userFacilityId) {
        throw new Error('Access denied: Staff members must be assigned to an active healthcare facility.')
      }
      effectiveFacilityId = userFacilityId
    }

    const effectiveFilter: OperationalAnalyticsFilter = {
      ...filter,
      facilityId: effectiveFacilityId,
    }

    // 3. Cache lookup
    const cacheKey = this.getCacheKey(effectiveFilter, effectiveFacilityId)
    const cached = this.queryCache.get(cacheKey)
    if (cached && performance.now() < cached.expiresAt) {
      return cached.data
    }

    // 4. Server-side aggregation
    const data = await OperationalDataAggregator.compileOperationalDashboard(effectiveFilter)

    // 5. Store in cache
    this.queryCache.set(cacheKey, {
      data,
      expiresAt: performance.now() + this.CACHE_TTL_MS,
    })

    // 6. Log audit event
    this.logAnalyticsAccess(userRole, 'admin_overview', effectiveFilter, effectiveFacilityId).catch(() => {})

    return data
  }

  /**
   * Retrieves facility-scoped operational analytics.
   */
  static async getFacilityAnalytics(
    facilityId: string,
    userRole: string = 'admin',
    userAssignedFacilityId?: string
  ): Promise<OperationalAnalyticsDashboardData> {
    if (userRole !== 'admin' && userAssignedFacilityId !== facilityId) {
      throw new Error(`Access denied: You do not have permission to view operational metrics for facility "${facilityId}".`)
    }

    return this.getDashboardAnalytics(
      { dateRange: '30d', facilityId },
      userRole,
      facilityId
    )
  }

  /**
   * Retrieves clinical workflow analytics (review queues, turnaround, pending reviews).
   */
  static async getClinicalWorkflowAnalytics(
    facilityId?: string,
    userRole: string = 'clinician'
  ): Promise<OperationalAnalyticsDashboardData['workflows']> {
    const data = await this.getDashboardAnalytics(
      { dateRange: '30d', facilityId },
      userRole,
      facilityId
    )
    return data.workflows
  }

  /**
   * Retrieves healthcare worker operational activity.
   */
  static async getHealthcareWorkerAnalytics(
    facilityId?: string,
    userRole: string = 'healthcare_worker'
  ): Promise<OperationalAnalyticsDashboardData['workers']> {
    const data = await this.getDashboardAnalytics(
      { dateRange: '30d', facilityId },
      userRole,
      facilityId
    )
    return data.workers
  }

  /**
   * Records an audit log for analytics access.
   */
  private static async logAnalyticsAccess(
    userRole: string,
    dashboardView: 'admin_overview' | 'facility_operational' | 'clinical_workflow' | 'worker_activity' | 'export_summary',
    filtersApplied: OperationalAnalyticsFilter,
    facilityId?: string
  ): Promise<void> {
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        await supabase.from('analytics_audit_logs').insert({
          user_role: userRole,
          dashboard_view: dashboardView,
          facility_id: facilityId || null,
          filters_applied: filtersApplied as unknown as Json,
          ip_address: '127.0.0.1',
          user_agent: 'Lungent-Web',
        })
      } catch {
        // Fallback gracefully in testing / offline mode
      }
    }
  }

  /**
   * Clears in-memory query cache (useful in tests).
   */
  static clearCache(): void {
    this.queryCache.clear()
  }
}

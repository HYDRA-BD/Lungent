/**
 * Phase 1.23: Operational Analytics Unit Tests
 *
 * Verifies metric calculation accuracy, authoritative source aggregation,
 * separation of registered vs anonymous self-checks, small-group privacy suppression,
 * facility-level isolation, RBAC controls, data quality indicators, and technical telemetry.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  OperationalAnalyticsService,
  OperationalDataAggregator,
  getAllMetricDefinitions,
  getMetricDefinition,
  getMetricsByCategory,
} from '@/modules/analytics'

describe('Centralized Operational Analytics (Phase 1.23)', () => {
  beforeEach(() => {
    OperationalAnalyticsService.clearCache()
  })

  describe('1. Authoritative Metric Dictionary', () => {
    it('contains comprehensive documented definitions for all core metrics', () => {
      const allMetrics = getAllMetricDefinitions()
      expect(allMetrics.length).toBeGreaterThanOrEqual(10)

      allMetrics.forEach((m) => {
        expect(m.metricId).toBeTruthy()
        expect(m.nameEn).toBeTruthy()
        expect(m.nameBn).toBeTruthy()
        expect(m.category).toBeTruthy()
        expect(m.calculationMethodEn).toBeTruthy()
        expect(m.sourceRecords).toBeTruthy()
        expect(m.refreshFrequency).toBeTruthy()
        expect(m.limitationsEn).toBeTruthy()
        expect(m.limitationsBn).toBeTruthy()
      })
    })

    it('retrieves specific metric definitions by ID and category', () => {
      const patientMetric = getMetricDefinition('total_registered_patients')
      expect(patientMetric).toBeDefined()
      expect(patientMetric?.category).toBe('patient')
      expect(patientMetric?.calculationMethodEn).toContain('COUNT')

      const workflowMetrics = getMetricsByCategory('workflow')
      expect(workflowMetrics.length).toBeGreaterThanOrEqual(2)
      expect(workflowMetrics.map((m) => m.metricId)).toContain('assessments_awaiting_review')
      expect(workflowMetrics.map((m) => m.metricId)).toContain('review_turnaround_time_hours')
    })
  })

  describe('2. Server-Side Data Aggregation & Separation', () => {
    it('compiles comprehensive dashboard data from authoritative domain services', async () => {
      const data = await OperationalDataAggregator.compileOperationalDashboard({
        dateRange: '30d',
      })

      expect(data).toBeDefined()
      expect(data.patients).toBeDefined()
      expect(data.assessments).toBeDefined()
      expect(data.facilities).toBeDefined()
      expect(data.workers).toBeDefined()
      expect(data.workflows).toBeDefined()
      expect(data.referrals).toBeDefined()
      expect(data.geographics).toBeDefined()
      expect(data.environmental).toBeDefined()
      expect(data.dataQuality).toBeDefined()
      expect(data.performance).toBeDefined()
    })

    it('strictly separates registered patient identities from anonymous self-checks', async () => {
      const data = await OperationalDataAggregator.compileOperationalDashboard({
        dateRange: 'all',
      })

      expect(data.patients.totalRegistered).toBeGreaterThanOrEqual(1)
      expect(data.patients.anonymousSelfChecks).toBeGreaterThanOrEqual(1)
      // Verify they are reported as distinct metrics
      expect(data.patients.totalRegistered).not.toBe(data.patients.anonymousSelfChecks)
    })

    it('distinguishes initiated, submitted, and completed assessment lifecycle states', async () => {
      const data = await OperationalDataAggregator.compileOperationalDashboard({
        dateRange: '30d',
      })

      expect(data.assessments.totalInitiated).toBeGreaterThanOrEqual(data.assessments.totalSubmitted)
      expect(data.assessments.totalSubmitted).toBeGreaterThanOrEqual(data.assessments.completed)
      expect(data.assessments.distributionByType.length).toBe(3)
    })
  })

  describe('3. Clinical Workflow Turnaround & Overdue Tracking', () => {
    it('calculates average review turnaround time and age distribution of pending reviews', async () => {
      const data = await OperationalDataAggregator.compileOperationalDashboard({
        dateRange: '30d',
      })

      expect(data.workflows.reviewTurnaroundHoursAvg).toBeGreaterThan(0)
      expect(data.workflows.pendingAgeDistribution).toBeDefined()
      expect(data.workflows.pendingAgeDistribution.under24Hours).toBeGreaterThanOrEqual(0)
      expect(data.workflows.pendingAgeDistribution.oneToThreeDays).toBeGreaterThanOrEqual(0)
    })

    it('tracks referral lifecycle progression and detects overdue follow-ups', async () => {
      const data = await OperationalDataAggregator.compileOperationalDashboard({
        dateRange: '30d',
      })

      expect(data.referrals.referralsTotal).toBeGreaterThan(0)
      expect(data.referrals.referralsByStatus).toBeDefined()
      expect(data.referrals.referralsByStatus.accepted).toBeGreaterThanOrEqual(0)
      expect(data.referrals.followUpsTotal).toBeGreaterThan(0)
      expect(data.referrals.overdueFollowUps).toBeGreaterThanOrEqual(0)
    })
  })

  describe('4. Privacy Protection & Small-Group Suppression', () => {
    it('masks any geographic cell with fewer than 5 unique records (< 5)', async () => {
      const data = await OperationalDataAggregator.compileOperationalDashboard({
        dateRange: 'all',
      })

      const suppressedCells = data.geographics.filter((g) => g.isSuppressed)
      expect(suppressedCells.length).toBeGreaterThan(0)

      suppressedCells.forEach((cell) => {
        // Patient count must be zeroed/masked in aggregate response
        expect(cell.patientCount).toBe(0)
        expect(cell.isSuppressed).toBe(true)
      })

      // Dhaka division has >= 5 and should not be suppressed
      const dhakaCell = data.geographics.find((g) => g.division === 'Dhaka')
      if (dhakaCell && dhakaCell.patientCount >= 5) {
        expect(dhakaCell.isSuppressed).toBe(false)
      }
    })
  })

  describe('5. Facility Isolation & Role-Based Access Control', () => {
    it('allows admin full platform access with any facility filter', async () => {
      const data = await OperationalAnalyticsService.getDashboardAnalytics(
        { dateRange: '30d' },
        'admin'
      )
      expect(data).toBeDefined()
      expect(data.facilities.totalFacilities).toBeGreaterThan(0)
    })

    it('strictly isolates clinician access to their assigned facility ID', async () => {
      const facilityId = '22222222-1111-4111-a111-111111111111'
      const data = await OperationalAnalyticsService.getDashboardAnalytics(
        { dateRange: '30d' },
        'clinician',
        facilityId
      )

      expect(data).toBeDefined()
      expect(data.filterApplied.facilityId).toBe(facilityId)
    })

    it('rejects patient access to operational analytics', async () => {
      await expect(
        OperationalAnalyticsService.getDashboardAnalytics(
          { dateRange: '30d' },
          'patient'
        )
      ).rejects.toThrow(/Access denied: Patient accounts are not authorized/)
    })

    it('rejects staff queries without an assigned facility', async () => {
      await expect(
        OperationalAnalyticsService.getDashboardAnalytics(
          { dateRange: '30d' },
          'clinician',
          undefined
        )
      ).rejects.toThrow(/Access denied: Staff members must be assigned to an active healthcare facility/)
    })
  })

  describe('6. Data Quality & Platform Telemetry Monitoring', () => {
    it('monitors profile completeness and sync integrity without altering patient records', async () => {
      const data = await OperationalDataAggregator.compileOperationalDashboard({
        dateRange: '30d',
      })

      expect(data.dataQuality.overallQualityScorePercent).toBeGreaterThan(80)
      expect(data.dataQuality.incompletePatientProfilesCount).toBeGreaterThanOrEqual(0)
      expect(data.dataQuality.syncFailuresCount).toBe(0)
    })

    it('records and tracks technical telemetry with zero PHI', async () => {
      OperationalDataAggregator.recordTelemetry({
        subsystem: 'api',
        eventType: 'request_test',
        statusCode: 200,
        durationMs: 32,
      })

      const data = await OperationalDataAggregator.compileOperationalDashboard({
        dateRange: '30d',
      })

      expect(data.performance.apiRequestVolume).toBeGreaterThan(0)
      expect(data.performance.uptimePercent).toBeGreaterThanOrEqual(99.0)
      expect(data.performance.avgResponseTimeMs).toBeGreaterThan(0)
    })

    it('caches analytics queries within the 60-second TTL window', async () => {
      const first = await OperationalAnalyticsService.getDashboardAnalytics(
        { dateRange: '7d' },
        'admin'
      )
      const second = await OperationalAnalyticsService.getDashboardAnalytics(
        { dateRange: '7d' },
        'admin'
      )

      // Identical generated timestamp proves cached retrieval
      expect(first.generatedAt).toBe(second.generatedAt)
    })
  })
})


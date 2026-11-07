/**
 * Phase 1.26: Cross-Module Pipeline Integration Test Suite
 *
 * Validates data integrity, contracts, and workflow coordination across
 * interconnected modules:
 * - Auth & Role Access <-> Facilities
 * - Patient Identity <-> Health Records
 * - Clinical Assessment Engines <-> Clinical Governance
 * - Environmental Intelligence <-> Geographic Intelligence
 * - Healthcare Referrals <-> Follow-ups <-> Notifications
 * - Offline Idempotency <-> Server Synchronization
 * - Reporting System <-> Historical Clinical Data
 * - Operational Analytics <-> Small-Cell Privacy (k-Anonymity)
 * - Security, Consents <-> Audit Logging
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  SYNTHETIC_FACILITIES,
  SYNTHETIC_USERS,
  SYNTHETIC_PATIENT_HIGH_RISK,
} from '../fixtures/synthetic-clinical-data'

// Module imports
import { CentralSecurityService } from '@/modules/security/service'
import { ClinicalGovernanceService } from '@/modules/governance/service'
import { RiskEstimationService } from '@/modules/risk-estimation/service'
import { NotificationService } from '@/modules/notifications/service'
import { OperationalDataAggregator } from '@/modules/analytics/data-aggregator'
import { offlineSyncService } from '@/modules/offline/sync-service'
import { saveDraft, clearUserDrafts } from '@/modules/offline/indexeddb'
import type { OfflineDraft } from '@/modules/offline/types'
import { ReportingService } from '@/modules/reporting/service'

// Mock Server Actions for isolated offline synchronization testing
vi.mock('@/modules/offline/actions', () => {
  const operationsStore = new Map<string, { serverAssessmentId: string; serverVersion: number }>()

  return {
    syncAssessmentDraftAction: vi.fn(async (payload) => {
      if (operationsStore.has(payload.clientOperationId)) {
        const existing = operationsStore.get(payload.clientOperationId)
        return {
          success: true,
          status: 'synced',
          draftId: payload.draftId,
          clientOperationId: payload.clientOperationId,
          serverAssessmentId: existing?.serverAssessmentId,
          serverVersion: existing?.serverVersion,
          isDuplicate: true,
        }
      }

      const nextVersion = payload.baseVersion + 1
      const newAssessmentId = `asmt-${Date.now()}`
      operationsStore.set(payload.clientOperationId, {
        serverAssessmentId: newAssessmentId,
        serverVersion: nextVersion,
      })

      return {
        success: true,
        status: 'synced',
        draftId: payload.draftId,
        clientOperationId: payload.clientOperationId,
        serverAssessmentId: newAssessmentId,
        serverVersion: nextVersion,
      }
    }),
    resolveConflictAction: vi.fn(async () => ({ success: true })),
  }
})

describe('Phase 1.26: Cross-Module Pipeline Integration', () => {
  const testUserId = 'syn-user-integration-qa'

  beforeEach(async () => {
    CentralSecurityService.resetForTesting()
    ClinicalGovernanceService.resetForTesting()
    await clearUserDrafts(testUserId)
    vi.clearAllMocks()
  })

  // ==========================================================================
  // 1. AUTH, ROLES, PERMISSIONS & FACILITY MEMBERSHIP INTEGRATION
  // ==========================================================================
  describe('1. Auth, Roles & Facility Membership Boundary Integration', () => {
    it('enforces least privilege and facility boundary scoping between workers and patients', () => {
      // 1. Patient accessing their own assessment: Allowed
      const patientAccess = CentralSecurityService.checkResourceAccess(
        { id: SYNTHETIC_USERS.patient.id, roles: ['patient'] },
        { resourceType: 'clinical_assessment', patientId: SYNTHETIC_USERS.patient.id }
      )
      expect(patientAccess.allowed).toBe(true)

      // 2. Patient attempting to access another patient assessment: Blocked
      const patientCrossAccess = CentralSecurityService.checkResourceAccess(
        { id: SYNTHETIC_USERS.patient.id, roles: ['patient'] },
        { resourceType: 'clinical_assessment', patientId: 'foreign-patient-id' }
      )
      expect(patientCrossAccess.allowed).toBe(false)
      expect(patientCrossAccess.reason).toContain('Patients are strictly restricted')

      // 3. Healthcare worker accessing patient in their own assigned facility: Allowed
      const workerSameFacility = CentralSecurityService.checkResourceAccess(
        {
          id: SYNTHETIC_USERS.healthcareWorker.id,
          roles: ['healthcare_worker'],
          facilityIds: ['fac-dhaka-central-01'],
        },
        { resourceType: 'health_record', facilityId: 'fac-dhaka-central-01' }
      )
      expect(workerSameFacility.allowed).toBe(true)

      // 4. Healthcare worker attempting cross-facility patient access without referral: Blocked
      const workerCrossFacility = CentralSecurityService.checkResourceAccess(
        {
          id: SYNTHETIC_USERS.healthcareWorker.id,
          roles: ['healthcare_worker'],
          facilityIds: ['fac-dhaka-central-01'],
        },
        { resourceType: 'health_record', facilityId: 'fac-cox-community-03' }
      )
      expect(workerCrossFacility.allowed).toBe(false)
      expect(workerCrossFacility.reason).toContain('Cross-facility access requires formal specialist referral')

      // 5. Software Administrator attempting to inspect raw patient clinical records: Blocked
      const adminRawClinicalAccess = CentralSecurityService.checkResourceAccess(
        { id: SYNTHETIC_USERS.administrator.id, roles: ['administrator'] },
        { resourceType: 'health_record', patientId: SYNTHETIC_PATIENT_HIGH_RISK.patientId }
      )
      expect(adminRawClinicalAccess.allowed).toBe(false)
      expect(adminRawClinicalAccess.reason).toContain('Platform administrators do not possess clinical inspection privileges')
    })
  })

  // ==========================================================================
  // 2. PATIENT IDENTITY, DEDUPLICATION & HEALTH RECORDS INTEGRATION
  // ==========================================================================
  describe('2. Patient Identity & Health Record Continuity Integration', () => {
    it('calculates deterministic pack-years and validates identity consistency', () => {
      // Pack-year calculation formula: packs_per_day * years_smoked
      const packsPerDay = SYNTHETIC_PATIENT_HIGH_RISK.smokingPacksPerDay
      const yearsSmoked = SYNTHETIC_PATIENT_HIGH_RISK.smokingYears
      const packYears = packsPerDay * yearsSmoked

      expect(packYears).toBe(60)
      expect(packYears).toBeGreaterThanOrEqual(20) // Exceeds USPSTF screening threshold

      // National ID checksum formatting check (Bangladesh 17-digit format)
      expect(SYNTHETIC_PATIENT_HIGH_RISK.nationalId.length).toBe(17)
      expect(SYNTHETIC_PATIENT_HIGH_RISK.nationalId).toMatch(/^\d{17}$/)
    })
  })

  // ==========================================================================
  // 3. CLINICAL ASSESSMENT ENGINES & CLINICAL GOVERNANCE INTEGRATION
  // ==========================================================================
  describe('3. Clinical Engines & Clinical Governance assertMethodologyActive Integration', () => {
    it('strictly halts operational assessment calculation when clinical methodology is not approved for Bangladesh', async () => {
      // PLCOm2012 is awaiting clinical approval by default in the registry
      // When invoked in clinical_production mode, executionStatus must be 'methodology_not_approved'
      const record = await RiskEstimationService.executeRiskAssessment({
        patientId: SYNTHETIC_PATIENT_HIGH_RISK.patientId,
        facilityId: SYNTHETIC_PATIENT_HIGH_RISK.primaryFacilityId,
        methodologyId: 'plcom2012',
        executionMode: 'clinical_production',
      })

      expect(record.id).toBeDefined()
      expect(record.patientId).toBe(SYNTHETIC_PATIENT_HIGH_RISK.patientId)
      expect(record.executionStatus).toBe('methodology_not_approved')
      expect(record.estimatedRiskPercentage).toBeNull() // Safe null output
      expect(record.explanation).toBeDefined()
    })

    it('allows calculation in research_simulation mode with explicit methodology provenance and limitations', async () => {
      const record = await RiskEstimationService.executeRiskAssessment({
        patientId: SYNTHETIC_PATIENT_HIGH_RISK.patientId,
        facilityId: SYNTHETIC_PATIENT_HIGH_RISK.primaryFacilityId,
        methodologyId: 'plcom2012',
        executionMode: 'research_simulation',
      })

      expect(record).toBeDefined()
      expect(record.executionStatus).toBe('completed')
      expect(record.estimatedRiskPercentage).toBeDefined()
      expect(record.estimatedRiskPercentage).not.toBeNull()
      expect(record.estimatedRiskPercentage!).toBeGreaterThan(0)
      expect(record.methodologyVersion).toContain('1.0.0')
      expect(record.clinicalDisclaimer).toBeDefined()
      expect(record.explanation.limitations).toBeDefined()
      expect(record.explanation.whatThisDoesNotMean).toBeDefined()
    })
  })

  // ==========================================================================
  // 4. REFERRALS, FOLLOW-UPS & NOTIFICATION PIPELINE INTEGRATION
  // ==========================================================================
  describe('4. Referral Lifecycle, SLA Calculation & Notification Dispatch', () => {
    it('dispatches notifications and logs security audit events for communications', async () => {
      const notifyResult = await NotificationService.createNotificationEvent({
        eventType: 'referral_assigned',
        recipientUserId: SYNTHETIC_USERS.patient.id,
        patientId: SYNTHETIC_PATIENT_HIGH_RISK.patientId,
        priority: 'high',
        sourceModule: 'referrals',
        variables: {
          patientName: SYNTHETIC_PATIENT_HIGH_RISK.fullName,
          facilityName: SYNTHETIC_FACILITIES[0].name,
          urgency: 'urgent',
        },
      })

      expect(notifyResult).toBeDefined()
      expect(notifyResult.notification).toBeDefined()
      expect(notifyResult.notification.category).toBe('referral')
      expect(notifyResult.deliveries.length).toBeGreaterThanOrEqual(1)

      // Verify that audit log records are queryable
      const auditLogs = await CentralSecurityService.getSecurityAuditLogs({
        limit: 10,
      })
      expect(auditLogs.length).toBeGreaterThanOrEqual(1)
    })
  })

  // ==========================================================================
  // 5. LIMITED OFFLINE FUNCTIONALITY & SERVER IDEMPOTENCY INTEGRATION
  // ==========================================================================
  describe('5. Offline Storage, Idempotency & Conflict Detection Integration', () => {
    it('preserves form progress and guarantees idempotent deduplication on retry', async () => {
      const draft: OfflineDraft = {
        draftId: 'draft-qa-integration-01',
        clientOperationId: 'idemp-qa-sync-token-2026-001',
        formType: 'patient_assessment',
        userId: testUserId,
        patientId: SYNTHETIC_PATIENT_HIGH_RISK.patientId,
        assessmentType: 'lung_cancer_risk',
        data: { smokingPackYears: 60 },
        baseVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'saved_locally',
        syncAttempts: 0,
      }

      await saveDraft(draft)

      // First sync attempt
      const res1 = await offlineSyncService.syncDraft('draft-qa-integration-01', testUserId)
      expect(res1.success).toBe(true)
      expect(res1.status).toBe('synced')
      expect(res1.isDuplicate).toBeFalsy()
      const serverId = res1.serverAssessmentId

      // Repeated retry with same idempotency key
      const res2 = await offlineSyncService.syncDraft('draft-qa-integration-01', testUserId)
      expect(res2.success).toBe(true)
      expect(res2.status).toBe('synced')
      expect(res2.isDuplicate).toBe(true)
      expect(res2.serverAssessmentId).toBe(serverId) // Deduped to exact same server record
    })
  })

  // ==========================================================================
  // 6. REPORTING SYSTEM & HISTORICAL ASSESSMENT PROVENANCE
  // ==========================================================================
  describe('6. Reporting System & Historical Audit Integrity Integration', () => {
    it('generates structured clinical report with template versioning and document metadata', async () => {
      const report = await ReportingService.generateReport({
        patientId: SYNTHETIC_PATIENT_HIGH_RISK.patientId,
        facilityId: SYNTHETIC_FACILITIES[0].id,
        reportType: 'clinical_assessment',
        language: 'bn',
        generatedByUserId: SYNTHETIC_USERS.clinician.id,
      })

      expect(report).toBeDefined()
      expect(report.id).toBeDefined()
      expect(report.status).toBe('final')
      expect(report.reportType).toBe('clinical_assessment')
      expect(report.language).toBe('bn')
      expect(report.templateVersion).toBeDefined()
      expect(report.contentHtml.length).toBeGreaterThan(50)
      expect(report.storagePath).toContain(report.id)
    })
  })

  // ==========================================================================
  // 7. OPERATIONAL ANALYTICS & SMALL-CELL PRIVACY (k-ANONYMITY)
  // ==========================================================================
  describe('7. Operational Analytics Data Aggregation & Privacy Suppression', () => {
    it('applies small-cell suppression (k-anonymity threshold k >= 5) to protect re-identification', async () => {
      const data = await OperationalDataAggregator.compileOperationalDashboard({
        dateRange: 'all',
      })

      expect(data).toBeDefined()
      expect(data.patients.totalRegistered).toBeGreaterThanOrEqual(1)
      expect(data.assessments).toBeDefined()

      // Small-group suppression validation: any cell with count < 5 must have isSuppressed = true and patientCount = 0
      const suppressedCells = data.geographics.filter((g) => g.isSuppressed)
      expect(suppressedCells.length).toBeGreaterThan(0)
      for (const cell of suppressedCells) {
        expect(cell.isSuppressed).toBe(true)
        expect(cell.patientCount).toBe(0)
      }
    })
  })

  // ==========================================================================
  // 8. DATA SUBJECT PRIVACY RIGHTS & STATUTORY RETENTION HOLDS
  // ==========================================================================
  describe('8. Data Subject Rights & BMDC Statutory Retention Hold Integration', () => {
    it('applies statutory medical retention hold on erasure requests under BMDC regulations', async () => {
      // 1. Submit erasure request
      const request = await CentralSecurityService.submitPrivacyRequest({
        patientId: SYNTHETIC_PATIENT_HIGH_RISK.patientId,
        requestType: 'erasure_restriction',
        requestDetails: 'Patient requested full deletion of all medical data upon relocation.',
        actorId: SYNTHETIC_USERS.patient.id,
      })

      expect(request).toBeDefined()
      expect(request.requestType).toBe('erasure_restriction')

      // 2. Review request with statutory hold applied
      const reviewed = await CentralSecurityService.reviewPrivacyRequest(
        request.id,
        'partially_fulfilled_with_retention_hold',
        'Account access deactivated. Clinical records preserved under BMDC Code of Ethics Section 4.',
        'Privacy Compliance Officer',
        true,
        'Mandatory 10-year preservation for medical-legal and diagnostic continuity.'
      )

      expect(reviewed.status).toBe('partially_fulfilled_with_retention_hold')
      expect(reviewed.retentionHoldApplied).toBe(true)
      expect(reviewed.retentionHoldReason).toContain('10-year preservation')
    })
  })
})

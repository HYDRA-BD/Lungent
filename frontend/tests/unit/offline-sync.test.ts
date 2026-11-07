/**
 * Phase 1.21 — Offline Synchronization & Idempotency Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { connectivityMonitor } from '@/modules/offline/connectivity'
import { offlineSyncService } from '@/modules/offline/sync-service'
import {
  saveDraft,
  clearUserDrafts,
  getDraft,
} from '@/modules/offline/indexeddb'
import type { OfflineDraft } from '@/modules/offline/types'

// Mock Server Actions for isolated offline testing
vi.mock('@/modules/offline/actions', () => {
  const operationsStore = new Map<string, { serverAssessmentId: string; serverVersion: number }>()
  const serverAssessments = new Map<string, { version: number; data: unknown }>()

  return {
    syncAssessmentDraftAction: vi.fn(async (payload) => {
      // 1. Idempotency Check
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

      // 2. Conflict Check
      const serverKey = `${payload.patientId || 'anon'}_${payload.assessmentType}`
      const currentServer = serverAssessments.get(serverKey)

      if (currentServer && currentServer.version > payload.baseVersion) {
        return {
          success: false,
          status: 'conflict_detected',
          draftId: payload.draftId,
          clientOperationId: payload.clientOperationId,
          serverVersion: currentServer.version,
          conflictDetails: {
            serverVersion: currentServer.version,
            serverUpdatedAt: new Date().toISOString(),
            serverData: currentServer.data,
            clientData: payload.data,
            conflictingFields: ['assessment_version', 'intake_responses'],
            detectedAt: new Date().toISOString(),
          },
          error: 'A newer version of this assessment was updated on the server.',
        }
      }

      // 3. Normal Server Ingestion
      const nextVersion = payload.baseVersion + 1
      const newAssessmentId = `asmt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`

      serverAssessments.set(serverKey, {
        version: nextVersion,
        data: payload.data,
      })

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

    resolveConflictAction: vi.fn(async () => {
      return { success: true }
    }),
  }
})

describe('Phase 1.21: Offline Synchronization & Idempotency Architecture', () => {
  const testUserId = 'user-sync-test-uuid'

  beforeEach(async () => {
    await clearUserDrafts(testUserId)
    vi.clearAllMocks()
  })

  describe('1. Connectivity Monitor & Event Subscription', () => {
    it('reports current connectivity state and supports listener subscription', () => {
      const state = connectivityMonitor.getState()
      expect(typeof state.isOnline).toBe('boolean')
      expect(state.lastCheckedAt).toBeDefined()

      const mockListener = vi.fn()
      const unsubscribe = connectivityMonitor.subscribe(mockListener)

      expect(mockListener).toHaveBeenCalledWith(
        expect.objectContaining({ isOnline: expect.any(Boolean) })
      )

      unsubscribe()
    })
  })

  describe('2. Idempotency & Duplicate Prevention', () => {
    it('guarantees identical clientOperationId does not create duplicate server records on retry', async () => {
      const draft: OfflineDraft = {
        draftId: 'draft-idempotency-test',
        clientOperationId: 'idempotent-key-unique-12345',
        formType: 'patient_assessment',
        userId: testUserId,
        patientId: 'patient-test-uuid',
        assessmentType: 'lung_cancer_risk',
        data: { smokingPackYears: 35 },
        baseVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'saved_locally',
        syncAttempts: 0,
      }

      await saveDraft(draft)

      // First sync attempt
      const res1 = await offlineSyncService.syncDraft('draft-idempotency-test', testUserId)
      expect(res1.success).toBe(true)
      expect(res1.status).toBe('synced')
      expect(res1.isDuplicate).toBeFalsy()
      const serverId = res1.serverAssessmentId

      // Repeated retry (e.g. user clicks sync repeatedly or interrupted response reconnects)
      const res2 = await offlineSyncService.syncDraft('draft-idempotency-test', testUserId)
      expect(res2.success).toBe(true)
      expect(res2.status).toBe('synced')
      expect(res2.isDuplicate).toBe(true)
      expect(res2.serverAssessmentId).toBe(serverId) // Preserved identical server record!
    })
  })

  describe('3. Concurrency Conflict Detection', () => {
    it('detects conflicting server changes when local draft is based on an outdated version', async () => {
      const patientId = 'patient-conflict-target'

      // Step 1: Initial draft synced successfully
      const draftInitial: OfflineDraft = {
        draftId: 'draft-concurrent-initial',
        clientOperationId: 'op-init-01',
        formType: 'patient_assessment',
        userId: testUserId,
        patientId,
        assessmentType: 'symptom_triage',
        data: { coughWeeks: 2 },
        baseVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'saved_locally',
        syncAttempts: 0,
      }
      await saveDraft(draftInitial)
      const resInitial = await offlineSyncService.syncDraft('draft-concurrent-initial', testUserId)
      expect(resInitial.status).toBe('synced')
      expect(resInitial.serverVersion).toBe(2)

      // Step 2: Another client/clinician updates the assessment on server to version 3
      const { syncAssessmentDraftAction } = await import('@/modules/offline/actions')
      await syncAssessmentDraftAction({
        clientOperationId: 'op-concurrent-clinician-update',
        draftId: 'draft-clinician',
        formType: 'patient_assessment',
        userId: 'clinician-uuid',
        patientId,
        assessmentType: 'symptom_triage',
        data: { coughWeeks: 4, hemoptysis: true },
        baseVersion: 2,
        clientCreatedAt: new Date().toISOString(),
        clientUpdatedAt: new Date().toISOString(),
      })

      // Step 3: Local offline draft created earlier (based on baseVersion 1) attempts sync
      const staleDraft: OfflineDraft = {
        draftId: 'draft-stale-local',
        clientOperationId: 'op-stale-01',
        formType: 'patient_assessment',
        userId: testUserId,
        patientId,
        assessmentType: 'symptom_triage',
        data: { coughWeeks: 1 },
        baseVersion: 1, // Stale!
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'saved_locally',
        syncAttempts: 0,
      }
      await saveDraft(staleDraft)

      const conflictRes = await offlineSyncService.syncDraft('draft-stale-local', testUserId)
      expect(conflictRes.success).toBe(false)
      expect(conflictRes.status).toBe('conflict_detected')
      expect(conflictRes.conflictDetails).toBeDefined()
      expect(conflictRes.conflictDetails?.serverVersion).toBe(3)

      const updatedLocalDraft = await getDraft('draft-stale-local', testUserId)
      expect(updatedLocalDraft?.syncStatus).toBe('conflict_detected')
    })
  })

  describe('4. Batch Synchronization Orchestration', () => {
    it('processes all eligible pending drafts sequentially for the active user', async () => {
      const draft1: OfflineDraft = {
        draftId: 'draft-batch-1',
        clientOperationId: 'op-batch-1',
        formType: 'patient_assessment',
        userId: testUserId,
        assessmentType: 'lung_cancer_risk',
        data: { step: 1 },
        baseVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'saved_locally',
        syncAttempts: 0,
      }

      const draft2: OfflineDraft = {
        draftId: 'draft-batch-2',
        clientOperationId: 'op-batch-2',
        formType: 'patient_assessment',
        userId: testUserId,
        assessmentType: 'screening_eligibility',
        data: { step: 2 },
        baseVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'waiting_to_sync',
        syncAttempts: 0,
      }

      await saveDraft(draft1)
      await saveDraft(draft2)

      const results = await offlineSyncService.syncAllPending(testUserId)
      expect(results.length).toBe(2)
      expect(results.every((r) => r.status === 'synced')).toBe(true)

      const d1 = await getDraft('draft-batch-1', testUserId)
      const d2 = await getDraft('draft-batch-2', testUserId)
      expect(d1?.syncStatus).toBe('synced')
      expect(d2?.syncStatus).toBe('synced')
    })
  })
})

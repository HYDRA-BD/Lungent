/**
 * Client-Side Offline Synchronization Service
 * Phase 1.21 — Limited Offline Functionality
 *
 * Coordinates draft queueing, automatic online synchronization, retry handling,
 * and conflict detection dispatch.
 */

import {
  getDraft,
  getDraftsByUser,
  updateDraftSyncStatus,
  saveDraft,
} from './indexeddb'
import { connectivityMonitor } from './connectivity'
import { syncAssessmentDraftAction } from './actions'
import type { SyncResponse } from './types'

type SyncListener = (draftId: string, response: SyncResponse) => void

class OfflineSyncService {
  private isSyncing = false
  private listeners: Set<SyncListener> = new Set()
  private activeUserId: string | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      connectivityMonitor.subscribe((state) => {
        if (state.isBackendReachable && this.activeUserId) {
          this.syncAllPending(this.activeUserId).catch(() => {
            // Ignore background sync errors
          })
        }
      })
    }
  }

  public setActiveUser(userId: string | null) {
    this.activeUserId = userId
    if (userId && connectivityMonitor.getState().isBackendReachable) {
      this.syncAllPending(userId).catch(() => {})
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * Synchronizes a single draft by ID.
   */
  public async syncDraft<T extends Record<string, unknown> = Record<string, unknown>>(
    draftId: string,
    userId: string
  ): Promise<SyncResponse<T>> {
    const draft = await getDraft<T>(draftId, userId)
    if (!draft) {
      return {
        success: false,
        status: 'sync_failed',
        draftId,
        clientOperationId: '',
        error: 'Draft not found or access unauthorized.',
      }
    }

    // Set status to synchronizing
    await updateDraftSyncStatus(draftId, 'synchronizing')

    try {
      const response = await syncAssessmentDraftAction({
        clientOperationId: draft.clientOperationId,
        draftId: draft.draftId,
        formType: draft.formType,
        userId: draft.userId,
        patientId: draft.patientId,
        facilityId: draft.facilityId,
        assessmentType: draft.assessmentType,
        data: draft.data,
        baseVersion: draft.baseVersion,
        clientCreatedAt: draft.createdAt,
        clientUpdatedAt: draft.updatedAt,
      })

      if (response.success && response.status === 'synced') {
        draft.syncStatus = 'synced'
        draft.baseVersion = response.serverVersion || draft.baseVersion + 1
        draft.conflictDetails = undefined
        draft.syncError = undefined
        await saveDraft(draft)
      } else if (response.status === 'conflict_detected') {
        await updateDraftSyncStatus(
          draftId,
          'conflict_detected',
          response.error,
          response.conflictDetails
        )
      } else if (response.status === 'auth_required') {
        await updateDraftSyncStatus(draftId, 'auth_required', response.error)
      } else {
        await updateDraftSyncStatus(draftId, 'sync_failed', response.error)
      }

      this.notify(draftId, response as SyncResponse)
      return response as SyncResponse<T>
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error during sync'
      await updateDraftSyncStatus(draftId, 'sync_failed', errorMsg)

      const failResponse: SyncResponse<T> = {
        success: false,
        status: 'sync_failed',
        draftId,
        clientOperationId: draft.clientOperationId,
        error: errorMsg,
      }
      this.notify(draftId, failResponse as SyncResponse)
      return failResponse
    }
  }

  /**
   * Synchronizes all eligible drafts for a user.
   */
  public async syncAllPending(userId: string): Promise<SyncResponse[]> {
    if (this.isSyncing) return []
    this.isSyncing = true

    try {
      const drafts = await getDraftsByUser(userId)
      const eligible = drafts.filter(
        (d) =>
          d.syncStatus === 'waiting_to_sync' ||
          d.syncStatus === 'sync_failed' ||
          d.syncStatus === 'saved_locally'
      )

      const results: SyncResponse[] = []
      for (const draft of eligible) {
        const res = await this.syncDraft(draft.draftId, userId)
        results.push(res)
      }
      return results
    } finally {
      this.isSyncing = false
    }
  }

  private notify(draftId: string, response: SyncResponse) {
    for (const listener of this.listeners) {
      try {
        listener(draftId, response)
      } catch {
        // Ignore listener exceptions
      }
    }
  }
}

export const offlineSyncService = new OfflineSyncService()

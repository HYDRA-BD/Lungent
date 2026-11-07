'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  saveDraft,
  getDraft,
  deleteDraft,
  updateDraftSyncStatus,
} from './indexeddb'
import { offlineSyncService } from './sync-service'
import type {
  OfflineDraft,
  OfflineSyncStatus,
  OfflineFormType,
  ConflictDetails,
  SyncResponse,
} from './types'

interface UseOfflineFormOptions<T> {
  formType: OfflineFormType
  userId: string
  patientId?: string
  facilityId?: string
  assessmentType: string
  customDraftId?: string
  initialData?: T
  debounceMs?: number
  autoRestore?: boolean
  onRestore?: (savedData: T) => void
}

export function useOfflineForm<T extends Record<string, unknown>>({
  formType,
  userId,
  patientId,
  facilityId,
  assessmentType,
  customDraftId,
  debounceMs = 1000,
  autoRestore = true,
  onRestore,
}: UseOfflineFormOptions<T>) {
  // Stable draft and operation IDs initialized in state
  const [draftId] = useState<string>(
    () => customDraftId || `draft_${formType}_${patientId || 'anon'}_${assessmentType}`
  )
  const [clientOperationId] = useState<string>(
    () => `op_${customDraftId || `draft_${formType}_${patientId || 'anon'}_${assessmentType}`}_init`
  )

  const [syncStatus, setSyncStatus] = useState<OfflineSyncStatus>('saved_locally')
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [conflictDetails, setConflictDetails] = useState<ConflictDetails<T> | undefined>()
  const [syncError, setSyncError] = useState<string | undefined>()
  const [isSaving, setIsSaving] = useState(false)
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false)

  const lastSavedJsonRef = useRef<string>('')
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const baseVersionRef = useRef<number>(1)

  // Configure active user in sync service
  useEffect(() => {
    offlineSyncService.setActiveUser(userId)
  }, [userId])

  // Subscribe to sync results for this draft
  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribe((dId, response) => {
      if (dId === draftId) {
        setSyncStatus(response.status)
        if (response.conflictDetails) {
          setConflictDetails(response.conflictDetails as ConflictDetails<T>)
        }
        if (response.error) {
          setSyncError(response.error)
        }
        if (response.status === 'synced') {
          setConflictDetails(undefined)
          setSyncError(undefined)
        }
      }
    })
    return unsubscribe
  }, [draftId])

  // Auto-restore draft on mount
  useEffect(() => {
    if (!autoRestore) return

    let isMounted = true
    async function loadExistingDraft() {
      try {
        const existing = await getDraft<T>(draftId, userId)
        if (existing && isMounted) {
          baseVersionRef.current = existing.baseVersion
          setSyncStatus(existing.syncStatus)
          setLastSavedAt(existing.updatedAt)
          setConflictDetails(existing.conflictDetails)
          setSyncError(existing.syncError)
          lastSavedJsonRef.current = JSON.stringify(existing.data)

          if (onRestore) {
            onRestore(existing.data)
          }
          setHasRestoredDraft(true)
        }
      } catch {
        // Failed safe
      }
    }

    loadExistingDraft()
    return () => {
      isMounted = false
    }
  }, [autoRestore, draftId, userId, onRestore])

  /**
   * Save form data locally with debouncing and dirty-checking.
   */
  const saveLocalDraft = useCallback(
    (formData: T) => {
      const json = JSON.stringify(formData)
      if (json === lastSavedJsonRef.current) {
        return // Unchanged, avoid repeated writes
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      setIsSaving(true)

      debounceTimerRef.current = setTimeout(async () => {
        try {
          const now = new Date().toISOString()
          const draftRecord: OfflineDraft<T> = {
            draftId,
            clientOperationId,
            formType,
            userId,
            patientId,
            facilityId,
            assessmentType,
            data: formData,
            baseVersion: baseVersionRef.current,
            createdAt: lastSavedAt || now,
            updatedAt: now,
            syncStatus: 'saved_locally',
            syncAttempts: 0,
          }

          await saveDraft(draftRecord)
          lastSavedJsonRef.current = json
          setLastSavedAt(now)
          setSyncStatus('saved_locally')
          setIsSaving(false)
        } catch {
          setSyncStatus('storage_unavailable')
          setIsSaving(false)
        }
      }, debounceMs)
    },
    [draftId, clientOperationId, formType, userId, patientId, facilityId, assessmentType, lastSavedAt, debounceMs]
  )

  /**
   * Discards the local draft.
   */
  const discardDraft = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    await deleteDraft(draftId)
    lastSavedJsonRef.current = ''
    setLastSavedAt(null)
    setConflictDetails(undefined)
    setSyncError(undefined)
    setHasRestoredDraft(false)
  }, [draftId])

  /**
   * Triggers manual synchronization with backend.
   */
  const triggerSync = useCallback(async (): Promise<SyncResponse<T>> => {
    setSyncStatus('waiting_to_sync')
    await updateDraftSyncStatus(draftId, 'waiting_to_sync')
    return offlineSyncService.syncDraft<T>(draftId, userId)
  }, [draftId, userId])

  return useMemo(
    () => ({
      draftId,
      clientOperationId,
      syncStatus,
      isSaving,
      lastSavedAt,
      conflictDetails,
      syncError,
      hasRestoredDraft,
      saveLocalDraft,
      discardDraft,
      triggerSync,
    }),
    [
      draftId,
      clientOperationId,
      syncStatus,
      isSaving,
      lastSavedAt,
      conflictDetails,
      syncError,
      hasRestoredDraft,
      saveLocalDraft,
      discardDraft,
      triggerSync,
    ]
  )
}

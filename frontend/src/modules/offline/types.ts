/**
 * Lungent Offline Capability Types
 * Phase 1.21 — Limited Offline Functionality
 */

export type OfflineSyncStatus =
  | 'saved_locally'
  | 'waiting_to_sync'
  | 'synchronizing'
  | 'synced'
  | 'sync_failed'
  | 'conflict_detected'
  | 'auth_required'
  | 'storage_unavailable'

export type OfflineFormType =
  | 'self_check'
  | 'patient_assessment'
  | 'worker_assessment'

export interface ConflictDetails<T = Record<string, unknown>> {
  serverVersion: number
  serverUpdatedAt: string
  serverData: Partial<T>
  clientData: T
  conflictingFields: string[]
  detectedAt: string
}

export interface OfflineDraft<T = Record<string, unknown>> {
  draftId: string
  clientOperationId: string
  formType: OfflineFormType
  userId: string // user UUID or 'anonymous'
  patientId?: string
  facilityId?: string
  assessmentType: string
  data: T
  baseVersion: number
  createdAt: string
  updatedAt: string
  syncStatus: OfflineSyncStatus
  syncError?: string
  conflictDetails?: ConflictDetails<T>
  lastAttemptedSyncAt?: string
  syncAttempts: number
}

export type ConflictResolutionChoice = 'use_server' | 'use_client' | 'merge'

export interface ConflictResolution<T = Record<string, unknown>> {
  draftId: string
  clientOperationId: string
  choice: ConflictResolutionChoice
  resolvedData?: T
  resolutionNotes?: string
  resolvedByUserId: string
}

export interface SyncPayload<T = Record<string, unknown>> {
  clientOperationId: string
  draftId: string
  formType: OfflineFormType
  userId: string
  patientId?: string
  facilityId?: string
  assessmentType: string
  data: T
  baseVersion: number
  clientCreatedAt: string
  clientUpdatedAt: string
}

export interface SyncResponse<T = Record<string, unknown>> {
  success: boolean
  status: OfflineSyncStatus
  draftId: string
  clientOperationId: string
  serverAssessmentId?: string
  serverVersion?: number
  isDuplicate?: boolean
  error?: string
  conflictDetails?: ConflictDetails<T>
}

export interface ConnectivityState {
  isOnline: boolean
  isBackendReachable: boolean
  lastCheckedAt: string
  latencyMs?: number
}


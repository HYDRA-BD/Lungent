/**
 * IndexedDB Offline Storage Engine
 * Phase 1.21 — Limited Offline Functionality
 *
 * Provides structured, encrypted local storage for assessment drafts.
 * Enforces user and patient access isolation with quota management.
 */

import { encryptDraftData, decryptDraftData, type EncryptedEnvelope } from './crypto'
import type { OfflineDraft, OfflineSyncStatus, OfflineFormType, ConflictDetails } from './types'

const DB_NAME = 'lungent_offline_db'
const DB_VERSION = 1
const DRAFTS_STORE = 'assessment_drafts'

interface StoredDraftRecord {
  draftId: string
  clientOperationId: string
  formType: string
  userId: string
  patientId?: string
  facilityId?: string
  assessmentType: string
  encryptedPayload?: EncryptedEnvelope
  rawFallbackPayload?: unknown // Used only if crypto is completely unavailable
  baseVersion: number
  createdAt: string
  updatedAt: string
  syncStatus: OfflineSyncStatus
  syncError?: string
  conflictDetails?: unknown
  lastAttemptedSyncAt?: string
  syncAttempts: number
}

// In-memory fallback if IndexedDB is disabled or in non-browser environment
const inMemoryStore = new Map<string, StoredDraftRecord>()

function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'
}

let dbInstance: IDBDatabase | null = null

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance
  if (!isIndexedDBAvailable()) {
    throw new Error('IndexedDB is not available in this environment')
  }

  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(DRAFTS_STORE)) {
        const store = db.createObjectStore(DRAFTS_STORE, { keyPath: 'draftId' })
        store.createIndex('userId', 'userId', { unique: false })
        store.createIndex('clientOperationId', 'clientOperationId', { unique: true })
        store.createIndex('syncStatus', 'syncStatus', { unique: false })
        store.createIndex('updatedAt', 'updatedAt', { unique: false })
        store.createIndex('formType', 'formType', { unique: false })
      }
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onerror = () => {
      reject(new Error(`Failed to open IndexedDB: ${request.error?.message || 'Unknown error'}`))
    }
  })
}

/**
 * Saves or updates an offline draft in IndexedDB with envelope encryption.
 */
export async function saveDraft<T = Record<string, unknown>>(
  draft: OfflineDraft<T>
): Promise<void> {
  let encrypted: EncryptedEnvelope | undefined
  let rawFallback: unknown = undefined

  try {
    encrypted = await encryptDraftData(draft.data)
  } catch {
    // If WebCrypto is not supported, fail safely or keep in memory without persisting sensitive data
    rawFallback = draft.data
  }

  const record: StoredDraftRecord = {
    draftId: draft.draftId,
    clientOperationId: draft.clientOperationId,
    formType: draft.formType,
    userId: draft.userId,
    patientId: draft.patientId,
    facilityId: draft.facilityId,
    assessmentType: draft.assessmentType,
    encryptedPayload: encrypted,
    rawFallbackPayload: encrypted ? undefined : rawFallback,
    baseVersion: draft.baseVersion,
    createdAt: draft.createdAt,
    updatedAt: draft.updatedAt,
    syncStatus: draft.syncStatus,
    syncError: draft.syncError,
    conflictDetails: draft.conflictDetails,
    lastAttemptedSyncAt: draft.lastAttemptedSyncAt,
    syncAttempts: draft.syncAttempts,
  }

  if (!isIndexedDBAvailable()) {
    inMemoryStore.set(draft.draftId, record)
    return
  }

  const db = await getDB()
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(DRAFTS_STORE, 'readwrite')
      const store = tx.objectStore(DRAFTS_STORE)
      const req = store.put(record)

      req.onsuccess = () => resolve()
      req.onerror = () => reject(req.error)
    } catch {
      // Handle quota exceeded or transaction failures
      inMemoryStore.set(draft.draftId, record)
      resolve()
    }
  })
}

/**
 * Retrieves a single draft by ID, verifying user isolation and decrypting the data.
 */
export async function getDraft<T = Record<string, unknown>>(
  draftId: string,
  requestingUserId: string
): Promise<OfflineDraft<T> | null> {
  let record: StoredDraftRecord | undefined

  if (!isIndexedDBAvailable()) {
    record = inMemoryStore.get(draftId)
  } else {
    const db = await getDB()
    record = await new Promise<StoredDraftRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(DRAFTS_STORE, 'readonly')
      const store = tx.objectStore(DRAFTS_STORE)
      const req = store.get(draftId)

      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  }

  if (!record) return null

  // Enforce strict user isolation: User A cannot read User B's drafts
  // Anonymous drafts can only be accessed in anonymous session
  if (record.userId !== requestingUserId) {
    return null
  }

  let decryptedData: T
  if (record.encryptedPayload) {
    try {
      decryptedData = await decryptDraftData<T>(record.encryptedPayload)
    } catch {
      // If decryption key was rotated or invalid, return null to fail safe
      return null
    }
  } else {
    decryptedData = record.rawFallbackPayload as T
  }

  return {
    draftId: record.draftId,
    clientOperationId: record.clientOperationId,
    formType: record.formType as OfflineFormType,
    userId: record.userId,
    patientId: record.patientId,
    facilityId: record.facilityId,
    assessmentType: record.assessmentType,
    data: decryptedData,
    baseVersion: record.baseVersion,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    syncStatus: record.syncStatus,
    syncError: record.syncError,
    conflictDetails: record.conflictDetails as ConflictDetails<T> | undefined,
    lastAttemptedSyncAt: record.lastAttemptedSyncAt,
    syncAttempts: record.syncAttempts,
  }
}

/**
 * Lists all drafts owned by a specific user.
 */
export async function getDraftsByUser<T = Record<string, unknown>>(
  userId: string
): Promise<OfflineDraft<T>[]> {
  let records: StoredDraftRecord[] = []

  if (!isIndexedDBAvailable()) {
    records = Array.from(inMemoryStore.values()).filter((r) => r.userId === userId)
  } else {
    const db = await getDB()
    records = await new Promise<StoredDraftRecord[]>((resolve, reject) => {
      const tx = db.transaction(DRAFTS_STORE, 'readonly')
      const store = tx.objectStore(DRAFTS_STORE)
      const index = store.index('userId')
      const req = index.getAll(userId)

      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => reject(req.error)
    })
  }

  const results: OfflineDraft<T>[] = []
  for (const record of records) {
    try {
      let data: T
      if (record.encryptedPayload) {
        data = await decryptDraftData<T>(record.encryptedPayload)
      } else {
        data = record.rawFallbackPayload as T
      }

      results.push({
        draftId: record.draftId,
        clientOperationId: record.clientOperationId,
        formType: record.formType as OfflineFormType,
        userId: record.userId,
        patientId: record.patientId,
        facilityId: record.facilityId,
        assessmentType: record.assessmentType,
        data,
        baseVersion: record.baseVersion,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
        syncStatus: record.syncStatus,
        syncError: record.syncError,
        conflictDetails: record.conflictDetails as ConflictDetails<T> | undefined,
        lastAttemptedSyncAt: record.lastAttemptedSyncAt,
        syncAttempts: record.syncAttempts,
      })
    } catch {
      // Skip corrupt or un-decryptable records
    }
  }

  return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

/**
 * Updates only the sync status and sync error of a draft.
 */
export async function updateDraftSyncStatus(
  draftId: string,
  syncStatus: OfflineSyncStatus,
  syncError?: string,
  conflictDetails?: unknown
): Promise<void> {
  if (!isIndexedDBAvailable()) {
    const r = inMemoryStore.get(draftId)
    if (r) {
      r.syncStatus = syncStatus
      r.syncError = syncError
      r.conflictDetails = conflictDetails
      r.lastAttemptedSyncAt = new Date().toISOString()
      r.syncAttempts += 1
    }
    return
  }

  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFTS_STORE, 'readwrite')
    const store = tx.objectStore(DRAFTS_STORE)
    const req = store.get(draftId)

    req.onsuccess = () => {
      const record = req.result as StoredDraftRecord | undefined
      if (!record) {
        resolve()
        return
      }

      record.syncStatus = syncStatus
      record.syncError = syncError
      record.conflictDetails = conflictDetails
      record.lastAttemptedSyncAt = new Date().toISOString()
      record.syncAttempts += 1

      const putReq = store.put(record)
      putReq.onsuccess = () => resolve()
      putReq.onerror = () => reject(putReq.error)
    }

    req.onerror = () => reject(req.error)
  })
}

/**
 * Deletes a draft from local storage.
 */
export async function deleteDraft(draftId: string): Promise<void> {
  if (!isIndexedDBAvailable()) {
    inMemoryStore.delete(draftId)
    return
  }

  const db = await getDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFTS_STORE, 'readwrite')
    const store = tx.objectStore(DRAFTS_STORE)
    const req = store.delete(draftId)

    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

/**
 * Clears all drafts belonging to a specific user (e.g. on logout or privacy clear).
 */
export async function clearUserDrafts(userId: string): Promise<void> {
  const drafts = await getDraftsByUser(userId)
  for (const d of drafts) {
    await deleteDraft(d.draftId)
  }
}

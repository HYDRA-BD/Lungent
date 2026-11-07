/**
 * Phase 1.21 — Offline Storage & Data Protection Unit Tests
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  encryptDraftData,
  decryptDraftData,
  getOrCreateStorageKey,
} from '@/modules/offline/crypto'
import {
  saveDraft,
  getDraft,
  getDraftsByUser,
  updateDraftSyncStatus,
  deleteDraft,
  clearUserDrafts,
} from '@/modules/offline/indexeddb'
import type { OfflineDraft } from '@/modules/offline/types'

describe('Phase 1.21: Offline Storage & Encryption Architecture', () => {
  describe('1. Web Crypto Envelope Encryption', () => {
    it('generates a non-extractable AES-GCM 256-bit CryptoKey', async () => {
      const key = await getOrCreateStorageKey()
      expect(key).toBeDefined()
      expect(key.algorithm.name).toBe('AES-GCM')
      expect(key.extractable).toBe(false)
      expect(key.usages).toContain('encrypt')
      expect(key.usages).toContain('decrypt')
    })

    it('encrypts serializable assessment form data into an AES-GCM envelope with random IV', async () => {
      const sampleData = {
        ageRange: '55-59',
        smokingStatus: 'current',
        cigarettesPerDay: 20,
        smokingDurationYears: 30,
        symptoms: ['coughing_blood', 'chest_pain'],
      }

      const envelope1 = await encryptDraftData(sampleData)
      const envelope2 = await encryptDraftData(sampleData)

      expect(envelope1.algorithm).toBe('AES-GCM-256')
      expect(envelope1.iv).toBeDefined()
      expect(envelope1.ciphertext).toBeDefined()

      // Different IVs for identical plaintext guarantee semantic security
      expect(envelope1.iv).not.toBe(envelope2.iv)
      expect(envelope1.ciphertext).not.toBe(envelope2.ciphertext)
    })

    it('correctly decrypts ciphertext back into the original structured assessment object', async () => {
      const original = {
        patientId: 'LGT-2026-9871',
        assessmentType: 'lung_cancer_risk',
        exposureFactors: { biomassYears: 15, radon: false },
      }

      const envelope = await encryptDraftData(original)
      const decrypted = await decryptDraftData<typeof original>(envelope)

      expect(decrypted).toEqual(original)
    })

    it('fails safely and throws when attempting to decrypt corrupted ciphertext or tampered IV', async () => {
      const original = { note: 'Sensitive medical intake' }
      const envelope = await encryptDraftData(original)

      // Tamper ciphertext
      const corrupted = {
        ...envelope,
        ciphertext: envelope.ciphertext.slice(0, -4) + 'AAAA',
      }

      await expect(decryptDraftData(corrupted)).rejects.toThrow()
    })
  })

  describe('2. Structured Draft Storage & User Isolation', () => {
    const userA = 'user-auth-uuid-alice'
    const userB = 'user-auth-uuid-bob'

    beforeEach(async () => {
      await clearUserDrafts(userA)
      await clearUserDrafts(userB)
      await clearUserDrafts('anonymous')
    })

    it('saves and retrieves an encrypted offline draft for an authorized user', async () => {
      const draft: OfflineDraft<{ step: number; answered: string }> = {
        draftId: 'draft-alice-01',
        clientOperationId: 'op-alice-01-uuid',
        formType: 'patient_assessment',
        userId: userA,
        patientId: 'patient-alice',
        assessmentType: 'lung_cancer_risk',
        data: { step: 3, answered: 'biomass_fuel_yes' },
        baseVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'saved_locally',
        syncAttempts: 0,
      }

      await saveDraft(draft)

      const retrieved = await getDraft<typeof draft.data>('draft-alice-01', userA)
      expect(retrieved).toBeDefined()
      expect(retrieved?.draftId).toBe('draft-alice-01')
      expect(retrieved?.data.step).toBe(3)
      expect(retrieved?.data.answered).toBe('biomass_fuel_yes')
      expect(retrieved?.syncStatus).toBe('saved_locally')
    })

    it('strictly enforces user isolation: User B cannot access User A draft', async () => {
      const draftA: OfflineDraft<{ confidential: string }> = {
        draftId: 'draft-private-alice',
        clientOperationId: 'op-private-alice',
        formType: 'patient_assessment',
        userId: userA,
        patientId: 'patient-alice',
        assessmentType: 'symptom_triage',
        data: { confidential: 'Hemoptysis history' },
        baseVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'saved_locally',
        syncAttempts: 0,
      }

      await saveDraft(draftA)

      // Requesting as User B must return null
      const breachAttempt = await getDraft('draft-private-alice', userB)
      expect(breachAttempt).toBeNull()

      // Anonymous requester also must return null
      const anonBreach = await getDraft('draft-private-alice', 'anonymous')
      expect(anonBreach).toBeNull()
    })

    it('lists all drafts belonging exclusively to the requesting user in reverse chronological order', async () => {
      const draftA1: OfflineDraft<{ label: string }> = {
        draftId: 'draft-a1',
        clientOperationId: 'op-a1',
        formType: 'patient_assessment',
        userId: userA,
        assessmentType: 'lung_cancer_risk',
        data: { label: 'First' },
        baseVersion: 1,
        createdAt: new Date('2026-11-06T00:00:00Z').toISOString(),
        updatedAt: new Date('2026-11-06T00:00:00Z').toISOString(),
        syncStatus: 'saved_locally',
        syncAttempts: 0,
      }

      const draftA2: OfflineDraft<{ label: string }> = {
        draftId: 'draft-a2',
        clientOperationId: 'op-a2',
        formType: 'patient_assessment',
        userId: userA,
        assessmentType: 'screening_eligibility',
        data: { label: 'Second' },
        baseVersion: 1,
        createdAt: new Date('2026-11-06T01:00:00Z').toISOString(),
        updatedAt: new Date('2026-11-06T01:00:00Z').toISOString(),
        syncStatus: 'saved_locally',
        syncAttempts: 0,
      }

      const draftB: OfflineDraft<{ label: string }> = {
        draftId: 'draft-b',
        clientOperationId: 'op-b',
        formType: 'patient_assessment',
        userId: userB,
        assessmentType: 'symptom_triage',
        data: { label: 'BobDraft' },
        baseVersion: 1,
        createdAt: new Date('2026-11-06T00:30:00Z').toISOString(),
        updatedAt: new Date('2026-11-06T00:30:00Z').toISOString(),
        syncStatus: 'saved_locally',
        syncAttempts: 0,
      }

      await saveDraft(draftA1)
      await saveDraft(draftA2)
      await saveDraft(draftB)

      const aliceDrafts = await getDraftsByUser<{ label: string }>(userA)
      expect(aliceDrafts.length).toBe(2)
      expect(aliceDrafts[0].draftId).toBe('draft-a2') // newer
      expect(aliceDrafts[1].draftId).toBe('draft-a1')

      const bobDrafts = await getDraftsByUser<{ label: string }>(userB)
      expect(bobDrafts.length).toBe(1)
      expect(bobDrafts[0].draftId).toBe('draft-b')
    })

    it('updates synchronization status and increments retry attempts', async () => {
      const draft: OfflineDraft = {
        draftId: 'draft-sync-test',
        clientOperationId: 'op-sync-test',
        formType: 'patient_assessment',
        userId: userA,
        assessmentType: 'lung_cancer_risk',
        data: { test: true },
        baseVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'saved_locally',
        syncAttempts: 0,
      }

      await saveDraft(draft)

      await updateDraftSyncStatus('draft-sync-test', 'sync_failed', 'Timeout reaching Supabase API')

      const updated = await getDraft('draft-sync-test', userA)
      expect(updated?.syncStatus).toBe('sync_failed')
      expect(updated?.syncError).toBe('Timeout reaching Supabase API')
      expect(updated?.syncAttempts).toBe(1)
      expect(updated?.lastAttemptedSyncAt).toBeDefined()
    })

    it('deletes drafts and clears user drafts completely upon logout or user request', async () => {
      const draft: OfflineDraft = {
        draftId: 'draft-to-delete',
        clientOperationId: 'op-del',
        formType: 'patient_assessment',
        userId: userA,
        assessmentType: 'self_check',
        data: {},
        baseVersion: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        syncStatus: 'saved_locally',
        syncAttempts: 0,
      }

      await saveDraft(draft)
      expect(await getDraft('draft-to-delete', userA)).not.toBeNull()

      await deleteDraft('draft-to-delete')
      expect(await getDraft('draft-to-delete', userA)).toBeNull()

      // Test clearUserDrafts
      await saveDraft({ ...draft, draftId: 'd1' })
      await saveDraft({ ...draft, draftId: 'd2' })
      expect((await getDraftsByUser(userA)).length).toBe(2)

      await clearUserDrafts(userA)
      expect((await getDraftsByUser(userA)).length).toBe(0)
    })
  })
})

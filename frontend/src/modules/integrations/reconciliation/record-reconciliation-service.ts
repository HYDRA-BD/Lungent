/**
 * Phase 2.9: Diagnostic Record Reconciliation Service
 * Manages staging of inbound laboratory and radiology records, enforces the
 * Non-Diagnostic Invariant (external records do NOT autonomously alter risk scores or diagnoses),
 * and executes sovereign clinician reconciliation decisions with immutable audit trails.
 */

import type {
  StagedDiagnosticRecordItem,
  ReconciliationActionInput,
} from '../types'

export interface ReconciliationResult {
  success: boolean
  recordId: string
  decision: 'accept_imported' | 'retain_authoritative' | 'reject_imported'
  updatedRecord: StagedDiagnosticRecordItem
  auditEvent: {
    recordId: string
    reviewerId: string
    decision: string
    notes: string
    timestamp: string
  }
}

export class RecordReconciliationService {
  /**
   * Applies clinician reconciliation decision to a staged diagnostic record item
   */
  public reconcileRecord(
    record: StagedDiagnosticRecordItem,
    input: ReconciliationActionInput
  ): ReconciliationResult {
    if (!input.reviewerId || input.reviewerId.trim() === '') {
      throw new Error('Clinician reviewer ID is required for reconciliation')
    }

    if (!input.clinicianNotes || input.clinicianNotes.trim() === '') {
      throw new Error('Documented clinical justification is mandatory for reconciliation decisions')
    }

    const now = new Date().toISOString()
    const updated: StagedDiagnosticRecordItem = {
      ...record,
      reviewedBy: input.reviewerId,
      reviewedAt: now,
      clinicianActionNotes: input.clinicianNotes,
      reconciliationDecision: input.decision,
      clinicianReviewStatus:
        input.decision === 'accept_imported'
          ? 'verified'
          : input.decision === 'retain_authoritative'
            ? 'reconciled'
            : 'rejected',
      isSuppressedOrArchived: input.decision === 'reject_imported',
    }

    const auditEvent = {
      recordId: record.id,
      reviewerId: input.reviewerId,
      decision: input.decision,
      notes: input.clinicianNotes,
      timestamp: now,
    }

    return {
      success: true,
      recordId: record.id,
      decision: input.decision,
      updatedRecord: updated,
      auditEvent,
    }
  }

  /**
   * Evaluates non-diagnostic safety invariant:
   * Asserts that an unreviewed external diagnostic record cannot directly mutate
   * authoritative clinical parameters or risk determinations without explicit human review.
   */
  public verifyNonDiagnosticSafetyInvariant(record: StagedDiagnosticRecordItem): {
    canDirectlyInfluenceClinicalRisk: boolean
    safetyNotice: string
  } {
    const isVerified = record.clinicianReviewStatus === 'verified' && record.reconciliationDecision === 'accept_imported'

    return {
      canDirectlyInfluenceClinicalRisk: isVerified,
      safetyNotice: isVerified
        ? 'Record verified by licensed clinician and admitted to clinical record context.'
        : 'SAFETY NOTICE: This external diagnostic record is staged for clinical reference only. It has NOT been verified by an attending clinician and CANNOT autonomously alter patient risk assessment, screening eligibility, or clinical recommendations.',
    }
  }
}

export const defaultRecordReconciliationService = new RecordReconciliationService()


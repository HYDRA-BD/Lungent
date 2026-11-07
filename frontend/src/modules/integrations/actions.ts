'use server'

/**
 * Phase 2.9: Healthcare Integrations Server Actions
 * Next.js Server Actions for testing connection statuses, triggering data exchange,
 * and performing clinician diagnostic record reconciliation.
 */

import { defaultHealthcareIntegrationService } from './service'
import type {
  ReconciliationActionInput,
  StagedDiagnosticRecordItem,
} from './types'
import type { InboundPatientQuery, KnownPatientIdentityRecord } from './reconciliation/patient-identity-matcher'

export async function testHealthcareSystemConnectionAction(systemCode: string) {
  try {
    const result = await defaultHealthcareIntegrationService.testSystemConnection(systemCode)
    return { success: true, data: result }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to test system connection',
    }
  }
}

export async function getRegisteredHealthcareSystemsAction() {
  try {
    const systems = defaultHealthcareIntegrationService.getRegisteredSystems()
    return { success: true, data: systems }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve registered systems',
    }
  }
}

export async function executeDataExchangeAction(params: {
  systemCode: string
  patientId?: string
  transactionType: 'inbound_import' | 'outbound_export' | 'identity_lookup' | 'facility_sync'
  resourceType: string
  payload: unknown
  consentVerified: boolean
  consentCode?: string
}) {
  try {
    const result = await defaultHealthcareIntegrationService.executeDataExchange(params)
    return { success: result.success, data: result.transaction, error: result.error }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to execute data exchange transaction',
    }
  }
}

export async function reconcileDiagnosticRecordAction(
  record: StagedDiagnosticRecordItem,
  input: ReconciliationActionInput
) {
  try {
    const result = defaultHealthcareIntegrationService.reconcileRecord(record, input)
    return { success: true, data: result }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to reconcile diagnostic record',
    }
  }
}

export async function matchPatientIdentityAction(
  query: InboundPatientQuery,
  knownPatients: KnownPatientIdentityRecord[]
) {
  try {
    const candidates = defaultHealthcareIntegrationService.matchPatient(query, knownPatients)
    return { success: true, data: candidates }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to perform patient identity match',
    }
  }
}

export async function getHealthcareExchangeTransactionsAction(limit = 50) {
  try {
    const txs = defaultHealthcareIntegrationService.getRecentTransactions(limit)
    return { success: true, data: txs }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve exchange transactions',
    }
  }
}


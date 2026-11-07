/**
 * Phase 2.9: Advanced Healthcare Integrations Module
 * Standardized HL7 FHIR R4, HL7 v2.5.1, DICOM Part 10 CT Bridge,
 * Patient Identity Matching, Staged Diagnostic Reconciliation & Consent-Gated Exchange.
 */

export * from './types'
export * from './standards/fhir-r4-transformer'
export * from './standards/hl7-v2-parser'
export * from './standards/dicom-bridge'
export * from './adapters/registry'
export * from './reconciliation/patient-identity-matcher'
export * from './reconciliation/record-reconciliation-service'
export * from './service'
export * from './actions'
export * from './components'


/**
 * Governance Module
 * Domain: Clinical Advisory Board (CAB), Methodology Registry,
 * Versioning, Lifecycles, Clinician Overrides & Audit Compliance.
 * Roadmap: Phase 1.24
 */

export const GOVERNANCE_MODULE = {
  id: 'governance',
  name: 'Clinical Governance & Audit Compliance',
  version: '1.24.0',
  description: 'Enforces clinical advisory board governance, methodology registry, versioned decision rules, clinician overrides, and immutable audit trails.',
} as const

export * from './types'
export * from './methodology-registry'
export * from './service'
export * from './actions'
export * from './components/xai-explainer-view'

/**
 * Lungent Patients Module
 * Domain: Centralized patient identity, Lungent Patient ID management, search, registration,
 * duplicate detection & review, multi-facility access, and audit trail.
 * Milestone: Phase 1.6
 */

export * from './types'
export * from './patient-id'
export * from './duplicate-detector'
export * from './validation'
export * from './service'
export * from './actions'

export const PATIENTS_MODULE = {
  id: 'patients',
  name: 'Centralized Patient Identity & Management',
  version: '1.0.0',
  description:
    'Manages centralized patient identity, unique collision-resistant Lungent Patient IDs, duplicate detection, multi-facility relationships, and audit logging.',
} as const

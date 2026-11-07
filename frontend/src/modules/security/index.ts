/**
 * Centralized Security, Privacy & Compliance Module
 * Phase 1.25
 */

export const SECURITY_MODULE = {
  id: 'security-privacy-compliance',
  name: 'Security, Privacy & Compliance Framework',
  version: '1.25.0',
  description:
    'Enforces least-privilege role boundaries, server-side authorization, append-only security auditing, patient privacy and consent rights, incident management, data retention, and compliance readiness register.',
} as const

export * from './types'
export * from './compliance-catalog'
export * from './service'
export * from './actions'


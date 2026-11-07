/**
 * Authentication Module
 * Domain: User identity, Supabase Auth integration, session management, RBAC and Profile Management.
 */
export * from './validation'
export * from './service'
export * from './audit'

export const AUTHENTICATION_MODULE = {
  id: 'authentication',
  name: 'Authentication & User Management',
  version: '1.3.0',
  description: 'Handles secure registration, login/logout, session lifecycle, RBAC, and audit logging.',
} as const

import type { UserRole } from '@/types'

export const ROLES: Record<string, UserRole> = {
  PATIENT: 'patient',
  HEALTHCARE_WORKER: 'healthcare_worker',
  CLINICIAN: 'clinician',
  ADMINISTRATOR: 'administrator',
} as const

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  patient: 1,
  healthcare_worker: 2,
  clinician: 3,
  administrator: 4,
}

export function hasRoleAccess(userRole: UserRole | UserRole[], requiredRole: UserRole): boolean {
  const roles = Array.isArray(userRole) ? userRole : [userRole]
  return roles.some((role) => (ROLE_HIERARCHY[role] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0))
}

export function isPrivilegedRole(role: UserRole): boolean {
  return role === 'healthcare_worker' || role === 'clinician' || role === 'administrator'
}

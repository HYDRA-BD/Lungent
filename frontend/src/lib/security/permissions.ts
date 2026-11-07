import type { UserRole } from '@/types'

export const PERMISSIONS = {
  // Profile
  PROFILE_READ: 'profile.read',
  PROFILE_UPDATE: 'profile.update',

  // Patients
  PATIENT_CREATE: 'patient.create',
  PATIENT_READ: 'patient.read',
  PATIENT_UPDATE: 'patient.update',
  PATIENT_SEARCH: 'patient.search',
  PATIENT_VERIFY: 'patient.verify',
  PATIENT_MERGE: 'patient.merge',

  // Health Information Records (Phase 1.7)
  HEALTH_RECORD_READ: 'health_record.read',
  HEALTH_RECORD_WRITE: 'health_record.write',
  HEALTH_RECORD_VERIFY: 'health_record.verify',

  // Assessments & Screening
  ASSESSMENT_CREATE: 'assessment.create',
  ASSESSMENT_READ: 'assessment.read',
  ASSESSMENT_REVIEW: 'assessment.review',

  // Clinical Decisions & Referrals
  CLINICAL_NOTES_CREATE: 'clinical.notes.create',
  REFERRAL_CREATE: 'referral.create',

  // Governance & Admin
  USER_MANAGE: 'user.manage',
  ROLE_ASSIGN: 'role.assign',
  FACILITY_MANAGE: 'facility.manage',
  AUDIT_READ: 'audit.read',
} as const

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]

export const ROLE_PERMISSIONS_MAP: Record<UserRole, readonly Permission[]> = {
  patient: [
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.HEALTH_RECORD_READ,
    PERMISSIONS.HEALTH_RECORD_WRITE,
    PERMISSIONS.ASSESSMENT_CREATE,
    PERMISSIONS.ASSESSMENT_READ,
  ],
  healthcare_worker: [
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_UPDATE,
    PERMISSIONS.PATIENT_SEARCH,
    PERMISSIONS.HEALTH_RECORD_READ,
    PERMISSIONS.HEALTH_RECORD_WRITE,
    PERMISSIONS.ASSESSMENT_CREATE,
    PERMISSIONS.ASSESSMENT_READ,
    PERMISSIONS.REFERRAL_CREATE,
  ],
  clinician: [
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_SEARCH,
    PERMISSIONS.PATIENT_VERIFY,
    PERMISSIONS.HEALTH_RECORD_READ,
    PERMISSIONS.HEALTH_RECORD_WRITE,
    PERMISSIONS.HEALTH_RECORD_VERIFY,
    PERMISSIONS.ASSESSMENT_READ,
    PERMISSIONS.ASSESSMENT_REVIEW,
    PERMISSIONS.CLINICAL_NOTES_CREATE,
    PERMISSIONS.REFERRAL_CREATE,
  ],
  administrator: [
    PERMISSIONS.PROFILE_READ,
    PERMISSIONS.PROFILE_UPDATE,
    PERMISSIONS.PATIENT_READ,
    PERMISSIONS.PATIENT_SEARCH,
    PERMISSIONS.PATIENT_VERIFY,
    PERMISSIONS.PATIENT_MERGE,
    PERMISSIONS.HEALTH_RECORD_READ,
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.ROLE_ASSIGN,
    PERMISSIONS.FACILITY_MANAGE,
    PERMISSIONS.AUDIT_READ,
  ],
}

/**
 * Checks whether a specific role possesses a given permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS_MAP[role]
  return rolePermissions ? rolePermissions.includes(permission) : false
}

/**
 * Checks whether any of the user's roles possess the required permission.
 * Accepts either an array of UserRole or a user object containing a roles array.
 */
export function userHasPermission(
  userOrRoles: UserRole[] | { roles: UserRole[] },
  permission: Permission
): boolean {
  const roles = Array.isArray(userOrRoles) ? userOrRoles : userOrRoles.roles
  return roles.some((role) => hasPermission(role, permission))
}

/**
 * Checks whether any of the user's roles possess any of the required permissions.
 * Accepts either an array of UserRole or a user object containing a roles array.
 */
export function userHasAnyPermission(
  userOrRoles: UserRole[] | { roles: UserRole[] },
  permissions: Permission[]
): boolean {
  return permissions.some((perm) => userHasPermission(userOrRoles, perm))
}

/**
 * Validates workspace route access based on role boundaries.
 */
export function canAccessWorkspace(
  roles: UserRole[],
  workspace: 'patient' | 'healthcare-worker' | 'clinical' | 'admin'
): boolean {
  switch (workspace) {
    case 'patient':
      return roles.some((r) => ['patient', 'healthcare_worker', 'clinician', 'administrator'].includes(r))
    case 'healthcare-worker':
      return roles.some((r) => ['healthcare_worker', 'administrator'].includes(r))
    case 'clinical':
      return roles.some((r) => ['clinician', 'administrator'].includes(r))
    case 'admin':
      return roles.includes('administrator')
    default:
      return false
  }
}

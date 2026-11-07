import { describe, it, expect } from 'vitest'
import {
  PERMISSIONS,
  ROLE_PERMISSIONS_MAP,
  hasPermission,
  userHasPermission,
  userHasAnyPermission,
  canAccessWorkspace,
} from '@/lib/security/permissions'
import {
  ROLES,
  ROLE_HIERARCHY,
  hasRoleAccess,
  isPrivilegedRole,
} from '@/lib/security/roles'
import type { UserWithRoles } from '@/types'

describe('Role & Authorization Security Suite', () => {
  describe('Role Definitions & Privilege Checks', () => {
    it('defines the 4 core platform roles', () => {
      expect(Object.values(ROLES)).toEqual(['patient', 'healthcare_worker', 'clinician', 'administrator'])
    })

    it('correctly identifies privileged roles against public self-registration', () => {
      expect(isPrivilegedRole('patient')).toBe(false)
      expect(isPrivilegedRole('healthcare_worker')).toBe(true)
      expect(isPrivilegedRole('clinician')).toBe(true)
      expect(isPrivilegedRole('administrator')).toBe(true)
    })

    it('enforces role hierarchy ordering', () => {
      expect(ROLE_HIERARCHY.administrator).toBeGreaterThan(ROLE_HIERARCHY.clinician)
      expect(ROLE_HIERARCHY.clinician).toBeGreaterThan(ROLE_HIERARCHY.healthcare_worker)
      expect(ROLE_HIERARCHY.healthcare_worker).toBeGreaterThan(ROLE_HIERARCHY.patient)
    })

    it('validates hierarchical role access inheritance', () => {
      // Admin satisfies all lower roles
      expect(hasRoleAccess('administrator', 'patient')).toBe(true)
      expect(hasRoleAccess('administrator', 'healthcare_worker')).toBe(true)
      expect(hasRoleAccess('administrator', 'clinician')).toBe(true)
      expect(hasRoleAccess('administrator', 'administrator')).toBe(true)

      // Clinician satisfies healthcare_worker and patient, but not administrator
      expect(hasRoleAccess('clinician', 'patient')).toBe(true)
      expect(hasRoleAccess('clinician', 'healthcare_worker')).toBe(true)
      expect(hasRoleAccess('clinician', 'clinician')).toBe(true)
      expect(hasRoleAccess('clinician', 'administrator')).toBe(false)

      // Patient only satisfies patient
      expect(hasRoleAccess('patient', 'patient')).toBe(true)
      expect(hasRoleAccess('patient', 'healthcare_worker')).toBe(false)
      expect(hasRoleAccess('patient', 'clinician')).toBe(false)
      expect(hasRoleAccess('patient', 'administrator')).toBe(false)
    })
  })

  describe('Granular Permissions & Role-Permission Matrix', () => {
    it('grants baseline patient permissions only to patients', () => {
      const patientPerms = ROLE_PERMISSIONS_MAP.patient
      expect(patientPerms).toContain(PERMISSIONS.PROFILE_READ)
      expect(patientPerms).toContain(PERMISSIONS.PROFILE_UPDATE)
      expect(patientPerms).toContain(PERMISSIONS.ASSESSMENT_CREATE)
      expect(patientPerms).toContain(PERMISSIONS.ASSESSMENT_READ)

      // Patients must never have clinical triage or user management permissions
      expect(patientPerms).not.toContain(PERMISSIONS.ASSESSMENT_REVIEW)
      expect(patientPerms).not.toContain(PERMISSIONS.USER_MANAGE)
      expect(patientPerms).not.toContain(PERMISSIONS.CLINICAL_NOTES_CREATE)
    })

    it('grants clinical decision support permissions to clinicians', () => {
      const clinicianPerms = ROLE_PERMISSIONS_MAP.clinician
      expect(clinicianPerms).toContain(PERMISSIONS.ASSESSMENT_REVIEW)
      expect(clinicianPerms).toContain(PERMISSIONS.CLINICAL_NOTES_CREATE)
      expect(clinicianPerms).toContain(PERMISSIONS.REFERRAL_CREATE)
    })

    it('grants complete administrative and governance permissions to administrators', () => {
      const adminPerms = ROLE_PERMISSIONS_MAP.administrator
      expect(adminPerms).toContain(PERMISSIONS.USER_MANAGE)
      expect(adminPerms).toContain(PERMISSIONS.ROLE_ASSIGN)
      expect(adminPerms).toContain(PERMISSIONS.FACILITY_MANAGE)
      expect(adminPerms).toContain(PERMISSIONS.AUDIT_READ)
    })

    it('evaluates static role permissions via hasPermission()', () => {
      expect(hasPermission('clinician', PERMISSIONS.ASSESSMENT_REVIEW)).toBe(true)
      expect(hasPermission('patient', PERMISSIONS.ASSESSMENT_REVIEW)).toBe(false)
    })
  })

  describe('User-Level Dynamic Permission Checks', () => {
    const mockUser: UserWithRoles = {
      id: 'usr-123',
      auth_user_id: 'auth-123',
      full_name: 'Dr. Fatima Noor',
      email: 'fatima@hospital.gov.bd',
      phone_number: '+8801912345678',
      preferred_language: 'bn',
      profile_image_url: null,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      roles: ['clinician'],
      permissions: [...ROLE_PERMISSIONS_MAP.clinician],
      facilities: [{ facility_id: 'dmch-dhaka', facility_role: 'Lead Pulmonologist', is_primary: true }],
    }

    it('verifies explicit user permissions via userHasPermission()', () => {
      expect(userHasPermission(mockUser, PERMISSIONS.CLINICAL_NOTES_CREATE)).toBe(true)
      expect(userHasPermission(mockUser, PERMISSIONS.USER_MANAGE)).toBe(false)
    })

    it('verifies union checks via userHasAnyPermission()', () => {
      expect(
        userHasAnyPermission(mockUser, [PERMISSIONS.USER_MANAGE, PERMISSIONS.ASSESSMENT_REVIEW])
      ).toBe(true)

      expect(
        userHasAnyPermission(mockUser, [PERMISSIONS.USER_MANAGE, PERMISSIONS.ROLE_ASSIGN])
      ).toBe(false)
    })
  })

  describe('Workspace Route Boundaries (canAccessWorkspace)', () => {
    it('allows patient portal access to all valid roles', () => {
      expect(canAccessWorkspace(['patient'], 'patient')).toBe(true)
      expect(canAccessWorkspace(['healthcare_worker'], 'patient')).toBe(true)
      expect(canAccessWorkspace(['clinician'], 'patient')).toBe(true)
      expect(canAccessWorkspace(['administrator'], 'patient')).toBe(true)
    })

    it('restricts healthcare-worker workspace', () => {
      expect(canAccessWorkspace(['patient'], 'healthcare-worker')).toBe(false)
      expect(canAccessWorkspace(['healthcare_worker'], 'healthcare-worker')).toBe(true)
      expect(canAccessWorkspace(['clinician'], 'healthcare-worker')).toBe(false)
      expect(canAccessWorkspace(['administrator'], 'healthcare-worker')).toBe(true)
    })

    it('restricts clinical decision support workspace', () => {
      expect(canAccessWorkspace(['patient'], 'clinical')).toBe(false)
      expect(canAccessWorkspace(['healthcare_worker'], 'clinical')).toBe(false)
      expect(canAccessWorkspace(['clinician'], 'clinical')).toBe(true)
      expect(canAccessWorkspace(['administrator'], 'clinical')).toBe(true)
    })

    it('strictly confines admin workspace to administrators only', () => {
      expect(canAccessWorkspace(['patient'], 'admin')).toBe(false)
      expect(canAccessWorkspace(['healthcare_worker'], 'admin')).toBe(false)
      expect(canAccessWorkspace(['clinician'], 'admin')).toBe(false)
      expect(canAccessWorkspace(['administrator'], 'admin')).toBe(true)
    })
  })
})

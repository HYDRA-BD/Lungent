import 'server-only'
import { redirect } from 'next/navigation'
import { getCurrentUserWithRoles } from '@/modules/authentication/service'
import { userHasPermission, type Permission } from './permissions'
import type { UserRole, UserWithRoles } from '@/types'

/**
 * Ensures request is made by an authenticated user.
 * Redirects to login if unauthenticated.
 */
export async function requireAuth(redirectTo: string = '/login'): Promise<UserWithRoles> {
  const user = await getCurrentUserWithRoles()
  if (!user) {
    redirect(redirectTo)
  }

  if (user.status === 'suspended') {
    redirect('/suspended')
  }

  return user
}

/**
 * Ensures authenticated user possesses at least one of the specified roles.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<UserWithRoles> {
  const user = await requireAuth()

  const hasAllowedRole = user.roles.some((role) => allowedRoles.includes(role))
  if (!hasAllowedRole) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Ensures authenticated user possesses the specific permission.
 */
export async function requirePermission(permission: Permission): Promise<UserWithRoles> {
  const user = await requireAuth()

  if (!userHasPermission(user.roles, permission)) {
    redirect('/unauthorized')
  }

  return user
}

/**
 * Verifies if user has membership in a specific healthcare facility.
 */
export async function requireFacilityAccess(facilityId: string): Promise<UserWithRoles> {
  const user = await requireAuth()

  // Administrators have global platform inspection access
  if (user.roles.includes('administrator')) {
    return user
  }

  const isMember = user.facilities.some((f) => f.facility_id === facilityId)
  if (!isMember) {
    redirect('/unauthorized')
  }

  return user
}

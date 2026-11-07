'use server'

import { revalidatePath } from 'next/cache'
import { FacilityService } from './service'
import {
  registerFacilitySchema,
  updateFacilitySchema,
  changeFacilityStatusSchema,
  verifyFacilitySchema,
  assignStaffMemberSchema,
  updateStaffMembershipSchema,
  configureServicesSchema,
  searchFacilitiesSchema,
} from './validation'
import { getCurrentUserWithRoles } from '@/modules/authentication/service'
import type {
  RegisterFacilityInput,
  UpdateFacilityInput,
  SearchFacilitiesInput,
  ChangeFacilityStatusInput,
  VerifyFacilityInput,
  AssignStaffInput,
  UpdateStaffMembershipInput,
  ConfigureServicesInput,
} from './types'

export async function searchFacilitiesAction(rawInput: SearchFacilitiesInput) {
  try {
    const validated = searchFacilitiesSchema.parse(rawInput)
    const result = await FacilityService.searchFacilities(validated)
    return { success: true, data: result }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to search facilities'
    return { success: false, error: message }
  }
}

export async function getFacilityDetailsAction(id: string) {
  try {
    const facility = await FacilityService.getFacilityById(id)
    if (!facility) {
      return { success: false, error: 'Healthcare facility not found' }
    }
    const services = await FacilityService.getFacilityServices(facility.id)
    const staff = await FacilityService.getFacilityStaff(facility.id)
    const history = await FacilityService.getFacilityStatusHistory(facility.id)
    const auditTrail = await FacilityService.getFacilityAuditTrail(facility.id)

    return {
      success: true,
      data: {
        facility,
        services,
        staff,
        history,
        auditTrail,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve facility details'
    return { success: false, error: message }
  }
}

export async function registerFacilityAction(rawInput: RegisterFacilityInput) {
  try {
    const validated = registerFacilitySchema.parse(rawInput)
    const user = await getCurrentUserWithRoles().catch(() => null)
    const actorId = user?.id || 'admin-system'

    const facility = await FacilityService.registerFacility(validated, actorId)
    revalidatePath('/admin/facilities')
    return { success: true, data: facility }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to register facility'
    return { success: false, error: message }
  }
}

export async function updateFacilityAction(id: string, rawInput: UpdateFacilityInput) {
  try {
    const validated = updateFacilitySchema.parse(rawInput)
    const user = await getCurrentUserWithRoles().catch(() => null)
    const actorId = user?.id || 'admin-system'

    const facility = await FacilityService.updateFacility(id, validated, actorId)
    revalidatePath('/admin/facilities')
    revalidatePath(`/admin/facilities/${id}`)
    revalidatePath(`/admin/facilities/${id}/edit`)
    return { success: true, data: facility }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update facility'
    return { success: false, error: message }
  }
}

export async function changeFacilityStatusAction(id: string, rawInput: ChangeFacilityStatusInput) {
  try {
    const validated = changeFacilityStatusSchema.parse(rawInput)
    const user = await getCurrentUserWithRoles().catch(() => null)
    const actorId = user?.id || 'admin-system'

    const facility = await FacilityService.changeFacilityStatus(id, validated, actorId)
    revalidatePath('/admin/facilities')
    revalidatePath(`/admin/facilities/${id}`)
    return { success: true, data: facility }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to change facility status'
    return { success: false, error: message }
  }
}

export async function verifyFacilityAction(id: string, rawInput: VerifyFacilityInput) {
  try {
    const validated = verifyFacilitySchema.parse(rawInput)
    const user = await getCurrentUserWithRoles().catch(() => null)
    const actorId = user?.id || 'admin-system'

    const facility = await FacilityService.verifyFacility(id, validated, actorId)
    revalidatePath('/admin/facilities')
    revalidatePath(`/admin/facilities/${id}`)
    return { success: true, data: facility }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to verify facility'
    return { success: false, error: message }
  }
}

export async function assignStaffAction(facilityId: string, rawInput: AssignStaffInput) {
  try {
    const validated = assignStaffMemberSchema.parse(rawInput)
    const user = await getCurrentUserWithRoles().catch(() => null)
    const actorId = user?.id || 'admin-system'

    const staffMember = await FacilityService.assignStaff(facilityId, validated, actorId)
    revalidatePath(`/admin/facilities/${facilityId}`)
    return { success: true, data: staffMember }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to assign staff member'
    return { success: false, error: message }
  }
}

export async function updateStaffMembershipAction(
  facilityId: string,
  membershipId: string,
  rawInput: UpdateStaffMembershipInput
) {
  try {
    const validated = updateStaffMembershipSchema.parse(rawInput)
    const user = await getCurrentUserWithRoles().catch(() => null)
    const actorId = user?.id || 'admin-system'

    const updated = await FacilityService.updateStaffMembership(facilityId, membershipId, validated, actorId)
    revalidatePath(`/admin/facilities/${facilityId}`)
    return { success: true, data: updated }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update staff membership'
    return { success: false, error: message }
  }
}

export async function configureFacilityServicesAction(
  facilityId: string,
  rawInput: ConfigureServicesInput
) {
  try {
    const validated = configureServicesSchema.parse(rawInput)
    const user = await getCurrentUserWithRoles().catch(() => null)
    const actorId = user?.id || 'admin-system'

    const services = await FacilityService.configureServices(facilityId, validated.services, actorId)
    revalidatePath(`/admin/facilities/${facilityId}`)
    return { success: true, data: services }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to configure facility services'
    return { success: false, error: message }
  }
}

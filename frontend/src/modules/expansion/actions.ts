'use server'

/**
 * Phase 2.11: Regional & Nationwide Expansion Server Actions
 * Next.js Server Actions for facility onboarding, network coordination,
 * cross-facility access authorization, and centralized monitoring.
 */

import { defaultRegionalExpansionService } from './service'
import type { RegisterFacilityOnboardingInput } from './services/facility-onboarding-service'
import type {
  FacilityOnboardingRecord,
  OnboardingChecklistItems,
  CrossFacilityAccessRequest,
} from './types'

export async function registerFacilityOnboardingAction(input: RegisterFacilityOnboardingInput) {
  try {
    const record = defaultRegionalExpansionService.registerFacility(input)
    return { success: true, data: record }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to register facility for onboarding',
    }
  }
}

export async function updateFacilityChecklistAction(
  record: FacilityOnboardingRecord,
  updates: Partial<OnboardingChecklistItems>
) {
  try {
    const updated = defaultRegionalExpansionService.updateChecklist(record, updates)
    return { success: true, data: updated }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to update facility checklist',
    }
  }
}

export async function activateFacilityAction(
  record: FacilityOnboardingRecord,
  verifierUserId: string
) {
  try {
    const activated = defaultRegionalExpansionService.activateFacility(record, verifierUserId)
    return { success: true, data: activated }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to activate facility',
    }
  }
}

export async function getRegionalNetworksAction() {
  try {
    const networks = defaultRegionalExpansionService.getNetworks()
    return { success: true, data: networks }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve healthcare networks',
    }
  }
}

export async function authorizeCrossFacilityAccessAction(req: CrossFacilityAccessRequest) {
  try {
    const result = defaultRegionalExpansionService.authorizeCrossFacilityAccess(req)
    return { success: result.isAuthorized, data: result.log, error: result.rejectionReason }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to authorize cross-facility access',
    }
  }
}

export async function checkSubsystemHealthAction() {
  try {
    const health = await defaultRegionalExpansionService.getSubsystemHealth()
    return { success: true, data: health }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to check subsystem health',
    }
  }
}

export async function getRolloutMilestonesAction() {
  try {
    const milestones = defaultRegionalExpansionService.getRolloutMilestones()
    return { success: true, data: milestones }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to retrieve rollout milestones',
    }
  }
}

export async function evaluateExpansionReadinessAction(facilities: FacilityOnboardingRecord[]) {
  try {
    const scorecard = defaultRegionalExpansionService.evaluateExpansionReadiness(facilities)
    return { success: true, data: scorecard }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to evaluate expansion readiness',
    }
  }
}


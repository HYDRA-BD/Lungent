/**
 * Phase 2.11: Regional & Nationwide Expansion Service Façade
 * Unified coordinator for facility onboarding, regional network routing,
 * cross-facility access authorization, centralized subsystem health, and phased rollout tracking.
 */

import {
  FacilityOnboardingService,
  type RegisterFacilityOnboardingInput,
} from './services/facility-onboarding-service'
import {
  HealthcareNetworkService,
  REQUIRED_NETWORK_SHARING_CONSENT_CODE,
} from './services/healthcare-network-service'
import { CentralizedMonitoringService } from './services/centralized-monitoring-service'
import { RolloutManagementService } from './services/rollout-management-service'
import type {
  FacilityOnboardingRecord,
  OnboardingChecklistItems,
  CrossFacilityAccessRequest,
  SubsystemType,
  SubsystemHealthStatus,
  NetworkMemberRole,
} from './types'

export class RegionalExpansionService {
  /**
   * Initiates regional facility onboarding
   */
  public registerFacility(input: RegisterFacilityOnboardingInput): FacilityOnboardingRecord {
    return FacilityOnboardingService.initiateOnboarding(input)
  }

  /**
   * Updates facility checklist items and readiness score
   */
  public updateChecklist(
    record: FacilityOnboardingRecord,
    updates: Partial<OnboardingChecklistItems>
  ): FacilityOnboardingRecord {
    return FacilityOnboardingService.updateChecklist(record, updates)
  }

  /**
   * Activates facility for live clinical service
   */
  public activateFacility(
    record: FacilityOnboardingRecord,
    verifierUserId: string
  ): FacilityOnboardingRecord {
    return FacilityOnboardingService.activateFacility(record, verifierUserId)
  }

  /**
   * Suspends a facility
   */
  public suspendFacility(record: FacilityOnboardingRecord, reason: string): FacilityOnboardingRecord {
    return FacilityOnboardingService.suspendFacility(record, reason)
  }

  /**
   * Retrieves preconfigured regional networks
   */
  public getNetworks() {
    return HealthcareNetworkService.getNetworks()
  }

  /**
   * Authorizes consent-gated cross-facility patient record access
   */
  public authorizeCrossFacilityAccess(req: CrossFacilityAccessRequest) {
    return HealthcareNetworkService.authorizeCrossFacilityAccess(req)
  }

  /**
   * Resolves referral escalation pathway
   */
  public resolveReferralPathway(sourceRole: NetworkMemberRole, targetRole: NetworkMemberRole) {
    return HealthcareNetworkService.resolveReferralPathway(sourceRole, targetRole)
  }

  /**
   * Evaluates centralized nationwide health across core subsystems
   */
  public async getSubsystemHealth() {
    return CentralizedMonitoringService.checkSubsystemHealth()
  }

  /**
   * Records a service health incident with zero-PHI validation
   */
  public recordHealthIncident(params: {
    subsystem: SubsystemType
    regionOrFacility: string
    healthStatus: SubsystemHealthStatus
    incidentDescription: string
    latencyMs?: number
  }) {
    return CentralizedMonitoringService.recordIncident(params)
  }

  /**
   * Retrieves phased rollout framework milestones
   */
  public getRolloutMilestones() {
    return RolloutManagementService.getRolloutMilestones()
  }

  /**
   * Evaluates overall regional expansion readiness scorecard
   */
  public evaluateExpansionReadiness(facilities: FacilityOnboardingRecord[]) {
    return RolloutManagementService.evaluateExpansionReadiness(facilities)
  }
}

export const defaultRegionalExpansionService = new RegionalExpansionService()
export { REQUIRED_NETWORK_SHARING_CONSENT_CODE }


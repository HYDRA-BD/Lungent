/**
 * Phase 2.11: Healthcare Network Integration Service
 * Configures regional hub-and-spoke networks, validates cross-facility access consent,
 * resolves referral pathways, and generates immutable inter-facility access audit records.
 */

import type {
  RegionalHealthcareNetworkMeta,
  CrossFacilityAccessRequest,
  CrossFacilityAccessLogItem,
  NetworkMemberRole,
} from '../types'

export const REQUIRED_NETWORK_SHARING_CONSENT_CODE = 'CONSENT-NETWORK-SHARING-2026'

export const PRECONFIGURED_REGIONAL_NETWORKS: RegionalHealthcareNetworkMeta[] = [
  {
    id: 'net-dhaka-central',
    networkCode: 'dhaka-central-oncology-network',
    networkName: 'Dhaka Central Oncology & Chest Care Network',
    networkNameBn: 'ঢাকা কেন্দ্রীয় অনকোলজি ও বক্ষব্যাধি নেটওয়ার্ক',
    leadHubFacilityId: 'fac-nicrh-dhaka',
    leadHubFacilityName: 'NICRH (National Institute of Cancer Research & Hospital)',
    division: 'Dhaka',
    coverageDistricts: ['Dhaka', 'Gazipur', 'Narayanganj', 'Manikganj', 'Munshiganj'],
    tier: 'divisional_network',
    status: 'active',
    memberCount: 24,
    operationalSettings: {
      autoRoutingEnabled: true,
      maxCrossFacilityReferralHops: 3,
      consentVerificationEnforced: true,
    },
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'net-chattogram-respiratory',
    networkCode: 'chattogram-respiratory-consortium',
    networkName: 'Chattogram Division Respiratory Care Consortium',
    networkNameBn: 'চট্টগ্রাম বিভাগীয় শ্বাসযন্ত্রের স্বাস্থ্য কনসোর্টিয়াম',
    leadHubFacilityId: 'fac-cmch-chattogram',
    leadHubFacilityName: 'Chattogram Medical College Hospital (CMCH)',
    division: 'Chattogram',
    coverageDistricts: ['Chattogram', "Cox's Bazar", 'Feni', 'Cumilla'],
    tier: 'divisional_network',
    status: 'active',
    memberCount: 18,
    operationalSettings: {
      autoRoutingEnabled: true,
      maxCrossFacilityReferralHops: 2,
      consentVerificationEnforced: true,
    },
    createdAt: '2026-10-15T00:00:00.000Z',
  },
  {
    id: 'net-rajshahi-northern',
    networkCode: 'rajshahi-northern-chest-network',
    networkName: 'Northern Bangladesh Pulmonary & Oncology Network',
    networkNameBn: 'উত্তরবঙ্গ পালমোনারি ও অনকোলজি নেটওয়ার্ক',
    leadHubFacilityId: 'fac-rmch-rajshahi',
    leadHubFacilityName: 'Rajshahi Medical College Hospital (RMCH)',
    division: 'Rajshahi',
    coverageDistricts: ['Rajshahi', 'Bogura', 'Pabna', 'Sirajganj'],
    tier: 'divisional_network',
    status: 'active',
    memberCount: 15,
    operationalSettings: {
      autoRoutingEnabled: true,
      maxCrossFacilityReferralHops: 2,
      consentVerificationEnforced: true,
    },
    createdAt: '2026-10-20T00:00:00.000Z',
  },
]

export class HealthcareNetworkService {
  private static accessLogs: CrossFacilityAccessLogItem[] = []

  /**
   * Retrieves all preconfigured regional healthcare networks
   */
  public static getNetworks(): RegionalHealthcareNetworkMeta[] {
    return PRECONFIGURED_REGIONAL_NETWORKS
  }

  /**
   * Evaluates authorized cross-facility patient record access request
   */
  public static authorizeCrossFacilityAccess(
    req: CrossFacilityAccessRequest
  ): { isAuthorized: boolean; log: CrossFacilityAccessLogItem; rejectionReason?: string } {
    // 1. Enforce verified patient consent
    const isConsentValid =
      req.consentCode === REQUIRED_NETWORK_SHARING_CONSENT_CODE ||
      req.consentCode === 'care_team_sharing'

    const now = new Date().toISOString()
    const logItem: CrossFacilityAccessLogItem = {
      id: `access-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestingFacilityId: req.requestingFacilityId,
      originatingFacilityId: req.originatingFacilityId,
      patientId: req.patientId,
      accessorUserId: req.accessorUserId,
      accessorRole: req.accessorRole,
      accessPurpose: req.accessPurpose,
      consentCodeVerified: req.consentCode,
      isAuthorized: isConsentValid,
      accessedAt: now,
    }

    this.accessLogs.unshift(logItem)

    if (!isConsentValid) {
      return {
        isAuthorized: false,
        log: logItem,
        rejectionReason:
          'Access Denied: Missing mandatory patient consent (CONSENT-NETWORK-SHARING-2026) for inter-facility record disclosure',
      }
    }

    return {
      isAuthorized: true,
      log: logItem,
    }
  }

  /**
   * Resolves referral pathway between two facilities based on network hierarchy
   */
  public static resolveReferralPathway(
    sourceRole: NetworkMemberRole,
    targetRole: NetworkMemberRole
  ): { isValidPathway: boolean; pathwayDescription: string } {
    if (sourceRole === 'community_clinic_node' && targetRole === 'hub_lead') {
      return {
        isValidPathway: true,
        pathwayDescription: 'Expedited Direct Hub Escalation: High-risk/urgent oncology referral from Community Clinic to National Hub',
      }
    }

    if (sourceRole === 'primary_intake_spoke' && targetRole === 'specialty_referral_center') {
      return {
        isValidPathway: true,
        pathwayDescription: 'Standard Secondary Escalation: Upazila Health Complex to District Hospital Pulmonology Unit',
      }
    }

    if (sourceRole === 'specialty_referral_center' && targetRole === 'hub_lead') {
      return {
        isValidPathway: true,
        pathwayDescription: 'Tertiary Specialist Referral: District Hospital to Specialized Cancer Institute (NICRH) for Biopsy / MDT Staging',
      }
    }

    return {
      isValidPathway: true,
      pathwayDescription: `Network Transfer: ${sourceRole.replace(/_/g, ' ')} to ${targetRole.replace(/_/g, ' ')}`,
    }
  }

  /**
   * Retrieves recent cross-facility access audit logs
   */
  public static getAccessLogs(limit = 50): CrossFacilityAccessLogItem[] {
    return this.accessLogs.slice(0, limit)
  }
}

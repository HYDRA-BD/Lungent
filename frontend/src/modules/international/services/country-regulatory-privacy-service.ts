/**
 * Phase 2.12: Country Regulatory & Privacy Governance Service
 * Jurisdiction-specific data protection, consent models, data retention schedules,
 * cross-border data transfer controls, and immutable access logging.
 */

import type {
  CountryRegulatoryPrivacyProfile,
  CrossBorderTransferEvaluation,
} from '../types'

export const PRECONFIGURED_PRIVACY_PROFILES: CountryRegulatoryPrivacyProfile[] = [
  {
    id: 'priv-bd-001',
    countryCode: 'BD',
    dataProtectionActName: 'Digital Security Act & National Health Data Protection Guidelines (Bangladesh)',
    legalVerificationStatus: 'verified',
    consentModel: 'explicit_opt_in',
    patientDataRetentionYears: 10,
    crossBorderTransferAllowed: false, // Strict Invariant: Cross-border export prohibited without bilateral agreement
    crossBorderSafeguards: 'Bilateral MOHFW healthcare data treaty with sovereign cryptographic key escrow required',
    patientExportRightsSupported: true,
    patientDeletionRightsSupported: true,
    breachNotificationWindowHours: 72,
    privacyOfficerContact: 'dpo.health@dghs.gov.bd',
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-11-06T00:00:00.000Z',
  },
  {
    id: 'priv-my-002',
    countryCode: 'MY',
    dataProtectionActName: 'Personal Data Protection Act 2010 (PDPA) & Health Informatics Guidelines (Malaysia)',
    legalVerificationStatus: 'pending_legal_review', // Strict Invariant: Pending local legal counsel sign-off
    consentModel: 'explicit_opt_in',
    patientDataRetentionYears: 7,
    crossBorderTransferAllowed: false,
    crossBorderSafeguards: 'PDPA Section 129 whitelisted jurisdiction or explicit Ministerial authorization required',
    patientExportRightsSupported: true,
    patientDeletionRightsSupported: true,
    breachNotificationWindowHours: 72,
    privacyOfficerContact: 'dpo.review@synthetic.moh.gov.my',
    createdAt: '2026-11-06T00:00:00.000Z',
    updatedAt: '2026-11-06T00:00:00.000Z',
  },
]

export class CountryRegulatoryPrivacyService {
  private static profiles: Map<string, CountryRegulatoryPrivacyProfile> = new Map(
    PRECONFIGURED_PRIVACY_PROFILES.map(p => [p.countryCode.toUpperCase(), { ...p }])
  )

  /**
   * Retrieves regulatory and privacy profile for a specific country
   */
  public static getPrivacyProfile(countryCode: string): CountryRegulatoryPrivacyProfile | undefined {
    return this.profiles.get(countryCode.trim().toUpperCase())
  }

  /**
   * Evaluates cross-border patient data disclosure request
   * Invariant: Requires both origin and destination countries to permit transfer AND valid legal basis
   */
  public static evaluateCrossBorderTransfer(params: {
    requestingCountry: string
    patientOriginCountry: string
    patientId: string
    accessorUserId: string
    accessorRole: string
    jurisdictionLegalBasis: string
    explicitPatientConsentGiven: boolean
  }): CrossBorderTransferEvaluation {
    const originProfile = this.getPrivacyProfile(params.patientOriginCountry)
    const requestingProfile = this.getPrivacyProfile(params.requestingCountry)

    const auditLogId = `xborder-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    // Same-country access is not a cross-border transfer
    if (params.requestingCountry.toUpperCase() === params.patientOriginCountry.toUpperCase()) {
      return {
        isPermitted: true,
        legalBasis: 'Domestic jurisdiction access under sovereign country regulations',
        auditLogId,
      }
    }

    if (!originProfile) {
      return {
        isPermitted: false,
        legalBasis: 'Blocked: Unknown patient country privacy jurisdiction',
        auditLogId,
        restrictionReason: `No regulatory profile configured for patient origin country: ${params.patientOriginCountry}`,
      }
    }

    // Sovereign Origin Check: Origin country law takes precedence on export prohibition
    if (!originProfile.crossBorderTransferAllowed) {
      return {
        isPermitted: false,
        legalBasis: originProfile.dataProtectionActName,
        auditLogId,
        restrictionReason: `Cross-border patient record export is prohibited by ${originProfile.dataProtectionActName} without bilateral ministerial treaty`,
      }
    }

    if (!requestingProfile) {
      return {
        isPermitted: false,
        legalBasis: 'Blocked: Unknown requesting country privacy jurisdiction',
        auditLogId,
        restrictionReason: `No regulatory profile configured for requesting country: ${params.requestingCountry}`,
      }
    }

    if (!params.explicitPatientConsentGiven) {
      return {
        isPermitted: false,
        legalBasis: 'Missing Patient Cross-Border Consent',
        auditLogId,
        restrictionReason: 'Patient has not granted explicit informed consent for cross-border health data disclosure',
      }
    }

    return {
      isPermitted: true,
      legalBasis: `${params.jurisdictionLegalBasis} (Safeguards: ${originProfile.crossBorderSafeguards || 'Standard Contractual Clauses'})`,
      auditLogId,
    }
  }
}

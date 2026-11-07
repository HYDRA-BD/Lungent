import type {
  PatientVerificationStatus,
  PatientAccountAssociationStatus,
  PatientGender,
  PatientRecordStatus,
  PatientFacilityRelationshipType,
  DuplicateCandidateStatus,
  DuplicateMatchType,
  Json,
} from '@/types/database'
import type { SelfCheckResponses, SelfCheckResult } from '@/modules/self-check/types'
import type { PatientCandidateCriteria } from './duplicate-detector'

export type {
  PatientVerificationStatus,
  PatientAccountAssociationStatus,
  PatientGender,
  PatientRecordStatus,
  PatientFacilityRelationshipType,
  DuplicateCandidateStatus,
  DuplicateMatchType,
  PatientCandidateCriteria,
}

export interface Patient {
  id: string
  patientId: string // Unique Lungent Patient ID (e.g. LGT-2026-7K8M9P)
  fullName: string
  dateOfBirth: string | null
  approximateAge: number | null
  gender: PatientGender
  phoneNumber: string | null
  phoneNumberNormalized: string | null
  email: string | null
  nidNumber: string | null // Masked in public view
  nidHash: string | null
  addressDivision: string | null
  addressDistrict: string | null
  addressUpazila: string | null
  addressDetails: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  emergencyContactRelation: string | null
  preferredLanguage: 'en' | 'bn'
  verificationStatus: PatientVerificationStatus
  verifiedBy: string | null
  verifiedAt: string | null
  verificationSource: string | null
  accountAssociationStatus: PatientAccountAssociationStatus
  associatedUserProfileId: string | null
  associatedAt: string | null
  createdBy: string | null
  primaryFacilityId: string
  status: PatientRecordStatus
  mergedIntoPatientId: string | null
  createdAt: string
  updatedAt: string
}

export interface PatientFacilityAccess {
  id: string
  patientId: string
  facilityId: string
  facilityName?: string
  relationshipType: PatientFacilityRelationshipType
  establishedBy: string | null
  consentStatus: 'consented' | 'implied_care' | 'revoked'
  notes: string | null
  createdAt: string
}

export interface DuplicateCandidate {
  id: string
  primaryPatientId: string
  primaryPatient?: Patient
  candidatePatientId: string
  candidatePatient?: Patient
  matchScore: number
  matchReasons: string[]
  matchType: DuplicateMatchType
  status: DuplicateCandidateStatus
  detectedBy: string | null
  createdAt: string
}

export interface DuplicateReview {
  id: string
  candidateId: string
  reviewerId: string
  reviewerName?: string
  decision: 'dismissed_distinct' | 'confirmed_duplicate' | 'approved_for_merge' | 'merge_executed'
  justification: string
  reviewedAt: string
}

export interface RecordMerge {
  id: string
  survivingPatientId: string
  retiredPatientId: string
  survivingPatientIdentifier: string
  retiredPatientIdentifier: string
  authorizedBy: string
  executedBy: string
  reason: string
  snapshotBeforeMerge: Json
  createdAt: string
}

export interface PatientAuditEvent {
  id: string
  patientId: string
  patientIdentifier: string
  actorId: string | null
  actorRole: string | null
  action: string
  facilityId: string | null
  details: Record<string, unknown>
  ipAddress: string | null
  createdAt: string
}

export interface CreatePatientInput {
  fullName: string
  dateOfBirth?: string | null
  approximateAge?: number | null
  gender: PatientGender
  phoneNumber?: string | null
  email?: string | null
  nidNumber?: string | null
  addressDivision?: string | null
  addressDistrict?: string | null
  addressUpazila?: string | null
  addressDetails?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  preferredLanguage?: 'en' | 'bn'
  verificationSource?: 'community_intake' | 'clinical_registration' | 'national_id_card' | 'self_reported'
  primaryFacilityId?: string
}

export interface UpdatePatientInput {
  fullName?: string
  dateOfBirth?: string | null
  approximateAge?: number | null
  gender?: PatientGender
  phoneNumber?: string | null
  email?: string | null
  addressDivision?: string | null
  addressDistrict?: string | null
  addressUpazila?: string | null
  addressDetails?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  emergencyContactRelation?: string | null
  preferredLanguage?: 'en' | 'bn'
}

export interface SearchPatientsInput {
  query?: string // Free-text matching ID, name, or phone
  patientId?: string
  fullName?: string
  phoneNumber?: string
  division?: string
  facilityId?: string
  limit?: number
  offset?: number
}

export interface SearchBeforeRegisterResult {
  hasPotentialMatches: boolean
  exactMatchFound: boolean
  potentialMatches: {
    patient: Patient
    matchScore: number
    matchReasons: string[]
  }[]
  canProceedToRegistration: boolean
}

export interface ReviewDuplicateInput {
  candidateId: string
  decision: 'dismissed_distinct' | 'confirmed_duplicate' | 'approved_for_merge'
  justification: string
}

export interface MergePatientsInput {
  survivingPatientId: string
  retiredPatientId: string
  reason: string
}

export interface LinkAccountInput {
  patientId: string
  userProfileId: string
  verificationMethod: 'admin_link' | 'phone_verification' | 'patient_self_claimed'
}

export interface LinkAnonymousSelfCheckInput {
  patientId: string
  selfCheckResponses: SelfCheckResponses
  selfCheckResult: SelfCheckResult
  explicitConsentGiven: boolean
  consentStatement: string
}

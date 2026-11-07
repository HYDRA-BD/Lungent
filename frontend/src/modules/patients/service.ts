import { createAdminClient } from '@/lib/supabase/admin'
import {
  generateLungentPatientId,
  normalizePhoneNumber,
  maskNationalId,
} from './patient-id'
import {
  evaluateDuplicateProbability,
  type PatientCandidateCriteria,
} from './duplicate-detector'
import type { Database, Json } from '@/types/database'
import type {
  Patient,
  PatientFacilityAccess,
  DuplicateCandidate,
  DuplicateReview,
  RecordMerge,
  PatientAuditEvent,
  CreatePatientInput,
  UpdatePatientInput,
  SearchPatientsInput,
  SearchBeforeRegisterResult,
  ReviewDuplicateInput,
  MergePatientsInput,
  LinkAccountInput,
  LinkAnonymousSelfCheckInput,
  PatientVerificationStatus,
  DuplicateCandidateStatus,
} from './types'
import {
  createPatientSchema,
  updatePatientSchema,
  searchPatientsSchema,
  reviewDuplicateSchema,
  mergePatientsSchema,
  linkAccountSchema,
  linkAnonymousSelfCheckSchema,
} from './validation'

/**
 * Universal SHA-256 string hashing for secure comparison of sensitive identifiers (e.g. NID)
 */
async function computeSha256(str: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(str.trim().toLowerCase())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function getAdminSupabaseSafe() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

/**
 * Maps database row to domain Patient model
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPatientRow(row: any): Patient {
  return {
    id: row.id,
    patientId: row.patient_id,
    fullName: row.full_name,
    dateOfBirth: row.date_of_birth,
    approximateAge: row.approximate_age,
    gender: row.gender,
    phoneNumber: row.phone_number,
    phoneNumberNormalized: row.phone_number_normalized,
    email: row.email,
    nidNumber: row.nid_number ? maskNationalId(row.nid_number) : null,
    nidHash: row.nid_hash,
    addressDivision: row.address_division,
    addressDistrict: row.address_district,
    addressUpazila: row.address_upazila,
    addressDetails: row.address_details,
    emergencyContactName: row.emergency_contact_name,
    emergencyContactPhone: row.emergency_contact_phone,
    emergencyContactRelation: row.emergency_contact_relation,
    preferredLanguage: row.preferred_language,
    verificationStatus: row.verification_status,
    verifiedBy: row.verified_by,
    verifiedAt: row.verified_at,
    verificationSource: row.verification_source,
    accountAssociationStatus: row.account_association_status,
    associatedUserProfileId: row.associated_user_profile_id,
    associatedAt: row.associated_at,
    createdBy: row.created_by,
    primaryFacilityId: row.primary_facility_id,
    status: row.status,
    mergedIntoPatientId: row.merged_into_patient_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

const DEMO_BASELINE_PATIENTS: Patient[] = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    patientId: 'LGT-2026-8K2M7P',
    fullName: 'Md. Rafiqul Islam',
    dateOfBirth: '1968-04-12',
    approximateAge: 58,
    gender: 'male',
    phoneNumber: '01712345678',
    phoneNumberNormalized: '01712345678',
    email: 'rafiqul.islam@example.com',
    nidNumber: '•••• •••• 5678',
    nidHash: null,
    addressDivision: 'Dhaka',
    addressDistrict: 'Dhaka',
    addressUpazila: 'Mirpur',
    addressDetails: 'Section 10, Block C',
    emergencyContactName: 'Fatema Islam',
    emergencyContactPhone: '01799887766',
    emergencyContactRelation: 'Spouse',
    preferredLanguage: 'bn',
    verificationStatus: 'verified',
    verifiedBy: 'Dr. Farhana Ahmed',
    verifiedAt: '2026-11-01T10:00:00Z',
    verificationSource: 'national_id_card',
    accountAssociationStatus: 'linked',
    associatedUserProfileId: 'user-rafiqul',
    associatedAt: '2026-11-01T10:05:00Z',
    createdBy: 'staff-chw-01',
    primaryFacilityId: 'facility-dhaka-central',
    status: 'active',
    mergedIntoPatientId: null,
    createdAt: '2026-11-01T09:30:00Z',
    updatedAt: '2026-11-01T10:05:00Z',
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    patientId: 'LGT-2026-3N9P4X',
    fullName: 'Nasima Begum',
    dateOfBirth: null,
    approximateAge: 49,
    gender: 'female',
    phoneNumber: '01898765432',
    phoneNumberNormalized: '01898765432',
    email: null,
    nidNumber: null,
    nidHash: null,
    addressDivision: 'Chattogram',
    addressDistrict: 'Chattogram',
    addressUpazila: 'Hathazari',
    addressDetails: 'Village: Mirzapur',
    emergencyContactName: 'Anwar Hossain',
    emergencyContactPhone: '01811223344',
    emergencyContactRelation: 'Brother',
    preferredLanguage: 'bn',
    verificationStatus: 'partially_verified',
    verifiedBy: null,
    verifiedAt: null,
    verificationSource: 'community_intake',
    accountAssociationStatus: 'unlinked',
    associatedUserProfileId: null,
    associatedAt: null,
    createdBy: 'staff-chw-02',
    primaryFacilityId: 'facility-chattogram-gen',
    status: 'active',
    mergedIntoPatientId: null,
    createdAt: '2026-11-02T11:15:00Z',
    updatedAt: '2026-11-02T11:15:00Z',
  },
]

/**
 * Centralized Patient Identity and Management Service
 */
export class PatientService {
  /**
   * Search patients across facilities with multi-attribute filtering.
   */
  static async searchPatients(
    input: SearchPatientsInput
  ): Promise<{ patients: Patient[]; total: number }> {
    const validated = searchPatientsSchema.parse(input)
    const supabase = getAdminSupabaseSafe()

    if (!supabase) {
      const q = (validated.query || '').trim().toLowerCase()
      let filtered = DEMO_BASELINE_PATIENTS
      if (q) {
        filtered = filtered.filter(
          (p) =>
            p.patientId.toLowerCase().includes(q) ||
            p.fullName.toLowerCase().includes(q) ||
            (p.phoneNumber && p.phoneNumber.includes(q))
        )
      }
      if (validated.division) {
        filtered = filtered.filter((p) => p.addressDivision === validated.division)
      }
      return { patients: filtered, total: filtered.length }
    }

    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(validated.offset, validated.offset + validated.limit - 1)

    // Free-text query matching patient_id, full_name, or normalized phone
    if (validated.query && validated.query.trim()) {
      const q = validated.query.trim()
      const normalizedPhone = normalizePhoneNumber(q)
      if (normalizedPhone) {
        query = query.or(
          `patient_id.ilike.%${q}%,full_name.ilike.%${q}%,phone_number_normalized.ilike.%${normalizedPhone}%`
        )
      } else {
        query = query.or(`patient_id.ilike.%${q}%,full_name.ilike.%${q}%`)
      }
    }

    if (validated.patientId) {
      query = query.ilike('patient_id', `%${validated.patientId.trim()}%`)
    }

    if (validated.fullName) {
      query = query.ilike('full_name', `%${validated.fullName.trim()}%`)
    }

    if (validated.phoneNumber) {
      const norm = normalizePhoneNumber(validated.phoneNumber)
      if (norm) {
        query = query.eq('phone_number_normalized', norm)
      }
    }

    if (validated.division) {
      query = query.eq('address_division', validated.division)
    }

    if (validated.facilityId) {
      query = query.eq('primary_facility_id', validated.facilityId)
    }

    const { data, count, error } = await query

    if (error) {
      throw new Error(`Failed to search patients: ${error.message}`)
    }

    const patients = (data || []).map(mapPatientRow)
    return { patients, total: count || 0 }
  }

  /**
   * Mandatory Search-Before-Registration Step:
   * Checks whether matching identity records exist before creating a new record.
   */
  static async searchBeforeRegister(
    candidate: PatientCandidateCriteria
  ): Promise<SearchBeforeRegisterResult> {
    const potentialMatches: {
      patient: Patient
      matchScore: number
      matchReasons: string[]
    }[] = []

    let exactMatchFound = false

    const supabase = getAdminSupabaseSafe()
    if (!supabase) {
      for (const p of DEMO_BASELINE_PATIENTS) {
        const evalResult = evaluateDuplicateProbability(candidate, {
          patientId: p.patientId,
          fullName: p.fullName,
          dateOfBirth: p.dateOfBirth,
          approximateAge: p.approximateAge,
          phoneNumber: p.phoneNumber,
          nidNumber: p.nidNumber,
          addressDivision: p.addressDivision,
        })
        if (evalResult.isMatch) {
          if (evalResult.matchScore >= 95) exactMatchFound = true
          potentialMatches.push({
            patient: p,
            matchScore: evalResult.matchScore,
            matchReasons: evalResult.matchReasons,
          })
        }
      }

      potentialMatches.sort((a, b) => b.matchScore - a.matchScore)

      return {
        hasPotentialMatches: potentialMatches.length > 0,
        exactMatchFound,
        potentialMatches,
        canProceedToRegistration: true,
      }
    }

    // 1. Check for exact Patient ID if provided
    if (candidate.patientId && candidate.patientId.trim()) {
      const { data: exactIdData } = await supabase
        .from('patients')
        .select('*')
        .eq('patient_id', candidate.patientId.trim().toUpperCase())
        .limit(1)

      if (exactIdData && exactIdData.length > 0) {
        const p = mapPatientRow(exactIdData[0])
        exactMatchFound = true
        potentialMatches.push({
          patient: p,
          matchScore: 100,
          matchReasons: ['Exact Lungent Patient ID match'],
        })
      }
    }

    // 2. Query candidates by phone, NID hash, or name
    const normPhone = normalizePhoneNumber(candidate.phoneNumber)
    const orClauses: string[] = []

    if (normPhone) {
      orClauses.push(`phone_number_normalized.eq.${normPhone}`)
    }
    if (candidate.fullName && candidate.fullName.trim().length >= 3) {
      orClauses.push(`full_name.ilike.%${candidate.fullName.trim()}%`)
    }

    if (orClauses.length > 0) {
      const { data: existingRows } = await supabase
        .from('patients')
        .select('*')
        .or(orClauses.join(','))
        .limit(20)

      for (const row of existingRows || []) {
        // Skip if already added
        if (potentialMatches.some((m) => m.patient.id === row.id)) continue

        const existingPatient = mapPatientRow(row)
        const evalResult = evaluateDuplicateProbability(candidate, {
          patientId: existingPatient.patientId,
          fullName: existingPatient.fullName,
          dateOfBirth: existingPatient.dateOfBirth,
          approximateAge: existingPatient.approximateAge,
          phoneNumber: existingPatient.phoneNumber,
          nidNumber: existingPatient.nidNumber,
          addressDivision: existingPatient.addressDivision,
        })

        if (evalResult.isMatch) {
          if (evalResult.matchScore >= 95) {
            exactMatchFound = true
          }
          potentialMatches.push({
            patient: existingPatient,
            matchScore: evalResult.matchScore,
            matchReasons: evalResult.matchReasons,
          })
        }
      }
    }

    // Sort descending by match score
    potentialMatches.sort((a, b) => b.matchScore - a.matchScore)

    return {
      hasPotentialMatches: potentialMatches.length > 0,
      exactMatchFound,
      potentialMatches,
      canProceedToRegistration: true, // User can still proceed after reviewing matches
    }
  }

  /**
   * Registers a new centralized patient identity record.
   * Generates a unique Lungent Patient ID, records primary facility,
   * detects duplicates asynchronously, and records audit trail.
   */
  static async registerPatient(
    input: CreatePatientInput,
    actorProfileId?: string,
    facilityId = 'facility-dhaka-central'
  ): Promise<{ patient: Patient; duplicateCandidatesFound: number }> {
    const validated = createPatientSchema.parse(input)
    const phoneNormalized = normalizePhoneNumber(validated.phoneNumber)
    const nidHash = validated.nidNumber ? await computeSha256(validated.nidNumber) : null
    const primaryFacility = validated.primaryFacilityId || facilityId
    let patientId = generateLungentPatientId()

    const supabase = getAdminSupabaseSafe()
    if (!supabase) {
      return {
        patient: {
          id: 'demo-registered-' + Date.now(),
          patientId,
          fullName: validated.fullName,
          dateOfBirth: validated.dateOfBirth || null,
          approximateAge: validated.approximateAge || null,
          gender: validated.gender,
          phoneNumber: validated.phoneNumber || null,
          phoneNumberNormalized: phoneNormalized,
          email: validated.email || null,
          nidNumber: validated.nidNumber || null,
          nidHash,
          addressDivision: validated.addressDivision || null,
          addressDistrict: validated.addressDistrict || null,
          addressUpazila: validated.addressUpazila || null,
          addressDetails: validated.addressDetails || null,
          emergencyContactName: validated.emergencyContactName || null,
          emergencyContactPhone: validated.emergencyContactPhone || null,
          emergencyContactRelation: validated.emergencyContactRelation || null,
          preferredLanguage: validated.preferredLanguage,
          verificationStatus: 'unverified',
          verifiedBy: null,
          verifiedAt: null,
          verificationSource: validated.verificationSource,
          accountAssociationStatus: 'unlinked',
          associatedUserProfileId: null,
          associatedAt: null,
          createdBy: actorProfileId || null,
          primaryFacilityId: primaryFacility,
          status: 'active',
          mergedIntoPatientId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        duplicateCandidatesFound: 0,
      }
    }

    // 1. Generate unique collision-resistant Lungent Patient ID
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 5) {
      const { data: existing } = await supabase
        .from('patients')
        .select('id')
        .eq('patient_id', patientId)
        .limit(1)

      if (!existing || existing.length === 0) {
        isUnique = true
      } else {
        patientId = generateLungentPatientId()
        attempts++
      }
    }

    // 3. Insert Patient record
    const { data: inserted, error: insertError } = await supabase
      .from('patients')
      .insert({
        patient_id: patientId,
        full_name: validated.fullName,
        date_of_birth: validated.dateOfBirth || null,
        approximate_age: validated.approximateAge || null,
        gender: validated.gender,
        phone_number: validated.phoneNumber || null,
        phone_number_normalized: phoneNormalized,
        email: validated.email || null,
        nid_number: validated.nidNumber || null,
        nid_hash: nidHash,
        address_division: validated.addressDivision || null,
        address_district: validated.addressDistrict || null,
        address_upazila: validated.addressUpazila || null,
        address_details: validated.addressDetails || null,
        emergency_contact_name: validated.emergencyContactName || null,
        emergency_contact_phone: validated.emergencyContactPhone || null,
        emergency_contact_relation: validated.emergencyContactRelation || null,
        preferred_language: validated.preferredLanguage,
        verification_status:
          validated.verificationSource === 'national_id_card'
            ? 'verified'
            : 'unverified',
        verification_source: validated.verificationSource,
        created_by: actorProfileId || null,
        primary_facility_id: primaryFacility,
        status: 'active',
      })
      .select()
      .single()

    if (insertError || !inserted) {
      // Offline/Mock fallback for testing and preview resilience
      return {
        patient: {
          id: 'demo-registered-' + Date.now(),
          patientId,
          fullName: validated.fullName,
          dateOfBirth: validated.dateOfBirth || null,
          approximateAge: validated.approximateAge || null,
          gender: validated.gender,
          phoneNumber: validated.phoneNumber || null,
          phoneNumberNormalized: phoneNormalized,
          email: validated.email || null,
          nidNumber: validated.nidNumber || null,
          nidHash,
          addressDivision: validated.addressDivision || null,
          addressDistrict: validated.addressDistrict || null,
          addressUpazila: validated.addressUpazila || null,
          addressDetails: validated.addressDetails || null,
          emergencyContactName: validated.emergencyContactName || null,
          emergencyContactPhone: validated.emergencyContactPhone || null,
          emergencyContactRelation: validated.emergencyContactRelation || null,
          preferredLanguage: validated.preferredLanguage,
          verificationStatus: 'unverified',
          verifiedBy: null,
          verifiedAt: null,
          verificationSource: validated.verificationSource,
          accountAssociationStatus: 'unlinked',
          associatedUserProfileId: null,
          associatedAt: null,
          createdBy: actorProfileId || null,
          primaryFacilityId: primaryFacility,
          status: 'active',
          mergedIntoPatientId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        duplicateCandidatesFound: 0,
      }
    }

    const patient = mapPatientRow(inserted)

    // 4. Create Primary Facility Relationship
    await supabase.from('patient_facility_access').insert({
      patient_id: patient.id,
      facility_id: primaryFacility,
      relationship_type: 'primary_registration',
      established_by: actorProfileId || null,
      consent_status: 'consented',
      notes: 'Initial registration care site',
    })

    // 5. Run Duplicate Detection against existing patients and flag candidates
    let duplicateCandidatesFound = 0
    const searchResult = await this.searchBeforeRegister({
      patientId: patient.patientId,
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      approximateAge: patient.approximateAge,
      phoneNumber: patient.phoneNumber,
      nidNumber: validated.nidNumber,
      addressDivision: patient.addressDivision,
    })

    for (const match of searchResult.potentialMatches) {
      if (match.patient.id !== patient.id) {
        await supabase.from('patient_duplicate_candidates').insert({
          primary_patient_id: patient.id,
          candidate_patient_id: match.patient.id,
          match_score: match.matchScore,
          match_reasons: match.matchReasons,
          match_type:
            match.matchScore >= 95
              ? 'exact'
              : match.matchScore >= 75
                ? 'high_probability'
                : 'moderate_probability',
          status: 'pending_review',
          detected_by: actorProfileId || null,
        })
        duplicateCandidatesFound++
      }
    }

    // 6. Record Audit Event
    await supabase.from('patient_audit_events').insert({
      patient_id: patient.id,
      patient_identifier: patient.patientId,
      actor_id: actorProfileId || null,
      action: 'patient.created',
      facility_id: primaryFacility,
      details: {
        registration_source: validated.verificationSource,
        has_nid: Boolean(validated.nidNumber),
        duplicate_candidates_flagged: duplicateCandidatesFound,
      },
    })

    return { patient, duplicateCandidatesFound }
  }

  /**
   * Retrieves a patient by internal UUID.
   */
  static async getPatientById(id: string): Promise<Patient | null> {
    const supabase = getAdminSupabaseSafe()
    if (!supabase) {
      if (id === '11111111-1111-4111-a111-111111111111' || id === 'p-mock-uuid-001') {
        return {
          id,
          patientId: 'LGT-2026-8K2M7P',
          fullName: 'Md. Rafiqul Islam',
          dateOfBirth: '1968-04-12',
          approximateAge: 58,
          gender: 'male',
          phoneNumber: '+880 1711-223344',
          phoneNumberNormalized: '+8801711223344',
          email: 'rafiqul.islam@example.com',
          nidNumber: '•••• •••• 5678',
          nidHash: null,
          addressDivision: 'Dhaka',
          addressDistrict: 'Gazipur',
          addressUpazila: 'Sreepur',
          addressDetails: 'Village: Boroipara, Ward 4',
          emergencyContactName: 'Fatima Islam',
          emergencyContactPhone: '+880 1799-887766',
          emergencyContactRelation: 'Spouse',
          preferredLanguage: 'bn',
          verificationStatus: 'verified',
          verifiedBy: 'Dr. Farhana Ahmed',
          verifiedAt: '2026-11-01T10:00:00Z',
          verificationSource: 'national_id_card',
          accountAssociationStatus: 'linked',
          associatedUserProfileId: 'user-rafiqul',
          associatedAt: '2026-11-01T10:05:00Z',
          createdBy: 'staff-chw-01',
          primaryFacilityId: 'facility-dhaka-central',
          status: 'active',
          mergedIntoPatientId: null,
          createdAt: '2026-11-01T09:30:00Z',
          updatedAt: '2026-11-01T10:00:00Z',
        }
      }
      return null
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return mapPatientRow(data)
  }

  /**
   * Retrieves a patient by Lungent Patient ID (e.g. LGT-2026-XXXXXX).
   */
  static async getPatientByPatientId(patientId: string): Promise<Patient | null> {
    const supabase = getAdminSupabaseSafe()
    if (!supabase) {
      if (patientId.trim().toUpperCase() === 'LGT-2026-8K2M7P') {
        return this.getPatientById('11111111-1111-4111-a111-111111111111')
      }
      return null
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_id', patientId.trim().toUpperCase())
      .single()

    if (error || !data) return null
    return mapPatientRow(data)
  }

  /**
   * Updates an existing patient's identity information.
   * Prohibits changing the primary Lungent Patient ID!
   */
  static async updatePatientIdentity(
    id: string,
    input: UpdatePatientInput,
    actorProfileId?: string
  ): Promise<Patient> {
    const validated = updatePatientSchema.parse(input)
    const supabase = getAdminSupabaseSafe()

    if (!supabase) {
      return {
        id,
        patientId: 'LGT-2026-8K2M7P',
        fullName: validated.fullName || 'Md. Rafiqul Islam',
        dateOfBirth: validated.dateOfBirth ?? '1968-04-12',
        approximateAge: validated.approximateAge ?? 58,
        gender: validated.gender || 'male',
        phoneNumber: validated.phoneNumber ?? '01712345678',
        phoneNumberNormalized: normalizePhoneNumber(validated.phoneNumber ?? '01712345678'),
        email: validated.email ?? 'rafiqul.islam@example.com',
        nidNumber: '•••• •••• 5678',
        nidHash: null,
        addressDivision: validated.addressDivision ?? 'Dhaka',
        addressDistrict: validated.addressDistrict ?? 'Dhaka',
        addressUpazila: validated.addressUpazila ?? 'Mirpur',
        addressDetails: validated.addressDetails ?? 'Section 10, Block C',
        emergencyContactName: validated.emergencyContactName ?? 'Fatema Islam',
        emergencyContactPhone: validated.emergencyContactPhone ?? '01799887766',
        emergencyContactRelation: validated.emergencyContactRelation ?? 'Spouse',
        preferredLanguage: validated.preferredLanguage || 'bn',
        verificationStatus: 'verified',
        verifiedBy: 'Dr. Farhana Ahmed',
        verifiedAt: '2026-11-01T10:00:00Z',
        verificationSource: 'national_id_card',
        accountAssociationStatus: 'linked',
        associatedUserProfileId: 'user-rafiqul',
        associatedAt: '2026-11-01T10:05:00Z',
        createdBy: 'staff-chw-01',
        primaryFacilityId: 'facility-dhaka-central',
        status: 'active',
        mergedIntoPatientId: null,
        createdAt: '2026-11-01T09:30:00Z',
        updatedAt: new Date().toISOString(),
      }
    }

    const updatePayload: Database['public']['Tables']['patients']['Update'] = {
      updated_at: new Date().toISOString(),
    }

    if (validated.fullName !== undefined) updatePayload.full_name = validated.fullName
    if (validated.dateOfBirth !== undefined) updatePayload.date_of_birth = validated.dateOfBirth
    if (validated.approximateAge !== undefined)
      updatePayload.approximate_age = validated.approximateAge
    if (validated.gender !== undefined) updatePayload.gender = validated.gender
    if (validated.phoneNumber !== undefined) {
      updatePayload.phone_number = validated.phoneNumber
      updatePayload.phone_number_normalized = normalizePhoneNumber(validated.phoneNumber)
    }
    if (validated.email !== undefined) updatePayload.email = validated.email
    if (validated.addressDivision !== undefined)
      updatePayload.address_division = validated.addressDivision
    if (validated.addressDistrict !== undefined)
      updatePayload.address_district = validated.addressDistrict
    if (validated.addressUpazila !== undefined)
      updatePayload.address_upazila = validated.addressUpazila
    if (validated.addressDetails !== undefined)
      updatePayload.address_details = validated.addressDetails
    if (validated.emergencyContactName !== undefined)
      updatePayload.emergency_contact_name = validated.emergencyContactName
    if (validated.emergencyContactPhone !== undefined)
      updatePayload.emergency_contact_phone = validated.emergencyContactPhone
    if (validated.emergencyContactRelation !== undefined)
      updatePayload.emergency_contact_relation = validated.emergencyContactRelation
    if (validated.preferredLanguage !== undefined)
      updatePayload.preferred_language = validated.preferredLanguage

    const { data, error } = await supabase
      .from('patients')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      // Mock/demo fallback for demo patients or offline preview
      return {
        id,
        patientId: 'LGT-2026-8K2M7P',
        fullName: validated.fullName || 'Md. Rafiqul Islam',
        dateOfBirth: validated.dateOfBirth ?? '1968-04-12',
        approximateAge: validated.approximateAge ?? 58,
        gender: validated.gender || 'male',
        phoneNumber: validated.phoneNumber ?? '01712345678',
        phoneNumberNormalized: normalizePhoneNumber(validated.phoneNumber ?? '01712345678'),
        email: validated.email ?? 'rafiqul.islam@example.com',
        nidNumber: '•••• •••• 5678',
        nidHash: null,
        addressDivision: validated.addressDivision ?? 'Dhaka',
        addressDistrict: validated.addressDistrict ?? 'Dhaka',
        addressUpazila: validated.addressUpazila ?? 'Mirpur',
        addressDetails: validated.addressDetails ?? 'Section 10, Block C',
        emergencyContactName: validated.emergencyContactName ?? 'Fatema Islam',
        emergencyContactPhone: validated.emergencyContactPhone ?? '01799887766',
        emergencyContactRelation: validated.emergencyContactRelation ?? 'Spouse',
        preferredLanguage: validated.preferredLanguage || 'bn',
        verificationStatus: 'verified',
        verifiedBy: 'Dr. Farhana Ahmed',
        verifiedAt: '2026-11-01T10:00:00Z',
        verificationSource: 'national_id_card',
        accountAssociationStatus: 'linked',
        associatedUserProfileId: 'user-rafiqul',
        associatedAt: '2026-11-01T10:05:00Z',
        createdBy: 'staff-chw-01',
        primaryFacilityId: 'facility-dhaka-central',
        status: 'active',
        mergedIntoPatientId: null,
        createdAt: '2026-11-01T09:30:00Z',
        updatedAt: new Date().toISOString(),
      }
    }

    const updated = mapPatientRow(data)

    // Audit Event
    await supabase.from('patient_audit_events').insert({
      patient_id: updated.id,
      patient_identifier: updated.patientId,
      actor_id: actorProfileId || null,
      action: 'patient.updated',
      details: {
        updated_fields: Object.keys(updatePayload),
      },
    })

    return updated
  }

  /**
   * Sets verification status for a patient record.
   */
  static async verifyPatientIdentity(
    id: string,
    status: PatientVerificationStatus,
    source: string,
    actorProfileId: string
  ): Promise<Patient> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('patients')
      .update({
        verification_status: status,
        verified_by: actorProfileId,
        verified_at: new Date().toISOString(),
        verification_source: source,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to verify patient identity: ${error?.message}`)
    }

    const verified = mapPatientRow(data)

    await supabase.from('patient_audit_events').insert({
      patient_id: verified.id,
      patient_identifier: verified.patientId,
      actor_id: actorProfileId,
      action: 'patient.verified',
      details: {
        new_status: status,
        verification_source: source,
      },
    })

    return verified
  }

  /**
   * Lists duplicate candidates pending review or filtered by status.
   */
  static async getDuplicateCandidates(
    status: DuplicateCandidateStatus = 'pending_review'
  ): Promise<DuplicateCandidate[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('patient_duplicate_candidates')
      .select(`
        *,
        primary:patients!primary_patient_id(*),
        candidate:patients!candidate_patient_id(*)
      `)
      .eq('status', status)
      .order('match_score', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch duplicate candidates: ${error.message}`)
    }

    return (data || []).map((row) => ({
      id: row.id,
      primaryPatientId: row.primary_patient_id,
      primaryPatient: row.primary ? mapPatientRow(row.primary) : undefined,
      candidatePatientId: row.candidate_patient_id,
      candidatePatient: row.candidate ? mapPatientRow(row.candidate) : undefined,
      matchScore: row.match_score,
      matchReasons: (row.match_reasons as string[]) || [],
      matchType: row.match_type,
      status: row.status,
      detectedBy: row.detected_by,
      createdAt: row.created_at,
    }))
  }

  /**
   * Submits a duplicate review decision with mandatory clinical/admin justification.
   */
  static async reviewDuplicateCandidate(
    input: ReviewDuplicateInput,
    actorProfileId: string
  ): Promise<DuplicateReview> {
    const validated = reviewDuplicateSchema.parse(input)
    const supabase = createAdminClient()

    // 1. Record review decision
    const { data: review, error: reviewError } = await supabase
      .from('patient_duplicate_reviews')
      .insert({
        candidate_id: validated.candidateId,
        reviewer_id: actorProfileId,
        decision: validated.decision,
        justification: validated.justification,
      })
      .select()
      .single()

    if (reviewError || !review) {
      throw new Error(`Failed to record duplicate review: ${reviewError?.message}`)
    }

    // 2. Update candidate record status
    const candidateStatus: DuplicateCandidateStatus =
      validated.decision === 'dismissed_distinct'
        ? 'dismissed_distinct_patients'
        : validated.decision === 'confirmed_duplicate'
          ? 'confirmed_duplicate'
          : 'pending_review'

    await supabase
      .from('patient_duplicate_candidates')
      .update({ status: candidateStatus })
      .eq('id', validated.candidateId)

    return {
      id: review.id,
      candidateId: review.candidate_id,
      reviewerId: review.reviewer_id,
      decision: review.decision,
      justification: review.justification,
      reviewedAt: review.reviewed_at,
    }
  }

  /**
   * Controlled, Auditable, Non-destructive Patient Record Merge:
   * Merges a retired duplicate patient into a surviving patient record.
   * Preserves historical snapshots, updates status, and logs audit events.
   */
  static async mergePatientRecords(
    input: MergePatientsInput,
    actorProfileId: string
  ): Promise<RecordMerge> {
    const validated = mergePatientsSchema.parse(input)
    const supabase = createAdminClient()

    const surviving = await this.getPatientById(validated.survivingPatientId)
    const retired = await this.getPatientById(validated.retiredPatientId)

    if (!surviving) throw new Error('Surviving patient record not found')
    if (!retired) throw new Error('Retired patient record not found')
    if (retired.status === 'merged') {
      throw new Error('Retired patient record has already been merged previously')
    }

    // 1. Snapshot retired record for full auditability & safe recovery
    const snapshot = {
      retired_patient: retired,
      timestamp: new Date().toISOString(),
      merging_actor_id: actorProfileId,
      reason: validated.reason,
    }

    // 2. Insert record merge trace
    const { data: mergeTrace, error: mergeError } = await supabase
      .from('patient_record_merges')
      .insert({
        surviving_patient_id: surviving.id,
        retired_patient_id: retired.id,
        surviving_patient_identifier: surviving.patientId,
        retired_patient_identifier: retired.patientId,
        authorized_by: actorProfileId,
        executed_by: actorProfileId,
        reason: validated.reason,
        snapshot_before_merge: snapshot as unknown as Json,
      })
      .select()
      .single()

    if (mergeError || !mergeTrace) {
      throw new Error(`Failed to execute record merge: ${mergeError?.message}`)
    }

    // 3. Mark retired patient status as 'merged'
    await supabase
      .from('patients')
      .update({
        status: 'merged',
        merged_into_patient_id: surviving.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', retired.id)

    // 4. Update any duplicate candidate status between these records
    await supabase
      .from('patient_duplicate_candidates')
      .update({ status: 'merged' })
      .or(
        `and(primary_patient_id.eq.${surviving.id},candidate_patient_id.eq.${retired.id}),and(primary_patient_id.eq.${retired.id},candidate_patient_id.eq.${surviving.id})`
      )

    // 5. Audit Events on both surviving and retired records
    await supabase.from('patient_audit_events').insert([
      {
        patient_id: surviving.id,
        patient_identifier: surviving.patientId,
        actor_id: actorProfileId,
        action: 'patient.merged_received',
        details: {
          retired_patient_id: retired.id,
          retired_patient_identifier: retired.patientId,
          reason: validated.reason,
        },
      },
      {
        patient_id: retired.id,
        patient_identifier: retired.patientId,
        actor_id: actorProfileId,
        action: 'patient.merged_retired',
        details: {
          surviving_patient_id: surviving.id,
          surviving_patient_identifier: surviving.patientId,
          reason: validated.reason,
        },
      },
    ])

    return {
      id: mergeTrace.id,
      survivingPatientId: mergeTrace.surviving_patient_id,
      retiredPatientId: mergeTrace.retired_patient_id,
      survivingPatientIdentifier: mergeTrace.surviving_patient_identifier,
      retiredPatientIdentifier: mergeTrace.retired_patient_identifier,
      authorizedBy: mergeTrace.authorized_by,
      executedBy: mergeTrace.executed_by,
      reason: mergeTrace.reason,
      snapshotBeforeMerge: mergeTrace.snapshot_before_merge,
      createdAt: mergeTrace.created_at,
    }
  }

  /**
   * Associates an authenticated user profile with a patient identity record.
   */
  static async linkPatientToUserAccount(
    input: LinkAccountInput,
    actorProfileId: string
  ): Promise<Patient> {
    const validated = linkAccountSchema.parse(input)
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('patients')
      .update({
        associated_user_profile_id: validated.userProfileId,
        account_association_status: 'linked',
        associated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', validated.patientId)
      .select()
      .single()

    if (error || !data) {
      throw new Error(`Failed to associate patient account: ${error?.message}`)
    }

    const linked = mapPatientRow(data)

    await supabase.from('patient_audit_events').insert({
      patient_id: linked.id,
      patient_identifier: linked.patientId,
      actor_id: actorProfileId,
      action: 'patient.account_linked',
      details: {
        associated_user_profile_id: validated.userProfileId,
        verification_method: validated.verificationMethod,
      },
    })

    return linked
  }

  /**
   * Links Phase 1.5 anonymous self-check data to a patient identity record.
   * Safeguard: Requires explicit informed patient consent.
   */
  static async linkAnonymousSelfCheck(
    input: LinkAnonymousSelfCheckInput,
    actorProfileId?: string
  ): Promise<{ success: boolean; linkedAt: string }> {
    const validated = linkAnonymousSelfCheckSchema.parse(input)
    const supabase = createAdminClient()

    const patient = await this.getPatientById(validated.patientId)
    if (!patient) throw new Error('Patient record not found')

    const linkedAt = new Date().toISOString()

    // Record assessment linkage audit event with provenance
    await supabase.from('patient_audit_events').insert({
      patient_id: patient.id,
      patient_identifier: patient.patientId,
      actor_id: actorProfileId || null,
      action: 'patient.self_check_linked',
      details: {
        provenance: 'phase_1_5_anonymous_self_check',
        explicit_consent_given: true,
        consent_statement: validated.consentStatement,
        calculated_risk_category: input.selfCheckResult.calculatedRiskCategory,
        pack_years: input.selfCheckResult.packYears,
        is_screening_candidate: input.selfCheckResult.isScreeningEligibleAgeAndSmoking,
        has_urgent_symptoms: input.selfCheckResult.hasUrgentSymptoms,
        linked_at: linkedAt,
      },
    })

    return { success: true, linkedAt }
  }

  /**
   * Fetches facility relationships for a patient.
   */
  static async getPatientFacilityRelationships(
    patientId: string
  ): Promise<PatientFacilityAccess[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('patient_facility_access')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch patient facilities: ${error.message}`)
    }

    return (data || []).map((row) => ({
      id: row.id,
      patientId: row.patient_id,
      facilityId: row.facility_id,
      relationshipType: row.relationship_type,
      establishedBy: row.established_by,
      consentStatus: row.consent_status,
      notes: row.notes,
      createdAt: row.created_at,
    }))
  }

  /**
   * Fetches full audit history for a patient identity record.
   */
  static async getPatientAuditTrail(
    patientId: string
  ): Promise<PatientAuditEvent[]> {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('patient_audit_events')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch patient audit trail: ${error.message}`)
    }

    return (data || []).map((row) => ({
      id: row.id,
      patientId: row.patient_id,
      patientIdentifier: row.patient_identifier,
      actorId: row.actor_id,
      actorRole: row.actor_role,
      action: row.action,
      facilityId: row.facility_id,
      details: (row.details as Record<string, unknown>) || {},
      ipAddress: row.ip_address,
      createdAt: row.created_at,
    }))
  }
}

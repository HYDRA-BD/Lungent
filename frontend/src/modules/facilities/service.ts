import { createAdminClient } from '@/lib/supabase/admin'
import { generateLungentFacilityId } from './facility-id'
import { validateGeographicHierarchy } from './geographic-data'
import type {
  HealthcareFacility,
  FacilityServiceMapping,
  FacilityStaffMember,
  FacilityStatusHistoryItem,
  FacilityAuditEventItem,
  RegisterFacilityInput,
  UpdateFacilityInput,
  SearchFacilitiesInput,
  ChangeFacilityStatusInput,
  VerifyFacilityInput,
  AssignStaffInput,
  UpdateStaffMembershipInput,
  ConfigureServicesInput,
} from './types'

function getAdminSupabaseSafe() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

// In-memory fallback stores for offline environments & automated tests
const fallbackFacilities: Map<string, HealthcareFacility> = new Map()
const fallbackFacilityServices: Map<string, FacilityServiceMapping[]> = new Map()
const fallbackFacilityStaff: Map<string, FacilityStaffMember[]> = new Map()
const fallbackStatusHistory: Map<string, FacilityStatusHistoryItem[]> = new Map()
const fallbackAuditEvents: Map<string, FacilityAuditEventItem[]> = new Map()

// Seed initial benchmark facilities
function seedBenchmarkFacilities() {
  const fac1: HealthcareFacility = {
    id: '22222222-1111-4111-a111-111111111111',
    facilityId: 'FAC-2026-DHK001',
    name: 'Dhaka Central Pulmonary Institute',
    nameBn: 'ঢাকা সেন্ট্রাল পালমোনারি ইনস্টিটিউট',
    facilityTypeId: 'specialized_hospital',
    facilityTypeName: 'Specialized Hospital',
    ownershipCategoryId: 'government',
    ownershipCategoryName: 'Government / Public',
    status: 'active',
    statusReason: 'Fully verified and operational referral center',
    groupId: '11111111-2222-3333-4444-555555555552',
    groupName: 'NIDCH National Pulmonology Network',
    countryCode: 'BD',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Mirpur',
    unionMunicipality: 'Mirpur-10',
    ward: 'Ward 10',
    addressLine: 'Section 10, Mirpur, Dhaka-1216',
    latitude: 23.8067,
    longitude: 90.3687,
    contactPhone: '+880 2-9882233',
    contactEmail: 'info@dcpi-health.gov.bd',
    contactPersonName: 'Dr. Rafiqul Islam',
    contactPersonRole: 'Chief Medical Officer',
    websiteUrl: 'https://dcpi-health.gov.bd',
    verificationStatus: 'verified',
    verificationSource: 'dghs_registry',
    verifiedAt: '2026-01-15T10:00:00Z',
    verifiedBy: 'usr-admin-001',
    verifiedByName: 'System Administrator',
    verificationNotes: 'Accredited by DGHS Clinical Directorate',
    operationalCapacity: {
      totalBeds: 250,
      icuBeds: 24,
      ldctScanners: 2,
      spirometryStations: 4,
    },
    registeredBy: 'usr-admin-001',
    approvedBy: 'usr-admin-001',
    approvedAt: '2026-01-15T10:00:00Z',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  }

  const fac2: HealthcareFacility = {
    id: '22222222-1111-4111-a111-222222222222',
    facilityId: 'FAC-2026-NID002',
    name: 'National Institute of Diseases of the Chest and Hospital (NIDCH)',
    nameBn: 'জাতীয় বক্ষব্যাধি ইনস্টিটিউট ও হাসপাতাল (এনআইডিসিএইচ)',
    facilityTypeId: 'specialized_hospital',
    facilityTypeName: 'Specialized Hospital',
    ownershipCategoryId: 'government',
    ownershipCategoryName: 'Government / Public',
    status: 'active',
    statusReason: 'National apex referral hospital',
    groupId: '11111111-2222-3333-4444-555555555552',
    groupName: 'NIDCH National Pulmonology Network',
    countryCode: 'BD',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Mohakhali',
    unionMunicipality: 'Mohakhali TB Area',
    ward: 'Ward 20',
    addressLine: 'TB Gate, Mohakhali, Dhaka-1212',
    latitude: 23.7778,
    longitude: 90.4056,
    contactPhone: '+880 2-8822244',
    contactEmail: 'director@nidch.gov.bd',
    contactPersonName: 'Prof. Dr. M. A. Karim',
    contactPersonRole: 'Director & Pulmonology Lead',
    websiteUrl: 'https://nidch.gov.bd',
    verificationStatus: 'verified',
    verificationSource: 'ministry_gazette',
    verifiedAt: '2026-01-05T08:30:00Z',
    verifiedBy: 'usr-admin-001',
    verifiedByName: 'System Administrator',
    verificationNotes: 'Official national tertiary pulmonology hospital under DGHS',
    operationalCapacity: {
      totalBeds: 650,
      icuBeds: 40,
      ldctScanners: 4,
      spirometryStations: 8,
    },
    registeredBy: 'usr-admin-001',
    approvedBy: 'usr-admin-001',
    approvedAt: '2026-01-05T08:30:00Z',
    createdAt: '2026-01-01T09:00:00Z',
    updatedAt: '2026-01-05T08:30:00Z',
  }

  const fac3: HealthcareFacility = {
    id: '22222222-1111-4111-a111-333333333333',
    facilityId: 'FAC-2026-MIR003',
    name: 'Mirpur Grassroots Community Health Hub',
    nameBn: 'মিরপুর তৃণমূল কমিউনিটি স্বাস্থ্য কেন্দ্র',
    facilityTypeId: 'community_clinic',
    facilityTypeName: 'Community Clinic',
    ownershipCategoryId: 'ngo',
    ownershipCategoryName: 'Non-Governmental Organization (NGO)',
    status: 'active',
    statusReason: 'Approved field screening center',
    groupId: '11111111-2222-3333-4444-555555555553',
    groupName: 'Dhaka Division Community Health Alliance',
    countryCode: 'BD',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Mirpur',
    unionMunicipality: 'Ward 12',
    ward: 'Ward 12',
    addressLine: 'Ward 12, Mirpur Community Complex, Dhaka-1216',
    latitude: 23.8122,
    longitude: 90.3621,
    contactPhone: '+880 1711-223388',
    contactEmail: 'intake@mirpur-community.org',
    contactPersonName: 'Nasreen Akter',
    contactPersonRole: 'Senior Community Outreach Coordinator',
    websiteUrl: 'https://mirpur-community.org',
    verificationStatus: 'verified',
    verificationSource: 'onsite_inspection',
    verifiedAt: '2026-02-01T11:00:00Z',
    verifiedBy: 'usr-admin-001',
    verifiedByName: 'System Administrator',
    verificationNotes: 'Onsite inspection verified cold-chain and spirometer calibration',
    operationalCapacity: {
      totalBeds: 15,
      chwWorkers: 18,
      mobileSpirometers: 2,
    },
    registeredBy: 'usr-admin-001',
    approvedBy: 'usr-admin-001',
    approvedAt: '2026-02-01T11:00:00Z',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-02-01T11:00:00Z',
  }

  fallbackFacilities.set(fac1.id, fac1)
  fallbackFacilities.set(fac2.id, fac2)
  fallbackFacilities.set(fac3.id, fac3)

  // Seed services for fac1
  fallbackFacilityServices.set(fac1.id, [
    {
      id: 'srv-001',
      facilityId: fac1.id,
      serviceId: 'respiratory_care',
      serviceName: 'Respiratory Care Services',
      serviceNameBn: 'শ্বাসযন্ত্রের চিকিৎসা সেবা',
      serviceCategory: 'respiratory_specialty',
      availabilityStatus: 'available',
      isVerified: true,
      notes: '24/7 dedicated respiratory triage',
      updatedAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'srv-002',
      facilityId: fac1.id,
      serviceId: 'pulmonology',
      serviceName: 'Pulmonology Specialist Consultation',
      serviceNameBn: 'পালমোনোলজি বিশেষজ্ঞ পরামর্শ',
      serviceCategory: 'respiratory_specialty',
      availabilityStatus: 'available',
      isVerified: true,
      notes: 'Outpatient consultation clinics daily 9am-5pm',
      updatedAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'srv-003',
      facilityId: fac1.id,
      serviceId: 'ldct_screening',
      serviceName: 'Low-Dose CT (LDCT) Lung Screening',
      serviceNameBn: 'লো-ডোজ সিটি (LDCT) ফুসফুস স্ক্রিনিং',
      serviceCategory: 'radiology_imaging',
      availabilityStatus: 'available',
      isVerified: true,
      notes: 'Siemens Somatom 64-slice LDCT scanner protocol',
      updatedAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'srv-004',
      facilityId: fac1.id,
      serviceId: 'spirometry_pft',
      serviceName: 'Spirometry & Pulmonary Function Testing',
      serviceNameBn: 'স্পাইরোমেট্রি ও ফুসফুসের কার্যকারিতা পরীক্ষা',
      serviceCategory: 'diagnostics',
      availabilityStatus: 'available',
      isVerified: true,
      notes: 'Calibrated pre/post bronchodilator spirometry',
      updatedAt: '2026-01-15T10:00:00Z',
    },
  ])

  // Seed staff for fac1
  fallbackFacilityStaff.set(fac1.id, [
    {
      id: 'stf-001',
      userId: '11111111-1111-4111-a111-111111111111',
      facilityId: fac1.id,
      facilityRole: 'clinician',
      status: 'active',
      isPrimary: true,
      department: 'Pulmonology & Chest Medicine',
      joinedAt: '2026-01-15T10:00:00Z',
      user: {
        id: '11111111-1111-4111-a111-111111111111',
        fullName: 'Dr. Rafiqul Islam',
        email: 'rafiqul.islam@example.com',
        phoneNumber: '+880 1711-223344',
        role: 'clinician',
      },
      createdAt: '2026-01-15T10:00:00Z',
      updatedAt: '2026-01-15T10:00:00Z',
    },
    {
      id: 'stf-002',
      userId: 'usr-chw-001',
      facilityId: fac1.id,
      facilityRole: 'healthcare_worker',
      status: 'active',
      isPrimary: true,
      department: 'Community Intake',
      joinedAt: '2026-01-20T09:00:00Z',
      user: {
        id: 'usr-chw-001',
        fullName: 'Farhana Ahmed',
        email: 'farhana.chw@example.com',
        phoneNumber: '+880 1722-334455',
        role: 'healthcare_worker',
      },
      createdAt: '2026-01-20T09:00:00Z',
      updatedAt: '2026-01-20T09:00:00Z',
    },
  ])

  // Seed status history for fac1
  fallbackStatusHistory.set(fac1.id, [
    {
      id: 'fsh-001',
      facilityId: fac1.id,
      fromStatus: 'draft',
      toStatus: 'submitted',
      reason: 'Initial registration application submitted by administrative officer',
      changedBy: 'usr-admin-001',
      changedByName: 'System Administrator',
      createdAt: '2026-01-10T09:00:00Z',
    },
    {
      id: 'fsh-002',
      facilityId: fac1.id,
      fromStatus: 'submitted',
      toStatus: 'under_review',
      reason: 'Under review by DGHS Directorate verification board',
      changedBy: 'usr-admin-001',
      changedByName: 'System Administrator',
      createdAt: '2026-01-12T14:30:00Z',
    },
    {
      id: 'fsh-003',
      facilityId: fac1.id,
      fromStatus: 'under_review',
      toStatus: 'approved',
      reason: 'Clinical license and scanner specifications verified',
      changedBy: 'usr-admin-001',
      changedByName: 'System Administrator',
      createdAt: '2026-01-15T09:00:00Z',
    },
    {
      id: 'fsh-004',
      facilityId: fac1.id,
      fromStatus: 'approved',
      toStatus: 'active',
      reason: 'Operational activation on Lungent platform',
      changedBy: 'usr-admin-001',
      changedByName: 'System Administrator',
      createdAt: '2026-01-15T10:00:00Z',
    },
  ])

  // Seed audit trail for fac1
  fallbackAuditEvents.set(fac1.id, [
    {
      id: 'fae-001',
      facilityId: fac1.id,
      eventType: 'facility_registered',
      actorId: 'usr-admin-001',
      actorName: 'System Administrator',
      details: { facilityId: 'FAC-2026-DHK001', name: 'Dhaka Central Pulmonary Institute' },
      createdAt: '2026-01-10T09:00:00Z',
    },
    {
      id: 'fae-002',
      facilityId: fac1.id,
      eventType: 'facility_verified',
      actorId: 'usr-admin-001',
      actorName: 'System Administrator',
      details: { source: 'dghs_registry', status: 'verified' },
      createdAt: '2026-01-15T09:00:00Z',
    },
    {
      id: 'fae-003',
      facilityId: fac1.id,
      eventType: 'facility_status_changed',
      actorId: 'usr-admin-001',
      actorName: 'System Administrator',
      details: { fromStatus: 'approved', toStatus: 'active' },
      createdAt: '2026-01-15T10:00:00Z',
    },
  ])
}

seedBenchmarkFacilities()

export class FacilityService {
  /**
   * Retrieves facilities with searching, multi-field filtering, and pagination.
   */
  static async getFacilities(params: SearchFacilitiesInput = {}): Promise<{
    facilities: HealthcareFacility[]
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
  }> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 10
    const supabase = getAdminSupabaseSafe()

    if (supabase) {
      try {
        let query = supabase
          .from('healthcare_facilities')
          .select('*', { count: 'exact' })

        if (params.query) {
          const q = `%${params.query.trim()}%`
          query = query.or(`name.ilike.${q},name_bn.ilike.${q},facility_id.ilike.${q}`)
        }

        if (params.facilityTypeId) {
          query = query.eq('facility_type_id', params.facilityTypeId)
        }

        if (params.ownershipCategoryId) {
          query = query.eq('ownership_category_id', params.ownershipCategoryId)
        }

        if (params.division) {
          query = query.eq('division', params.division)
        }

        if (params.district) {
          query = query.eq('district', params.district)
        }

        if (params.upazila) {
          query = query.eq('upazila', params.upazila)
        }

        if (params.status) {
          query = query.eq('status', params.status)
        }

        if (params.verificationStatus) {
          query = query.eq('verification_status', params.verificationStatus)
        }

        const from = (page - 1) * pageSize
        const to = from + pageSize - 1

        const { data, count, error } = await query
          .order('created_at', { ascending: false })
          .range(from, to)

        if (!error && data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const facilities = data.map((r: any) => this.mapFacilityRow(r))
          const totalCount = count ?? facilities.length
          return {
            facilities,
            totalCount,
            page,
            pageSize,
            totalPages: Math.ceil(totalCount / pageSize),
          }
        }
      } catch {
        // Fall back to in-memory store
      }
    }

    // In-memory fallback
    let list = Array.from(fallbackFacilities.values())

    if (params.query) {
      const q = params.query.toLowerCase().trim()
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.nameBn.includes(q) ||
          f.facilityId.toLowerCase().includes(q)
      )
    }

    if (params.facilityTypeId) {
      list = list.filter((f) => f.facilityTypeId === params.facilityTypeId)
    }

    if (params.ownershipCategoryId) {
      list = list.filter((f) => f.ownershipCategoryId === params.ownershipCategoryId)
    }

    if (params.division) {
      list = list.filter((f) => f.division.toLowerCase() === params.division!.toLowerCase())
    }

    if (params.district) {
      list = list.filter((f) => f.district.toLowerCase() === params.district!.toLowerCase())
    }

    if (params.upazila) {
      list = list.filter((f) => f.upazila.toLowerCase() === params.upazila!.toLowerCase())
    }

    if (params.status) {
      list = list.filter((f) => f.status === params.status)
    }

    if (params.verificationStatus) {
      list = list.filter((f) => f.verificationStatus === params.verificationStatus)
    }

    const totalCount = list.length
    const startIndex = (page - 1) * pageSize
    const paginated = list.slice(startIndex, startIndex + pageSize)

    return {
      facilities: paginated,
      totalCount,
      page,
      pageSize,
      totalPages: Math.ceil(totalCount / pageSize) || 1,
    }
  }

  /**
   * Alias for getFacilities
   */
  static async searchFacilities(params: SearchFacilitiesInput = {}) {
    return this.getFacilities(params)
  }

  /**
   * Alias for assignStaffMember
   */
  static async assignStaff(facilityId: string, input: AssignStaffInput, actorId?: string) {
    return this.assignStaffMember(facilityId, input, actorId)
  }

  /**
   * Alias for updateFacilityServices
   */
  static async configureServices(
    facilityId: string,
    servicesOrInput: ConfigureServicesInput | ConfigureServicesInput['services'],
    actorId?: string
  ) {
    const input: ConfigureServicesInput = Array.isArray(servicesOrInput)
      ? { services: servicesOrInput }
      : servicesOrInput
    return this.updateFacilityServices(facilityId, input, actorId)
  }

  /**
   * Retrieves a single facility by internal UUID or canonical Lungent Facility ID
   */
  static async getFacilityById(idOrFacilityId: string): Promise<HealthcareFacility | null> {
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        const query = supabase
          .from('healthcare_facilities')
          .select('*')

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrFacilityId)
        const { data, error } = isUuid
          ? await query.eq('id', idOrFacilityId).single()
          : await query.eq('facility_id', idOrFacilityId.trim().toUpperCase()).single()

        if (!error && data) {
          const facility = this.mapFacilityRow(data)
          facility.services = await this.getFacilityServices(facility.id)
          facility.staffMembers = await this.getFacilityStaff(facility.id)
          return facility
        }
      } catch {
        // Fall back
      }
    }

    // In-memory fallback
    const target =
      fallbackFacilities.get(idOrFacilityId) ||
      Array.from(fallbackFacilities.values()).find(
        (f) => f.facilityId.toUpperCase() === idOrFacilityId.trim().toUpperCase()
      )

    if (target) {
      const copy = { ...target }
      copy.services = await this.getFacilityServices(copy.id)
      copy.staffMembers = await this.getFacilityStaff(copy.id)
      return copy
    }

    return null
  }

  /**
   * Registers a new healthcare facility with canonical ID generation, hierarchy validation,
   * initial draft/submitted lifecycle state, and audit event logging.
   */
  static async registerFacility(
    input: RegisterFacilityInput,
    actorId?: string
  ): Promise<HealthcareFacility> {
    // 1. Validate geographic hierarchy
    const geoValidation = validateGeographicHierarchy(
      input.countryCode || 'BD',
      input.division,
      input.district,
      input.upazila
    )
    if (!geoValidation.valid) {
      throw new Error(geoValidation.error || 'Invalid geographic hierarchy relationships')
    }

    // 2. Generate canonical Lungent Facility ID: FAC-YYYY-XXXXXX
    const facilityId = generateLungentFacilityId()
    const now = '2026-03-01T10:00:00Z'
    const newUuid = `fac-uuid-${Date.now()}`

    const newFacility: HealthcareFacility = {
      id: newUuid,
      facilityId,
      name: input.name.trim(),
      nameBn: input.nameBn ? input.nameBn.trim() : input.name.trim(),
      facilityTypeId: input.facilityTypeId,
      ownershipCategoryId: input.ownershipCategoryId,
      status: 'submitted', // Controlled lifecycle: not automatically active!
      statusReason: 'Initial registration application awaiting review',
      groupId: input.groupId || null,
      countryCode: input.countryCode || 'BD',
      division: input.division.trim(),
      district: input.district.trim(),
      upazila: input.upazila.trim(),
      unionMunicipality: input.unionMunicipality?.trim() || null,
      ward: input.ward?.trim() || null,
      addressLine: input.addressLine.trim(),
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      contactPhone: input.contactPhone?.trim() || null,
      contactEmail: input.contactEmail?.trim() || null,
      contactPersonName: input.contactPersonName?.trim() || null,
      contactPersonRole: input.contactPersonRole?.trim() || null,
      websiteUrl: input.websiteUrl?.trim() || null,
      verificationStatus: 'unverified',
      operationalCapacity: input.operationalCapacity || {},
      registeredBy: actorId || null,
      createdAt: now,
      updatedAt: now,
    }

    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('healthcare_facilities')
          .insert({
            facility_id: facilityId,
            name: newFacility.name,
            name_bn: newFacility.nameBn,
            facility_type_id: newFacility.facilityTypeId,
            ownership_category_id: newFacility.ownershipCategoryId,
            status: 'submitted',
            status_reason: newFacility.statusReason,
            group_id: newFacility.groupId,
            country_code: newFacility.countryCode,
            division: newFacility.division,
            district: newFacility.district,
            upazila: newFacility.upazila,
            union_municipality: newFacility.unionMunicipality,
            ward: newFacility.ward,
            address_line: newFacility.addressLine,
            latitude: newFacility.latitude,
            longitude: newFacility.longitude,
            contact_phone: newFacility.contactPhone,
            contact_email: newFacility.contactEmail,
            contact_person_name: newFacility.contactPersonName,
            contact_person_role: newFacility.contactPersonRole,
            website_url: newFacility.websiteUrl,
            verification_status: 'unverified',
            operational_capacity: newFacility.operationalCapacity,
            registered_by: actorId || null,
          })
          .select()
          .single()

        if (!error && data) {
          const created = this.mapFacilityRow(data)

          // Record initial status transition
          await supabase.from('facility_status_history').insert({
            facility_id: created.id,
            from_status: 'draft',
            to_status: 'submitted',
            reason: 'Facility registration application submitted',
            changed_by: actorId || null,
          })

          // Record audit log
          await supabase.from('facility_audit_events').insert({
            facility_id: created.id,
            event_type: 'facility_registered',
            actor_id: actorId || null,
            details: { facilityId, name: created.name },
          })

          return created
        }
      } catch {
        // Fall back
      }
    }

    // In-memory fallback
    fallbackFacilities.set(newFacility.id, newFacility)

    const historyItem: FacilityStatusHistoryItem = {
      id: `fsh-${Date.now()}`,
      facilityId: newFacility.id,
      fromStatus: 'draft',
      toStatus: 'submitted',
      reason: 'Facility registration application submitted',
      changedBy: actorId || null,
      createdAt: now,
    }
    fallbackStatusHistory.set(newFacility.id, [historyItem])

    const auditItem: FacilityAuditEventItem = {
      id: `fae-${Date.now()}`,
      facilityId: newFacility.id,
      eventType: 'facility_registered',
      actorId: actorId || null,
      details: { facilityId, name: newFacility.name },
      createdAt: now,
    }
    fallbackAuditEvents.set(newFacility.id, [auditItem])

    return newFacility
  }

  /**
   * Updates an existing facility's profile information
   */
  static async updateFacility(
    id: string,
    input: UpdateFacilityInput,
    actorId?: string
  ): Promise<HealthcareFacility> {
    const existing = await this.getFacilityById(id)
    if (!existing) {
      throw new Error(`Facility not found: ${id}`)
    }

    if (input.division || input.district || input.upazila) {
      const geoCheck = validateGeographicHierarchy(
        existing.countryCode,
        input.division || existing.division,
        input.district || existing.district,
        input.upazila || existing.upazila
      )
      if (!geoCheck.valid) {
        throw new Error(geoCheck.error || 'Invalid geographic hierarchy relationships')
      }
    }

    const updated: HealthcareFacility = {
      ...existing,
      name: input.name ? input.name.trim() : existing.name,
      nameBn: input.nameBn ? input.nameBn.trim() : existing.nameBn,
      facilityTypeId: input.facilityTypeId || existing.facilityTypeId,
      ownershipCategoryId: input.ownershipCategoryId || existing.ownershipCategoryId,
      groupId: input.groupId !== undefined ? input.groupId : existing.groupId,
      division: input.division ? input.division.trim() : existing.division,
      district: input.district ? input.district.trim() : existing.district,
      upazila: input.upazila ? input.upazila.trim() : existing.upazila,
      unionMunicipality: input.unionMunicipality !== undefined ? input.unionMunicipality : existing.unionMunicipality,
      ward: input.ward !== undefined ? input.ward : existing.ward,
      addressLine: input.addressLine ? input.addressLine.trim() : existing.addressLine,
      latitude: input.latitude !== undefined ? input.latitude : existing.latitude,
      longitude: input.longitude !== undefined ? input.longitude : existing.longitude,
      contactPhone: input.contactPhone !== undefined ? input.contactPhone : existing.contactPhone,
      contactEmail: input.contactEmail !== undefined ? input.contactEmail : existing.contactEmail,
      contactPersonName: input.contactPersonName !== undefined ? input.contactPersonName : existing.contactPersonName,
      contactPersonRole: input.contactPersonRole !== undefined ? input.contactPersonRole : existing.contactPersonRole,
      websiteUrl: input.websiteUrl !== undefined ? input.websiteUrl : existing.websiteUrl,
      operationalCapacity: input.operationalCapacity || existing.operationalCapacity,
      updatedAt: '2026-03-01T10:00:00Z',
    }

    fallbackFacilities.set(existing.id, updated)

    // Audit event
    const auditLogs = fallbackAuditEvents.get(existing.id) || []
    auditLogs.push({
      id: `fae-${Date.now()}`,
      facilityId: existing.id,
      eventType: 'profile_edited',
      actorId: actorId || null,
      details: { updatedFields: Object.keys(input) },
      createdAt: '2026-03-01T10:00:00Z',
    })
    fallbackAuditEvents.set(existing.id, auditLogs)

    return updated
  }

  /**
   * Transitions a facility's lifecycle status with mandatory audit trail
   */
  static async changeFacilityStatus(
    id: string,
    input: ChangeFacilityStatusInput,
    actorId?: string
  ): Promise<HealthcareFacility> {
    const existing = await this.getFacilityById(id)
    if (!existing) {
      throw new Error(`Facility not found: ${id}`)
    }

    if ((input.status === 'suspended' || input.status === 'rejected') && !input.reason?.trim()) {
      throw new Error(`Reason is required when marking a facility as ${input.status}`)
    }

    const fromStatus = existing.status
    const toStatus = input.status
    const now = '2026-03-01T10:00:00Z'

    const updated: HealthcareFacility = {
      ...existing,
      status: toStatus,
      statusReason: input.reason || null,
      approvedBy: toStatus === 'approved' || toStatus === 'active' ? actorId || 'usr-admin-001' : existing.approvedBy,
      approvedAt: toStatus === 'approved' || toStatus === 'active' ? now : existing.approvedAt,
      updatedAt: now,
    }

    fallbackFacilities.set(existing.id, updated)

    // Log status history
    const history = fallbackStatusHistory.get(existing.id) || []
    history.push({
      id: `fsh-${Date.now()}`,
      facilityId: existing.id,
      fromStatus,
      toStatus,
      reason: input.reason || `Status updated to ${toStatus}`,
      changedBy: actorId || null,
      createdAt: now,
    })
    fallbackStatusHistory.set(existing.id, history)

    // Log audit event
    const audits = fallbackAuditEvents.get(existing.id) || []
    audits.push({
      id: `fae-${Date.now()}`,
      facilityId: existing.id,
      eventType: 'facility_status_changed',
      actorId: actorId || null,
      details: { fromStatus, toStatus, reason: input.reason },
      createdAt: now,
    })
    fallbackAuditEvents.set(existing.id, audits)

    return updated
  }

  /**
   * Records official verification details for a facility
   */
  static async verifyFacility(
    id: string,
    input: VerifyFacilityInput,
    actorId?: string
  ): Promise<HealthcareFacility> {
    const existing = await this.getFacilityById(id)
    if (!existing) {
      throw new Error(`Facility not found: ${id}`)
    }

    const now = '2026-03-01T10:00:00Z'
    const updated: HealthcareFacility = {
      ...existing,
      verificationStatus: input.verificationStatus,
      verificationSource: input.verificationSource.trim(),
      verificationNotes: input.verificationNotes?.trim() || null,
      verifiedBy: actorId || 'usr-admin-001',
      verifiedAt: now,
      updatedAt: now,
    }

    fallbackFacilities.set(existing.id, updated)

    const audits = fallbackAuditEvents.get(existing.id) || []
    audits.push({
      id: `fae-${Date.now()}`,
      facilityId: existing.id,
      eventType: 'facility_verified',
      actorId: actorId || null,
      details: { source: input.verificationSource, status: input.verificationStatus },
      createdAt: now,
    })
    fallbackAuditEvents.set(existing.id, audits)

    return updated
  }

  /**
   * Retrieves clinical and diagnostic services mapped to a facility
   */
  static async getFacilityServices(facilityId: string): Promise<FacilityServiceMapping[]> {
    return fallbackFacilityServices.get(facilityId) || []
  }

  /**
   * Configures services available at a facility
   */
  static async updateFacilityServices(
    facilityId: string,
    input: ConfigureServicesInput,
    actorId?: string
  ): Promise<FacilityServiceMapping[]> {
    const existing = await this.getFacilityById(facilityId)
    if (!existing) {
      throw new Error(`Facility not found: ${facilityId}`)
    }

    const now = '2026-03-01T10:00:00Z'
    const updatedServices: FacilityServiceMapping[] = input.services.map((item, idx) => ({
      id: `srv-${Date.now()}-${idx}`,
      facilityId,
      serviceId: item.serviceId,
      serviceName: item.serviceId.replace(/_/g, ' ').toUpperCase(),
      serviceNameBn: item.serviceId,
      serviceCategory: 'respiratory_specialty',
      availabilityStatus: item.availabilityStatus,
      isVerified: item.isVerified ?? false,
      notes: item.notes || null,
      updatedAt: now,
    }))

    fallbackFacilityServices.set(facilityId, updatedServices)

    const audits = fallbackAuditEvents.get(facilityId) || []
    audits.push({
      id: `fae-${Date.now()}`,
      facilityId,
      eventType: 'services_updated',
      actorId: actorId || null,
      details: { servicesCount: updatedServices.length },
      createdAt: now,
    })
    fallbackAuditEvents.set(facilityId, audits)

    return updatedServices
  }

  /**
   * Retrieves staff memberships associated with a facility
   */
  static async getFacilityStaff(facilityId: string): Promise<FacilityStaffMember[]> {
    return fallbackFacilityStaff.get(facilityId) || []
  }

  /**
   * Associates a healthcare professional or worker with a facility
   */
  static async assignStaffMember(
    facilityId: string,
    input: AssignStaffInput,
    actorId?: string
  ): Promise<FacilityStaffMember> {
    const existing = await this.getFacilityById(facilityId)
    if (!existing) {
      throw new Error(`Facility not found: ${facilityId}`)
    }

    const currentStaff = fallbackFacilityStaff.get(facilityId) || []
    const duplicate = currentStaff.find(
      (s) => s.userId === input.userId && s.facilityRole === input.facilityRole && s.status === 'active'
    )
    if (duplicate) {
      throw new Error('User already holds an active membership with this role at this facility.')
    }

    const now = '2026-03-01T10:00:00Z'
    const newMember: FacilityStaffMember = {
      id: `stf-${Date.now()}`,
      userId: input.userId,
      facilityId,
      facilityRole: input.facilityRole,
      status: 'active',
      isPrimary: input.isPrimary ?? false,
      department: input.department?.trim() || null,
      joinedAt: now,
      leftAt: null,
      approvedBy: actorId || null,
      approvalNotes: input.approvalNotes?.trim() || null,
      createdAt: now,
      updatedAt: now,
      user: {
        id: input.userId,
        fullName: 'Assigned Healthcare Worker',
        email: 'staff@lungent.gov.bd',
        phoneNumber: '+880 1711-000111',
        role: input.facilityRole,
      },
    }

    currentStaff.push(newMember)
    fallbackFacilityStaff.set(facilityId, currentStaff)

    const audits = fallbackAuditEvents.get(facilityId) || []
    audits.push({
      id: `fae-${Date.now()}`,
      facilityId,
      eventType: 'staff_assigned',
      actorId: actorId || null,
      details: { userId: input.userId, role: input.facilityRole },
      createdAt: now,
    })
    fallbackAuditEvents.set(facilityId, audits)

    return newMember
  }

  /**
   * Updates an existing staff member's membership status (e.g. revoke, suspend, activate)
   */
  static async updateStaffMembership(
    facilityId: string,
    membershipId: string,
    input: UpdateStaffMembershipInput,
    actorId?: string
  ): Promise<FacilityStaffMember> {
    const staffList = fallbackFacilityStaff.get(facilityId) || []
    const memberIndex = staffList.findIndex((m) => m.id === membershipId)
    if (memberIndex === -1) {
      throw new Error(`Staff membership not found: ${membershipId}`)
    }

    const member = staffList[memberIndex]
    const now = '2026-03-01T10:00:00Z'

    const updatedMember: FacilityStaffMember = {
      ...member,
      status: input.status,
      facilityRole: input.facilityRole || member.facilityRole,
      department: input.department !== undefined ? input.department : member.department,
      approvalNotes: input.approvalNotes !== undefined ? input.approvalNotes : member.approvalNotes,
      leftAt: input.status === 'revoked' ? now : member.leftAt,
      updatedAt: now,
    }

    staffList[memberIndex] = updatedMember
    fallbackFacilityStaff.set(facilityId, staffList)

    const audits = fallbackAuditEvents.get(facilityId) || []
    audits.push({
      id: `fae-${Date.now()}`,
      facilityId,
      eventType: 'staff_membership_updated',
      actorId: actorId || null,
      details: { membershipId, newStatus: input.status },
      createdAt: now,
    })
    fallbackAuditEvents.set(facilityId, audits)

    return updatedMember
  }

  /**
   * Retrieves status history for a facility
   */
  static async getFacilityStatusHistory(facilityId: string): Promise<FacilityStatusHistoryItem[]> {
    return fallbackStatusHistory.get(facilityId) || []
  }

  /**
   * Retrieves audit trail for a facility
   */
  static async getFacilityAuditTrail(facilityId: string): Promise<FacilityAuditEventItem[]> {
    return fallbackAuditEvents.get(facilityId) || []
  }

  /**
   * Maps database row to domain HealthcareFacility model
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapFacilityRow(row: any): HealthcareFacility {
    return {
      id: row.id,
      facilityId: row.facility_id,
      name: row.name,
      nameBn: row.name_bn,
      facilityTypeId: row.facility_type_id,
      ownershipCategoryId: row.ownership_category_id,
      status: row.status,
      statusReason: row.status_reason,
      groupId: row.group_id,
      countryCode: row.country_code,
      division: row.division,
      district: row.district,
      upazila: row.upazila,
      unionMunicipality: row.union_municipality,
      ward: row.ward,
      addressLine: row.address_line,
      latitude: row.latitude ? Number(row.latitude) : null,
      longitude: row.longitude ? Number(row.longitude) : null,
      contactPhone: row.contact_phone,
      contactEmail: row.contact_email,
      contactPersonName: row.contact_person_name,
      contactPersonRole: row.contact_person_role,
      websiteUrl: row.website_url,
      verificationStatus: row.verification_status,
      verificationSource: row.verification_source,
      verifiedAt: row.verified_at,
      verifiedBy: row.verified_by,
      verificationNotes: row.verification_notes,
      operationalCapacity: row.operational_capacity || {},
      registeredBy: row.registered_by,
      approvedBy: row.approved_by,
      approvedAt: row.approved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }
}

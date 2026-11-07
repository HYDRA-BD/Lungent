import { describe, it, expect } from 'vitest'
import {
  generateLungentFacilityId,
  isValidLungentFacilityId,
} from '@/modules/facilities/facility-id'
import {
  validateGeographicHierarchy,
  getDivisions,
  getDistrictsForDivision,
  getUpazilasForDistrict,
} from '@/modules/facilities/geographic-data'
import {
  registerFacilitySchema,
  changeFacilityStatusSchema,
  assignStaffMemberSchema,
} from '@/modules/facilities/validation'
import { FacilityService } from '@/modules/facilities/service'

describe('Canonical Lungent Facility ID Generation & Validation', () => {
  it('generates canonical Facility IDs in FAC-YYYY-XXXXXX format', () => {
    const id = generateLungentFacilityId()
    const currentYear = new Date().getFullYear()
    expect(id).toMatch(new RegExp(`^FAC-${currentYear}-[2-9A-HJ-NP-Z]{6}$`))
    expect(isValidLungentFacilityId(id)).toBe(true)
  })

  it('allows specifying custom registration year', () => {
    const id2026 = generateLungentFacilityId(2026)
    expect(id2026.startsWith('FAC-2026-')).toBe(true)
    expect(isValidLungentFacilityId(id2026)).toBe(true)
  })

  it('strictly excludes ambiguous characters (0, O, 1, I)', () => {
    for (let i = 0; i < 50; i++) {
      const id = generateLungentFacilityId()
      const suffix = id.split('-')[2]
      expect(suffix).not.toMatch(/[01OIoi]/)
    }
  })

  it('ensures high entropy and collision resistance', () => {
    const set = new Set<string>()
    for (let i = 0; i < 200; i++) {
      set.add(generateLungentFacilityId())
    }
    expect(set.size).toBe(200)
  })

  it('validates canonical and rejects malformed IDs', () => {
    expect(isValidLungentFacilityId('FAC-2026-DHK001')).toBe(true)
    expect(isValidLungentFacilityId('FAC-2026-NID002')).toBe(true)
    expect(isValidLungentFacilityId('FAC-2026-8K2M7P')).toBe(true)

    // Rejects invalid prefixes or formats
    expect(isValidLungentFacilityId('LGT-2026-8K2M7P')).toBe(false)
    expect(isValidLungentFacilityId('HOSP-2026-8K2M7P')).toBe(false)
    expect(isValidLungentFacilityId('FAC-26-8K2M7P')).toBe(false)
    expect(isValidLungentFacilityId('')).toBe(false)
  })
})

describe('Bangladesh Geographic & Administrative Hierarchy', () => {
  it('loads all 8 official divisions of Bangladesh', () => {
    const divisions = getDivisions('BD')
    expect(divisions.length).toBe(8)
    const divisionNames = divisions.map((d) => d.name)
    expect(divisionNames).toContain('Dhaka')
    expect(divisionNames).toContain('Chattogram')
    expect(divisionNames).toContain('Rajshahi')
    expect(divisionNames).toContain('Khulna')
    expect(divisionNames).toContain('Barishal')
    expect(divisionNames).toContain('Sylhet')
    expect(divisionNames).toContain('Rangpur')
    expect(divisionNames).toContain('Mymensingh')
  })

  it('cascades districts correctly for a division', () => {
    const dhakaDistricts = getDistrictsForDivision('Dhaka')
    expect(dhakaDistricts.length).toBeGreaterThan(0)
    const districtNames = dhakaDistricts.map((d) => d.name)
    expect(districtNames).toContain('Dhaka')
    expect(districtNames).toContain('Gazipur')
    expect(districtNames).not.toContain('Sylhet')
  })

  it('cascades upazilas correctly for a district', () => {
    const mirpurUpazilas = getUpazilasForDistrict('Dhaka', 'Dhaka')
    const upazilaNames = mirpurUpazilas.map((u) => u.name)
    expect(upazilaNames).toContain('Mirpur')
    expect(upazilaNames).toContain('Mohakhali')
  })

  it('validates correct parent-child relationships', () => {
    const valid = validateGeographicHierarchy('BD', 'Dhaka', 'Dhaka', 'Mirpur')
    expect(valid.valid).toBe(true)
  })

  it('rejects invalid divisions, mismatched districts, or unknown upazilas', () => {
    // Non-BD country
    expect(validateGeographicHierarchy('US', 'Dhaka', 'Dhaka').valid).toBe(false)

    // Non-existent division
    expect(validateGeographicHierarchy('BD', 'Atlantis', 'Dhaka').valid).toBe(false)

    // District does not belong to Division
    const mismatch = validateGeographicHierarchy('BD', 'Dhaka', 'Chattogram')
    expect(mismatch.valid).toBe(false)
    expect(mismatch.error).toContain("District 'Chattogram' does not belong to Division 'Dhaka'")

    // Upazila does not belong to District
    const upaMismatch = validateGeographicHierarchy('BD', 'Dhaka', 'Dhaka', 'Coxs_Bazar_Sadar')
    expect(upaMismatch.valid).toBe(false)
    expect(upaMismatch.error).toContain('is not recognized under District')
  })
})

describe('Facility Validation Schemas', () => {
  it('validates correct facility registration input', () => {
    const valid = registerFacilitySchema.safeParse({
      name: 'Sylhet Chest Disease Hospital',
      nameBn: 'সিলেট বক্ষব্যাধি হাসপাতাল',
      facilityTypeId: 'specialized_hospital',
      ownershipCategoryId: 'government',
      division: 'Sylhet',
      district: 'Sylhet',
      upazila: 'Sylhet Sadar',
      addressLine: 'Hospital Road, Sylhet',
      contactPhone: '+880 1712345678',
      contactEmail: 'contact@sylhet-chest.gov.bd',
      operationalCapacity: {
        totalBeds: 150,
        icuBeds: 12,
        ldctScanners: 1,
      },
    })
    expect(valid.success).toBe(true)
  })

  it('rejects registration with invalid geographic hierarchy', () => {
    const invalid = registerFacilitySchema.safeParse({
      name: 'Invalid Geo Center',
      facilityTypeId: 'clinic',
      ownershipCategoryId: 'private',
      division: 'Barishal',
      district: 'Dhaka', // Invalid parent-child
      upazila: 'Mirpur',
      addressLine: 'Road 1',
      contactPhone: '01712345678',
    })
    expect(invalid.success).toBe(false)
  })

  it('enforces mandatory justification on suspension and rejection', () => {
    // Valid approval transition
    const approval = changeFacilityStatusSchema.safeParse({
      status: 'approved',
      reason: 'Standard review cleared',
    })
    expect(approval.success).toBe(true)

    // Suspension without reason fails
    const suspendWithoutReason = changeFacilityStatusSchema.safeParse({
      status: 'suspended',
    })
    expect(suspendWithoutReason.success).toBe(false)

    // Suspension with too short reason fails
    const suspendShortReason = changeFacilityStatusSchema.safeParse({
      status: 'suspended',
      reason: 'bad',
    })
    expect(suspendShortReason.success).toBe(false)

    // Suspension with valid reason succeeds
    const suspendValid = changeFacilityStatusSchema.safeParse({
      status: 'suspended',
      reason: 'Temporary suspension pending clinical license renewal audit',
    })
    expect(suspendValid.success).toBe(true)
  })

  it('validates staff member assignment input', () => {
    const staffValid = assignStaffMemberSchema.safeParse({
      userId: 'usr-clinician-001',
      fullName: 'Dr. Tahmina Begum',
      facilityRole: 'clinician',
      department: 'Pulmonology',
    })
    expect(staffValid.success).toBe(true)
  })
})

describe('FacilityService Domain Operations', () => {
  it('loads seeded benchmark facilities', async () => {
    const res = await FacilityService.getFacilities({ pageSize: 10 })
    expect(res.facilities.length).toBeGreaterThanOrEqual(3)

    const dhk001 = res.facilities.find((f) => f.facilityId === 'FAC-2026-DHK001')
    expect(dhk001).toBeDefined()
    expect(dhk001?.name).toContain('Dhaka Central Pulmonary Institute')
    expect(dhk001?.status).toBe('active')
    expect(dhk001?.verificationStatus).toBe('verified')
  })

  it('registers a new healthcare facility in initial submitted state', async () => {
    const newFacility = await FacilityService.registerFacility(
      {
        name: 'Chattogram Respiratory Specialty Clinic',
        nameBn: 'চট্টগ্রাম রেসপিরেটরি স্পেশালিটি ক্লিনিক',
        facilityTypeId: 'specialized_clinic',
        ownershipCategoryId: 'private',
        division: 'Chattogram',
        district: 'Chattogram',
        upazila: 'Panchlaish',
        addressLine: 'CDA Avenue, Panchlaish, Chattogram',
        contactPhone: '+880 31-654321',
        operationalCapacity: {
          totalBeds: 45,
          spirometryStations: 2,
        },
      },
      'admin-usr-001'
    )

    expect(newFacility.id).toBeDefined()
    expect(isValidLungentFacilityId(newFacility.facilityId)).toBe(true)
    // Controlled lifecycle: Initial status MUST be 'submitted'
    expect(newFacility.status).toBe('submitted')
    expect(newFacility.verificationStatus).toBe('unverified')

    // Verify facility can be retrieved by internal UUID or canonical ID
    const retrieved = await FacilityService.getFacilityById(newFacility.id)
    expect(retrieved).not.toBeNull()
    expect(retrieved?.name).toBe('Chattogram Respiratory Specialty Clinic')

    const byCanonical = await FacilityService.getFacilityById(newFacility.facilityId)
    expect(byCanonical).not.toBeNull()
    expect(byCanonical?.id).toBe(newFacility.id)
  })

  it('executes controlled status lifecycle transitions', async () => {
    const list = await FacilityService.getFacilities()
    const target = list.facilities[0]

    // Transition from current to approved
    const approved = await FacilityService.changeFacilityStatus(
      target.id,
      {
        status: 'approved',
        reason: 'Administrative verification cleared by clinical committee',
      },
      'admin-usr-001'
    )
    expect(approved.status).toBe('approved')

    // Transition to active
    const active = await FacilityService.changeFacilityStatus(
      target.id,
      {
        status: 'active',
        reason: 'On-boarding complete and active in referral directory',
      },
      'admin-usr-001'
    )
    expect(active.status).toBe('active')

    // Check status history log
    const history = await FacilityService.getFacilityStatusHistory(target.id)
    expect(history.length).toBeGreaterThanOrEqual(2)
    expect(history[history.length - 1].toStatus).toBe('active')
  })

  it('records facility accreditation verification', async () => {
    const list = await FacilityService.getFacilities()
    const target = list.facilities[0]

    const verified = await FacilityService.verifyFacility(
      target.id,
      {
        verificationStatus: 'verified',
        verificationSource: 'dghs_registry',
        verificationNotes: 'Official DGHS accreditation license #88219 renewed',
      },
      'admin-usr-001'
    )

    expect(verified.verificationStatus).toBe('verified')
    expect(verified.verificationSource).toBe('dghs_registry')
    expect(verified.verifiedAt).toBeDefined()
  })

  it('manages staff memberships and multi-facility associations', async () => {
    const list = await FacilityService.getFacilities()
    const fac1 = list.facilities[0]
    const fac2 = list.facilities[1]

    // Assign same user to Facility 1 as clinician
    const member1 = await FacilityService.assignStaffMember(
      fac1.id,
      {
        userId: 'usr-shared-doctor',
        fullName: 'Dr. Mahmudul Hasan',
        facilityRole: 'clinician',
        department: 'Pulmonology',
      },
      'admin-usr-001'
    )
    expect(member1.facilityId).toBe(fac1.id)
    expect(member1.facilityRole).toBe('clinician')
    expect(member1.status).toBe('active')

    // Assign same user to Facility 2 as facility_admin (multi-facility access)
    const member2 = await FacilityService.assignStaffMember(
      fac2.id,
      {
        userId: 'usr-shared-doctor',
        fullName: 'Dr. Mahmudul Hasan',
        facilityRole: 'facility_admin',
        department: 'Administration',
      },
      'admin-usr-001'
    )
    expect(member2.facilityId).toBe(fac2.id)
    expect(member2.facilityRole).toBe('facility_admin')
    expect(member2.status).toBe('active')

    // Verify staff list per facility
    const staffFac1 = await FacilityService.getFacilityStaff(fac1.id)
    expect(staffFac1.some((m) => m.userId === 'usr-shared-doctor')).toBe(true)

    // Update staff status to suspended
    const updated = await FacilityService.updateStaffMembership(
      fac1.id,
      member1.id,
      { status: 'suspended', approvalNotes: 'Sabbatical leave' },
      'admin-usr-001'
    )
    expect(updated.status).toBe('suspended')
  })

  it('maps and configures clinical services for a facility', async () => {
    const list = await FacilityService.getFacilities()
    const target = list.facilities[0]

    const services = await FacilityService.updateFacilityServices(
      target.id,
      {
        services: [
          {
            serviceId: 'srv-pulmonology',
            availabilityStatus: 'available',
            isVerified: true,
            notes: '4 senior pulmonologists on active duty',
          },
          {
            serviceId: 'srv-ldct',
            availabilityStatus: 'available',
            isVerified: true,
            notes: 'Siemens 128-slice Low Dose CT',
          },
          {
            serviceId: 'srv-pft',
            availabilityStatus: 'planned',
            isVerified: false,
            notes: 'Equipping new body plethysmography lab',
          },
        ],
      },
      'admin-usr-001'
    )

    expect(services.length).toBe(3)
    const ldct = services.find((s) => s.serviceId === 'srv-ldct')
    expect(ldct?.availabilityStatus).toBe('available')
    expect(ldct?.isVerified).toBe(true)

    const pft = services.find((s) => s.serviceId === 'srv-pft')
    expect(pft?.availabilityStatus).toBe('planned')
  })

  it('filters facilities accurately by query, division, and status', async () => {
    const all = await FacilityService.getFacilities()
    expect(all.totalCount).toBeGreaterThanOrEqual(3)

    // Search by query (canonical ID)
    const byId = await FacilityService.getFacilities({ query: 'FAC-2026-NID002' })
    expect(byId.facilities.length).toBe(1)
    expect(byId.facilities[0].facilityId).toBe('FAC-2026-NID002')

    // Search by division
    const inDhaka = await FacilityService.getFacilities({ division: 'Dhaka' })
    expect(inDhaka.facilities.every((f) => f.division === 'Dhaka')).toBe(true)
  })
})

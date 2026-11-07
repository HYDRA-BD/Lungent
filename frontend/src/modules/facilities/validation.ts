import { z } from 'zod'
import { validateGeographicHierarchy } from './geographic-data'

export const facilityTypeEnum = z.enum([
  'specialized_hospital',
  'public_hospital',
  'private_hospital',
  'specialized_clinic',
  'general_clinic',
  'primary_healthcare',
  'community_clinic',
  'community_programme',
  'other',
])

export const facilityOwnershipEnum = z.enum([
  'government',
  'private',
  'ngo',
  'academic_research',
  'community_based',
  'other',
])

export const facilityStatusEnum = z.enum([
  'draft',
  'submitted',
  'under_review',
  'approved',
  'active',
  'suspended',
  'inactive',
  'rejected',
])

export const facilityVerificationStatusEnum = z.enum([
  'unverified',
  'pending_verification',
  'verified',
  'rejected',
])

export const facilityRoleEnum = z.enum([
  'facility_admin',
  'clinician',
  'healthcare_worker',
  'nurse',
  'data_entry_clerk',
  'support_staff',
])

export const staffMembershipStatusEnum = z.enum([
  'active',
  'pending',
  'suspended',
  'revoked',
])

export const serviceAvailabilityStatusEnum = z.enum([
  'available',
  'temporarily_unavailable',
  'planned',
])

export const registerFacilitySchema = z
  .object({
    name: z.string().trim().min(3, 'Facility name must be at least 3 characters').max(150),
    nameBn: z.string().trim().min(3, 'Bangla facility name must be at least 3 characters').max(150),
    facilityTypeId: facilityTypeEnum,
    ownershipCategoryId: facilityOwnershipEnum,
    groupId: z.string().uuid().optional().nullable(),
    countryCode: z.string().default('BD'),
    division: z.string().trim().min(2, 'Division is required'),
    district: z.string().trim().min(2, 'District is required'),
    upazila: z.string().trim().min(2, 'Upazila is required'),
    unionMunicipality: z.string().trim().max(100).optional().nullable(),
    ward: z.string().trim().max(50).optional().nullable(),
    addressLine: z.string().trim().min(5, 'Address line must be at least 5 characters').max(250),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    contactPhone: z
      .string()
      .trim()
      .min(8, 'Phone number must be at least 8 characters')
      .max(25)
      .optional()
      .nullable(),
    contactEmail: z.string().trim().email('Invalid email address format').optional().nullable(),
    contactPersonName: z.string().trim().max(100).optional().nullable(),
    contactPersonRole: z.string().trim().max(100).optional().nullable(),
    websiteUrl: z.string().trim().url('Invalid website URL').optional().nullable(),
    selectedServices: z.array(z.string()).optional().default([]),
    operationalCapacity: z.record(z.string(), z.any()).optional().default({}),
  })
  .superRefine((data, ctx) => {
    const geoValidation = validateGeographicHierarchy(
      data.countryCode || 'BD',
      data.division,
      data.district,
      data.upazila
    )
    if (!geoValidation.valid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: geoValidation.error || 'Invalid geographic hierarchy relationships',
        path: ['district'],
      })
    }
  })

export const updateFacilitySchema = z.object({
  name: z.string().trim().min(3).max(150).optional(),
  nameBn: z.string().trim().min(3).max(150).optional(),
  facilityTypeId: facilityTypeEnum.optional(),
  ownershipCategoryId: facilityOwnershipEnum.optional(),
  groupId: z.string().uuid().optional().nullable(),
  division: z.string().trim().min(2).optional(),
  district: z.string().trim().min(2).optional(),
  upazila: z.string().trim().min(2).optional(),
  unionMunicipality: z.string().trim().max(100).optional().nullable(),
  ward: z.string().trim().max(50).optional().nullable(),
  addressLine: z.string().trim().min(5).max(250).optional(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  contactPhone: z.string().trim().min(8).max(25).optional().nullable(),
  contactEmail: z.string().trim().email().optional().nullable(),
  contactPersonName: z.string().trim().max(100).optional().nullable(),
  contactPersonRole: z.string().trim().max(100).optional().nullable(),
  websiteUrl: z.string().trim().url().optional().nullable(),
  operationalCapacity: z.record(z.string(), z.any()).optional(),
})

export const searchFacilitiesSchema = z.object({
  query: z.string().trim().optional(),
  facilityTypeId: facilityTypeEnum.optional(),
  ownershipCategoryId: facilityOwnershipEnum.optional(),
  division: z.string().trim().optional(),
  district: z.string().trim().optional(),
  upazila: z.string().trim().optional(),
  status: facilityStatusEnum.optional(),
  verificationStatus: facilityVerificationStatusEnum.optional(),
  serviceId: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
})

export const changeFacilityStatusSchema = z
  .object({
    status: facilityStatusEnum,
    reason: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'suspended' || data.status === 'rejected') {
        return !!data.reason && data.reason.trim().length >= 10
      }
      return true
    },
    {
      message: 'A mandatory justification (minimum 10 characters) is required when suspending or rejecting a facility.',
      path: ['reason'],
    }
  )

export const verifyFacilitySchema = z.object({
  verificationStatus: facilityVerificationStatusEnum,
  verificationSource: z.string().trim().min(3, 'Verification source is required').max(100),
  verificationNotes: z.string().trim().max(1000).optional(),
})

export const assignStaffMemberSchema = z.object({
  userId: z.string().trim().min(3, 'Valid user account identifier is required'),
  facilityRole: facilityRoleEnum,
  isPrimary: z.boolean().default(false),
  department: z.string().trim().max(100).optional().nullable(),
  approvalNotes: z.string().trim().max(500).optional().nullable(),
})

export const updateStaffMembershipSchema = z.object({
  status: staffMembershipStatusEnum,
  facilityRole: facilityRoleEnum.optional(),
  department: z.string().trim().max(100).optional().nullable(),
  approvalNotes: z.string().trim().max(500).optional().nullable(),
})

export const configureServicesSchema = z.object({
  services: z.array(
    z.object({
      serviceId: z.string().trim().min(2),
      availabilityStatus: serviceAvailabilityStatusEnum,
      isVerified: z.boolean().default(false),
      notes: z.string().trim().max(500).optional().nullable(),
    })
  ),
})

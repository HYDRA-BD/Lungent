import { z } from 'zod'

export const createPatientSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must contain at least 2 characters')
      .max(120, 'Full name cannot exceed 120 characters')
      .trim(),
    dateOfBirth: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val) return true
          const date = new Date(val)
          return !isNaN(date.getTime()) && date <= new Date()
        },
        { message: 'Date of birth cannot be in the future' }
      ),
    approximateAge: z
      .number()
      .int()
      .min(1, 'Approximate age must be at least 1')
      .max(120, 'Approximate age cannot exceed 120')
      .optional()
      .nullable(),
    gender: z.enum(['female', 'male', 'other', 'unspecified'], {
      error: 'Please select a gender option',
    }),
    phoneNumber: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val) return true
          const cleaned = val.replace(/[^\d+]/g, '')
          return cleaned.length >= 7 && cleaned.length <= 16
        },
        { message: 'Please enter a valid telephone number (e.g. 017XXXXXXXX)' }
      ),
    email: z
      .string()
      .email('Please enter a valid email address')
      .optional()
      .nullable()
      .or(z.literal('')),
    nidNumber: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => {
          if (!val) return true
          const digits = val.replace(/\D/g, '')
          // Bangladesh NIDs are typically 10 (smart card), 13 (old), or 17 digits
          return digits.length === 10 || digits.length === 13 || digits.length === 17
        },
        { message: 'National ID must be 10, 13, or 17 digits' }
      ),
    addressDivision: z.string().optional().nullable(),
    addressDistrict: z.string().optional().nullable(),
    addressUpazila: z.string().optional().nullable(),
    addressDetails: z.string().optional().nullable(),
    emergencyContactName: z.string().optional().nullable(),
    emergencyContactPhone: z.string().optional().nullable(),
    emergencyContactRelation: z.string().optional().nullable(),
    preferredLanguage: z.enum(['en', 'bn']).default('en'),
    verificationSource: z
      .enum(['community_intake', 'clinical_registration', 'national_id_card', 'self_reported'])
      .default('community_intake'),
    primaryFacilityId: z.string().optional().default('facility-dhaka-central'),
  })
  .superRefine((data, ctx) => {
    // Operationally require at least Date of Birth OR Approximate Age
    if (!data.dateOfBirth && (data.approximateAge === undefined || data.approximateAge === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please provide either Date of Birth or an approximate age',
        path: ['approximateAge'],
      })
    }
  })

export const updatePatientSchema = z.object({
  fullName: z.string().min(2).max(120).trim().optional(),
  dateOfBirth: z.string().optional().nullable(),
  approximateAge: z.number().int().min(1).max(120).optional().nullable(),
  gender: z.enum(['female', 'male', 'other', 'unspecified']).optional(),
  phoneNumber: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  addressDivision: z.string().optional().nullable(),
  addressDistrict: z.string().optional().nullable(),
  addressUpazila: z.string().optional().nullable(),
  addressDetails: z.string().optional().nullable(),
  emergencyContactName: z.string().optional().nullable(),
  emergencyContactPhone: z.string().optional().nullable(),
  emergencyContactRelation: z.string().optional().nullable(),
  preferredLanguage: z.enum(['en', 'bn']).optional(),
})

export const searchPatientsSchema = z.object({
  query: z.string().optional(),
  patientId: z.string().optional(),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  division: z.string().optional(),
  facilityId: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

export const reviewDuplicateSchema = z.object({
  candidateId: z.string().uuid('Invalid candidate ID format'),
  decision: z.enum(['dismissed_distinct', 'confirmed_duplicate', 'approved_for_merge']),
  justification: z
    .string()
    .min(10, 'Please document a detailed clinical/administrative reason (at least 10 characters)')
    .max(500),
})

export const mergePatientsSchema = z
  .object({
    survivingPatientId: z.string().uuid('Invalid surviving patient ID format'),
    retiredPatientId: z.string().uuid('Invalid retired patient ID format'),
    reason: z
      .string()
      .min(10, 'Merge justification must contain at least 10 characters')
      .max(1000),
  })
  .refine((data) => data.survivingPatientId !== data.retiredPatientId, {
    message: 'Surviving record and retired record cannot be the same patient',
    path: ['retiredPatientId'],
  })

export const linkAccountSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID format'),
  userProfileId: z.string().uuid('Invalid user profile ID format'),
  verificationMethod: z.enum(['admin_link', 'phone_verification', 'patient_self_claimed']),
})

export const linkAnonymousSelfCheckSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID format'),
  explicitConsentGiven: z.boolean().refine((val) => val === true, {
    message: 'Explicit informed patient consent is required to link historical self-checks',
  }),
  consentStatement: z
    .string()
    .min(10, 'Consent declaration documentation must be provided'),
})

export type CreatePatientSchemaInput = z.infer<typeof createPatientSchema>
export type UpdatePatientSchemaInput = z.infer<typeof updatePatientSchema>
export type SearchPatientsSchemaInput = z.infer<typeof searchPatientsSchema>
export type ReviewDuplicateSchemaInput = z.infer<typeof reviewDuplicateSchema>
export type MergePatientsSchemaInput = z.infer<typeof mergePatientsSchema>
export type LinkAccountSchemaInput = z.infer<typeof linkAccountSchema>
export type LinkAnonymousSelfCheckSchemaInput = z.infer<typeof linkAnonymousSelfCheckSchema>


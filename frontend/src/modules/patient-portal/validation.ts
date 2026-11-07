import { z } from 'zod'

export const updatePatientProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters')
    .optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must follow YYYY-MM-DD format')
    .optional()
    .nullable(),
  phoneNumber: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
    .optional(),
  email: z.string().trim().email('Invalid email address format').optional().nullable(),
  preferredLanguage: z.enum(['en', 'bn']).optional(),
  addressDivision: z.string().trim().max(100).optional(),
  addressDistrict: z.string().trim().max(100).optional(),
  addressUpazila: z.string().trim().max(100).optional(),
  addressDetails: z.string().trim().max(300).optional(),
  emergencyContactName: z.string().trim().max(100).optional(),
  emergencyContactPhone: z.string().trim().max(20).optional(),
  emergencyContactRelation: z.string().trim().max(50).optional(),
})

export const startAssessmentSchema = z.object({
  assessmentType: z.enum([
    'lung_cancer_risk',
    'screening_eligibility',
    'symptom_triage',
    'comprehensive_intake',
  ]),
  consentGiven: z.boolean().refine((val) => val === true, {
    message: 'You must review and accept the assessment information and consent notice.',
  }),
})

export const correctionRequestSchema = z.object({
  category: z.string().trim().min(2, 'Category is required').max(100),
  recordId: z.string().trim().optional().nullable(),
  fieldName: z.string().trim().min(2, 'Field name is required').max(100),
  currentValue: z.string().trim().max(500).optional().nullable(),
  requestedCorrection: z
    .string()
    .trim()
    .min(3, 'Requested correction must be at least 3 characters')
    .max(1000),
  justification: z
    .string()
    .trim()
    .min(5, 'Please provide clinical reason or context for this correction (min 5 characters)')
    .max(1000),
})

export const linkAnonymousSelfCheckSchema = z.object({
  sessionCode: z
    .string()
    .trim()
    .min(6, 'Self-check session code must be at least 6 characters')
    .max(64),
  consentConfirmed: z.boolean().refine((val) => val === true, {
    message: 'Explicit consent is required to associate anonymous self-check data with your patient identity.',
  }),
})

export const updateConsentSchema = z.object({
  consentType: z.enum([
    'assessment_terms',
    'health_data_collection',
    'anonymous_self_check_link',
    'care_team_sharing',
    'sms_notifications',
  ]),
  isGranted: z.boolean(),
})

export const accountSettingsSchema = z.object({
  preferredLanguage: z.enum(['en', 'bn']),
  notificationPreferences: z.object({
    emailUpdates: z.boolean().default(true),
    smsAlerts: z.boolean().default(false),
    clinicalReviewAlerts: z.boolean().default(true),
  }),
})

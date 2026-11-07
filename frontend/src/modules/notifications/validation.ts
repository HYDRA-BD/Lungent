import { z } from 'zod'

export const notificationCategorySchema = z.enum([
  'account',
  'assessment',
  'clinical_review',
  'referral',
  'follow_up',
  'healthcare_worker',
  'urgent_workflow',
])

export const notificationChannelSchema = z.enum(['in_app', 'sms', 'email'])

export const notificationPrioritySchema = z.enum(['urgent', 'high', 'normal', 'low'])

export const notificationEventTypeSchema = z.enum([
  // Account
  'account_registered',
  'password_reset_requested',
  'profile_updated',
  'consent_updated',
  // Assessment
  'assessment_submitted',
  'assessment_processing',
  'assessment_requires_info',
  'assessment_results_available',
  'assessment_review_completed',
  // Clinical Review
  'assessment_awaiting_review',
  'patient_assessment_assigned',
  'clinical_review_pending',
  'clinical_review_completed',
  'clinical_alert_generated',
  // Referral
  'referral_assigned',
  'referral_submitted',
  'referral_accepted',
  'referral_rejected',
  'referral_scheduled',
  'referral_status_changed',
  'referral_completed',
  // Follow-up
  'followup_scheduled',
  'followup_reminder',
  'followup_rescheduled',
  'followup_cancelled',
  'followup_overdue',
  'followup_missed',
  'followup_completed',
  // Healthcare Worker
  'worker_new_assignment',
  'worker_pending_tasks',
  'worker_review_outstanding',
  'worker_facility_alert',
  // Urgent Workflow
  'urgent_clinical_escalation',
  'urgent_red_flag_alert',
])

// E.164 and Bangladesh Phone Number validator: +8801[3-9]XXXXXXXX or standard international
export function isValidPhoneNumber(phone: string): boolean {
  const normalized = phone.replace(/[\s-()]/g, '')
  // Bangladesh standard: +8801XXXXXXXXX or 01XXXXXXXXX
  const bdRegex = /^(\+?880|0)?1[3-9]\d{8}$/
  // International E.164: + followed by 7 to 15 digits
  const e164Regex = /^\+[1-9]\d{6,14}$/

  return bdRegex.test(normalized) || e164Regex.test(normalized)
}

export function normalizeBangladeshPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s-()]/g, '')
  if (cleaned.startsWith('01')) {
    cleaned = '+880' + cleaned.slice(1)
  } else if (cleaned.startsWith('8801')) {
    cleaned = '+' + cleaned
  }
  return cleaned
}

export const createNotificationEventSchema = z.object({
  eventType: notificationEventTypeSchema,
  recipientUserId: z.string().optional(),
  patientId: z.string().optional(),
  recipientPhone: z
    .string()
    .refine((val) => !val || isValidPhoneNumber(val), {
      message: 'Invalid phone number format. Provide valid Bangladesh or E.164 number.',
    })
    .optional()
    .nullable(),
  recipientEmail: z.string().email('Invalid email address format').optional().nullable(),
  priority: notificationPrioritySchema.default('normal'),
  sourceModule: z.string().min(2, 'Source module identifier is required'),
  sourceReferenceId: z.string().optional(),
  channels: z.array(notificationChannelSchema).optional(),
  scheduledFor: z.string().datetime().optional(),
  idempotencyKey: z.string().min(5).max(120).optional(),
  variables: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

export const updatePreferencesSchema = z.object({
  inAppEnabled: z.boolean().default(true),
  smsEnabled: z.boolean().default(false),
  emailEnabled: z.boolean().default(true),
  assessmentUpdates: z.boolean().default(true),
  referralUpdates: z.boolean().default(true),
  followupReminders: z.boolean().default(true),
  urgentAlerts: z.boolean().default(true), // Mandatory security/clinical alerts always default true
  phoneNumber: z
    .string()
    .refine((val) => !val || isValidPhoneNumber(val), {
      message: 'Invalid phone number format. Provide valid Bangladesh or E.164 number.',
    })
    .optional()
    .nullable(),
  emailAddress: z.string().email('Invalid email address format').optional().nullable(),
  preferredLanguage: z.enum(['en', 'bn']).default('en'),
})

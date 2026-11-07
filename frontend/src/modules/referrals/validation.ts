import { z } from 'zod'

export const referralPrioritySchema = z.enum(['urgent_2ww', 'priority', 'routine', 'elective'])

export const referralLifecycleStatusSchema = z.enum([
  'draft',
  'submitted',
  'accepted',
  'rejected',
  'scheduled',
  'in_progress',
  'completed',
  'cancelled',
  'closed',
])

export const followupStatusSchema = z.enum([
  'scheduled',
  'completed',
  'overdue',
  'rescheduled',
  'cancelled',
  'missed',
])

export const followupPurposeSchema = z.enum([
  'post_imaging_review',
  'treatment_monitoring',
  'symptom_reassessment',
  'specialist_consultation',
  'smoking_cessation',
  'routine_check',
])

export const createReferralSchema = z.object({
  patientId: z.string().uuid('Valid patient UUID is required'),
  patientCanonicalId: z.string().min(5),
  patientName: z.string().min(2),
  patientPhone: z.string().optional().nullable(),
  referringFacilityId: z.string().optional().nullable(),
  referringFacilityName: z.string().min(2).default('Dhaka Central Pulmonary Institute'),
  destinationFacilityId: z.string().optional().nullable(),
  destinationFacilityName: z.string().min(2, 'Destination facility name is required'),
  destinationDepartment: z.string().optional().nullable(),
  reason: z.string().min(5, 'Referral reason must be at least 5 characters').max(1000),
  clinicalSummary: z.string().max(2000).optional().nullable(),
  priority: referralPrioritySchema.default('routine'),
  instructions: z.string().max(1000).optional().nullable(),
  contactPhone: z.string().max(50).optional().nullable(),
  linkedAssessmentId: z.string().optional().nullable(),
  linkedAssessmentType: z.string().optional().nullable(),
})

export const updateReferralStatusSchema = z.object({
  referralId: z.string().min(1),
  status: referralLifecycleStatusSchema,
  reason: z.string().max(1000).optional(),
  notes: z.string().max(1000).optional(),
  appointmentDate: z.string().optional(),
  appointmentLocation: z.string().optional(),
  instructions: z.string().optional(),
}).refine(
  (data) => {
    if ((data.status === 'rejected' || data.status === 'cancelled') && (!data.reason || data.reason.trim().length === 0)) {
      return false
    }
    return true
  },
  {
    message: 'A documented reason is mandatory when rejecting or cancelling a referral.',
    path: ['reason'],
  }
)

export const assignReferralSchema = z.object({
  referralId: z.string().min(1),
  destinationFacilityId: z.string().optional(),
  assignedClinicianId: z.string().optional(),
  assignedClinicianName: z.string().optional(),
  appointmentDate: z.string().optional(),
  appointmentLocation: z.string().optional(),
})

export const scheduleFollowUpSchema = z.object({
  patientId: z.string().uuid('Valid patient UUID is required'),
  patientCanonicalId: z.string().min(5),
  patientName: z.string().min(2),
  referralId: z.string().optional().nullable(),
  referralCanonicalId: z.string().optional().nullable(),
  facilityId: z.string().optional().nullable(),
  facilityName: z.string().min(2).default('Dhaka Central Pulmonary Institute'),
  responsibleProviderId: z.string().optional().nullable(),
  responsibleProviderName: z.string().min(2).default('Prof. Dr. Farhana Ahmed'),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Scheduled date must be YYYY-MM-DD'),
  scheduledTime: z.string().max(20).optional().nullable(),
  purpose: followupPurposeSchema.default('routine_check'),
  instructions: z.string().max(1000).optional().nullable(),
})

export const rescheduleFollowUpSchema = z.object({
  followUpId: z.string().min(1),
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'New date must be YYYY-MM-DD'),
  newTime: z.string().max(20).optional().nullable(),
  reason: z.string().min(5, 'Rescheduling reason is mandatory and must be at least 5 characters').max(500),
})

export const updateFollowUpStatusSchema = z.object({
  followUpId: z.string().min(1),
  status: followupStatusSchema,
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  outcomeNotes: z.string().max(2000).optional(),
})

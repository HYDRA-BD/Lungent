import { z } from 'zod'

export const clinicalReviewStatusSchema = z.enum([
  'pending_review',
  'under_review',
  'info_required',
  'reviewed',
  'closed',
])

export const clinicalReviewTypeSchema = z.enum([
  'comprehensive_intake',
  'risk_evaluation',
  'screening_eligibility',
  'symptom_triage',
  'follow_up',
])

export const clinicalObservationCategorySchema = z.enum([
  'pulmonary_vitals',
  'symptom_severity',
  'exposure_risk',
  'radiology_finding',
  'general',
])

export const clinicalDecisionTypeSchema = z.enum([
  'screening_recommended',
  'diagnostic_workup_needed',
  'urgent_specialist_referral',
  'routine_follow_up',
  'no_immediate_intervention',
])

export const clinicalDecisionStatusSchema = z.enum([
  'draft',
  'finalized',
  'amended',
])

export const clinicalAlertTypeSchema = z.enum([
  'red_flag_symptom',
  'assessment_warning',
  'missing_critical_info',
  'conflicting_data',
  'overdue_follow_up',
  'urgent_triage',
])

export const clinicalAlertSeveritySchema = z.enum([
  'critical',
  'high',
  'moderate',
  'low',
])

export const clinicalAlertStatusSchema = z.enum([
  'active',
  'acknowledged',
  'resolved',
  'dismissed',
])

export const clinicalFollowUpStatusSchema = z.enum([
  'planned',
  'pending',
  'completed',
  'cancelled',
  'overdue',
])

export const clinicalObservationItemSchema = z.object({
  category: clinicalObservationCategorySchema,
  observationText: z.string().min(3, 'Observation text is required (minimum 3 characters)').max(2000),
  clinicalInterpretation: z.string().max(2000).optional().nullable(),
})

export const createClinicalReviewSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  facilityId: z.string().optional().nullable(),
  assessmentId: z.string().optional().nullable(),
  reviewType: clinicalReviewTypeSchema.default('comprehensive_intake'),
  reviewStatus: clinicalReviewStatusSchema.default('reviewed'),
  summary: z.string().min(5, 'Review summary is required (minimum 5 characters)').max(3000),
  missingInformationNotes: z.string().max(2000).optional().nullable(),
  conflictingInformationNotes: z.string().max(2000).optional().nullable(),
  verifiedInformationNotes: z.string().max(2000).optional().nullable(),
  requestedInformation: z.string().max(2000).optional().nullable(),
  observations: z.array(clinicalObservationItemSchema).optional(),
})

export const documentClinicalDecisionSchema = z
  .object({
    clinicalReviewId: z.string().min(1, 'Clinical review reference is required'),
    patientId: z.string().min(1, 'Patient ID is required'),
    decisionType: clinicalDecisionTypeSchema,
    rationale: z.string().min(10, 'Clinical rationale is required (minimum 10 characters)').max(3000),
    disagreementWithAutomatedOutput: z.boolean().default(false),
    disagreementReason: z.string().max(2000).optional().nullable(),
    recommendedNextSteps: z.string().min(5, 'Recommended next steps are required (minimum 5 characters)').max(3000),
    referralTarget: z.string().max(300).optional().nullable(),
    status: clinicalDecisionStatusSchema.default('finalized'),
  })
  .refine(
    (data) => {
      if (data.disagreementWithAutomatedOutput) {
        return !!data.disagreementReason && data.disagreementReason.trim().length >= 10
      }
      return true
    },
    {
      message: 'Mandatory clinical rationale (min 10 characters) is required when disagreeing with automated score',
      path: ['disagreementReason'],
    }
  )

export const amendClinicalDecisionSchema = z.object({
  decisionId: z.string().min(1, 'Decision ID is required'),
  amendmentReason: z.string().min(10, 'Amendment justification is mandatory (minimum 10 characters)').max(2000),
  amendedContent: z.object({
    decisionType: clinicalDecisionTypeSchema.optional(),
    rationale: z.string().min(10).optional(),
    recommendedNextSteps: z.string().min(5).optional(),
    referralTarget: z.string().optional().nullable(),
    disagreementWithAutomatedOutput: z.boolean().optional(),
    disagreementReason: z.string().optional().nullable(),
  }),
})

export const acknowledgeClinicalAlertSchema = z.object({
  alertId: z.string().min(1, 'Alert ID is required'),
  resolutionNotes: z.string().max(2000).optional().nullable(),
  markResolved: z.boolean().default(false),
})

export const createFollowUpPlanSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  facilityId: z.string().optional().nullable(),
  clinicalReviewId: z.string().optional().nullable(),
  instructions: z.string().min(5, 'Follow-up instructions are required (minimum 5 characters)').max(2000),
  recommendedReviewDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid review date (YYYY-MM-DD) is required'),
  notes: z.string().max(2000).optional().nullable(),
})

export const updateFollowUpStatusSchema = z.object({
  followUpId: z.string().min(1, 'Follow-up ID is required'),
  status: clinicalFollowUpStatusSchema,
  notes: z.string().max(2000).optional().nullable(),
})


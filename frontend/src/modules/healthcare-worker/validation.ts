import { z } from 'zod'

export const initiateAssessmentSchema = z.object({
  assessmentType: z.enum([
    'lung_cancer_risk',
    'screening_eligibility',
    'symptom_triage',
    'comprehensive_intake',
  ]),
  facilityId: z.string().trim().optional(),
  priority: z.enum(['routine', 'urgent']).default('routine'),
  preliminaryNotes: z.string().trim().max(1000).optional(),
  status: z
    .enum(['not_started', 'in_progress', 'submitted'])
    .default('in_progress'),
})

export const createWorkerTaskSchema = z.object({
  patientId: z.string().uuid().optional().nullable(),
  facilityId: z.string().trim().min(1, 'Facility is required'),
  taskType: z.enum([
    'intake_completion',
    'assessment_initiation',
    'measurement_recording',
    'contact_verification',
    'followup_call',
  ]),
  priority: z.enum(['urgent', 'high', 'normal', 'low']).default('normal'),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  titleBn: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().max(1000).optional().nullable(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD')
    .optional()
    .nullable(),
})

export const updateWorkerTaskStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'dismissed']),
})

export const switchActiveFacilitySchema = z.object({
  facilityId: z.string().trim().min(1, 'Facility ID is required'),
})

export const assignPatientToWorkerSchema = z.object({
  workerId: z.string().uuid('Valid worker account UUID is required'),
  patientId: z.string().uuid('Valid patient UUID is required'),
  facilityId: z.string().trim().min(1, 'Facility ID is required'),
  assignmentRole: z
    .enum(['primary_chw', 'case_worker', 'intake_specialist', 'care_coordinator'])
    .default('primary_chw'),
  notes: z.string().trim().max(500).optional().nullable(),
})

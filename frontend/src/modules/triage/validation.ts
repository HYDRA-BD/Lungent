/**
 * Phase 1.14: Symptom-Based Clinical Triage Engine - Input Validation Schemas
 */

import { z } from 'zod'

export const symptomPresenceStatusSchema = z.enum([
  'present',
  'absent',
  'unknown',
  'not_reported',
  'unable_to_assess',
])

export const symptomSeveritySchema = z.enum(['mild', 'moderate', 'severe', 'life_threatening'])
export const symptomProgressionSchema = z.enum(['worsening', 'stable', 'improving', 'fluctuating'])

export const symptomDetailSchema = z.object({
  status: symptomPresenceStatusSchema,
  durationWeeks: z.number().min(0).max(520).nullable().optional(),
  progression: symptomProgressionSchema.nullable().optional(),
  severity: symptomSeveritySchema.nullable().optional(),
  isPersistent: z.boolean().nullable().optional(),
  isNewOnChange: z.boolean().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
})

export const patientSymptomIntakePayloadSchema = z.object({
  cough: symptomDetailSchema.optional(),
  coughChanges: symptomDetailSchema.optional(),
  hemoptysis: symptomDetailSchema
    .extend({
      isMassive: z.boolean().optional(),
    })
    .optional(),
  dyspnea: symptomDetailSchema
    .extend({
      mMRCGrade: z.number().min(0).max(4).optional(),
    })
    .optional(),
  chestPain: symptomDetailSchema.optional(),
  wheezing: symptomDetailSchema.optional(),
  stridor: symptomDetailSchema.optional(),
  hoarseness: symptomDetailSchema.optional(),
  recurrentChestInfections: symptomDetailSchema.optional(),

  unexplainedWeightLoss: symptomDetailSchema
    .extend({
      percentageLoss: z.number().min(0).max(100).optional(),
    })
    .optional(),
  fatigue: symptomDetailSchema.optional(),
  appetiteLoss: symptomDetailSchema.optional(),
  unexplainedWeakness: symptomDetailSchema.optional(),
  nightSweats: symptomDetailSchema.optional(),

  cervicalLymphadenopathy: symptomDetailSchema.optional(),
  fingerClubbing: symptomDetailSchema.optional(),
  svcoSigns: symptomDetailSchema.optional(),
})

export const evaluateSymptomTriageSchema = z.object({
  patientId: z.string().uuid('Invalid Patient ID UUID'),
  symptomsPayload: patientSymptomIntakePayloadSchema,
  protocolId: z.string().min(1).default('proto-nice-ng12-2023'),
  executionMode: z
    .enum(['clinical_production', 'research_simulation', 'validation_audit'])
    .default('clinical_production'),
  facilityId: z.string().uuid().optional(),
  provenance: z
    .enum(['patient_reported', 'worker_assisted', 'clinician_verified', 'imported'])
    .default('patient_reported'),
  collectedByUserId: z.string().uuid().optional(),
})

export const acknowledgeEscalationSchema = z.object({
  escalationId: z.string().uuid('Invalid Escalation ID'),
  actionNotes: z.string().min(5, 'Action notes must be at least 5 characters'),
  markResolved: z.boolean().default(false),
})

export type EvaluateSymptomTriageSchemaInput = z.infer<typeof evaluateSymptomTriageSchema>
export type AcknowledgeEscalationSchemaInput = z.infer<typeof acknowledgeEscalationSchema>

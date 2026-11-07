import { z } from 'zod'

export const evaluateScreeningSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  guidelineId: z.string().optional().default('gl-uspstf-2021'),
  executionMode: z
    .enum(['clinical_production', 'research_simulation', 'validation_audit'])
    .optional()
    .default('clinical_production'),
  facilityId: z.string().optional().default('fac-001'),
  clinicianOverrideId: z.string().optional().nullable(),
})

export type EvaluateScreeningSchemaInput = z.infer<typeof evaluateScreeningSchema>


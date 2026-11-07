import { z } from 'zod'

export const riskExecutionModeSchema = z.enum([
  'clinical_production',
  'research_simulation',
  'validation_audit',
])

export const executeRiskAssessmentSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  methodologyId: z.string().default('plcom2012'),
  executionMode: riskExecutionModeSchema.default('clinical_production'),
  facilityId: z.string().default('facility-dhaka-central'),
  clinicianOverrideId: z.string().optional().nullable(),
})

export const patientDemographicsInputSchema = z.object({
  age: z
    .number()
    .int('Age must be an integer')
    .min(18, 'Patient must be at least 18 years old for risk assessment')
    .max(110, 'Age exceeds plausible physiological range (max 110)'),
  gender: z.enum(['male', 'female', 'other', 'unspecified']),
  dateOfBirth: z.string().optional().nullable(),
})

export const patientSmokingHistoryInputSchema = z
  .object({
    smokingStatus: z.enum(['never_smoker', 'former_smoker', 'current_smoker', 'unknown']),
    cigarettesPerDay: z.number().min(0, 'Cigarettes per day cannot be negative').default(0),
    bidisPerDay: z.number().min(0, 'Bidis per day cannot be negative').default(0),
    yearsSmoked: z.number().min(0, 'Years smoked cannot be negative').default(0),
    ageStarted: z.number().min(5).max(100).optional().nullable(),
    ageQuit: z.number().min(5).max(100).optional().nullable(),
    packYears: z.number().min(0).default(0),
    yearsSinceQuit: z.number().min(0).optional().nullable(),
  })
  .refine(
    (data) => {
      // Consistency check: never smoker cannot have cigarettes per day > 0 or years smoked > 0
      if (data.smokingStatus === 'never_smoker') {
        return data.cigarettesPerDay === 0 && data.bidisPerDay === 0 && data.yearsSmoked === 0
      }
      return true
    },
    {
      message: 'Never-smoker status conflicts with documented cigarettes/bidis per day or years smoked',
      path: ['smokingStatus'],
    }
  )
  .refine(
    (data) => {
      // Consistency check: former smoker must have quit interval
      if (data.smokingStatus === 'former_smoker') {
        return (
          (data.yearsSinceQuit !== undefined && data.yearsSinceQuit !== null) ||
          (data.ageQuit !== undefined && data.ageQuit !== null)
        )
      }
      return true
    },
    {
      message: 'Former smoker requires documented cessation age or years since quit',
      path: ['yearsSinceQuit'],
    }
  )

export const registerMethodologySchema = z.object({
  id: z.string().min(2).max(80),
  name: z.string().min(5).max(255),
  code: z.string().min(2).max(100),
  authoritativeSource: z.string().min(5),
  intendedPopulation: z.string().min(5),
  calculationType: z.enum([
    'logistic_regression',
    'cox_proportional_hazards',
    'expert_rule_system',
    'experimental_ml',
  ]),
  outputDefinition: z.string().min(5),
  timeHorizonYears: z.number().int().min(1).max(20).default(6),
  lifecycleStatus: z.enum([
    'research_only',
    'under_validation',
    'awaiting_clinical_approval',
    'approved_for_clinical_use',
    'suspended',
    'deprecated',
  ]),
  approvedForBangladesh: z.boolean().default(false),
  knownLimitations: z.string().min(10),
})


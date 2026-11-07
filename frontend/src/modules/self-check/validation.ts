import { z } from 'zod'

export const acknowledgementSchema = z.object({
  acknowledgedLimitations: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge that this is a non-diagnostic self-check',
  }),
})

export const demographicsSchema = z.object({
  ageRange: z.enum(['under_40', '40_49', '50_59', '60_69', '70_and_older'], {
    error: 'Please select an age range',
  }),
  biologicalSex: z.enum(['female', 'male', 'prefer_not_to_say'], {
    error: 'Please select an option',
  }),
  division: z.enum(
    [
      'dhaka',
      'chattogram',
      'rajshahi',
      'khulna',
      'barishal',
      'sylhet',
      'rangpur',
      'mymensingh',
      'other',
    ],
    { error: 'Please select your residential division' }
  ),
})

export const smokingHistorySchema = z
  .object({
    smokingStatus: z.enum(['never', 'former', 'current'], {
      error: 'Please select your smoking status',
    }),
    tobaccoType: z.enum(['cigarettes', 'bidis', 'both', 'none']).optional(),
    cigarettesPerDay: z.number().min(0).max(120).optional(),
    smokingDurationYears: z.number().min(0).max(80).optional(),
    quitYearsAgo: z.number().min(0).max(80).optional(),
    secondhandSmoke: z.enum(['none', 'household', 'workplace', 'both'], {
      error: 'Please specify secondhand smoke exposure',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.smokingStatus === 'current' || data.smokingStatus === 'former') {
      if (!data.tobaccoType || data.tobaccoType === 'none') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please select the type of tobacco used',
          path: ['tobaccoType'],
        })
      }
      if (data.cigarettesPerDay === undefined || data.cigarettesPerDay <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please specify average daily cigarette or bidi count (at least 1)',
          path: ['cigarettesPerDay'],
        })
      }
      if (data.smokingDurationYears === undefined || data.smokingDurationYears <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please specify how many years you smoked (at least 1)',
          path: ['smokingDurationYears'],
        })
      }
    }

    if (data.smokingStatus === 'former') {
      if (data.quitYearsAgo === undefined || data.quitYearsAgo < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please specify how many years ago you quit smoking',
          path: ['quitYearsAgo'],
        })
      }
    }
  })

export const medicalHistorySchema = z.object({
  respiratoryConditions: z
    .array(
      z.enum([
        'copd',
        'chronic_bronchitis',
        'emphysema',
        'asthma',
        'prior_tb',
        'pulmonary_fibrosis',
        'none',
      ])
    )
    .min(1, 'Please select applicable conditions or "None"'),
  familyLungCancer: z.enum(
    ['yes_first_degree', 'yes_second_degree', 'no', 'unknown'],
    { error: 'Please select family history status' }
  ),
  personalCancerHistory: z.boolean(),
})

export const environmentalExposureSchema = z
  .object({
    cookingFuel: z.enum(
      ['lpg_gas', 'electricity', 'biomass_wood_dung', 'kerosene', 'other'],
      { error: 'Please select your primary household cooking fuel' }
    ),
    biomassExposureYears: z.number().min(0).max(80).optional(),
    occupationalHazards: z
      .array(
        z.enum([
          'silica_dust',
          'asbestos',
          'shipbreaking_welding',
          'textile_dyeing_fumes',
          'pesticides_agriculture',
          'none',
        ])
      )
      .min(1, 'Please select applicable occupational exposures or "None"'),
    selfReportedAirPollution: z.enum(['low', 'moderate', 'high_urban'], {
      error: 'Please select self-reported air quality level',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.cookingFuel === 'biomass_wood_dung') {
      if (data.biomassExposureYears === undefined || data.biomassExposureYears < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter approximate years of biomass fuel cooking smoke exposure',
          path: ['biomassExposureYears'],
        })
      }
    }
  })

export const symptomsSchema = z.object({
  symptoms: z
    .array(
      z.enum([
        'coughing_blood',
        'cough_over_3_weeks',
        'unexplained_weight_loss',
        'persistent_chest_pain',
        'severe_breathlessness',
        'hoarseness_unexplained',
        'frequent_chest_infections',
        'none',
      ])
    )
    .min(1, 'Please select any active symptoms or choose "None"'),
})

export type AcknowledgementInput = z.infer<typeof acknowledgementSchema>
export type DemographicsInput = z.infer<typeof demographicsSchema>
export type SmokingHistoryInput = z.infer<typeof smokingHistorySchema>
export type MedicalHistoryInput = z.infer<typeof medicalHistorySchema>
export type EnvironmentalExposureInput = z.infer<typeof environmentalExposureSchema>
export type SymptomsInput = z.infer<typeof symptomsSchema>

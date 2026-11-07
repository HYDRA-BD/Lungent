import { z } from 'zod'

export const geographicQuerySchema = z.object({
  countryCode: z.string().optional().default('BD'),
  division: z.string().min(1, 'Division is required'),
  district: z.string().min(1, 'District is required'),
  upazila: z.string().optional(),
})

export const searchGeographicEntitiesSchema = z.object({
  countryCode: z.string().default('BD'),
  level: z.enum(['country', 'division', 'district', 'upazila', 'union_or_municipality', 'ward']).optional(),
  query: z.string().min(1, 'Search term is required'),
  limit: z.number().int().positive().max(100).default(20),
})

export const recordPatientLocationHistorySchema = z.object({
  patientId: z.string().uuid('Valid patient ID is required'),
  countryCode: z.string().default('BD'),
  division: z.string().min(1, 'Division is required'),
  district: z.string().min(1, 'District is required'),
  upazila: z.string().optional().nullable(),
  unionOrWard: z.string().optional().nullable(),
  addressLine: z.string().max(255).optional().nullable(),
  isCurrent: z.boolean().default(true),
  durationYears: z.number().min(0).max(120).optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  verificationStatus: z.enum(['verified', 'patient_reported', 'worker_entered', 'estimated']).default('patient_reported'),
})

export const recordPatientExposureSchema = z.object({
  patientId: z.string().uuid('Valid patient ID is required'),
  geographicEntityId: z.string().uuid().optional().nullable(),
  exposureCategory: z.enum([
    'occupational',
    'indoor_biomass',
    'outdoor_air_pollution',
    'secondhand_smoke',
    'other',
  ]),
  exposureType: z.string().min(2, 'Exposure type is required'),
  cookingFuelType: z.enum(['clean_lpg_electric', 'biomass_wood_dung', 'kerosene', 'coal', 'mixed']).optional().nullable(),
  durationYears: z.number().min(0, 'Duration must be positive').max(100),
  hoursPerDay: z.number().min(0).max(24).optional().nullable(),
  intensity: z.enum(['low', 'moderate', 'high', 'unknown']).default('moderate'),
  isCurrent: z.boolean().default(true),
  startYear: z.number().int().min(1900).max(2100).optional().nullable(),
  endYear: z.number().int().min(1900).max(2100).optional().nullable(),
  contextDetails: z.string().max(1000).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  verificationStatus: z.enum(['unverified', 'pending_verification', 'verified', 'rejected', 'disputed']).default('unverified'),
})

export const facilityAccessibilityQuerySchema = z.object({
  division: z.string().min(1, 'Division is required'),
  district: z.string().min(1, 'District is required'),
  upazila: z.string().optional(),
})

export type GeographicQueryInput = z.input<typeof geographicQuerySchema>
export type SearchGeographicEntitiesInput = z.infer<typeof searchGeographicEntitiesSchema>
export type RecordPatientLocationHistoryInput = z.infer<typeof recordPatientLocationHistorySchema>
export type RecordPatientExposureInput = z.infer<typeof recordPatientExposureSchema>
export type FacilityAccessibilityQueryInput = z.infer<typeof facilityAccessibilityQuerySchema>


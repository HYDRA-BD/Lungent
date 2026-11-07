import { describe, it, expect } from 'vitest'
import {
  calculatePackYears,
  checkScreeningEligibility,
  evaluateSelfCheck,
} from '@/modules/self-check'
import {
  acknowledgementSchema,
  demographicsSchema,
  smokingHistorySchema,
  environmentalExposureSchema,
  symptomsSchema,
} from '@/modules/self-check/validation'
import type { SelfCheckResponses } from '@/modules/self-check'

describe('Self-Check Engine: calculatePackYears', () => {
  it('returns 0 for never smokers', () => {
    expect(calculatePackYears('never', 20, 20)).toBe(0)
    expect(calculatePackYears('never')).toBe(0)
  })

  it('returns 0 if daily count or duration is undefined, zero, or negative', () => {
    expect(calculatePackYears('current', 0, 10)).toBe(0)
    expect(calculatePackYears('current', 20, 0)).toBe(0)
    expect(calculatePackYears('former', -5, 10)).toBe(0)
    expect(calculatePackYears('former', 20, -5)).toBe(0)
    expect(calculatePackYears('current', undefined, 10)).toBe(0)
  })

  it('accurately calculates pack-years for standard cigarette counts', () => {
    // 20 cigarettes/day for 20 years = 20 pack-years
    expect(calculatePackYears('current', 20, 20)).toBe(20)
    // 10 cigarettes/day for 30 years = 15 pack-years
    expect(calculatePackYears('former', 10, 30)).toBe(15)
    // 40 cigarettes/day for 10 years = 20 pack-years
    expect(calculatePackYears('current', 40, 10)).toBe(20)
  })

  it('correctly rounds decimals to 1 decimal place', () => {
    // 15 cigarettes/day for 25 years = 18.75 -> 18.8
    expect(calculatePackYears('current', 15, 25)).toBe(18.8)
    // 7 cigarettes/day for 10 years = 3.5
    expect(calculatePackYears('former', 7, 10)).toBe(3.5)
  })
})

describe('Self-Check Engine: checkScreeningEligibility (USPSTF 2021)', () => {
  it('identifies eligible candidates aged 50-80 with >= 20 pack-years smoking currently', () => {
    expect(checkScreeningEligibility('50_59', 'current', 20)).toBe(true)
    expect(checkScreeningEligibility('60_69', 'current', 35)).toBe(true)
    expect(checkScreeningEligibility('70_and_older', 'current', 25)).toBe(true)
  })

  it('identifies eligible former smokers who quit within 15 years', () => {
    expect(checkScreeningEligibility('50_59', 'former', 25, 5)).toBe(true)
    expect(checkScreeningEligibility('60_69', 'former', 20, 15)).toBe(true)
  })

  it('disqualifies former smokers who quit more than 15 years ago', () => {
    expect(checkScreeningEligibility('50_59', 'former', 30, 16)).toBe(false)
    expect(checkScreeningEligibility('60_69', 'former', 40, 20)).toBe(false)
  })

  it('disqualifies candidates under age 50 regardless of heavy smoking history', () => {
    expect(checkScreeningEligibility('40_49', 'current', 30)).toBe(false)
    expect(checkScreeningEligibility('under_40', 'current', 40)).toBe(false)
  })

  it('disqualifies candidates with under 20 pack-years regardless of age', () => {
    expect(checkScreeningEligibility('50_59', 'current', 19.5)).toBe(false)
    expect(checkScreeningEligibility('60_69', 'former', 15, 3)).toBe(false)
  })

  it('disqualifies never smokers', () => {
    expect(checkScreeningEligibility('60_69', 'never', 0)).toBe(false)
  })
})

describe('Self-Check Engine: evaluateSelfCheck Risk Profiling & Safety Override', () => {
  const baseResponses: SelfCheckResponses = {
    acknowledgedLimitations: true,
    ageRange: 'under_40',
    biologicalSex: 'female',
    division: 'dhaka',
    smokingStatus: 'never',
    secondhandSmoke: 'none',
    respiratoryConditions: ['none'],
    familyLungCancer: 'no',
    personalCancerHistory: false,
    cookingFuel: 'lpg_gas',
    occupationalHazards: ['none'],
    selfReportedAirPollution: 'low',
    symptoms: ['none'],
  }

  it('evaluates baseline general profile for asymptomatic individuals with no major risks', () => {
    const result = evaluateSelfCheck(baseResponses)

    expect(result.calculatedRiskCategory).toBe('baseline_general')
    expect(result.packYears).toBe(0)
    expect(result.isScreeningEligibleAgeAndSmoking).toBe(false)
    expect(result.hasUrgentSymptoms).toBe(false)
    expect(result.symptomUrgency).toBe('no_symptoms')
    expect(result.identifiedRiskFactorsEn).toHaveLength(0)
    expect(result.recommendedNextStepsEn[0]).toContain('GENERAL PULMONARY WELLNESS')
  })

  it('evaluates moderate risk factor profile for individuals with biomass exposure or secondhand smoke', () => {
    const responses: SelfCheckResponses = {
      ...baseResponses,
      cookingFuel: 'biomass_wood_dung',
      biomassExposureYears: 16,
      secondhandSmoke: 'household',
    }

    const result = evaluateSelfCheck(responses)

    expect(result.calculatedRiskCategory).toBe('moderate_risk_factors')
    expect(result.identifiedRiskFactorsEn.some((f) => f.includes('biomass'))).toBe(true)
    expect(result.identifiedRiskFactorsEn.some((f) => f.includes('secondhand'))).toBe(true)
    expect(result.recommendedNextStepsEn.some((s) => s.includes('VENTILATION'))).toBe(true)
  })

  it('evaluates elevated screening candidate for USPSTF-matching profiles', () => {
    const responses: SelfCheckResponses = {
      ...baseResponses,
      ageRange: '60_69',
      smokingStatus: 'current',
      tobaccoType: 'bidis',
      cigarettesPerDay: 25,
      smokingDurationYears: 30,
    }

    const result = evaluateSelfCheck(responses)

    expect(result.calculatedRiskCategory).toBe('elevated_screening_candidate')
    expect(result.packYears).toBe(37.5)
    expect(result.isScreeningEligibleAgeAndSmoking).toBe(true)
    expect(result.recommendedNextStepsEn.some((s) => s.includes('SCREENING DISCUSSION'))).toBe(true)
    expect(result.recommendedNextStepsEn.some((s) => s.includes('TOBACCO CESSATION'))).toBe(true)
  })

  it('MANDATORY SAFETY OVERRIDE: Urgent red flag symptoms trigger priority evaluation regardless of low risk profile', () => {
    // Young patient with 0 pack-years, clean cooking fuel, and no known environmental risks
    const responsesWithRedFlags: SelfCheckResponses = {
      ...baseResponses,
      ageRange: 'under_40',
      smokingStatus: 'never',
      cookingFuel: 'electricity',
      symptoms: ['coughing_blood', 'cough_over_3_weeks', 'unexplained_weight_loss'],
    }

    const result = evaluateSelfCheck(responsesWithRedFlags)

    // Mathematical risk model remains baseline_general (or unaffected)
    expect(result.calculatedRiskCategory).toBe('baseline_general')

    // But INDEPENDENT safety triage identifies urgent red flags
    expect(result.hasUrgentSymptoms).toBe(true)
    expect(result.symptomUrgency).toBe('urgent_red_flags')
    expect(result.urgentSymptomsList).toEqual(
      expect.arrayContaining(['coughing_blood', 'cough_over_3_weeks', 'unexplained_weight_loss'])
    )

    // The FIRST recommended next step is urgent clinical evaluation
    expect(result.recommendedNextStepsEn[0]).toContain('PRIORITY CLINICAL EVALUATION')
    expect(result.recommendedNextStepsEn[0]).toContain('coughing up blood')
    expect(result.recommendedNextStepsBn[0]).toContain('জরুরি পরামর্শ')

    // Disclaimers are present in both languages
    expect(result.disclaimerEn).toContain('NON-DIAGNOSTIC ADVISORY')
    expect(result.disclaimerBn).toContain('অ-নির্ণায়ক পরামর্শ')
  })
})

describe('Self-Check Validation Schemas', () => {
  it('validates informed consent acknowledgement', () => {
    expect(acknowledgementSchema.safeParse({ acknowledgedLimitations: true }).success).toBe(true)
    expect(acknowledgementSchema.safeParse({ acknowledgedLimitations: false }).success).toBe(false)
  })

  it('validates demographics requirements', () => {
    const valid = {
      ageRange: '50_59',
      biologicalSex: 'male',
      division: 'chattogram',
    }
    expect(demographicsSchema.safeParse(valid).success).toBe(true)

    const invalid = {
      ageRange: 'invalid_age',
      biologicalSex: 'male',
      division: 'dhaka',
    }
    expect(demographicsSchema.safeParse(invalid).success).toBe(false)
  })

  it('validates conditional smoking fields for current smokers', () => {
    // Current smoker missing tobacco type or daily count fails
    const invalidCurrent = {
      smokingStatus: 'current',
      secondhandSmoke: 'none',
    }
    expect(smokingHistorySchema.safeParse(invalidCurrent).success).toBe(false)

    // Current smoker with complete info passes
    const validCurrent = {
      smokingStatus: 'current',
      tobaccoType: 'cigarettes',
      cigarettesPerDay: 20,
      smokingDurationYears: 15,
      secondhandSmoke: 'household',
    }
    expect(smokingHistorySchema.safeParse(validCurrent).success).toBe(true)
  })

  it('validates conditional smoking fields for former smokers', () => {
    // Former smoker missing quitYearsAgo fails
    const missingQuitYears = {
      smokingStatus: 'former',
      tobaccoType: 'bidis',
      cigarettesPerDay: 10,
      smokingDurationYears: 20,
      secondhandSmoke: 'none',
    }
    expect(smokingHistorySchema.safeParse(missingQuitYears).success).toBe(false)

    const validFormer = {
      ...missingQuitYears,
      quitYearsAgo: 8,
    }
    expect(smokingHistorySchema.safeParse(validFormer).success).toBe(true)
  })

  it('validates conditional biomass years when cooking fuel is biomass', () => {
    const missingBiomassYears = {
      cookingFuel: 'biomass_wood_dung',
      occupationalHazards: ['none'],
      selfReportedAirPollution: 'high_urban',
    }
    expect(environmentalExposureSchema.safeParse(missingBiomassYears).success).toBe(false)

    const validBiomass = {
      ...missingBiomassYears,
      biomassExposureYears: 22,
    }
    expect(environmentalExposureSchema.safeParse(validBiomass).success).toBe(true)
  })

  it('validates symptom selection non-empty constraint', () => {
    expect(symptomsSchema.safeParse({ symptoms: [] }).success).toBe(false)
    expect(symptomsSchema.safeParse({ symptoms: ['none'] }).success).toBe(true)
    expect(symptomsSchema.safeParse({ symptoms: ['coughing_blood'] }).success).toBe(true)
  })
})

import type {
  SelfCheckResponses,
  SelfCheckResult,
  RiskCategory,
  SymptomTriageUrgency,
  WarningSymptom,
} from './types'

export const URGENT_RED_FLAG_SYMPTOMS: readonly WarningSymptom[] = [
  'coughing_blood',
  'cough_over_3_weeks',
  'unexplained_weight_loss',
  'persistent_chest_pain',
  'severe_breathlessness',
] as const

export const NON_URGENT_SYMPTOMS: readonly WarningSymptom[] = [
  'hoarseness_unexplained',
  'frequent_chest_infections',
] as const

/**
 * Calculates cumulative smoking pack-years transparently.
 * Formula: (cigarettes_or_bidis_per_day / 20) * duration_in_years
 */
export function calculatePackYears(
  status: 'never' | 'former' | 'current',
  perDay?: number,
  years?: number
): number {
  if (status === 'never' || !perDay || !years || perDay <= 0 || years <= 0) {
    return 0
  }
  const packYears = (perDay / 20) * years
  return Math.round(packYears * 10) / 10 // Rounded to 1 decimal place
}

/**
 * Evaluates whether a person meets international LDCT screening criteria
 * (USPSTF 2021: Age 50-80, >= 20 pack-years, currently smokes or quit within 15 years).
 */
export function checkScreeningEligibility(
  ageRange: string,
  smokingStatus: string,
  packYears: number,
  quitYearsAgo?: number
): boolean {
  const isEligibleAge =
    ageRange === '50_59' || ageRange === '60_69' || ageRange === '70_and_older'

  const hasHighPackYears = packYears >= 20

  const isCurrentOrRecentFormer =
    smokingStatus === 'current' ||
    (smokingStatus === 'former' && quitYearsAgo !== undefined && quitYearsAgo <= 15)

  return isEligibleAge && hasHighPackYears && isCurrentOrRecentFormer
}

/**
 * Main Self-Check Evaluation Engine
 * Produces structured, non-diagnostic guidance and enforces independent symptom safety overrides.
 */
export function evaluateSelfCheck(responses: SelfCheckResponses): SelfCheckResult {
  const {
    ageRange,
    smokingStatus,
    cigarettesPerDay,
    smokingDurationYears,
    quitYearsAgo,
    secondhandSmoke,
    respiratoryConditions,
    familyLungCancer,
    cookingFuel,
    biomassExposureYears,
    occupationalHazards,
    symptoms,
  } = responses

  // 1. Smoking Quantification
  const packYears = calculatePackYears(
    smokingStatus,
    cigarettesPerDay,
    smokingDurationYears
  )

  // 2. Screening Eligibility Check
  const isScreeningEligible = checkScreeningEligibility(
    ageRange,
    smokingStatus,
    packYears,
    quitYearsAgo
  )

  // 3. Identified Risk Factors Accumulation
  const riskFactorsEn: string[] = []
  const riskFactorsBn: string[] = []

  if (packYears >= 20) {
    riskFactorsEn.push(`Significant cumulative smoking history: ${packYears} pack-years`)
    riskFactorsBn.push(`উল্লেখযোগ্য পরিমাণে ধূমপানের ইতিহাস: ${packYears} প্যাক-বছর`)
  } else if (packYears > 0) {
    riskFactorsEn.push(`Documented smoking history: ${packYears} pack-years`)
    riskFactorsBn.push(`ধূমপানের ইতিহাস: ${packYears} প্যাক-বছর`)
  }

  if (secondhandSmoke === 'household' || secondhandSmoke === 'both') {
    riskFactorsEn.push('Regular domestic secondhand tobacco smoke exposure')
    riskFactorsBn.push('নিয়মিত পারিবারিক পরোক্ষ ধূমপানের সংস্পর্শ')
  }

  if (cookingFuel === 'biomass_wood_dung' && (biomassExposureYears || 0) >= 15) {
    riskFactorsEn.push(`Prolonged solid biomass cooking smoke exposure (${biomassExposureYears} years)`)
    riskFactorsBn.push(`দীর্ঘমেয়াদে রান্নার মাটির চুলার ধোঁয়ায় সংস্পর্শ (${biomassExposureYears} বছর)`)
  }

  if (familyLungCancer === 'yes_first_degree') {
    riskFactorsEn.push('First-degree family history of lung cancer (parent, sibling, or child)')
    riskFactorsBn.push('পরিবারে নিকটাত্মীয়ের (বাবা, মা, ভাই, বোন) ফুসফুস ক্যান্সারের ইতিহাস')
  }

  const hasChronicLungDisease = respiratoryConditions.some(
    (c) => c === 'copd' || c === 'chronic_bronchitis' || c === 'emphysema' || c === 'pulmonary_fibrosis'
  )
  if (hasChronicLungDisease) {
    riskFactorsEn.push('Pre-existing chronic pulmonary condition (COPD / chronic bronchitis)')
    riskFactorsBn.push('পূর্ববর্তী দীর্ঘস্থায়ী ফুসফুসের রোগ (সিওপিডি / ক্রনিক ব্রঙ্কাইটিস)')
  }

  if (respiratoryConditions.includes('prior_tb')) {
    riskFactorsEn.push('History of prior pulmonary tuberculosis with residual lung scarring')
    riskFactorsBn.push('অতীতে ফুসফুসের যক্ষ্মা রোগের ইতিহাস')
  }

  const hasOccupationalHazard = occupationalHazards.some(
    (h) => h === 'silica_dust' || h === 'asbestos' || h === 'shipbreaking_welding'
  )
  if (hasOccupationalHazard) {
    riskFactorsEn.push('Occupational exposure to pulmonary carcinogens (silica, asbestos, or industrial fumes)')
    riskFactorsBn.push('কর্মক্ষেত্রে ক্ষতিকারক ধূলিকণা বা রাসায়নিক ধোঁয়ায় দীর্ঘমেয়াদে সংস্পর্শ')
  }

  // 4. Calculate Risk Category (Without Symptoms)
  let calculatedRiskCategory: RiskCategory = 'baseline_general'

  if (
    isScreeningEligible ||
    packYears >= 20 ||
    ((biomassExposureYears || 0) >= 20 && (hasChronicLungDisease || familyLungCancer === 'yes_first_degree'))
  ) {
    calculatedRiskCategory = 'elevated_screening_candidate'
  } else if (
    packYears > 0 ||
    (biomassExposureYears || 0) >= 10 ||
    familyLungCancer === 'yes_first_degree' ||
    hasChronicLungDisease ||
    hasOccupationalHazard ||
    secondhandSmoke !== 'none'
  ) {
    calculatedRiskCategory = 'moderate_risk_factors'
  } else {
    calculatedRiskCategory = 'baseline_general'
  }

  // 5. INDEPENDENT SYMPTOM TRIAGE & SAFETY OVERRIDE
  const urgentSymptomsList = symptoms.filter((s) =>
    URGENT_RED_FLAG_SYMPTOMS.includes(s)
  )
  const nonUrgentSymptomsList = symptoms.filter((s) =>
    NON_URGENT_SYMPTOMS.includes(s)
  )

  const hasUrgentSymptoms = urgentSymptomsList.length > 0
  const hasNonUrgentSymptoms = nonUrgentSymptomsList.length > 0

  let symptomUrgency: SymptomTriageUrgency = 'no_symptoms'
  if (hasUrgentSymptoms) {
    symptomUrgency = 'urgent_red_flags'
  } else if (hasNonUrgentSymptoms) {
    symptomUrgency = 'non_urgent_symptoms'
  }

  // 6. Actionable Next Steps Formulation
  const nextStepsEn: string[] = []
  const nextStepsBn: string[] = []

  if (hasUrgentSymptoms) {
    nextStepsEn.push(
      'PRIORITY CLINICAL EVALUATION: You have reported one or more warning signs (such as coughing up blood, persistent cough >3 weeks, or unexplained weight loss). Consult a physician or pulmonologist promptly for comprehensive chest examination and diagnostic imaging. Do not delay medical review based on risk scores.'
    )
    nextStepsBn.push(
      'জরুরি পরামর্শ: আপনি এক বা একাধিক গুরুতর লক্ষণ (যেমন: কাশির সাথে রক্ত যাওয়া, ৩ সপ্তাহের বেশি কাশি, বা অকারণে ওজন হ্রাস) উল্লেখ করেছেন। অবিলম্বে একজন চিকিৎসকের সাথে দেখা করে বুকের প্রয়োজনীয় পরীক্ষা করান। কোনো বিলম্ব করবেন না।'
    )
  }

  if (isScreeningEligible) {
    nextStepsEn.push(
      'SCREENING DISCUSSION CANDIDATE: Your age and cumulative smoking history meet international criteria (USPSTF 2021) for annual Low-Dose CT (LDCT) lung cancer screening. Discuss screening eligibility, benefits, and radiation safety with your healthcare provider.'
    )
    nextStepsBn.push(
      'স্ক্রীনিং পরামর্শ: আপনার বয়স এবং ধূমপানের ইতিহাস আন্তর্জাতিক লো-ডোজ সিটি (LDCT) স্ক্রীনিং নির্দেশিকার সাথে মিলে যায়। আপনার চিকিৎসকের সাথে স্ক্রীনিংয়ের উপযোগিতা নিয়ে আলোচনা করুন।'
    )
  }

  if (smokingStatus === 'current') {
    nextStepsEn.push(
      'TOBACCO CESSATION: Quitting tobacco smoking—whether filtered cigarettes or bidis—is the single most impactful action to reduce further pulmonary disease risk. Ask your doctor about cessation support and nicotine replacement therapy.'
    )
    nextStepsBn.push(
      'ধূমপান বর্জন: সিগারেট বা বিড়ি সম্পূর্ণ বর্জন করা ফুসফুসের দীর্ঘস্থায়ী ক্ষতি রোধের সবচেয়ে কার্যকর উপায়। প্রয়োজনে চিকিৎসকের সাহায্য নিন।'
    )
  }

  if (cookingFuel === 'biomass_wood_dung') {
    nextStepsEn.push(
      'VENTILATION IMPROVEMENT: If using biomass stoves (wood, dung), ensure adequate cross-ventilation in your kitchen or consider transitioning to clean cooking fuels (LPG gas, induction) to reduce indoor particulate inhalation.'
    )
    nextStepsBn.push(
      'রান্নাঘরের বাতাস চলাচল: মাটির চুলায় রান্নার সময় ধোঁয়া বের হওয়ার জন্য পর্যাপ্ত জানালা বা চিমনি নিশ্চিত করুন অথবা নিরাপদ জ্বালানি ব্যবহারের চেষ্টা করুন।'
    )
  }

  if (nextStepsEn.length === 0) {
    nextStepsEn.push(
      'GENERAL PULMONARY WELLNESS: Continue maintaining healthy lifestyle habits, avoid secondhand tobacco smoke, protect your airways during high air pollution days, and report any future persistent respiratory symptoms to a healthcare professional.'
    )
    nextStepsBn.push(
      'সাধারণ স্বাস্থ্য পরামর্শ: স্বাস্থ্যকর জীবনযাপন বজায় রাখুন, পরোক্ষ ধূমপান পরিহার করুন এবং ভবিষ্যতে কোনো স্থায়ী কাশির লক্ষণ দেখা দিলে চিকিৎসকের পরামর্শ নিন।'
    )
  }

  return {
    packYears,
    calculatedRiskCategory,
    symptomUrgency,
    hasUrgentSymptoms,
    urgentSymptomsList,
    nonUrgentSymptomsList,
    isScreeningEligibleAgeAndSmoking: isScreeningEligible,
    identifiedRiskFactorsEn: riskFactorsEn,
    identifiedRiskFactorsBn: riskFactorsBn,
    recommendedNextStepsEn: nextStepsEn,
    recommendedNextStepsBn: nextStepsBn,
    disclaimerEn:
      'NON-DIAGNOSTIC ADVISORY: This self-check provides educational risk factor assessment and screening guidance based on empirical guidelines. It is NOT a medical diagnosis and cannot confirm or rule out lung cancer. Low estimated risk does not guarantee absence of disease. Concerning symptoms must always be evaluated by a healthcare professional.',
    disclaimerBn:
      'অ-নির্ণায়ক পরামর্শ: এই মূল্যায়নটি কেবল শিক্ষামূলক ঝুঁকি সচেতনতা ও স্ক্রীনিং নির্দেশিকা প্রদান করে। এটি কোনো রোগ নির্ণয় করে না এবং ক্যান্সার নিশ্চিত বা নাকচ করতে পারে না। কম ঝুঁকি মানেই রোগের অনুপস্থিতি নয়। যেকোনো দীর্ঘস্থায়ী লক্ষণে চিকিৎসকের শরণাপন্ন হন।',
    completedAt: new Date().toISOString(),
  }
}

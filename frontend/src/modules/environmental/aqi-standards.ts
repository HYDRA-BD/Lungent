/**
 * Phase 1.16: Authoritative AQI Standards & Interpretation
 *
 * Requirements:
 * - Distinguish European AQI from US AQI.
 * - Preserve the AQI system used for every value.
 * - Do NOT combine different AQI scales into one unexplained number.
 * - Display units and pollutant names clearly.
 * - Use authoritative standards: US EPA (40 CFR Part 58) & European Environment Agency (EEA CAQI).
 * - Avoid presenting AQI as an individual's personal lung cancer risk.
 */

export interface AqiTierInfo {
  scale: 'US_EPA_0_500' | 'EEA_CAQI_0_100'
  numericValue: number
  categoryKey: string
  labelEn: string
  labelBn: string
  severityLevel: 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous'
  colorClass: string
  bgClass: string
  borderClass: string
  badgeVariant: 'success' | 'warning' | 'destructive' | 'secondary' | 'outline'
  standardAuthority: string
  referenceDocumentationUrl: string
}

/**
 * Evaluates US EPA AQI (0-500 scale) according to 40 CFR Part 58 Appendix G
 */
export function interpretUsAqi(value: number): AqiTierInfo {
  const v = Math.round(Math.max(0, value))

  if (v <= 50) {
    return {
      scale: 'US_EPA_0_500',
      numericValue: v,
      categoryKey: 'good',
      labelEn: 'Good',
      labelBn: 'ভালো (সবুজ)',
      severityLevel: 'good',
      colorClass: 'text-emerald-700 dark:text-emerald-300',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderClass: 'border-emerald-200 dark:border-emerald-800',
      badgeVariant: 'success',
      standardAuthority: 'United States Environmental Protection Agency (US EPA Air Quality Index)',
      referenceDocumentationUrl: 'https://www.airnow.gov/aqi/aqi-basics/',
    }
  }

  if (v <= 100) {
    return {
      scale: 'US_EPA_0_500',
      numericValue: v,
      categoryKey: 'moderate',
      labelEn: 'Moderate',
      labelBn: 'সহনীয় (হলুদ)',
      severityLevel: 'moderate',
      colorClass: 'text-amber-700 dark:text-amber-300',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40',
      borderClass: 'border-amber-200 dark:border-amber-800',
      badgeVariant: 'warning',
      standardAuthority: 'United States Environmental Protection Agency (US EPA Air Quality Index)',
      referenceDocumentationUrl: 'https://www.airnow.gov/aqi/aqi-basics/',
    }
  }

  if (v <= 150) {
    return {
      scale: 'US_EPA_0_500',
      numericValue: v,
      categoryKey: 'unhealthy_sensitive',
      labelEn: 'Unhealthy for Sensitive Groups',
      labelBn: 'সংবেদনশীলদের জন্য অস্বাস্থ্যকর (কমলা)',
      severityLevel: 'unhealthy_sensitive',
      colorClass: 'text-orange-700 dark:text-orange-300',
      bgClass: 'bg-orange-50 dark:bg-orange-950/40',
      borderClass: 'border-orange-200 dark:border-orange-800',
      badgeVariant: 'warning',
      standardAuthority: 'United States Environmental Protection Agency (US EPA Air Quality Index)',
      referenceDocumentationUrl: 'https://www.airnow.gov/aqi/aqi-basics/',
    }
  }

  if (v <= 200) {
    return {
      scale: 'US_EPA_0_500',
      numericValue: v,
      categoryKey: 'unhealthy',
      labelEn: 'Unhealthy',
      labelBn: 'অস্বাস্থ্যকর (লাল)',
      severityLevel: 'unhealthy',
      colorClass: 'text-red-700 dark:text-red-300',
      bgClass: 'bg-red-50 dark:bg-red-950/40',
      borderClass: 'border-red-200 dark:border-red-800',
      badgeVariant: 'destructive',
      standardAuthority: 'United States Environmental Protection Agency (US EPA Air Quality Index)',
      referenceDocumentationUrl: 'https://www.airnow.gov/aqi/aqi-basics/',
    }
  }

  if (v <= 300) {
    return {
      scale: 'US_EPA_0_500',
      numericValue: v,
      categoryKey: 'very_unhealthy',
      labelEn: 'Very Unhealthy',
      labelBn: 'খুব অস্বাস্থ্যকর (বেগুনী)',
      severityLevel: 'very_unhealthy',
      colorClass: 'text-purple-700 dark:text-purple-300',
      bgClass: 'bg-purple-50 dark:bg-purple-950/40',
      borderClass: 'border-purple-200 dark:border-purple-800',
      badgeVariant: 'destructive',
      standardAuthority: 'United States Environmental Protection Agency (US EPA Air Quality Index)',
      referenceDocumentationUrl: 'https://www.airnow.gov/aqi/aqi-basics/',
    }
  }

  return {
    scale: 'US_EPA_0_500',
    numericValue: v,
    categoryKey: 'hazardous',
    labelEn: 'Hazardous',
    labelBn: 'বিপজ্জনক (মেরুন)',
    severityLevel: 'hazardous',
    colorClass: 'text-rose-900 dark:text-rose-200',
    bgClass: 'bg-rose-100 dark:bg-rose-950/60',
    borderClass: 'border-rose-300 dark:border-rose-800',
    badgeVariant: 'destructive',
    standardAuthority: 'United States Environmental Protection Agency (US EPA Air Quality Index)',
    referenceDocumentationUrl: 'https://www.airnow.gov/aqi/aqi-basics/',
  }
}

/**
 * Evaluates European Common Air Quality Index (CAQI 0-100+ scale)
 * according to European Environment Agency (EEA) Directive 2008/50/EC
 */
export function interpretEuropeanAqi(value: number): AqiTierInfo {
  const v = Math.round(Math.max(0, value))

  if (v <= 20) {
    return {
      scale: 'EEA_CAQI_0_100',
      numericValue: v,
      categoryKey: 'very_good',
      labelEn: 'Very Good',
      labelBn: 'খুব ভালো',
      severityLevel: 'good',
      colorClass: 'text-teal-700 dark:text-teal-300',
      bgClass: 'bg-teal-50 dark:bg-teal-950/40',
      borderClass: 'border-teal-200 dark:border-teal-800',
      badgeVariant: 'success',
      standardAuthority: 'European Environment Agency (EEA Common Air Quality Index / CAQI)',
      referenceDocumentationUrl: 'https://www.eea.europa.eu/themes/air/air-quality-index',
    }
  }

  if (v <= 40) {
    return {
      scale: 'EEA_CAQI_0_100',
      numericValue: v,
      categoryKey: 'good',
      labelEn: 'Good',
      labelBn: 'ভালো',
      severityLevel: 'good',
      colorClass: 'text-emerald-700 dark:text-emerald-300',
      bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderClass: 'border-emerald-200 dark:border-emerald-800',
      badgeVariant: 'success',
      standardAuthority: 'European Environment Agency (EEA Common Air Quality Index / CAQI)',
      referenceDocumentationUrl: 'https://www.eea.europa.eu/themes/air/air-quality-index',
    }
  }

  if (v <= 60) {
    return {
      scale: 'EEA_CAQI_0_100',
      numericValue: v,
      categoryKey: 'medium',
      labelEn: 'Medium',
      labelBn: 'মাঝারি',
      severityLevel: 'moderate',
      colorClass: 'text-amber-700 dark:text-amber-300',
      bgClass: 'bg-amber-50 dark:bg-amber-950/40',
      borderClass: 'border-amber-200 dark:border-amber-800',
      badgeVariant: 'warning',
      standardAuthority: 'European Environment Agency (EEA Common Air Quality Index / CAQI)',
      referenceDocumentationUrl: 'https://www.eea.europa.eu/themes/air/air-quality-index',
    }
  }

  if (v <= 80) {
    return {
      scale: 'EEA_CAQI_0_100',
      numericValue: v,
      categoryKey: 'poor',
      labelEn: 'Poor',
      labelBn: 'খারাপ',
      severityLevel: 'unhealthy',
      colorClass: 'text-orange-700 dark:text-orange-300',
      bgClass: 'bg-orange-50 dark:bg-orange-950/40',
      borderClass: 'border-orange-200 dark:border-orange-800',
      badgeVariant: 'destructive',
      standardAuthority: 'European Environment Agency (EEA Common Air Quality Index / CAQI)',
      referenceDocumentationUrl: 'https://www.eea.europa.eu/themes/air/air-quality-index',
    }
  }

  if (v <= 100) {
    return {
      scale: 'EEA_CAQI_0_100',
      numericValue: v,
      categoryKey: 'very_poor',
      labelEn: 'Very Poor',
      labelBn: 'খুব খারাপ',
      severityLevel: 'very_unhealthy',
      colorClass: 'text-red-700 dark:text-red-300',
      bgClass: 'bg-red-50 dark:bg-red-950/40',
      borderClass: 'border-red-200 dark:border-red-800',
      badgeVariant: 'destructive',
      standardAuthority: 'European Environment Agency (EEA Common Air Quality Index / CAQI)',
      referenceDocumentationUrl: 'https://www.eea.europa.eu/themes/air/air-quality-index',
    }
  }

  return {
    scale: 'EEA_CAQI_0_100',
    numericValue: v,
    categoryKey: 'extremely_poor',
    labelEn: 'Extremely Poor',
    labelBn: 'চরম খারাপ',
    severityLevel: 'hazardous',
    colorClass: 'text-purple-900 dark:text-purple-200',
    bgClass: 'bg-purple-100 dark:bg-purple-950/60',
    borderClass: 'border-purple-300 dark:border-purple-800',
    badgeVariant: 'destructive',
    standardAuthority: 'European Environment Agency (EEA Common Air Quality Index / CAQI)',
    referenceDocumentationUrl: 'https://www.eea.europa.eu/themes/air/air-quality-index',
  }
}

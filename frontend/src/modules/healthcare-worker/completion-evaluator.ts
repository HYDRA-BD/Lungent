import type { Patient } from '@/modules/patients/types'
import type { ComprehensivePatientHealthRecord } from '@/modules/health-records/types'
import type { PatientCompletionStatus, MissingInformationItem, CompletionLevel } from './types'

/**
 * Algorithmic evaluator for patient health information completeness.
 * Identifies missing clinical items required for future risk estimation,
 * screening eligibility, and triage modules.
 */
export function evaluatePatientRecordCompleteness(
  patient: Patient,
  records?: ComprehensivePatientHealthRecord | null,
  evaluatorId?: string
): PatientCompletionStatus {
  const missing: MissingInformationItem[] = []
  let earnedWeight = 0
  const totalWeight = 100

  // 1. Core Demographics & Identification (20%)
  let demoWeight = 0
  if (patient.dateOfBirth || patient.approximateAge) {
    demoWeight += 8
  } else {
    missing.push({
      key: 'missing_age',
      section: 'demographics',
      labelEn: 'Patient age or date of birth',
      labelBn: 'রোগীর বয়স বা জন্মতারিখ',
      isCritical: true,
      targetTab: 'profile',
    })
  }

  if (patient.gender && patient.gender !== 'unspecified') {
    demoWeight += 6
  } else {
    missing.push({
      key: 'missing_gender',
      section: 'demographics',
      labelEn: 'Biological sex / gender',
      labelBn: 'লিঙ্গ পরিচয়',
      isCritical: true,
      targetTab: 'profile',
    })
  }

  if (patient.phoneNumber && patient.phoneNumber.length >= 10) {
    demoWeight += 6
  } else {
    missing.push({
      key: 'missing_phone',
      section: 'demographics',
      labelEn: 'Contact mobile telephone number',
      labelBn: 'যোগাযোগের মোবাইল নম্বর',
      isCritical: false,
      targetTab: 'profile',
    })
  }
  earnedWeight += demoWeight

  // 2. Smoking & Tobacco History (25% - Vital for lung cancer risk & screening)
  const smoking = records?.smokingHistory
  if (smoking && smoking.smokingStatus) {
    if (smoking.smokingStatus === 'never') {
      earnedWeight += 25
    } else if (smoking.smokingStatus === 'unknown_unreported') {
      missing.push({
        key: 'missing_smoking_status',
        section: 'smoking',
        labelEn: 'Detailed tobacco smoking history required',
        labelBn: 'ধূমপানের বিস্তারিত ইতিহাস প্রয়োজন',
        isCritical: true,
        targetTab: 'smoking',
      })
    } else {
      let smokeSubWeight = 10
      if (smoking.calculatedPackYears !== null && smoking.calculatedPackYears !== undefined) {
        smokeSubWeight += 15
      } else if (smoking.yearsSmoked && (smoking.cigarettesPerDay || smoking.bidisPerDay)) {
        smokeSubWeight += 15
      } else {
        missing.push({
          key: 'missing_pack_years',
          section: 'smoking',
          labelEn: 'Tobacco pack-years or consumption duration',
          labelBn: 'ধূমপানের প্যাক-বছর বা সময়কাল',
          isCritical: true,
          targetTab: 'smoking',
        })
      }
      earnedWeight += smokeSubWeight
    }
  } else {
    missing.push({
      key: 'missing_smoking_status',
      section: 'smoking',
      labelEn: 'Tobacco smoking status & history',
      labelBn: 'ধূমপানের ইতিহাস ও বর্তমান অবস্থা',
      isCritical: true,
      targetTab: 'smoking',
    })
  }

  // 3. Physical Measurements & Vitals (15%)
  const measurements = records?.measurements || []
  const hasHeight = measurements.some(m => m.measurementType === 'height')
  const hasWeight = measurements.some(m => m.measurementType === 'weight')
  const hasBmi = measurements.some(m => m.measurementType === 'bmi') || (hasHeight && hasWeight)
  const hasBp = measurements.some(m => 
    m.measurementType === 'blood_pressure_combined' || 
    m.measurementType === 'blood_pressure_systolic'
  )

  if (measurements.length > 0) {
    let measWeight = 0
    if (hasBmi) {
      measWeight += 10
    } else {
      missing.push({
        key: 'missing_bmi',
        section: 'measurements',
        labelEn: 'Height and weight (BMI evaluation)',
        labelBn: 'উচ্চতা ও ওজন (বিএমআই নির্ণয়)',
        isCritical: false,
        targetTab: 'measurements',
      })
    }
    if (hasBp) {
      measWeight += 5
    }
    earnedWeight += measWeight
  } else {
    missing.push({
      key: 'missing_measurements',
      section: 'measurements',
      labelEn: 'Vital physical measurements (Height, Weight, BP)',
      labelBn: 'শারীরিক পরিমাপ (উচ্চতা, ওজন, রক্তচাপ)',
      isCritical: false,
      targetTab: 'measurements',
    })
  }

  // 4. Respiratory Symptoms Evaluation (15%)
  const symptoms = records?.symptoms || []
  if (symptoms.length > 0) {
    earnedWeight += 15
  } else {
    missing.push({
      key: 'missing_symptoms',
      section: 'symptoms',
      labelEn: 'Current respiratory symptoms evaluation (Cough, Hemoptysis, Dyspnea)',
      labelBn: 'শ্বাসযন্ত্রের উপসর্গ মূল্যায়ন (কাশি, কফের সাথে রক্ত, শ্বাসকষ্ট)',
      isCritical: true,
      targetTab: 'symptoms',
    })
  }

  // 5. Environmental & Occupational Exposures (10%)
  const exposures = records?.environmentalExposures || []
  if (exposures.length > 0) {
    earnedWeight += 10
  } else {
    missing.push({
      key: 'missing_exposures',
      section: 'exposures',
      labelEn: 'Biomass smoke, indoor cooking, & occupational exposures',
      labelBn: 'রান্নার ধোঁয়া ও পেশাগত ক্ষতিকর উপাদান সংস্পর্শ',
      isCritical: false,
      targetTab: 'exposures',
    })
  }

  // 6. Family Cancer History (10%)
  const family = records?.familyHistory || []
  if (family.length > 0) {
    earnedWeight += 10
  } else {
    missing.push({
      key: 'missing_family_history',
      section: 'family-history',
      labelEn: 'Family history of lung or other respiratory cancers',
      labelBn: 'পরিবারে ফুসফুসের ক্যান্সার বা শ্বাসযন্ত্রের রোগের ইতিহাস',
      isCritical: false,
      targetTab: 'family-history',
    })
  }

  // 7. Medical Conditions & Allergies (5%)
  const conditions = records?.medicalConditions || []
  const allergies = records?.allergies || []
  if (conditions.length > 0 || allergies.length > 0) {
    earnedWeight += 5
  }

  // Clamp score 0 - 100
  const completionScore = Math.min(totalWeight, Math.max(0, earnedWeight))
  let status: CompletionLevel = 'incomplete'
  if (completionScore >= 80) {
    status = 'complete'
  } else if (completionScore >= 50) {
    status = 'partially_complete'
  }

  return {
    patientId: patient.id,
    completionScore,
    status,
    missingSections: missing,
    lastCalculatedAt: new Date().toISOString(),
    evaluatedBy: evaluatorId || null,
  }
}

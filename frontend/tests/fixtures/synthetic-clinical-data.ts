/**
 * Phase 1.26: Synthetic Clinical Data Fixtures for Platform QA
 *
 * All identities, clinical observations, addresses, and identifiers in this file
 * are 100% SYNTHETIC and generated exclusively for software quality assurance,
 * automated testing, and validation of clinical safety invariants.
 *
 * Under no circumstances does this file contain real patient health information (PHI)
 * or real identifiable individuals.
 */

import type { UserRole, AccountStatus, SupportedLocale } from '@/types'
import type { RiskExecutionMode } from '@/modules/risk-estimation/types'

// ============================================================================
// 1. SYNTHETIC HEALTHCARE FACILITIES
// ============================================================================
export const SYNTHETIC_FACILITIES = [
  {
    id: 'fac-dhaka-central-01',
    facilityCode: 'DMC-DHAKA-01',
    name: 'Dhaka Central Chest & General Hospital',
    division: 'Dhaka',
    district: 'Dhaka',
    upazila: 'Dhanmondi',
    tier: 'tertiary_specialized',
    hasCtScanner: true,
    hasLdctCapability: true,
    hasPulmonologySpecialist: true,
    isActive: true,
  },
  {
    id: 'fac-sylhet-district-02',
    facilityCode: 'SDH-SYLHET-02',
    name: 'Sylhet Sadar General Hospital',
    division: 'Sylhet',
    district: 'Sylhet',
    upazila: 'Sylhet Sadar',
    tier: 'district_hospital',
    hasCtScanner: true,
    hasLdctCapability: false,
    hasPulmonologySpecialist: true,
    isActive: true,
  },
  {
    id: 'fac-cox-community-03',
    facilityCode: 'UHC-COX-03',
    name: 'Teknaf Upazila Health Complex',
    division: 'Chittagong',
    district: "Cox's Bazar",
    upazila: 'Teknaf',
    tier: 'primary_community',
    hasCtScanner: false,
    hasLdctCapability: false,
    hasPulmonologySpecialist: false,
    isActive: true,
  },
] as const

// ============================================================================
// 2. SYNTHETIC USER ACCOUNTS ACROSS ROLES
// ============================================================================
export const SYNTHETIC_USERS = {
  patient: {
    id: 'usr-syn-patient-01',
    auth_user_id: 'auth-pat-001',
    email: 'synthetic.patient.rahim@lungent.qa.test',
    full_name: 'Synthetic Patient Rahim Ullah',
    phone_number: '+8801700000001',
    preferred_language: 'bn' as SupportedLocale,
    status: 'active' as AccountStatus,
    role: 'patient' as UserRole,
  },
  healthcareWorker: {
    id: 'usr-syn-worker-01',
    auth_user_id: 'auth-chw-001',
    email: 'synthetic.worker.salma@lungent.qa.test',
    full_name: 'Synthetic CHW Salma Begum',
    phone_number: '+8801700000002',
    preferred_language: 'bn' as SupportedLocale,
    status: 'active' as AccountStatus,
    role: 'healthcare_worker' as UserRole,
    facilityId: 'fac-dhaka-central-01',
  },
  clinician: {
    id: 'usr-syn-clinician-01',
    auth_user_id: 'auth-doc-001',
    email: 'synthetic.dr.farhana@lungent.qa.test',
    full_name: 'Dr. Synthetic Farhana Ahmed, MBBS, FCPS',
    phone_number: '+8801700000003',
    preferred_language: 'en' as SupportedLocale,
    status: 'active' as AccountStatus,
    role: 'clinician' as UserRole,
    bmdcRegistrationNumber: 'BMDC-A-99999',
    facilityId: 'fac-dhaka-central-01',
  },
  administrator: {
    id: 'usr-syn-admin-01',
    auth_user_id: 'auth-adm-001',
    email: 'synthetic.admin@lungent.qa.test',
    full_name: 'Synthetic Security Administrator',
    phone_number: '+8801700000004',
    preferred_language: 'en' as SupportedLocale,
    status: 'active' as AccountStatus,
    role: 'administrator' as UserRole,
  },
} as const

// ============================================================================
// 3. SYNTHETIC PATIENT CLINICAL PROFILES (FOR SAFETY & INVARIANT TESTING)
// ============================================================================

/**
 * Patient Alpha: Heavy smoker, 62yo, high risk, eligible for screening, no acute red flags.
 */
export const SYNTHETIC_PATIENT_HIGH_RISK = {
  patientId: '11111111-1111-4111-a111-111111111111',
  nationalId: '19642691234567890',
  fullName: 'Synthetic Patient Kabir Hossain',
  gender: 'male',
  age: 62,
  division: 'Dhaka',
  district: 'Dhaka',
  upazila: 'Mirpur',
  primaryFacilityId: 'fac-dhaka-central-01',
  smokingStatus: 'current_smoker',
  smokingPacksPerDay: 1.5,
  smokingYears: 40, // 60 pack-years
  quitYearsAgo: 0,
  familyHistoryLungCancer: true,
  personalHistoryCancer: false,
  copdDiagnosed: true,
  biomassSmokeExposureYears: 10,
  symptoms: {
    coughDurationWeeks: 1,
    hemoptysis: false,
    unexplainedWeightLoss: false,
    chestPain: false,
    dyspnea: true,
    hoarseness: false,
    nightSweats: false,
  },
}

/**
 * Patient Beta: Young adult, non-smoker, 32yo, VERY LOW calculated risk (<0.1%),
 * BUT presenting with HEMOPTYSIS (coughing up blood).
 * CRITICAL TEST CASE: Low risk MUST NOT suppress Emergency Red-Flag Triage!
 */
export const SYNTHETIC_PATIENT_LOW_RISK_ACUTE_HEMOPTYSIS = {
  patientId: '22222222-2222-4222-a222-222222222222',
  nationalId: '19942691234567891',
  fullName: 'Synthetic Patient Nusrat Jahan',
  gender: 'female',
  age: 32,
  division: 'Chittagong',
  district: 'Chittagong',
  upazila: 'Panchlaish',
  primaryFacilityId: 'fac-cox-community-03',
  smokingStatus: 'never_smoker',
  smokingPacksPerDay: 0,
  smokingYears: 0,
  quitYearsAgo: 0,
  familyHistoryLungCancer: false,
  personalHistoryCancer: false,
  copdDiagnosed: false,
  biomassSmokeExposureYears: 5,
  symptoms: {
    coughDurationWeeks: 2,
    hemoptysis: true, // RED FLAG
    unexplainedWeightLoss: true, // RED FLAG
    chestPain: true,
    dyspnea: true,
    hoarseness: false,
    nightSweats: true,
  },
}

/**
 * Patient Gamma: 45yo, 20 pack-years, ineligible for screening (age < 50 for USPSTF 2021),
 * with chronic persistent cough > 4 weeks and unexplained weight loss.
 * CRITICAL TEST CASE: Screening ineligibility MUST NOT block symptom escalation!
 */
export const SYNTHETIC_PATIENT_INELIGIBLE_SCREENING_ALARM_SYMPTOMS = {
  patientId: '33333333-3333-4333-a333-333333333333',
  nationalId: '19812691234567892',
  fullName: 'Synthetic Patient Tariqul Islam',
  gender: 'male',
  age: 45, // Under 50 window
  division: 'Sylhet',
  district: 'Sylhet',
  upazila: 'Sylhet Sadar',
  primaryFacilityId: 'fac-sylhet-district-02',
  smokingStatus: 'current_smoker',
  smokingPacksPerDay: 1.0,
  smokingYears: 22, // 22 pack-years
  quitYearsAgo: 0,
  familyHistoryLungCancer: false,
  personalHistoryCancer: false,
  copdDiagnosed: false,
  biomassSmokeExposureYears: 0,
  symptoms: {
    coughDurationWeeks: 5, // Persistent > 3 weeks
    hemoptysis: false,
    unexplainedWeightLoss: true, // Suspicious
    chestPain: false,
    dyspnea: false,
    hoarseness: false,
    nightSweats: false,
  },
}

/**
 * Patient Delta: Missing critical smoking data.
 * Tests missing data handling and deterministic validation bounds.
 */
export const SYNTHETIC_PATIENT_INCOMPLETE_RECORDS = {
  patientId: '44444444-4444-4444-a444-444444444444',
  nationalId: '19702691234567893',
  fullName: 'Synthetic Patient Unspecified Data',
  gender: 'unknown',
  age: 55,
  division: 'Rajshahi',
  district: 'Bogura',
  upazila: 'Bogura Sadar',
  primaryFacilityId: 'fac-dhaka-central-01',
  smokingStatus: 'unknown',
  smokingPacksPerDay: undefined,
  smokingYears: undefined,
  quitYearsAgo: undefined,
  familyHistoryLungCancer: undefined,
  personalHistoryCancer: false,
  copdDiagnosed: false,
  biomassSmokeExposureYears: undefined,
  symptoms: {},
}

// ============================================================================
// 4. TEST CONFIGURATION MODES
// ============================================================================
export const QA_EXECUTION_MODES = {
  research: {
    risk: 'research_simulation' as RiskExecutionMode,
    screening: 'research_simulation' as RiskExecutionMode,
    triage: 'research_simulation' as RiskExecutionMode,
  },
  clinicalProduction: {
    risk: 'clinical_production' as RiskExecutionMode,
    screening: 'clinical_production' as RiskExecutionMode,
    triage: 'clinical_production' as RiskExecutionMode,
  },
} as const

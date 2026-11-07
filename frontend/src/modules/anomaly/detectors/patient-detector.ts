/**
 * Phase 2.5: Patient Data Anomaly Detector
 *
 * Scans patient demographics, vitals, medical history, tobacco exposure,
 * and longitudinal measurements for biological contradictions and entry errors.
 */

import {
  BIOLOGICAL_LIMITS,
  calculateBMI,
} from '../math/statistical-outliers'
import { getAnomalyRule } from '../anomaly-rule-registry'
import type { AnomalyRecord } from '../types'

export interface PatientDetectionInput {
  patientId: string
  facilityId?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  heightCm?: number | null
  weightKg?: number | null
  recordedBmi?: number | null
  systolicBp?: number | null
  diastolicBp?: number | null
  pulseBpm?: number | null
  oxygenSaturation?: number | null
  smokingStatus?: string | null
  cigarettesPerDay?: number | null
  yearsSmoked?: number | null
  packYears?: number | null
  ageStartedSmoking?: number | null
  ageQuitSmoking?: number | null
  medicalConditions?: Array<{
    conditionName: string
    diagnosisYear?: number | null
  }> | null
  longitudinalHistory?: Array<{
    recordedAt: string
    heightCm?: number | null
    weightKg?: number | null
  }> | null
}

export class PatientDataAnomalyDetector {
  public static scan(input: PatientDetectionInput): AnomalyRecord[] {
    const anomalies: AnomalyRecord[] = []
    const now = new Date()
    const currentYear = now.getFullYear()

    // 1. Demographic Invariant Checks (RULE-PAT-001)
    if (input.dateOfBirth) {
      const dob = new Date(input.dateOfBirth)
      if (!isNaN(dob.getTime())) {
        if (dob.getTime() > now.getTime()) {
          const rule = getAnomalyRule('RULE-PAT-001')!
          anomalies.push({
            id: crypto.randomUUID(),
            anomalyNumber: `ANM-PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            category: 'patient_data',
            subtype: 'demographic_conflict',
            severity: rule.defaultSeverity,
            status: 'detected',
            entityType: 'patient',
            entityId: input.patientId,
            facilityId: input.facilityId,
            titleEn: rule.titleEn,
            titleBn: rule.titleBn,
            descriptionEn: `Patient date of birth (${input.dateOfBirth}) is in the future.`,
            descriptionBn: `রোগীর জন্মতারিখ (${input.dateOfBirth}) ভবিষ্যৎ নির্দেশ করছে।`,
            detectionMethodology: rule.methodology,
            ruleId: rule.ruleId,
            ruleVersion: rule.version,
            triggeringFields: ['date_of_birth'],
            observedValue: { dateOfBirth: input.dateOfBirth },
            expectedReference: { maxAllowableDate: now.toISOString().split('T')[0] },
            contextMetadata: { patientId: input.patientId },
            assignedRole: rule.assignedRole,
            detectedAt: now.toISOString(),
            updatedAt: now.toISOString(),
          })
        } else {
          const ageYears = currentYear - dob.getFullYear()
          if (ageYears > BIOLOGICAL_LIMITS.ageYears.max) {
            const rule = getAnomalyRule('RULE-PAT-001')!
            anomalies.push({
              id: crypto.randomUUID(),
              anomalyNumber: `ANM-PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              category: 'patient_data',
              subtype: 'demographic_conflict',
              severity: rule.defaultSeverity,
              status: 'detected',
              entityType: 'patient',
              entityId: input.patientId,
              facilityId: input.facilityId,
              titleEn: rule.titleEn,
              titleBn: rule.titleBn,
              descriptionEn: `Recorded age (${ageYears} years) exceeds biological threshold (> 125 years).`,
              descriptionBn: `রেকর্ডকৃত বয়স (${ageYears} বছর) স্বাভাবিক গ্রহণযোগ্য সীমা (> ১২৫ বছর) অতিক্রম করেছে।`,
              detectionMethodology: rule.methodology,
              ruleId: rule.ruleId,
              ruleVersion: rule.version,
              triggeringFields: ['date_of_birth', 'age_years'],
              observedValue: { dateOfBirth: input.dateOfBirth, calculatedAge: ageYears },
              expectedReference: { maxBiologicalAge: BIOLOGICAL_LIMITS.ageYears.max },
              contextMetadata: { patientId: input.patientId },
              assignedRole: rule.assignedRole,
              detectedAt: now.toISOString(),
              updatedAt: now.toISOString(),
            })
          }
        }
      }
    }

    // 2. BMI and Height/Weight Mathematical Discordance (RULE-PAT-002)
    if (
      input.heightCm &&
      input.weightKg &&
      input.recordedBmi !== null &&
      input.recordedBmi !== undefined
    ) {
      const calculated = calculateBMI(input.weightKg, input.heightCm)
      const discordance = Math.abs(input.recordedBmi - calculated)
      if (discordance > BIOLOGICAL_LIMITS.bmi.maxDiscordance) {
        const rule = getAnomalyRule('RULE-PAT-002')!
        anomalies.push({
          id: crypto.randomUUID(),
          anomalyNumber: `ANM-PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'patient_data',
          subtype: 'implausible_physical_measurement',
          severity: rule.defaultSeverity,
          status: 'detected',
          entityType: 'patient',
          entityId: input.patientId,
          facilityId: input.facilityId,
          titleEn: rule.titleEn,
          titleBn: rule.titleBn,
          descriptionEn: `Recorded BMI (${input.recordedBmi}) disagrees with calculated BMI (${calculated}) by ${discordance.toFixed(2)} kg/m².`,
          descriptionBn: `রেকর্ডকৃত বিএমআই (${input.recordedBmi}) গণনাকৃত বিএমআই (${calculated}) থেকে ${discordance.toFixed(2)} কেজি/মি² অমিল।`,
          detectionMethodology: rule.methodology,
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          triggeringFields: ['recorded_bmi', 'height_cm', 'weight_kg'],
          observedValue: {
            recordedBmi: input.recordedBmi,
            heightCm: input.heightCm,
            weightKg: input.weightKg,
            calculatedBmi: calculated,
          },
          expectedReference: { maxAllowableDiscordance: BIOLOGICAL_LIMITS.bmi.maxDiscordance },
          contextMetadata: { patientId: input.patientId },
          assignedRole: rule.assignedRole,
          detectedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
      }
    }

    // 3. Biologically Incompatible Blood Pressure & Vitals (RULE-PAT-003)
    if (
      input.systolicBp !== null &&
      input.systolicBp !== undefined &&
      input.diastolicBp !== null &&
      input.diastolicBp !== undefined
    ) {
      if (input.systolicBp <= input.diastolicBp) {
        const rule = getAnomalyRule('RULE-PAT-003')!
        anomalies.push({
          id: crypto.randomUUID(),
          anomalyNumber: `ANM-PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'patient_data',
          subtype: 'implausible_physical_measurement',
          severity: rule.defaultSeverity,
          status: 'detected',
          entityType: 'patient',
          entityId: input.patientId,
          facilityId: input.facilityId,
          titleEn: rule.titleEn,
          titleBn: rule.titleBn,
          descriptionEn: `Systolic BP (${input.systolicBp} mmHg) is less than or equal to diastolic BP (${input.diastolicBp} mmHg).`,
          descriptionBn: `সিস্টোলিক রক্তচাপ (${input.systolicBp} mmHg) ডায়াস্টোলিক চাপের (${input.diastolicBp} mmHg) সমান বা কম।`,
          detectionMethodology: rule.methodology,
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          triggeringFields: ['systolic_bp', 'diastolic_bp'],
          observedValue: { systolicBp: input.systolicBp, diastolicBp: input.diastolicBp },
          expectedReference: { condition: 'systolicBp > diastolicBp' },
          contextMetadata: { patientId: input.patientId },
          assignedRole: rule.assignedRole,
          detectedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
      }
    }

    // Oxygen saturation checks
    if (input.oxygenSaturation !== null && input.oxygenSaturation !== undefined) {
      if (
        input.oxygenSaturation > BIOLOGICAL_LIMITS.oxygenSaturation.max ||
        input.oxygenSaturation < BIOLOGICAL_LIMITS.oxygenSaturation.min
      ) {
        const rule = getAnomalyRule('RULE-PAT-003')!
        anomalies.push({
          id: crypto.randomUUID(),
          anomalyNumber: `ANM-PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'patient_data',
          subtype: 'implausible_physical_measurement',
          severity: 'critical',
          status: 'detected',
          entityType: 'patient',
          entityId: input.patientId,
          facilityId: input.facilityId,
          titleEn: 'Physiologically Implausible Oxygen Saturation (SpO2)',
          titleBn: 'শারীরবৃত্তীয়ভাবে অসম্ভব অক্সিজেন স্যাচুরেশন (SpO2)',
          descriptionEn: `Recorded SpO2 (${input.oxygenSaturation}%) is outside human survivable limits (40% - 100%).`,
          descriptionBn: `রেকর্ডকৃত SpO2 (${input.oxygenSaturation}%) মানবশরীরের স্বাভাবিক সীমার (৪০% - ১০০%) বাইরে।`,
          detectionMethodology: rule.methodology,
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          triggeringFields: ['oxygen_saturation'],
          observedValue: { oxygenSaturation: input.oxygenSaturation },
          expectedReference: BIOLOGICAL_LIMITS.oxygenSaturation,
          contextMetadata: { patientId: input.patientId },
          assignedRole: rule.assignedRole,
          detectedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
      }
    }

    // 4. Tobacco Exposure Contradictions (RULE-PAT-004)
    if (input.smokingStatus === 'never_smoker') {
      if (
        (input.packYears !== null && input.packYears !== undefined && input.packYears > 0) ||
        (input.cigarettesPerDay !== null &&
          input.cigarettesPerDay !== undefined &&
          input.cigarettesPerDay > 0)
      ) {
        const rule = getAnomalyRule('RULE-PAT-004')!
        anomalies.push({
          id: crypto.randomUUID(),
          anomalyNumber: `ANM-PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'patient_data',
          subtype: 'unusual_tobacco_history',
          severity: rule.defaultSeverity,
          status: 'detected',
          entityType: 'patient',
          entityId: input.patientId,
          facilityId: input.facilityId,
          titleEn: rule.titleEn,
          titleBn: rule.titleBn,
          descriptionEn: `Patient recorded as never-smoker but has positive pack-years (${input.packYears}) or daily cigarettes (${input.cigarettesPerDay}).`,
          descriptionBn: `রোগী অধূমপায়ী হিসেবে চিহ্নিত কিন্তু প্যাক-বছর (${input.packYears}) বা দৈনিক সিগারেট (${input.cigarettesPerDay}) বিদ্যমান।`,
          detectionMethodology: rule.methodology,
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          triggeringFields: ['smoking_status', 'pack_years', 'cigarettes_per_day'],
          observedValue: {
            smokingStatus: input.smokingStatus,
            packYears: input.packYears,
            cigarettesPerDay: input.cigarettesPerDay,
          },
          expectedReference: { expectedPackYearsForNeverSmoker: 0 },
          contextMetadata: { patientId: input.patientId },
          assignedRole: rule.assignedRole,
          detectedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
      }
    }

    // Smoking quit age earlier than start age
    if (
      input.ageStartedSmoking !== null &&
      input.ageStartedSmoking !== undefined &&
      input.ageQuitSmoking !== null &&
      input.ageQuitSmoking !== undefined
    ) {
      if (input.ageQuitSmoking < input.ageStartedSmoking) {
        const rule = getAnomalyRule('RULE-PAT-004')!
        anomalies.push({
          id: crypto.randomUUID(),
          anomalyNumber: `ANM-PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'patient_data',
          subtype: 'unusual_tobacco_history',
          severity: rule.defaultSeverity,
          status: 'detected',
          entityType: 'patient',
          entityId: input.patientId,
          facilityId: input.facilityId,
          titleEn: rule.titleEn,
          titleBn: rule.titleBn,
          descriptionEn: `Quit age (${input.ageQuitSmoking}y) is earlier than smoking start age (${input.ageStartedSmoking}y).`,
          descriptionBn: `ধূমপান ত্যাগের বয়স (${input.ageQuitSmoking} বছর) ধূমপান শুরুর বয়সের (${input.ageStartedSmoking} বছর) পূর্বে।`,
          detectionMethodology: rule.methodology,
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          triggeringFields: ['age_started_smoking', 'age_quit_smoking'],
          observedValue: {
            ageStartedSmoking: input.ageStartedSmoking,
            ageQuitSmoking: input.ageQuitSmoking,
          },
          expectedReference: { condition: 'ageQuitSmoking >= ageStartedSmoking' },
          contextMetadata: { patientId: input.patientId },
          assignedRole: rule.assignedRole,
          detectedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
      }
    }

    // 5. Diagnosis Preceding Patient Date of Birth (RULE-PAT-006)
    if (input.dateOfBirth && input.medicalConditions && input.medicalConditions.length > 0) {
      const birthYear = new Date(input.dateOfBirth).getFullYear()
      for (const cond of input.medicalConditions) {
        if (cond.diagnosisYear && cond.diagnosisYear < birthYear) {
          const rule = getAnomalyRule('RULE-PAT-006')!
          anomalies.push({
            id: crypto.randomUUID(),
            anomalyNumber: `ANM-PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            category: 'patient_data',
            subtype: 'inconsistent_medical_history',
            severity: rule.defaultSeverity,
            status: 'detected',
            entityType: 'patient',
            entityId: input.patientId,
            facilityId: input.facilityId,
            titleEn: rule.titleEn,
            titleBn: rule.titleBn,
            descriptionEn: `Condition "${cond.conditionName}" diagnosis year (${cond.diagnosisYear}) precedes birth year (${birthYear}).`,
            descriptionBn: `রোগ "${cond.conditionName}" নির্ণয়ের সাল (${cond.diagnosisYear}) জন্মসালের (${birthYear}) পূর্ববর্তী।`,
            detectionMethodology: rule.methodology,
            ruleId: rule.ruleId,
            ruleVersion: rule.version,
            triggeringFields: ['date_of_birth', 'diagnosis_year'],
            observedValue: {
              condition: cond.conditionName,
              diagnosisYear: cond.diagnosisYear,
              birthYear,
            },
            expectedReference: { condition: 'diagnosisYear >= birthYear' },
            contextMetadata: { patientId: input.patientId },
            assignedRole: rule.assignedRole,
            detectedAt: now.toISOString(),
            updatedAt: now.toISOString(),
          })
        }
      }
    }

    // 6. Longitudinal Adult Height Drop / Weight Shift (RULE-PAT-005)
    if (input.longitudinalHistory && input.longitudinalHistory.length >= 2) {
      const sorted = [...input.longitudinalHistory].sort(
        (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      )
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1]
        const curr = sorted[i]
        const daysApart =
          (new Date(curr.recordedAt).getTime() - new Date(prev.recordedAt).getTime()) /
          (1000 * 60 * 60 * 24)

        if (
          prev.heightCm &&
          curr.heightCm &&
          prev.heightCm - curr.heightCm > 15
        ) {
          const rule = getAnomalyRule('RULE-PAT-005')!
          anomalies.push({
            id: crypto.randomUUID(),
            anomalyNumber: `ANM-PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            category: 'patient_data',
            subtype: 'longitudinal_drift',
            severity: rule.defaultSeverity,
            status: 'detected',
            entityType: 'patient',
            entityId: input.patientId,
            facilityId: input.facilityId,
            titleEn: rule.titleEn,
            titleBn: rule.titleBn,
            descriptionEn: `Recorded adult height dropped by ${(prev.heightCm - curr.heightCm).toFixed(1)} cm between ${prev.recordedAt.split('T')[0]} and ${curr.recordedAt.split('T')[0]}.`,
            descriptionBn: `রোগীর উচ্চতা ${(prev.heightCm - curr.heightCm).toFixed(1)} সেমি হ্রাস পেয়েছে যা অস্বাভাবিক।`,
            detectionMethodology: rule.methodology,
            ruleId: rule.ruleId,
            ruleVersion: rule.version,
            triggeringFields: ['height_cm', 'recorded_at'],
            observedValue: {
              previousHeightCm: prev.heightCm,
              currentHeightCm: curr.heightCm,
              dropCm: prev.heightCm - curr.heightCm,
            },
            expectedReference: { maxAllowableAdultHeightDropCm: 15 },
            contextMetadata: { patientId: input.patientId, daysApart },
            assignedRole: rule.assignedRole,
            detectedAt: now.toISOString(),
            updatedAt: now.toISOString(),
          })
        }

        if (
          prev.weightKg &&
          curr.weightKg &&
          Math.abs(curr.weightKg - prev.weightKg) > 30 &&
          daysApart <= 30
        ) {
          const rule = getAnomalyRule('RULE-PAT-005')!
          anomalies.push({
            id: crypto.randomUUID(),
            anomalyNumber: `ANM-PAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            category: 'patient_data',
            subtype: 'longitudinal_drift',
            severity: rule.defaultSeverity,
            status: 'detected',
            entityType: 'patient',
            entityId: input.patientId,
            facilityId: input.facilityId,
            titleEn: 'Extreme Short-Interval Weight Fluctuation',
            titleBn: 'স্বল্প সময়ে ওজনে চরম মাত্রার হ্রাস/বৃদ্ধি',
            descriptionEn: `Patient weight shifted by ${Math.abs(curr.weightKg - prev.weightKg).toFixed(1)} kg in ${Math.round(daysApart)} days.`,
            descriptionBn: `রোগীর ওজন ${Math.round(daysApart)} দিনে ${Math.abs(curr.weightKg - prev.weightKg).toFixed(1)} কেজি পরিবর্তিত হয়েছে।`,
            detectionMethodology: rule.methodology,
            ruleId: rule.ruleId,
            ruleVersion: rule.version,
            triggeringFields: ['weight_kg', 'recorded_at'],
            observedValue: {
              previousWeightKg: prev.weightKg,
              currentWeightKg: curr.weightKg,
              daysApart: Math.round(daysApart),
            },
            expectedReference: { maxAllowable30DayShiftKg: 30 },
            contextMetadata: { patientId: input.patientId },
            assignedRole: rule.assignedRole,
            detectedAt: now.toISOString(),
            updatedAt: now.toISOString(),
          })
        }
      }
    }

    return anomalies
  }
}


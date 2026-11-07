/**
 * Phase 2.5: Inconsistent Assessment Pattern Detector
 *
 * Identifies contradictions between patient baseline profile and intake assessments,
 * internal questionnaire contradictions (e.g. no symptoms vs. hemoptysis),
 * consecutive assessment reversals, and rapid submission bursts.
 */

import { getAnomalyRule } from '../anomaly-rule-registry'
import type { AnomalyRecord } from '../types'

export interface AssessmentDetectionInput {
  assessmentId: string
  patientId: string
  facilityId?: string | null
  submittedAt: string
  patientProfileSmokingStatus?: string | null
  assessmentSmokingStatus?: string | null
  assessmentPackYears?: number | null
  reportedNoSymptoms?: boolean | null
  reportedHemoptysis?: boolean | null
  reportedSevereCough?: boolean | null
  previousAssessments?: Array<{
    assessmentId: string
    submittedAt: string
    packYears?: number | null
  }> | null
  recentPatientSubmissionsCountIn5Min?: number | null
}

export class AssessmentAnomalyDetector {
  public static scan(input: AssessmentDetectionInput): AnomalyRecord[] {
    const anomalies: AnomalyRecord[] = []
    const now = new Date()

    // 1. Patient Profile vs. Assessment Conflict (RULE-ASM-001)
    if (
      input.patientProfileSmokingStatus === 'never_smoker' &&
      (input.assessmentSmokingStatus === 'current_smoker' ||
        (input.assessmentPackYears !== null &&
          input.assessmentPackYears !== undefined &&
          input.assessmentPackYears > 5))
    ) {
      const rule = getAnomalyRule('RULE-ASM-001')!
      anomalies.push({
        id: crypto.randomUUID(),
        anomalyNumber: `ANM-ASM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: 'assessment_inconsistency',
        subtype: 'profile_assessment_mismatch',
        severity: rule.defaultSeverity,
        status: 'detected',
        entityType: 'assessment',
        entityId: input.assessmentId,
        facilityId: input.facilityId,
        titleEn: rule.titleEn,
        titleBn: rule.titleBn,
        descriptionEn: `Patient profile indicates "never smoker", but assessment reports ${input.assessmentSmokingStatus} with ${input.assessmentPackYears ?? 0} pack-years.`,
        descriptionBn: `রোগীর প্রোফাইলে "অধূমপায়ী" রেকর্ড থাকলেও মূল্যায়নে ${input.assessmentPackYears ?? 0} প্যাক-বছর সহ ধূমপায়ী হিসেবে উল্লেখ রয়েছে।`,
        detectionMethodology: rule.methodology,
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        triggeringFields: ['patient_profile_smoking_status', 'assessment_smoking_status', 'pack_years'],
        observedValue: {
          profileStatus: input.patientProfileSmokingStatus,
          assessmentStatus: input.assessmentSmokingStatus,
          assessmentPackYears: input.assessmentPackYears,
        },
        expectedReference: { concordantStatus: 'never_smoker' },
        contextMetadata: { patientId: input.patientId, assessmentId: input.assessmentId },
        assignedRole: rule.assignedRole,
        detectedAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
    }

    // 2. Contradictory Symptom Checklist vs. Red-Flag Symptoms (RULE-ASM-002)
    if (
      input.reportedNoSymptoms === true &&
      (input.reportedHemoptysis === true || input.reportedSevereCough === true)
    ) {
      const rule = getAnomalyRule('RULE-ASM-002')!
      anomalies.push({
        id: crypto.randomUUID(),
        anomalyNumber: `ANM-ASM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: 'assessment_inconsistency',
        subtype: 'contradictory_responses',
        severity: rule.defaultSeverity,
        status: 'detected',
        entityType: 'assessment',
        entityId: input.assessmentId,
        facilityId: input.facilityId,
        titleEn: rule.titleEn,
        titleBn: rule.titleBn,
        descriptionEn: 'Assessment marked "No symptoms", yet affirmative red-flag symptoms (hemoptysis/persistent cough) were selected.',
        descriptionBn: 'মূল্যায়নে "কোনো উপসর্গ নেই" নির্বাচন করা হলেও সাথে বিপজ্জনক লক্ষণ (রক্তকাশি/তীব্র কাশি) চিহ্নিত রয়েছে।',
        detectionMethodology: rule.methodology,
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        triggeringFields: ['reported_no_symptoms', 'reported_hemoptysis', 'reported_severe_cough'],
        observedValue: {
          reportedNoSymptoms: input.reportedNoSymptoms,
          reportedHemoptysis: input.reportedHemoptysis,
          reportedSevereCough: input.reportedSevereCough,
        },
        expectedReference: { consistency: 'If reportedNoSymptoms is true, red-flag symptoms must be false' },
        contextMetadata: {
          patientId: input.patientId,
          assessmentId: input.assessmentId,
          clinicalSafetyNote: 'Red-flag symptom takes absolute clinical priority.',
        },
        assignedRole: rule.assignedRole,
        detectedAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
    }

    // 3. Rapid Submission Burst (RULE-ASM-003)
    if (
      input.recentPatientSubmissionsCountIn5Min !== null &&
      input.recentPatientSubmissionsCountIn5Min !== undefined &&
      input.recentPatientSubmissionsCountIn5Min >= 3
    ) {
      const rule = getAnomalyRule('RULE-ASM-003')!
      anomalies.push({
        id: crypto.randomUUID(),
        anomalyNumber: `ANM-ASM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: 'assessment_inconsistency',
        subtype: 'submission_burst',
        severity: rule.defaultSeverity,
        status: 'detected',
        entityType: 'assessment',
        entityId: input.assessmentId,
        facilityId: input.facilityId,
        titleEn: rule.titleEn,
        titleBn: rule.titleBn,
        descriptionEn: `${input.recentPatientSubmissionsCountIn5Min} assessment submissions detected for the same patient within 5 minutes.`,
        descriptionBn: `একই রোগীর জন্য ৫ মিনিটের মধ্যে ${input.recentPatientSubmissionsCountIn5Min}টি মূল্যায়ন জমা শনাক্ত হয়েছে।`,
        detectionMethodology: rule.methodology,
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        triggeringFields: ['submitted_at', 'patient_id'],
        observedValue: {
          recentSubmissionsCount: input.recentPatientSubmissionsCountIn5Min,
          windowMinutes: 5,
        },
        expectedReference: { maxAllowableSubmissionsPer5Min: 2 },
        contextMetadata: { patientId: input.patientId },
        assignedRole: rule.assignedRole,
        detectedAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
    }

    // 4. Unexplained Collapse of Cumulative Smoking Pack-Years (RULE-ASM-004)
    if (
      input.assessmentPackYears !== null &&
      input.assessmentPackYears !== undefined &&
      input.previousAssessments &&
      input.previousAssessments.length > 0
    ) {
      const sortedPrev = [...input.previousAssessments].sort(
        (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
      )
      const last = sortedPrev[0]
      if (
        last.packYears !== null &&
        last.packYears !== undefined &&
        last.packYears - input.assessmentPackYears > 15
      ) {
        const rule = getAnomalyRule('RULE-ASM-004')!
        anomalies.push({
          id: crypto.randomUUID(),
          anomalyNumber: `ANM-ASM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'assessment_inconsistency',
          subtype: 'abrupt_consecutive_shift',
          severity: rule.defaultSeverity,
          status: 'detected',
          entityType: 'assessment',
          entityId: input.assessmentId,
          facilityId: input.facilityId,
          titleEn: rule.titleEn,
          titleBn: rule.titleBn,
          descriptionEn: `Cumulative pack-years dropped from ${last.packYears} to ${input.assessmentPackYears} across consecutive assessments without amendment.`,
          descriptionBn: `ধারাবাহিক মূল্যায়নে কোনো সংশোধন তথ্য ছাড়াই প্যাক-বছর ${last.packYears} থেকে কমে ${input.assessmentPackYears} এ নেমে এসেছে।`,
          detectionMethodology: rule.methodology,
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          triggeringFields: ['pack_years'],
          observedValue: {
            previousPackYears: last.packYears,
            currentPackYears: input.assessmentPackYears,
            drop: last.packYears - input.assessmentPackYears,
          },
          expectedReference: { monotonicCondition: 'Cumulative lifetime pack-years must not decrease' },
          contextMetadata: {
            patientId: input.patientId,
            previousAssessmentId: last.assessmentId,
          },
          assignedRole: rule.assignedRole,
          detectedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
      }
    }

    return anomalies
  }
}


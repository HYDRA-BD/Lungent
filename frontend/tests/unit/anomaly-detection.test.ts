/**
 * Phase 2.5: Anomaly Detection Unit Test Suite
 *
 * Comprehensive tests for:
 * 1. Authoritative Rule Registry & Bilingual Templates
 * 2. Statistical Outlier & Biological Plausibility Math (MAD, IQR, Rolling-Z)
 * 3. Patient Data Anomaly Detector
 * 4. Assessment Inconsistency Detector
 * 5. Data Quality Monitoring & Scoring
 * 6. Environmental Intelligence Anomaly Detector
 * 7. Operational Anomaly Detector
 * 8. Review & Resolution Workflow Lifecycle & Audit Trail
 * 9. Idempotency & Deduplication
 * 10. Clinical Safety & Governance Invariants
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  AnomalyDetectionService,
  getAllAnomalyRules,
  getAnomalyRule,
  getAnomalyRulesByCategory,
  calculateBMI,
  computeMAD,
  calculateModifiedZScore,
  computeIQRBounds,
  computeRollingZScore,
  OPERATIONAL_LIMITS,
} from '@/modules/anomaly'

describe('Phase 2.5: Anomaly Detection Framework', () => {
  beforeEach(() => {
    AnomalyDetectionService.resetForTesting()
  })

  // ==========================================================================
  // 1. RULE REGISTRY
  // ==========================================================================
  describe('1. Authoritative Rule Registry', () => {
    it('contains comprehensive rules for all 5 anomaly categories', () => {
      const allRules = getAllAnomalyRules()
      expect(allRules.length).toBeGreaterThanOrEqual(15)

      const categories = new Set(allRules.map((r) => r.category))
      expect(categories.has('patient_data')).toBe(true)
      expect(categories.has('assessment_inconsistency')).toBe(true)
      expect(categories.has('data_quality')).toBe(true)
      expect(categories.has('environmental')).toBe(true)
      expect(categories.has('operational')).toBe(true)

      allRules.forEach((rule) => {
        expect(rule.ruleId).toMatch(/^RULE-[A-Z]+-[0-9]{3}$/)
        expect(rule.titleEn).toBeTruthy()
        expect(rule.titleBn).toBeTruthy()
        expect(rule.descriptionEn).toBeTruthy()
        expect(rule.descriptionBn).toBeTruthy()
        expect(rule.clinicalRationaleEn).toBeTruthy()
        expect(rule.clinicalRationaleBn).toBeTruthy()
        expect(rule.methodology).toBeTruthy()
      })
    })

    it('retrieves rule definitions by ID and category', () => {
      const patRule = getAnomalyRule('RULE-PAT-001')
      expect(patRule).toBeDefined()
      expect(patRule?.category).toBe('patient_data')

      const envRules = getAnomalyRulesByCategory('environmental')
      expect(envRules.length).toBeGreaterThanOrEqual(3)
    })
  })

  // ==========================================================================
  // 2. STATISTICAL OUTLIER ALGORITHMS
  // ==========================================================================
  describe('2. Statistical Outlier & Biological Plausibility Math', () => {
    it('computes accurate BMI from height and weight', () => {
      expect(calculateBMI(70, 175)).toBe(22.86)
      expect(calculateBMI(0, 175)).toBe(0)
      expect(calculateBMI(70, 0)).toBe(0)
    })

    it('computes median and MAD accurately', () => {
      const data = [10, 12, 11, 15, 12, 14, 13]
      const { median, mad } = computeMAD(data)
      expect(median).toBe(12)
      expect(mad).toBe(1)
    })

    it('calculates modified Z-score using MAD and detects extreme outliers', () => {
      const normalData = [10, 11, 12, 10, 11, 12, 11]
      const { median, mad } = computeMAD(normalData)

      const normalScore = calculateModifiedZScore(12, median, mad)
      expect(normalScore).toBeLessThan(3.5)

      const extremeScore = calculateModifiedZScore(55, median, mad)
      expect(extremeScore).toBeGreaterThan(3.5)
    })

    it('computes IQR Tukey outlier fences', () => {
      const data = [10, 12, 14, 15, 16, 18, 20, 22, 24, 25, 26, 28, 30]
      const bounds = computeIQRBounds(data)
      expect(bounds.q1).toBeLessThan(bounds.median)
      expect(bounds.median).toBeLessThan(bounds.q3)
      expect(bounds.lowerBound).toBeLessThan(bounds.q1)
      expect(bounds.upperBound).toBeGreaterThan(bounds.q3)
    })

    it('computes rolling Z-score and flags operational spikes', () => {
      const historical = [20, 22, 21, 19, 23, 20, 21]
      const normal = computeRollingZScore(24, historical)
      expect(normal.isAnomaly).toBe(false)

      const spike = computeRollingZScore(120, historical)
      expect(spike.isAnomaly).toBe(true)
      expect(spike.zScore).toBeGreaterThan(OPERATIONAL_LIMITS.maxDailySubmissionVolumeZScore)
    })
  })

  // ==========================================================================
  // 3. PATIENT DATA ANOMALY DETECTOR
  // ==========================================================================
  describe('3. Patient Data Anomaly Detection', () => {
    const PATIENT_ID = 'pat-test-001'

    it('detects future date of birth', async () => {
      const futureDate = new Date(Date.now() + 86400000 * 365).toISOString().split('T')[0]
      const anomalies = await AnomalyDetectionService.scanPatientData({
        patientId: PATIENT_ID,
        dateOfBirth: futureDate,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('demographic_conflict')
      expect(anomalies[0].ruleId).toBe('RULE-PAT-001')
      expect(anomalies[0].severity).toBe('high')
    })

    it('detects age exceeding human biological limit (> 125 years)', async () => {
      const anomalies = await AnomalyDetectionService.scanPatientData({
        patientId: PATIENT_ID,
        dateOfBirth: '1850-01-01',
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('demographic_conflict')
      expect(anomalies[0].observedValue.calculatedAge).toBeGreaterThan(125)
    })

    it('detects BMI and height/weight mathematical discordance', async () => {
      // 70kg, 175cm => BMI = 22.86. If recorded BMI is 38.5, discordance is ~15.6 > 1.5
      const anomalies = await AnomalyDetectionService.scanPatientData({
        patientId: PATIENT_ID,
        heightCm: 175,
        weightKg: 70,
        recordedBmi: 38.5,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('implausible_physical_measurement')
      expect(anomalies[0].ruleId).toBe('RULE-PAT-002')
    })

    it('detects systolic BP <= diastolic BP', async () => {
      const anomalies = await AnomalyDetectionService.scanPatientData({
        patientId: PATIENT_ID,
        systolicBp: 80,
        diastolicBp: 120,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('implausible_physical_measurement')
      expect(anomalies[0].ruleId).toBe('RULE-PAT-003')
      expect(anomalies[0].severity).toBe('critical')
    })

    it('detects implausible SpO2 outside biological limits', async () => {
      const anomalies = await AnomalyDetectionService.scanPatientData({
        patientId: PATIENT_ID,
        oxygenSaturation: 105,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].severity).toBe('critical')
      expect(anomalies[0].triggeringFields).toContain('oxygen_saturation')
    })

    it('detects never-smoker recorded with positive pack-years', async () => {
      const anomalies = await AnomalyDetectionService.scanPatientData({
        patientId: PATIENT_ID,
        smokingStatus: 'never_smoker',
        packYears: 25,
        cigarettesPerDay: 20,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('unusual_tobacco_history')
      expect(anomalies[0].ruleId).toBe('RULE-PAT-004')
    })

    it('detects quit smoking age earlier than start smoking age', async () => {
      const anomalies = await AnomalyDetectionService.scanPatientData({
        patientId: PATIENT_ID,
        smokingStatus: 'former_smoker',
        ageStartedSmoking: 25,
        ageQuitSmoking: 18,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('unusual_tobacco_history')
    })

    it('detects diagnosis preceding patient birth year', async () => {
      const anomalies = await AnomalyDetectionService.scanPatientData({
        patientId: PATIENT_ID,
        dateOfBirth: '1985-06-15',
        medicalConditions: [
          { conditionName: 'Chronic Bronchitis', diagnosisYear: 1978 },
        ],
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('inconsistent_medical_history')
      expect(anomalies[0].ruleId).toBe('RULE-PAT-006')
    })

    it('detects extreme adult height loss in longitudinal follow-up', async () => {
      const anomalies = await AnomalyDetectionService.scanPatientData({
        patientId: PATIENT_ID,
        longitudinalHistory: [
          { recordedAt: '2026-01-10T00:00:00Z', heightCm: 172 },
          { recordedAt: '2026-06-10T00:00:00Z', heightCm: 152 }, // 20cm drop
        ],
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('longitudinal_drift')
      expect(anomalies[0].ruleId).toBe('RULE-PAT-005')
    })
  })

  // ==========================================================================
  // 4. ASSESSMENT INCONSISTENCY DETECTOR
  // ==========================================================================
  describe('4. Inconsistent Assessment Pattern Detection', () => {
    it('detects profile never-smoker vs assessment heavy smoker conflict', async () => {
      const anomalies = await AnomalyDetectionService.scanAssessment({
        assessmentId: 'asm-001',
        patientId: 'pat-001',
        submittedAt: new Date().toISOString(),
        patientProfileSmokingStatus: 'never_smoker',
        assessmentSmokingStatus: 'current_smoker',
        assessmentPackYears: 30,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('profile_assessment_mismatch')
      expect(anomalies[0].ruleId).toBe('RULE-ASM-001')
      expect(anomalies[0].severity).toBe('high')
    })

    it('detects contradictory "no symptoms" vs affirmative hemoptysis', async () => {
      const anomalies = await AnomalyDetectionService.scanAssessment({
        assessmentId: 'asm-002',
        patientId: 'pat-001',
        submittedAt: new Date().toISOString(),
        reportedNoSymptoms: true,
        reportedHemoptysis: true,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('contradictory_responses')
      expect(anomalies[0].ruleId).toBe('RULE-ASM-002')
      expect(anomalies[0].severity).toBe('critical')
    })

    it('detects rapid duplicate submission bursts (>= 3 within 5 minutes)', async () => {
      const anomalies = await AnomalyDetectionService.scanAssessment({
        assessmentId: 'asm-003',
        patientId: 'pat-001',
        submittedAt: new Date().toISOString(),
        recentPatientSubmissionsCountIn5Min: 4,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('submission_burst')
      expect(anomalies[0].ruleId).toBe('RULE-ASM-003')
    })

    it('detects non-monotonic collapse of cumulative pack-years', async () => {
      const anomalies = await AnomalyDetectionService.scanAssessment({
        assessmentId: 'asm-004',
        patientId: 'pat-001',
        submittedAt: '2026-11-06T00:00:00Z',
        assessmentPackYears: 8,
        previousAssessments: [
          { assessmentId: 'asm-prev', submittedAt: '2026-10-01T00:00:00Z', packYears: 35 },
        ],
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('abrupt_consecutive_shift')
      expect(anomalies[0].ruleId).toBe('RULE-ASM-004')
    })
  })

  // ==========================================================================
  // 5. DATA QUALITY MONITORING
  // ==========================================================================
  describe('5. Data Quality Monitoring', () => {
    it('audits missing critical fields and computes composite quality score', async () => {
      const auditResult = await AnomalyDetectionService.auditDataQuality({
        domain: 'patients',
        totalRecords: 10,
        records: [
          {
            id: 'rec-1',
            fields: { age: 60, smokingHistory: 'current' },
            requiredFields: ['age', 'smokingHistory', 'packYears'],
          },
          {
            id: 'rec-2',
            fields: { age: 50, smokingHistory: 'never', packYears: 0 },
            requiredFields: ['age', 'smokingHistory', 'packYears'],
            isConfirmed: true,
          },
        ],
      })

      expect(auditResult.report).toBeDefined()
      expect(auditResult.report.missingCount).toBe(1)
      expect(auditResult.report.qualityScore).toBeLessThan(100)
      expect(auditResult.anomalies.length).toBe(1)
      expect(auditResult.anomalies[0].subtype).toBe('missing_critical_fields')
      expect(auditResult.anomalies[0].ruleId).toBe('RULE-DQ-001')
    })
  })

  // ==========================================================================
  // 6. ENVIRONMENTAL ANOMALY DETECTOR
  // ==========================================================================
  describe('6. Environmental Anomaly Detection', () => {
    it('detects unphysical negative or extreme PM2.5 readings', async () => {
      const anomalies = await AnomalyDetectionService.scanEnvironmental({
        readingId: 'env-001',
        stationId: 'st-dhaka-central',
        timestamp: new Date().toISOString(),
        pm25: -12.5,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('unphysical_pollutant_reading')
      expect(anomalies[0].ruleId).toBe('RULE-ENV-001')
    })

    it('detects sensor stuck flatline over 12 consecutive hours', async () => {
      const flatlineSeries = Array.from({ length: 14 }).map((_, i) => ({
        timestamp: new Date(Date.now() - (14 - i) * 3600000).toISOString(),
        pm25: 45.2,
      }))

      const anomalies = await AnomalyDetectionService.scanEnvironmental({
        readingId: 'env-002',
        stationId: 'st-chittagong-port',
        timestamp: new Date().toISOString(),
        pm25: 45.2,
        recentHourlySeries: flatlineSeries,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('sensor_stuck_constant')
      expect(anomalies[0].ruleId).toBe('RULE-ENV-002')
    })

    it('detects sudden extreme rate-of-change delta spike (> 250 µg/m³ in 1h)', async () => {
      const spikeSeries = [
        { timestamp: '2026-11-06T08:00:00Z', pm25: 60.0 },
        { timestamp: '2026-11-06T09:00:00Z', pm25: 350.0 }, // +290 delta
      ]

      const anomalies = await AnomalyDetectionService.scanEnvironmental({
        readingId: 'env-003',
        stationId: 'st-rajshahi-city',
        timestamp: '2026-11-06T09:00:00Z',
        pm25: 350.0,
        recentHourlySeries: spikeSeries,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('sudden_extreme_spike')
      expect(anomalies[0].ruleId).toBe('RULE-ENV-003')
    })

    it('detects severe multi-provider discordance (> 4x difference)', async () => {
      const anomalies = await AnomalyDetectionService.scanEnvironmental({
        readingId: 'env-004',
        stationId: 'st-khulna-station',
        timestamp: new Date().toISOString(),
        pm25: 30.0,
        secondaryProviderPm25: 180.0,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('provider_discrepancy')
    })
  })

  // ==========================================================================
  // 7. OPERATIONAL ANOMALY DETECTOR
  // ==========================================================================
  describe('7. Operational Anomaly Detection', () => {
    it('detects facility submission volume deviation with high Z-score', async () => {
      const anomalies = await AnomalyDetectionService.scanOperational({
        facilityId: 'fac-dhaka-med',
        observationDate: '2026-11-06',
        dailySubmissionCount: 150,
        historical7DayDailyCounts: [25, 26, 24, 27, 25, 24, 26],
        isWeekday: true,
      })

      expect(anomalies.length).toBe(1)
      expect(anomalies[0].subtype).toBe('submission_volume_spike_or_drop')
      expect(anomalies[0].ruleId).toBe('RULE-OPS-001')
    })

    it('detects unexpected total inactivity on active weekday', async () => {
      const anomalies = await AnomalyDetectionService.scanOperational({
        facilityId: 'fac-sylhet-sadar',
        observationDate: '2026-11-06',
        dailySubmissionCount: 0,
        historical7DayDailyCounts: [30, 32, 28, 35, 30, 29, 31],
        isWeekday: true,
      })

      expect(anomalies.some((a) => a.subtype === 'facility_inactivity')).toBe(true)
    })

    it('detects high notification delivery failure rate (> 20%)', async () => {
      const anomalies = await AnomalyDetectionService.scanOperational({
        facilityId: 'fac-dhaka-med',
        observationDate: '2026-11-06',
        dailySubmissionCount: 20,
        historical7DayDailyCounts: [20, 20, 20, 20, 20, 20, 20],
        isWeekday: true,
        totalNotificationsSent: 100,
        failedNotificationsCount: 32, // 32% failure rate
      })

      expect(anomalies.some((a) => a.subtype === 'high_notification_failure_rate')).toBe(true)
      const notifAnomaly = anomalies.find((a) => a.subtype === 'high_notification_failure_rate')
      expect(notifAnomaly?.ruleId).toBe('RULE-OPS-002')
    })

    it('detects urgent referral bottleneck pending > 14 days', async () => {
      const anomalies = await AnomalyDetectionService.scanOperational({
        facilityId: 'fac-dhaka-med',
        observationDate: '2026-11-06',
        dailySubmissionCount: 20,
        historical7DayDailyCounts: [20, 20, 20, 20, 20, 20, 20],
        isWeekday: true,
        urgentReferralsPendingOver14Days: 4,
      })

      expect(anomalies.some((a) => a.subtype === 'referral_bottleneck')).toBe(true)
      const refAnomaly = anomalies.find((a) => a.subtype === 'referral_bottleneck')
      expect(refAnomaly?.ruleId).toBe('RULE-OPS-003')
    })
  })

  // ==========================================================================
  // 8. REVIEW WORKFLOW, AUDIT TRAIL & IDEMPOTENCY
  // ==========================================================================
  describe('8. Workflow Lifecycle, Audit Trail & Idempotency', () => {
    it('progresses through detection, review, resolution, and generates audit events', async () => {
      const detected = await AnomalyDetectionService.scanPatientData({
        patientId: 'pat-lifecycle-1',
        systolicBp: 70,
        diastolicBp: 110,
      })

      expect(detected.length).toBe(1)
      const anomalyId = detected[0].id

      // 1. Under review
      const underReview = await AnomalyDetectionService.updateStatus(
        anomalyId,
        'under_review',
        'dr_rahim',
        'clinician',
        'Investigating clinical chart for data transcription error'
      )
      expect(underReview.status).toBe('under_review')

      // 2. Resolve
      const resolved = await AnomalyDetectionService.resolveAnomaly(
        anomalyId,
        'data_corrected',
        'dr_rahim',
        'clinician',
        'Nurse re-measured BP: verified 120/80 mmHg'
      )
      expect(resolved.status).toBe('resolved')
      expect(resolved.resolutionOutcome).toBe('data_corrected')
      expect(resolved.resolvedBy).toBe('dr_rahim')

      // 3. Audit trail
      const auditTrail = await AnomalyDetectionService.getAuditTrail(anomalyId)
      expect(auditTrail.length).toBeGreaterThanOrEqual(3)
      expect(auditTrail.map((e) => e.action)).toContain('detect')
      expect(auditTrail.map((e) => e.action)).toContain('start_review')
      expect(auditTrail.map((e) => e.action)).toContain('resolve')
    })

    it('enforces idempotency: duplicate scan does not spawn duplicate active anomaly', async () => {
      const scan1 = await AnomalyDetectionService.scanPatientData({
        patientId: 'pat-idempotent-1',
        heightCm: 170,
        weightKg: 65,
        recordedBmi: 42.0, // discordant
      })
      expect(scan1.length).toBe(1)

      const scan2 = await AnomalyDetectionService.scanPatientData({
        patientId: 'pat-idempotent-1',
        heightCm: 170,
        weightKg: 65,
        recordedBmi: 42.0, // identical problem
      })
      expect(scan2.length).toBe(1)
      expect(scan2[0].id).toBe(scan1[0].id) // Same record returned

      const all = await AnomalyDetectionService.getAnomalies()
      expect(all.length).toBe(1)
    })

    it('dismisses false positive clinical variation with justification', async () => {
      const detected = await AnomalyDetectionService.scanPatientData({
        patientId: 'pat-variation-1',
        longitudinalHistory: [
          { recordedAt: '2026-01-01T00:00:00Z', weightKg: 110 },
          { recordedAt: '2026-01-25T00:00:00Z', weightKg: 75 }, // rapid weight drop
        ],
      })
      expect(detected.length).toBe(1)

      const dismissed = await AnomalyDetectionService.dismissAnomaly(
        detected[0].id,
        'dr_karim',
        'clinician',
        'Verified post-bariatric surgery intentional weight loss; genuine clinical finding.'
      )
      expect(dismissed.status).toBe('dismissed')
    })

    it('escalates high priority anomaly to clinical director', async () => {
      const detected = await AnomalyDetectionService.scanAssessment({
        assessmentId: 'asm-esc-1',
        patientId: 'pat-esc-1',
        submittedAt: new Date().toISOString(),
        reportedNoSymptoms: true,
        reportedHemoptysis: true,
      })

      const escalated = await AnomalyDetectionService.escalateAnomaly(
        detected[0].id,
        'nurse_fatima',
        'healthcare_worker',
        'Patient reports coughing up blood but checked no symptoms on app; patient needs immediate clinician evaluation.'
      )
      expect(escalated.status).toBe('escalated')
      expect(escalated.severity).toBe('critical')
    })

    it('computes summary statistics accurately', async () => {
      await AnomalyDetectionService.scanPatientData({
        patientId: 'pat-sum-1',
        systolicBp: 80,
        diastolicBp: 110,
      })

      const summary = await AnomalyDetectionService.getSummary()
      expect(summary.total).toBeGreaterThanOrEqual(1)
      expect(summary.unresolved).toBeGreaterThanOrEqual(1)
      expect(summary.criticalCount).toBeGreaterThanOrEqual(1)
    })
  })

  // ==========================================================================
  // 9. CLINICAL SAFETY & GOVERNANCE INVARIANTS
  // ==========================================================================
  describe('9. Clinical Safety & Governance Invariants', () => {
    it('prohibits anomaly records from claiming a confirmed lung cancer diagnosis', () => {
      const invalidAnomaly = {
        id: 'anm-invalid',
        anomalyNumber: 'ANM-ERR',
        category: 'patient_data' as const,
        subtype: 'demographic_conflict' as const,
        severity: 'high' as const,
        status: 'detected' as const,
        entityType: 'patient' as const,
        entityId: 'p-1',
        titleEn: 'Cancer Confirmed Anomaly',
        titleBn: 'ক্যান্সার নিশ্চিত',
        descriptionEn: 'Patient is diagnosed with lung cancer due to anomaly.',
        descriptionBn: 'রোগীর ক্যান্সার হয়েছে।',
        detectionMethodology: 'deterministic_rule' as const,
        ruleVersion: '1.0.0',
        triggeringFields: ['age'],
        observedValue: {},
        expectedReference: {},
        contextMetadata: {},
        detectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      expect(() => {
        AnomalyDetectionService.assertAnomalySafetyInvariants(invalidAnomaly)
      }).toThrow('CLINICAL SAFETY VIOLATION')
    })

    it('enforces that severe symptoms (hemoptysis) are ALWAYS protected for emergency triage', () => {
      // Invariant: Anomaly status must never suppress red-flag symptom triage
      const isProtected = AnomalyDetectionService.isRedFlagSymptomProtected(true)
      expect(isProtected).toBe(true)
    })
  })
})

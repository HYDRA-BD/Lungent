/**
 * Phase 2.5: Operational Anomaly Detector
 *
 * Monitors facility submission rates, referral bottlenecks, notification
 * delivery failures, and offline synchronization conflict spikes.
 */

import {
  OPERATIONAL_LIMITS,
  computeRollingZScore,
} from '../math/statistical-outliers'
import { getAnomalyRule } from '../anomaly-rule-registry'
import type { AnomalyRecord } from '../types'

export interface OperationalTelemetryInput {
  facilityId: string
  observationDate: string
  dailySubmissionCount: number
  historical7DayDailyCounts: number[]
  isWeekday: boolean
  totalNotificationsSent?: number
  failedNotificationsCount?: number
  urgentReferralsPendingOver14Days?: number
  offlineSyncTotalOperations?: number
  offlineSyncConflictCount?: number
}

export class OperationalAnomalyDetector {
  public static scan(input: OperationalTelemetryInput): AnomalyRecord[] {
    const anomalies: AnomalyRecord[] = []
    const now = new Date()

    // 1. Facility Submission Volume Anomaly (RULE-OPS-001)
    const rolling = computeRollingZScore(
      input.dailySubmissionCount,
      input.historical7DayDailyCounts
    )

    if (rolling.isAnomaly) {
      const rule = getAnomalyRule('RULE-OPS-001')!
      anomalies.push({
        id: crypto.randomUUID(),
        anomalyNumber: `ANM-OPS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: 'operational',
        subtype: 'submission_volume_spike_or_drop',
        severity: rule.defaultSeverity,
        status: 'detected',
        entityType: 'facility',
        entityId: input.facilityId,
        facilityId: input.facilityId,
        titleEn: rule.titleEn,
        titleBn: rule.titleBn,
        descriptionEn: `Facility submissions (${input.dailySubmissionCount}) deviated from 7-day average (${rolling.mean}) with Z-score = ${rolling.zScore}.`,
        descriptionBn: `হাসপাতালের দৈনিক মূল্যায়ন সংখ্যা (${input.dailySubmissionCount}) বিগত ৭ দিনের গড় (${rolling.mean}) থেকে বিচ্যুত (Z-স্কোর = ${rolling.zScore})।`,
        detectionMethodology: rule.methodology,
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        triggeringFields: ['daily_submission_count', 'historical_counts'],
        observedValue: {
          dailySubmissions: input.dailySubmissionCount,
          rollingMean: rolling.mean,
          stdDev: rolling.stdDev,
          zScore: rolling.zScore,
        },
        expectedReference: { maxAllowableZScore: OPERATIONAL_LIMITS.maxDailySubmissionVolumeZScore },
        contextMetadata: { facilityId: input.facilityId, observationDate: input.observationDate },
        assignedRole: rule.assignedRole,
        detectedAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
    }

    // Unexpected Zero on Weekday when facility typically active
    if (
      input.isWeekday &&
      input.dailySubmissionCount === 0 &&
      input.historical7DayDailyCounts.length >= 3
    ) {
      const avg =
        input.historical7DayDailyCounts.reduce((a, b) => a + b, 0) /
        input.historical7DayDailyCounts.length
      if (avg >= 10) {
        const rule = getAnomalyRule('RULE-OPS-001')!
        anomalies.push({
          id: crypto.randomUUID(),
          anomalyNumber: `ANM-OPS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'operational',
          subtype: 'facility_inactivity',
          severity: 'high',
          status: 'detected',
          entityType: 'facility',
          entityId: input.facilityId,
          facilityId: input.facilityId,
          titleEn: 'Unexpected Total Facility Inactivity on Operational Weekday',
          titleBn: 'কর্মদিবসে হাসপাতালে সম্পূর্ণ কার্যক্রম স্থবিরতা',
          descriptionEn: `Facility recorded 0 submissions on an active weekday despite historical daily average of ${avg.toFixed(1)}.`,
          descriptionBn: `দৈনিক গড়ে ${avg.toFixed(1)}টি মূল্যায়ন হলেও কর্মদিবসে শূন্য মূল্যায়ন রেকর্ড হয়েছে।`,
          detectionMethodology: 'deterministic_rule',
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          triggeringFields: ['daily_submission_count', 'is_weekday'],
          observedValue: { dailySubmissions: 0, historicalAverage: Number(avg.toFixed(1)) },
          expectedReference: { minExpectedSubmissions: OPERATIONAL_LIMITS.minExpectedWeekdaySubmissions },
          contextMetadata: { facilityId: input.facilityId, observationDate: input.observationDate },
          assignedRole: rule.assignedRole,
          detectedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
      }
    }

    // 2. High Notification Delivery Failure Rate (RULE-OPS-002)
    if (
      input.totalNotificationsSent &&
      input.totalNotificationsSent >= 10 &&
      input.failedNotificationsCount !== undefined
    ) {
      const failRate = input.failedNotificationsCount / input.totalNotificationsSent
      if (failRate > OPERATIONAL_LIMITS.maxNotificationFailureRate) {
        const rule = getAnomalyRule('RULE-OPS-002')!
        anomalies.push({
          id: crypto.randomUUID(),
          anomalyNumber: `ANM-OPS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'operational',
          subtype: 'high_notification_failure_rate',
          severity: rule.defaultSeverity,
          status: 'detected',
          entityType: 'facility',
          entityId: input.facilityId,
          facilityId: input.facilityId,
          titleEn: rule.titleEn,
          titleBn: rule.titleBn,
          descriptionEn: `Notification delivery failure rate reached ${(failRate * 100).toFixed(1)}% (${input.failedNotificationsCount} / ${input.totalNotificationsSent}).`,
          descriptionBn: `নোটিফিকেশন পৌঁছাতে ব্যর্থতার হার ${(failRate * 100).toFixed(1)}% এ পৌঁছেছে।`,
          detectionMethodology: rule.methodology,
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          triggeringFields: ['failed_notifications_count', 'total_notifications_sent'],
          observedValue: {
            totalSent: input.totalNotificationsSent,
            failedCount: input.failedNotificationsCount,
            failureRatePct: Number((failRate * 100).toFixed(1)),
          },
          expectedReference: {
            maxAllowableFailureRatePct: OPERATIONAL_LIMITS.maxNotificationFailureRate * 100,
          },
          contextMetadata: { facilityId: input.facilityId },
          assignedRole: rule.assignedRole,
          detectedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
      }
    }

    // 3. Urgent Referral Bottlenecks (RULE-OPS-003)
    if (
      input.urgentReferralsPendingOver14Days !== undefined &&
      input.urgentReferralsPendingOver14Days > 0
    ) {
      const rule = getAnomalyRule('RULE-OPS-003')!
      anomalies.push({
        id: crypto.randomUUID(),
        anomalyNumber: `ANM-OPS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: 'operational',
        subtype: 'referral_bottleneck',
        severity: rule.defaultSeverity,
        status: 'detected',
        entityType: 'facility',
        entityId: input.facilityId,
        facilityId: input.facilityId,
        titleEn: rule.titleEn,
        titleBn: rule.titleBn,
        descriptionEn: `${input.urgentReferralsPendingOver14Days} urgent patient referral(s) have been pending intake for > 14 days.`,
        descriptionBn: `${input.urgentReferralsPendingOver14Days}টি জরুরি রেফারেল ১৪ দিনের বেশি সময় ধরে অপেক্ষমান রয়েছে।`,
        detectionMethodology: rule.methodology,
        ruleId: rule.ruleId,
        ruleVersion: rule.version,
        triggeringFields: ['urgent_referrals_pending_over_14_days'],
        observedValue: { pendingCount: input.urgentReferralsPendingOver14Days },
        expectedReference: { maxAllowablePendingDays: OPERATIONAL_LIMITS.maxReferralTurnaroundDays },
        contextMetadata: { facilityId: input.facilityId },
        assignedRole: rule.assignedRole,
        detectedAt: now.toISOString(),
        updatedAt: now.toISOString(),
      })
    }

    return anomalies
  }
}


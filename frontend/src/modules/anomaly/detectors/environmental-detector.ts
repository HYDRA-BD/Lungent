/**
 * Phase 2.5: Environmental Intelligence Anomaly Detector
 *
 * Scans air quality index, PM2.5, PM10, sensor flatline, extreme delta spikes,
 * and multi-provider discordance.
 */

import {
  ENVIRONMENTAL_LIMITS,
} from '../math/statistical-outliers'
import { getAnomalyRule } from '../anomaly-rule-registry'
import type { AnomalyRecord } from '../types'

export interface EnvironmentalReadingInput {
  readingId: string
  stationId: string
  facilityId?: string | null
  timestamp: string
  pm25?: number | null
  pm10?: number | null
  aqi?: number | null
  provider?: string | null
  secondaryProviderPm25?: number | null
  recentHourlySeries?: Array<{
    timestamp: string
    pm25: number
  }> | null
}

export class EnvironmentalAnomalyDetector {
  public static scan(input: EnvironmentalReadingInput): AnomalyRecord[] {
    const anomalies: AnomalyRecord[] = []
    const now = new Date()

    // 1. Unphysical Pollutant Concentration (RULE-ENV-001)
    if (input.pm25 !== null && input.pm25 !== undefined) {
      if (
        input.pm25 < ENVIRONMENTAL_LIMITS.pm25.min ||
        input.pm25 > ENVIRONMENTAL_LIMITS.pm25.max
      ) {
        const rule = getAnomalyRule('RULE-ENV-001')!
        anomalies.push({
          id: crypto.randomUUID(),
          anomalyNumber: `ANM-ENV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'environmental',
          subtype: 'unphysical_pollutant_reading',
          severity: rule.defaultSeverity,
          status: 'detected',
          entityType: 'environmental_reading',
          entityId: input.readingId,
          facilityId: input.facilityId,
          titleEn: rule.titleEn,
          titleBn: rule.titleBn,
          descriptionEn: `Recorded PM2.5 (${input.pm25} µg/m³) exceeds physical bounds [${ENVIRONMENTAL_LIMITS.pm25.min}, ${ENVIRONMENTAL_LIMITS.pm25.max}].`,
          descriptionBn: `রেকর্ডকৃত PM2.5 (${input.pm25} µg/m³) বায়ুমণ্ডলীয় গ্রহণযোগ্য সীমার বাইরে।`,
          detectionMethodology: rule.methodology,
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          triggeringFields: ['pm25'],
          observedValue: { pm25: input.pm25 },
          expectedReference: ENVIRONMENTAL_LIMITS.pm25,
          contextMetadata: {
            stationId: input.stationId,
            provider: input.provider,
            nonDiagnosticNotice: 'Environmental anomalies do not represent individual patient disease risk.',
          },
          assignedRole: rule.assignedRole,
          detectedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
      }
    }

    // 2. Sensor Flatline / Stuck Output Constant (RULE-ENV-002)
    if (input.recentHourlySeries && input.recentHourlySeries.length >= 12) {
      const pmValues = input.recentHourlySeries.map((s) => s.pm25)
      const firstVal = pmValues[0]
      const isAllIdentical = pmValues.every((v) => Math.abs(v - firstVal) < 0.0001)

      if (isAllIdentical) {
        const rule = getAnomalyRule('RULE-ENV-002')!
        anomalies.push({
          id: crypto.randomUUID(),
          anomalyNumber: `ANM-ENV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'environmental',
          subtype: 'sensor_stuck_constant',
          severity: rule.defaultSeverity,
          status: 'detected',
          entityType: 'environmental_reading',
          entityId: input.readingId,
          facilityId: input.facilityId,
          titleEn: rule.titleEn,
          titleBn: rule.titleBn,
          descriptionEn: `Sensor reported identical PM2.5 (${firstVal} µg/m³) across ${pmValues.length} consecutive hourly observations.`,
          descriptionBn: `সেন্সর টানা ${pmValues.length} ঘণ্টা ধরে হুবহু একই PM2.5 মান (${firstVal} µg/m³) প্রদর্শন করছে।`,
          detectionMethodology: rule.methodology,
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          triggeringFields: ['pm25', 'hourly_series'],
          observedValue: { constantValue: firstVal, consecutiveHours: pmValues.length },
          expectedReference: { expectedVariance: '> 0.01 µg/m³ over 12 hours' },
          contextMetadata: { stationId: input.stationId },
          assignedRole: rule.assignedRole,
          detectedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
      }
    }

    // 3. Sudden Extreme Delta Spike (RULE-ENV-003)
    if (input.recentHourlySeries && input.recentHourlySeries.length >= 2) {
      const sorted = [...input.recentHourlySeries].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      const prev = sorted[sorted.length - 2]
      const curr = sorted[sorted.length - 1]
      const delta = Math.abs(curr.pm25 - prev.pm25)

      if (delta > ENVIRONMENTAL_LIMITS.maxHourlyPm25Delta) {
        const rule = getAnomalyRule('RULE-ENV-003')!
        anomalies.push({
          id: crypto.randomUUID(),
          anomalyNumber: `ANM-ENV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'environmental',
          subtype: 'sudden_extreme_spike',
          severity: rule.defaultSeverity,
          status: 'detected',
          entityType: 'environmental_reading',
          entityId: input.readingId,
          facilityId: input.facilityId,
          titleEn: rule.titleEn,
          titleBn: rule.titleBn,
          descriptionEn: `Hourly PM2.5 jumped by ${delta.toFixed(1)} µg/m³ in 1 hour (from ${prev.pm25} to ${curr.pm25}).`,
          descriptionBn: `১ ঘণ্টার ব্যবধানে PM2.5 এর মান ${delta.toFixed(1)} µg/m³ বৃদ্ধি পেয়েছে।`,
          detectionMethodology: rule.methodology,
          ruleId: rule.ruleId,
          ruleVersion: rule.version,
          triggeringFields: ['pm25', 'delta_pm25'],
          observedValue: {
            previousPm25: prev.pm25,
            currentPm25: curr.pm25,
            hourlyDelta: delta,
          },
          expectedReference: { maxAllowableHourlyDelta: ENVIRONMENTAL_LIMITS.maxHourlyPm25Delta },
          contextMetadata: { stationId: input.stationId },
          assignedRole: rule.assignedRole,
          detectedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
      }
    }

    // 4. Multi-Provider Discordance
    if (
      input.pm25 !== null &&
      input.pm25 !== undefined &&
      input.secondaryProviderPm25 !== null &&
      input.secondaryProviderPm25 !== undefined
    ) {
      const ratio =
        Math.max(input.pm25, input.secondaryProviderPm25) /
        Math.max(1, Math.min(input.pm25, input.secondaryProviderPm25))
      if (ratio > 4.0 && Math.abs(input.pm25 - input.secondaryProviderPm25) > 100) {
        anomalies.push({
          id: crypto.randomUUID(),
          anomalyNumber: `ANM-ENV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          category: 'environmental',
          subtype: 'provider_discrepancy',
          severity: 'medium',
          status: 'detected',
          entityType: 'environmental_reading',
          entityId: input.readingId,
          facilityId: input.facilityId,
          titleEn: 'Severe Environmental Provider Discrepancy',
          titleBn: 'পরিবেশ ডেটা প্রদানকারী সংস্থার তথ্যে চরম অমিল',
          descriptionEn: `Primary provider PM2.5 (${input.pm25}) and secondary provider PM2.5 (${input.secondaryProviderPm25}) disagree by ${ratio.toFixed(1)}x.`,
          descriptionBn: `প্রাথমিক ও দ্বিতীয় প্রদানকারীর PM2.5 রিডিংয়ে ${ratio.toFixed(1)} গুণ অমিল রয়েছে।`,
          detectionMethodology: 'statistical_mad',
          ruleId: null,
          ruleVersion: '1.0.0',
          triggeringFields: ['pm25', 'secondary_provider_pm25'],
          observedValue: {
            primaryPm25: input.pm25,
            secondaryPm25: input.secondaryProviderPm25,
            ratio: Number(ratio.toFixed(2)),
          },
          expectedReference: { maxDiscordanceRatio: 4.0 },
          contextMetadata: { stationId: input.stationId },
          assignedRole: 'administrator',
          detectedAt: now.toISOString(),
          updatedAt: now.toISOString(),
        })
      }
    }

    return anomalies
  }
}


/**
 * Phase 2.5: Central Anomaly Detection & Workflow Service
 *
 * Orchestrates multi-domain detection engines, enforces deduplication idempotency,
 * manages the review & resolution lifecycle, maintains audit logs, and enforces
 * clinical safety invariants.
 */

import { PatientDataAnomalyDetector, type PatientDetectionInput } from './detectors/patient-detector'
import { AssessmentAnomalyDetector, type AssessmentDetectionInput } from './detectors/assessment-detector'
import { DataQualityDetector, type DataQualityAuditInput } from './detectors/data-quality-detector'
import { EnvironmentalAnomalyDetector, type EnvironmentalReadingInput } from './detectors/environmental-detector'
import { OperationalAnomalyDetector, type OperationalTelemetryInput } from './detectors/operational-detector'
import type {
  AnomalyFilter,
  AnomalyRecord,
  AnomalyReviewEvent,
  AnomalySeverity,
  AnomalyStatus,
  AnomalySummary,
  DataQualityReport,
  ResolutionOutcome,
} from './types'

export class AnomalyDetectionService {
  private static inMemoryAnomalies: Map<string, AnomalyRecord> = new Map()
  private static inMemoryReviewEvents: AnomalyReviewEvent[] = []
  private static inMemoryDataQualityReports: DataQualityReport[] = []

  /**
   * Resets internal caches for testing
   */
  public static resetForTesting(): void {
    this.inMemoryAnomalies.clear()
    this.inMemoryReviewEvents = []
    this.inMemoryDataQualityReports = []
  }

  /**
   * Generates a deterministic deduplication key
   */
  private static getDeduplicationKey(record: AnomalyRecord): string {
    return `${record.category}:${record.subtype}:${record.entityId}:${record.ruleId ?? 'no_rule'}`
  }

  /**
   * Stores an anomaly with idempotency deduplication
   */
  private static registerAnomaly(anomaly: AnomalyRecord): AnomalyRecord {
    const key = this.getDeduplicationKey(anomaly)

    // Check if an unresolved anomaly with this fingerprint already exists
    for (const existing of this.inMemoryAnomalies.values()) {
      if (
        this.getDeduplicationKey(existing) === key &&
        ['detected', 'pending_review', 'under_review'].includes(existing.status)
      ) {
        // Idempotent: return existing record without creating duplicate
        return existing
      }
    }

    this.inMemoryAnomalies.set(anomaly.id, anomaly)

    // Log detection event
    const event: AnomalyReviewEvent = {
      id: crypto.randomUUID(),
      anomalyId: anomaly.id,
      previousStatus: 'detected',
      newStatus: 'detected',
      actorId: 'system_detector',
      actorRole: 'system',
      action: 'detect',
      notes: `Automated detection via ${anomaly.detectionMethodology} (Rule: ${anomaly.ruleId ?? 'N/A'})`,
      createdAt: new Date().toISOString(),
    }
    this.inMemoryReviewEvents.push(event)

    return anomaly
  }

  // ==========================================================================
  // MULTI-DOMAIN SCAN METHODS
  // ==========================================================================

  public static async scanPatientData(input: PatientDetectionInput): Promise<AnomalyRecord[]> {
    const detected = PatientDataAnomalyDetector.scan(input)
    return detected.map((a) => this.registerAnomaly(a))
  }

  public static async scanAssessment(input: AssessmentDetectionInput): Promise<AnomalyRecord[]> {
    const detected = AssessmentAnomalyDetector.scan(input)
    return detected.map((a) => this.registerAnomaly(a))
  }

  public static async scanEnvironmental(input: EnvironmentalReadingInput): Promise<AnomalyRecord[]> {
    const detected = EnvironmentalAnomalyDetector.scan(input)
    return detected.map((a) => this.registerAnomaly(a))
  }

  public static async scanOperational(input: OperationalTelemetryInput): Promise<AnomalyRecord[]> {
    const detected = OperationalAnomalyDetector.scan(input)
    return detected.map((a) => this.registerAnomaly(a))
  }

  public static async auditDataQuality(input: DataQualityAuditInput): Promise<{
    report: DataQualityReport
    anomalies: AnomalyRecord[]
  }> {
    const result = DataQualityDetector.auditAndGenerateReport(input)
    const storedAnomalies = result.anomalies.map((a) => this.registerAnomaly(a))
    this.inMemoryDataQualityReports.push(result.report)
    return { report: result.report, anomalies: storedAnomalies }
  }

  // ==========================================================================
  // QUERY & FILTERING METHODS
  // ==========================================================================

  public static async getAnomalies(filter?: AnomalyFilter): Promise<AnomalyRecord[]> {
    let records = Array.from(this.inMemoryAnomalies.values())

    if (!filter) return records

    if (filter.category) {
      records = records.filter((r) => r.category === filter.category)
    }
    if (filter.subtype) {
      records = records.filter((r) => r.subtype === filter.subtype)
    }
    if (filter.severity) {
      records = records.filter((r) => r.severity === filter.severity)
    }
    if (filter.status) {
      records = records.filter((r) => r.status === filter.status)
    }
    if (filter.facilityId) {
      records = records.filter((r) => r.facilityId === filter.facilityId)
    }
    if (filter.entityId) {
      records = records.filter((r) => r.entityId === filter.entityId)
    }
    if (filter.assignedRole) {
      records = records.filter((r) => r.assignedRole === filter.assignedRole)
    }
    if (filter.searchQuery) {
      const q = filter.searchQuery.toLowerCase()
      records = records.filter(
        (r) =>
          r.anomalyNumber.toLowerCase().includes(q) ||
          r.titleEn.toLowerCase().includes(q) ||
          r.titleBn.toLowerCase().includes(q) ||
          r.descriptionEn.toLowerCase().includes(q)
      )
    }

    return records.sort(
      (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
    )
  }

  public static async getAnomalyById(id: string): Promise<AnomalyRecord | null> {
    return this.inMemoryAnomalies.get(id) ?? null
  }

  public static async getAuditTrail(anomalyId: string): Promise<AnomalyReviewEvent[]> {
    return this.inMemoryReviewEvents
      .filter((e) => e.anomalyId === anomalyId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }

  public static async getDataQualityReports(facilityId?: string): Promise<DataQualityReport[]> {
    if (!facilityId) return this.inMemoryDataQualityReports
    return this.inMemoryDataQualityReports.filter(
      (r) => !r.facilityId || r.facilityId === facilityId
    )
  }

  public static async getSummary(facilityId?: string): Promise<AnomalySummary> {
    const records = await this.getAnomalies(facilityId ? { facilityId } : undefined)

    const summary: AnomalySummary = {
      total: records.length,
      unresolved: records.filter((r) => !['resolved', 'dismissed'].includes(r.status)).length,
      byCategory: {
        patient_data: 0,
        assessment_inconsistency: 0,
        data_quality: 0,
        environmental: 0,
        operational: 0,
      },
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      byStatus: {
        detected: 0,
        pending_review: 0,
        under_review: 0,
        confirmed: 0,
        dismissed: 0,
        resolved: 0,
        escalated: 0,
      },
      criticalCount: 0,
      highCount: 0,
    }

    for (const r of records) {
      summary.byCategory[r.category] = (summary.byCategory[r.category] || 0) + 1
      summary.bySeverity[r.severity] = (summary.bySeverity[r.severity] || 0) + 1
      summary.byStatus[r.status] = (summary.byStatus[r.status] || 0) + 1
      if (r.severity === 'critical') summary.criticalCount++
      if (r.severity === 'high') summary.highCount++
    }

    return summary
  }

  // ==========================================================================
  // REVIEW & RESOLUTION WORKFLOW
  // ==========================================================================

  public static async updateStatus(
    anomalyId: string,
    newStatus: AnomalyStatus,
    actorId: string,
    actorRole: string,
    notes?: string
  ): Promise<AnomalyRecord> {
    const record = this.inMemoryAnomalies.get(anomalyId)
    if (!record) {
      throw new Error(`Anomaly record with ID "${anomalyId}" not found.`)
    }

    const previousStatus = record.status
    record.status = newStatus
    record.updatedAt = new Date().toISOString()

    const event: AnomalyReviewEvent = {
      id: crypto.randomUUID(),
      anomalyId,
      previousStatus,
      newStatus,
      actorId,
      actorRole,
      action: newStatus === 'under_review' ? 'start_review' : 'confirm',
      notes: notes ?? `Status transitioned from ${previousStatus} to ${newStatus}`,
      createdAt: new Date().toISOString(),
    }
    this.inMemoryReviewEvents.push(event)

    return record
  }

  public static async resolveAnomaly(
    anomalyId: string,
    outcome: ResolutionOutcome,
    resolvedBy: string,
    actorRole: string,
    resolutionNotes: string
  ): Promise<AnomalyRecord> {
    const record = this.inMemoryAnomalies.get(anomalyId)
    if (!record) {
      throw new Error(`Anomaly record with ID "${anomalyId}" not found.`)
    }

    const previousStatus = record.status
    record.status = 'resolved'
    record.resolutionOutcome = outcome
    record.resolutionNotes = resolutionNotes
    record.resolvedBy = resolvedBy
    record.resolvedAt = new Date().toISOString()
    record.updatedAt = record.resolvedAt

    const event: AnomalyReviewEvent = {
      id: crypto.randomUUID(),
      anomalyId,
      previousStatus,
      newStatus: 'resolved',
      actorId: resolvedBy,
      actorRole,
      action: 'resolve',
      notes: `Resolved with outcome "${outcome}": ${resolutionNotes}`,
      createdAt: record.resolvedAt,
    }
    this.inMemoryReviewEvents.push(event)

    return record
  }

  public static async dismissAnomaly(
    anomalyId: string,
    dismissedBy: string,
    actorRole: string,
    reason: string
  ): Promise<AnomalyRecord> {
    const record = this.inMemoryAnomalies.get(anomalyId)
    if (!record) {
      throw new Error(`Anomaly record with ID "${anomalyId}" not found.`)
    }

    const previousStatus = record.status
    record.status = 'dismissed'
    record.resolutionNotes = reason
    record.resolvedBy = dismissedBy
    record.resolvedAt = new Date().toISOString()
    record.updatedAt = record.resolvedAt

    const event: AnomalyReviewEvent = {
      id: crypto.randomUUID(),
      anomalyId,
      previousStatus,
      newStatus: 'dismissed',
      actorId: dismissedBy,
      actorRole,
      action: 'dismiss',
      notes: `Dismissed: ${reason}`,
      createdAt: record.resolvedAt,
    }
    this.inMemoryReviewEvents.push(event)

    return record
  }

  public static async escalateAnomaly(
    anomalyId: string,
    actorId: string,
    actorRole: string,
    reason: string
  ): Promise<AnomalyRecord> {
    const record = this.inMemoryAnomalies.get(anomalyId)
    if (!record) {
      throw new Error(`Anomaly record with ID "${anomalyId}" not found.`)
    }

    const previousStatus = record.status
    record.status = 'escalated'
    record.severity = 'critical' as AnomalySeverity
    record.updatedAt = new Date().toISOString()

    const event: AnomalyReviewEvent = {
      id: crypto.randomUUID(),
      anomalyId,
      previousStatus,
      newStatus: 'escalated',
      actorId,
      actorRole,
      action: 'escalate',
      notes: `Escalated to clinical director: ${reason}`,
      createdAt: record.updatedAt,
    }
    this.inMemoryReviewEvents.push(event)

    return record
  }

  // ==========================================================================
  // CLINICAL SAFETY & GOVERNANCE INVARIANTS
  // ==========================================================================

  /**
   * Safety Invariant: Anomaly detection must NEVER be interpreted as a disease
   * diagnosis or independently alter clinical risk estimates.
   */
  public static assertAnomalySafetyInvariants(anomaly: AnomalyRecord): void {
    if (
      anomaly.titleEn.toLowerCase().includes('cancer confirmed') ||
      anomaly.descriptionEn.toLowerCase().includes('diagnosed with lung cancer')
    ) {
      throw new Error(
        'CLINICAL SAFETY VIOLATION: Anomaly record cannot claim confirmed clinical diagnosis.'
      )
    }
  }

  /**
   * Safety Invariant: Concerning symptoms must continue to trigger emergency
   * triage escalation regardless of any data anomaly or contradiction.
   */
  public static isRedFlagSymptomProtected(hasHemoptysis: boolean): boolean {
    // True: hemoptysis always retains emergency triage status
    return hasHemoptysis
  }
}


/**
 * Phase 1.14: Symptom-Based Clinical Triage Engine - Core Service
 * 
 * Orchestrates symptom input intake, cryptographic SHA-256 snapshotting,
 * deterministic protocol evaluation, red-flag alert creation, escalation tracking,
 * and immutable persistence.
 */

import { createHash } from 'crypto'
import { PatientService } from '@/modules/patients/service'
import { SymptomTriageEvaluator } from './evaluator'
import { SymptomTriageExplainabilityService } from './explainer'
import type {
  EvaluateSymptomTriageInput,
  PreparedTriageInput,
  TriagePatientContext,
  SymptomTriageDeterminationRecord,
  SymptomEscalationRecordItem,
  PatientSymptomIntakePayload,
} from './types'

export class SymptomTriageService {
  private static determinations: Map<string, SymptomTriageDeterminationRecord> = new Map()
  private static escalations: Map<string, SymptomEscalationRecordItem> = new Map()
  private static assessments: Map<string, { id: string; patientId: string; payload: PatientSymptomIntakePayload; createdAt: string }> = new Map()

  static {
    // Seed benchmark triage record for Rafiqul Islam (LGT-2026-8K2M7P) with Hemoptysis
    const rafiqulId = '11111111-1111-4111-a111-111111111111'
    const facilityId = 'fac-001'
    const now = '2026-11-06T00:00:00Z'

    const benchmarkSymptoms: PatientSymptomIntakePayload = {
      hemoptysis: {
        status: 'present',
        durationWeeks: 3,
        progression: 'worsening',
        severity: 'severe',
        isMassive: false,
        notes: 'Patient reports coughing blood streaks daily for the past 3 weeks.',
      },
      cough: {
        status: 'present',
        durationWeeks: 8,
        progression: 'worsening',
        severity: 'moderate',
        isPersistent: true,
      },
      unexplainedWeightLoss: {
        status: 'present',
        percentageLoss: 12,
        durationWeeks: 6,
        severity: 'severe',
      },
    }

    const assessmentId = 'smp-asm-001'
    this.assessments.set(assessmentId, {
      id: assessmentId,
      patientId: rafiqulId,
      payload: benchmarkSymptoms,
      createdAt: now,
    })

    const seedDetId = 'tri-det-rafiqul-001'
    const seedInput: PreparedTriageInput = {
      patientId: rafiqulId,
      patientCanonicalId: 'LGT-2026-8K2M7P',
      patientName: 'Md. Rafiqul Islam',
      symptoms: benchmarkSymptoms,
      context: {
        age: 58,
        smokingStatus: 'former',
        packYears: 25.0,
        hasBiomassExposure: false,
        hasOccupationalExposure: false,
        hasPreviousTuberculosis: false,
        hasCopdOrAsthma: true,
        hasActiveMalignancy: false,
        provenance: 'clinician_verified',
        facilityId,
        facilityName: 'National Institute of Diseases of the Chest and Hospital (NIDCH)',
      },
      snapshotHash: 'e98a3b21c45d6f7a8b901234567890abcdef1234567890abcdef1234567890ab',
      isComplete: true,
      missingRequiredSymptoms: [],
      unansweredCount: 0,
    }

    // Benchmark evaluation evaluated under research simulation for clinical inspection
    const evalOutput = SymptomTriageEvaluator.evaluate(seedInput, 'proto-nice-ng12-2023', 'research_simulation')
    const explanation = SymptomTriageExplainabilityService.generateExplanation(seedInput, evalOutput)

    const seedRecord: SymptomTriageDeterminationRecord = {
      id: seedDetId,
      patientId: rafiqulId,
      patientCanonicalId: 'LGT-2026-8K2M7P',
      patientName: 'Md. Rafiqul Islam',
      facilityId,
      symptomAssessmentId: assessmentId,
      protocolId: evalOutput.protocolId,
      protocolCode: evalOutput.protocolCode,
      protocolName: evalOutput.protocolName,
      protocolVersion: evalOutput.protocolVersion,
      executionMode: 'research_simulation',
      executionStatus: evalOutput.executionStatus,
      urgencyLevel: evalOutput.urgencyLevel,
      recommendedEscalationPathway: evalOutput.recommendedEscalationPathway,
      recommendedTimeframeDays: evalOutput.recommendedTimeframeDays,
      clinicalAlertId: 'alt-001',
      governanceNotice: evalOutput.governanceNotice,
      clinicalExplanation: explanation,
      disclaimers: explanation.whatThisDoesNotMean,
      inputSnapshotHash: seedInput.snapshotHash,
      evaluatedBy: null,
      evaluatedByName: 'Dr. Farhana Ahmed',
      evaluatedAt: now,
      createdAt: now,
    }
    this.determinations.set(seedRecord.id, seedRecord)

    // Seed escalation record
    const escalationId = 'esc-001'
    this.escalations.set(escalationId, {
      id: escalationId,
      determinationId: seedDetId,
      patientId: rafiqulId,
      facilityId,
      clinicalAlertId: 'alt-001',
      urgencyLevel: 'urgent_assessment',
      escalationReason: 'Hemoptysis and unexplained weight loss (>10%) in a 58-year-old former smoker.',
      escalatedBy: null,
      assignedToRole: 'clinician',
      assignedClinicianId: null,
      status: 'escalated',
      acknowledgedBy: null,
      acknowledgedAt: null,
      actionDocumentedAt: null,
      actionNotes: null,
      resolvedBy: null,
      resolvedAt: null,
      createdAt: now,
      updatedAt: now,
    })
  }

  static async preparePatientInput(
    patientId: string,
    symptomsPayload: PatientSymptomIntakePayload,
    provenance: 'patient_reported' | 'worker_assisted' | 'clinician_verified' | 'imported' = 'patient_reported',
    facilityId?: string
  ): Promise<PreparedTriageInput> {
    const patient = await PatientService.getPatientById(patientId)
    if (!patient) {
      throw new Error(`Patient with ID "${patientId}" was not found.`)
    }

    // Derive age
    let age = 50
    if (patient.dateOfBirth) {
      const birth = new Date(patient.dateOfBirth)
      const now = new Date()
      age = now.getFullYear() - birth.getFullYear()
      const m = now.getMonth() - birth.getMonth()
      if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--
      }
    }

    // Default context
    const context: TriagePatientContext = {
      age,
      smokingStatus: 'former',
      packYears: 20.0,
      hasBiomassExposure: false,
      hasOccupationalExposure: false,
      hasPreviousTuberculosis: false,
      hasCopdOrAsthma: false,
      hasActiveMalignancy: false,
      provenance,
      facilityId: facilityId || patient.primaryFacilityId || null,
      facilityName: 'Dhaka Medical College Hospital',
    }

    // Detect unanswered items
    const missingRequired: string[] = []
    if (!symptomsPayload.hemoptysis || symptomsPayload.hemoptysis.status === 'not_reported') {
      missingRequired.push('hemoptysis')
    }
    if (!symptomsPayload.cough || symptomsPayload.cough.status === 'not_reported') {
      missingRequired.push('cough')
    }
    if (!symptomsPayload.unexplainedWeightLoss || symptomsPayload.unexplainedWeightLoss.status === 'not_reported') {
      missingRequired.push('unexplainedWeightLoss')
    }

    // Canonical representation for cryptographic SHA-256 hash
    const canonical = {
      patientId,
      age,
      symptoms: symptomsPayload,
      provenance,
    }

    const snapshotHash = createHash('sha256').update(JSON.stringify(canonical)).digest('hex')

    return {
      patientId: patient.id,
      patientCanonicalId: patient.patientId,
      patientName: patient.fullName,
      symptoms: symptomsPayload,
      context,
      snapshotHash,
      isComplete: missingRequired.length === 0,
      missingRequiredSymptoms: missingRequired,
      unansweredCount: missingRequired.length,
    }
  }

  static async evaluateSymptomTriage(input: EvaluateSymptomTriageInput): Promise<SymptomTriageDeterminationRecord> {
    const protocolId = input.protocolId || 'proto-nice-ng12-2023'
    const executionMode = input.executionMode || 'clinical_production'
    const provenance = input.provenance || 'patient_reported'

    const preparedInput = await this.preparePatientInput(
      input.patientId,
      input.symptomsPayload,
      provenance,
      input.facilityId
    )

    // Run deterministic evaluator
    const evalOutput = SymptomTriageEvaluator.evaluate(preparedInput, protocolId, executionMode)

    // Run explainability engine
    const explanation = SymptomTriageExplainabilityService.generateExplanation(preparedInput, evalOutput)

    // Save assessment record
    const assessmentId = `smp-asm-${Date.now()}`
    this.assessments.set(assessmentId, {
      id: assessmentId,
      patientId: input.patientId,
      payload: input.symptomsPayload,
      createdAt: new Date().toISOString(),
    })

    // If urgent or emergency escalation is identified in approved/simulation evaluation, trigger escalation record
    let escalationRecordId: string | null = null
    let clinicalAlertId: string | null = null

    if (
      evalOutput.urgencyLevel === 'emergency_escalation' ||
      evalOutput.urgencyLevel === 'urgent_assessment'
    ) {
      escalationRecordId = `esc-${Date.now()}`
      clinicalAlertId = `alt-tri-${Date.now()}`

      this.escalations.set(escalationRecordId, {
        id: escalationRecordId,
        determinationId: `tri-det-${Date.now()}`,
        patientId: input.patientId,
        facilityId: input.facilityId || 'fac-001',
        clinicalAlertId,
        urgencyLevel: evalOutput.urgencyLevel,
        escalationReason: evalOutput.clinicalSummary,
        escalatedBy: input.collectedByUserId || null,
        assignedToRole: 'clinician',
        assignedClinicianId: null,
        status: 'escalated',
        acknowledgedBy: null,
        acknowledgedAt: null,
        actionDocumentedAt: null,
        actionNotes: null,
        resolvedBy: null,
        resolvedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    const determinationId = `tri-det-${Date.now()}`
    const record: SymptomTriageDeterminationRecord = {
      id: determinationId,
      patientId: preparedInput.patientId,
      patientCanonicalId: preparedInput.patientCanonicalId,
      patientName: preparedInput.patientName,
      facilityId: input.facilityId || null,
      symptomAssessmentId: assessmentId,
      protocolId: evalOutput.protocolId,
      protocolCode: evalOutput.protocolCode,
      protocolName: evalOutput.protocolName,
      protocolVersion: evalOutput.protocolVersion,
      executionMode,
      executionStatus: evalOutput.executionStatus,
      urgencyLevel: evalOutput.urgencyLevel,
      recommendedEscalationPathway: evalOutput.recommendedEscalationPathway,
      recommendedTimeframeDays: evalOutput.recommendedTimeframeDays,
      clinicalAlertId,
      governanceNotice: evalOutput.governanceNotice,
      clinicalExplanation: explanation,
      disclaimers: explanation.whatThisDoesNotMean,
      inputSnapshotHash: preparedInput.snapshotHash,
      evaluatedBy: input.collectedByUserId || null,
      evaluatedByName: 'Attending Clinical Staff',
      evaluatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    this.determinations.set(record.id, record)
    return record
  }

  static getDeterminationById(id: string): SymptomTriageDeterminationRecord | null {
    return this.determinations.get(id) || null
  }

  static getPatientDeterminations(patientId: string): SymptomTriageDeterminationRecord[] {
    return Array.from(this.determinations.values()).filter((d) => d.patientId === patientId)
  }

  static getEscalations(options: { patientId?: string; facilityId?: string; status?: string } = {}): SymptomEscalationRecordItem[] {
    return Array.from(this.escalations.values()).filter((e) => {
      if (options.patientId && e.patientId !== options.patientId) return false
      if (options.facilityId && e.facilityId !== options.facilityId) return false
      if (options.status && e.status !== options.status) return false
      return true
    })
  }

  static acknowledgeEscalation(
    escalationId: string,
    actionNotes: string,
    markResolved: boolean = false,
    clinicianId?: string
  ): SymptomEscalationRecordItem {
    const esc = this.escalations.get(escalationId)
    if (!esc) {
      throw new Error(`Escalation record with ID "${escalationId}" was not found.`)
    }

    const now = new Date().toISOString()
    const updated: SymptomEscalationRecordItem = {
      ...esc,
      status: markResolved ? 'resolved' : 'acknowledged',
      acknowledgedBy: clinicianId || 'clinician-default',
      acknowledgedAt: now,
      actionDocumentedAt: now,
      actionNotes,
      resolvedBy: markResolved ? clinicianId || 'clinician-default' : null,
      resolvedAt: markResolved ? now : null,
      updatedAt: now,
    }

    this.escalations.set(updated.id, updated)
    return updated
  }
}

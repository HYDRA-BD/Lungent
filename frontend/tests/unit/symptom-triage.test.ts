import { describe, it, expect } from 'vitest'
import { SymptomTriageProtocolRegistry } from '@/modules/triage/protocol-registry'
import { SymptomTriageEvaluator } from '@/modules/triage/evaluator'
import { SymptomTriageExplainabilityService } from '@/modules/triage/explainer'
import { SymptomTriageService } from '@/modules/triage/service'
import {
  evaluateSymptomTriageSchema,
  acknowledgeEscalationSchema,
} from '@/modules/triage/validation'
import type { PatientSymptomIntakePayload } from '@/modules/triage/types'

describe('Phase 1.14 Symptom-Based Clinical Triage Engine - Unit Tests', () => {
  const MOCK_PATIENT_ID = '11111111-1111-4111-a111-111111111111' // Rafiqul Islam
  const MOCK_FACILITY_ID = 'fac-001'

  describe('1. Symptom Triage Protocol Registry & Governance', () => {
    it('initializes with authoritative international and regional triage protocols', () => {
      const protocols = SymptomTriageProtocolRegistry.getAllProtocols()
      expect(protocols.length).toBeGreaterThanOrEqual(3)

      const nice = SymptomTriageProtocolRegistry.getProtocolById('proto-nice-ng12-2023')
      expect(nice).toBeDefined()
      expect(nice?.protocolCode).toBe('NICE-NG12-2023')
      expect(nice?.issuingOrganization).toContain('National Institute for Health and Care Excellence')

      const nidch = SymptomTriageProtocolRegistry.getProtocolById('proto-nidch-triage-2026')
      expect(nidch).toBeDefined()
      expect(nidch?.protocolCode).toBe('NIDCH-TRIAGE-2026')
      expect(nidch?.jurisdiction).toBe('Bangladesh')

      const who = SymptomTriageProtocolRegistry.getProtocolById('proto-who-lmic-2024')
      expect(who).toBeDefined()
      expect(who?.protocolCode).toBe('WHO-LMIC-2024')
    })

    it('enforces that no unapproved protocol is marked as approved for Bangladesh without formal CAB gazetting', () => {
      const protocols = SymptomTriageProtocolRegistry.getAllProtocols()
      for (const proto of protocols) {
        expect(proto.approvedForBangladesh).toBe(false)
        expect(proto.approvedAt).toBeNull()
        expect(proto.lifecycleStatus).not.toBe('approved_for_clinical_use')
      }
    })

    it('retrieves protocol versions and criteria specifications', () => {
      const versions = SymptomTriageProtocolRegistry.getAllVersions('proto-nice-ng12-2023')
      expect(versions.length).toBeGreaterThanOrEqual(1)

      const latest = SymptomTriageProtocolRegistry.getLatestVersion('proto-nice-ng12-2023')
      expect(latest).toBeDefined()
      expect(latest?.versionTag).toBe('2023.1-update')
      expect(latest?.criteriaDefinitions.length).toBeGreaterThanOrEqual(5)
    })
  })

  describe('2. Patient Input Preparation & Data Provenance', () => {
    it('prepares structured triage inputs and computes tamper-evident SHA-256 snapshot', async () => {
      const sampleSymptoms: PatientSymptomIntakePayload = {
        hemoptysis: { status: 'present', durationWeeks: 2, isMassive: false },
        cough: { status: 'present', durationWeeks: 4, isPersistent: true },
        unexplainedWeightLoss: { status: 'present', percentageLoss: 12 },
      }

      const input = await SymptomTriageService.preparePatientInput(
        MOCK_PATIENT_ID,
        sampleSymptoms,
        'clinician_verified',
        MOCK_FACILITY_ID
      )

      expect(input.patientId).toBe(MOCK_PATIENT_ID)
      expect(input.patientCanonicalId).toBe('LGT-2026-8K2M7P')
      expect(input.context.provenance).toBe('clinician_verified')
      expect(input.context.age).toBeGreaterThanOrEqual(50)
      expect(input.snapshotHash).toHaveLength(64)
      expect(input.isComplete).toBe(true)
    })

    it('never interprets an unanswered question as a negative symptom response', async () => {
      // Input where hemoptysis is NOT reported
      const partialSymptoms: PatientSymptomIntakePayload = {
        cough: { status: 'present', durationWeeks: 2 },
      }

      const input = await SymptomTriageService.preparePatientInput(
        MOCK_PATIENT_ID,
        partialSymptoms,
        'patient_reported'
      )

      expect(input.isComplete).toBe(false)
      expect(input.missingRequiredSymptoms).toContain('hemoptysis')
      expect(input.missingRequiredSymptoms).toContain('unexplainedWeightLoss')

      // Evaluate under research simulation
      const result = SymptomTriageEvaluator.evaluate(input, 'proto-nice-ng12-2023', 'research_simulation')
      const hemCrit = result.criteriaEvaluations.find((c) => c.criterionKey.includes('hemoptysis'))
      // Must be marked 'missing', NOT 'unmet'
      expect(hemCrit?.status).toBe('missing')
    })
  })

  describe('3. Clinical Governance Safety Gate (Critical CDSS Rule)', () => {
    it('PAUSES evaluation and produces NO operational urgency recommendation in clinical production mode for unapproved protocols', async () => {
      const sampleSymptoms: PatientSymptomIntakePayload = {
        hemoptysis: { status: 'present', durationWeeks: 3, isMassive: false },
        cough: { status: 'present', durationWeeks: 6 },
      }

      const input = await SymptomTriageService.preparePatientInput(
        MOCK_PATIENT_ID,
        sampleSymptoms,
        'clinician_verified'
      )

      const result = SymptomTriageEvaluator.evaluate(input, 'proto-nice-ng12-2023', 'clinical_production')

      expect(result.executionStatus).toBe('protocol_not_approved')
      expect(result.urgencyLevel).toBe('protocol_not_approved')
      expect(result.isClinicallyApproved).toBe(false)
      expect(result.recommendedTimeframeDays).toBeNull()
      expect(result.governanceNotice).toContain('PROTOCOL_NOT_APPROVED_FOR_BANGLADESH')
      expect(result.governanceNotice).toContain('Clinical Triage Evaluation Paused')
      expect(result.criteriaEvaluations).toHaveLength(0)
    })
  })

  describe('4. Research Simulation Execution Mode', () => {
    it('evaluates criteria deterministically in research simulation mode with watermarks', async () => {
      const sampleSymptoms: PatientSymptomIntakePayload = {
        hemoptysis: { status: 'present', durationWeeks: 2, isMassive: false },
        cough: { status: 'present', durationWeeks: 4, isPersistent: true },
        unexplainedWeightLoss: { status: 'present', percentageLoss: 10 },
      }

      const input = await SymptomTriageService.preparePatientInput(
        MOCK_PATIENT_ID,
        sampleSymptoms,
        'clinician_verified'
      )

      const result = SymptomTriageEvaluator.evaluate(input, 'proto-nice-ng12-2023', 'research_simulation')

      expect(result.executionMode).toBe('research_simulation')
      expect(result.isResearchExecution).toBe(true)
      expect(result.governanceNotice).toContain('Research & Validation Simulation')
      expect(result.urgencyLevel).toBe('urgent_assessment')
      expect(result.recommendedTimeframeDays).toBe(14)
      expect(result.criteriaEvaluations.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('5. Urgency Determination & Red-Flag Criteria Logic', () => {
    it('triggers Emergency Escalation for acute stridor or massive hemoptysis', async () => {
      const emergencySymptoms: PatientSymptomIntakePayload = {
        stridor: { status: 'present' },
        hemoptysis: { status: 'present', isMassive: true },
      }

      const input = await SymptomTriageService.preparePatientInput(
        MOCK_PATIENT_ID,
        emergencySymptoms,
        'clinician_verified'
      )

      const result = SymptomTriageEvaluator.evaluate(input, 'proto-nice-ng12-2023', 'research_simulation')

      expect(result.urgencyLevel).toBe('emergency_escalation')
      expect(result.executionStatus).toBe('emergency_detected')
      expect(result.recommendedTimeframeDays).toBe(0)
      expect(result.recommendedEscalationPathway).toContain('Immediate Emergency Escalation')

      const emergCrit = result.criteriaEvaluations.find((c) => c.criterionKey === 'emergency_airway_vascular_compromise')
      expect(emergCrit?.status).toBe('met')
      expect(emergCrit?.isRedFlag).toBe(true)
    })

    it('triggers Urgent 2-Week Assessment for unexplained hemoptysis in patient aged >= 40', async () => {
      const urgentSymptoms: PatientSymptomIntakePayload = {
        hemoptysis: { status: 'present', durationWeeks: 2, isMassive: false },
        cough: { status: 'present', durationWeeks: 2 },
      }

      const input = await SymptomTriageService.preparePatientInput(
        MOCK_PATIENT_ID,
        urgentSymptoms,
        'clinician_verified'
      )

      const result = SymptomTriageEvaluator.evaluate(input, 'proto-nice-ng12-2023', 'research_simulation')

      expect(result.urgencyLevel).toBe('urgent_assessment')
      expect(result.executionStatus).toBe('escalation_required')
      expect(result.recommendedTimeframeDays).toBe(14)
      expect(result.recommendedEscalationPathway).toContain('Urgent 2-Week Diagnostic Assessment')

      const hemCrit = result.criteriaEvaluations.find((c) => c.criterionKey.includes('urgent_hemoptysis'))
      expect(hemCrit?.status).toBe('met')
      expect(hemCrit?.isRedFlag).toBe(true)
    })

    it('triggers Prompt Review for persistent cough (>3 weeks) in non-smoker without red flags', async () => {
      const promptSymptoms: PatientSymptomIntakePayload = {
        cough: { status: 'present', durationWeeks: 4, isPersistent: true },
        hemoptysis: { status: 'absent' },
        unexplainedWeightLoss: { status: 'absent' },
        stridor: { status: 'absent' },
      }

      const input = await SymptomTriageService.preparePatientInput(
        MOCK_PATIENT_ID,
        promptSymptoms,
        'patient_reported'
      )
      // Force non-smoker context
      input.context.smokingStatus = 'never'
      input.context.packYears = 0
      input.context.hasBiomassExposure = false

      const result = SymptomTriageEvaluator.evaluate(input, 'proto-nice-ng12-2023', 'research_simulation')

      expect(result.urgencyLevel).toBe('prompt_review')
      expect(result.recommendedTimeframeDays).toBe(28)
      expect(result.recommendedEscalationPathway).toContain('Prompt Clinical Review')
    })
  })

  describe('6. Critical Clinical Safety: Independence of Risk and Screening Eligibility (Non-Negotiable CDSS Rules)', () => {
    it('ensures concerning symptoms CANNOT be dismissed or suppressed by low calculated risk or screening ineligibility', async () => {
      const redFlagSymptoms: PatientSymptomIntakePayload = {
        hemoptysis: { status: 'present', durationWeeks: 3 },
        unexplainedWeightLoss: { status: 'present', percentageLoss: 15 },
      }

      const input = await SymptomTriageService.preparePatientInput(
        MOCK_PATIENT_ID,
        redFlagSymptoms,
        'clinician_verified'
      )

      // Simulate a patient with low baseline risk (younger age, never-smoker)
      input.context.age = 42
      input.context.smokingStatus = 'never'
      input.context.packYears = 0 // Ineligible for USPSTF/ACS screening! Low calculated 6-year risk!

      const result = SymptomTriageEvaluator.evaluate(input, 'proto-nice-ng12-2023', 'research_simulation')

      // MUST NOT be suppressed to routine review!
      expect(result.urgencyLevel).toBe('urgent_assessment')
      expect(result.redFlagCount).toBeGreaterThanOrEqual(1)

      const explanation = SymptomTriageExplainabilityService.generateExplanation(input, result)
      expect(explanation.clinicalConsiderations.some((c) => c.includes('Independence from Screening & Risk'))).toBe(true)
      expect(explanation.whatThisDoesNotMean).toContain('active symptoms take absolute precedence over screening criteria')
    })
  })

  describe('7. Explainability & Non-Diagnostic Disclaimers', () => {
    it('produces transparent explainability, triggering symptoms list, and non-diagnostic disclaimers', async () => {
      const symptoms: PatientSymptomIntakePayload = {
        hemoptysis: { status: 'present', durationWeeks: 2 },
        cough: { status: 'present', durationWeeks: 6 },
        unexplainedWeightLoss: { status: 'present', percentageLoss: 10 },
      }

      const input = await SymptomTriageService.preparePatientInput(
        MOCK_PATIENT_ID,
        symptoms,
        'clinician_verified'
      )

      const result = SymptomTriageEvaluator.evaluate(input, 'proto-nice-ng12-2023', 'research_simulation')
      const explanation = SymptomTriageExplainabilityService.generateExplanation(input, result)

      expect(explanation.headlineOutcome).toContain('Urgent Clinical Assessment')
      expect(explanation.triggeringSymptomsSummary.length).toBeGreaterThanOrEqual(2)
      expect(explanation.urgencyBadge.label).toBe('Urgent 2-Week Tier')
      expect(explanation.urgencyBadge.timeframe).toBe('Within 14 Days')

      // Mandatory CDSS Safety assertions
      const notMeans = explanation.whatThisDoesNotMean
      expect(notMeans).toContain('NOT a diagnosis of lung cancer')
      expect(notMeans).toContain('does NOT guarantee that serious pulmonary pathology is absent')
      expect(notMeans).toContain('active symptoms take absolute precedence')
      expect(notMeans).toContain('legal and clinical responsibility')
    })
  })

  describe('8. End-to-End Service, Alert Creation & Escalation Tracking', () => {
    it('executes symptom triage via SymptomTriageService with automatic alert and escalation creation', async () => {
      const record = await SymptomTriageService.evaluateSymptomTriage({
        patientId: MOCK_PATIENT_ID,
        symptomsPayload: {
          hemoptysis: { status: 'present', durationWeeks: 3, isMassive: false },
          unexplainedWeightLoss: { status: 'present', percentageLoss: 12 },
          cough: { status: 'present', durationWeeks: 8 },
        },
        protocolId: 'proto-nice-ng12-2023',
        executionMode: 'research_simulation',
        facilityId: MOCK_FACILITY_ID,
        provenance: 'clinician_verified',
      })

      expect(record.id).toBeDefined()
      expect(record.patientId).toBe(MOCK_PATIENT_ID)
      expect(record.urgencyLevel).toBe('urgent_assessment')
      expect(record.clinicalAlertId).not.toBeNull()
      expect(record.inputSnapshotHash).toHaveLength(64)

      // Verify escalation record was tracked
      const escalations = SymptomTriageService.getEscalations({ patientId: MOCK_PATIENT_ID })
      expect(escalations.length).toBeGreaterThanOrEqual(1)

      const activeEsc = escalations[0]
      expect(activeEsc.urgencyLevel).toBe('urgent_assessment')

      // Test clinician acknowledgment
      const ack = SymptomTriageService.acknowledgeEscalation(
        activeEsc.id,
        'Reviewed in chest clinic. Urgent contrast CT and GeneXpert scheduled.',
        true,
        'clinician-farhana'
      )

      expect(ack.status).toBe('resolved')
      expect(ack.actionNotes).toContain('Urgent contrast CT')
      expect(ack.resolvedBy).toBe('clinician-farhana')
    })
  })

  describe('9. Input Request Validation Schemas', () => {
    it('validates request payloads correctly with Zod schemas', () => {
      const validPayload = {
        patientId: '11111111-1111-4111-a111-111111111111',
        symptomsPayload: {
          hemoptysis: { status: 'present' as const, durationWeeks: 2 },
          cough: { status: 'present' as const, durationWeeks: 4 },
        },
        protocolId: 'proto-nice-ng12-2023',
        executionMode: 'clinical_production' as const,
      }

      const parsed = evaluateSymptomTriageSchema.safeParse(validPayload)
      expect(parsed.success).toBe(true)

      const invalidPayload = {
        patientId: 'not-a-uuid',
        symptomsPayload: {},
      }
      const invalidParsed = evaluateSymptomTriageSchema.safeParse(invalidPayload)
      expect(invalidParsed.success).toBe(false)

      const ackValid = {
        escalationId: '11111111-1111-4111-a111-111111111111',
        actionNotes: 'Acknowledged and reviewed in clinic.',
        markResolved: true,
      }
      expect(acknowledgeEscalationSchema.safeParse(ackValid).success).toBe(true)
    })
  })
})

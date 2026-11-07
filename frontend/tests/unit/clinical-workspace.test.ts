import { describe, it, expect } from 'vitest'
import { ClinicalService } from '@/modules/clinical/service'
import { documentClinicalDecisionSchema } from '@/modules/clinical/validation'

describe('Phase 1.11 Clinical Decision Support & Workspace - Unit Tests', () => {
  const MOCK_PATIENT_ID = '11111111-1111-4111-a111-111111111111'
  const MOCK_CLINICIAN_ID = 'usr-clinician-001'

  describe('Clinical Dashboard Metrics', () => {
    it('aggregates patient counts, pending reviews, active alerts, and follow-ups', async () => {
      const stats = await ClinicalService.getClinicalDashboardStats()
      expect(stats.totalPatientsUnderCare).toBeGreaterThan(0)
      expect(stats.pendingReviewsCount).toBeGreaterThanOrEqual(0)
      expect(stats.unresolvedAlertsCount).toBeGreaterThanOrEqual(1)
      expect(stats.criticalAlertsCount).toBeGreaterThanOrEqual(1)
      expect(stats.followUpsDueCount).toBeGreaterThanOrEqual(1)
    })
  })

  describe('Clinical Patient Directory Search & Filtering', () => {
    it('returns roster of accessible patients with clinical review status', async () => {
      const res = await ClinicalService.searchClinicalPatients({ limit: 10 })
      expect(res.patients.length).toBeGreaterThan(0)
      const first = res.patients[0]
      expect(first).toHaveProperty('id')
      expect(first).toHaveProperty('canonicalId')
      expect(first).toHaveProperty('reviewStatus')
      expect(first).toHaveProperty('activeAlertsCount')
    })

    it('filters patients by query name or ID correctly', async () => {
      const res = await ClinicalService.searchClinicalPatients({ query: 'Rafiqul' })
      expect(res.patients.length).toBeGreaterThanOrEqual(1)
      expect(res.patients[0].fullName).toContain('Rafiqul')
    })

    it('filters patients with active clinical alerts', async () => {
      const res = await ClinicalService.searchClinicalPatients({ hasAlerts: true })
      expect(res.patients.every((p) => p.activeAlertsCount > 0)).toBe(true)
    })
  })

  describe('Consolidated 5-Part Clinical Profile', () => {
    it('retrieves comprehensive 5-part clinical profile for patient', async () => {
      const profile = await ClinicalService.getClinicalPatientProfile(MOCK_PATIENT_ID)
      expect(profile).not.toBeNull()
      if (!profile) return

      // Section A: Identity
      expect(profile.identity.patient.id).toBe(MOCK_PATIENT_ID)
      expect(profile.identity.primaryFacilityName).toBeDefined()
      expect(profile.identity.assignedClinicianName).toBeDefined()

      // Section B: Medical History
      expect(profile.medicalHistory.conditions).toBeInstanceOf(Array)
      expect(profile.medicalHistory.medications).toBeInstanceOf(Array)
      expect(profile.medicalHistory.allergies).toBeInstanceOf(Array)

      // Section C: Lung Health & Risk Factors
      expect(profile.lungHealthAndExposures).toBeDefined()
      expect(typeof profile.lungHealthAndExposures.packYearsCalculated).toBe('number')
      expect(typeof profile.lungHealthAndExposures.hasHemoptysis).toBe('boolean')

      // Section D: Assessment History
      expect(profile.assessmentHistory).toBeInstanceOf(Array)

      // Section E: Clinical History
      expect(profile.clinicalHistory.reviews).toBeInstanceOf(Array)
      expect(profile.clinicalHistory.observations).toBeInstanceOf(Array)
      expect(profile.clinicalHistory.decisions).toBeInstanceOf(Array)
      expect(profile.clinicalHistory.alerts).toBeInstanceOf(Array)
      expect(profile.clinicalHistory.followUpPlans).toBeInstanceOf(Array)
    })
  })

  describe('Clinical Information Review Workflow', () => {
    it('records a clinical review with missing, conflicting, and verified notes', async () => {
      const review = await ClinicalService.recordClinicalReview(
        {
          patientId: MOCK_PATIENT_ID,
          reviewType: 'comprehensive_intake',
          reviewStatus: 'reviewed',
          summary: 'Detailed pulmonary intake completed. Patient displays severe exertional wheezing.',
          missingInformationNotes: 'Prior chest X-ray missing.',
          conflictingInformationNotes: 'Discrepancy in cessation date.',
          verifiedInformationNotes: 'Verified 35 pack-years directly with patient.',
          requestedInformation: 'Order high-resolution chest CT.',
          observations: [
            {
              category: 'pulmonary_vitals',
              observationText: 'Bilateral wheezes on expiration, SpO2 94%.',
              clinicalInterpretation: 'Signs of severe airway obstruction.',
            },
          ],
        },
        MOCK_CLINICIAN_ID
      )

      expect(review.id).toBeDefined()
      expect(review.reviewStatus).toBe('reviewed')
      expect(review.summary).toContain('Detailed pulmonary intake')
      expect(review.closedAt).not.toBeNull()
    })
  })

  describe('Clinical Decision Documentation & Governance Rules', () => {
    it('validates clinical decision documentation and enforces disagreement rationale', () => {
      // 1. Without disagreement: valid
      const validWithoutDisagreement = documentClinicalDecisionSchema.safeParse({
        clinicalReviewId: 'rev-001',
        patientId: MOCK_PATIENT_ID,
        decisionType: 'screening_recommended',
        rationale: 'Patient fulfills all LDCT screening criteria with high pack-years.',
        disagreementWithAutomatedOutput: false,
        recommendedNextSteps: '1. Low-dose CT scan\n2. Smoking cessation clinic.',
      })
      expect(validWithoutDisagreement.success).toBe(true)

      // 2. With disagreement but missing rationale: invalid!
      const invalidDisagreement = documentClinicalDecisionSchema.safeParse({
        clinicalReviewId: 'rev-001',
        patientId: MOCK_PATIENT_ID,
        decisionType: 'no_immediate_intervention',
        rationale: 'Clinical judgment indicates low immediate risk.',
        disagreementWithAutomatedOutput: true,
        disagreementReason: '', // Empty or omitted
        recommendedNextSteps: 'Routine follow-up in 12 months.',
      })
      expect(invalidDisagreement.success).toBe(false)
      if (!invalidDisagreement.success) {
        expect(invalidDisagreement.error.issues[0].message).toContain('Mandatory clinical rationale')
      }

      // 3. With disagreement and valid rationale (>= 10 chars): valid!
      const validDisagreement = documentClinicalDecisionSchema.safeParse({
        clinicalReviewId: 'rev-001',
        patientId: MOCK_PATIENT_ID,
        decisionType: 'urgent_specialist_referral',
        rationale: 'Overriding automated moderate score due to persistent hemoptysis.',
        disagreementWithAutomatedOutput: true,
        disagreementReason: 'Hemoptysis present for 3 weeks; automated triage under-scored symptom severity.',
        recommendedNextSteps: 'Immediate bronchoscopy and thoracic oncology evaluation.',
      })
      expect(validDisagreement.success).toBe(true)
    })

    it('documents finalized clinical decision in service', async () => {
      const decision = await ClinicalService.documentClinicalDecision(
        {
          clinicalReviewId: 'rev-001',
          patientId: MOCK_PATIENT_ID,
          decisionType: 'diagnostic_workup_needed',
          rationale: 'Symptomatic presentation warrants contrast-enhanced chest CT scan.',
          disagreementWithAutomatedOutput: false,
          recommendedNextSteps: 'Order chest CT with IV contrast and sputum cytology.',
          referralTarget: 'National Institute of Diseases of the Chest and Hospital (NIDCH)',
        },
        MOCK_CLINICIAN_ID
      )

      expect(decision.id).toBeDefined()
      expect(decision.status).toBe('finalized')
      expect(decision.referralTarget).toContain('NIDCH')
    })

    it('amends a finalized clinical decision and logs immutable audit trail', async () => {
      // Create initial decision
      const decision = await ClinicalService.documentClinicalDecision(
        {
          clinicalReviewId: 'rev-001',
          patientId: MOCK_PATIENT_ID,
          decisionType: 'routine_follow_up',
          rationale: 'Initial assessment indicated routine follow-up sufficient.',
          disagreementWithAutomatedOutput: false,
          recommendedNextSteps: 'Review in 6 months.',
        },
        MOCK_CLINICIAN_ID
      )

      // Amend decision
      const amended = await ClinicalService.amendClinicalDecision(
        {
          decisionId: decision.id,
          amendmentReason: 'Patient subsequently reported coughing fresh blood; escalating to diagnostic workup.',
          amendedContent: {
            decisionType: 'diagnostic_workup_needed',
            rationale: 'New symptom onset mandates immediate diagnostic intervention.',
            recommendedNextSteps: 'Stat contrast thorax CT and pulmonology consultation.',
          },
        },
        MOCK_CLINICIAN_ID
      )

      expect(amended.status).toBe('amended')
      expect(amended.decisionType).toBe('diagnostic_workup_needed')
      expect(amended.amendments).toBeDefined()
      expect(amended.amendments?.length).toBeGreaterThanOrEqual(1)
      const audit = amended.amendments![0]
      expect(audit.amendmentReason).toContain('Patient subsequently reported coughing fresh blood')
      expect(audit.previousContent).toHaveProperty('decisionType', 'routine_follow_up')
    })
  })

  describe('Clinical Safety Rules - Alert Non-Suppression', () => {
    it('ensures critical red-flag alerts remain active and are not suppressed by low-risk outputs', async () => {
      const alerts = await ClinicalService.getClinicalAlerts({ patientId: MOCK_PATIENT_ID })
      const redFlag = alerts.find((a) => a.alertType === 'red_flag_symptom')
      expect(redFlag).toBeDefined()
      expect(redFlag?.severity).toBe('critical')
      expect(redFlag?.status).toBe('active')
      expect(redFlag?.title).toContain('Hemoptysis')
    })
  })

  describe('Clinical Alert Acknowledgment & Resolution', () => {
    it('acknowledges and resolves a clinical alert', async () => {
      const alerts = await ClinicalService.getClinicalAlerts({ status: 'active' })
      expect(alerts.length).toBeGreaterThan(0)
      const targetAlert = alerts[0]

      // Acknowledge
      const acked = await ClinicalService.acknowledgeClinicalAlert(
        {
          alertId: targetAlert.id,
          resolutionNotes: 'Clinician notified and reviewed symptoms.',
          markResolved: false,
        },
        MOCK_CLINICIAN_ID
      )
      expect(acked.status).toBe('acknowledged')
      expect(acked.acknowledgedBy).toBe(MOCK_CLINICIAN_ID)

      // Resolve
      const resolved = await ClinicalService.acknowledgeClinicalAlert(
        {
          alertId: targetAlert.id,
          resolutionNotes: 'Patient admitted to thoracic unit and diagnostic imaging completed.',
          markResolved: true,
        },
        MOCK_CLINICIAN_ID
      )
      expect(resolved.status).toBe('resolved')
      expect(resolved.resolvedBy).toBe(MOCK_CLINICIAN_ID)
    })
  })

  describe('Clinical Follow-Up Planning', () => {
    it('creates follow-up plan and tracks completion status', async () => {
      const plan = await ClinicalService.createFollowUpPlan(
        {
          patientId: MOCK_PATIENT_ID,
          instructions: 'Repeat spirometry and review post-treatment symptom score.',
          recommendedReviewDate: '2026-12-15',
          notes: 'Care coordinator to follow up via telephone.',
        },
        MOCK_CLINICIAN_ID
      )

      expect(plan.id).toBeDefined()
      expect(plan.status).toBe('planned')
      expect(plan.recommendedReviewDate).toBe('2026-12-15')

      const updated = await ClinicalService.updateFollowUpStatus(
        {
          followUpId: plan.id,
          status: 'completed',
          notes: 'Patient attended in-clinic appointment.',
        },
        MOCK_CLINICIAN_ID
      )

      expect(updated.status).toBe('completed')
      expect(updated.completedAt).not.toBeNull()
    })
  })

  describe('Clinical Activity Audit Trail', () => {
    it('records and returns chronological clinical activity history', async () => {
      const activities = await ClinicalService.getClinicalActivities({ limit: 10 })
      expect(activities.length).toBeGreaterThan(0)
      const first = activities[0]
      expect(first.clinicianName).toBeDefined()
      expect(first.activityType).toBeDefined()
      expect(first.createdAt).toBeDefined()
    })
  })
})


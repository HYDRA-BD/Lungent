import { describe, it, expect, beforeEach } from 'vitest'
import { ClinicalGovernanceService } from '@/modules/governance/service'
import {
  BASELINE_CAB_BODY,
} from '@/modules/governance/methodology-registry'

describe('Phase 1.24: Clinical Governance Framework', () => {
  beforeEach(() => {
    ClinicalGovernanceService.resetForTesting()
  })

  describe('1. Clinical Advisory Board (CAB) Management', () => {
    it('returns the national clinical governance authority profile', async () => {
      const body = await ClinicalGovernanceService.getBoardProfile()
      expect(body).toBeDefined()
      expect(body.id).toBe(BASELINE_CAB_BODY.id)
      expect(body.jurisdiction).toBe('Bangladesh')
      expect(body.status).toBe('active')
      expect(body.name).toContain('Clinical Advisory Board')
    })

    it('returns multidisciplinary CAB members with credential statuses', async () => {
      const members = await ClinicalGovernanceService.getMembers()
      expect(members.length).toBeGreaterThanOrEqual(5)

      const chair = members.find((m) => m.role === 'chair')
      expect(chair).toBeDefined()
      expect(chair?.fullName).toBe('Prof. Dr. Farhana Ahmed')
      expect(chair?.credentialsVerified).toBe(true)
      expect(chair?.medicalRegistrationNumber).toBe('BMDC-A-28491')
    })

    it('allows executive officers to verify member credentials', async () => {
      const members = await ClinicalGovernanceService.getMembers()
      const memberToVerify = members[2] // Biostatistician

      const verified = await ClinicalGovernanceService.verifyMemberCredentials(
        memberToVerify.id,
        'usr-cab-chair-01',
        'chair'
      )
      expect(verified.credentialsVerified).toBe(true)
      expect(verified.verifiedBy).toBe('usr-cab-chair-01')
      expect(verified.verifiedAt).toBeDefined()
    })

    it('rejects credential verification by non-executive users', async () => {
      const members = await ClinicalGovernanceService.getMembers()
      await expect(
        ClinicalGovernanceService.verifyMemberCredentials(
          members[0].id,
          'usr-observer-01',
          'observer'
        )
      ).rejects.toThrow(/Unauthorized/i)
    })

    it('tracks conflict of interest declarations and active conflict status', async () => {
      const members = await ClinicalGovernanceService.getMembers()
      const updated = await ClinicalGovernanceService.recordConflictDeclaration(
        members[1].id,
        'Consulting for independent academic trial; no commercial ties.',
        false,
        'usr-cab-chair-01'
      )
      expect(updated.conflictOfInterestDeclaration).toContain('academic trial')
      expect(updated.hasActiveConflict).toBe(false)
    })
  })

  describe('2. Clinical Methodology Registry', () => {
    it('registers baseline methodologies: PLCOm2012, USPSTF 2021, and NICE NG12', async () => {
      const methodologies = await ClinicalGovernanceService.getMethodologies()
      expect(methodologies.length).toBe(3)

      const plco = methodologies.find((m) => m.code === 'plcom2012')
      expect(plco).toBeDefined()
      expect(plco?.type).toBe('risk_prediction')
      expect(plco?.evidenceGrade).toBe('Level 1a')
      expect(plco?.governanceStatus).toBe('active')

      const uspstf = methodologies.find((m) => m.code === 'uspstf_2021')
      expect(uspstf).toBeDefined()
      expect(uspstf?.type).toBe('screening_eligibility')

      const nice = methodologies.find((m) => m.code === 'nice_ng12')
      expect(nice).toBeDefined()
      expect(nice?.type).toBe('symptom_triage')
    })

    it('retrieves active methodology versions with parameter thresholds and SemVer', async () => {
      const plco = await ClinicalGovernanceService.getMethodology('plcom2012')
      expect(plco).toBeDefined()
      expect(plco?.activeVersionString).toBe('2012.1')

      const versions = await ClinicalGovernanceService.getMethodologyVersions(plco!.id)
      expect(versions.length).toBeGreaterThanOrEqual(1)
      expect(versions[0].semver).toBe('1.0.0')
      expect(versions[0].ruleDefinitions).toHaveProperty('high_risk_threshold_pct', 1.51)
      expect(versions[0].rules?.length).toBeGreaterThan(0)
    })

    it('allows creation of a new draft methodology version', async () => {
      const methodologies = await ClinicalGovernanceService.getMethodologies()
      const plco = methodologies[0]

      const newVer = await ClinicalGovernanceService.createVersion(
        {
          methodologyId: plco.id,
          versionString: '2026.1-pilot',
          semver: '1.1.0',
          changelog: 'Proposed calibration for biomass smoke exposure.',
          ruleDefinitions: { biomass_adjusted_risk: true, risk_threshold_pct: 1.51 },
        },
        { id: 'usr-cab-rev-04', name: 'Dr. Kazi Mahfuzur Rahman', role: 'methodology_author' }
      )

      expect(newVer.id).toBeDefined()
      expect(newVer.status).toBe('draft')
      expect(newVer.versionString).toBe('2026.1-pilot')
    })
  })

  describe('3. Methodology Lifecycle State Machine & Authority Boundaries', () => {
    it('enforces controlled sequential state progression', async () => {
      const plco = await ClinicalGovernanceService.getMethodology('plcom2012')
      const draftVer = await ClinicalGovernanceService.createVersion(
        {
          methodologyId: plco!.id,
          versionString: '2026.2',
          semver: '1.2.0',
          changelog: 'Refined triage urgency windows.',
          ruleDefinitions: {},
        },
        { id: 'usr-author', name: 'Methodology Author', role: 'methodology_author' }
      )

      // draft -> submitted_for_review
      const submitted = await ClinicalGovernanceService.transitionLifecycle(
        draftVer.id,
        'submitted_for_review',
        { id: 'usr-author', name: 'Methodology Author', role: 'methodology_author' },
        'Ready for clinical review'
      )
      expect(submitted.status).toBe('submitted_for_review')

      // submitted_for_review -> under_clinical_review
      const underReview = await ClinicalGovernanceService.transitionLifecycle(
        draftVer.id,
        'under_clinical_review',
        { id: 'usr-rev', name: 'Dr. Clinical Reviewer', role: 'clinical_reviewer' },
        'Commencing expert analysis'
      )
      expect(underReview.status).toBe('under_clinical_review')

      // under_clinical_review -> awaiting_formal_approval
      const awaiting = await ClinicalGovernanceService.transitionLifecycle(
        draftVer.id,
        'awaiting_formal_approval',
        { id: 'usr-rev', name: 'Dr. Clinical Reviewer', role: 'clinical_reviewer' },
        'Approved by reviewer, submitted to Board assembly'
      )
      expect(awaiting.status).toBe('awaiting_formal_approval')

      // awaiting_formal_approval -> approved
      const approved = await ClinicalGovernanceService.transitionLifecycle(
        draftVer.id,
        'approved',
        { id: 'usr-chair', name: 'Prof. Dr. Farhana Ahmed', role: 'chair' },
        'Ratified unanimously at CAB meeting',
        'CAB-2026-Q1'
      )
      expect(approved.status).toBe('approved')
      expect(approved.approvedByMemberName).toBe('Prof. Dr. Farhana Ahmed')
      expect(approved.approvalNotes).toContain('Ratified unanimously')
    })

    it('rejects invalid state jumps', async () => {
      const plco = await ClinicalGovernanceService.getMethodology('plcom2012')
      const draftVer = await ClinicalGovernanceService.createVersion(
        {
          methodologyId: plco!.id,
          versionString: '2026.3',
          semver: '1.3.0',
          changelog: 'Test version',
          ruleDefinitions: {},
        },
        { id: 'usr-author', name: 'Methodology Author', role: 'methodology_author' }
      )

      // Attempt illegal jump: draft directly to active
      await expect(
        ClinicalGovernanceService.transitionLifecycle(
          draftVer.id,
          'active',
          { id: 'usr-chair', name: 'Chair', role: 'chair' },
          'Bypassing review'
        )
      ).rejects.toThrow(/Invalid lifecycle transition/i)
    })

    it('rejects approval by non-clinical software administrators', async () => {
      const plco = await ClinicalGovernanceService.getMethodology('plcom2012')
      const draftVer = await ClinicalGovernanceService.createVersion(
        {
          methodologyId: plco!.id,
          versionString: '2026.4',
          semver: '1.4.0',
          changelog: 'Test version',
          ruleDefinitions: {},
        },
        { id: 'usr-author', name: 'Methodology Author', role: 'methodology_author' }
      )

      await ClinicalGovernanceService.transitionLifecycle(
        draftVer.id,
        'submitted_for_review',
        { id: 'usr-author', name: 'Author', role: 'methodology_author' },
        'Ready'
      )
      await ClinicalGovernanceService.transitionLifecycle(
        draftVer.id,
        'under_clinical_review',
        { id: 'usr-rev', name: 'Reviewer', role: 'clinical_reviewer' },
        'Reviewing'
      )
      await ClinicalGovernanceService.transitionLifecycle(
        draftVer.id,
        'awaiting_formal_approval',
        { id: 'usr-rev', name: 'Reviewer', role: 'clinical_reviewer' },
        'Done'
      )

      // Software administrator attempts to approve without clinical board authority
      await expect(
        ClinicalGovernanceService.transitionLifecycle(
          draftVer.id,
          'approved',
          { id: 'usr-sysadmin', name: 'IT Admin', role: 'administrator' },
          'System admin approval'
        )
      ).rejects.toThrow(/Only verified Clinical Advisory Board authorities/i)
    })
  })

  describe('4. Assessment Engine CDSS Governance Assertions', () => {
    it('returns allowed: true for active, approved methodologies', () => {
      const res = ClinicalGovernanceService.assertMethodologyActive('plcom2012', '2012.1')
      expect(res.allowed).toBe(true)
      expect(res.lifecycleStatus).toBe('active')
      expect(res.methodologyCode).toBe('plcom2012')
    })

    it('pauses calculation and provides governance notice if methodology is suspended', async () => {
      const nice = await ClinicalGovernanceService.getMethodology('nice_ng12')
      const activeVer = nice!.versions![0]

      // Suspend methodology
      await ClinicalGovernanceService.transitionLifecycle(
        activeVer.id,
        'suspended',
        { id: 'usr-chair', name: 'CAB Chair', role: 'chair' },
        'Temporary suspension pending guideline update'
      )

      const check = ClinicalGovernanceService.assertMethodologyActive('nice_ng12', '2023.1')
      expect(check.allowed).toBe(false)
      expect(check.lifecycleStatus).toBe('suspended')
      expect(check.notice).toContain('temporarily suspended')
      expect(check.isEmergencyOverrideAllowed).toBe(true) // Emergency red flags remain active!
    })

    it('halts calculation if methodology code is unregistered', () => {
      const check = ClinicalGovernanceService.assertMethodologyActive('experimental_unapproved_ai', '1.0')
      expect(check.allowed).toBe(false)
      expect(check.notice).toContain('not registered')
    })
  })

  describe('5. Clinician CDSS Override Records', () => {
    it('records structured clinician override preserving original outputs and mandatory rationale', async () => {
      const override = await ClinicalGovernanceService.recordClinicianOverride({
        assessmentId: 'asm-test-001',
        patientId: 'pat-test-001',
        clinicianId: 'usr-clinician-001',
        clinicianName: 'Dr. Rafiqul Islam',
        engineSubsystem: 'symptom_triage',
        automatedResult: { urgencyTier: 'routine', recommendedDays: 28 },
        overriddenResult: { urgencyTier: 'urgent_referral', recommendedDays: 14 },
        overrideReasonCategory: 'diagnostic_discordance',
        overrideRationale:
          'Patient exhibits progressive unresolving hemoptysis and cachexia requiring urgent bronchoscopy.',
      })

      expect(override.id).toBeDefined()
      expect(override.overrideReasonCategory).toBe('diagnostic_discordance')
      expect(override.overrideRationale).toContain('progressive unresolving hemoptysis')
      expect(override.automatedResult).toHaveProperty('urgencyTier', 'routine')
      expect(override.overriddenResult).toHaveProperty('urgencyTier', 'urgent_referral')
    })

    it('rejects overrides with insufficient or missing rationale', async () => {
      await expect(
        ClinicalGovernanceService.recordClinicianOverride({
          assessmentId: 'asm-test-002',
          patientId: 'pat-test-002',
          clinicianId: 'usr-clinician-001',
          clinicianName: 'Dr. Rafiqul Islam',
          engineSubsystem: 'screening_eligibility',
          automatedResult: { outcome: 'ineligible' },
          overriddenResult: { outcome: 'eligible' },
          overrideReasonCategory: 'other',
          overrideRationale: 'short', // less than 10 characters
        })
      ).rejects.toThrow(/rationale must be at least 10 characters/i)
    })

    it('filters clinician overrides by engine subsystem', async () => {
      const triageOverrides = await ClinicalGovernanceService.getClinicianOverrides({
        engineSubsystem: 'symptom_triage',
      })
      expect(triageOverrides.every((o) => o.engineSubsystem === 'symptom_triage')).toBe(true)
    })
  })

  describe('6. Periodic Review Scheduling & Reassessments', () => {
    it('computes review schedules with due dates and compliance status', async () => {
      const schedule = await ClinicalGovernanceService.getPeriodicReviewSchedule()
      expect(schedule.length).toBe(3)
      expect(schedule[0]).toHaveProperty('reviewCycleMonths', 12)
      expect(schedule[0]).toHaveProperty('nextReviewDueDate')
      expect(typeof schedule[0].daysRemainingOrOverdue).toBe('number')
    })

    it('extends review due date upon successful continued_use outcome', async () => {
      const schedule = await ClinicalGovernanceService.getPeriodicReviewSchedule()
      const item = schedule[0]

      const updated = await ClinicalGovernanceService.recordReviewOutcome(
        item.versionId,
        'continued_use',
        'Annual literature review confirms stability of PLCOm2012 parameters.',
        { id: 'usr-chair', name: 'Prof. Dr. Farhana Ahmed', role: 'chair' }
      )

      expect(updated.lastReviewedAt).toBeDefined()
      expect(new Date(updated.nextReviewDueDate).getTime()).toBeGreaterThan(Date.now())
    })
  })

  describe('7. Immutable Append-Only Audit Trail & Dashboard', () => {
    it('logs immutable audit events for all governance actions', async () => {
      const events = await ClinicalGovernanceService.getAuditEvents()
      expect(events.length).toBeGreaterThan(0)

      const recent = events[0]
      expect(recent).toHaveProperty('id')
      expect(recent).toHaveProperty('entityType')
      expect(recent).toHaveProperty('action')
      expect(recent).toHaveProperty('actorName')
      expect(recent).toHaveProperty('justification')
      expect(recent).toHaveProperty('createdAt')
    })

    it('aggregates governance dashboard metrics accurately', async () => {
      const summary = await ClinicalGovernanceService.getDashboardSummary()
      expect(summary.totalMethodologies).toBe(3)
      expect(summary.activeMethodologies).toBe(3)
      expect(summary.totalBoardMembers).toBe(5)
      expect(summary.verifiedMembers).toBe(5)
      expect(summary.boardName).toContain('Clinical Advisory Board')
      expect(summary.jurisdiction).toBe('Bangladesh')
    })
  })
})


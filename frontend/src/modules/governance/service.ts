/**
 * Phase 1.24: Clinical Governance Service
 *
 * Implements Clinical Advisory Board (CAB) governance, Methodology Registry,
 * SemVer and parameter versioning, append-only approval lifecycles,
 * clinician override audit tracking, periodic review workflows,
 * and operational CDSS safety checks.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import {
  GovernanceBody,
  GovernanceMember,
  GovernanceMeeting,
  ClinicalMethodology,
  ClinicalMethodologyVersion,
  ClinicalRuleVersion,
  ClinicalRecommendation,
  ClinicianOverrideRecord,
  GovernanceAuditEvent,
  PeriodicReviewItem,
  GovernanceDashboardSummary,
  GovernanceCheckResult,
  GovernanceLifecycleStatus,
  GovernanceRole,
  OverrideReasonCategory,
  AIModelValidationRecord,
  CABModelDecision,
  ModelXAIProfile,
} from './types'
import {
  BASELINE_CAB_BODY,
  BASELINE_CAB_MEMBERS,
  BASELINE_CAB_MEETINGS,
  BASELINE_METHODOLOGIES,
  BASELINE_METHODOLOGY_VERSIONS,
  BASELINE_RECOMMENDATIONS,
  BASELINE_AI_VALIDATION_RECORDS,
  BASELINE_XAI_PROFILES,
} from './methodology-registry'

function getAdminSupabaseSafe() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

// In-memory fallback stores to guarantee fast, deterministic behavior and test reliability
let inMemoryBody: GovernanceBody = { ...BASELINE_CAB_BODY }
let inMemoryMembers: GovernanceMember[] = [...BASELINE_CAB_MEMBERS]
let inMemoryMeetings: GovernanceMeeting[] = [...BASELINE_CAB_MEETINGS]
let inMemoryMethodologies: ClinicalMethodology[] = [...BASELINE_METHODOLOGIES]
let inMemoryVersions: ClinicalMethodologyVersion[] = [...BASELINE_METHODOLOGY_VERSIONS]
let inMemoryRecommendations: ClinicalRecommendation[] = [...BASELINE_RECOMMENDATIONS]
let inMemoryOverrides: ClinicianOverrideRecord[] = [
  {
    id: 'ovr-seed-01',
    assessmentId: 'asm-demo-seed-01',
    patientId: 'pat-seed-01',
    clinicianId: 'usr-clinician-01',
    clinicianName: 'Dr. Tanvir Hasan, MBBS, MD',
    facilityId: 'fac-dhaka-01',
    engineSubsystem: 'symptom_triage',
    methodologyVersionId: 'ver-nice-ng12-2023-1',
    automatedResult: {
      urgencyTier: 'routine',
      recommendedWindow: '4-6 weeks',
      recommendedAction: 'Standard primary care sputum examination and follow-up',
    },
    overriddenResult: {
      urgencyTier: 'urgent_referral',
      recommendedWindow: '2 weeks',
      recommendedAction: 'Expedited CT Thorax and immediate pulmonologist consult',
    },
    overrideReasonCategory: 'diagnostic_discordance',
    overrideRationale:
      'Patient reports subacute weight loss of 7kg over 6 weeks with unilateral chest dullness on percussion. Clinical index of suspicion warrants urgent direct imaging despite subtle initial cough presentation.',
    createdAt: '2026-01-15T09:45:00.000Z',
  },
]
let inMemoryAuditEvents: GovernanceAuditEvent[] = [
  {
    id: 'aud-seed-01',
    entityType: 'board',
    entityId: 'cab-bd-central-001',
    action: 'created',
    previousState: null,
    newState: { status: 'active', jurisdiction: 'Bangladesh' },
    actorId: 'sys-init',
    actorName: 'Clinical Governance Secretariat',
    actorRole: 'Clinical Governance Authority',
    justification: 'Establishment of National Clinical Advisory Board under Thoracic Oncology Mandate.',
    meetingReference: 'CAB-2025-Q1',
    createdAt: '2025-01-15T00:00:00.000Z',
  },
  {
    id: 'aud-seed-02',
    entityType: 'methodology',
    entityId: 'meth-plcom2012',
    action: 'approved',
    previousState: { status: 'under_clinical_review' },
    newState: { status: 'active', version: '2012.1' },
    actorId: 'usr-cab-chair-01',
    actorName: 'Prof. Dr. Farhana Ahmed',
    actorRole: 'chair',
    justification: 'Formal ratification following biostatistical calibration review.',
    meetingReference: 'CAB-2025-Q1',
    createdAt: '2025-02-10T12:30:00.000Z',
  },
]
let inMemoryValidationRecords: AIModelValidationRecord[] = JSON.parse(
  JSON.stringify(BASELINE_AI_VALIDATION_RECORDS)
)
let inMemoryXAIProfiles: ModelXAIProfile[] = JSON.parse(
  JSON.stringify(BASELINE_XAI_PROFILES)
)

export class ClinicalGovernanceService {
  // ============================================================================
  // CAB MANAGEMENT
  // ============================================================================

  static async getBoardProfile(): Promise<GovernanceBody> {
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      const { data, error } = await supabase
        .from('clinical_governance_bodies')
        .select('*')
        .eq('status', 'active')
        .limit(1)
        .single()
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          jurisdiction: data.jurisdiction,
          charterSummary: data.charter_summary,
          establishedAt: data.established_at,
          status: data.status as 'active' | 'inactive' | 'dissolved',
          metadata: data.metadata as Record<string, unknown>,
        }
      }
    }
    return inMemoryBody
  }

  static async getMembers(): Promise<GovernanceMember[]> {
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      const { data, error } = await supabase
        .from('clinical_governance_members')
        .select('*')
        .order('role', { ascending: true })
      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          bodyId: d.body_id,
          userId: d.user_id,
          fullName: d.full_name,
          role: d.role as GovernanceRole,
          specialization: d.specialization,
          medicalRegistrationNumber: d.medical_registration_number,
          credentialsVerified: d.credentials_verified,
          verifiedBy: d.verified_by,
          verifiedAt: d.verified_at,
          institutionalAffiliation: d.institutional_affiliation,
          termStartDate: d.term_start_date,
          termEndDate: d.term_end_date,
          conflictOfInterestDeclaration: d.conflict_of_interest_declaration,
          hasActiveConflict: d.has_active_conflict,
          status: d.status as GovernanceMember['status'],
        }))
      }
    }
    return [...inMemoryMembers]
  }

  static async getMember(id: string): Promise<GovernanceMember | null> {
    const members = await this.getMembers()
    return members.find((m) => m.id === id || m.userId === id) || null
  }

  static async verifyMemberCredentials(
    memberId: string,
    verifiedById: string,
    verifierRole: string = 'chair'
  ): Promise<GovernanceMember> {
    if (!['chair', 'vice_chair', 'secretary'].includes(verifierRole)) {
      throw new Error('Unauthorized: Only CAB executive officers can verify member credentials.')
    }

    const member = inMemoryMembers.find((m) => m.id === memberId)
    if (!member) {
      throw new Error(`Governance member ${memberId} not found`)
    }

    member.credentialsVerified = true
    member.verifiedBy = verifiedById
    member.verifiedAt = new Date().toISOString()

    await this.logAuditEvent({
      entityType: 'member',
      entityId: memberId,
      action: 'credential_verified',
      previousState: { credentialsVerified: false },
      newState: { credentialsVerified: true, verifiedBy: verifiedById },
      actorId: verifiedById,
      actorName: 'CAB Executive Officer',
      actorRole: verifierRole,
      justification: `Medical qualification and registration number verified against regulatory database.`,
    })

    return member
  }

  static async recordConflictDeclaration(
    memberId: string,
    declaration: string,
    hasActiveConflict: boolean,
    actorId: string
  ): Promise<GovernanceMember> {
    const member = inMemoryMembers.find((m) => m.id === memberId)
    if (!member) {
      throw new Error(`Governance member ${memberId} not found`)
    }

    const prev = {
      conflictOfInterestDeclaration: member.conflictOfInterestDeclaration,
      hasActiveConflict: member.hasActiveConflict,
    }

    member.conflictOfInterestDeclaration = declaration
    member.hasActiveConflict = hasActiveConflict

    await this.logAuditEvent({
      entityType: 'member',
      entityId: memberId,
      action: 'reviewed',
      previousState: prev,
      newState: { conflictOfInterestDeclaration: declaration, hasActiveConflict },
      actorId,
      actorName: member.fullName,
      actorRole: member.role,
      justification: 'Annual conflict of interest disclosure submission.',
    })

    return member
  }

  static async getMeetings(): Promise<GovernanceMeeting[]> {
    return [...inMemoryMeetings]
  }

  // ============================================================================
  // METHODOLOGY & VERSION REGISTRY
  // ============================================================================

  static async getMethodologies(): Promise<ClinicalMethodology[]> {
    const methodologies = [...inMemoryMethodologies]
    return methodologies.map((m) => {
      const versions = inMemoryVersions.filter((v) => v.methodologyId === m.id)
      return {
        ...m,
        versions,
      }
    })
  }

  static async getMethodology(idOrCode: string): Promise<ClinicalMethodology | null> {
    const all = await this.getMethodologies()
    return all.find((m) => m.id === idOrCode || m.code === idOrCode) || null
  }

  static async getMethodologyVersions(methodologyId: string): Promise<ClinicalMethodologyVersion[]> {
    return inMemoryVersions.filter((v) => v.methodologyId === methodologyId)
  }

  static async getVersion(versionId: string): Promise<ClinicalMethodologyVersion | null> {
    return inMemoryVersions.find((v) => v.id === versionId) || null
  }

  static async createVersion(
    data: {
      methodologyId: string
      versionString: string
      semver: string
      changelog: string
      ruleDefinitions: Record<string, unknown>
      rules?: Omit<ClinicalRuleVersion, 'id' | 'methodologyVersionId' | 'createdAt'>[]
    },
    actor: { id: string; name: string; role: GovernanceRole }
  ): Promise<ClinicalMethodologyVersion> {
    const methodology = await this.getMethodology(data.methodologyId)
    if (!methodology) {
      throw new Error(`Methodology ${data.methodologyId} not found`)
    }

    const exists = inMemoryVersions.find(
      (v) => v.methodologyId === data.methodologyId && v.versionString === data.versionString
    )
    if (exists) {
      throw new Error(`Version ${data.versionString} already exists for methodology ${data.methodologyId}`)
    }

    const versionId = `ver-${methodology.code}-${data.versionString.replace(/\./g, '-')}-${Date.now().toString(36)}`
    const nowIso = new Date().toISOString()
    const reviewDate = new Date()
    reviewDate.setFullYear(reviewDate.getFullYear() + 1)

    const rules: ClinicalRuleVersion[] = (data.rules || []).map((r, idx) => ({
      id: `rule-${versionId}-${idx + 1}`,
      methodologyVersionId: versionId,
      ruleIdentifier: r.ruleIdentifier,
      ruleName: r.ruleName,
      parameterThresholds: r.parameterThresholds,
      logicDescription: r.logicDescription,
      isMandatorySafetyRule: r.isMandatorySafetyRule,
      createdAt: nowIso,
    }))

    const newVersion: ClinicalMethodologyVersion = {
      id: versionId,
      methodologyId: data.methodologyId,
      versionString: data.versionString,
      semver: data.semver,
      status: 'draft',
      changelog: data.changelog,
      ruleDefinitions: data.ruleDefinitions,
      rules,
      reviewCycleMonths: 12,
      nextReviewDueDate: reviewDate.toISOString().split('T')[0],
      createdAt: nowIso,
      updatedAt: nowIso,
    }

    inMemoryVersions.push(newVersion)

    await this.logAuditEvent({
      entityType: 'version',
      entityId: versionId,
      action: 'created',
      previousState: null,
      newState: { ...newVersion },
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      justification: `Initial draft creation of methodology version ${data.versionString}.`,
    })

    return newVersion
  }

  // ============================================================================
  // METHODOLOGY LIFECYCLE STATE TRANSITIONS
  // ============================================================================

  static async transitionLifecycle(
    versionId: string,
    targetStatus: GovernanceLifecycleStatus,
    actor: { id: string; name: string; role: string },
    justification: string,
    meetingReference?: string
  ): Promise<ClinicalMethodologyVersion> {
    const version = inMemoryVersions.find((v) => v.id === versionId)
    if (!version) {
      throw new Error(`Methodology version ${versionId} not found`)
    }

    const methodology = inMemoryMethodologies.find((m) => m.id === version.methodologyId)
    if (!methodology) {
      throw new Error(`Methodology parent not found`)
    }

    const currentStatus = version.status

    // Valid transitions state machine
    const validTransitions: Record<GovernanceLifecycleStatus, GovernanceLifecycleStatus[]> = {
      draft: ['submitted_for_review', 'rejected'],
      submitted_for_review: ['under_clinical_review', 'draft', 'rejected'],
      under_clinical_review: ['revisions_requested', 'awaiting_formal_approval', 'rejected'],
      revisions_requested: ['under_clinical_review', 'draft'],
      awaiting_formal_approval: ['approved', 'revisions_requested', 'rejected'],
      approved: ['active', 'suspended', 'deprecated'],
      active: ['suspended', 'deprecated'],
      suspended: ['active', 'deprecated'],
      deprecated: [],
      rejected: ['draft'],
    }

    if (!validTransitions[currentStatus]?.includes(targetStatus)) {
      throw new Error(
        `Invalid lifecycle transition from '${currentStatus}' to '${targetStatus}'. Allowed: [${validTransitions[currentStatus]?.join(', ')}]`
      )
    }

    // Role-based clinical authority checks:
    // Non-clinicians or software administrators cannot unilaterally approve or activate clinical rules!
    const clinicalApprovalRoles = ['chair', 'vice_chair', 'clinical_reviewer']
    if (
      ['approved', 'active'].includes(targetStatus) &&
      !clinicalApprovalRoles.includes(actor.role)
    ) {
      throw new Error(
        `Unauthorized: Only verified Clinical Advisory Board authorities (chair, vice_chair, clinical_reviewer) can approve or activate clinical methodologies. Actor role: '${actor.role}'`
      )
    }

    version.status = targetStatus
    version.updatedAt = new Date().toISOString()

    if (targetStatus === 'approved') {
      version.approvedByMemberId = actor.id
      version.approvedByMemberName = actor.name
      version.approvedAt = new Date().toISOString()
      version.approvalNotes = justification
    }

    if (targetStatus === 'active') {
      // Set as parent methodology's active version
      methodology.activeVersionId = version.id
      methodology.activeVersionString = version.versionString
      methodology.governanceStatus = 'active'
      methodology.updatedAt = new Date().toISOString()
    } else if (targetStatus === 'suspended' && methodology.activeVersionId === version.id) {
      methodology.governanceStatus = 'suspended'
      methodology.updatedAt = new Date().toISOString()
    } else if (targetStatus === 'deprecated' && methodology.activeVersionId === version.id) {
      methodology.governanceStatus = 'deprecated'
      methodology.updatedAt = new Date().toISOString()
    }

    let actionType: GovernanceAuditEvent['action'] = 'status_changed'
    if (targetStatus === 'approved') actionType = 'approved'
    else if (targetStatus === 'active') actionType = 'activated'
    else if (targetStatus === 'suspended') actionType = 'suspended'
    else if (targetStatus === 'deprecated') actionType = 'deprecated'
    else if (targetStatus === 'rejected') actionType = 'rejected'

    await this.logAuditEvent({
      entityType: 'version',
      entityId: version.id,
      action: actionType,
      previousState: { status: currentStatus },
      newState: { status: targetStatus, activeVersionId: methodology.activeVersionId },
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      justification,
      meetingReference,
    })

    return version
  }

  // ============================================================================
  // OPERATIONAL ENGINE CDSS GOVERNANCE ASSERTIONS
  // ============================================================================

  /**
   * Called by Clinical Assessment Engines (RiskEstimation, ScreeningEligibility, SymptomTriage)
   * to verify that a methodology & rule version is officially sanctioned and active.
   * If not active, the caller must pause execution and present a transparent governance notice.
   */
  static assertMethodologyActive(
    methodologyCode: string,
    versionString: string
  ): GovernanceCheckResult {
    const methodology = inMemoryMethodologies.find((m) => m.code === methodologyCode)
    if (!methodology) {
      return {
        allowed: false,
        methodologyCode,
        versionString,
        lifecycleStatus: 'rejected',
        notice: `Clinical methodology '${methodologyCode}' is not registered in the Clinical Governance Registry. Execution halted for patient safety.`,
      }
    }

    if (methodology.governanceStatus === 'suspended') {
      return {
        allowed: false,
        methodologyCode,
        versionString,
        lifecycleStatus: 'suspended',
        notice: `Methodology '${methodology.name}' is temporarily suspended by the Clinical Advisory Board. CDSS calculations are paused. Red-flag emergency indicators remain active.`,
        isEmergencyOverrideAllowed: true,
      }
    }

    if (methodology.governanceStatus === 'deprecated') {
      return {
        allowed: false,
        methodologyCode,
        versionString,
        lifecycleStatus: 'deprecated',
        notice: `Methodology '${methodology.name}' has been deprecated and cannot be used for new clinical determinations.`,
      }
    }

    const version = inMemoryVersions.find(
      (v) => v.methodologyId === methodology.id && v.versionString === versionString
    )

    if (!version) {
      return {
        allowed: false,
        methodologyCode,
        versionString,
        lifecycleStatus: 'rejected',
        notice: `Version '${versionString}' for methodology '${methodology.name}' is unapproved. Execution halted.`,
      }
    }

    if (version.status !== 'active') {
      return {
        allowed: false,
        methodologyCode,
        versionString,
        lifecycleStatus: version.status,
        notice: `Version '${versionString}' is currently in '${version.status}' state and is not approved for live clinical decisions.`,
      }
    }

    return {
      allowed: true,
      methodologyCode,
      versionString,
      lifecycleStatus: 'active',
    }
  }

  // ============================================================================
  // CLINICIAN OVERRIDE TRACKING
  // ============================================================================

  static async recordClinicianOverride(data: {
    assessmentId: string
    patientId: string
    clinicianId: string
    clinicianName: string
    facilityId?: string | null
    engineSubsystem: ClinicianOverrideRecord['engineSubsystem']
    methodologyVersionId?: string | null
    automatedResult: Record<string, unknown>
    overriddenResult: Record<string, unknown>
    overrideReasonCategory: OverrideReasonCategory
    overrideRationale: string
  }): Promise<ClinicianOverrideRecord> {
    if (!data.overrideRationale || data.overrideRationale.trim().length < 10) {
      throw new Error('Mandatory clinical rationale must be at least 10 characters long.')
    }

    const overrideRecord: ClinicianOverrideRecord = {
      id: `ovr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      assessmentId: data.assessmentId,
      patientId: data.patientId,
      clinicianId: data.clinicianId,
      clinicianName: data.clinicianName,
      facilityId: data.facilityId,
      engineSubsystem: data.engineSubsystem,
      methodologyVersionId: data.methodologyVersionId,
      automatedResult: data.automatedResult,
      overriddenResult: data.overriddenResult,
      overrideReasonCategory: data.overrideReasonCategory,
      overrideRationale: data.overrideRationale.trim(),
      createdAt: new Date().toISOString(),
    }

    inMemoryOverrides.unshift(overrideRecord)

    await this.logAuditEvent({
      entityType: 'override_review',
      entityId: overrideRecord.id,
      action: 'created',
      previousState: null,
      newState: {
        assessmentId: overrideRecord.assessmentId,
        category: overrideRecord.overrideReasonCategory,
        subsystem: overrideRecord.engineSubsystem,
      },
      actorId: data.clinicianId,
      actorName: data.clinicianName,
      actorRole: 'clinician',
      justification: `Clinician override recorded: ${data.overrideReasonCategory}`,
    })

    return overrideRecord
  }

  static async getClinicianOverrides(filters?: {
    engineSubsystem?: string
    overrideReasonCategory?: string
  }): Promise<ClinicianOverrideRecord[]> {
    let result = [...inMemoryOverrides]
    if (filters?.engineSubsystem) {
      result = result.filter((r) => r.engineSubsystem === filters.engineSubsystem)
    }
    if (filters?.overrideReasonCategory) {
      result = result.filter((r) => r.overrideReasonCategory === filters.overrideReasonCategory)
    }
    return result
  }

  // ============================================================================
  // PERIODIC REVIEW SCHEDULING
  // ============================================================================

  static readonly GOVERNANCE_BASE_TIMESTAMP = '2026-11-06T00:00:00.000Z'

  static async getPeriodicReviewSchedule(): Promise<PeriodicReviewItem[]> {
    const methodologies = await this.getMethodologies()
    const now = new Date(this.GOVERNANCE_BASE_TIMESTAMP)

    const items: PeriodicReviewItem[] = []

    for (const m of methodologies) {
      const activeVersion = m.versions?.find((v) => v.id === m.activeVersionId)
      if (activeVersion) {
        const dueDate = new Date(activeVersion.nextReviewDueDate)
        const diffMs = dueDate.getTime() - now.getTime()
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

        items.push({
          methodologyId: m.id,
          methodologyCode: m.code,
          methodologyName: m.name,
          versionId: activeVersion.id,
          versionString: activeVersion.versionString,
          status: activeVersion.status,
          reviewCycleMonths: activeVersion.reviewCycleMonths,
          lastReviewedAt: activeVersion.lastReviewedAt,
          nextReviewDueDate: activeVersion.nextReviewDueDate,
          isOverdue: diffDays < 0,
          daysRemainingOrOverdue: diffDays,
          assignedReviewerName: 'Prof. Dr. Farhana Ahmed',
        })
      }
    }

    return items.sort((a, b) => a.daysRemainingOrOverdue - b.daysRemainingOrOverdue)
  }

  static async recordReviewOutcome(
    versionId: string,
    outcome: 'continued_use' | 'revision_required' | 'suspended' | 'deprecated',
    notes: string,
    actor: { id: string; name: string; role: string }
  ): Promise<ClinicalMethodologyVersion> {
    const version = inMemoryVersions.find((v) => v.id === versionId)
    if (!version) {
      throw new Error(`Version ${versionId} not found`)
    }

    const now = new Date()
    version.lastReviewedAt = now.toISOString()

    if (outcome === 'continued_use') {
      const nextDue = new Date(now)
      nextDue.setMonth(nextDue.getMonth() + version.reviewCycleMonths)
      version.nextReviewDueDate = nextDue.toISOString().split('T')[0]
    } else if (outcome === 'suspended') {
      await this.transitionLifecycle(versionId, 'suspended', actor, notes)
    } else if (outcome === 'deprecated') {
      await this.transitionLifecycle(versionId, 'deprecated', actor, notes)
    }

    await this.logAuditEvent({
      entityType: 'version',
      entityId: version.id,
      action: 'reviewed',
      previousState: { lastReviewedAt: version.lastReviewedAt },
      newState: { outcome, nextReviewDueDate: version.nextReviewDueDate },
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      justification: notes,
    })

    return version
  }

  // ============================================================================
  // AUDIT EVENTS & DASHBOARD SUMMARY
  // ============================================================================

  static async getAuditEvents(): Promise<GovernanceAuditEvent[]> {
    return [...inMemoryAuditEvents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  static async logAuditEvent(event: Omit<GovernanceAuditEvent, 'id' | 'createdAt'>): Promise<GovernanceAuditEvent> {
    const newEvent: GovernanceAuditEvent = {
      id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      ...event,
    }
    inMemoryAuditEvents.unshift(newEvent)
    return newEvent
  }

  static async getRecommendations(): Promise<ClinicalRecommendation[]> {
    return [...inMemoryRecommendations]
  }

  static async getDashboardSummary(): Promise<GovernanceDashboardSummary> {
    const methodologies = await this.getMethodologies()
    const members = await this.getMembers()
    const meetings = await this.getMeetings()
    const overrides = await this.getClinicianOverrides()
    const reviewSchedule = await this.getPeriodicReviewSchedule()

    return {
      totalMethodologies: methodologies.length,
      activeMethodologies: methodologies.filter((m) => m.governanceStatus === 'active').length,
      underReviewMethodologies: methodologies.filter((m) => m.governanceStatus === 'under_review').length,
      suspendedMethodologies: methodologies.filter((m) => m.governanceStatus === 'suspended').length,
      totalBoardMembers: members.length,
      verifiedMembers: members.filter((m) => m.credentialsVerified).length,
      totalCompletedMeetings: meetings.filter((m) => m.status === 'completed').length,
      totalOverridesRecorded: overrides.length,
      overdueReviewsCount: reviewSchedule.filter((r) => r.isOverdue).length,
      boardName: BASELINE_CAB_BODY.name,
      jurisdiction: BASELINE_CAB_BODY.jurisdiction,
    }
  }

  // ============================================================================
  // Phase 2.3: AI/ML CLINICAL MODEL VALIDATION & CAB GOVERNANCE
  // ============================================================================

  /**
   * Returns all registered clinical AI model validation records
   */
  static async getModelValidationRecords(): Promise<AIModelValidationRecord[]> {
    return JSON.parse(JSON.stringify(inMemoryValidationRecords))
  }

  /**
   * Retrieves a single model validation record by record ID or model ID
   */
  static async getModelValidationRecordById(
    id: string
  ): Promise<AIModelValidationRecord | null> {
    const record = inMemoryValidationRecords.find(
      (r) => r.id === id || r.modelId === id
    )
    return record ? JSON.parse(JSON.stringify(record)) : null
  }

  /**
   * Registers or updates a clinical validation record
   */
  static async createOrUpdateValidationRecord(
    record: AIModelValidationRecord,
    actorId: string,
    actorRole: string
  ): Promise<AIModelValidationRecord> {
    const existingIndex = inMemoryValidationRecords.findIndex(
      (r) => r.id === record.id
    )
    const updatedRecord: AIModelValidationRecord = {
      ...record,
      updatedAt: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      inMemoryValidationRecords[existingIndex] = updatedRecord
    } else {
      inMemoryValidationRecords.push(updatedRecord)
    }

    await this.logAuditEvent({
      entityType: 'methodology',
      entityId: record.id,
      action: 'reviewed',
      previousState:
        existingIndex >= 0
          ? {
              status: inMemoryValidationRecords[existingIndex].validationStatus,
              tier: inMemoryValidationRecords[existingIndex].lifecycleTier,
            }
          : null,
      newState: { status: record.validationStatus, tier: record.lifecycleTier },
      actorId,
      actorName: 'Clinical Validation Authority',
      actorRole,
      justification: `Validation record updated for model ${record.modelName} (${record.modelVersion})`,
    })

    return JSON.parse(JSON.stringify(updatedRecord))
  }

  /**
   * Conducts a formal Clinical Advisory Board (CAB) review on an evaluated AI/ML model
   */
  static async conductCABModelReview(
    recordId: string,
    decision: CABModelDecision,
    rationale: string,
    conditions: string[] = [],
    reviewerMemberId: string
  ): Promise<AIModelValidationRecord> {
    const recordIndex = inMemoryValidationRecords.findIndex(
      (r) => r.id === recordId
    )
    if (recordIndex < 0) {
      throw new Error(`Validation record with ID "${recordId}" not found.`)
    }

    const reviewer = inMemoryMembers.find(
      (m) => m.id === reviewerMemberId || m.userId === reviewerMemberId
    )
    if (!reviewer) {
      throw new Error(
        `CAB Reviewer with ID "${reviewerMemberId}" is not a recognized Clinical Advisory Board member.`
      )
    }

    if (
      !['chair', 'vice_chair', 'clinical_reviewer', 'biostatistician'].includes(
        reviewer.role
      )
    ) {
      throw new Error(
        `CAB Member role "${reviewer.role}" is not authorized to submit clinical model review verdicts.`
      )
    }

    const record = inMemoryValidationRecords[recordIndex]
    const previousDecision = record.cabReviewDecision

    let newTier = record.lifecycleTier
    if (decision === 'approved_for_defined_use') {
      newTier = 'approved'
    } else if (decision === 'approved_subject_to_conditions') {
      newTier = 'validated'
    } else if (decision === 'rejected') {
      newTier = 'prohibited'
    }

    const updatedRecord: AIModelValidationRecord = {
      ...record,
      lifecycleTier: newTier,
      cabReviewDecision: {
        decision,
        reviewedAt: new Date().toISOString(),
        reviewedByMemberId: reviewer.id,
        reviewedByMemberName: `${reviewer.fullName} (${reviewer.role})`,
        conditionsOrRestrictions: conditions,
        clinicalRationale: rationale,
        nextReassessmentDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      },
      updatedAt: new Date().toISOString(),
    }

    inMemoryValidationRecords[recordIndex] = updatedRecord

    await this.logAuditEvent({
      entityType: 'methodology',
      entityId: record.id,
      action: decision === 'approved_for_defined_use' ? 'approved' : 'reviewed',
      previousState: previousDecision
        ? { decision: previousDecision.decision }
        : null,
      newState: { decision, tier: newTier, conditionsCount: conditions.length },
      actorId: reviewer.id,
      actorName: reviewer.fullName,
      actorRole: reviewer.role,
      justification: rationale,
    })

    return JSON.parse(JSON.stringify(updatedRecord))
  }

  /**
   * Attempts operational activation of an AI model into clinical decision-support workflows.
   * Strictly enforces clinical governance invariants.
   */
  static async attemptOperationalActivation(
    recordId: string,
    authorizedByUserId: string,
    userRole: string
  ): Promise<{ success: boolean; error?: string; record: AIModelValidationRecord }> {
    const recordIndex = inMemoryValidationRecords.findIndex(
      (r) => r.id === recordId
    )
    if (recordIndex < 0) {
      throw new Error(`Validation record with ID "${recordId}" not found.`)
    }

    const record = inMemoryValidationRecords[recordIndex]

    // Invariant 1: Must be formally approved by CAB
    if (
      !record.cabReviewDecision ||
      record.cabReviewDecision.decision !== 'approved_for_defined_use'
    ) {
      const err = `Operational activation blocked: Model "${record.modelName}" has not received formal CAB approval for defined clinical use (current decision: "${record.cabReviewDecision?.decision ?? 'none'}").`
      record.operationalActivation = {
        isActivated: false,
        activatedAt: null,
        activatedBy: null,
        activationBlockedReason: err,
      }
      return {
        success: false,
        error: err,
        record: JSON.parse(JSON.stringify(record)),
      }
    }

    // Invariant 2: Bangladesh-specific external validation data must be verified
    if (
      !record.bangladeshGeneralizability.evaluated ||
      !record.bangladeshGeneralizability.datasetAvailable
    ) {
      const err = `Operational activation blocked: Model "${record.modelName}" lacks validated Bangladesh-specific external data. Activation in Bangladesh clinical workflows is strictly prohibited.`
      record.operationalActivation = {
        isActivated: false,
        activatedAt: null,
        activatedBy: null,
        activationBlockedReason: err,
      }
      return {
        success: false,
        error: err,
        record: JSON.parse(JSON.stringify(record)),
      }
    }

    // Invariant 3: Only Executive Governance roles (Chair/Vice Chair) can authorize operational activation
    const authorizer = inMemoryMembers.find(
      (m) => m.id === authorizedByUserId || m.userId === authorizedByUserId
    )
    if (
      !authorizer ||
      !['chair', 'vice_chair'].includes(authorizer.role) ||
      !['chair', 'vice_chair', 'admin'].includes(userRole)
    ) {
      const err = `Operational activation blocked: User role "${userRole}" lacks executive governance authorization to operationalize clinical AI models.`
      record.operationalActivation = {
        isActivated: false,
        activatedAt: null,
        activatedBy: null,
        activationBlockedReason: err,
      }
      return {
        success: false,
        error: err,
        record: JSON.parse(JSON.stringify(record)),
      }
    }

    // Pass all invariants: Operational Activation
    record.lifecycleTier = 'operationally_activated'
    record.operationalActivation = {
      isActivated: true,
      activatedAt: new Date().toISOString(),
      activatedBy: authorizer.fullName,
      activationBlockedReason: null,
    }
    record.updatedAt = new Date().toISOString()

    inMemoryValidationRecords[recordIndex] = record

    await this.logAuditEvent({
      entityType: 'methodology',
      entityId: record.id,
      action: 'activated',
      previousState: { isActivated: false },
      newState: { isActivated: true, tier: 'operationally_activated' },
      actorId: authorizer.id,
      actorName: authorizer.fullName,
      actorRole: authorizer.role,
      justification: `Operational clinical activation authorized by CAB Executive.`,
    })

    return { success: true, record: JSON.parse(JSON.stringify(record)) }
  }

  // ============================================================================
  // Phase 2.4: EXPLAINABLE AI (XAI) CAPABILITIES & RETRIEVAL
  // ============================================================================

  /**
   * Returns all registered Explainable AI (XAI) profiles
   */
  static async getModelXAIProfiles(): Promise<ModelXAIProfile[]> {
    return JSON.parse(JSON.stringify(inMemoryXAIProfiles))
  }

  /**
   * Retrieves an XAI profile by model ID
   */
  static async getModelXAIProfileByModelId(
    modelId: string
  ): Promise<ModelXAIProfile | null> {
    const profile = inMemoryXAIProfiles.find(
      (p) => p.modelId === modelId || p.id === modelId
    )
    return profile ? JSON.parse(JSON.stringify(profile)) : null
  }

  /**
   * Registers or updates an XAI profile with clinical governance audit logging
   */
  static async createOrUpdateXAIProfile(
    profile: ModelXAIProfile,
    actorId: string,
    actorRole: string
  ): Promise<ModelXAIProfile> {
    const existingIndex = inMemoryXAIProfiles.findIndex(
      (p) => p.id === profile.id || p.modelId === profile.modelId
    )
    const updatedProfile: ModelXAIProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      inMemoryXAIProfiles[existingIndex] = updatedProfile
    } else {
      inMemoryXAIProfiles.push(updatedProfile)
    }

    await this.logAuditEvent({
      entityType: 'methodology',
      entityId: profile.id,
      action: 'reviewed',
      previousState:
        existingIndex >= 0
          ? {
              modelId: inMemoryXAIProfiles[existingIndex].modelId,
              explainers: inMemoryXAIProfiles[existingIndex].supportedExplainerTypes,
            }
          : null,
      newState: {
        modelId: profile.modelId,
        explainers: profile.supportedExplainerTypes,
        globalFeaturesCount: profile.globalFeatureImportance.length,
      },
      actorId,
      actorName: 'XAI Governance Engine',
      actorRole,
      justification: `Explainability profile registered for model ${profile.modelName} (${profile.modelVersion})`,
    })

    return JSON.parse(JSON.stringify(updatedProfile))
  }

  /**
   * Reset in-memory state for automated unit tests
   */
  static resetForTesting() {
    inMemoryBody = { ...BASELINE_CAB_BODY }
    inMemoryMembers = JSON.parse(JSON.stringify(BASELINE_CAB_MEMBERS))
    inMemoryMeetings = JSON.parse(JSON.stringify(BASELINE_CAB_MEETINGS))
    inMemoryMethodologies = JSON.parse(JSON.stringify(BASELINE_METHODOLOGIES))
    inMemoryVersions = JSON.parse(JSON.stringify(BASELINE_METHODOLOGY_VERSIONS))
    inMemoryRecommendations = JSON.parse(JSON.stringify(BASELINE_RECOMMENDATIONS))
    inMemoryValidationRecords = JSON.parse(
      JSON.stringify(BASELINE_AI_VALIDATION_RECORDS)
    )
    inMemoryXAIProfiles = JSON.parse(JSON.stringify(BASELINE_XAI_PROFILES))
    inMemoryOverrides = [
      {
        id: 'ovr-seed-01',
        assessmentId: 'asm-demo-seed-01',
        patientId: 'pat-seed-01',
        clinicianId: 'usr-clinician-01',
        clinicianName: 'Dr. Tanvir Hasan, MBBS, MD',
        facilityId: 'fac-dhaka-01',
        engineSubsystem: 'symptom_triage',
        methodologyVersionId: 'ver-nice-ng12-2023-1',
        automatedResult: {
          urgencyTier: 'routine',
          recommendedWindow: '4-6 weeks',
          recommendedAction: 'Standard primary care sputum examination and follow-up',
        },
        overriddenResult: {
          urgencyTier: 'urgent_referral',
          recommendedWindow: '2 weeks',
          recommendedAction: 'Expedited CT Thorax and immediate pulmonologist consult',
        },
        overrideReasonCategory: 'diagnostic_discordance',
        overrideRationale:
          'Patient reports subacute weight loss of 7kg over 6 weeks with unilateral chest dullness on percussion. Clinical index of suspicion warrants urgent direct imaging despite subtle initial cough presentation.',
        createdAt: '2026-01-15T09:45:00.000Z',
      },
    ]
    inMemoryAuditEvents = [
      {
        id: 'aud-seed-01',
        entityType: 'board',
        entityId: 'cab-bd-central-001',
        action: 'created',
        previousState: null,
        newState: { status: 'active', jurisdiction: 'Bangladesh' },
        actorId: 'sys-init',
        actorName: 'Clinical Governance Secretariat',
        actorRole: 'Clinical Governance Authority',
        justification: 'Establishment of National Clinical Advisory Board under Thoracic Oncology Mandate.',
        meetingReference: 'CAB-2025-Q1',
        createdAt: '2025-01-15T00:00:00.000Z',
      },
    ]
  }
}

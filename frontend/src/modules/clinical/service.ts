import { PatientService } from '@/modules/patients/service'
import { HealthRecordService } from '@/modules/health-records/service'
import { ClinicalGovernanceService } from '@/modules/governance/service'
import type {
  ClinicalReviewItem,
  ClinicalObservationItem,
  ClinicalDecisionItem,
  ClinicalDecisionAmendmentItem,
  ClinicalAlertItem,
  ClinicalFollowUpPlanItem,
  ClinicalActivityItem,
  ClinicalDashboardStats,
  ClinicalPatientSummary,
  AssessmentReviewSummary,
  ConsolidatedClinicalProfile,
  CreateClinicalReviewInput,
  DocumentClinicalDecisionInput,
  AmendClinicalDecisionInput,
  AcknowledgeClinicalAlertInput,
  CreateFollowUpPlanInput,
  UpdateFollowUpStatusInput,
} from './types'
import type {
  ClinicalReviewStatus,
  ClinicalAlertStatus,
  ClinicalAlertSeverity,
  ClinicalFollowUpStatus,
  AssessmentStatus,
} from '@/types/database'

// In-memory fallback stores for offline environments, mocked deployments, & unit tests
const fallbackReviews: Map<string, ClinicalReviewItem> = new Map()
const fallbackObservations: Map<string, ClinicalObservationItem[]> = new Map()
const fallbackDecisions: Map<string, ClinicalDecisionItem> = new Map()
const fallbackAmendments: Map<string, ClinicalDecisionAmendmentItem[]> = new Map()
const fallbackAlerts: Map<string, ClinicalAlertItem> = new Map()
const fallbackFollowUpPlans: Map<string, ClinicalFollowUpPlanItem> = new Map()
const fallbackActivities: ClinicalActivityItem[] = []
const fallbackAssessments: Map<string, AssessmentReviewSummary> = new Map()

// Default lead clinician for mock environments
export const DEFAULT_CLINICIAN_ID = 'usr-clinician-001'
export const DEFAULT_CLINICIAN_NAME = 'Prof. Dr. Farhana Ahmed, MBBS, FCPS (Pulmonology)'
export const DEFAULT_CLINICIAN_DESIGNATION = 'Senior Consultant Pulmonologist'
export const DEFAULT_FACILITY_ID = 'facility-dhaka-central'
export const DEFAULT_FACILITY_NAME = 'Dhaka Central Pulmonary Institute'

function seedBenchmarkClinicalData() {
  if (fallbackReviews.size > 0) return

  // Seed Assessment Review Summaries
  const asm1: AssessmentReviewSummary = {
    id: 'asm-rev-001',
    patientId: '11111111-1111-4111-a111-111111111111',
    patientCanonicalId: 'LGT-2026-8K2M7P',
    patientName: 'Md. Rafiqul Islam',
    assessmentType: 'lung_cancer_risk',
    status: 'submitted',
    initiatedAt: '2026-11-01T09:30:00Z',
    submittedAt: '2026-11-01T10:15:00Z',
    algorithmicCategory: 'Elevated Clinical Risk Tier (High)',
    algorithmicScore: 82,
    riskSummary: 'High risk driven by 35 pack-years smoking history and occupational exposure in shipyard.',
    isNonDiagnosticNoticeConfirmed: true,
    clinicalReviewStatus: 'under_review',
    hasClinicianDecision: false,
  }
  fallbackAssessments.set(asm1.id, asm1)

  const asm2: AssessmentReviewSummary = {
    id: 'asm-rev-002',
    patientId: '22222222-2222-4222-a222-222222222222',
    patientCanonicalId: 'LGT-2026-3N9P4X',
    patientName: 'Nasima Begum',
    assessmentType: 'symptom_triage',
    status: 'submitted',
    initiatedAt: '2026-11-02T11:00:00Z',
    submittedAt: '2026-11-02T11:20:00Z',
    algorithmicCategory: 'Priority Symptom Triage Tier (Urgent)',
    algorithmicScore: 74,
    riskSummary: 'Severe persistent productive cough with breathlessness in setting of high biomass exposure.',
    isNonDiagnosticNoticeConfirmed: true,
    clinicalReviewStatus: 'pending_review',
    hasClinicianDecision: false,
  }
  fallbackAssessments.set(asm2.id, asm2)

  const asm3: AssessmentReviewSummary = {
    id: 'asm-rev-003',
    patientId: '33333333-3333-4333-a333-333333333333',
    patientCanonicalId: 'LGT-2026-7V4Y9Q',
    patientName: 'Kamal Hossain',
    assessmentType: 'screening_eligibility',
    status: 'completed',
    initiatedAt: '2026-10-25T14:00:00Z',
    submittedAt: '2026-10-25T14:30:00Z',
    algorithmicCategory: 'Annual LDCT Screening Recommended',
    algorithmicScore: 68,
    riskSummary: 'Meets age criteria (50-80) with >20 pack-years smoking history, currently smoking.',
    isNonDiagnosticNoticeConfirmed: true,
    clinicalReviewStatus: 'reviewed',
    hasClinicianDecision: true,
    clinicianDecisionType: 'screening_recommended',
  }
  fallbackAssessments.set(asm3.id, asm3)

  // Seed Clinical Alerts
  const alert0: ClinicalAlertItem = {
    id: 'alt-000',
    patientId: '22222222-2222-4222-a222-222222222222',
    patientCanonicalId: 'LGT-2026-3N9P4X',
    patientName: 'Nasima Begum',
    patientNameBn: 'নাসিমা বেগম',
    facilityId: DEFAULT_FACILITY_ID,
    facilityName: DEFAULT_FACILITY_NAME,
    assessmentId: asm2.id,
    alertType: 'red_flag_symptom',
    severity: 'critical',
    title: 'Critical Clinical Red Flag: Severe Progressive Stridor',
    titleBn: 'জরুরি ক্লিনিক্যাল সতর্কতা: তীব্র স্ট্রাইডোর ও শ্বাসরোধ ঝুঁকি',
    description: 'Patient exhibits audible stridor on exertion with hoarseness exceeding 3 weeks. Urgent referral indicated.',
    descriptionBn: 'রোগীর মৃদু পরিশ্রমেও স্ট্রাইডোর ও ৩ সপ্তাহের বেশি সময় ধরে স্বরভঙ্গ উপস্থিত। অবিলম্বে বিশেষায়িত মূল্যায়ন প্রয়োজন।',
    source: 'automated_triage_engine',
    status: 'active',
    acknowledgedBy: null,
    acknowledgedByName: null,
    acknowledgedAt: null,
    resolutionNotes: null,
    resolvedBy: null,
    resolvedByName: null,
    resolvedAt: null,
    createdAt: '2026-11-01T08:00:00Z',
  }
  fallbackAlerts.set(alert0.id, alert0)

  const alert1: ClinicalAlertItem = {
    id: 'alt-001',
    patientId: '11111111-1111-4111-a111-111111111111',
    patientCanonicalId: 'LGT-2026-8K2M7P',
    patientName: 'Md. Rafiqul Islam',
    patientNameBn: 'মোঃ রফিকুল ইসলাম',
    facilityId: DEFAULT_FACILITY_ID,
    facilityName: DEFAULT_FACILITY_NAME,
    assessmentId: asm1.id,
    alertType: 'red_flag_symptom',
    severity: 'critical',
    title: 'Red-Flag Symptom: Hemoptysis (Blood in Sputum)',
    titleBn: 'জরুরি সতর্কতা: রক্তমিশ্রিত কফ (হেমোপটিসিস)',
    description: 'Patient reported coughing blood streaks daily for the past 3 weeks. Immediate diagnostic evaluation required.',
    descriptionBn: 'রোগী গত ৩ সপ্তাহ ধরে প্রতিদিন কফের সাথে রক্ত যাওয়ার কথা জানিয়েছেন। জরুরি ডায়াগনস্টিক মূল্যায়ন প্রয়োজন।',
    source: 'clinical_intake_symptom',
    status: 'active',
    acknowledgedBy: null,
    acknowledgedByName: null,
    acknowledgedAt: null,
    resolutionNotes: null,
    resolvedBy: null,
    resolvedByName: null,
    resolvedAt: null,
    createdAt: '2026-11-01T10:16:00Z',
  }
  fallbackAlerts.set(alert1.id, alert1)

  const alert2: ClinicalAlertItem = {
    id: 'alt-002',
    patientId: '22222222-2222-4222-a222-222222222222',
    patientCanonicalId: 'LGT-2026-3N9P4X',
    patientName: 'Nasima Begum',
    patientNameBn: 'নাসিমা বেগম',
    facilityId: DEFAULT_FACILITY_ID,
    facilityName: DEFAULT_FACILITY_NAME,
    assessmentId: asm2.id,
    alertType: 'assessment_warning',
    severity: 'high',
    title: 'Urgent Triage: High Symptom Burden with Chronic Biomass Exposure',
    titleBn: 'জরুরি ট্রায়াজ: ক্রনিক বায়োমাস ধোঁয়ার সংস্পর্শ সহ তীব্র শ্বাসকষ্ট',
    description: 'Severe exertional dyspnea (mMRC grade 3) and productive cough lasting over 8 weeks.',
    descriptionBn: '৮ সপ্তাহের বেশি সময় ধরে শ্বাসকষ্ট ও কফ। বিশেষজ্ঞ পর্যালোচনা প্রয়োজন।',
    source: 'automated_triage_engine',
    status: 'active',
    acknowledgedBy: null,
    acknowledgedByName: null,
    acknowledgedAt: null,
    resolutionNotes: null,
    resolvedBy: null,
    resolvedByName: null,
    resolvedAt: null,
    createdAt: '2026-11-02T11:22:00Z',
  }
  fallbackAlerts.set(alert2.id, alert2)

  const alert3: ClinicalAlertItem = {
    id: 'alt-003',
    patientId: '33333333-3333-4333-a333-333333333333',
    patientCanonicalId: 'LGT-2026-7V4Y9Q',
    patientName: 'Kamal Hossain',
    patientNameBn: 'কামাল হোসেন',
    facilityId: DEFAULT_FACILITY_ID,
    facilityName: DEFAULT_FACILITY_NAME,
    assessmentId: asm3.id,
    alertType: 'overdue_follow_up',
    severity: 'moderate',
    title: 'Scheduled Screening Consultation Review Due',
    titleBn: 'নির্ধারিত স্ক্রিনিং পরামর্শ পর্যালোচনা সময়োপযোগী',
    description: 'Patient due for pre-screening counseling and LDCT protocol scheduling.',
    descriptionBn: 'রোগীর লো-ডোজ সিটি স্ক্যান স্ক্রিনিং পূর্ববর্তী পরামর্শ পর্যালোচনা করা প্রয়োজন।',
    source: 'follow_up_engine',
    status: 'acknowledged',
    acknowledgedBy: DEFAULT_CLINICIAN_ID,
    acknowledgedByName: DEFAULT_CLINICIAN_NAME,
    acknowledgedAt: '2026-10-26T09:00:00Z',
    resolutionNotes: 'Patient contacted and scheduled for low-dose CT counseling session.',
    resolvedBy: null,
    resolvedByName: null,
    resolvedAt: null,
    createdAt: '2026-10-25T15:00:00Z',
  }
  fallbackAlerts.set(alert3.id, alert3)

  // Seed Clinical Reviews
  const rev1: ClinicalReviewItem = {
    id: 'rev-001',
    patientId: '11111111-1111-4111-a111-111111111111',
    patientCanonicalId: 'LGT-2026-8K2M7P',
    patientName: 'Md. Rafiqul Islam',
    patientNameBn: 'মোঃ রফিকুল ইসলাম',
    facilityId: DEFAULT_FACILITY_ID,
    facilityName: DEFAULT_FACILITY_NAME,
    clinicianId: DEFAULT_CLINICIAN_ID,
    clinicianName: DEFAULT_CLINICIAN_NAME,
    assessmentId: asm1.id,
    assessmentType: 'lung_cancer_risk',
    reviewStatus: 'under_review',
    reviewType: 'risk_evaluation',
    summary: 'Comprehensive clinical evaluation initiated following red-flag hemoptysis alert. Patient exhibits long-term smoking and occupational exposure.',
    missingInformationNotes: 'Baseline chest radiograph or low-dose chest CT imaging report is missing from record.',
    conflictingInformationNotes: 'Discrepancy in smoking cessation date between intake questionnaire and community health worker note.',
    verifiedInformationNotes: 'Hemoptysis onset and occupational exposure (shipyard welding without mask) verified with patient directly.',
    requestedInformation: 'Urgent chest radiography (PA and lateral views) and contrast-enhanced thorax CT.',
    closedAt: null,
    createdAt: '2026-11-01T11:00:00Z',
    updatedAt: '2026-11-01T11:30:00Z',
  }
  fallbackReviews.set(rev1.id, rev1)

  const obs1: ClinicalObservationItem = {
    id: 'obs-001',
    clinicalReviewId: rev1.id,
    patientId: rev1.patientId,
    clinicianId: DEFAULT_CLINICIAN_ID,
    clinicianName: DEFAULT_CLINICIAN_NAME,
    category: 'pulmonary_vitals',
    observationText: 'Bilateral expiratory wheezing noted on auscultation. Resting SpO2 is 95% on room air, pulse 84 bpm.',
    clinicalInterpretation: 'Signs of chronic airway limitation consistent with COPD overlap.',
    createdAt: '2026-11-01T11:15:00Z',
  }
  fallbackObservations.set(rev1.id, [obs1])

  const rev3: ClinicalReviewItem = {
    id: 'rev-003',
    patientId: '33333333-3333-4333-a333-333333333333',
    patientCanonicalId: 'LGT-2026-7V4Y9Q',
    patientName: 'Kamal Hossain',
    patientNameBn: 'কামাল হোসেন',
    facilityId: DEFAULT_FACILITY_ID,
    facilityName: DEFAULT_FACILITY_NAME,
    clinicianId: DEFAULT_CLINICIAN_ID,
    clinicianName: DEFAULT_CLINICIAN_NAME,
    assessmentId: asm3.id,
    assessmentType: 'screening_eligibility',
    reviewStatus: 'reviewed',
    reviewType: 'screening_eligibility',
    summary: 'Screening eligibility confirmed under national and international low-dose CT guidelines for high-risk smokers.',
    missingInformationNotes: null,
    conflictingInformationNotes: null,
    verifiedInformationNotes: '25 pack-years history verified. No acute respiratory symptoms or contraindications.',
    requestedInformation: null,
    closedAt: '2026-10-26T10:00:00Z',
    createdAt: '2026-10-25T16:00:00Z',
    updatedAt: '2026-10-26T10:00:00Z',
  }
  fallbackReviews.set(rev3.id, rev3)

  // Seed Clinical Decision for Kamal Hossain
  const dec3: ClinicalDecisionItem = {
    id: 'dec-003',
    clinicalReviewId: rev3.id,
    patientId: rev3.patientId,
    patientCanonicalId: rev3.patientCanonicalId,
    patientName: rev3.patientName,
    clinicianId: DEFAULT_CLINICIAN_ID,
    clinicianName: DEFAULT_CLINICIAN_NAME,
    clinicianDesignation: DEFAULT_CLINICIAN_DESIGNATION,
    decisionType: 'screening_recommended',
    rationale: 'Patient fulfills all criteria for LDCT lung cancer screening: age 52, 25 pack-years smoking history, asymptomatic. Shared decision-making conducted discussing benefits and radiation risk.',
    disagreementWithAutomatedOutput: false,
    disagreementReason: null,
    recommendedNextSteps: '1. Schedule low-dose helical computed tomography (LDCT).\n2. Enroll patient in smoking cessation clinic.\n3. Clinical follow-up after LDCT report is available.',
    referralTarget: 'Department of Radiology & Thoracic Imaging, Dhaka Central Pulmonary Institute',
    status: 'finalized',
    finalizedAt: '2026-10-26T10:15:00Z',
    createdAt: '2026-10-26T10:10:00Z',
    updatedAt: '2026-10-26T10:15:00Z',
  }
  fallbackDecisions.set(dec3.id, dec3)

  // Seed Follow-up Plan for Kamal Hossain
  const fp3: ClinicalFollowUpPlanItem = {
    id: 'fp-003',
    patientId: rev3.patientId,
    patientCanonicalId: rev3.patientCanonicalId,
    patientName: rev3.patientName,
    facilityId: DEFAULT_FACILITY_ID,
    facilityName: DEFAULT_FACILITY_NAME,
    clinicianId: DEFAULT_CLINICIAN_ID,
    clinicianName: DEFAULT_CLINICIAN_NAME,
    clinicalReviewId: rev3.id,
    instructions: 'Post-LDCT imaging follow-up and review of Lung-RADS score. Evaluate smoking cessation progress.',
    recommendedReviewDate: '2026-11-26',
    status: 'planned',
    notes: 'Coordinator to confirm appointment reminder 48 hours prior.',
    completedAt: null,
    createdAt: '2026-10-26T10:20:00Z',
    updatedAt: '2026-10-26T10:20:00Z',
  }
  fallbackFollowUpPlans.set(fp3.id, fp3)

  // Seed Initial Clinical Activities
  fallbackActivities.push(
    {
      id: 'act-001',
      clinicianId: DEFAULT_CLINICIAN_ID,
      clinicianName: DEFAULT_CLINICIAN_NAME,
      patientId: '11111111-1111-4111-a111-111111111111',
      patientCanonicalId: 'LGT-2026-8K2M7P',
      patientName: 'Md. Rafiqul Islam',
      facilityId: DEFAULT_FACILITY_ID,
      facilityName: DEFAULT_FACILITY_NAME,
      activityType: 'patient_record_reviewed',
      summary: 'Initiated clinical evaluation following critical hemoptysis alert.',
      summaryBn: 'জরুরি হেমোপটিসিস সতর্কতার প্রেক্ষিতে ক্লিনিকাল মূল্যায়ন শুরু করা হয়েছে।',
      createdAt: '2026-11-01T11:00:00Z',
    },
    {
      id: 'act-002',
      clinicianId: DEFAULT_CLINICIAN_ID,
      clinicianName: DEFAULT_CLINICIAN_NAME,
      patientId: '33333333-3333-4333-a333-333333333333',
      patientCanonicalId: 'LGT-2026-7V4Y9Q',
      patientName: 'Kamal Hossain',
      facilityId: DEFAULT_FACILITY_ID,
      facilityName: DEFAULT_FACILITY_NAME,
      activityType: 'decision_documented',
      summary: 'Finalized clinical decision: Recommended for Low-Dose CT (LDCT) Lung Cancer Screening.',
      summaryBn: 'ক্লিনিকাল সিদ্ধান্ত চূড়ান্ত করা হয়েছে: লো-ডোজ সিটি স্ক্রিনিংয়ের সুপারিশ করা হয়েছে।',
      createdAt: '2026-10-26T10:15:00Z',
    },
    {
      id: 'act-003',
      clinicianId: DEFAULT_CLINICIAN_ID,
      clinicianName: DEFAULT_CLINICIAN_NAME,
      patientId: '33333333-3333-4333-a333-333333333333',
      patientCanonicalId: 'LGT-2026-7V4Y9Q',
      patientName: 'Kamal Hossain',
      facilityId: DEFAULT_FACILITY_ID,
      facilityName: DEFAULT_FACILITY_NAME,
      activityType: 'followup_created',
      summary: 'Scheduled follow-up evaluation for post-imaging review on 2026-11-26.',
      summaryBn: '২৬ নভেম্বর ২০২৬ তারিখে পোস্ট-ইমেজিং ফলো-আপ পর্যালোচনা নির্ধারণ করা হয়েছে।',
      createdAt: '2026-10-26T10:20:00Z',
    }
  )
}

// Initialize seed data
seedBenchmarkClinicalData()

export class ClinicalService {
  /**
   * Aggregate Clinical Dashboard Statistics
   */
  static async getClinicalDashboardStats(
    clinicianId: string = DEFAULT_CLINICIAN_ID,
    facilityId?: string
  ): Promise<ClinicalDashboardStats> {
    void clinicianId
    void facilityId
    seedBenchmarkClinicalData()

    const activeAlerts = Array.from(fallbackAlerts.values()).filter(
      (a) => a.status === 'active' || a.status === 'acknowledged'
    )
    const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical')

    const pendingReviews = Array.from(fallbackReviews.values()).filter(
      (r) => r.reviewStatus === 'pending_review' || r.reviewStatus === 'under_review' || r.reviewStatus === 'info_required'
    )

    const followUpsDue = Array.from(fallbackFollowUpPlans.values()).filter(
      (f) => f.status === 'planned' || f.status === 'pending' || f.status === 'overdue'
    )

    const decisions = Array.from(fallbackDecisions.values())

    return {
      totalPatientsUnderCare: 128,
      pendingReviewsCount: pendingReviews.length,
      unresolvedAlertsCount: activeAlerts.length,
      criticalAlertsCount: criticalAlerts.length,
      followUpsDueCount: followUpsDue.length,
      completedReviewsThisMonth: 14,
      recentDecisionsCount: decisions.length,
    }
  }

  /**
   * Search and filter patients for the Clinical Patient Directory
   */
  static async searchClinicalPatients(options: {
    query?: string
    facilityId?: string
    reviewStatus?: ClinicalReviewStatus
    hasAlerts?: boolean
    page?: number
    limit?: number
  } = {}): Promise<{ patients: ClinicalPatientSummary[]; total: number; page: number; limit: number }> {
    seedBenchmarkClinicalData()
    const page = options.page || 1
    const limit = options.limit || 20

    const patientRes = await PatientService.searchPatients({
      query: options.query,
      facilityId: options.facilityId,
      limit: 100,
      offset: 0,
    })

    const summaries: ClinicalPatientSummary[] = []

    for (const p of patientRes.patients) {
      // Find active alerts for this patient
      const patientAlerts = Array.from(fallbackAlerts.values()).filter(
        (a) => a.patientId === p.id && (a.status === 'active' || a.status === 'acknowledged')
      )
      const hasCritical = patientAlerts.some((a) => a.severity === 'critical')

      if (options.hasAlerts && patientAlerts.length === 0) {
        continue
      }

      // Find review status
      const patientReviews = Array.from(fallbackReviews.values()).filter((r) => r.patientId === p.id)
      const latestReview = patientReviews[0]
      const currentReviewStatus: ClinicalReviewStatus = latestReview ? latestReview.reviewStatus : 'pending_review'

      if (options.reviewStatus && currentReviewStatus !== options.reviewStatus) {
        continue
      }

      // Find latest assessment
      const patientAssessments = Array.from(fallbackAssessments.values()).filter((a) => a.patientId === p.id)
      const latestAsm = patientAssessments[0]

      // Find follow-up
      const patientFollowUps = Array.from(fallbackFollowUpPlans.values()).filter((f) => f.patientId === p.id)
      const nextFollowUp = patientFollowUps[0]

      const birthYear = p.dateOfBirth ? parseInt(p.dateOfBirth.slice(0, 4), 10) : 1970
      const age = p.approximateAge || (2026 - birthYear)

      summaries.push({
        id: p.id,
        canonicalId: p.patientId,
        fullName: p.fullName,
        fullNameBn: null,
        dateOfBirth: p.dateOfBirth || null,
        age,
        gender: p.gender,
        primaryPhone: p.phoneNumber || '—',
        facilityId: p.primaryFacilityId,
        facilityName:
          p.primaryFacilityId === DEFAULT_FACILITY_ID ? DEFAULT_FACILITY_NAME : p.primaryFacilityId,
        facilityDistrict: p.addressDistrict || 'Dhaka',
        reviewStatus: currentReviewStatus,
        activeAlertsCount: patientAlerts.length,
        hasCriticalAlert: hasCritical,
        lastAssessmentType: latestAsm ? latestAsm.assessmentType : null,
        lastAssessmentDate: latestAsm ? latestAsm.submittedAt || latestAsm.initiatedAt : null,
        lastAssessmentStatus: latestAsm ? latestAsm.status : null,
        lastReviewDate: latestReview ? latestReview.updatedAt : null,
        nextFollowUpDate: nextFollowUp ? nextFollowUp.recommendedReviewDate : null,
        assignedClinicianName: DEFAULT_CLINICIAN_NAME,
      })
    }

    const start = (page - 1) * limit
    const paginated = summaries.slice(start, start + limit)

    return {
      patients: paginated,
      total: summaries.length,
      page,
      limit,
    }
  }

  /**
   * Fetch Consolidated 5-Part Clinical Profile for a Patient
   */
  static async getClinicalPatientProfile(patientId: string): Promise<ConsolidatedClinicalProfile | null> {
    seedBenchmarkClinicalData()

    const patient = await PatientService.getPatientById(patientId)
    if (!patient) return null

    let healthRecord = await HealthRecordService.getComprehensiveHealthRecord(patientId)
    if (!healthRecord) {
      // Fallback health record structure
      healthRecord = {
        patientId,
        medicalConditions: [],
        medications: [],
        allergies: [],
        smokingHistory: null,
        environmentalExposures: [],
        familyHistory: [],
        lifestyle: null,
        measurements: [],
        symptoms: [],
        reviews: [],
        lastUpdated: '2026-11-01T00:00:00Z',
      }
    }

    // Filter relevant patient records from fallback stores
    const patientReviews = Array.from(fallbackReviews.values()).filter((r) => r.patientId === patientId)
    const patientObservations: ClinicalObservationItem[] = []
    for (const r of patientReviews) {
      const obs = fallbackObservations.get(r.id) || []
      patientObservations.push(...obs)
    }

    const patientDecisions = Array.from(fallbackDecisions.values()).filter((d) => d.patientId === patientId)
    for (const d of patientDecisions) {
      d.amendments = fallbackAmendments.get(d.id) || []
    }

    const patientAlerts = Array.from(fallbackAlerts.values()).filter((a) => a.patientId === patientId)
    const patientFollowUps = Array.from(fallbackFollowUpPlans.values()).filter((f) => f.patientId === patientId)
    const patientAssessments = Array.from(fallbackAssessments.values()).filter((a) => a.patientId === patientId)

    // Calculate smoking pack years
    let packYears = 0
    if (healthRecord.smokingHistory) {
      if (healthRecord.smokingHistory.calculatedPackYears != null) {
        packYears = healthRecord.smokingHistory.calculatedPackYears
      } else {
        const spd = healthRecord.smokingHistory.cigarettesPerDay || 0
        const dur = healthRecord.smokingHistory.yearsSmoked || 0
        packYears = (spd / 20) * dur
      }
    }

    // Check critical symptoms
    const hasHemoptysis = healthRecord.symptoms.some(
      (s) => s.symptomName.toLowerCase().includes('hemoptysis') || s.symptomName.toLowerCase().includes('blood')
    )
    const hasUnexplainedWeightLoss = healthRecord.symptoms.some((s) =>
      s.symptomName.toLowerCase().includes('weight loss')
    )

    // Occupational vs environmental exposures
    const occupational = healthRecord.environmentalExposures.filter(
      (e) => e.exposureCategory === 'occupational'
    )
    const environmental = healthRecord.environmentalExposures.filter(
      (e) => e.exposureCategory !== 'occupational'
    )

    return {
      identity: {
        patient,
        primaryFacilityName:
          patient.primaryFacilityId === DEFAULT_FACILITY_ID
            ? DEFAULT_FACILITY_NAME
            : patient.primaryFacilityId,
        primaryFacilityDistrict: patient.addressDistrict || 'Dhaka',
        assignedClinicianName: DEFAULT_CLINICIAN_NAME,
        registrationDate: patient.createdAt,
      },
      medicalHistory: {
        conditions: healthRecord.medicalConditions,
        medications: healthRecord.medications,
        allergies: healthRecord.allergies,
        familyHistory: healthRecord.familyHistory,
      },
      lungHealthAndExposures: {
        smoking: healthRecord.smokingHistory,
        environmentalBiomass: environmental,
        occupationalExposures: occupational,
        symptoms: healthRecord.symptoms,
        vitalsAndMeasurements: healthRecord.measurements,
        hasHemoptysis,
        hasUnexplainedWeightLoss,
        packYearsCalculated: packYears,
      },
      assessmentHistory: patientAssessments,
      clinicalHistory: {
        reviews: patientReviews,
        observations: patientObservations,
        decisions: patientDecisions,
        alerts: patientAlerts,
        followUpPlans: patientFollowUps,
      },
      rawHealthRecord: healthRecord,
    }
  }

  /**
   * Record or Update a Clinical Review
   */
  static async recordClinicalReview(
    input: CreateClinicalReviewInput,
    clinicianId: string = DEFAULT_CLINICIAN_ID
  ): Promise<ClinicalReviewItem> {
    seedBenchmarkClinicalData()

    const reviewId = `rev-${Date.now()}`
    const patient = await PatientService.getPatientById(input.patientId)

    const newReview: ClinicalReviewItem = {
      id: reviewId,
      patientId: input.patientId,
      patientCanonicalId: patient?.patientId || 'LGT-UNKNOWN',
      patientName: patient?.fullName || 'Patient',
      facilityId: input.facilityId || DEFAULT_FACILITY_ID,
      facilityName: DEFAULT_FACILITY_NAME,
      clinicianId,
      clinicianName: DEFAULT_CLINICIAN_NAME,
      assessmentId: input.assessmentId || null,
      reviewStatus: input.reviewStatus,
      reviewType: input.reviewType,
      summary: input.summary,
      missingInformationNotes: input.missingInformationNotes || null,
      conflictingInformationNotes: input.conflictingInformationNotes || null,
      verifiedInformationNotes: input.verifiedInformationNotes || null,
      requestedInformation: input.requestedInformation || null,
      closedAt: input.reviewStatus === 'closed' || input.reviewStatus === 'reviewed' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    fallbackReviews.set(reviewId, newReview)

    if (input.observations && input.observations.length > 0) {
      const obsItems: ClinicalObservationItem[] = input.observations.map((obs, idx) => ({
        id: `obs-${Date.now()}-${idx}`,
        clinicalReviewId: reviewId,
        patientId: input.patientId,
        clinicianId,
        clinicianName: DEFAULT_CLINICIAN_NAME,
        category: obs.category,
        observationText: obs.observationText,
        clinicalInterpretation: obs.clinicalInterpretation || null,
        createdAt: new Date().toISOString(),
      }))
      fallbackObservations.set(reviewId, obsItems)
    }

    // Log Activity
    fallbackActivities.unshift({
      id: `act-${Date.now()}`,
      clinicianId,
      clinicianName: DEFAULT_CLINICIAN_NAME,
      patientId: input.patientId,
      patientCanonicalId: patient?.patientId,
      patientName: patient?.fullName,
      facilityId: input.facilityId || DEFAULT_FACILITY_ID,
      facilityName: DEFAULT_FACILITY_NAME,
      activityType: 'patient_record_reviewed',
      summary: `Completed clinical review: ${input.summary.slice(0, 80)}...`,
      summaryBn: `ক্লিনিকাল পর্যালোচনা সম্পন্ন করা হয়েছে।`,
      createdAt: new Date().toISOString(),
    })

    return newReview
  }

  /**
   * Document a Formal Clinical Decision
   */
  static async documentClinicalDecision(
    input: DocumentClinicalDecisionInput,
    clinicianId: string = DEFAULT_CLINICIAN_ID
  ): Promise<ClinicalDecisionItem> {
    seedBenchmarkClinicalData()

    const decisionId = `dec-${Date.now()}`
    const patient = await PatientService.getPatientById(input.patientId)

    const newDecision: ClinicalDecisionItem = {
      id: decisionId,
      clinicalReviewId: input.clinicalReviewId,
      patientId: input.patientId,
      patientCanonicalId: patient?.patientId || 'LGT-UNKNOWN',
      patientName: patient?.fullName || 'Patient',
      clinicianId,
      clinicianName: DEFAULT_CLINICIAN_NAME,
      clinicianDesignation: DEFAULT_CLINICIAN_DESIGNATION,
      decisionType: input.decisionType,
      rationale: input.rationale,
      disagreementWithAutomatedOutput: input.disagreementWithAutomatedOutput,
      disagreementReason: input.disagreementWithAutomatedOutput ? input.disagreementReason || null : null,
      recommendedNextSteps: input.recommendedNextSteps,
      referralTarget: input.referralTarget || null,
      status: input.status || 'finalized',
      finalizedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      amendments: [],
    }

    fallbackDecisions.set(decisionId, newDecision)

    // Phase 1.24: If clinician disagreed with automated CDSS output, record structured override in Clinical Governance
    if (input.disagreementWithAutomatedOutput && input.disagreementReason) {
      void ClinicalGovernanceService.recordClinicianOverride({
        assessmentId: input.clinicalReviewId,
        patientId: input.patientId,
        clinicianId,
        clinicianName: DEFAULT_CLINICIAN_NAME,
        facilityId: DEFAULT_FACILITY_ID,
        engineSubsystem: 'clinical_decision_support',
        automatedResult: { decisionType: 'automated_baseline_recommendation' },
        overriddenResult: { decisionType: input.decisionType, nextSteps: input.recommendedNextSteps },
        overrideReasonCategory: 'diagnostic_discordance',
        overrideRationale: input.disagreementReason,
      }).catch(() => null)
    }

    // Mark corresponding review as reviewed/closed
    const existingReview = fallbackReviews.get(input.clinicalReviewId)
    if (existingReview) {
      existingReview.reviewStatus = 'reviewed'
      existingReview.closedAt = new Date().toISOString()
      existingReview.updatedAt = new Date().toISOString()
    }

    // Log Activity
    fallbackActivities.unshift({
      id: `act-${Date.now()}`,
      clinicianId,
      clinicianName: DEFAULT_CLINICIAN_NAME,
      patientId: input.patientId,
      patientCanonicalId: patient?.patientId,
      patientName: patient?.fullName,
      facilityId: DEFAULT_FACILITY_ID,
      facilityName: DEFAULT_FACILITY_NAME,
      activityType: 'decision_documented',
      summary: `Documented clinical decision (${input.decisionType}): ${input.rationale.slice(0, 80)}...`,
      summaryBn: `ক্লিনিকাল সিদ্ধান্ত রেকর্ড করা হয়েছে।`,
      createdAt: new Date().toISOString(),
    })

    return newDecision
  }

  /**
   * Amend a Finalized Clinical Decision (Maintains Immutable Audit Trail)
   */
  static async amendClinicalDecision(
    input: AmendClinicalDecisionInput,
    clinicianId: string = DEFAULT_CLINICIAN_ID
  ): Promise<ClinicalDecisionItem> {
    seedBenchmarkClinicalData()

    const decision = fallbackDecisions.get(input.decisionId)
    if (!decision) {
      throw new Error(`Clinical decision with ID ${input.decisionId} not found`)
    }

    // Preserve previous content for immutable audit log
    const previousContent: Record<string, unknown> = {
      decisionType: decision.decisionType,
      rationale: decision.rationale,
      disagreementWithAutomatedOutput: decision.disagreementWithAutomatedOutput,
      disagreementReason: decision.disagreementReason,
      recommendedNextSteps: decision.recommendedNextSteps,
      referralTarget: decision.referralTarget,
      status: decision.status,
    }

    // Create amendment log
    const amendment: ClinicalDecisionAmendmentItem = {
      id: `amd-${Date.now()}`,
      clinicalDecisionId: decision.id,
      clinicianId,
      clinicianName: DEFAULT_CLINICIAN_NAME,
      amendmentReason: input.amendmentReason,
      previousContent,
      amendedContent: input.amendedContent,
      createdAt: new Date().toISOString(),
    }

    const currentAmendments = fallbackAmendments.get(decision.id) || []
    currentAmendments.push(amendment)
    fallbackAmendments.set(decision.id, currentAmendments)

    // Apply permitted amendments
    if (input.amendedContent.decisionType) decision.decisionType = input.amendedContent.decisionType
    if (input.amendedContent.rationale) decision.rationale = input.amendedContent.rationale
    if (input.amendedContent.recommendedNextSteps) decision.recommendedNextSteps = input.amendedContent.recommendedNextSteps
    if (input.amendedContent.referralTarget !== undefined) decision.referralTarget = input.amendedContent.referralTarget
    if (input.amendedContent.disagreementWithAutomatedOutput !== undefined) {
      decision.disagreementWithAutomatedOutput = input.amendedContent.disagreementWithAutomatedOutput
      decision.disagreementReason = input.amendedContent.disagreementReason || null
    }

    decision.status = 'amended'
    decision.updatedAt = new Date().toISOString()
    decision.amendments = currentAmendments

    // Log activity
    fallbackActivities.unshift({
      id: `act-${Date.now()}`,
      clinicianId,
      clinicianName: DEFAULT_CLINICIAN_NAME,
      patientId: decision.patientId,
      patientCanonicalId: decision.patientCanonicalId,
      patientName: decision.patientName,
      facilityId: DEFAULT_FACILITY_ID,
      facilityName: DEFAULT_FACILITY_NAME,
      activityType: 'decision_amended',
      summary: `Amended clinical decision for ${decision.patientName}: ${input.amendmentReason.slice(0, 80)}...`,
      summaryBn: `ক্লিনিকাল সিদ্ধান্ত সংশোধিত করা হয়েছে।`,
      createdAt: new Date().toISOString(),
    })

    return decision
  }

  /**
   * Get Clinical Alerts & Red-Flag Escalations
   */
  static async getClinicalAlerts(options: {
    patientId?: string
    facilityId?: string
    status?: ClinicalAlertStatus
    severity?: ClinicalAlertSeverity
  } = {}): Promise<ClinicalAlertItem[]> {
    seedBenchmarkClinicalData()

    let alerts = Array.from(fallbackAlerts.values())

    if (options.patientId) {
      alerts = alerts.filter((a) => a.patientId === options.patientId)
    }
    if (options.facilityId) {
      alerts = alerts.filter((a) => a.facilityId === options.facilityId)
    }
    if (options.status) {
      alerts = alerts.filter((a) => a.status === options.status)
    }
    if (options.severity) {
      alerts = alerts.filter((a) => a.severity === options.severity)
    }

    // Sort: critical first, then newest
    alerts.sort((a, b) => {
      const severityOrder: Record<ClinicalAlertSeverity, number> = {
        critical: 4,
        high: 3,
        moderate: 2,
        low: 1,
      }
      const diff = severityOrder[b.severity] - severityOrder[a.severity]
      if (diff !== 0) return diff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return alerts
  }

  /**
   * Acknowledge or Resolve a Clinical Alert
   */
  static async acknowledgeClinicalAlert(
    input: AcknowledgeClinicalAlertInput,
    clinicianId: string = DEFAULT_CLINICIAN_ID
  ): Promise<ClinicalAlertItem> {
    seedBenchmarkClinicalData()

    const alert = fallbackAlerts.get(input.alertId)
    if (!alert) {
      throw new Error(`Clinical alert with ID ${input.alertId} not found`)
    }

    if (input.markResolved) {
      alert.status = 'resolved'
      alert.resolvedBy = clinicianId
      alert.resolvedByName = DEFAULT_CLINICIAN_NAME
      alert.resolvedAt = new Date().toISOString()
      alert.resolutionNotes = input.resolutionNotes || 'Alert reviewed and resolved by clinician.'
    } else {
      alert.status = 'acknowledged'
      alert.acknowledgedBy = clinicianId
      alert.acknowledgedByName = DEFAULT_CLINICIAN_NAME
      alert.acknowledgedAt = new Date().toISOString()
      if (input.resolutionNotes) {
        alert.resolutionNotes = input.resolutionNotes
      }
    }

    // Log Activity
    fallbackActivities.unshift({
      id: `act-${Date.now()}`,
      clinicianId,
      clinicianName: DEFAULT_CLINICIAN_NAME,
      patientId: alert.patientId,
      patientCanonicalId: alert.patientCanonicalId,
      patientName: alert.patientName,
      facilityId: alert.facilityId,
      facilityName: alert.facilityName,
      activityType: alert.status === 'resolved' ? 'alert_resolved' : 'alert_acknowledged',
      summary: `${alert.status === 'resolved' ? 'Resolved' : 'Acknowledged'} alert: ${alert.title}`,
      summaryBn: `সতর্কতা পর্যালোচনা ও গ্রহণ করা হয়েছে।`,
      createdAt: new Date().toISOString(),
    })

    return alert
  }

  /**
   * Get Follow-up Plans
   */
  static async getFollowUpPlans(options: {
    patientId?: string
    facilityId?: string
    status?: ClinicalFollowUpStatus
  } = {}): Promise<ClinicalFollowUpPlanItem[]> {
    seedBenchmarkClinicalData()

    let plans = Array.from(fallbackFollowUpPlans.values())

    if (options.patientId) {
      plans = plans.filter((p) => p.patientId === options.patientId)
    }
    if (options.facilityId) {
      plans = plans.filter((p) => p.facilityId === options.facilityId)
    }
    if (options.status) {
      plans = plans.filter((p) => p.status === options.status)
    }

    // Sort by review date ascending
    plans.sort((a, b) => new Date(a.recommendedReviewDate).getTime() - new Date(b.recommendedReviewDate).getTime())

    return plans
  }

  /**
   * Create a Follow-up Plan
   */
  static async createFollowUpPlan(
    input: CreateFollowUpPlanInput,
    clinicianId: string = DEFAULT_CLINICIAN_ID
  ): Promise<ClinicalFollowUpPlanItem> {
    seedBenchmarkClinicalData()

    const planId = `fp-${Date.now()}`
    const patient = await PatientService.getPatientById(input.patientId)

    const newPlan: ClinicalFollowUpPlanItem = {
      id: planId,
      patientId: input.patientId,
      patientCanonicalId: patient?.patientId || 'LGT-UNKNOWN',
      patientName: patient?.fullName || 'Patient',
      facilityId: input.facilityId || DEFAULT_FACILITY_ID,
      facilityName: DEFAULT_FACILITY_NAME,
      clinicianId,
      clinicianName: DEFAULT_CLINICIAN_NAME,
      clinicalReviewId: input.clinicalReviewId || null,
      instructions: input.instructions,
      recommendedReviewDate: input.recommendedReviewDate,
      status: 'planned',
      notes: input.notes || null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    fallbackFollowUpPlans.set(planId, newPlan)

    // Log Activity
    fallbackActivities.unshift({
      id: `act-${Date.now()}`,
      clinicianId,
      clinicianName: DEFAULT_CLINICIAN_NAME,
      patientId: input.patientId,
      patientCanonicalId: patient?.patientId,
      patientName: patient?.fullName,
      facilityId: input.facilityId || DEFAULT_FACILITY_ID,
      facilityName: DEFAULT_FACILITY_NAME,
      activityType: 'followup_created',
      summary: `Created follow-up plan for ${newPlan.patientName} on ${input.recommendedReviewDate}`,
      summaryBn: `নতুন ফলো-আপ পরিকল্পনা তৈরি করা হয়েছে।`,
      createdAt: new Date().toISOString(),
    })

    return newPlan
  }

  /**
   * Update Follow-up Plan Status
   */
  static async updateFollowUpStatus(
    input: UpdateFollowUpStatusInput,
    clinicianId: string = DEFAULT_CLINICIAN_ID
  ): Promise<ClinicalFollowUpPlanItem> {
    seedBenchmarkClinicalData()

    const plan = fallbackFollowUpPlans.get(input.followUpId)
    if (!plan) {
      throw new Error(`Follow-up plan with ID ${input.followUpId} not found`)
    }

    plan.status = input.status
    if (input.status === 'completed') {
      plan.completedAt = new Date().toISOString()
    }
    if (input.notes) {
      plan.notes = input.notes
    }
    plan.updatedAt = new Date().toISOString()

    // Log Activity
    fallbackActivities.unshift({
      id: `act-${Date.now()}`,
      clinicianId,
      clinicianName: DEFAULT_CLINICIAN_NAME,
      patientId: plan.patientId,
      patientCanonicalId: plan.patientCanonicalId,
      patientName: plan.patientName,
      facilityId: plan.facilityId,
      facilityName: plan.facilityName,
      activityType: 'followup_updated',
      summary: `Updated follow-up status to ${input.status} for ${plan.patientName}`,
      summaryBn: `ফলো-আপের অবস্থা পরিবর্তন করা হয়েছে।`,
      createdAt: new Date().toISOString(),
    })

    return plan
  }

  /**
   * Get Chronological Clinical Activity Audit History
   */
  static async getClinicalActivities(options: {
    clinicianId?: string
    patientId?: string
    facilityId?: string
    limit?: number
  } = {}): Promise<ClinicalActivityItem[]> {
    seedBenchmarkClinicalData()

    let activities = [...fallbackActivities]

    if (options.clinicianId) {
      activities = activities.filter((a) => a.clinicianId === options.clinicianId)
    }
    if (options.patientId) {
      activities = activities.filter((a) => a.patientId === options.patientId)
    }
    if (options.facilityId) {
      activities = activities.filter((a) => a.facilityId === options.facilityId)
    }

    const limit = options.limit || 50
    return activities.slice(0, limit)
  }

  /**
   * Get Assessment Review Summaries
   */
  static async getAssessmentReviewSummaries(options: {
    patientId?: string
    facilityId?: string
    status?: AssessmentStatus
  } = {}): Promise<AssessmentReviewSummary[]> {
    seedBenchmarkClinicalData()

    let assessments = Array.from(fallbackAssessments.values())

    if (options.patientId) {
      assessments = assessments.filter((a) => a.patientId === options.patientId)
    }
    if (options.status) {
      assessments = assessments.filter((a) => a.status === options.status)
    }

    return assessments
  }
}

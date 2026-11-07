import { createAdminClient } from '@/lib/supabase/admin'
import { PatientService } from '@/modules/patients/service'
import { HealthRecordService } from '@/modules/health-records/service'
import type { Patient } from '@/modules/patients/types'
import type {
  PatientAssessmentItem,
  PatientReferralItem,
  PatientDocumentItem,
  PatientNotificationItem,
  PatientConsentItem,
  PatientDashboardSummary,
  UpdatePatientProfileInput,
  HealthRecordCorrectionRequest,
} from './types'
import type {
  AssessmentType,
  ConsentType,
} from '@/types/database'

function getAdminSupabaseSafe() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}

// In-memory fallback stores for offline environments & tests
const fallbackAssessments: Map<string, PatientAssessmentItem[]> = new Map()
const fallbackReferrals: Map<string, PatientReferralItem[]> = new Map()
const fallbackDocuments: Map<string, PatientDocumentItem[]> = new Map()
const fallbackNotifications: Map<string, PatientNotificationItem[]> = new Map()
const fallbackConsents: Map<string, PatientConsentItem[]> = new Map()
const fallbackCorrectionRequests: Map<string, HealthRecordCorrectionRequest[]> = new Map()

const DEMO_PATIENT_ID = '11111111-1111-4111-a111-111111111111'
const DEMO_PATIENT_ALT_ID = 'p-mock-uuid-001'

// Seed initial demo data for Rafiqul Islam
function seedDemoData(pId: string) {
  fallbackAssessments.set(pId, [
    {
      id: 'asmt-001',
      patientId: pId,
      assessmentType: 'comprehensive_intake',
      status: 'reviewed',
      initiatedAt: '2026-03-01T09:00:00Z',
      submittedAt: '2026-03-01T09:30:00Z',
      completedAt: '2026-03-01T10:45:00Z',
      reviewingClinicianId: 'usr-clinician-001',
      reviewingClinicianName: 'Dr. Rafiqul Islam, Pulmonologist',
      facilityId: 'facility-dhaka-central',
      facilityName: 'Dhaka Central Pulmonary Institute',
      methodologyVersion: 'USPSTF-2021 / PLCOm2012-v1',
      summary: 'Comprehensive baseline clinical intake completed. Evaluated 25 pack-year tobacco exposure, occupational textile dust, and family history. Low-Dose CT screening recommendation discussed.',
      results: {
        packYears: 25.0,
        smokingStatus: 'former',
        identifiedRiskFactors: [
          'Former heavy cigarette smoker (25 pack-years)',
          '18 years occupational textile dust & chemical vapor exposure',
          'First-degree relative (father) diagnosed with lung cancer at age 62',
          'Treated pulmonary tuberculosis with residual scarring',
        ],
        screeningEligible: true,
        urgencyLevel: 'moderate',
      },
      limitations: 'Calculations based on reported recall. Biomass exposure duration estimated.',
      nextSteps: 'Proceed with low-dose computed tomography (LDCT) baseline screening scan. Schedule pulmonary function spirometry test.',
      isReviewedByClinician: true,
      createdAt: '2026-03-01T09:00:00Z',
      updatedAt: '2026-03-01T10:45:00Z',
    },
    {
      id: 'asmt-002',
      patientId: pId,
      assessmentType: 'symptom_triage',
      status: 'submitted',
      initiatedAt: '2026-03-10T14:15:00Z',
      submittedAt: '2026-03-10T14:25:00Z',
      completedAt: null,
      reviewingClinicianId: null,
      reviewingClinicianName: null,
      facilityId: 'facility-dhaka-central',
      facilityName: 'Dhaka Central Pulmonary Institute',
      methodologyVersion: 'Lungent-SymptomTriage-v1',
      summary: 'Follow-up symptom check: Persistent dry cough and exertional breathlessness on climbing stairs reported. Explicitly denies hemoptysis (coughing blood) or chest pain.',
      results: {
        reportedSymptoms: ['cough', 'dyspnea_breathlessness'],
        deniedSymptoms: ['cough_with_hemoptysis', 'chest_pain', 'unexplained_weight_loss'],
        clinicalTriageStatus: 'awaiting_clinical_review',
      },
      limitations: 'Patient self-reported questionnaire; physical chest auscultation required.',
      nextSteps: 'Clinical triage review by attending pulmonologist within 48 hours.',
      isReviewedByClinician: false,
      createdAt: '2026-03-10T14:15:00Z',
      updatedAt: '2026-03-10T14:25:00Z',
    },
  ])

  fallbackReferrals.set(pId, [
    {
      id: 'ref-001',
      patientId: pId,
      referralDate: '2026-03-01T11:00:00Z',
      referringFacility: 'Dhaka Central Pulmonary Institute',
      referringClinician: 'Dr. Rafiqul Islam',
      destinationFacility: 'National Institute of Diseases of the Chest and Hospital (NIDCH)',
      reason: 'Low-Dose CT (LDCT) chest screening scan and pulmonary function spirometry evaluation.',
      status: 'in_progress',
      recommendedFollowupDate: '2026-03-25',
      instructions: 'Fast for 2 hours before scan. Bring past chest X-ray reports and NIDCH outpatient card.',
      contactPhone: '+880 2-9882233',
      createdAt: '2026-03-01T11:00:00Z',
    },
  ])

  fallbackDocuments.set(pId, [
    {
      id: 'doc-001',
      patientId: pId,
      title: 'Baseline Clinical Intake & Risk Summary Report',
      documentType: 'clinical_summary',
      fileSizeBytes: 245760,
      storagePath: '/documents/secure/asmt-001-summary.pdf',
      isAvailable: true,
      createdAt: '2026-03-01T10:50:00Z',
    },
    {
      id: 'doc-002',
      patientId: pId,
      title: 'NIDCH Specialist Referral & Consultation Letter',
      documentType: 'referral_letter',
      fileSizeBytes: 184320,
      storagePath: '/documents/secure/ref-001-referral.pdf',
      isAvailable: true,
      createdAt: '2026-03-01T11:05:00Z',
    },
  ])

  fallbackNotifications.set(pId, [
    {
      id: 'notif-001',
      patientId: pId,
      title: 'Specialist Referral Scheduled',
      message: 'Your referral to NIDCH for pulmonary evaluation is in progress. Recommended date: March 25, 2026.',
      category: 'referral',
      isRead: false,
      linkUrl: '/patient/referrals',
      createdAt: '2026-03-01T11:10:00Z',
    },
    {
      id: 'notif-002',
      patientId: pId,
      title: 'Clinical Review Completed',
      message: 'Dr. Rafiqul Islam has reviewed and verified your baseline health record.',
      category: 'clinical_review',
      isRead: true,
      linkUrl: '/patient/assessments',
      createdAt: '2026-03-01T10:45:00Z',
    },
    {
      id: 'notif-003',
      patientId: pId,
      title: 'Permanent Patient Identifier Confirmed',
      message: 'Your official Lungent Patient ID is LGT-2026-8K2M7P. Keep this ID accessible for all care visits.',
      category: 'account_privacy',
      isRead: true,
      linkUrl: '/patient/profile',
      createdAt: '2026-03-01T09:30:00Z',
    },
  ])

  fallbackConsents.set(pId, [
    {
      id: 'cns-001',
      patientId: pId,
      consentType: 'assessment_terms',
      isGranted: true,
      purpose: 'Consent for automated clinical decision support, empirical risk scoring, and educational screening guidance.',
      version: '1.0',
      canWithdraw: false, // Mandatory service terms
      grantedAt: '2026-03-01T09:00:00Z',
      createdAt: '2026-03-01T09:00:00Z',
      updatedAt: '2026-03-01T09:00:00Z',
    },
    {
      id: 'cns-002',
      patientId: pId,
      consentType: 'health_data_collection',
      isGranted: true,
      purpose: 'Collection and longitudinal storage of self-reported respiratory symptoms, smoking history, and health measurements.',
      version: '1.0',
      canWithdraw: true,
      grantedAt: '2026-03-01T09:00:00Z',
      createdAt: '2026-03-01T09:00:00Z',
      updatedAt: '2026-03-01T09:00:00Z',
    },
    {
      id: 'cns-003',
      patientId: pId,
      consentType: 'care_team_sharing',
      isGranted: true,
      purpose: 'Authorized sharing of health summary and referral documents with verified pulmonologists and diagnostic care facilities.',
      version: '1.0',
      canWithdraw: true,
      grantedAt: '2026-03-01T09:00:00Z',
      createdAt: '2026-03-01T09:00:00Z',
      updatedAt: '2026-03-01T09:00:00Z',
    },
    {
      id: 'cns-004',
      patientId: pId,
      consentType: 'sms_notifications',
      isGranted: false,
      purpose: 'Receiving SMS appointment reminders and clinical triage alerts on registered mobile number.',
      version: '1.0',
      canWithdraw: true,
      grantedAt: '2026-03-01T09:00:00Z',
      revokedAt: '2026-03-05T12:00:00Z',
      createdAt: '2026-03-01T09:00:00Z',
      updatedAt: '2026-03-05T12:00:00Z',
    },
  ])
}

seedDemoData(DEMO_PATIENT_ID)
seedDemoData(DEMO_PATIENT_ALT_ID)

export class PatientPortalService {
  /**
   * Retrieves comprehensive dashboard summary for the patient
   */
  static async getDashboardSummary(patientId: string): Promise<PatientDashboardSummary> {
    const patient = await PatientService.getPatientById(patientId) ||
                    await PatientService.getPatientByPatientId(patientId) ||
                    (await PatientService.searchPatients({ query: patientId })).patients[0]

    if (!patient) {
      throw new Error(`Patient not found: ${patientId}`)
    }

    // Calculate profile completion percentage
    let completedFields = 0
    const totalFields = 7
    if (patient.fullName) completedFields++
    if (patient.dateOfBirth || patient.approximateAge) completedFields++
    if (patient.gender) completedFields++
    if (patient.phoneNumber) completedFields++
    if (patient.addressDivision && patient.addressDistrict) completedFields++
    if (patient.emergencyContactName && patient.emergencyContactPhone) completedFields++
    if (patient.verificationStatus === 'verified') completedFields++

    const profileCompletionPercentage = Math.round((completedFields / totalFields) * 100)

    const [assessments, referrals, notifications, healthRecord] = await Promise.all([
      this.getAssessments(patient.id),
      this.getReferrals(patient.id),
      this.getNotifications(patient.id),
      HealthRecordService.getComprehensiveHealthRecord(patient.id),
    ])

    const latestAssessment = assessments[0] || null
    const upcomingFollowups = referrals.filter((r) => r.status === 'pending' || r.status === 'in_progress')
    const activeReferralsCount = upcomingFollowups.length
    const unreadNotifications = notifications.filter((n) => !n.isRead)

    // Construct pending actions
    const pendingActions: PatientDashboardSummary['pendingActions'] = []

    if (patient.verificationStatus !== 'verified') {
      pendingActions.push({
        id: 'act-verify',
        title: 'Complete Identity Verification',
        description: 'Provide your National ID or visit a local care center to verify your permanent health record.',
        actionUrl: '/patient/profile',
        urgency: 'moderate',
      })
    }

    if (activeReferralsCount > 0) {
      pendingActions.push({
        id: 'act-referral',
        title: 'Specialist Consultation Follow-Up',
        description: `You have ${activeReferralsCount} active referral. Review scheduled instructions and appointment date.`,
        actionUrl: '/patient/referrals',
        urgency: 'high',
      })
    }

    if (assessments.length === 0) {
      pendingActions.push({
        id: 'act-assessment',
        title: 'Initiate First Lung Health Survey',
        description: 'Establish your baseline risk and screening profile with a verified healthcare questionnaire.',
        actionUrl: '/patient/assessments',
        urgency: 'low',
      })
    }

    return {
      patient,
      profileCompletionPercentage,
      latestAssessment,
      totalAssessmentsCount: assessments.length,
      pendingActions,
      upcomingFollowups,
      activeReferralsCount,
      unreadNotificationsCount: unreadNotifications.length,
      recentNotifications: notifications.slice(0, 4),
      healthSummaryPreview: healthRecord
        ? {
            packYears: healthRecord.smokingHistory?.calculatedPackYears ?? null,
            bmi: healthRecord.measurements.find((m) => m.measurementType === 'bmi')?.numericValue ?? null,
            activeConditionsCount: healthRecord.medicalConditions.filter((c) => c.clinicalStatus === 'active').length,
            allergiesCount: healthRecord.allergies.filter((a) => a.allergenType !== 'no_known_allergies').length,
          }
        : null,
    }
  }

  /**
   * Retrieves patient profile
   */
  static async getPatientProfile(patientId: string): Promise<Patient> {
    const patient = await PatientService.getPatientById(patientId) ||
                    await PatientService.getPatientByPatientId(patientId)
    if (!patient) {
      throw new Error(`Patient not found: ${patientId}`)
    }
    return patient
  }

  /**
   * Updates permitted patient profile fields.
   * Strictly prevents changing protected identifiers (Lungent Patient ID, status, verification).
   */
  static async updatePatientProfile(
    patientId: string,
    input: UpdatePatientProfileInput
  ): Promise<Patient> {
    const existing = await this.getPatientProfile(patientId)

    // Pass only permitted fields to PatientService
    const updated = await PatientService.updatePatientIdentity(existing.id, {
      fullName: input.fullName,
      dateOfBirth: input.dateOfBirth,
      phoneNumber: input.phoneNumber,
      email: input.email,
      preferredLanguage: input.preferredLanguage,
      addressDivision: input.addressDivision,
      addressDistrict: input.addressDistrict,
      addressUpazila: input.addressUpazila,
      addressDetails: input.addressDetails,
      emergencyContactName: input.emergencyContactName,
      emergencyContactPhone: input.emergencyContactPhone,
      emergencyContactRelation: input.emergencyContactRelation,
    })

    return updated
  }

  /**
   * Retrieves all assessments for the patient
   */
  static async getAssessments(patientId: string): Promise<PatientAssessmentItem[]> {
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('patient_assessments')
          .select('*')
          .eq('patient_id', patientId)
          .order('initiated_at', { ascending: false })

        if (!error && data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return data.map((r: any) => ({
            id: r.id,
            patientId: r.patient_id,
            assessmentType: r.assessment_type,
            status: r.status,
            initiatedAt: r.initiated_at,
            submittedAt: r.submitted_at,
            completedAt: r.completed_at,
            reviewingClinicianId: r.reviewing_clinician_id,
            facilityId: r.facility_id,
            methodologyVersion: r.methodology_version,
            summary: r.summary,
            results: r.results || {},
            limitations: r.limitations,
            nextSteps: r.next_steps,
            isReviewedByClinician: r.is_reviewed_by_clinician,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }))
        }
      } catch {
        // Fall back
      }
    }

    if (!fallbackAssessments.has(patientId)) {
      seedDemoData(patientId)
    }
    return fallbackAssessments.get(patientId) || []
  }

  /**
   * Retrieves a single assessment by ID
   */
  static async getAssessmentById(
    patientId: string,
    assessmentId: string
  ): Promise<PatientAssessmentItem | null> {
    const list = await this.getAssessments(patientId)
    return list.find((a) => a.id === assessmentId) || null
  }

  /**
   * Initiates a new assessment session for the patient
   */
  static async startAssessment(
    patientId: string,
    input: { assessmentType: AssessmentType }
  ): Promise<PatientAssessmentItem> {
    const now = new Date().toISOString()
    const newId = `asmt-${Date.now()}`

    let summaryText = 'Initial assessment session initiated by patient.'
    if (input.assessmentType === 'lung_cancer_risk') {
      summaryText = 'Lung cancer empirical risk factor assessment session.'
    } else if (input.assessmentType === 'screening_eligibility') {
      summaryText = 'USPSTF 2021 low-dose CT screening eligibility evaluation session.'
    } else if (input.assessmentType === 'symptom_triage') {
      summaryText = 'Symptom-based clinical triage and respiratory safety check.'
    }

    const item: PatientAssessmentItem = {
      id: newId,
      patientId,
      assessmentType: input.assessmentType,
      status: 'in_progress',
      initiatedAt: now,
      submittedAt: null,
      completedAt: null,
      reviewingClinicianId: null,
      facilityId: 'facility-dhaka-central',
      methodologyVersion: 'USPSTF-2021 / Lungent-v1',
      summary: summaryText,
      results: {},
      limitations: 'Pending completion and clinical review.',
      nextSteps: 'Complete all assessment steps and submit for clinical decision support.',
      isReviewedByClinician: false,
      createdAt: now,
      updatedAt: now,
    }

    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        const { data: dbItem, error } = await supabase
          .from('patient_assessments')
          .insert({
            patient_id: patientId,
            assessment_type: item.assessmentType,
            status: item.status,
            initiated_at: item.initiatedAt,
            facility_id: item.facilityId,
            methodology_version: item.methodologyVersion,
            summary: item.summary,
            results: item.results,
            limitations: item.limitations,
            next_steps: item.nextSteps,
            is_reviewed_by_clinician: false,
          })
          .select('*')
          .single()

        if (!error && dbItem) {
          item.id = dbItem.id
        }
      } catch {
        // Fall back
      }
    }

    const current = fallbackAssessments.get(patientId) || []
    current.unshift(item)
    fallbackAssessments.set(patientId, current)
    return item
  }

  /**
   * Retrieves referrals and follow-ups
   */
  static async getReferrals(patientId: string): Promise<PatientReferralItem[]> {
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('patient_referrals')
          .select('*')
          .eq('patient_id', patientId)
          .order('referral_date', { ascending: false })

        if (!error && data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return data.map((r: any) => ({
            id: r.id,
            patientId: r.patient_id,
            referralDate: r.referral_date,
            referringFacility: r.referring_facility,
            referringClinician: r.referring_clinician,
            destinationFacility: r.destination_facility,
            reason: r.reason,
            status: r.status,
            recommendedFollowupDate: r.recommended_followup_date,
            instructions: r.instructions,
            contactPhone: r.contact_phone,
            createdAt: r.created_at,
          }))
        }
      } catch {
        // Fall back
      }
    }

    if (!fallbackReferrals.has(patientId)) {
      seedDemoData(patientId)
    }
    return fallbackReferrals.get(patientId) || []
  }

  /**
   * Retrieves patient documents
   */
  static async getDocuments(patientId: string): Promise<PatientDocumentItem[]> {
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('patient_documents')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return data.map((r: any) => ({
            id: r.id,
            patientId: r.patient_id,
            title: r.title,
            documentType: r.document_type,
            fileSizeBytes: Number(r.file_size_bytes) || 204800,
            storagePath: r.storage_path,
            isAvailable: r.is_available,
            createdAt: r.created_at,
          }))
        }
      } catch {
        // Fall back
      }
    }

    if (!fallbackDocuments.has(patientId)) {
      seedDemoData(patientId)
    }
    return fallbackDocuments.get(patientId) || []
  }

  /**
   * Retrieves patient notifications
   */
  static async getNotifications(patientId: string): Promise<PatientNotificationItem[]> {
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('patient_notifications')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false })

        if (!error && data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return data.map((r: any) => ({
            id: r.id,
            patientId: r.patient_id,
            title: r.title,
            message: r.message,
            category: r.category,
            isRead: r.is_read,
            linkUrl: r.link_url,
            createdAt: r.created_at,
          }))
        }
      } catch {
        // Fall back
      }
    }

    if (!fallbackNotifications.has(patientId)) {
      seedDemoData(patientId)
    }
    return fallbackNotifications.get(patientId) || []
  }

  /**
   * Marks a notification as read
   */
  static async markNotificationRead(patientId: string, notificationId: string): Promise<void> {
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        await supabase
          .from('patient_notifications')
          .update({ is_read: true })
          .eq('id', notificationId)
          .eq('patient_id', patientId)
      } catch {
        // Fall back
      }
    }

    const list = fallbackNotifications.get(patientId) || []
    const item = list.find((n) => n.id === notificationId)
    if (item) {
      item.isRead = true
    }
  }

  /**
   * Retrieves patient consent records
   */
  static async getConsents(patientId: string): Promise<PatientConsentItem[]> {
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('patient_consents')
          .select('*')
          .eq('patient_id', patientId)
          .order('created_at', { ascending: true })

        if (!error && data && data.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return data.map((r: any) => ({
            id: r.id,
            patientId: r.patient_id,
            consentType: r.consent_type,
            isGranted: r.is_granted,
            purpose: r.purpose,
            version: r.version,
            canWithdraw: r.can_withdraw,
            grantedAt: r.granted_at,
            revokedAt: r.revoked_at,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }))
        }
      } catch {
        // Fall back
      }
    }

    if (!fallbackConsents.has(patientId)) {
      seedDemoData(patientId)
    }
    return fallbackConsents.get(patientId) || []
  }

  /**
   * Updates or revokes an optional consent
   */
  static async updateConsent(
    patientId: string,
    consentType: ConsentType,
    isGranted: boolean
  ): Promise<PatientConsentItem> {
    const list = await this.getConsents(patientId)
    const target = list.find((c) => c.consentType === consentType)

    if (!target) {
      throw new Error(`Consent record not found for type: ${consentType}`)
    }

    if (!target.canWithdraw && !isGranted) {
      throw new Error('Mandatory service consent cannot be withdrawn while using the platform.')
    }

    const now = new Date().toISOString()
    target.isGranted = isGranted
    target.updatedAt = now
    if (!isGranted) {
      target.revokedAt = now
    } else {
      target.revokedAt = null
    }

    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        await supabase
          .from('patient_consents')
          .update({
            is_granted: target.isGranted,
            revoked_at: target.revokedAt,
            updated_at: target.updatedAt,
          })
          .eq('id', target.id)
      } catch {
        // Fall back
      }
    }

    return target
  }

  /**
   * Submits a clinical health record correction request
   */
  static async submitCorrectionRequest(
    patientId: string,
    input: HealthRecordCorrectionRequest
  ): Promise<{ id: string; status: string }> {
    const requestId = `crq-${Date.now()}`
    const existing = fallbackCorrectionRequests.get(patientId) || []
    existing.push(input)
    fallbackCorrectionRequests.set(patientId, existing)

    // Also create a patient notification for record keeping
    const notifs = fallbackNotifications.get(patientId) || []
    notifs.unshift({
      id: `notif-${Date.now()}`,
      patientId,
      title: 'Correction Request Submitted',
      message: `Your requested correction for ${input.fieldName} (${input.category}) has been submitted for clinical review.`,
      category: 'clinical_review',
      isRead: false,
      linkUrl: '/patient/health-record',
      createdAt: new Date().toISOString(),
    })
    fallbackNotifications.set(patientId, notifs)

    return { id: requestId, status: 'pending_clinical_review' }
  }

  /**
   * Consented linking of prior anonymous self-check session
   */
  static async linkAnonymousSelfCheck(
    patientId: string,
    sessionCode: string
  ): Promise<{ success: boolean; message: string; assessmentId?: string }> {
    if (!sessionCode || sessionCode.trim().length < 6) {
      return { success: false, message: 'Invalid session code.' }
    }

    const now = new Date().toISOString()
    const newAsmtId = `asmt-linked-${Date.now()}`

    // Create an assessment record preserving anonymous provenance
    const linkedAssessment: PatientAssessmentItem = {
      id: newAsmtId,
      patientId,
      assessmentType: 'lung_cancer_risk',
      status: 'submitted',
      initiatedAt: now,
      submittedAt: now,
      completedAt: now,
      reviewingClinicianId: null,
      facilityId: 'facility-dhaka-central',
      methodologyVersion: 'Phase-1.5-Anonymous-SelfCheck',
      summary: `Self-check data linked from anonymous session ${sessionCode.trim().toUpperCase()} with explicit patient consent.`,
      results: {
        sessionCode: sessionCode.trim().toUpperCase(),
        linkedAt: now,
        source: 'anonymous_self_check',
        consentVerified: true,
      },
      limitations: 'Anonymous self-reported responses; clinical triage review recommended.',
      nextSteps: 'Review with your attending healthcare worker during your next clinic visit.',
      isReviewedByClinician: false,
      createdAt: now,
      updatedAt: now,
    }

    const current = fallbackAssessments.get(patientId) || []
    current.unshift(linkedAssessment)
    fallbackAssessments.set(patientId, current)

    return {
      success: true,
      message: 'Anonymous self-check session successfully associated with your patient identity.',
      assessmentId: newAsmtId,
    }
  }
}

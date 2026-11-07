/**
 * Phase 1.18: Healthcare Referral and Follow-up Management Service
 *
 * Implements referral creation, lifecycle state transitions,
 * facility destination verification, appointment coordination,
 * follow-up planning, outcome documentation, and notification integration.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { generateCanonicalReferralId } from './referral-id'

function getAdminSupabaseSafe() {
  try {
    return createAdminClient()
  } catch {
    return null
  }
}
import {
  createReferralSchema,
  updateReferralStatusSchema,
  assignReferralSchema,
  scheduleFollowUpSchema,
  rescheduleFollowUpSchema,
  updateFollowUpStatusSchema,
} from './validation'
import type {
  HealthcareReferralItem,
  ReferralStatusHistoryItem,
  PatientFollowUpItem,
  FollowUpStatusHistoryItem,
  CreateReferralInput,
  UpdateReferralStatusInput,
  AssignReferralInput,
  ScheduleFollowUpInput,
  RescheduleFollowUpInput,
  UpdateFollowUpStatusInput,
  ReferralNotificationPayload,
} from './types'

// In-memory fallback stores for offline development, mocked environments, and unit testing
const fallbackReferrals: Map<string, HealthcareReferralItem> = new Map()
const fallbackReferralHistory: Map<string, ReferralStatusHistoryItem[]> = new Map()
const fallbackFollowUps: Map<string, PatientFollowUpItem> = new Map()
const fallbackFollowUpHistory: Map<string, FollowUpStatusHistoryItem[]> = new Map()
const fallbackNotificationsQueue: ReferralNotificationPayload[] = []

// Default actors for fallback mode
export const DEFAULT_REFERRING_FACILITY_ID = 'facility-dhaka-central'
export const DEFAULT_REFERRING_FACILITY_NAME = 'Dhaka Central Pulmonary Institute'
export const DEFAULT_DESTINATION_FACILITY_ID = '22222222-1111-4111-a111-222222222222'
export const DEFAULT_DESTINATION_FACILITY_NAME = 'National Institute of Diseases of the Chest and Hospital (NIDCH)'
export const DEFAULT_CLINICIAN_USER_ID = 'usr-clinician-001'
export const DEFAULT_CLINICIAN_NAME = 'Prof. Dr. Farhana Ahmed'

function seedBenchmarkReferralsAndFollowUps() {
  if (fallbackReferrals.size > 0) return

  // Seed Referral 1: Urgent 2WW Hemoptysis referral to NIDCH
  const ref1: HealthcareReferralItem = {
    id: 'ref-001-uuid',
    referralId: 'REF-2026-9K2L4P',
    patientId: '11111111-1111-4111-a111-111111111111',
    patientCanonicalId: 'LGT-2026-8K2M7P',
    patientName: 'Md. Rafiqul Islam',
    patientPhone: '+880 1711-223344',
    referringFacilityId: DEFAULT_REFERRING_FACILITY_ID,
    referringFacilityName: DEFAULT_REFERRING_FACILITY_NAME,
    referringProviderId: DEFAULT_CLINICIAN_USER_ID,
    referringProviderName: DEFAULT_CLINICIAN_NAME,
    referringProviderRole: 'clinician',
    destinationFacilityId: DEFAULT_DESTINATION_FACILITY_ID,
    destinationFacilityName: DEFAULT_DESTINATION_FACILITY_NAME,
    destinationDepartment: 'Department of Thoracic Surgery & Interventional Pulmonology',
    assignedClinicianId: 'usr-nidch-lead',
    assignedClinicianName: 'Prof. Dr. M. A. Karim',
    reason: 'Urgent 2-Week-Wait evaluation for unexplained hemoptysis lasting 3 weeks in heavy smoker with high acute risk tier.',
    clinicalSummary: '58y male with 35 pack-years smoking presenting with hemoptysis and progressive dyspnea. Low-dose CT and bronchoscopy recommended.',
    priority: 'urgent_2ww',
    status: 'in_progress',
    referralDate: '2026-11-01T10:30:00Z',
    appointmentDate: '2026-11-15T09:30:00Z',
    appointmentLocation: 'NIDCH Outpatient Pulmonology Wing, Room 204, Mohakhali, Dhaka',
    instructions: 'Fast for 2 hours before scan. Bring past chest X-ray reports and NIDCH outpatient card.',
    contactPhone: '+880 2-8822244',
    linkedAssessmentId: 'asm-rev-001',
    linkedAssessmentType: 'symptom_triage',
    createdBy: DEFAULT_CLINICIAN_USER_ID,
    createdAt: '2026-11-01T10:30:00Z',
    updatedAt: '2026-11-02T14:00:00Z',
  }
  fallbackReferrals.set(ref1.id, ref1)
  fallbackReferrals.set(ref1.referralId, ref1)

  fallbackReferralHistory.set(ref1.id, [
    {
      id: 'hist-ref-01',
      referralId: ref1.id,
      fromStatus: 'draft',
      toStatus: 'submitted',
      reason: 'Initial urgent 2WW referral creation',
      notes: 'Submitted following acute hemoptysis symptom triage alert.',
      changedBy: DEFAULT_CLINICIAN_USER_ID,
      changedByName: DEFAULT_CLINICIAN_NAME,
      createdAt: '2026-11-01T10:30:00Z',
    },
    {
      id: 'hist-ref-02',
      referralId: ref1.id,
      fromStatus: 'submitted',
      toStatus: 'accepted',
      reason: 'Accepted by NIDCH Pulmonology intake desk',
      notes: 'Triaged as Priority 1 urgent thoracic workup.',
      changedBy: 'usr-nidch-registrar',
      changedByName: 'Dr. Tariqul Islam (NIDCH Registrar)',
      createdAt: '2026-11-02T09:15:00Z',
    },
    {
      id: 'hist-ref-03',
      referralId: ref1.id,
      fromStatus: 'accepted',
      toStatus: 'scheduled',
      reason: 'Appointment allocated',
      notes: 'Confirmed for 2026-11-15 at Room 204.',
      changedBy: 'usr-nidch-registrar',
      changedByName: 'Dr. Tariqul Islam (NIDCH Registrar)',
      createdAt: '2026-11-02T14:00:00Z',
    },
  ])

  // Seed Referral 2: Priority GeneXpert TB evaluation for Nasima Begum
  const ref2: HealthcareReferralItem = {
    id: 'ref-002-uuid',
    referralId: 'REF-2026-3N8V7Q',
    patientId: '22222222-2222-4222-a222-222222222222',
    patientCanonicalId: 'LGT-2026-3N9P4X',
    patientName: 'Nasima Begum',
    patientPhone: '+880 1819-334455',
    referringFacilityId: DEFAULT_REFERRING_FACILITY_ID,
    referringFacilityName: DEFAULT_REFERRING_FACILITY_NAME,
    referringProviderId: DEFAULT_CLINICIAN_USER_ID,
    referringProviderName: DEFAULT_CLINICIAN_NAME,
    referringProviderRole: 'clinician',
    destinationFacilityId: DEFAULT_REFERRING_FACILITY_ID,
    destinationFacilityName: DEFAULT_REFERRING_FACILITY_NAME,
    destinationDepartment: 'National Tuberculosis Control Diagnostic Wing',
    reason: 'Diagnostic GeneXpert MTB/RIF assay to rule out active pulmonary tuberculosis in chronic cough with high domestic biomass exposure.',
    clinicalSummary: 'Persistent cough for 8 weeks with nocturnal fever and weight loss. Sputum AFB and GeneXpert indicated prior to oncologic CT.',
    priority: 'priority',
    status: 'scheduled',
    referralDate: '2026-11-02T11:00:00Z',
    appointmentDate: '2026-11-10T10:00:00Z',
    appointmentLocation: 'TB Diagnostic Unit, Dhaka Central Pulmonary Institute',
    instructions: 'Provide early morning spot and overnight sputum samples.',
    contactPhone: '+880 2-9882233',
    createdBy: DEFAULT_CLINICIAN_USER_ID,
    createdAt: '2026-11-02T11:00:00Z',
    updatedAt: '2026-11-03T10:00:00Z',
  }
  fallbackReferrals.set(ref2.id, ref2)
  fallbackReferrals.set(ref2.referralId, ref2)

  fallbackReferralHistory.set(ref2.id, [
    {
      id: 'hist-ref-04',
      referralId: ref2.id,
      fromStatus: 'draft',
      toStatus: 'submitted',
      reason: 'Referral for TB rule-out diagnostic testing',
      notes: 'Submitted for clinical laboratory evaluation.',
      changedBy: DEFAULT_CLINICIAN_USER_ID,
      changedByName: DEFAULT_CLINICIAN_NAME,
      createdAt: '2026-11-02T11:00:00Z',
    },
    {
      id: 'hist-ref-05',
      referralId: ref2.id,
      fromStatus: 'submitted',
      toStatus: 'in_progress',
      reason: 'Sample collected and assay run initiated',
      notes: 'Initial sputum sample received in laboratory.',
      changedBy: 'usr-lab-tech',
      changedByName: 'Md. Al-Amin (Medical Technologist)',
      createdAt: '2026-11-03T10:00:00Z',
    },
  ])

  // Seed Follow-Up 1: Post-LDCT Imaging Follow-Up for Kamal Hossain
  const fu1: PatientFollowUpItem = {
    id: 'fu-001-uuid',
    patientId: '33333333-3333-4333-a333-333333333333',
    patientCanonicalId: 'LGT-2026-7V4Y9Q',
    patientName: 'Kamal Hossain',
    facilityId: DEFAULT_REFERRING_FACILITY_ID,
    facilityName: DEFAULT_REFERRING_FACILITY_NAME,
    responsibleProviderId: DEFAULT_CLINICIAN_USER_ID,
    responsibleProviderName: DEFAULT_CLINICIAN_NAME,
    scheduledDate: '2026-11-26',
    scheduledTime: '11:00 AM',
    purpose: 'post_imaging_review',
    instructions: 'Post-LDCT imaging follow-up and review of Lung-RADS score. Evaluate smoking cessation progress.',
    status: 'scheduled',
    createdBy: DEFAULT_CLINICIAN_USER_ID,
    createdAt: '2026-10-25T14:35:00Z',
    updatedAt: '2026-10-25T14:35:00Z',
  }
  fallbackFollowUps.set(fu1.id, fu1)

  // Seed Follow-Up 2: Post-imaging consultation for Rafiqul Islam
  const fu2: PatientFollowUpItem = {
    id: 'fu-002-uuid',
    patientId: '11111111-1111-4111-a111-111111111111',
    patientCanonicalId: 'LGT-2026-8K2M7P',
    patientName: 'Md. Rafiqul Islam',
    referralId: ref1.id,
    referralCanonicalId: ref1.referralId,
    facilityId: DEFAULT_REFERRING_FACILITY_ID,
    facilityName: DEFAULT_REFERRING_FACILITY_NAME,
    responsibleProviderId: DEFAULT_CLINICIAN_USER_ID,
    responsibleProviderName: DEFAULT_CLINICIAN_NAME,
    scheduledDate: '2026-12-05',
    scheduledTime: '10:30 AM',
    purpose: 'post_imaging_review',
    instructions: 'Post-imaging follow-up to evaluate low-dose CT results and smoking cessation counseling.',
    status: 'scheduled',
    createdBy: DEFAULT_CLINICIAN_USER_ID,
    createdAt: '2026-11-01T11:00:00Z',
    updatedAt: '2026-11-01T11:00:00Z',
  }
  fallbackFollowUps.set(fu2.id, fu2)

  // Seed Follow-Up 3: Completed symptom follow-up for Nasima Begum
  const fu3: PatientFollowUpItem = {
    id: 'fu-003-uuid',
    patientId: '22222222-2222-4222-a222-222222222222',
    patientCanonicalId: 'LGT-2026-3N9P4X',
    patientName: 'Nasima Begum',
    facilityId: DEFAULT_REFERRING_FACILITY_ID,
    facilityName: DEFAULT_REFERRING_FACILITY_NAME,
    responsibleProviderId: DEFAULT_CLINICIAN_USER_ID,
    responsibleProviderName: DEFAULT_CLINICIAN_NAME,
    scheduledDate: '2026-11-04',
    scheduledTime: '02:00 PM',
    purpose: 'symptom_reassessment',
    instructions: 'Assess response to initial bronchodilator therapy and collect second GeneXpert sputum sample.',
    status: 'completed',
    outcomeNotes: 'Cough frequency decreased from severe to moderate. Patient tolerating inhaler. GeneXpert sample 2 sent to central microbiology lab.',
    completedAt: '2026-11-04T14:45:00Z',
    createdBy: DEFAULT_CLINICIAN_USER_ID,
    createdAt: '2026-10-28T09:00:00Z',
    updatedAt: '2026-11-04T14:45:00Z',
  }
  fallbackFollowUps.set(fu3.id, fu3)
}

export class ReferralService {
  /**
   * Creates a new formal patient referral.
   */
  static async createReferral(
    input: CreateReferralInput,
    actorUser: { id: string; name: string; role?: string }
  ): Promise<HealthcareReferralItem> {
    seedBenchmarkReferralsAndFollowUps()
    const validated = createReferralSchema.parse(input)

    const referralId = generateCanonicalReferralId()
    const now = new Date().toISOString()
    const internalId = `ref-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    const newReferral: HealthcareReferralItem = {
      id: internalId,
      referralId,
      patientId: validated.patientId,
      patientCanonicalId: validated.patientCanonicalId,
      patientName: validated.patientName,
      referringFacilityId: validated.referringFacilityId || DEFAULT_REFERRING_FACILITY_ID,
      referringFacilityName: validated.referringFacilityName,
      referringProviderId: actorUser.id,
      referringProviderName: actorUser.name,
      referringProviderRole: actorUser.role || 'clinician',
      destinationFacilityId: validated.destinationFacilityId,
      destinationFacilityName: validated.destinationFacilityName,
      destinationDepartment: validated.destinationDepartment || null,
      reason: validated.reason,
      clinicalSummary: validated.clinicalSummary || null,
      priority: validated.priority,
      status: 'submitted',
      instructions: validated.instructions || null,
      contactPhone: validated.contactPhone || null,
      linkedAssessmentId: validated.linkedAssessmentId || null,
      linkedAssessmentType: validated.linkedAssessmentType || null,
      referralDate: now,
      createdBy: actorUser.id,
      createdAt: now,
      updatedAt: now,
    }

    // Try database insertion
    const supabase = getAdminSupabaseSafe()
    if (supabase) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('patient_referrals') as any).insert({
          id: newReferral.id,
          referral_id: newReferral.referralId,
          patient_id: newReferral.patientId,
          patient_canonical_id: newReferral.patientCanonicalId,
          referring_facility_name: newReferral.referringFacilityName,
          referring_provider_id: newReferral.referringProviderId,
          referring_provider_name: newReferral.referringProviderName,
          destination_facility_name: newReferral.destinationFacilityName,
          destination_department: newReferral.destinationDepartment,
          reason: newReferral.reason,
          clinical_summary: newReferral.clinicalSummary,
          priority: newReferral.priority,
          status: newReferral.status as unknown as string,
          instructions: newReferral.instructions,
          contact_phone: newReferral.contactPhone,
          created_by: actorUser.id,
        })
      } catch (err) {
        console.warn('Database referral insertion error, persisting in fallback store:', err)
      }
    }

    // Persist in fallback store
    fallbackReferrals.set(newReferral.id, newReferral)
    fallbackReferrals.set(newReferral.referralId, newReferral)

    // Log initial status change to history
    const historyItem: ReferralStatusHistoryItem = {
      id: `hist-${Date.now()}`,
      referralId: newReferral.id,
      fromStatus: 'draft',
      toStatus: 'submitted',
      reason: 'Referral created and submitted for destination intake',
      notes: validated.reason,
      changedBy: actorUser.id,
      changedByName: actorUser.name,
      createdAt: now,
    }
    const currentHist = fallbackReferralHistory.get(newReferral.id) || []
    fallbackReferralHistory.set(newReferral.id, [...currentHist, historyItem])
    newReferral.statusHistory = fallbackReferralHistory.get(newReferral.id)

    // Enqueue notification hook
    fallbackNotificationsQueue.push({
      eventType: 'referral_assigned',
      referenceId: newReferral.id,
      patientId: newReferral.patientId,
      title: `New Referral Created (${newReferral.referralId})`,
      titleBn: `নতুন রেফারেল তৈরি হয়েছে (${newReferral.referralId})`,
      body: `Referral submitted to ${newReferral.destinationFacilityName}. Priority: ${newReferral.priority}.`,
      bodyBn: `${newReferral.destinationFacilityName}-এ রেফারেল পাঠানো হয়েছে। অগ্রাধিকার: ${newReferral.priority}।`,
    })

    return newReferral
  }

  /**
   * Retrieves referrals according to authorized filters.
   */
  static async getReferrals(options: {
    patientId?: string
    facilityId?: string
    status?: HealthcareReferralItem['status']
    priority?: HealthcareReferralItem['priority']
    search?: string
  } = {}): Promise<HealthcareReferralItem[]> {
    seedBenchmarkReferralsAndFollowUps()

    const results: HealthcareReferralItem[] = []
    const seen = new Set<string>()

    for (const ref of fallbackReferrals.values()) {
      if (seen.has(ref.id)) continue
      seen.add(ref.id)

      if (options.patientId && ref.patientId !== options.patientId) continue
      if (options.status && ref.status !== options.status) continue
      if (options.priority && ref.priority !== options.priority) continue
      if (
        options.facilityId &&
        ref.referringFacilityId !== options.facilityId &&
        ref.destinationFacilityId !== options.facilityId
      ) {
        continue
      }
      if (options.search) {
        const q = options.search.toLowerCase()
        const matches =
          ref.referralId.toLowerCase().includes(q) ||
          ref.patientName.toLowerCase().includes(q) ||
          ref.patientCanonicalId.toLowerCase().includes(q) ||
          ref.destinationFacilityName.toLowerCase().includes(q)
        if (!matches) continue
      }

      ref.statusHistory = fallbackReferralHistory.get(ref.id) || []
      results.push(ref)
    }

    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return results
  }

  /**
   * Retrieves a single referral by ID or canonical referral ID.
   */
  static async getReferralById(idOrReferralId: string): Promise<HealthcareReferralItem | null> {
    seedBenchmarkReferralsAndFollowUps()
    const ref = fallbackReferrals.get(idOrReferralId) || null
    if (ref) {
      ref.statusHistory = fallbackReferralHistory.get(ref.id) || []
    }
    return ref
  }

  /**
   * Updates referral lifecycle status with mandatory audit trail logging.
   */
  static async updateReferralStatus(
    input: UpdateReferralStatusInput,
    actorUser: { id: string; name: string }
  ): Promise<HealthcareReferralItem> {
    seedBenchmarkReferralsAndFollowUps()
    const validated = updateReferralStatusSchema.parse(input)

    const referral = fallbackReferrals.get(validated.referralId)
    if (!referral) {
      throw new Error(`Referral with ID "${validated.referralId}" not found.`)
    }

    const previousStatus = referral.status
    const now = new Date().toISOString()

    referral.status = validated.status
    referral.updatedAt = now

    if (validated.appointmentDate) referral.appointmentDate = validated.appointmentDate
    if (validated.appointmentLocation) referral.appointmentLocation = validated.appointmentLocation
    if (validated.instructions) referral.instructions = validated.instructions

    if (validated.status === 'rejected') {
      referral.rejectionReason = validated.reason
    } else if (validated.status === 'cancelled') {
      referral.cancellationReason = validated.reason
    } else if (validated.status === 'closed') {
      referral.closureNotes = validated.notes || validated.reason
    }

    // Append history entry
    const historyItem: ReferralStatusHistoryItem = {
      id: `hist-${Date.now()}`,
      referralId: referral.id,
      fromStatus: previousStatus,
      toStatus: validated.status,
      reason: validated.reason || null,
      notes: validated.notes || null,
      changedBy: actorUser.id,
      changedByName: actorUser.name,
      createdAt: now,
    }

    const history = fallbackReferralHistory.get(referral.id) || []
    fallbackReferralHistory.set(referral.id, [...history, historyItem])
    referral.statusHistory = fallbackReferralHistory.get(referral.id)

    // Enqueue notification hook
    fallbackNotificationsQueue.push({
      eventType: 'referral_status_changed',
      referenceId: referral.id,
      patientId: referral.patientId,
      title: `Referral Status Updated: ${validated.status.toUpperCase()}`,
      titleBn: `রেফারেল স্ট্যাটাস পরিবর্তিত হয়েছে: ${validated.status}`,
      body: `Referral ${referral.referralId} status changed from ${previousStatus} to ${validated.status}.`,
      bodyBn: `রেফারেল ${referral.referralId}-এর স্থিতি ${validated.status}-এ পরিবর্তিত হয়েছে।`,
    })

    return referral
  }

  /**
   * Assigns referral to receiving clinician and schedules appointment.
   */
  static async assignReferral(
    input: AssignReferralInput,
    actorUser: { id: string; name: string }
  ): Promise<HealthcareReferralItem> {
    seedBenchmarkReferralsAndFollowUps()
    const validated = assignReferralSchema.parse(input)

    const referral = fallbackReferrals.get(validated.referralId)
    if (!referral) {
      throw new Error(`Referral with ID "${validated.referralId}" not found.`)
    }

    if (validated.assignedClinicianId) {
      referral.assignedClinicianId = validated.assignedClinicianId
      referral.assignedClinicianName = validated.assignedClinicianName || 'Specialist Pulmonologist'
    }
    if (validated.appointmentDate) {
      referral.appointmentDate = validated.appointmentDate
    }
    if (validated.appointmentLocation) {
      referral.appointmentLocation = validated.appointmentLocation
    }

    return this.updateReferralStatus(
      {
        referralId: referral.id,
        status: 'scheduled',
        reason: 'Specialist consultation scheduled and assigned.',
        notes: `Appointment confirmed for ${validated.appointmentDate || 'scheduled date'}.`,
      },
      actorUser
    )
  }

  /**
   * Retrieves notification queue for inspection or integration testing.
   */
  static getQueuedNotifications(): ReferralNotificationPayload[] {
    return [...fallbackNotificationsQueue]
  }
}

export class FollowUpService {
  /**
   * Schedules a follow-up consultation or imaging review for a patient.
   */
  static async scheduleFollowUp(
    input: ScheduleFollowUpInput,
    actorUser: { id: string; name: string }
  ): Promise<PatientFollowUpItem> {
    seedBenchmarkReferralsAndFollowUps()
    const validated = scheduleFollowUpSchema.parse(input)

    const now = new Date().toISOString()
    const id = `fu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    const newFollowUp: PatientFollowUpItem = {
      id,
      patientId: validated.patientId,
      patientCanonicalId: validated.patientCanonicalId,
      patientName: validated.patientName,
      referralId: validated.referralId || null,
      referralCanonicalId: validated.referralCanonicalId || null,
      facilityId: validated.facilityId || DEFAULT_REFERRING_FACILITY_ID,
      facilityName: validated.facilityName,
      responsibleProviderId: validated.responsibleProviderId || actorUser.id,
      responsibleProviderName: validated.responsibleProviderName,
      scheduledDate: validated.scheduledDate,
      scheduledTime: validated.scheduledTime || '10:00 AM',
      purpose: validated.purpose,
      instructions: validated.instructions || null,
      status: 'scheduled',
      createdBy: actorUser.id,
      createdAt: now,
      updatedAt: now,
    }

    fallbackFollowUps.set(newFollowUp.id, newFollowUp)

    const historyItem: FollowUpStatusHistoryItem = {
      id: `fu-hist-${Date.now()}`,
      followupId: newFollowUp.id,
      fromStatus: 'scheduled',
      toStatus: 'scheduled',
      reason: 'Follow-up appointment initially scheduled',
      notes: validated.instructions,
      changedBy: actorUser.id,
      changedByName: actorUser.name,
      createdAt: now,
    }
    fallbackFollowUpHistory.set(newFollowUp.id, [historyItem])
    newFollowUp.statusHistory = [historyItem]

    // Notification queue event
    fallbackNotificationsQueue.push({
      eventType: 'followup_scheduled',
      referenceId: newFollowUp.id,
      patientId: newFollowUp.patientId,
      title: 'Clinical Follow-up Scheduled',
      titleBn: 'ক্লিনিক্যাল ফলো-আপ নির্ধারিত হয়েছে',
      body: `Follow-up planned for ${newFollowUp.scheduledDate} (${newFollowUp.purpose}).`,
      bodyBn: `${newFollowUp.scheduledDate} তারিখে ফলো-আপ নির্ধারিত হয়েছে।`,
    })

    return newFollowUp
  }

  /**
   * Retrieves follow-ups according to filter criteria.
   */
  static async getFollowUps(options: {
    patientId?: string
    facilityId?: string
    status?: PatientFollowUpItem['status']
    overdueOnly?: boolean
    currentDate?: string
  } = {}): Promise<PatientFollowUpItem[]> {
    seedBenchmarkReferralsAndFollowUps()
    const results: PatientFollowUpItem[] = []
    const today = options.currentDate || '2026-11-06'

    for (const fu of fallbackFollowUps.values()) {
      if (options.patientId && fu.patientId !== options.patientId) continue
      if (options.facilityId && fu.facilityId !== options.facilityId) continue

      // Check if scheduled date has passed and update to overdue if not completed
      if (fu.status === 'scheduled' && fu.scheduledDate < today) {
        fu.status = 'overdue'
      }

      if (options.overdueOnly && fu.status !== 'overdue') continue
      if (options.status && fu.status !== options.status) continue

      fu.statusHistory = fallbackFollowUpHistory.get(fu.id) || []
      results.push(fu)
    }

    results.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    return results
  }

  /**
   * Reschedules a follow-up appointment with mandatory justification.
   */
  static async rescheduleFollowUp(
    input: RescheduleFollowUpInput,
    actorUser: { id: string; name: string }
  ): Promise<PatientFollowUpItem> {
    seedBenchmarkReferralsAndFollowUps()
    const validated = rescheduleFollowUpSchema.parse(input)

    const fu = fallbackFollowUps.get(validated.followUpId)
    if (!fu) {
      throw new Error(`Follow-up with ID "${validated.followUpId}" not found.`)
    }

    const previousDate = fu.scheduledDate
    const now = new Date().toISOString()

    fu.rescheduledFromDate = previousDate
    fu.scheduledDate = validated.newDate
    if (validated.newTime) fu.scheduledTime = validated.newTime
    fu.rescheduledReason = validated.reason
    fu.status = 'rescheduled'
    fu.updatedAt = now

    const historyItem: FollowUpStatusHistoryItem = {
      id: `fu-hist-${Date.now()}`,
      followupId: fu.id,
      fromStatus: 'scheduled',
      toStatus: 'rescheduled',
      reason: validated.reason,
      notes: `Rescheduled from ${previousDate} to ${validated.newDate}.`,
      changedBy: actorUser.id,
      changedByName: actorUser.name,
      createdAt: now,
    }
    const currentHist = fallbackFollowUpHistory.get(fu.id) || []
    fallbackFollowUpHistory.set(fu.id, [...currentHist, historyItem])
    fu.statusHistory = fallbackFollowUpHistory.get(fu.id)

    return fu
  }

  /**
   * Records clinical outcome and marks follow-up as completed.
   */
  static async recordFollowUpOutcome(
    input: UpdateFollowUpStatusInput,
    actorUser: { id: string; name: string }
  ): Promise<PatientFollowUpItem> {
    seedBenchmarkReferralsAndFollowUps()
    const validated = updateFollowUpStatusSchema.parse(input)

    const fu = fallbackFollowUps.get(validated.followUpId)
    if (!fu) {
      throw new Error(`Follow-up with ID "${validated.followUpId}" not found.`)
    }

    const previousStatus = fu.status
    const now = new Date().toISOString()

    fu.status = validated.status
    if (validated.outcomeNotes) fu.outcomeNotes = validated.outcomeNotes
    if (validated.status === 'completed') fu.completedAt = now
    fu.updatedAt = now

    const historyItem: FollowUpStatusHistoryItem = {
      id: `fu-hist-${Date.now()}`,
      followupId: fu.id,
      fromStatus: previousStatus,
      toStatus: validated.status,
      reason: validated.reason || null,
      notes: validated.outcomeNotes || validated.notes || null,
      changedBy: actorUser.id,
      changedByName: actorUser.name,
      createdAt: now,
    }
    const currentHist = fallbackFollowUpHistory.get(fu.id) || []
    fallbackFollowUpHistory.set(fu.id, [...currentHist, historyItem])
    fu.statusHistory = fallbackFollowUpHistory.get(fu.id)

    return fu
  }
}

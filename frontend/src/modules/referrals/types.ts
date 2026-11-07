/**
 * Phase 1.18: Healthcare Referral and Follow-up Management Types
 *
 * Clinical Governance & Continuity of Care
 * Important: Referrals and follow-ups coordinate clinical care and specialist evaluations.
 * They MUST NOT be presented as a confirmed diagnosis of lung cancer.
 */

export type ReferralPriority = 'urgent_2ww' | 'priority' | 'routine' | 'elective'

export type ReferralLifecycleStatus =
  | 'draft'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'scheduled'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'closed'

export type PatientFollowUpStatus =
  | 'scheduled'
  | 'completed'
  | 'overdue'
  | 'rescheduled'
  | 'cancelled'
  | 'missed'

export type FollowUpPurpose =
  | 'post_imaging_review'
  | 'treatment_monitoring'
  | 'symptom_reassessment'
  | 'specialist_consultation'
  | 'smoking_cessation'
  | 'routine_check'

export interface ReferralStatusHistoryItem {
  id: string
  referralId: string
  fromStatus: ReferralLifecycleStatus
  toStatus: ReferralLifecycleStatus
  reason?: string | null
  notes?: string | null
  changedBy: string
  changedByName: string
  createdAt: string
}

export interface HealthcareReferralItem {
  id: string
  referralId: string // Canonical REF-YYYY-XXXXXX
  patientId: string
  patientCanonicalId: string
  patientName: string
  patientPhone?: string | null
  referringFacilityId?: string | null
  referringFacilityName: string
  referringProviderId: string
  referringProviderName: string
  referringProviderRole: string
  destinationFacilityId?: string | null
  destinationFacilityName: string
  destinationDepartment?: string | null
  assignedClinicianId?: string | null
  assignedClinicianName?: string | null
  reason: string
  clinicalSummary?: string | null
  priority: ReferralPriority
  status: ReferralLifecycleStatus
  rejectionReason?: string | null
  cancellationReason?: string | null
  closureNotes?: string | null
  referralDate: string
  appointmentDate?: string | null
  appointmentLocation?: string | null
  instructions?: string | null
  contactPhone?: string | null
  linkedAssessmentId?: string | null
  linkedAssessmentType?: string | null
  statusHistory?: ReferralStatusHistoryItem[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface FollowUpStatusHistoryItem {
  id: string
  followupId: string
  fromStatus: PatientFollowUpStatus
  toStatus: PatientFollowUpStatus
  reason?: string | null
  notes?: string | null
  changedBy: string
  changedByName: string
  createdAt: string
}

export interface PatientFollowUpItem {
  id: string
  patientId: string
  patientCanonicalId: string
  patientName: string
  referralId?: string | null
  referralCanonicalId?: string | null
  facilityId: string
  facilityName: string
  responsibleProviderId: string
  responsibleProviderName: string
  scheduledDate: string // YYYY-MM-DD
  scheduledTime?: string | null
  purpose: FollowUpPurpose
  instructions?: string | null
  status: PatientFollowUpStatus
  outcomeNotes?: string | null
  rescheduledFromDate?: string | null
  rescheduledReason?: string | null
  cancellationReason?: string | null
  completedAt?: string | null
  statusHistory?: FollowUpStatusHistoryItem[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateReferralInput {
  patientId: string
  patientCanonicalId: string
  patientName: string
  patientPhone?: string | null
  referringFacilityId?: string | null
  referringFacilityName?: string
  destinationFacilityId?: string | null
  destinationFacilityName: string
  destinationDepartment?: string | null
  reason: string
  clinicalSummary?: string | null
  priority?: ReferralPriority
  instructions?: string | null
  contactPhone?: string | null
  linkedAssessmentId?: string | null
  linkedAssessmentType?: string | null
}

export interface UpdateReferralStatusInput {
  referralId: string
  status: ReferralLifecycleStatus
  reason?: string | null
  notes?: string | null
  appointmentDate?: string | null
  appointmentLocation?: string | null
  instructions?: string | null
}

export interface AssignReferralInput {
  referralId: string
  destinationFacilityId?: string | null
  assignedClinicianId?: string | null
  assignedClinicianName?: string | null
  appointmentDate?: string | null
  appointmentLocation?: string | null
}

export interface ScheduleFollowUpInput {
  patientId: string
  patientCanonicalId: string
  patientName: string
  referralId?: string | null
  referralCanonicalId?: string | null
  facilityId?: string | null
  facilityName?: string
  responsibleProviderId?: string | null
  responsibleProviderName?: string
  scheduledDate: string
  scheduledTime?: string | null
  purpose: FollowUpPurpose
  instructions?: string | null
}

export interface UpdateFollowUpStatusInput {
  followUpId: string
  status: PatientFollowUpStatus
  reason?: string | null
  notes?: string | null
  outcomeNotes?: string | null
}

export interface RescheduleFollowUpInput {
  followUpId: string
  newDate: string
  newTime?: string | null
  reason: string
}

export interface ReferralNotificationPayload {
  eventType: 'referral_assigned' | 'referral_status_changed' | 'followup_scheduled' | 'followup_reminder' | 'followup_overdue'
  referenceId: string
  patientId: string
  recipientUserId?: string
  title: string
  titleBn: string
  body: string
  bodyBn: string
}

import type { AssessmentType, AssessmentStatus } from '@/types/database'

export type WorkerTaskType =
  | 'intake_completion'
  | 'assessment_initiation'
  | 'measurement_recording'
  | 'contact_verification'
  | 'followup_call'

export type WorkerTaskPriority = 'urgent' | 'high' | 'normal' | 'low'
export type WorkerTaskStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed'

export type CompletionLevel = 'incomplete' | 'partially_complete' | 'complete'

export interface MissingInformationItem {
  key: string
  section: string
  labelEn: string
  labelBn: string
  isCritical: boolean
  targetTab: string
}

export interface PatientCompletionStatus {
  patientId: string
  completionScore: number
  status: CompletionLevel
  missingSections: MissingInformationItem[]
  lastCalculatedAt: string
  evaluatedBy?: string | null
}

export interface WorkerOperationalTask {
  id: string
  workerId: string
  patientId?: string | null
  patientName?: string | null
  patientIdFormatted?: string | null
  facilityId: string
  taskType: WorkerTaskType
  priority: WorkerTaskPriority
  status: WorkerTaskStatus
  title: string
  titleBn?: string | null
  description?: string | null
  dueDate?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface WorkerRecentActivity {
  id: string
  workerId: string
  facilityId: string
  patientId?: string | null
  patientName?: string | null
  patientIdFormatted?: string | null
  activityType:
    | 'patient_registered'
    | 'health_record_updated'
    | 'assessment_initiated'
    | 'task_completed'
    | 'patient_viewed'
  summary: string
  summaryBn?: string | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>
  createdAt: string
}

export interface WorkerDashboardStats {
  totalAssignedPatients: number
  assignedPatientsCount: number
  recentlyRegisteredCount: number
  incompleteProfilesCount: number
  activeAssessmentsCount: number
  pendingTasksCount: number
  urgentTasksCount: number
}

export interface InitiateAssessmentInput {
  assessmentType: AssessmentType
  facilityId?: string
  priority?: 'routine' | 'urgent'
  preliminaryNotes?: string
  status?: AssessmentStatus
}

export interface WorkerAssessmentListItem {
  id: string
  patientId: string
  patientCanonicalId: string
  patientName: string
  patientNameBn?: string | null
  assessmentType: AssessmentType
  status: AssessmentStatus
  initiatedAt: string
  submittedAt?: string | null
  facilityId: string
  facilityName?: string | null
  summary: string
  isReviewedByClinician: boolean
}

export interface CreateWorkerTaskInput {
  patientId?: string | null
  facilityId: string
  taskType: WorkerTaskType
  priority: WorkerTaskPriority
  title: string
  titleBn?: string | null
  description?: string | null
  dueDate?: string | null
}

export interface WorkerPatientSummary {
  id: string
  patientId: string
  fullName: string
  nameBn?: string | null
  gender: string
  approximateAge?: number | null
  phoneNumber?: string | null
  addressDistrict?: string | null
  addressUpazila?: string | null
  primaryFacilityId: string
  primaryFacilityName?: string | null
  completionScore: number
  completionStatus: CompletionLevel
  missingCount: number
  missingSections?: MissingInformationItem[]
  registeredAt: string
  assignedRole?: string | null
}

export type PatientAssessmentType = AssessmentType
export type PatientAssessmentWorkflowItem = WorkerAssessmentListItem
export type IncompletePatientQueueItem = WorkerPatientSummary

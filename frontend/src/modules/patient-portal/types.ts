import type {
  AssessmentType,
  AssessmentStatus,
  ReferralStatus,
  PatientDocumentType,
  NotificationCategory,
  ConsentType,
} from '@/types/database'
import type { Patient } from '@/modules/patients/types'

export interface PatientAssessmentItem {
  id: string
  patientId: string
  assessmentType: AssessmentType
  status: AssessmentStatus
  initiatedAt: string
  submittedAt?: string | null
  completedAt?: string | null
  reviewingClinicianId?: string | null
  reviewingClinicianName?: string | null
  facilityId?: string | null
  facilityName?: string | null
  methodologyVersion?: string | null
  summary: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results: Record<string, any>
  limitations?: string | null
  nextSteps?: string | null
  isReviewedByClinician: boolean
  createdAt: string
  updatedAt: string
}

export interface PatientReferralItem {
  id: string
  patientId: string
  referralDate: string
  referringFacility: string
  referringClinician?: string | null
  destinationFacility: string
  reason: string
  status: ReferralStatus
  recommendedFollowupDate?: string | null
  instructions?: string | null
  contactPhone?: string | null
  createdAt: string
}

export interface PatientDocumentItem {
  id: string
  patientId: string
  title: string
  documentType: PatientDocumentType
  fileSizeBytes: number
  storagePath?: string | null
  isAvailable: boolean
  createdAt: string
}

export interface PatientNotificationItem {
  id: string
  patientId: string
  title: string
  message: string
  category: NotificationCategory
  isRead: boolean
  linkUrl?: string | null
  createdAt: string
}

export interface PatientConsentItem {
  id: string
  patientId: string
  consentType: ConsentType
  isGranted: boolean
  purpose: string
  version: string
  canWithdraw: boolean
  grantedAt: string
  revokedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface HealthRecordCorrectionRequest {
  category: string
  recordId?: string | null
  fieldName: string
  currentValue?: string | null
  requestedCorrection: string
  justification: string
}

export interface PatientDashboardSummary {
  patient: Patient
  profileCompletionPercentage: number
  latestAssessment?: PatientAssessmentItem | null
  totalAssessmentsCount: number
  pendingActions: {
    id: string
    title: string
    description: string
    actionUrl: string
    urgency: 'low' | 'moderate' | 'high'
  }[]
  upcomingFollowups: PatientReferralItem[]
  activeReferralsCount: number
  unreadNotificationsCount: number
  recentNotifications: PatientNotificationItem[]
  healthSummaryPreview?: {
    packYears?: number | null
    bmi?: number | null
    activeConditionsCount: number
    allergiesCount: number
  } | null
}

export interface UpdatePatientProfileInput {
  fullName?: string
  dateOfBirth?: string | null
  phoneNumber?: string
  email?: string | null
  preferredLanguage?: 'en' | 'bn'
  addressDivision?: string
  addressDistrict?: string
  addressUpazila?: string
  addressDetails?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelation?: string
}

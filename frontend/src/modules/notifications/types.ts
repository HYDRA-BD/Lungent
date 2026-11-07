/**
 * Phase 1.19: Notification and Communication System Domain Models
 *
 * Implements centralized notification events, multi-channel dispatch (In-App, SMS, Email),
 * recipient resolution, consent and preference validation, delivery status tracking,
 * retry handling, and operational administrative monitoring.
 */

export type NotificationCategory =
  | 'account'
  | 'assessment'
  | 'clinical_review'
  | 'referral'
  | 'follow_up'
  | 'healthcare_worker'
  | 'urgent_workflow'

export type NotificationChannel = 'in_app' | 'sms' | 'email'

export type NotificationPriority = 'urgent' | 'high' | 'normal' | 'low'

export type NotificationLifecycleStatus = 'pending' | 'processing' | 'processed' | 'cancelled'

export type DeliveryLifecycleStatus =
  | 'queued'
  | 'sent_to_provider'
  | 'delivered'
  | 'failed'
  | 'bounced'
  | 'rejected'
  | 'unknown'

export type NotificationEventType =
  // Account
  | 'account_registered'
  | 'password_reset_requested'
  | 'profile_updated'
  | 'consent_updated'
  // Assessment
  | 'assessment_submitted'
  | 'assessment_processing'
  | 'assessment_requires_info'
  | 'assessment_results_available'
  | 'assessment_review_completed'
  // Clinical Review
  | 'assessment_awaiting_review'
  | 'patient_assessment_assigned'
  | 'clinical_review_pending'
  | 'clinical_review_completed'
  | 'clinical_alert_generated'
  // Referral (Phase 1.18 integration)
  | 'referral_assigned'
  | 'referral_submitted'
  | 'referral_accepted'
  | 'referral_rejected'
  | 'referral_scheduled'
  | 'referral_status_changed'
  | 'referral_completed'
  // Follow-up (Phase 1.18 integration)
  | 'followup_scheduled'
  | 'followup_reminder'
  | 'followup_rescheduled'
  | 'followup_cancelled'
  | 'followup_overdue'
  | 'followup_missed'
  | 'followup_completed'
  // Healthcare Worker
  | 'worker_new_assignment'
  | 'worker_pending_tasks'
  | 'worker_review_outstanding'
  | 'worker_facility_alert'
  // Urgent Workflow
  | 'urgent_clinical_escalation'
  | 'urgent_red_flag_alert'

export interface AppNotificationItem {
  id: string
  idempotencyKey?: string | null
  recipientUserId?: string | null
  patientId?: string | null
  category: NotificationCategory
  priority: NotificationPriority
  title: string
  titleBn?: string | null
  body: string
  bodyBn?: string | null
  actionUrl?: string | null
  sourceModule: string
  sourceReferenceId?: string | null
  isRead: boolean
  readAt?: string | null
  requiresAcknowledgement: boolean
  acknowledgedAt?: string | null
  acknowledgedBy?: string | null
  lifecycleStatus: NotificationLifecycleStatus
  scheduledFor?: string | null
  metadata?: Record<string, unknown>
  deliveries?: NotificationDeliveryItem[]
  createdAt: string
  updatedAt: string
}

export interface NotificationDeliveryItem {
  id: string
  notificationId: string
  channel: NotificationChannel
  recipientTarget: string // Phone (+880...), email, or user profile ID
  deliveryStatus: DeliveryLifecycleStatus
  providerName?: string | null
  providerMessageId?: string | null
  attemptsCount: number
  lastAttemptAt?: string | null
  nextRetryAt?: string | null
  deliveredAt?: string | null
  failedAt?: string | null
  errorMessage?: string | null
  errorCode?: string | null
  createdAt: string
  updatedAt: string
}

export interface UserNotificationPreferences {
  id?: string
  userId: string
  inAppEnabled: boolean
  smsEnabled: boolean
  emailEnabled: boolean
  assessmentUpdates: boolean
  referralUpdates: boolean
  followupReminders: boolean
  urgentAlerts: boolean // Mandatory safety notices
  phoneNumber?: string | null
  emailAddress?: string | null
  preferredLanguage: 'en' | 'bn'
  updatedAt?: string
}

export interface NotificationEventInput {
  eventType: NotificationEventType
  recipientUserId?: string
  patientId?: string
  recipientPhone?: string | null
  recipientEmail?: string | null
  priority?: NotificationPriority
  sourceModule: string
  sourceReferenceId?: string
  channels?: NotificationChannel[]
  scheduledFor?: string
  idempotencyKey?: string
  variables?: Record<string, string | number | boolean | null | undefined>
  metadata?: Record<string, unknown>
}

export interface DeliveryMetricsSummary {
  totalNotifications: number
  totalDeliveries: number
  inAppCount: number
  smsCount: number
  emailCount: number
  deliveredCount: number
  pendingCount: number
  failedCount: number
  deliverySuccessRate: number
  providerStatuses: {
    inApp: 'operational' | 'degraded' | 'offline'
    sms: 'operational' | 'degraded' | 'offline'
    email: 'operational' | 'degraded' | 'offline'
  }
}

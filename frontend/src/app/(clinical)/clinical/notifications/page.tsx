import type { Metadata } from 'next'
import {
  NotificationService,
  NOTIF_DEFAULT_CLINICIAN_USER_ID,
} from '@/modules/notifications/service'
import { ClinicalNotificationsClient } from './clinical-notifications-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Clinical Notifications | Lungent Clinical Workspace',
  description: 'Urgent red-flag symptom escalations, specialist referrals, and clinical reviews.',
}

export default async function ClinicalNotificationsPage() {
  const notifications = await NotificationService.getNotificationsForUser(
    NOTIF_DEFAULT_CLINICIAN_USER_ID
  )

  return (
    <ClinicalNotificationsClient
      initialNotifications={notifications}
      clinicianId={NOTIF_DEFAULT_CLINICIAN_USER_ID}
      clinicianName="Dr. Kazi Mahfuzur Rahman"
      facilityName="National Institute of Diseases of the Chest & Hospital (NIDCH)"
    />
  )
}

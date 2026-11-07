import type { Metadata } from 'next'
import { PatientPortalService } from '@/modules/patient-portal/service'
import { NotificationService } from '@/modules/notifications/service'
import { PatientNotificationsClient } from './patient-notifications-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Notifications | Lungent Patient Portal',
  description: 'Clinical alerts, assessment results, and specialist referral updates.',
}

const DEFAULT_PATIENT_ID = '11111111-1111-4111-a111-111111111111'

export default async function PatientNotificationsPage() {
  const patientId = DEFAULT_PATIENT_ID

  const [notifications, preferences] = await Promise.all([
    PatientPortalService.getNotifications(patientId),
    NotificationService.getUserPreferences(patientId),
  ])

  return (
    <PatientNotificationsClient
      initialNotifications={notifications}
      patientId={patientId}
      initialPreferences={preferences}
    />
  )
}

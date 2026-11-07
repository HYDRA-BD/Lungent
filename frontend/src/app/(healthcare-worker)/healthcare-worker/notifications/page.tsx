import type { Metadata } from 'next'
import {
  NotificationService,
  NOTIF_DEFAULT_WORKER_USER_ID,
} from '@/modules/notifications/service'
import { WorkerNotificationsClient } from './worker-notifications-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Worker Notifications | Lungent Healthcare Worker Workspace',
  description: 'Community patient registrations, assigned intakes, and referral coordination.',
}

export default async function HealthcareWorkerNotificationsPage() {
  const notifications = await NotificationService.getNotificationsForUser(
    NOTIF_DEFAULT_WORKER_USER_ID
  )

  return (
    <WorkerNotificationsClient
      initialNotifications={notifications}
      workerId={NOTIF_DEFAULT_WORKER_USER_ID}
      workerName="Amina Begum, CHW"
      facilityName="Mirpur Community Health Clinic"
    />
  )
}

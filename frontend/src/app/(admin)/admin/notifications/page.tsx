import type { Metadata } from 'next'
import { NotificationService } from '@/modules/notifications/service'
import { AdminNotificationsClient } from './admin-notifications-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Notification Delivery Monitor | Lungent Admin',
  description: 'Operational telemetry and gateway status for In-App, SMS, and Email dispatches.',
}

export default async function AdminNotificationsPage() {
  const [metrics, recentDeliveries] = await Promise.all([
    NotificationService.getAdminDeliveryMetrics(),
    NotificationService.getRecentDeliveries(30),
  ])

  return (
    <AdminNotificationsClient
      metrics={metrics}
      recentDeliveries={recentDeliveries}
    />
  )
}

'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Badge } from '@/components/ui/badge'
import { useLanguage } from '@/i18n'
import { getHealthcareWorkerNav } from '@/modules/healthcare-worker/components/worker-navigation'
import { InAppNotificationCenter } from '@/modules/notifications/components/in-app-notification-center'
import type { AppNotificationItem } from '@/modules/notifications/types'

interface WorkerNotificationsClientProps {
  initialNotifications: AppNotificationItem[]
  workerId: string
  workerName: string
  facilityName: string
}

export function WorkerNotificationsClient({
  initialNotifications,
  workerId,
  workerName,
  facilityName,
}: WorkerNotificationsClientProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [notifications] = useState<AppNotificationItem[]>(initialNotifications)
  const unreadCount = notifications.filter((n) => !n.isRead).length

  const navItems = getHealthcareWorkerNav(isBn, {
    notifications: unreadCount,
  })

  return (
    <DashboardLayout
      workspaceName={isBn ? 'স্বাস্থ্যকর্মী ওয়ার্কস্পেস' : 'Healthcare Worker Workspace'}
      workspaceBadge={<Badge variant="outline">{facilityName}</Badge>}
      userName={workerName}
      userRole={isBn ? 'কমিউনিটি হেলথ অফিসার' : 'Community Health Officer'}
      navItems={navItems}
    >
      <div className="space-y-6">
        <PageHeader
          title={isBn ? 'স্বাস্থ্যকর্মী নোটিফিকেশন ও কার্যতালিকা বার্তা' : 'Healthcare Worker Notifications'}
          description={
            isBn
              ? 'নতুন রোগী নিবন্ধন, কমিউনিটি ইনটেক অ্যাসাইনমেন্ট ও ফলো-আপ নোটিশ'
              : 'Community intake assignments, pending task reminders, and specialist referral coordination notices.'
          }
        />

        <InAppNotificationCenter
          initialNotifications={initialNotifications}
          userId={workerId}
          userRole="healthcare_worker"
        />
      </div>
    </DashboardLayout>
  )
}

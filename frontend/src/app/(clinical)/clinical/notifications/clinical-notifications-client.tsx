'use client'

import React, { useState } from 'react'
import { ShieldAlert } from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useLanguage } from '@/i18n'
import { getClinicalNav } from '@/modules/clinical/components/clinical-navigation'
import { InAppNotificationCenter } from '@/modules/notifications/components/in-app-notification-center'
import type { AppNotificationItem } from '@/modules/notifications/types'

interface ClinicalNotificationsClientProps {
  initialNotifications: AppNotificationItem[]
  clinicianId: string
  clinicianName: string
  facilityName: string
}

export function ClinicalNotificationsClient({
  initialNotifications,
  clinicianId,
  clinicianName,
  facilityName,
}: ClinicalNotificationsClientProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [notifications] = useState<AppNotificationItem[]>(initialNotifications)
  const unreadCount = notifications.filter((n) => !n.isRead).length
  const urgentCount = notifications.filter((n) => n.priority === 'urgent' && !n.isRead).length

  const navItems = getClinicalNav(isBn, {
    notifications: unreadCount,
    alerts: urgentCount,
  })

  return (
    <DashboardLayout
      workspaceName={isBn ? 'ক্লিনিক্যাল ওয়ার্কস্পেস' : 'Clinical Workspace'}
      workspaceBadge={<Badge variant="outline">{facilityName}</Badge>}
      userName={clinicianName}
      userRole={isBn ? 'রেজিস্টার্ড চিকিৎসক' : 'Attending Pulmonologist'}
      navItems={navItems}
    >
      <div className="space-y-6">
        <PageHeader
          title={isBn ? 'ক্লিনিক্যাল নোটিফিকেশন ও জরুরি বার্তা' : 'Clinical Notifications & Urgent Alerts'}
          description={
            isBn
              ? 'জরুরি লাল-পতাকা ট্রায়াজ সতর্কতা, বিশেষজ্ঞ রেফারেল ও ফলো-আপ রিমাইন্ডার মনিটরিং'
              : 'Urgent red-flag symptom escalations, specialist referral progress, and clinical assessment reminders.'
          }
        />

        {/* Clinical Safety Non-Suppression Notice */}
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-xs font-semibold">
            {isBn ? 'ক্লিনিক্যাল সুরক্ষা ও নন-সাপ্রেশন নীতি' : 'Clinical Safety & Non-Suppression Protocol'}
          </AlertTitle>
          <AlertDescription className="text-xs">
            {isBn
              ? 'কম ঝুঁকি স্কোর বা স্ক্রিনিং অযোগ্যতা কোনো অবস্থাতেই লাল-পতাকা জরুরি ক্লিনিকাল ট্রায়াজকে গোপন করতে পারে না।'
              : 'Low risk estimation scores or screening ineligibility never suppress urgent clinical triage alerts. High-priority red-flag notifications require explicit clinician acknowledgement.'}
          </AlertDescription>
        </Alert>

        <InAppNotificationCenter
          initialNotifications={initialNotifications}
          userId={clinicianId}
          userRole="clinician"
        />
      </div>
    </DashboardLayout>
  )
}

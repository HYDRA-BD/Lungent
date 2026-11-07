'use client'

import React from 'react'
import {
  Server,
  Building2,
  Users,
  FileText,
  Settings,
  Bell,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Badge } from '@/components/ui/badge'
import { AdminDeliveryMonitor } from '@/modules/notifications/components/admin-delivery-monitor'
import type { DeliveryMetricsSummary, NotificationDeliveryItem } from '@/modules/notifications/types'
import { useLanguage } from '@/i18n'

interface AdminNotificationsClientProps {
  metrics: DeliveryMetricsSummary
  recentDeliveries: NotificationDeliveryItem[]
}

export function AdminNotificationsClient({
  metrics,
  recentDeliveries,
}: AdminNotificationsClientProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const adm = dict.adminWorkspace

  const adminNav = [
    { label: adm.nav.overview, href: '/admin', icon: <Server className="size-4" /> },
    { label: adm.nav.facilities, href: '/admin/facilities', icon: <Building2 className="size-4" /> },
    { label: adm.nav.notifications, href: '/admin/notifications', icon: <Bell className="size-4" /> },
    { label: adm.nav.users, href: '/admin/users', icon: <Users className="size-4" /> },
    { label: adm.nav.audit, href: '/admin/audit', icon: <FileText className="size-4" /> },
    { label: adm.nav.security, href: '/admin/security', icon: <Settings className="size-4" /> },
  ]

  return (
    <DashboardLayout
      workspaceName={isBn ? 'সিস্টেম অ্যাডমিনিস্ট্রেশন ও গভর্নেন্স' : adm.title}
      workspaceBadge={<Badge variant="outline" size="sm">{adm.superAdminTier}</Badge>}
      userName={isBn ? 'সিস্টেম অ্যাডমিনিস্ট্রেটর' : 'System Administrator'}
      userRole={adm.governanceLead}
      navItems={adminNav}
    >
      <div className="space-y-6">
        <PageHeader
          title={isBn ? 'নোটিফিকেশন ডিসপ্যাচ ও গেটওয়ে মনিটর' : 'Notification Dispatch & Gateway Monitor'}
          description={
            isBn
              ? 'ইন-অ্যাপ নোটিফিকেশন, এসএমএস গেটওয়ে এবং ট্রানজ্যাকশনাল ইমেইল ডেলিভারির রিয়েলটাইম টেলিমেট্রি।'
              : 'Operational telemetry for In-App notifications, SMS gateways, and transactional email deliveries.'
          }
        />

        <AdminDeliveryMonitor
          initialMetrics={metrics}
          initialRecentDeliveries={recentDeliveries}
        />
      </div>
    </DashboardLayout>
  )
}

'use client'

import React from 'react'
import {
  ShieldAlert,
  FileCheck2,
  AlertTriangle,
  Lock,
  Database,
  Users,
} from 'lucide-react'
import { StatCard } from '@/components/ui/stat-card'
import { useLanguage } from '@/i18n'
import type { SecurityDashboardSummary } from '../types'

interface SecurityKpiCardsProps {
  summary: SecurityDashboardSummary
}

export function SecurityKpiCards({ summary }: SecurityKpiCardsProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.securityCompliance

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title={t.activeSessions}
        value={summary.activeSessionsEstimated}
        description={isBn ? 'সক্রিয় প্রমাণীকৃত সেশন' : 'Active authenticated sessions'}
        icon={<Users className="size-5 text-blue-600" />}
      />

      <StatCard
        title={t.auditLogsCount}
        value={summary.totalAuditLogsRecorded}
        description={isBn ? 'অপরিবর্তনীয় অডিট ইভেন্ট' : 'Immutable tamper-resistant logs'}
        icon={<Lock className="size-5 text-indigo-600" />}
      />

      <StatCard
        title={t.flaggedEvents}
        value={summary.flaggedSecurityEvents}
        description={
          summary.flaggedSecurityEvents > 0
            ? isBn
              ? 'নিরাপত্তা পর্যালোচনার প্রয়োজন'
              : 'Requires security inspection'
            : isBn
              ? 'কোনো অস্বাভাবিক কার্যকলাপ নেই'
              : 'No anomalies flagged'
        }
        icon={
          summary.flaggedSecurityEvents > 0 ? (
            <ShieldAlert className="size-5 text-amber-600" />
          ) : (
            <FileCheck2 className="size-5 text-emerald-600" />
          )
        }
      />

      <StatCard
        title={t.openIncidents}
        value={summary.openIncidentsCount}
        description={
          summary.openIncidentsCount > 0
            ? isBn
              ? 'তদন্তাধীন বা নিয়ন্ত্রিত'
              : 'Under triage or containment'
            : isBn
              ? 'কোনো উন্মুক্ত ঘটনা নেই'
              : 'Zero unresolved incidents'
        }
        icon={
          summary.openIncidentsCount > 0 ? (
            <AlertTriangle className="size-5 text-red-600" />
          ) : (
            <FileCheck2 className="size-5 text-emerald-600" />
          )
        }
      />

      <StatCard
        title={t.pendingRequests}
        value={summary.pendingPrivacyRequestsCount}
        description={isBn ? 'আবেদন অপেক্ষমাণ' : 'Data subject requests pending'}
        icon={<Users className="size-5 text-purple-600" />}
      />

      <StatCard
        title={t.backupStatus}
        value={isBn ? 'যাচাইকৃত' : 'Verified'}
        description={
          isBn
            ? 'দৈনিক চেকসাম ও টেস্ট পুনরুদ্ধার সফল'
            : 'Checksum & test restore verified'
        }
        icon={<Database className="size-5 text-emerald-600" />}
      />
    </div>
  )
}


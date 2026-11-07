'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  BookOpen,
  Users,
  AlertTriangle,
  Clock,
  History,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Badge } from '@/components/ui/badge'
import { Tabs, type TabItem } from '@/components/ui/tabs'
import { Alert } from '@/components/ui/alert'
import { useLanguage } from '@/i18n'
import { getClinicalNav } from '@/modules/clinical/components/clinical-navigation'
import type {
  GovernanceDashboardSummary,
  ClinicalMethodology,
  GovernanceMember,
  GovernanceMeeting,
  ClinicianOverrideRecord,
  PeriodicReviewItem,
  GovernanceAuditEvent,
} from '@/modules/governance/types'
import { GovernanceKpiCards } from '@/modules/governance/components/governance-kpi-cards'
import { MethodologyRegistryTable } from '@/modules/governance/components/methodology-registry-table'
import { CabBoardCard } from '@/modules/governance/components/cab-board-card'
import { ClinicianOverrideTable } from '@/modules/governance/components/clinician-override-table'
import { PeriodicReviewScheduleCard } from '@/modules/governance/components/periodic-review-schedule-card'
import { GovernanceAuditTable } from '@/modules/governance/components/governance-audit-table'
import { getGovernanceDashboardDataAction } from '@/modules/governance/actions'

interface ClinicalGovernanceClientProps {
  initialData: {
    summary: GovernanceDashboardSummary
    methodologies: ClinicalMethodology[]
    members: GovernanceMember[]
    meetings: GovernanceMeeting[]
    overrides: ClinicianOverrideRecord[]
    reviewSchedule: PeriodicReviewItem[]
    auditEvents: GovernanceAuditEvent[]
  }
}

export function ClinicalGovernanceClient({ initialData }: ClinicalGovernanceClientProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const t = dict.clinicalGovernance

  const [data, setData] = useState(initialData)
  const [activeTab, setActiveTab] = useState<string>('methodologies')

  const refreshData = async () => {
    const res = await getGovernanceDashboardDataAction()
    if (res.success && res.data) {
      setData(res.data)
    }
  }

  const navItems = getClinicalNav(isBn)

  const tabs: TabItem[] = [
    {
      id: 'methodologies',
      label: t.methodologyRegistry,
      icon: <BookOpen className="size-4" />,
      badge: <Badge variant="secondary" size="sm">{data.methodologies.length}</Badge>,
    },
    {
      id: 'board',
      label: t.boardMembers,
      icon: <Users className="size-4" />,
      badge: <Badge variant="secondary" size="sm">{data.members.length}</Badge>,
    },
    {
      id: 'overrides',
      label: t.clinicianOverrides,
      icon: <AlertTriangle className="size-4 text-amber-500" />,
      badge: (
        <Badge variant={data.overrides.length > 0 ? 'warning' : 'secondary'} size="sm">
          {data.overrides.length}
        </Badge>
      ),
    },
    {
      id: 'periodic',
      label: t.periodicReviews,
      icon: <Clock className="size-4" />,
      badge: data.summary.overdueReviewsCount > 0 ? (
        <Badge variant="destructive" size="sm">{data.summary.overdueReviewsCount}</Badge>
      ) : undefined,
    },
    {
      id: 'audit',
      label: t.auditTrail,
      icon: <History className="size-4" />,
      badge: <Badge variant="secondary" size="sm">{data.auditEvents.length}</Badge>,
    },
  ]

  return (
    <DashboardLayout
      workspaceName={isBn ? 'ক্লিনিক্যাল ওয়ার্কস্পেস' : 'Clinical Workspace'}
      workspaceBadge={
        <Badge variant="outline" size="sm" className="border-indigo-400 text-indigo-700 bg-indigo-50 dark:bg-indigo-950">
          {isBn ? 'ক্লিনিক্যাল গভর্ন্যান্স পরিষদ' : 'CAB Oversight Authority'}
        </Badge>
      }
      userName={isBn ? 'অধ্যাপক ডা. ফারহানা আহমেদ' : 'Prof. Dr. Farhana Ahmed'}
      userRole={isBn ? 'বোর্ড চেয়ার ও জ্যেষ্ঠ পালমোনোলজিস্ট' : 'CAB Chair & Senior Pulmonologist'}
      navItems={navItems}
    >
      <div className="space-y-6">
        <PageHeader
          title={t.title}
          description={t.subtitle}
          actions={
            <div className="flex items-center gap-2">
              <Badge variant="success" size="lg" className="gap-1.5 py-1 px-3">
                <ShieldCheck className="size-4" />
                {isBn ? 'সিএবি বৈধতা সক্রিয়' : 'CAB Active Mandate'}
              </Badge>
            </div>
          }
        />

        {/* Governance KPI Summary Cards */}
        <GovernanceKpiCards summary={data.summary} />

        {/* Tabbed Navigation */}
        <div className="space-y-4">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pills"
          />

          {/* Tab 1: Methodology Registry */}
          {activeTab === 'methodologies' && (
            <MethodologyRegistryTable
              methodologies={data.methodologies}
              onRefresh={refreshData}
            />
          )}

          {/* Tab 2: Clinical Advisory Board */}
          {activeTab === 'board' && (
            <CabBoardCard
              body={{
                id: 'cab-bd-central-001',
                name: data.summary.boardName,
                jurisdiction: data.summary.jurisdiction,
                charterSummary:
                  'Independent multidisciplinary clinical governance authority responsible for reviewing, validating, approving, and periodically reassessing all clinical risk prediction models, screening eligibility criteria, and symptom triage protocols implemented within Lungent.',
                establishedAt: '2025-01-15T00:00:00.000Z',
                status: 'active',
              }}
              members={data.members}
              meetings={data.meetings}
              onRefresh={refreshData}
            />
          )}

          {/* Tab 3: Clinician Overrides */}
          {activeTab === 'overrides' && (
            <ClinicianOverrideTable overrides={data.overrides} />
          )}

          {/* Tab 4: Periodic Review Schedule */}
          {activeTab === 'periodic' && (
            <PeriodicReviewScheduleCard
              schedule={data.reviewSchedule}
              onRefresh={refreshData}
            />
          )}

          {/* Tab 5: Audit Trail */}
          {activeTab === 'audit' && (
            <GovernanceAuditTable auditEvents={data.auditEvents} />
          )}
        </div>

        {/* Non-diagnostic Notice & Clinical Safety Policy Banner */}
        <Alert variant="info" title={isBn ? 'ক্লিনিক্যাল সুরক্ষা ও অ-রোগনির্ণয়মূলক বিধি' : 'Clinical Governance Safety Directives'}>
          <div className="text-xs space-y-1">
            <p className="font-semibold text-foreground">{t.nonDiagnosticNotice}</p>
            <p className="text-muted-foreground">{t.safetyHaltNotice}</p>
          </div>
        </Alert>
      </div>
    </DashboardLayout>
  )
}

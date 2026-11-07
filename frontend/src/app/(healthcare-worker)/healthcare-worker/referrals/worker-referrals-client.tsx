'use client'

import React, { useState } from 'react'
import {
  Share2,
  CalendarCheck,
  AlertTriangle,
  Clock,
  ShieldAlert,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Tabs } from '@/components/ui/tabs'
import { useLanguage } from '@/i18n'
import { getHealthcareWorkerNav } from '@/modules/healthcare-worker/components/worker-navigation'
import { ReferralsTable } from '@/modules/referrals/components/referrals-table'
import { FollowUpsTable } from '@/modules/referrals/components/followups-table'
import { CreateReferralDialog } from '@/modules/referrals/components/create-referral-dialog'
import { ScheduleFollowUpModal } from '@/modules/referrals/components/schedule-followup-modal'
import type { HealthcareReferralItem, PatientFollowUpItem } from '@/modules/referrals/types'

export interface WorkerReferralsClientProps {
  initialReferrals: HealthcareReferralItem[]
  initialFollowUps: PatientFollowUpItem[]
}

export function WorkerReferralsClient({
  initialReferrals,
  initialFollowUps,
}: WorkerReferralsClientProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'

  const [referrals, setReferrals] = useState<HealthcareReferralItem[]>(initialReferrals)
  const [followUps, setFollowUps] = useState<PatientFollowUpItem[]>(initialFollowUps)
  const [activeTab, setActiveTab] = useState<string>('referrals')
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  const activeReferralsCount = referrals.filter((r) => r.status !== 'completed' && r.status !== 'cancelled').length
  const urgentCount = referrals.filter((r) => r.priority === 'urgent_2ww' && r.status !== 'completed').length
  const overdueFollowUpsCount = followUps.filter((f) => f.status === 'overdue').length
  const scheduledCount = referrals.filter((r) => r.status === 'scheduled').length

  const navItems = getHealthcareWorkerNav(isBn, {
    referrals: activeReferralsCount,
  })

  const tabsList = [
    {
      id: 'referrals',
      label: isBn ? `ফিল্ড রেফারেল (${referrals.length})` : `Field Referrals (${referrals.length})`,
      icon: <Share2 className="h-4 w-4" />,
    },
    {
      id: 'followups',
      label: isBn ? `ফলো-আপ পরিকল্পনা (${followUps.length})` : `Follow-Up Plans (${followUps.length})`,
      icon: <CalendarCheck className="h-4 w-4" />,
    },
  ]

  return (
    <DashboardLayout workspaceName={isBn ? 'স্বাস্থ্যকর্মী ওয়ার্কস্পেস' : 'Healthcare Worker Workspace'} navItems={navItems}>
      <div className="space-y-6">
        <PageHeader
          title={isBn ? 'ফিল্ড রেফারেল ও ফলো-আপ ট্র্যাকিং' : 'Field Referrals & Follow-Up Tracking'}
          description={
            isBn
              ? 'কমিউনিটি ও ফিল্ড পর্যায়ে রোগীদের রেফারেল অগ্রগতি পর্যবেক্ষণ ও ফলো-আপ নিশ্চিতকরণ'
              : 'Track community patient specialist referrals, verify appointments, and coordinate local follow-up outreach.'
          }
          actions={
            <div className="flex items-center gap-2">
              <CreateReferralDialog
                patientId="11111111-1111-4111-a111-111111111111"
                patientName="Md. Rafiqul Islam"
                patientCanonicalId="LGT-2026-8K2M7P"
                defaultPriority="priority"
                onSuccess={(newRef) => setReferrals((prev) => [newRef, ...prev])}
              />
            </div>
          }
        />

        {/* Clinical Governance Banner */}
        <Alert className="border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-100">
          <ShieldAlert className="h-5 w-5 text-primary shrink-0" />
          <div className="space-y-1">
            <AlertTitle className="text-sm font-semibold">
              Field Care Continuity & Patient Privacy
            </AlertTitle>
            <AlertDescription className="text-xs">
              When contacting patients for appointment coordination, never disclose suspected diagnoses over unencrypted SMS or phone calls. Referrals coordinate specialist evaluation and are not a confirmed diagnosis of lung cancer.
            </AlertDescription>
          </div>
        </Alert>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-border">
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                <Share2 className="h-3.5 w-3.5 text-primary" />
                Active Referrals
              </span>
              <p className="text-2xl font-bold text-foreground">{activeReferralsCount}</p>
              <p className="text-[11px] text-muted-foreground">Community patients tracked</p>
            </CardContent>
          </Card>

          <Card className={`border ${urgentCount > 0 ? 'border-red-500/50 bg-red-500/5' : 'border-border'}`}>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="h-3.5 w-3.5" />
                Urgent 2WW Cases
              </span>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{urgentCount}</p>
              <p className="text-[11px] text-muted-foreground">Prioritized follow-up required</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-primary flex items-center gap-1.5 font-medium">
                <Clock className="h-3.5 w-3.5" />
                Scheduled Visits
              </span>
              <p className="text-2xl font-bold text-foreground">{scheduledCount}</p>
              <p className="text-[11px] text-muted-foreground">Appointment confirmed</p>
            </CardContent>
          </Card>

          <Card className={`border ${overdueFollowUpsCount > 0 ? 'border-amber-500/50 bg-amber-500/5' : 'border-border'}`}>
            <CardContent className="p-4 space-y-1">
              <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-semibold">
                <CalendarCheck className="h-3.5 w-3.5" />
                Overdue Follow-ups
              </span>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{overdueFollowUpsCount}</p>
              <p className="text-[11px] text-muted-foreground">Requires home / phone outreach</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Directory Content */}
        <div className="space-y-4">
          <Tabs
            tabs={tabsList}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId)}
            variant="pills"
          />

          {activeTab === 'referrals' ? (
            <ReferralsTable
              initialReferrals={referrals}
              onRefresh={() => {}}
              userRole="healthcare_worker"
            />
          ) : (
            <FollowUpsTable
              initialFollowUps={followUps}
              onRefresh={() => {}}
              userRole="healthcare_worker"
            />
          )}
        </div>
      </div>

      <ScheduleFollowUpModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSuccess={(newFu) => setFollowUps((prev) => [newFu, ...prev])}
        patientId="11111111-1111-4111-a111-111111111111"
        patientName="Md. Rafiqul Islam"
        patientCanonicalId="LGT-2026-8K2M7P"
      />
    </DashboardLayout>
  )
}

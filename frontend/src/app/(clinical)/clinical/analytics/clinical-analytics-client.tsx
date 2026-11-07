'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Badge } from '@/components/ui/badge'
import { getClinicalNav } from '@/modules/clinical/components/clinical-navigation'
import { WorkflowTurnaroundCard } from '@/modules/analytics/components/workflow-turnaround-card'
import { ReferralFollowUpFunnelCard } from '@/modules/analytics/components/referral-followup-funnel-card'
import { AnalyticsMetricCard } from '@/modules/analytics/components/analytics-metric-card'
import { AnalyticsMetricDictionaryModal } from '@/modules/analytics/components/analytics-metric-dictionary-modal'
import type { WorkflowReviewSummary, ReferralFollowUpSummary } from '@/modules/analytics/types'
import { useLanguage } from '@/i18n'
import { Clock, CheckCircle2, GitPullRequest, CalendarClock, BookOpen, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface ClinicalAnalyticsClientProps {
  workflows: WorkflowReviewSummary
  referrals: ReferralFollowUpSummary
}

export function ClinicalAnalyticsClient({
  workflows,
  referrals,
}: ClinicalAnalyticsClientProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'
  const [dictionaryOpen, setDictionaryOpen] = useState(false)
  const [selectedMetricId, setSelectedMetricId] = useState<string | undefined>()

  const navItems = getClinicalNav(isBn, {
    pendingReviews: workflows.awaitingClinicalReview,
    referrals: referrals.referralsByStatus.pending,
  })

  return (
    <DashboardLayout
      workspaceName={isBn ? 'ক্লিনিক্যাল সিদ্ধান্ত-সহায়তা পোর্টাল' : 'Clinical Decision Support'}
      workspaceBadge={<Badge variant="default" size="sm">{isBn ? 'কনসালট্যান্ট পালমোনোলজিস্ট' : 'Lead Clinician'}</Badge>}
      userName={isBn ? 'অধ্যাপক ডা. ফারহানা আহমেদ' : 'Prof. Dr. Farhana Ahmed'}
      userRole={isBn ? 'সিনিয়র কনসালট্যান্ট, রেসপিরেটরি মেডিসিন' : 'Senior Consultant Pulmonologist'}
      navItems={navItems}
    >
      <div className="space-y-6">
        <PageHeader
          title={isBn ? 'ক্লিনিক্যাল ওয়ার্কফ্লো ও রিভিউ অ্যানালিটিক্স' : 'Clinical Workflow & Review Analytics'}
          description={
            isBn
              ? 'পর্যালোচনার কাজের চাপ, অপেক্ষমাণ সারির সময়কাল এবং রেফারেল সমন্বয় পর্যবেক্ষণ।'
              : 'Workload management, assessment review queues, turnaround times, and referral status tracking.'
          }
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedMetricId(undefined)
                setDictionaryOpen(true)
              }}
              leftIcon={<BookOpen className="size-4" />}
            >
              {isBn ? 'মেট্রিক ডিকশনারি' : 'Metric Catalog'}
            </Button>
          }
        />

        {/* Clinical KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsMetricCard
            title={isBn ? 'পর্যালোচনা অপেক্ষমাণ' : 'Awaiting Review'}
            value={workflows.awaitingClinicalReview}
            description={isBn ? 'অনুমোদন বাকি থাকা মূল্যায়ন' : 'Assessments awaiting clinician review'}
            icon={<Clock className="size-4" />}
            badge={
              <Badge variant={workflows.awaitingClinicalReview > 0 ? 'warning' : 'outline'} size="sm">
                {workflows.reviewTurnaroundHoursAvg}h {isBn ? 'গড়' : 'avg'}
              </Badge>
            }
            onInfoClick={() => {
              setSelectedMetricId('assessments_awaiting_review')
              setDictionaryOpen(true)
            }}
          />

          <AnalyticsMetricCard
            title={isBn ? 'সম্পন্ন পর্যালোচনা' : 'Completed Reviews'}
            value={workflows.reviewed}
            description={isBn ? 'স্বাক্ষরিত ও যাচাইকৃত ফাইল' : 'Reviewed & clinically signed off'}
            icon={<CheckCircle2 className="size-4" />}
            badge={<Badge variant="success" size="sm">{isBn ? 'সম্পন্ন' : 'Done'}</Badge>}
            onInfoClick={() => {
              setSelectedMetricId('review_turnaround_time_hours')
              setDictionaryOpen(true)
            }}
          />

          <AnalyticsMetricCard
            title={isBn ? 'সক্রিয় রেফারেল' : 'Active Referrals'}
            value={referrals.referralsTotal}
            description={isBn ? 'বিশেষায়িত সেন্টারে প্রেরিত' : 'Specialist hospital pathways'}
            icon={<GitPullRequest className="size-4" />}
            onInfoClick={() => {
              setSelectedMetricId('active_referrals_count')
              setDictionaryOpen(true)
            }}
          />

          <AnalyticsMetricCard
            title={isBn ? 'বিলম্বে থাকা ফলো-আপ' : 'Overdue Follow-ups'}
            value={referrals.overdueFollowUps}
            description={isBn ? 'সময়মতো উপস্থিতিহীন অ্যাপয়েন্টমেন্ট' : 'Appointments past target date'}
            icon={<CalendarClock className="size-4" />}
            badge={
              referrals.overdueFollowUps > 0 ? (
                <Badge variant="destructive" size="sm">{isBn ? 'অ্যাকশন আবশ্যক' : 'Action Req'}</Badge>
              ) : (
                <Badge variant="success" size="sm">{isBn ? 'ক্লিয়ার' : 'Clear'}</Badge>
              )
            }
            onInfoClick={() => {
              setSelectedMetricId('overdue_followups_count')
              setDictionaryOpen(true)
            }}
          />
        </div>

        {/* Clinical Detail Cards */}
        <div className="space-y-4">
          <WorkflowTurnaroundCard workflows={workflows} />
          <ReferralFollowUpFunnelCard referrals={referrals} />
        </div>

        {/* Clinical Safety Protocol Notice */}
        <div className="flex items-start gap-2 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 text-xs">
          <ShieldCheck className="size-4 shrink-0 mt-0.5" />
          <span>
            {isBn
              ? 'ক্লিনিকাল নন-সাপ্রেশন প্রোটোকল: কোনো রোগীর অ্যাসিম্পটোম্যাটিক ঝুঁকি স্কোর কম থাকলেও, হেমোপ্টিসিস বা লাল পতাকাবাহী লক্ষণ উপস্থিত থাকলে তা অবিলম্বে জরুরি পর্যালোচনার তালিকায় শীর্ষস্থান পাবে।'
              : 'Clinical Safety Protocol: Asymptomatic low-risk scores never suppress red-flag clinical alerts. Concerning symptoms always escalate to priority status regardless of review queues.'}
          </span>
        </div>

        {/* Metric Dictionary Modal */}
        <AnalyticsMetricDictionaryModal
          isOpen={dictionaryOpen}
          onClose={() => setDictionaryOpen(false)}
          initialMetricId={selectedMetricId}
        />
      </div>
    </DashboardLayout>
  )
}

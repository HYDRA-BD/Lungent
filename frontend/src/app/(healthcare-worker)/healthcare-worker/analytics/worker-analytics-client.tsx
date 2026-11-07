'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { getHealthcareWorkerNav } from '@/modules/healthcare-worker/components/worker-navigation'
import { AnalyticsMetricCard } from '@/modules/analytics/components/analytics-metric-card'
import { AnalyticsMetricDictionaryModal } from '@/modules/analytics/components/analytics-metric-dictionary-modal'
import type { HealthcareWorkerStatisticsSummary, DataQualitySummary } from '@/modules/analytics/types'
import { useLanguage } from '@/i18n'
import { Users, FileCheck2, CheckSquare, BookOpen, AlertCircle } from 'lucide-react'

export interface WorkerAnalyticsClientProps {
  workers: HealthcareWorkerStatisticsSummary
  dataQuality: DataQualitySummary
}

export function WorkerAnalyticsClient({
  workers,
  dataQuality,
}: WorkerAnalyticsClientProps) {
  const { locale } = useLanguage()
  const isBn = locale === 'bn'
  const [dictionaryOpen, setDictionaryOpen] = useState(false)
  const [selectedMetricId, setSelectedMetricId] = useState<string | undefined>()

  const navItems = getHealthcareWorkerNav(isBn, {
    incomplete: dataQuality.incompletePatientProfilesCount,
    tasks: workers.pendingTasksCount,
  })

  return (
    <DashboardLayout
      workspaceName={isBn ? 'কমিউনিটি স্বাস্থ্যকর্মী পোর্টাল' : 'Community Health Worker Portal'}
      workspaceBadge={<Badge variant="secondary" size="sm">{isBn ? 'মাঠপর্যায়ের স্বাস্থ্যকর্মী' : 'Field CHW'}</Badge>}
      userName={isBn ? 'মোছা. নাসরিন আক্তার' : 'Nasrin Akhter'}
      userRole={isBn ? 'কমিউনিটি হেলথ প্রমোটার' : 'Community Health Promoter'}
      navItems={navItems}
    >
      <div className="space-y-6">
        <PageHeader
          title={isBn ? 'ফিল্ড আউটরিচ ও তথ্য সম্পূর্ণকরণ অ্যানালিটিক্স' : 'Field Outreach & Data Completeness Analytics'}
          description={
            isBn
              ? 'তৃণমূল পর্যায়ে রোগী নিবন্ধন, স্বাস্থ্য প্রোফাইল সম্পূর্ণকরণ এবং অপারেশনাল টাস্কের সার্বিক তথ্য।'
              : 'Community patient onboarding progress, health record completeness tracking, and operational tasks.'
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

        {/* Worker KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsMetricCard
            title={isBn ? 'নিবন্ধিত রোগী' : 'Patients Onboarded'}
            value={workers.patientsOnboarded}
            description={isBn ? 'মাঠপর্যায়ে যুক্ত রোগী' : 'Assigned community patients'}
            icon={<Users className="size-4" />}
            badge={<Badge variant="success" size="sm">{isBn ? 'সক্রিয়' : 'Active'}</Badge>}
            onInfoClick={() => {
              setSelectedMetricId('worker_activity_volume')
              setDictionaryOpen(true)
            }}
          />

          <AnalyticsMetricCard
            title={isBn ? 'সম্পন্ন ফাইল' : 'Completed Profiles'}
            value={workers.healthRecordsCompleted}
            description={isBn ? 'সম্পূর্ণ স্বাস্থ্য রেকর্ডযুক্ত' : 'Full baseline clinical records'}
            icon={<FileCheck2 className="size-4" />}
            onInfoClick={() => {
              setSelectedMetricId('incomplete_patient_profiles')
              setDictionaryOpen(true)
            }}
          />

          <AnalyticsMetricCard
            title={isBn ? 'অসম্পূর্ণ প্রোফাইল' : 'Incomplete Records'}
            value={dataQuality.incompletePatientProfilesCount}
            description={isBn ? 'জরুরি তথ্য ঘাটতি থাকা' : 'Missing essential inputs'}
            icon={<AlertCircle className="size-4" />}
            badge={
              dataQuality.incompletePatientProfilesCount > 0 ? (
                <Badge variant="warning" size="sm">{isBn ? 'ফলো-আপ প্রয়োজন' : 'Needs Follow-up'}</Badge>
              ) : (
                <Badge variant="success" size="sm">{isBn ? 'সম্পূর্ণ' : 'Complete'}</Badge>
              )
            }
            onInfoClick={() => {
              setSelectedMetricId('incomplete_patient_profiles')
              setDictionaryOpen(true)
            }}
          />

          <AnalyticsMetricCard
            title={isBn ? 'অপারেশনাল টাস্ক' : 'Pending Tasks'}
            value={workers.pendingTasksCount}
            description={isBn ? 'মাঠপর্যায়ের চলমান কাজ' : 'Assigned outreach actions'}
            icon={<CheckSquare className="size-4" />}
            onInfoClick={() => {
              setSelectedMetricId('worker_activity_volume')
              setDictionaryOpen(true)
            }}
          />
        </div>

        {/* Field Quality & Outreach Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isBn ? 'রেকর্ড সম্পূর্ণকরণ ও তথ্যের মান' : 'Record Completeness Progress'}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? 'রোগীর বয়স, ধূমপান ও পরিবারের ইতিহাস সংগ্রহের অগ্রগতি।'
                  : 'Progress in collecting age, pack-years, and chronic exposure histories.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{isBn ? 'সামগ্রিক গুণগত মান' : 'Overall Record Quality'}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {dataQuality.overallQualityScorePercent}%
                  </span>
                </div>
                <Progress value={dataQuality.overallQualityScorePercent} className="h-2" />
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isBn ? 'ধূমপানের ইতিহাস ঘাটতি:' : 'Missing Smoking Status:'}</span>
                  <span className="font-semibold text-foreground">{dataQuality.missingCriticalSmokingCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isBn ? 'অসম্পূর্ণ প্রোফাইল সংখ্যা:' : 'Incomplete Profile Count:'}</span>
                  <span className="font-semibold text-foreground">{dataQuality.incompletePatientProfilesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isBn ? 'সমন্বয় ব্যর্থতা:' : 'Offline Sync Failures:'}</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{dataQuality.syncFailuresCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {isBn ? 'অপারেশনাল নীতিমালা ও সুরক্ষা' : 'Operational Governance & Non-Punitive Notice'}
              </CardTitle>
              <CardDescription>
                {isBn
                  ? 'লুঞ্জেন্টের স্বাস্থ্যকর্মী সেবা মূল্যায়নের প্রাতিষ্ঠানিক নির্দেশিকা।'
                  : 'Institutional guidelines governing health worker activity monitoring.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-muted-foreground">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
                <span className="font-semibold text-foreground block">
                  {isBn ? '১. কাজের পরিমাণ বনাম গুণগত মান' : '1. Operational Volume vs Clinical Quality'}
                </span>
                <p>
                  {isBn
                    ? 'সংগৃহীত তথ্যের সংখ্যা কোনো স্বাস্থ্যকর্মীর ব্যক্তিগত দক্ষতা বা চিকিৎসার গুণগত মানের একক পরিমাপ নয়। এটি কেবল সেবামূলক কাজের পরিধি নির্দেশ করে।'
                    : 'Activity counts represent outreach volume only and must never be treated as performance rankings or clinician quality scores.'}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1.5">
                <span className="font-semibold text-foreground block">
                  {isBn ? '২. রোগীর অধিকার ও সম্মতি' : '2. Informed Consent Primacy'}
                </span>
                <p>
                  {isBn
                    ? 'রোগী তথ্য প্রদানে অসম্মতি জানালে তা কখনোই তথ্য ঘাটতি বা ত্রুটি হিসেবে কর্মীর বিরুদ্ধে গণ্য হবে না।'
                    : 'A patient declining to provide voluntary optional details is never counted as an operational failure by the healthcare worker.'}
                </p>
              </div>
            </CardContent>
          </Card>
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

'use client'

import React, { useState } from 'react'
import {
  Building2,
  Users,
  FileText,
  Settings,
  Server,
  Bell,
  BarChart3,
  Clock,
} from 'lucide-react'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { PageHeader } from '@/components/layouts/page-header'
import { Tabs } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { AnalyticsMetricCard } from '@/modules/analytics/components/analytics-metric-card'
import { AnalyticsFiltersBar } from '@/modules/analytics/components/analytics-filters-bar'
import { AnalyticsMetricDictionaryModal } from '@/modules/analytics/components/analytics-metric-dictionary-modal'
import { PatientAssessmentChartCard } from '@/modules/analytics/components/patient-assessment-chart-card'
import { WorkflowTurnaroundCard } from '@/modules/analytics/components/workflow-turnaround-card'
import { FacilityWorkerActivityTable } from '@/modules/analytics/components/facility-worker-activity-table'
import { ReferralFollowUpFunnelCard } from '@/modules/analytics/components/referral-followup-funnel-card'
import { GeographicDistributionTable } from '@/modules/analytics/components/geographic-distribution-table'
import { EnvironmentalAvailabilityCard } from '@/modules/analytics/components/environmental-availability-card'
import { DataQualityMonitorCard } from '@/modules/analytics/components/data-quality-monitor-card'
import { PlatformPerformanceCard } from '@/modules/analytics/components/platform-performance-card'
import type { OperationalAnalyticsDashboardData, OperationalAnalyticsFilter } from '@/modules/analytics/types'
import { getOperationalAnalyticsAction } from '@/modules/analytics/actions'
import { useLanguage } from '@/i18n'

export interface AdminAnalyticsClientProps {
  initialData: OperationalAnalyticsDashboardData
}

export function AdminAnalyticsClient({ initialData }: AdminAnalyticsClientProps) {
  const { dict, locale } = useLanguage()
  const isBn = locale === 'bn'
  const adm = dict.adminWorkspace

  const [data, setData] = useState<OperationalAnalyticsDashboardData>(initialData)
  const [filter, setFilter] = useState<OperationalAnalyticsFilter>(initialData.filterApplied)
  const [activeTab, setActiveTab] = useState<string>('overview')
  const [isLoading, setIsLoading] = useState(false)
  const [dictionaryOpen, setDictionaryOpen] = useState(false)
  const [selectedMetricId, setSelectedMetricId] = useState<string | undefined>()

  const adminNav = [
    { label: adm.nav.overview, href: '/admin', icon: <Server className="size-4" /> },
    { label: isBn ? 'অপারেশনাল অ্যানালিটিক্স' : 'Operational Analytics', href: '/admin/analytics', icon: <BarChart3 className="size-4" /> },
    { label: adm.nav.facilities, href: '/admin/facilities', icon: <Building2 className="size-4" /> },
    { label: adm.nav.notifications, href: '/admin/notifications', icon: <Bell className="size-4" /> },
    { label: isBn ? 'রিপোর্ট অডিট' : 'Report Oversight', href: '/admin/reports', icon: <FileText className="size-4" /> },
    { label: adm.nav.users, href: '/admin/users', icon: <Users className="size-4" /> },
    { label: adm.nav.audit, href: '/admin/audit', icon: <FileText className="size-4" /> },
    { label: adm.nav.security, href: '/admin/security', icon: <Settings className="size-4" /> },
  ]

  const handleFilterChange = async (newFilter: OperationalAnalyticsFilter) => {
    setFilter(newFilter)
    setIsLoading(true)
    try {
      const res = await getOperationalAnalyticsAction(newFilter, 'admin')
      if (res.success && res.data) {
        setData(res.data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const res = await getOperationalAnalyticsAction(filter, 'admin')
      if (res.success && res.data) {
        setData(res.data)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenMetricInfo = (metricId: string) => {
    setSelectedMetricId(metricId)
    setDictionaryOpen(true)
  }

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
          title={isBn ? 'অপারেশনাল অ্যানালিটিক্স ও প্ল্যাটফর্ম টেলিমেট্রি' : 'Operational Analytics & System Telemetry'}
          description={
            isBn
              ? 'লুঞ্জেন্টের ব্যবহার, ক্লিনিকাল ওয়ার্কফ্লো, স্বাস্থ্যকেন্দ্র কার্যক্রম, পরিবেশগত তথ্য এবং ডেটা কোয়ালিটি মনিটরিং।'
              : 'Platform-wide operational visibility into service usage, clinical review queues, facility activities, environmental coverage, and data quality.'
          }
        />

        {/* Global Filter Bar */}
        <AnalyticsFiltersBar
          filter={filter}
          onFilterChange={handleFilterChange}
          onOpenDictionary={() => {
            setSelectedMetricId(undefined)
            setDictionaryOpen(true)
          }}
          onRefresh={handleRefresh}
          isLoading={isLoading}
          availableFacilities={[
            { id: '22222222-1111-4111-a111-111111111111', name: 'Dhaka Central Pulmonary Institute' },
            { id: '22222222-1111-4111-a111-222222222222', name: 'NICRH Cancer Center' },
          ]}
        />

        {/* Top Operational KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AnalyticsMetricCard
            title={isBn ? 'নিবন্ধিত রোগী' : 'Registered Patients'}
            value={data.patients.totalRegistered}
            description={isBn ? 'মোট একক ক্যানোনিকাল রোগী' : 'Total unique canonical identities'}
            icon={<Users className="size-4" />}
            badge={<Badge variant="success" size="sm">{isBn ? 'সক্রিয়' : 'Active'}</Badge>}
            trend={{ value: '12%', direction: 'up', label: isBn ? 'এই মাসে' : 'this month' }}
            onInfoClick={() => handleOpenMetricInfo('total_registered_patients')}
          />

          <AnalyticsMetricCard
            title={isBn ? 'দাখিলকৃত মূল্যায়ন' : 'Assessments Submitted'}
            value={data.assessments.totalSubmitted}
            description={isBn ? 'সার্ভারে জমা দেওয়া মূল্যায়ন' : 'Authoritative submitted evaluations'}
            icon={<FileText className="size-4" />}
            badge={<Badge variant="secondary" size="sm">{data.assessments.completed} {isBn ? 'সম্পন্ন' : 'Done'}</Badge>}
            onInfoClick={() => handleOpenMetricInfo('total_assessments_submitted')}
          />

          <AnalyticsMetricCard
            title={isBn ? 'পর্যালোচনা অপেক্ষমাণ' : 'Pending Reviews'}
            value={data.workflows.awaitingClinicalReview}
            description={isBn ? 'চিকিৎসক পর্যালোচনার অপেক্ষায়' : 'Queue awaiting clinician sign-off'}
            icon={<Clock className="size-4" />}
            badge={
              <Badge variant={data.workflows.awaitingClinicalReview > 0 ? 'warning' : 'outline'} size="sm">
                {data.workflows.reviewTurnaroundHoursAvg}h {isBn ? 'গড় সময়' : 'avg'}
              </Badge>
            }
            onInfoClick={() => handleOpenMetricInfo('assessments_awaiting_review')}
          />

          <AnalyticsMetricCard
            title={isBn ? 'সক্রিয় স্বাস্থ্যকেন্দ্র' : 'Operational Facilities'}
            value={`${data.facilities.verifiedFacilities} / ${data.facilities.totalFacilities}`}
            description={isBn ? 'যাচাইকৃত সক্রিয় কেন্দ্র' : 'Verified & operational centers'}
            icon={<Building2 className="size-4" />}
            badge={<Badge variant="success" size="sm">{isBn ? 'যাচাইকৃত' : 'Verified'}</Badge>}
            onInfoClick={() => handleOpenMetricInfo('active_operational_facilities')}
          />
        </div>

        {/* Operational Analytics Tabs */}
        <div className="space-y-4">
          <Tabs
            tabs={[
              { id: 'overview', label: isBn ? 'সারসংক্ষেপ ও রোগী পরিসংখ্যান' : 'Overview & Patients' },
              { id: 'workflows', label: isBn ? 'ওয়ার্কফ্লো ও রেফারেল' : 'Workflows & Referrals' },
              { id: 'facilities', label: isBn ? 'স্বাস্থ্যকেন্দ্র ও মাঠকর্মী' : 'Facilities & Field CHWs' },
              { id: 'geographic', label: isBn ? 'ভৌগোলিক ও পরিবেশ' : 'Geographic & Environmental' },
              { id: 'quality', label: isBn ? 'তথ্যের মান ও টেলিমেট্রি' : 'Data Quality & Telemetry' },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="pills"
          />

          {/* 1. Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <PatientAssessmentChartCard
                patients={data.patients}
                assessments={data.assessments}
              />
            </div>
          )}

          {/* 2. Workflows & Referrals Tab */}
          {activeTab === 'workflows' && (
            <div className="space-y-4">
              <WorkflowTurnaroundCard workflows={data.workflows} />
              <ReferralFollowUpFunnelCard referrals={data.referrals} />
            </div>
          )}

          {/* 3. Facilities & Field CHWs Tab */}
          {activeTab === 'facilities' && (
            <div className="space-y-4">
              <FacilityWorkerActivityTable
                facilities={data.facilities}
                workers={data.workers}
              />
            </div>
          )}

          {/* 4. Geographic & Environmental Tab */}
          {activeTab === 'geographic' && (
            <div className="space-y-4">
              <GeographicDistributionTable geographics={data.geographics} />
              <EnvironmentalAvailabilityCard environmental={data.environmental} />
            </div>
          )}

          {/* 5. Data Quality & Telemetry Tab */}
          {activeTab === 'quality' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DataQualityMonitorCard dataQuality={data.dataQuality} />
                <PlatformPerformanceCard performance={data.performance} />
              </div>
            </div>
          )}
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

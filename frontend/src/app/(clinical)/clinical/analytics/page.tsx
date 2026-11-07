import type { Metadata } from 'next'
import { OperationalAnalyticsService } from '@/modules/analytics/service'
import { ClinicalAnalyticsClient } from './clinical-analytics-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Workflow Analytics | Clinical Decision Support',
  description: 'Workload management, assessment review queues, turnaround times, and referral status tracking.',
}

export default async function ClinicalAnalyticsPage() {
  const facilityId = 'facility-dhaka-central'
  const data = await OperationalAnalyticsService.getDashboardAnalytics(
    { dateRange: '30d', facilityId },
    'clinician',
    facilityId
  )

  return (
    <ClinicalAnalyticsClient
      workflows={data.workflows}
      referrals={data.referrals}
    />
  )
}

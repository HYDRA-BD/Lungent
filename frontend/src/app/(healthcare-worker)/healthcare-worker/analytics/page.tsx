import type { Metadata } from 'next'
import { OperationalAnalyticsService } from '@/modules/analytics/service'
import { WorkerAnalyticsClient } from './worker-analytics-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Outreach Analytics | Community Health Worker Portal',
  description: 'Community patient onboarding progress, health record completeness tracking, and operational tasks.',
}

export default async function WorkerAnalyticsPage() {
  const facilityId = 'facility-dhaka-central'
  const data = await OperationalAnalyticsService.getDashboardAnalytics(
    { dateRange: '30d', facilityId },
    'healthcare_worker',
    facilityId
  )

  return (
    <WorkerAnalyticsClient
      workers={data.workers}
      dataQuality={data.dataQuality}
    />
  )
}

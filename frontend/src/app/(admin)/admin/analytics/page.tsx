import type { Metadata } from 'next'
import { OperationalDataAggregator } from '@/modules/analytics/data-aggregator'
import { AdminAnalyticsClient } from './admin-analytics-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Operational Analytics & System Telemetry | Lungent Admin Portal',
  description: 'Platform-wide operational analytics, clinical review queue tracking, facility activity, and data quality monitoring.',
}

export default async function AdminAnalyticsPage() {
  const initialData = await OperationalDataAggregator.compileOperationalDashboard({
    dateRange: '30d',
  })

  return <AdminAnalyticsClient initialData={initialData} />
}

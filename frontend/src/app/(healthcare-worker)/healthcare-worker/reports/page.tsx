import type { Metadata } from 'next'
import { ReportingService } from '@/modules/reporting/service'
import { WorkerReportsClient } from './worker-reports-client'

export const metadata: Metadata = {
  title: 'Field Reports & Summaries | Lungent Healthcare Worker Workspace',
  description: 'Community outreach assessment reports, screening summaries, and specialist referral consultation letters.',
}

export default async function WorkerReportsPage() {
  const reports = await ReportingService.getReports()

  return <WorkerReportsClient initialReports={reports} />
}

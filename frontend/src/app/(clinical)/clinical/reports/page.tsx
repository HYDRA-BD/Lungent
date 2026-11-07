import type { Metadata } from 'next'
import { ReportingService } from '@/modules/reporting/service'
import { ClinicalReportsClient } from './clinical-reports-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Clinical Assessment Reports | Lungent Clinical CDSS',
  description: 'Audited, bilingual clinical assessment reports, risk estimations, screening evaluations, and referral records.',
}

export default async function ClinicalReportsPage() {
  const reports = await ReportingService.getReports()

  return <ClinicalReportsClient initialReports={reports} />
}

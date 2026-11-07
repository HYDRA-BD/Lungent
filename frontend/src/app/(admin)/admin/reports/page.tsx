import type { Metadata } from 'next'
import { ReportingService } from '@/modules/reporting/service'
import { AdminReportsClient } from './admin-reports-client'

export const metadata: Metadata = {
  title: 'Report Generation Oversight | Lungent Admin Portal',
  description: 'Operational metrics and audit telemetry for clinical report generation.',
}

export default async function AdminReportsPage() {
  const reports = await ReportingService.getReports()

  // Map to operational metadata only (data minimization)
  const operationalReports = reports.map(r => ({
    id: r.id,
    reportReference: r.reportReference,
    reportType: r.reportType,
    language: r.language,
    templateVersion: r.templateVersion,
    fileSizeBytes: r.fileSizeBytes,
    generatedByRole: r.generatedByRole,
    status: r.status,
    isPatientAccessible: r.isPatientAccessible,
    createdAt: r.createdAt,
  }))

  return <AdminReportsClient operationalReports={operationalReports} />
}

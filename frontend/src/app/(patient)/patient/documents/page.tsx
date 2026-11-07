import type { Metadata } from 'next'
import { PatientPortalService } from '@/modules/patient-portal/service'
import { ReportingService } from '@/modules/reporting/service'
import { PatientDocumentsClient } from './patient-documents-client'

export const metadata: Metadata = {
  title: 'Reports & Documents | Lungent Patient Portal',
  description: 'Access authorized clinical assessment summaries, referral letters, and formal clinical documents.',
}

const DEFAULT_PATIENT_ID = '11111111-1111-4111-a111-111111111111'

export default async function PatientDocumentsPage() {
  const patientId = DEFAULT_PATIENT_ID

  const [documents, reports] = await Promise.all([
    PatientPortalService.getDocuments(patientId),
    ReportingService.getReports({ patientId }),
  ])

  // Filter patient accessible reports
  const patientReports = reports.filter(r => r.isPatientAccessible)

  return <PatientDocumentsClient documents={documents} reports={patientReports} />
}

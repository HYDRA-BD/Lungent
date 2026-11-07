import type { Metadata } from 'next'
import { PatientPortalService } from '@/modules/patient-portal/service'
import { PatientScreeningClient } from './patient-screening-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Screening & Guidance | Lungent Patient Portal',
  description: 'Evidence-based guidance on Low-Dose Computed Tomography (LDCT) lung cancer screening and eligibility criteria.',
}

const DEFAULT_PATIENT_ID = '11111111-1111-4111-a111-111111111111'

export default async function PatientScreeningPage() {
  const patientId = DEFAULT_PATIENT_ID

  const [patient, summary] = await Promise.all([
    PatientPortalService.getPatientProfile(patientId),
    PatientPortalService.getDashboardSummary(patientId),
  ])

  return (
    <PatientScreeningClient
      patient={patient}
      screeningEligible={Boolean(summary.latestAssessment?.results?.screeningEligible)}
      latestAssessment={summary.latestAssessment}
    />
  )
}

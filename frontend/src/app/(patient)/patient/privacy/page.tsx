import type { Metadata } from 'next'
import { PatientPortalService } from '@/modules/patient-portal/service'
import { PatientPrivacyClient } from './patient-privacy-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Consent & Privacy | Lungent Patient Portal',
  description: 'Manage data sharing consents, privacy permissions, and consented link of prior anonymous self-checks.',
}

const DEFAULT_PATIENT_ID = '11111111-1111-4111-a111-111111111111'

export default async function PatientPrivacyPage() {
  const patientId = DEFAULT_PATIENT_ID

  const consents = await PatientPortalService.getConsents(patientId)

  return <PatientPrivacyClient consents={consents} patientId={patientId} />
}

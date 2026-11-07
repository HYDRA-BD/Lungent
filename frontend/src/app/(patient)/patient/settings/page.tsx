import type { Metadata } from 'next'
import { getCurrentUserWithRoles } from '@/modules/authentication/service'
import { PatientPortalService } from '@/modules/patient-portal/service'
import { PatientSettingsClient } from './patient-settings-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Account Settings | Lungent Patient Portal',
  description: 'Manage interface language, notification channels, sessions, and portal access.',
}

const DEFAULT_PATIENT_ID = '11111111-1111-4111-a111-111111111111'

export default async function PatientSettingsPage() {
  const patientId = DEFAULT_PATIENT_ID
  const user = await getCurrentUserWithRoles()

  const patient = await PatientPortalService.getPatientProfile(patientId)

  return (
    <PatientSettingsClient
      patient={patient}
      userEmail={user?.email || patient?.email || 'patient@example.com'}
    />
  )
}

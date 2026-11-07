import type { Metadata } from 'next'
import { PatientPortalService } from '@/modules/patient-portal/service'
import { PatientProfileViewClient } from './patient-profile-view-client'

export const instant = false

export const metadata: Metadata = {
  title: 'My Profile | Lungent Patient Portal',
  description: 'Manage personal contact details and view identity verification status.',
}

const DEFAULT_PATIENT_ID = '11111111-1111-4111-a111-111111111111'

export default async function PatientProfileViewPage() {
  const patientId = DEFAULT_PATIENT_ID

  const patient = await PatientPortalService.getPatientProfile(patientId)

  return <PatientProfileViewClient initialPatient={patient} />
}

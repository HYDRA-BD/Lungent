import type { Metadata } from 'next'
import { PatientPortalService } from '@/modules/patient-portal/service'
import { HealthRecordService } from '@/modules/health-records/service'
import { PatientHealthViewClient } from './patient-health-view-client'

export const instant = false

export const metadata: Metadata = {
  title: 'My Health Information | Lungent Patient Portal',
  description: 'View longitudinal medical records, past conditions, and submit clinical correction requests.',
}

const DEFAULT_PATIENT_ID = '11111111-1111-4111-a111-111111111111'

export default async function PatientHealthRecordViewPage() {
  const patientId = DEFAULT_PATIENT_ID

  const patient = await PatientPortalService.getPatientProfile(patientId)
  const healthRecord = await HealthRecordService.getComprehensiveHealthRecord(patient.id)

  return (
    <PatientHealthViewClient
      patient={patient}
      initialRecord={healthRecord}
    />
  )
}

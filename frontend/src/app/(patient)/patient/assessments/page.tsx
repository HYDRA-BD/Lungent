import type { Metadata } from 'next'
import { PatientPortalService } from '@/modules/patient-portal/service'
import { PatientAssessmentsClient } from './patient-assessments-client'

export const instant = false

export const metadata: Metadata = {
  title: 'My Assessments | Lungent Patient Portal',
  description: 'View ongoing and past lung health assessments and start a new survey.',
}

const DEFAULT_PATIENT_ID = '11111111-1111-4111-a111-111111111111'

export default async function PatientAssessmentsPage() {
  const patientId = DEFAULT_PATIENT_ID

  const [patient, assessments] = await Promise.all([
    PatientPortalService.getPatientProfile(patientId),
    PatientPortalService.getAssessments(patientId),
  ])

  return (
    <PatientAssessmentsClient
      patient={patient}
      initialAssessments={assessments}
    />
  )
}

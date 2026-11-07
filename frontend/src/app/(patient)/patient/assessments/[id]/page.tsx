import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PatientPortalService } from '@/modules/patient-portal/service'
import { PatientAssessmentResultClient } from './patient-assessment-result-client'

export const instant = false

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: `Assessment ${id} | Lungent Patient Portal`,
    description: 'Detailed clinical assessment result summary, limitations, and recommended next steps.',
  }
}

const DEFAULT_PATIENT_ID = '11111111-1111-4111-a111-111111111111'

export default async function PatientAssessmentDetailPage({ params }: PageProps) {
  const { id } = await params
  const patientId = DEFAULT_PATIENT_ID

  const [patient, assessment] = await Promise.all([
    PatientPortalService.getPatientProfile(patientId),
    PatientPortalService.getAssessmentById(patientId, id),
  ])

  if (!assessment) {
    notFound()
  }

  return (
    <PatientAssessmentResultClient
      patient={patient}
      assessment={assessment}
    />
  )
}

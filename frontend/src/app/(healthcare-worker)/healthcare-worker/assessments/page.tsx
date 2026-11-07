import type { Metadata } from 'next'
import {
  getWorkerAssessmentsAction,
  getAvailableFacilitiesForWorkerAction,
} from '@/modules/healthcare-worker/actions'
import { HealthcareWorkerService } from '@/modules/healthcare-worker/service'
import { WorkerAssessmentsClient } from './worker-assessments-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Assessment Workflows | Healthcare Worker Workspace',
  description: 'Initiate and monitor standardized lung cancer screening and symptom triage intakes.',
}

export default async function WorkerAssessmentsPage() {
  const facilityData = await getAvailableFacilitiesForWorkerAction()
  const activeFacilityId = facilityData.activeFacilityId || 'facility-dhaka-central'

  const assessmentsRes = await getWorkerAssessmentsAction(activeFacilityId)
  const initialAssessments = assessmentsRes.success && assessmentsRes.data ? assessmentsRes.data : []

  const assignedPatientsRes = await HealthcareWorkerService.getAssignedPatients(
    'staff-chw-01',
    activeFacilityId,
    { page: 1, pageSize: 20 }
  )

  return (
    <WorkerAssessmentsClient
      initialAssessments={initialAssessments}
      patients={assignedPatientsRes.patients}
      facilities={facilityData.facilities}
      activeFacilityId={activeFacilityId}
    />
  )
}

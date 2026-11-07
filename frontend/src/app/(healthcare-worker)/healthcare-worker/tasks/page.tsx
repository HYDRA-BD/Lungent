import type { Metadata } from 'next'
import {
  getWorkerTasksAction,
  getAvailableFacilitiesForWorkerAction,
} from '@/modules/healthcare-worker/actions'
import { HealthcareWorkerService } from '@/modules/healthcare-worker/service'
import { WorkerTasksClient } from './worker-tasks-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Operational Tasks | Healthcare Worker Workspace',
  description: 'Manage field priorities, data collection, screening follow-ups, and patient tasks.',
}

export default async function WorkerTasksPage() {
  const facilityData = await getAvailableFacilitiesForWorkerAction()
  const activeFacilityId = facilityData.activeFacilityId || 'facility-dhaka-central'

  const tasksRes = await getWorkerTasksAction(activeFacilityId)
  const initialTasks = tasksRes.success && tasksRes.data ? tasksRes.data : []

  const assignedPatientsRes = await HealthcareWorkerService.getAssignedPatients(
    'staff-chw-01',
    activeFacilityId,
    { page: 1, pageSize: 20 }
  )

  return (
    <WorkerTasksClient
      initialTasks={initialTasks}
      patients={assignedPatientsRes.patients}
      facilities={facilityData.facilities}
      activeFacilityId={activeFacilityId}
    />
  )
}

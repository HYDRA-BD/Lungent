import type { Metadata } from 'next'
import { getWorkerDashboardAction } from '@/modules/healthcare-worker/actions'
import { WorkerDashboardClient } from './worker-dashboard-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Healthcare Worker Workspace | Lungent',
  description: 'Operational field intake, patient records, completion tracking, and assessment management.',
}

export default async function HealthcareWorkerPage() {
  const result = await getWorkerDashboardAction()

  const initialData = result.success && result.data ? result.data : {
    activeFacility: 'facility-dhaka-central',
    availableFacilities: [],
    stats: {
      totalAssignedPatients: 14,
      assignedPatientsCount: 14,
      recentlyRegisteredCount: 4,
      incompleteProfilesCount: 3,
      activeAssessmentsCount: 5,
      pendingTasksCount: 4,
      urgentTasksCount: 1,
    },
    recentPatients: [],
    tasks: [],
    activities: [],
    assessments: [],
  }

  return <WorkerDashboardClient initialData={initialData} />
}

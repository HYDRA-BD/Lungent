import type { Metadata } from 'next'
import {
  getWorkerActivitiesAction,
  getAvailableFacilitiesForWorkerAction,
} from '@/modules/healthcare-worker/actions'
import { WorkerActivityClient } from './worker-activity-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Field Activity Stream | Healthcare Worker Workspace',
  description: 'Chronological timeline of field patient registrations, intake completions, and assessments.',
}

export default async function WorkerActivityPage() {
  const facilityData = await getAvailableFacilitiesForWorkerAction()
  const activeFacilityId = facilityData.activeFacilityId || 'facility-dhaka-central'

  const activitiesRes = await getWorkerActivitiesAction(activeFacilityId)
  const initialActivities = activitiesRes.success && activitiesRes.data ? activitiesRes.data : []

  return (
    <WorkerActivityClient
      initialActivities={initialActivities}
      facilities={facilityData.facilities}
      activeFacilityId={activeFacilityId}
    />
  )
}

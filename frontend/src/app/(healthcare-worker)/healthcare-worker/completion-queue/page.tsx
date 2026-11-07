import type { Metadata } from 'next'
import {
  getIncompleteQueueAction,
  getAvailableFacilitiesForWorkerAction,
} from '@/modules/healthcare-worker/actions'
import { WorkerCompletionClient } from './worker-completion-client'

export const instant = false

export const metadata: Metadata = {
  title: 'Completion Queue | Healthcare Worker Workspace',
  description: 'Identify and complete missing clinical factors for assigned patients.',
}

export default async function WorkerCompletionQueuePage() {
  const facilityData = await getAvailableFacilitiesForWorkerAction()
  const activeFacilityId = facilityData.activeFacilityId || 'facility-dhaka-central'

  const queueRes = await getIncompleteQueueAction(activeFacilityId)
  const initialQueue = queueRes.success && queueRes.data ? queueRes.data.patients : []

  return (
    <WorkerCompletionClient
      initialQueue={initialQueue}
      facilities={facilityData.facilities}
      activeFacilityId={activeFacilityId}
    />
  )
}

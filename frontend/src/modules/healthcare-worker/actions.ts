'use server'

import { revalidatePath } from 'next/cache'
import { HealthcareWorkerService } from './service'
import { FacilityService } from '@/modules/facilities/service'
import {
  initiateAssessmentSchema,
  createWorkerTaskSchema,
  updateWorkerTaskStatusSchema,
  switchActiveFacilitySchema,
} from './validation'
import { getCurrentUserWithRoles } from '@/modules/authentication/service'
import type {
  InitiateAssessmentInput,
  CreateWorkerTaskInput,
  WorkerTaskStatus,
} from './types'

export async function getWorkerDashboardAction(facilityId?: string) {
  try {
    const user = await getCurrentUserWithRoles().catch(() => null)
    const workerId = user?.id || 'staff-chw-01'
    const activeFacility =
      facilityId || (await HealthcareWorkerService.getActiveFacilityPreference(workerId))

    const stats = await HealthcareWorkerService.getDashboardSummary(workerId, activeFacility)
    const recentPatients = await HealthcareWorkerService.getAssignedPatients(
      workerId,
      activeFacility,
      { page: 1, pageSize: 6 }
    )
    const tasks = await HealthcareWorkerService.getWorkerTasks(workerId, activeFacility)
    const activities = await HealthcareWorkerService.getWorkerRecentActivities(
      workerId,
      activeFacility,
      8
    )
    const assessments = await HealthcareWorkerService.getWorkerAssessments(activeFacility)
    const facilitiesRes = await FacilityService.getFacilities({ page: 1, pageSize: 50 }).catch(() => ({ facilities: [] }))

    return {
      success: true,
      data: {
        activeFacility,
        availableFacilities: facilitiesRes.facilities,
        stats,
        recentPatients: recentPatients.patients,
        tasks: tasks.slice(0, 5),
        activities,
        assessments: assessments.slice(0, 5),
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve worker dashboard'
    return { success: false, error: message }
  }
}

export async function switchActiveFacilityAction(facilityId: string) {
  try {
    const validated = switchActiveFacilitySchema.parse({ facilityId })
    const user = await getCurrentUserWithRoles().catch(() => null)
    const workerId = user?.id || 'staff-chw-01'

    await HealthcareWorkerService.setActiveFacilityPreference(workerId, validated.facilityId)
    revalidatePath('/healthcare-worker')
    revalidatePath('/healthcare-worker/patients')
    revalidatePath('/healthcare-worker/assessments')
    revalidatePath('/healthcare-worker/completion-queue')
    revalidatePath('/healthcare-worker/tasks')
    revalidatePath('/healthcare-worker/activity')

    return { success: true, activeFacilityId: validated.facilityId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to switch facility'
    return { success: false, error: message }
  }
}

export async function initiateAssessmentAction(
  patientId: string,
  rawInput: InitiateAssessmentInput
) {
  try {
    const validated = initiateAssessmentSchema.parse(rawInput)
    const user = await getCurrentUserWithRoles().catch(() => null)
    const workerId = user?.id || 'staff-chw-01'
    const facilityId =
      validated.facilityId ||
      (await HealthcareWorkerService.getActiveFacilityPreference(workerId))

    const assessment = await HealthcareWorkerService.initiateAssessmentWorkflow(
      patientId,
      validated,
      workerId,
      facilityId
    )

    revalidatePath('/healthcare-worker')
    revalidatePath('/healthcare-worker/assessments')
    revalidatePath(`/healthcare-worker/patients/${patientId}`)
    return { success: true, data: assessment }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to initiate assessment'
    return { success: false, error: message }
  }
}

export async function createWorkerTaskAction(rawInput: CreateWorkerTaskInput) {
  try {
    const validated = createWorkerTaskSchema.parse(rawInput)
    const user = await getCurrentUserWithRoles().catch(() => null)
    const workerId = user?.id || 'staff-chw-01'

    const task = await HealthcareWorkerService.createWorkerTask(validated, workerId)
    revalidatePath('/healthcare-worker')
    revalidatePath('/healthcare-worker/tasks')
    return { success: true, data: task }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create task'
    return { success: false, error: message }
  }
}

export async function updateWorkerTaskStatusAction(
  taskId: string,
  rawStatus: WorkerTaskStatus
) {
  try {
    const { status } = updateWorkerTaskStatusSchema.parse({ status: rawStatus })
    const user = await getCurrentUserWithRoles().catch(() => null)
    const workerId = user?.id || 'staff-chw-01'

    const updated = await HealthcareWorkerService.updateWorkerTaskStatus(
      taskId,
      status,
      workerId
    )
    revalidatePath('/healthcare-worker')
    revalidatePath('/healthcare-worker/tasks')
    return { success: true, data: updated }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update task status'
    return { success: false, error: message }
  }
}

export async function getPatientCompletionAction(patientId: string) {
  try {
    const user = await getCurrentUserWithRoles().catch(() => null)
    const workerId = user?.id || 'staff-chw-01'
    const completion = await HealthcareWorkerService.getPatientCompletion(patientId, workerId)
    return { success: true, data: completion }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to evaluate patient completion'
    return { success: false, error: message }
  }
}

export async function getIncompleteQueueAction(
  facilityId?: string,
  params?: { query?: string; page?: number; pageSize?: number }
) {
  try {
    const user = await getCurrentUserWithRoles().catch(() => null)
    const workerId = user?.id || 'staff-chw-01'
    const activeFacility =
      facilityId || (await HealthcareWorkerService.getActiveFacilityPreference(workerId))

    const queue = await HealthcareWorkerService.getIncompletePatientsQueue(activeFacility, params)
    return { success: true, data: queue }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve completion queue'
    return { success: false, error: message }
  }
}

export async function getWorkerAssessmentsAction(
  facilityId?: string,
  params?: { patientId?: string; status?: string; type?: string }
) {
  try {
    const user = await getCurrentUserWithRoles().catch(() => null)
    const workerId = user?.id || 'staff-chw-01'
    const activeFacility =
      facilityId || (await HealthcareWorkerService.getActiveFacilityPreference(workerId))

    const list = await HealthcareWorkerService.getWorkerAssessments(activeFacility, params)
    return { success: true, data: list }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve assessments'
    return { success: false, error: message }
  }
}

export async function getWorkerTasksAction(facilityId?: string, status?: string) {
  try {
    const user = await getCurrentUserWithRoles().catch(() => null)
    const workerId = user?.id || 'staff-chw-01'
    const activeFacility =
      facilityId || (await HealthcareWorkerService.getActiveFacilityPreference(workerId))

    const tasks = await HealthcareWorkerService.getWorkerTasks(workerId, activeFacility, status)
    return { success: true, data: tasks }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve tasks'
    return { success: false, error: message }
  }
}

export async function getWorkerActivitiesAction(facilityId?: string) {
  try {
    const user = await getCurrentUserWithRoles().catch(() => null)
    const workerId = user?.id || 'staff-chw-01'
    const activeFacility =
      facilityId || (await HealthcareWorkerService.getActiveFacilityPreference(workerId))

    const activities = await HealthcareWorkerService.getWorkerRecentActivities(
      workerId,
      activeFacility,
      50
    )
    return { success: true, data: activities }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve activities'
    return { success: false, error: message }
  }
}

export async function getAvailableFacilitiesForWorkerAction() {
  try {
    const res = await FacilityService.getFacilities({ page: 1, pageSize: 50 }).catch(() => ({ facilities: [] }))
    const user = await getCurrentUserWithRoles().catch(() => null)
    const workerId = user?.id || 'staff-chw-01'
    const activeFacilityId = await HealthcareWorkerService.getActiveFacilityPreference(workerId)
    return { success: true, facilities: res.facilities, activeFacilityId }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve facilities'
    return { success: false, error: message, facilities: [], activeFacilityId: 'facility-dhaka-central' }
  }
}

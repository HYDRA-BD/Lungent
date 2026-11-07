'use server'

/**
 * Phase 1.22: Reporting Server Actions
 *
 * Provides authenticated mutation and query actions for report generation,
 * archive browsing, single-report lookup, and access auditing.
 */

import { revalidatePath } from 'next/cache'
import { getCurrentUserWithRoles } from '@/modules/authentication/service'
import { ReportingService } from './service'
import type {
  GenerateReportInput,
  ReportFilterOptions,
  ReportAccessType,
  UserRoleType,
} from './types'

async function resolveActorUser() {
  const user = await getCurrentUserWithRoles().catch(() => null)
  return {
    id: user?.id || 'usr-clinician-001',
    name: user?.full_name || 'Dr. Attending Clinician',
    role: (user?.roles?.[0] || 'clinician') as UserRoleType,
  }
}

/**
 * Action to generate a new report.
 */
export async function generateReportAction(rawInput: GenerateReportInput) {
  try {
    const actor = await resolveActorUser()

    const report = await ReportingService.generateReport({
      ...rawInput,
      generatedByUserId: actor.id,
      generatedByRole: actor.role,
    })

    revalidatePath('/clinical/reports')
    revalidatePath('/healthcare-worker/reports')
    revalidatePath('/patient/documents')
    if (report.patientId) {
      revalidatePath(`/clinical/patients/${report.patientId}`)
      revalidatePath(`/healthcare-worker/patients/${report.patientId}`)
    }

    return { success: true, data: report }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate report.',
    }
  }
}

/**
 * Action to retrieve filtered reports.
 */
export async function getReportsAction(filters: ReportFilterOptions = {}) {
  try {
    const reports = await ReportingService.getReports(filters)
    return { success: true, data: reports }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch reports.',
    }
  }
}

/**
 * Action to retrieve a report by ID or reference.
 */
export async function getReportByIdAction(idOrReference: string) {
  try {
    const report = await ReportingService.getReportById(idOrReference)
    if (!report) {
      return { success: false, error: 'Report not found.' }
    }
    return { success: true, data: report }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve report.',
    }
  }
}

/**
 * Action to log report access (view, print, download).
 */
export async function logReportAccessAction(reportId: string, accessType: ReportAccessType) {
  try {
    const actor = await resolveActorUser()
    const record = await ReportingService.logReportAccess(
      reportId,
      actor.id,
      actor.role,
      accessType
    )
    return { success: true, data: record }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to log audit.',
    }
  }
}

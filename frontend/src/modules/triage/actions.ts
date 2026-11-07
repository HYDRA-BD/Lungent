'use server'

/**
 * Phase 1.14: Symptom-Based Clinical Triage Engine - Server Actions
 */

import { revalidatePath } from 'next/cache'
import { SymptomTriageProtocolRegistry } from './protocol-registry'
import { SymptomTriageService } from './service'
import {
  evaluateSymptomTriageSchema,
  acknowledgeEscalationSchema,
  type EvaluateSymptomTriageSchemaInput,
  type AcknowledgeEscalationSchemaInput,
} from './validation'

export async function getAvailableTriageProtocolsAction() {
  try {
    const protocols = SymptomTriageProtocolRegistry.getAllProtocols()
    return { success: true, data: protocols }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve symptom triage protocols',
    }
  }
}

export async function getProtocolDetailsAction(protocolId: string) {
  try {
    const protocol = SymptomTriageProtocolRegistry.getProtocolById(protocolId)
    if (!protocol) {
      return { success: false, error: 'Protocol not found' }
    }
    const versions = SymptomTriageProtocolRegistry.getAllVersions(protocolId)
    const latestVersion = SymptomTriageProtocolRegistry.getLatestVersion(protocolId)
    return {
      success: true,
      data: {
        protocol,
        versions,
        latestVersion,
      },
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve protocol details',
    }
  }
}

export async function evaluateSymptomTriageAction(input: EvaluateSymptomTriageSchemaInput) {
  try {
    const validated = evaluateSymptomTriageSchema.parse(input)
    const record = await SymptomTriageService.evaluateSymptomTriage(validated)

    revalidatePath('/clinical/assessments')
    revalidatePath(`/clinical/patients/${input.patientId}`)
    revalidatePath('/healthcare-worker/assessments')
    revalidatePath('/patient/assessments')

    return { success: true, data: record }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to evaluate symptom triage',
    }
  }
}

export async function getTriageDeterminationAction(determinationId: string) {
  try {
    const record = SymptomTriageService.getDeterminationById(determinationId)
    if (!record) {
      return { success: false, error: 'Triage determination record not found' }
    }
    return { success: true, data: record }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve triage record',
    }
  }
}

export async function getPatientTriageHistoryAction(patientId: string) {
  try {
    const records = SymptomTriageService.getPatientDeterminations(patientId)
    return { success: true, data: records }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve patient triage history',
    }
  }
}

export async function getEscalationRecordsAction(options: { patientId?: string; facilityId?: string; status?: string } = {}) {
  try {
    const escalations = SymptomTriageService.getEscalations(options)
    return { success: true, data: escalations }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve escalation records',
    }
  }
}

export async function acknowledgeEscalationAction(input: AcknowledgeEscalationSchemaInput) {
  try {
    const validated = acknowledgeEscalationSchema.parse(input)
    const updated = SymptomTriageService.acknowledgeEscalation(
      validated.escalationId,
      validated.actionNotes,
      validated.markResolved
    )

    revalidatePath('/clinical/alerts')
    revalidatePath('/clinical/assessments')
    revalidatePath('/healthcare-worker/tasks')

    return { success: true, data: updated }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update escalation record',
    }
  }
}

/**
 * Phase 2.9: HL7 v2.5.1 Message Parser
 * Parses and normalizes HL7 v2 clinical messages (ORU^R01 unsolicited observation results,
 * ADT^A08 patient identity updates) into structured models and staging records.
 */

import type {
  ParsedHL7v2ORUMessage,
  HL7v2ObservationSegment,
  StagedDiagnosticRecordItem,
} from '../types'

/**
 * Converts HL7 v2 date/time (YYYYMMDD or YYYYMMDDHHmmss) to ISO-8601 string
 */
export function convertHL7DateToISO(hl7DateStr: string): string {
  if (!hl7DateStr) return new Date().toISOString()
  const clean = hl7DateStr.trim().replace(/[^0-9]/g, '')
  if (clean.length < 8) return new Date().toISOString()

  const year = clean.substring(0, 4)
  const month = clean.substring(4, 6)
  const day = clean.substring(6, 8)

  if (clean.length >= 14) {
    const hours = clean.substring(8, 10)
    const minutes = clean.substring(10, 12)
    const seconds = clean.substring(12, 14)
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`
  }

  return `${year}-${month}-${day}T00:00:00.000Z`
}

/**
 * Validates basic HL7 v2 message structure (must start with MSH segment)
 */
export function validateHL7v2Message(rawMessage: string): { isValid: boolean; error?: string } {
  if (!rawMessage || typeof rawMessage !== 'string') {
    return { isValid: false, error: 'Empty HL7 message payload' }
  }

  const trimmed = rawMessage.trim()
  if (!trimmed.startsWith('MSH')) {
    return { isValid: false, error: 'Message does not begin with MSH header segment' }
  }

  const lines = trimmed.split(/[\r\n]+/).filter(line => line.trim().length > 0)
  const hasPID = lines.some(line => line.startsWith('PID|'))
  const hasOBRorOBX = lines.some(line => line.startsWith('OBR|') || line.startsWith('OBX|'))

  if (!hasPID) {
    return { isValid: false, error: 'Missing mandatory PID (Patient Identification) segment' }
  }

  if (!hasOBRorOBX) {
    return { isValid: false, error: 'Missing clinical observation segments (OBR/OBX)' }
  }

  return { isValid: true }
}

/**
 * Parses an HL7 v2.5.1 ORU^R01 unsolicited observation result message
 */
export function parseHL7v2ORUMessage(rawMessage: string): ParsedHL7v2ORUMessage {
  const validation = validateHL7v2Message(rawMessage)
  if (!validation.isValid) {
    throw new Error(`HL7 Parsing Error: ${validation.error}`)
  }

  const lines = rawMessage.trim().split(/[\r\n]+/).filter(line => line.trim().length > 0)

  let messageControlId = ''
  let sendingApplication = ''
  let sendingFacility = ''
  let messageDateTime = new Date().toISOString()

  let patientId = ''
  let patientName = ''
  let patientBirthDate: string | undefined
  let patientGender: string | undefined

  let orderNumber = ''
  let universalServiceIdentifier = ''
  const observations: HL7v2ObservationSegment[] = []

  for (const line of lines) {
    const fields = line.split('|')
    const segmentType = fields[0]

    if (segmentType === 'MSH') {
      // MSH field indices: fields[1] is separator '|', so fields[2] is MSH-3
      // When splitting by '|', MSH is fields[0]
      // In standard HL7: MSH-1 is |, MSH-2 is ^~\&, MSH-3 is Sending App
      sendingApplication = fields[2] || 'UNKNOWN_APP'
      sendingFacility = fields[3] || 'UNKNOWN_FACILITY'
      messageDateTime = convertHL7DateToISO(fields[6] || '')
      messageControlId = fields[9] || `MSG-${Date.now()}`
    } else if (segmentType === 'PID') {
      patientId = fields[3] ? fields[3].split('^')[0] : 'UNKNOWN_PID'
      if (fields[5]) {
        const nameParts = fields[5].split('^')
        const family = nameParts[0] || ''
        const given = nameParts[1] || ''
        patientName = `${given} ${family}`.trim() || fields[5]
      }
      if (fields[7]) {
        patientBirthDate = convertHL7DateToISO(fields[7]).substring(0, 10)
      }
      if (fields[8]) {
        patientGender = fields[8].trim().toUpperCase()
      }
    } else if (segmentType === 'OBR') {
      orderNumber = fields[2] || fields[3] || 'ORDER_UNKNOWN'
      universalServiceIdentifier = fields[4] || 'SERVICE_UNKNOWN'
    } else if (segmentType === 'OBX') {
      const setID = parseInt(fields[1] || '1', 10)
      const valueType = fields[2] || 'ST'
      const idParts = (fields[3] || '').split('^')
      const observationIdentifier = {
        identifier: idParts[0] || 'UNKNOWN',
        text: idParts[1] || idParts[0] || 'Unknown Observation',
        nameOfCodingSystem: idParts[2] || 'LN',
      }
      const observationSubID = fields[4] || undefined
      const observationValue = fields[5] || ''
      const units = fields[6] ? fields[6].split('^')[0] : undefined
      const referencesRange = fields[7] || undefined
      const abnormalFlags = fields[8] || undefined
      const observationResultStatus = fields[11] || 'F'
      const observationDateTime = convertHL7DateToISO(fields[14] || '')

      observations.push({
        setID,
        valueType,
        observationIdentifier,
        observationSubID,
        observationValue,
        units,
        referencesRange,
        abnormalFlags,
        observationResultStatus,
        observationDateTime,
        producerId: fields[15] || undefined,
      })
    }
  }

  return {
    messageControlId,
    sendingApplication,
    sendingFacility,
    messageDateTime,
    patientId,
    patientName,
    patientBirthDate,
    patientGender,
    orderNumber,
    universalServiceIdentifier,
    observations,
  }
}

/**
 * Maps a single HL7 observation to a staged diagnostic record item
 */
export function hl7ObservationToStagedRecord(
  parsed: ParsedHL7v2ORUMessage,
  obs: HL7v2ObservationSegment,
  systemId: string,
  systemName: string
): Partial<StagedDiagnosticRecordItem> {
  return {
    patientId: parsed.patientId,
    systemId,
    systemName,
    externalRecordId: `${parsed.orderNumber}-${obs.setID}`,
    recordType: 'laboratory_result',
    testOrExamCode: obs.observationIdentifier.identifier,
    testOrExamName: obs.observationIdentifier.text,
    resultValue: obs.observationValue,
    resultUnit: obs.units,
    referenceRange: obs.referencesRange,
    statusInSource: obs.observationResultStatus === 'F' ? 'final' : obs.observationResultStatus === 'P' ? 'preliminary' : 'active',
    reportedAt: obs.observationDateTime || parsed.messageDateTime,
    clinicianReviewStatus: 'pending_review',
    reconciliationDecision: 'unreviewed',
    isSuppressedOrArchived: false,
  }
}


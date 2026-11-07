/**
 * Phase 2.9: HL7 FHIR Release 4 (R4) Transformer
 * Standardizes bidirectional transformation between Lungent patient risk models
 * and international standard FHIR R4 clinical resources (Patient, Observation, DiagnosticReport, ServiceRequest).
 */

import type {
  FHIRPatientResource,
  FHIRObservationResource,
  FHIRDiagnosticReportResource,
  FHIRServiceRequestResource,
  StagedDiagnosticRecordItem,
} from '../types'

// Standard Terminology Coding Systems
export const LOINC_SYSTEM_URI = 'http://loinc.org'
export const SNOMED_CT_SYSTEM_URI = 'http://snomed.info/sct'
export const LUNGENT_SYSTEM_URI = 'https://lungent.health.gov.bd/fhir/systems'

export const STANDARD_LOINC_CODES = {
  TOBACCO_SMOKING_STATUS: {
    code: '72166-2',
    display: 'Tobacco smoking status',
    system: LOINC_SYSTEM_URI,
  },
  OXYGEN_SATURATION_SPO2: {
    code: '20564-1',
    display: 'Oxygen saturation in Arterial blood by Pulse oximetry',
    system: LOINC_SYSTEM_URI,
  },
  CT_CHEST_IMAGING: {
    code: '24356-8',
    display: 'CT Chest with or without contrast',
    system: LOINC_SYSTEM_URI,
  },
  PRIOR_TUBERCULOSIS_HISTORY: {
    code: '21612-7',
    display: 'History of Tuberculosis',
    system: LOINC_SYSTEM_URI,
  },
} as const

export const STANDARD_SNOMED_CODES = {
  COPD: {
    code: '13645005',
    display: 'Chronic obstructive pulmonary disease (disorder)',
    system: SNOMED_CT_SYSTEM_URI,
  },
  TUBERCULOSIS: {
    code: '56717001',
    display: 'Tuberculosis (disorder)',
    system: SNOMED_CT_SYSTEM_URI,
  },
  LOW_DOSE_CT_SCREENING: {
    code: '424132000',
    display: 'Low dose computed tomography of chest for lung cancer screening',
    system: SNOMED_CT_SYSTEM_URI,
  },
} as const

/**
 * Transforms a Lungent Patient record to a FHIR R4 Patient Resource
 */
export function transformPatientToFHIR(patient: {
  id: string
  fullName: string
  gender: string
  dateOfBirth?: string
  contactNumber?: string
  district?: string
}): FHIRPatientResource {
  const nameParts = patient.fullName.trim().split(/\s+/)
  const family = nameParts.length > 1 ? nameParts[nameParts.length - 1] : patient.fullName
  const given = nameParts.length > 1 ? nameParts.slice(0, -1) : [patient.fullName]

  const genderNormalized: 'male' | 'female' | 'other' | 'unknown' =
    patient.gender.toLowerCase() === 'male' || patient.gender.toLowerCase() === 'm'
      ? 'male'
      : patient.gender.toLowerCase() === 'female' || patient.gender.toLowerCase() === 'f'
        ? 'female'
        : patient.gender.toLowerCase() === 'other'
          ? 'other'
          : 'unknown'

  const resource: FHIRPatientResource = {
    resourceType: 'Patient',
    id: patient.id,
    active: true,
    identifier: [
      {
        use: 'official',
        system: `${LUNGENT_SYSTEM_URI}/patient-id`,
        value: patient.id,
      },
    ],
    name: [
      {
        use: 'official',
        family,
        given,
        text: patient.fullName,
      },
    ],
    gender: genderNormalized,
  }

  if (patient.dateOfBirth) {
    resource.birthDate = patient.dateOfBirth
  }

  if (patient.contactNumber) {
    resource.telecom = [
      {
        system: 'phone',
        value: patient.contactNumber,
      },
    ]
  }

  if (patient.district) {
    resource.address = [
      {
        use: 'home',
        district: patient.district,
        country: 'BGD',
      },
    ]
  }

  return resource
}

/**
 * Transforms Smoking History Assessment into FHIR R4 Observation (LOINC 72166-2)
 */
export function transformSmokingObservationToFHIR(
  patientId: string,
  smokingData: {
    isSmoker: boolean
    packYears?: number
    statusText?: string
  }
): FHIRObservationResource {
  const statusDisplay = smokingData.statusText || (smokingData.isSmoker ? 'Current every day smoker' : 'Never smoker')

  const obs: FHIRObservationResource = {
    resourceType: 'Observation',
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'social-history',
            display: 'Social History',
          },
        ],
      },
    ],
    code: {
      coding: [STANDARD_LOINC_CODES.TOBACCO_SMOKING_STATUS],
      text: 'Tobacco smoking status',
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    effectiveDateTime: new Date().toISOString(),
    valueString: statusDisplay,
  }

  if (smokingData.packYears !== undefined && smokingData.packYears > 0) {
    obs.note = [{ text: `Pack years: ${smokingData.packYears}` }]
  }

  return obs
}

/**
 * Transforms Pulse Oximetry (SpO2) into FHIR R4 Observation (LOINC 20564-1)
 */
export function transformSpO2ObservationToFHIR(
  patientId: string,
  spO2Percentage: number
): FHIRObservationResource {
  return {
    resourceType: 'Observation',
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs',
          },
        ],
      },
    ],
    code: {
      coding: [STANDARD_LOINC_CODES.OXYGEN_SATURATION_SPO2],
      text: 'Oxygen saturation in Arterial blood by Pulse oximetry',
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    effectiveDateTime: new Date().toISOString(),
    valueQuantity: {
      value: spO2Percentage,
      unit: '%',
      system: 'http://unitsofmeasure.org',
      code: '%',
    },
    interpretation: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
            code: spO2Percentage < 90 ? 'L' : spO2Percentage < 95 ? 'N' : 'N',
            display: spO2Percentage < 90 ? 'Low / Hypoxia' : 'Normal',
          },
        ],
      },
    ],
  }
}

/**
 * Transforms Tuberculosis Medical History into FHIR R4 Observation (LOINC 21612-7)
 */
export function transformTBHistoryObservationToFHIR(
  patientId: string,
  hasPriorTB: boolean
): FHIRObservationResource {
  return {
    resourceType: 'Observation',
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'exam',
            display: 'Exam',
          },
        ],
      },
    ],
    code: {
      coding: [STANDARD_LOINC_CODES.PRIOR_TUBERCULOSIS_HISTORY],
      text: 'History of Tuberculosis',
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    effectiveDateTime: new Date().toISOString(),
    valueString: hasPriorTB ? 'History of active tuberculosis' : 'No prior history of tuberculosis',
  }
}

/**
 * Transforms a CT Chest Screening Recommendation into a FHIR R4 ServiceRequest (SNOMED 424132000)
 */
export function transformServiceRequestToFHIR(
  patientId: string,
  requestData: {
    priority?: 'routine' | 'urgent' | 'asap' | 'stat'
    reason?: string
    code?: string
    display?: string
    requesterName?: string
  }
): FHIRServiceRequestResource {
  return {
    resourceType: 'ServiceRequest',
    status: 'active',
    intent: 'order',
    priority: requestData.priority || 'routine',
    code: {
      coding: [
        {
          system: SNOMED_CT_SYSTEM_URI,
          code: requestData.code || STANDARD_SNOMED_CODES.LOW_DOSE_CT_SCREENING.code,
          display: requestData.display || STANDARD_SNOMED_CODES.LOW_DOSE_CT_SCREENING.display,
        },
      ],
      text: requestData.display || 'Low-dose computed tomography (LDCT) chest screening',
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    authoredOn: new Date().toISOString(),
    requester: {
      reference: `Practitioner/lungent-decision-support`,
      display: requestData.requesterName || 'Lungent Clinical Decision Support System',
    },
    note: requestData.reason ? [{ text: requestData.reason }] : undefined,
  }
}

/**
 * Transforms a Diagnostic Report payload to FHIR R4 DiagnosticReport
 */
export function transformDiagnosticReportToFHIR(reportData: {
  id?: string
  patientId: string
  reportTitle: string
  conclusion: string
  modality?: string
  issued?: string
}): FHIRDiagnosticReportResource {
  const timestamp = reportData.issued || new Date().toISOString()
  return {
    resourceType: 'DiagnosticReport',
    id: reportData.id,
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: reportData.modality === 'CT' ? 'RAD' : 'LAB',
            display: reportData.modality === 'CT' ? 'Radiology' : 'Laboratory',
          },
        ],
      },
    ],
    code: {
      coding: [STANDARD_LOINC_CODES.CT_CHEST_IMAGING],
      text: reportData.reportTitle,
    },
    subject: {
      reference: `Patient/${reportData.patientId}`,
    },
    effectiveDateTime: timestamp,
    issued: timestamp,
    conclusion: reportData.conclusion,
  }
}

/**
 * Parses an inbound FHIR Observation into a staged diagnostic record item
 */
export function parseFHIRObservationToStaged(
  obs: FHIRObservationResource,
  systemId: string,
  systemName: string
): Partial<StagedDiagnosticRecordItem> {
  const patientRef = obs.subject.reference.replace(/^Patient\//, '')
  const testCode = obs.code.coding?.[0]?.code || 'UNKNOWN'
  const testName = obs.code.text || obs.code.coding?.[0]?.display || 'External Clinical Observation'

  let resultVal = ''
  let resultUnit: string | undefined

  if (obs.valueQuantity) {
    resultVal = String(obs.valueQuantity.value)
    resultUnit = obs.valueQuantity.unit
  } else if (obs.valueString) {
    resultVal = obs.valueString
  }

  return {
    patientId: patientRef,
    systemId,
    systemName,
    externalRecordId: obs.id || `fhir-obs-${Date.now()}`,
    recordType: 'laboratory_result',
    testOrExamCode: testCode,
    testOrExamName: testName,
    resultValue: resultVal,
    resultUnit,
    statusInSource: obs.status,
    reportedAt: obs.effectiveDateTime || new Date().toISOString(),
    clinicianReviewStatus: 'pending_review',
    reconciliationDecision: 'unreviewed',
    isSuppressedOrArchived: false,
  }
}

/**
 * Parses an inbound FHIR DiagnosticReport into a staged diagnostic record item
 */
export function parseFHIRDiagnosticReportToStaged(
  report: FHIRDiagnosticReportResource,
  systemId: string,
  systemName: string
): Partial<StagedDiagnosticRecordItem> {
  const patientRef = report.subject.reference.replace(/^Patient\//, '')
  const testCode = report.code.coding?.[0]?.code || 'UNKNOWN'
  const testName = report.code.text || report.code.coding?.[0]?.display || 'External Diagnostic Report'

  return {
    patientId: patientRef,
    systemId,
    systemName,
    externalRecordId: report.id || `fhir-rep-${Date.now()}`,
    recordType: 'imaging_report',
    testOrExamCode: testCode,
    testOrExamName: testName,
    modality: 'CT',
    clinicalImpression: report.conclusion,
    statusInSource: report.status,
    reportedAt: report.issued || report.effectiveDateTime || new Date().toISOString(),
    clinicianReviewStatus: 'pending_review',
    reconciliationDecision: 'unreviewed',
    isSuppressedOrArchived: false,
  }
}


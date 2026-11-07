/**
 * Phase 2.9: DICOM Part 10 CT Bridge
 * Parses and extracts low-dose computed tomography (LDCT) screening parameters,
 * radiation dose metrics (CTDIvol, DLP), and maps DICOM series metadata to FHIR DiagnosticReport.
 */

import type {
  DICOMSeriesMetadata,
  FHIRDiagnosticReportResource,
  StagedDiagnosticRecordItem,
} from '../types'
import { STANDARD_LOINC_CODES, STANDARD_SNOMED_CODES } from './fhir-r4-transformer'

/**
 * Benchmark threshold for Low-Dose CT protocol:
 * Under ACR / NLST guidelines, thoracic LDCT screening protocol CTDIvol <= 3.0 mGy.
 * Standard diagnostic chest CT typically runs 8 - 15 mGy.
 */
export const LDCT_CTDIVOL_MAX_THRESHOLD_MGY = 3.0
export const LDCT_DLP_MAX_THRESHOLD_MGY_CM = 150.0

/**
 * Checks whether radiation dose parameters conform to low-dose CT protocol
 */
export function isLowDoseCTProtocol(ctdiVolMgy?: number, dlpMgyCm?: number): boolean {
  if (ctdiVolMgy !== undefined && ctdiVolMgy > 0) {
    return ctdiVolMgy <= LDCT_CTDIVOL_MAX_THRESHOLD_MGY
  }
  if (dlpMgyCm !== undefined && dlpMgyCm > 0) {
    return dlpMgyCm <= LDCT_DLP_MAX_THRESHOLD_MGY_CM
  }
  return false
}

/**
 * Parses raw DICOM Part 10 CT metadata dictionary into typed DICOMSeriesMetadata
 */
export function parseDICOMMetadata(raw: Record<string, unknown>): DICOMSeriesMetadata {
  const modality = (String(raw.Modality || raw['00080060'] || 'CT')).toUpperCase() as 'CT' | 'CR' | 'DX' | 'MR'
  const sopInstanceUID = String(raw.SOPInstanceUID || raw['00080018'] || `1.2.840.10008.${Date.now()}`)
  const studyInstanceUID = String(raw.StudyInstanceUID || raw['0020000D'] || `1.2.840.10008.${Date.now()}.1`)
  const seriesInstanceUID = String(raw.SeriesInstanceUID || raw['0020000E'] || `1.2.840.10008.${Date.now()}.2`)

  const studyDate = String(raw.StudyDate || raw['00080020'] || new Date().toISOString().substring(0, 10))
  const studyDescription = String(raw.StudyDescription || raw['00081030'] || 'Chest CT Scan')
  const seriesDescription = String(raw.SeriesDescription || raw['0008103E'] || 'Axial 1.25mm Lung Window')
  const bodyPartExamined = String(raw.BodyPartExamined || raw['00180015'] || 'CHEST').toUpperCase()
  const patientPosition = raw.PatientPosition ? String(raw.PatientPosition) : undefined

  const sliceThicknessMm = raw.SliceThickness || raw['00180050']
    ? Number(raw.SliceThickness || raw['00180050'])
    : undefined

  const reconstructionKernel = raw.ConvolutionKernel || raw['00181210']
    ? String(raw.ConvolutionKernel || raw['00181210'])
    : undefined

  const ctdiVolRaw = raw.CTDIvol || raw['00189345']
  const ctdiVolMgy = ctdiVolRaw !== undefined ? Number(ctdiVolRaw) : undefined

  const dlpRaw = raw.DLP || raw['00e11021'] || raw['00189346']
  const doseLengthProductMgyCm = dlpRaw !== undefined ? Number(dlpRaw) : undefined

  const isLowDose = isLowDoseCTProtocol(ctdiVolMgy, doseLengthProductMgyCm)

  const institutionName = String(raw.InstitutionName || raw['00080080'] || 'NICRH Pulmonary Imaging Center')
  const referringPhysicianName = raw.ReferringPhysicianName ? String(raw.ReferringPhysicianName) : undefined

  return {
    sopInstanceUID,
    studyInstanceUID,
    seriesInstanceUID,
    modality,
    studyDate,
    studyDescription,
    seriesDescription,
    bodyPartExamined,
    patientPosition,
    sliceThicknessMm,
    reconstructionKernel,
    radiationDose: {
      ctdiVolMgy,
      doseLengthProductMgyCm,
      isLowDoseProtocol: isLowDose,
    },
    institutionName,
    referringPhysicianName,
  }
}

/**
 * Transforms DICOM series metadata to FHIR R4 DiagnosticReport
 */
export function dicomSeriesToFHIRDiagnosticReport(
  meta: DICOMSeriesMetadata,
  patientId: string
): FHIRDiagnosticReportResource {
  const protocolText = meta.radiationDose.isLowDoseProtocol
    ? 'Verified Low-Dose CT (LDCT) Protocol'
    : 'Standard Diagnostic Thoracic CT Protocol'

  const conclusion = [
    `Radiology CT Chest Examination (${meta.institutionName}).`,
    `Series: ${meta.seriesDescription}, Slice Thickness: ${meta.sliceThicknessMm || 'N/A'}mm.`,
    `Protocol: ${protocolText}.`,
    meta.radiationDose.ctdiVolMgy ? `CTDIvol: ${meta.radiationDose.ctdiVolMgy} mGy.` : null,
    meta.radiationDose.doseLengthProductMgyCm ? `DLP: ${meta.radiationDose.doseLengthProductMgyCm} mGy*cm.` : null,
  ].filter(Boolean).join(' ')

  return {
    resourceType: 'DiagnosticReport',
    id: `pacs-${meta.seriesInstanceUID.replace(/[^a-zA-Z0-9-]/g, '')}`,
    status: 'final',
    category: [
      {
        coding: [
          {
            system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
            code: 'RAD',
            display: 'Radiology',
          },
        ],
      },
    ],
    code: {
      coding: [
        meta.radiationDose.isLowDoseProtocol
          ? {
              system: STANDARD_SNOMED_CODES.LOW_DOSE_CT_SCREENING.system,
              code: STANDARD_SNOMED_CODES.LOW_DOSE_CT_SCREENING.code,
              display: STANDARD_SNOMED_CODES.LOW_DOSE_CT_SCREENING.display,
            }
          : {
              system: STANDARD_LOINC_CODES.CT_CHEST_IMAGING.system,
              code: STANDARD_LOINC_CODES.CT_CHEST_IMAGING.code,
              display: STANDARD_LOINC_CODES.CT_CHEST_IMAGING.display,
            },
      ],
      text: meta.studyDescription,
    },
    subject: {
      reference: `Patient/${patientId}`,
    },
    effectiveDateTime: meta.studyDate.includes('T') ? meta.studyDate : `${meta.studyDate}T00:00:00.000Z`,
    issued: new Date().toISOString(),
    conclusion,
  }
}

/**
 * Staging representation for DICOM imaging record
 */
export function dicomSeriesToStagedRecord(
  meta: DICOMSeriesMetadata,
  patientId: string,
  systemId: string,
  systemName: string
): Partial<StagedDiagnosticRecordItem> {
  const protocolText = meta.radiationDose.isLowDoseProtocol ? 'LDCT (Low-Dose)' : 'Diagnostic CT'
  const clinicalImpression = `CT Thorax series '${meta.seriesDescription}'. Slice thickness ${meta.sliceThicknessMm || 'N/A'}mm. Dose index CTDIvol: ${meta.radiationDose.ctdiVolMgy ?? 'N/A'} mGy (${protocolText}). Facility: ${meta.institutionName}.`

  return {
    patientId,
    systemId,
    systemName,
    externalRecordId: meta.seriesInstanceUID,
    recordType: 'imaging_report',
    testOrExamCode: meta.radiationDose.isLowDoseProtocol ? 'SNOMED:424132000' : 'LOINC:24356-8',
    testOrExamName: `Computed Tomography (CT) Chest - ${protocolText}`,
    modality: meta.modality,
    resultValue: meta.radiationDose.ctdiVolMgy !== undefined ? `${meta.radiationDose.ctdiVolMgy} mGy` : undefined,
    resultUnit: 'mGy',
    referenceRange: '< 3.0 mGy (LDCT threshold)',
    clinicalImpression,
    statusInSource: 'completed',
    reportedAt: meta.studyDate.includes('T') ? meta.studyDate : `${meta.studyDate}T00:00:00.000Z`,
    clinicianReviewStatus: 'pending_review',
    reconciliationDecision: 'unreviewed',
    isSuppressedOrArchived: false,
  }
}


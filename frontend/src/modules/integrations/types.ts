/**
 * Phase 2.9: Advanced Healthcare Integrations Types & Domain Definitions
 */

export type HealthcareSystemType =
  | 'ehr'
  | 'lis'
  | 'pacs_ris'
  | 'facility_registry'
  | 'identity_service'
  | 'health_information_exchange'

export type InteroperabilityStandard =
  | 'hl7_fhir_r4'
  | 'hl7_v2'
  | 'dicom_bridge'
  | 'rest_json'
  | 'smart_on_fhir'

export type IntegrationConnectionStatus =
  | 'active'
  | 'degraded'
  | 'disconnected'
  | 'sandbox_mock'
  | 'maintenance'

export type ImportedDiagnosticReviewStatus =
  | 'pending_review'
  | 'verified'
  | 'reconciled'
  | 'rejected'
  | 'archived'

export type ReconciliationDecision =
  | 'accept_imported'
  | 'retain_authoritative'
  | 'reject_imported'
  | 'merge_distinct'
  | 'flag_conflict'
  | 'unreviewed'

// ==============================================================================
// 1. Integration System Metadata
// ==============================================================================

export interface HealthcareSystemMeta {
  systemCode: string
  name: string
  systemType: HealthcareSystemType
  interoperabilityStandard: InteroperabilityStandard
  endpointUrl?: string
  authMethod: 'oauth2_smart_fhir' | 'oauth2_client_credentials' | 'api_key' | 'mtls'
  status: IntegrationConnectionStatus
  lastSyncAt?: string
  syncIntervalMinutes: number
  circuitBreakerFailures: number
  isEnabled: boolean
  jurisdiction: string
  attributionText: string
  supportedResources: string[]
}

// ==============================================================================
// 2. HL7 FHIR R4 Data Models (Subset for Interoperability)
// ==============================================================================

export interface FHIRCoding {
  system: string
  code: string
  display: string
}

export interface FHIRCodeableConcept {
  coding: FHIRCoding[]
  text?: string
}

export interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary'
  system: string
  value: string
}

export interface FHIRPatientResource {
  resourceType: 'Patient'
  id?: string
  identifier: FHIRIdentifier[]
  active: boolean
  name: Array<{
    use?: string
    family: string
    given: string[]
    text?: string
  }>
  gender: 'male' | 'female' | 'other' | 'unknown'
  birthDate?: string
  address?: Array<{
    use?: string
    line?: string[]
    city?: string
    district?: string
    state?: string
    country?: string
  }>
  telecom?: Array<{
    system: 'phone' | 'email'
    value: string
  }>
}

export interface FHIRObservationResource {
  resourceType: 'Observation'
  id?: string
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected'
  category?: FHIRCodeableConcept[]
  code: FHIRCodeableConcept
  subject: {
    reference: string
    display?: string
  }
  effectiveDateTime: string
  issued?: string
  performer?: Array<{
    reference: string
    display?: string
  }>
  valueQuantity?: {
    value: number
    unit: string
    system?: string
    code?: string
  }
  valueString?: string
  interpretation?: FHIRCodeableConcept[]
  note?: Array<{ text: string }>
}

export interface FHIRDiagnosticReportResource {
  resourceType: 'DiagnosticReport'
  id?: string
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected'
  category?: FHIRCodeableConcept[]
  code: FHIRCodeableConcept
  subject: {
    reference: string
    display?: string
  }
  effectiveDateTime: string
  issued: string
  performer?: Array<{
    reference: string
    display?: string
  }>
  result?: Array<{
    reference: string
    display?: string
  }>
  conclusion?: string
  conclusionCode?: FHIRCodeableConcept[]
  presentedForm?: Array<{
    contentType: string
    title?: string
    data?: string
    url?: string
  }>
}

export interface FHIRServiceRequestResource {
  resourceType: 'ServiceRequest'
  id?: string
  status: 'draft' | 'active' | 'completed' | 'revoked'
  intent: 'order' | 'proposal' | 'plan'
  priority?: 'routine' | 'urgent' | 'asap' | 'stat'
  code: FHIRCodeableConcept
  subject: {
    reference: string
  }
  authoredOn: string
  requester?: {
    reference: string
    display?: string
  }
  reasonCode?: FHIRCodeableConcept[]
  note?: Array<{ text: string }>
}

// ==============================================================================
// 3. HL7 v2 and DICOM Interoperability Types
// ==============================================================================

export interface HL7v2ObservationSegment {
  setID: number
  valueType: string
  observationIdentifier: {
    identifier: string
    text: string
    nameOfCodingSystem: string
  }
  observationSubID?: string
  observationValue: string
  units?: string
  referencesRange?: string
  abnormalFlags?: string
  observationResultStatus: string // F=Final, P=Preliminary, C=Corrected
  observationDateTime: string
  producerId?: string
}

export interface ParsedHL7v2ORUMessage {
  messageControlId: string
  sendingApplication: string
  sendingFacility: string
  messageDateTime: string
  patientId: string
  patientName: string
  patientBirthDate?: string
  patientGender?: string
  orderNumber: string
  universalServiceIdentifier: string
  observations: HL7v2ObservationSegment[]
}

export interface DICOMSeriesMetadata {
  sopInstanceUID: string
  studyInstanceUID: string
  seriesInstanceUID: string
  modality: 'CT' | 'CR' | 'DX' | 'MR'
  studyDate: string
  studyDescription: string
  seriesDescription: string
  bodyPartExamined: string
  patientPosition?: string
  sliceThicknessMm?: number
  reconstructionKernel?: string
  radiationDose: {
    ctdiVolMgy?: number
    doseLengthProductMgyCm?: number
    isLowDoseProtocol: boolean
  }
  institutionName: string
  referringPhysicianName?: string
}

// ==============================================================================
// 4. Staged Records & Reconciliation Models
// ==============================================================================

export interface StagedDiagnosticRecordItem {
  id: string
  patientId: string
  systemId: string
  systemName: string
  externalRecordId: string
  recordType: 'laboratory_result' | 'imaging_report' | 'clinical_note' | 'referral_document'
  testOrExamCode?: string
  testOrExamName: string
  modality?: string
  specimenType?: string
  resultValue?: string
  resultUnit?: string
  referenceRange?: string
  statusInSource: string
  clinicalImpression?: string
  performedAt?: string
  reportedAt: string
  clinicianReviewStatus: ImportedDiagnosticReviewStatus
  reviewedBy?: string
  reviewedAt?: string
  clinicianActionNotes?: string
  reconciliationDecision: ReconciliationDecision
  isSuppressedOrArchived: boolean
}

export interface PatientIdentityMatchCandidate {
  patientId: string
  lungentPatientId: string
  fullName: string
  dateOfBirth?: string
  gender: string
  district: string
  matchConfidenceScore: number // 0.00 to 1.00
  matchClassification: 'exact_match' | 'probable_match' | 'unmatched' | 'ambiguous_conflict'
  matchingCriteria: string[]
}

export interface ReconciliationActionInput {
  recordId: string
  decision: 'accept_imported' | 'retain_authoritative' | 'reject_imported'
  clinicianNotes: string
  reviewerId: string
}

export interface HealthcareExchangeTransaction {
  id: string
  systemId: string
  systemName: string
  patientId?: string
  transactionType: 'inbound_import' | 'outbound_export' | 'identity_lookup' | 'facility_sync'
  standard: InteroperabilityStandard
  resourceType: string
  payloadHash: string
  status: 'success' | 'failed' | 'retrying' | 'blocked_no_consent'
  errorMessage?: string
  latencyMs: number
  consentVerified: boolean
  createdAt: string
}

export interface IHealthcareIntegrationAdapter {
  readonly systemCode: string
  readonly systemName: string
  readonly systemType: HealthcareSystemType
  readonly standard: InteroperabilityStandard
  getSystemMetadata(): HealthcareSystemMeta
  testConnection(): Promise<{ isConnected: boolean; latencyMs: number; statusText: string }>
  importDiagnosticRecords?(patientId: string, externalId: string): Promise<StagedDiagnosticRecordItem[]>
  exportAssessmentSummary?(patientId: string, assessmentPayload: Record<string, unknown>): Promise<{ success: boolean; externalReferenceId?: string }>
}

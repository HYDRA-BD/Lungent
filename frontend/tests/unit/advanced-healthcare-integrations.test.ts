import { describe, it, expect, beforeEach } from 'vitest'
import {
  // Registry & Adapters
  HealthcareAdapterRegistry,
  REGISTERED_HEALTHCARE_SYSTEMS,
  defaultAdapterRegistry,
  // FHIR R4 Transformer
  transformPatientToFHIR,
  transformSmokingObservationToFHIR,
  transformSpO2ObservationToFHIR,
  transformTBHistoryObservationToFHIR,
  transformServiceRequestToFHIR,
  transformDiagnosticReportToFHIR,
  parseFHIRObservationToStaged,
  parseFHIRDiagnosticReportToStaged,
  STANDARD_LOINC_CODES,
  STANDARD_SNOMED_CODES,
  // HL7 v2 Parser
  validateHL7v2Message,
  parseHL7v2ORUMessage,
  convertHL7DateToISO,
  hl7ObservationToStagedRecord,
  // DICOM Bridge
  parseDICOMMetadata,
  isLowDoseCTProtocol,
  dicomSeriesToFHIRDiagnosticReport,
  dicomSeriesToStagedRecord,
  LDCT_CTDIVOL_MAX_THRESHOLD_MGY,
  // Patient Identity Matching
  matchPatientIdentity,
  computeNameSimilarity,
  type InboundPatientQuery,
  type KnownPatientIdentityRecord,
  // Reconciliation
  RecordReconciliationService,
  defaultRecordReconciliationService,
  type StagedDiagnosticRecordItem,
  // Service & Actions
  HealthcareIntegrationService,
  REQUIRED_EXCHANGE_CONSENT_CODE,
  computePayloadHash,
  testHealthcareSystemConnectionAction,
  getRegisteredHealthcareSystemsAction,
  reconcileDiagnosticRecordAction,
} from '@/modules/integrations'

describe('Phase 2.9: Advanced Healthcare Integrations Suite', () => {
  // ============================================================================
  // 1. Adapter Registry & System Connectivity
  // ============================================================================
  describe('Healthcare Adapter Registry & Circuit Breaker', () => {
    it('initializes with all 6 mandated Bangladesh national and regional health systems', () => {
      expect(REGISTERED_HEALTHCARE_SYSTEMS.length).toBeGreaterThanOrEqual(6)
      const systems = defaultAdapterRegistry.getAvailableSystems()
      expect(systems.length).toBeGreaterThanOrEqual(6)

      const codes = systems.map(s => s.systemCode)
      expect(codes).toContain('dhis2-dghs-bd')
      expect(codes).toContain('openemr-smart-fhir')
      expect(codes).toContain('nicrh-lab-exchange')
      expect(codes).toContain('dghs-pacs-bridge')
      expect(codes).toContain('dghs-facility-registry')
      expect(codes).toContain('dghs-shr-identity')
    })

    it('tests connectivity with healthy latency', async () => {
      const res = await defaultAdapterRegistry.testConnection('openemr-smart-fhir')
      expect(res.isConnected).toBe(true)
      expect(res.latencyMs).toBeGreaterThan(0)
      expect(res.standard).toBe('hl7_fhir_r4')
      expect(res.statusText).toContain('Connected')
    })

    it('trips circuit breaker after 5 consecutive failures and marks system degraded', async () => {
      const isolatedRegistry = new HealthcareAdapterRegistry()
      const testCode = 'nicrh-lab-exchange'

      for (let i = 0; i < 4; i++) {
        isolatedRegistry.recordFailure(testCode)
      }
      expect(isolatedRegistry.getSystemMeta(testCode)?.status).toBe('active')

      // 5th failure trips the circuit breaker
      isolatedRegistry.recordFailure(testCode)
      const meta = isolatedRegistry.getSystemMeta(testCode)
      expect(meta?.status).toBe('degraded')
      expect(meta?.circuitBreakerFailures).toBe(5)

      // Test connection should reflect circuit breaker trip
      const pingRes = await isolatedRegistry.testConnection(testCode)
      expect(pingRes.isConnected).toBe(false)
      expect(pingRes.statusText).toContain('Circuit breaker tripped')

      // Recovery reset
      isolatedRegistry.resetCircuitBreaker(testCode)
      expect(isolatedRegistry.getSystemMeta(testCode)?.status).toBe('active')
      const recoveredPing = await isolatedRegistry.testConnection(testCode)
      expect(recoveredPing.isConnected).toBe(true)
    })
  })

  // ============================================================================
  // 2. HL7 FHIR R4 Transformer & Terminology Bindings
  // ============================================================================
  describe('HL7 FHIR R4 Transformer', () => {
    it('transforms Lungent patient model to standard FHIR R4 Patient resource', () => {
      const patient = {
        id: 'patient-uuid-1234',
        fullName: 'Abdur Rahim',
        gender: 'Male',
        dateOfBirth: '1965-04-12',
        district: 'Dhaka',
        contactNumber: '+8801711000000',
      }

      const fhir = transformPatientToFHIR(patient)
      expect(fhir.resourceType).toBe('Patient')
      expect(fhir.id).toBe('patient-uuid-1234')
      expect(fhir.active).toBe(true)
      expect(fhir.name[0].family).toBe('Rahim')
      expect(fhir.name[0].given).toContain('Abdur')
      expect(fhir.gender).toBe('male')
      expect(fhir.birthDate).toBe('1965-04-12')
      expect(fhir.address?.[0].district).toBe('Dhaka')
      expect(fhir.telecom?.[0].value).toBe('+8801711000000')
    })

    it('transforms smoking history to FHIR Observation with standard LOINC 72166-2', () => {
      const obs = transformSmokingObservationToFHIR('patient-uuid-1234', {
        isSmoker: true,
        packYears: 35,
        statusText: 'Heavy current smoker',
      })

      expect(obs.resourceType).toBe('Observation')
      expect(obs.status).toBe('final')
      expect(obs.code.coding[0].code).toBe(STANDARD_LOINC_CODES.TOBACCO_SMOKING_STATUS.code)
      expect(obs.code.coding[0].system).toBe('http://loinc.org')
      expect(obs.valueString).toBe('Heavy current smoker')
      expect(obs.note?.[0].text).toContain('Pack years: 35')
    })

    it('transforms SpO2 to FHIR Observation with LOINC 20564-1 and flags hypoxia', () => {
      const obs = transformSpO2ObservationToFHIR('patient-uuid-1234', 88)
      expect(obs.code.coding[0].code).toBe(STANDARD_LOINC_CODES.OXYGEN_SATURATION_SPO2.code)
      expect(obs.valueQuantity?.value).toBe(88)
      expect(obs.valueQuantity?.unit).toBe('%')
      expect(obs.interpretation?.[0].coding[0].code).toBe('L')
      expect(obs.interpretation?.[0].coding[0].display).toContain('Low / Hypoxia')
    })

    it('transforms Tuberculosis history to FHIR Observation with LOINC 21612-7', () => {
      const obs = transformTBHistoryObservationToFHIR('patient-uuid-1234', true)
      expect(obs.code.coding[0].code).toBe(STANDARD_LOINC_CODES.PRIOR_TUBERCULOSIS_HISTORY.code)
      expect(obs.valueString).toContain('History of active tuberculosis')
    })

    it('transforms Low-Dose CT recommendation to FHIR ServiceRequest with SNOMED 424132000', () => {
      const req = transformServiceRequestToFHIR('patient-uuid-1234', {
        priority: 'urgent',
        reason: 'PLCOm2012 risk score >= 2.5% with 35 pack-year smoking history',
      })

      expect(req.resourceType).toBe('ServiceRequest')
      expect(req.status).toBe('active')
      expect(req.intent).toBe('order')
      expect(req.priority).toBe('urgent')
      expect(req.code.coding[0].code).toBe(STANDARD_SNOMED_CODES.LOW_DOSE_CT_SCREENING.code)
      expect(req.note?.[0].text).toContain('PLCOm2012')
    })

    it('parses inbound FHIR Observation into staged diagnostic record with pending_review status', () => {
      const fhirObs = transformSpO2ObservationToFHIR('patient-999', 97)
      fhirObs.id = 'obs-external-555'

      const staged = parseFHIRObservationToStaged(fhirObs, 'openemr-smart-fhir', 'OpenEMR Tertiary Care')
      expect(staged.patientId).toBe('patient-999')
      expect(staged.externalRecordId).toBe('obs-external-555')
      expect(staged.clinicianReviewStatus).toBe('pending_review')
      expect(staged.reconciliationDecision).toBe('unreviewed')
      expect(staged.resultValue).toBe('97')
      expect(staged.resultUnit).toBe('%')
    })

    it('parses inbound FHIR DiagnosticReport into staged diagnostic record', () => {
      const fhirReport = transformDiagnosticReportToFHIR({
        id: 'rep-888',
        patientId: 'patient-999',
        reportTitle: 'CT Chest Diagnostic Examination',
        conclusion: 'No suspicious pulmonary nodules identified. Clear lung fields.',
        modality: 'CT',
      })

      const staged = parseFHIRDiagnosticReportToStaged(fhirReport, 'openemr-smart-fhir', 'OpenEMR Tertiary Care')
      expect(staged.patientId).toBe('patient-999')
      expect(staged.externalRecordId).toBe('rep-888')
      expect(staged.recordType).toBe('imaging_report')
      expect(staged.clinicalImpression).toContain('No suspicious pulmonary nodules')
      expect(staged.clinicianReviewStatus).toBe('pending_review')
    })
  })

  // ============================================================================
  // 3. HL7 v2.5.1 Parser & Diagnostic Normalization
  // ============================================================================
  describe('HL7 v2.5.1 Message Parser', () => {
    const sampleORU = `MSH|^~\\&|NICRH_LAB|NICRH_DHAKA|LUNGENT|LUNGENT_GATEWAY|20261105093000||ORU^R01|MSG-99201|P|2.5.1
PID|1||NICRH-MRN-4421^^^NICRH||Hassan^Kamrul^^^MD||19720815|M|||Dhaka^^1207^BGD
OBR|1|ORD-101122|ORD-101122|24356-8^CT Chest with Contrast^LN|||20261105091500
OBX|1|ST|24356-8^Impression^LN|1|Bilateral apical fibrotic scarring consistent with remote tuberculosis. No mass lesion.|mGy|||||F|||20261105092500|NICRH_RAD
OBX|2|NM|20564-1^Oxygen Saturation^LN|1|94|%|95-100|L|||F|||20261105092600|NICRH_PULM`

    it('validates message structure and flags invalid headers', () => {
      expect(validateHL7v2Message(sampleORU).isValid).toBe(true)
      expect(validateHL7v2Message('INVALID MESSAGE').isValid).toBe(false)
      expect(validateHL7v2Message('').isValid).toBe(false)
    })

    it('correctly parses ORU^R01 header, patient info, and observations', () => {
      const parsed = parseHL7v2ORUMessage(sampleORU)

      expect(parsed.sendingApplication).toBe('NICRH_LAB')
      expect(parsed.sendingFacility).toBe('NICRH_DHAKA')
      expect(parsed.messageControlId).toBe('MSG-99201')
      expect(parsed.patientId).toBe('NICRH-MRN-4421')
      expect(parsed.patientName).toBe('Kamrul Hassan')
      expect(parsed.patientBirthDate).toBe('1972-08-15')
      expect(parsed.patientGender).toBe('M')
      expect(parsed.orderNumber).toBe('ORD-101122')
      expect(parsed.observations.length).toBe(2)

      // First observation: CT impression
      const obs1 = parsed.observations[0]
      expect(obs1.observationIdentifier.identifier).toBe('24356-8')
      expect(obs1.observationValue).toContain('Bilateral apical fibrotic scarring')

      // Second observation: SpO2
      const obs2 = parsed.observations[1]
      expect(obs2.observationIdentifier.identifier).toBe('20564-1')
      expect(obs2.observationValue).toBe('94')
      expect(obs2.units).toBe('%')
      expect(obs2.referencesRange).toBe('95-100')
      expect(obs2.abnormalFlags).toBe('L')
    })

    it('converts HL7 date formats to standardized ISO-8601 strings', () => {
      expect(convertHL7DateToISO('20261105093000')).toBe('2026-11-05T09:30:00.000Z')
      expect(convertHL7DateToISO('19720815')).toBe('1972-08-15T00:00:00.000Z')
    })

    it('maps parsed HL7 observation to staged diagnostic record', () => {
      const parsed = parseHL7v2ORUMessage(sampleORU)
      const staged = hl7ObservationToStagedRecord(
        parsed,
        parsed.observations[1],
        'nicrh-lab-exchange',
        'NICRH Lab'
      )

      expect(staged.patientId).toBe('NICRH-MRN-4421')
      expect(staged.externalRecordId).toBe('ORD-101122-2')
      expect(staged.resultValue).toBe('94')
      expect(staged.resultUnit).toBe('%')
      expect(staged.referenceRange).toBe('95-100')
      expect(staged.clinicianReviewStatus).toBe('pending_review')
      expect(staged.reconciliationDecision).toBe('unreviewed')
    })
  })

  // ============================================================================
  // 4. DICOM Part 10 CT Bridge & Low-Dose CT Screening Parameters
  // ============================================================================
  describe('DICOM Part 10 CT Bridge', () => {
    it('accurately distinguishes Low-Dose CT (LDCT) protocols based on CTDIvol threshold', () => {
      // <= 3.0 mGy threshold for LDCT
      expect(isLowDoseCTProtocol(1.8, 85)).toBe(true)
      expect(isLowDoseCTProtocol(3.0, 140)).toBe(true)
      expect(isLowDoseCTProtocol(8.5, 380)).toBe(false)
      expect(isLowDoseCTProtocol(12.0, 520)).toBe(false)
      expect(LDCT_CTDIVOL_MAX_THRESHOLD_MGY).toBe(3.0)
    })

    it('parses raw DICOM CT metadata dictionary', () => {
      const rawDicom = {
        Modality: 'CT',
        SOPInstanceUID: '1.2.840.10008.5.1.4.1.1.2.9912',
        SeriesInstanceUID: '1.2.840.10008.5.1.4.1.1.2.9912.1',
        StudyDate: '2026-11-04',
        StudyDescription: 'Low-Dose Chest CT Screening Protocol',
        SeriesDescription: 'Axial Lung Thin Slices 1.0mm',
        SliceThickness: 1.0,
        ConvolutionKernel: 'BONE_PLUS',
        CTDIvol: 1.6,
        DLP: 78.5,
        InstitutionName: 'NICRH Cancer Center',
      }

      const meta = parseDICOMMetadata(rawDicom)
      expect(meta.modality).toBe('CT')
      expect(meta.sliceThicknessMm).toBe(1.0)
      expect(meta.radiationDose.ctdiVolMgy).toBe(1.6)
      expect(meta.radiationDose.doseLengthProductMgyCm).toBe(78.5)
      expect(meta.radiationDose.isLowDoseProtocol).toBe(true)
      expect(meta.institutionName).toBe('NICRH Cancer Center')
    })

    it('bridges DICOM CT series to FHIR DiagnosticReport and staged record', () => {
      const rawDicom = {
        Modality: 'CT',
        SeriesInstanceUID: '1.2.840.10008.7777',
        StudyDate: '2026-11-04',
        StudyDescription: 'Thoracic Screening CT',
        SeriesDescription: 'Axial 1.25mm LDCT',
        SliceThickness: 1.25,
        CTDIvol: 2.1,
        InstitutionName: 'Dhaka Medical College Hospital',
      }

      const meta = parseDICOMMetadata(rawDicom)
      const fhirReport = dicomSeriesToFHIRDiagnosticReport(meta, 'patient-uuid-1234')
      expect(fhirReport.resourceType).toBe('DiagnosticReport')
      expect(fhirReport.conclusion).toContain('Verified Low-Dose CT (LDCT) Protocol')
      expect(fhirReport.conclusion).toContain('CTDIvol: 2.1 mGy')

      const staged = dicomSeriesToStagedRecord(meta, 'patient-uuid-1234', 'dghs-pacs-bridge', 'DGHS PACS')
      expect(staged.patientId).toBe('patient-uuid-1234')
      expect(staged.modality).toBe('CT')
      expect(staged.clinicianReviewStatus).toBe('pending_review')
      expect(staged.clinicalImpression).toContain('LDCT (Low-Dose)')
    })
  })

  // ============================================================================
  // 5. Patient Identity Matching & Master Patient Index (MPI)
  // ============================================================================
  describe('Patient Identity Matching Engine', () => {
    const knownPatients: KnownPatientIdentityRecord[] = [
      {
        id: 'lungent-p-001',
        fullName: 'Md. Shahidul Islam',
        dateOfBirth: '1962-03-20',
        gender: 'Male',
        district: 'Dhaka',
        nationalIdHash: 'nid-sha256-abc123456789',
        externalMrn: 'MRN-TERTIARY-9941',
      },
      {
        id: 'lungent-p-002',
        fullName: 'Begum Rokeya Khatun',
        dateOfBirth: '1970-11-05',
        gender: 'Female',
        district: 'Chittagong',
        nationalIdHash: 'nid-sha256-def987654321',
      },
    ]

    it('performs deterministic match on verified National ID hash with 1.0 confidence', () => {
      const query: InboundPatientQuery = {
        fullName: 'Shahidul Islam',
        nationalIdHash: 'nid-sha256-abc123456789',
      }

      const candidates = matchPatientIdentity(query, knownPatients)
      expect(candidates.length).toBeGreaterThanOrEqual(1)
      expect(candidates[0].lungentPatientId).toBe('lungent-p-001')
      expect(candidates[0].matchConfidenceScore).toBe(1.0)
      expect(candidates[0].matchClassification).toBe('exact_match')
      expect(candidates[0].matchingCriteria).toContain('DETERMINISTIC_NATIONAL_ID_HASH_MATCH')
    })

    it('performs deterministic match on verified external MRN with 0.98 confidence', () => {
      const query: InboundPatientQuery = {
        fullName: 'M. S. Islam',
        externalMrn: 'MRN-TERTIARY-9941',
      }

      const candidates = matchPatientIdentity(query, knownPatients)
      expect(candidates.length).toBeGreaterThanOrEqual(1)
      expect(candidates[0].lungentPatientId).toBe('lungent-p-001')
      expect(candidates[0].matchConfidenceScore).toBe(0.98)
      expect(candidates[0].matchClassification).toBe('exact_match')
    })

    it('computes probabilistic match with name similarity, DOB, gender, and district', () => {
      const query: InboundPatientQuery = {
        fullName: 'Shahidul Islam', // Partial match
        dateOfBirth: '1962-03-20', // Exact DOB
        gender: 'Male', // Exact gender
        district: 'Dhaka', // Exact district
      }

      const candidates = matchPatientIdentity(query, knownPatients)
      expect(candidates.length).toBeGreaterThanOrEqual(1)
      const topMatch = candidates[0]
      expect(topMatch.lungentPatientId).toBe('lungent-p-001')
      expect(topMatch.matchConfidenceScore).toBeGreaterThanOrEqual(0.75)
      expect(topMatch.matchClassification).toMatch(/exact_match|probable_match/)
    })

    it('classifies completely distinct individual as unmatched or ambiguous', () => {
      const query: InboundPatientQuery = {
        fullName: 'Unknown Visitor',
        dateOfBirth: '2005-01-01',
        gender: 'Male',
        district: 'Sylhet',
      }

      const candidates = matchPatientIdentity(query, knownPatients)
      const topMatch = candidates[0]
      if (topMatch) {
        expect(topMatch.matchConfidenceScore).toBeLessThan(0.60)
        expect(topMatch.matchClassification).toBe('unmatched')
      }
    })

    it('correctly calculates name similarity across minor spelling variations', () => {
      expect(computeNameSimilarity('Kamrul Hassan', 'Kamrul Hasan')).toBeGreaterThan(0.8)
      expect(computeNameSimilarity('Abdur Rahim', 'Abdur Rahim')).toBe(1.0)
      expect(computeNameSimilarity('Different Name', 'Completely Unrelated')).toBeLessThan(0.35)
    })
  })

  // ============================================================================
  // 6. Record Reconciliation & Clinical Safety Non-Diagnostic Invariants
  // ============================================================================
  describe('Diagnostic Record Reconciliation Service & Safety Invariant', () => {
    const reconciliationService = new RecordReconciliationService()

    it('instantiates defaultRecordReconciliationService singleton', () => {
      expect(defaultRecordReconciliationService).toBeDefined()
    })

    const stagedItem: StagedDiagnosticRecordItem = {
      id: 'staged-rec-001',
      patientId: 'patient-uuid-1234',
      systemId: 'nicrh-lab-exchange',
      systemName: 'NICRH Lab',
      externalRecordId: 'ORD-5544',
      recordType: 'laboratory_result',
      testOrExamCode: '20564-1',
      testOrExamName: 'Oxygen Saturation',
      resultValue: '91',
      resultUnit: '%',
      statusInSource: 'final',
      reportedAt: new Date().toISOString(),
      clinicianReviewStatus: 'pending_review',
      reconciliationDecision: 'unreviewed',
      isSuppressedOrArchived: false,
    }

    it('enforces non-diagnostic safety invariant on unreviewed records', () => {
      const invariantCheck = reconciliationService.verifyNonDiagnosticSafetyInvariant(stagedItem)
      expect(invariantCheck.canDirectlyInfluenceClinicalRisk).toBe(false)
      expect(invariantCheck.safetyNotice).toContain('SAFETY NOTICE')
      expect(invariantCheck.safetyNotice).toContain('CANNOT autonomously alter patient risk assessment')
    })

    it('requires mandatory clinician notes and reviewer ID before reconciling', () => {
      expect(() =>
        reconciliationService.reconcileRecord(stagedItem, {
          recordId: stagedItem.id,
          decision: 'accept_imported',
          clinicianNotes: '', // Missing justification!
          reviewerId: 'clinician-dr-ali',
        })
      ).toThrowError(/Documented clinical justification is mandatory/)

      expect(() =>
        reconciliationService.reconcileRecord(stagedItem, {
          recordId: stagedItem.id,
          decision: 'accept_imported',
          clinicianNotes: 'Verified with repeat pulse oximetry',
          reviewerId: '', // Missing reviewer ID!
        })
      ).toThrowError(/Clinician reviewer ID is required/)
    })

    it('successfully validates and admits record on accept_imported decision', () => {
      const result = reconciliationService.reconcileRecord(stagedItem, {
        recordId: stagedItem.id,
        decision: 'accept_imported',
        clinicianNotes: 'Confirmed with arterial blood gas analysis at bedside. Valid data.',
        reviewerId: 'dr-karim-pulmonology',
      })

      expect(result.success).toBe(true)
      expect(result.updatedRecord.clinicianReviewStatus).toBe('verified')
      expect(result.updatedRecord.reconciliationDecision).toBe('accept_imported')
      expect(result.updatedRecord.reviewedBy).toBe('dr-karim-pulmonology')
      expect(result.updatedRecord.isSuppressedOrArchived).toBe(false)

      const invariantAfterReview = reconciliationService.verifyNonDiagnosticSafetyInvariant(result.updatedRecord)
      expect(invariantAfterReview.canDirectlyInfluenceClinicalRisk).toBe(true)
    })

    it('marks record archived on reject_imported decision', () => {
      const result = reconciliationService.reconcileRecord(stagedItem, {
        recordId: stagedItem.id,
        decision: 'reject_imported',
        clinicianNotes: 'Specimen hemolyzed during transit. Inaccurate readings rejected.',
        reviewerId: 'dr-karim-pulmonology',
      })

      expect(result.updatedRecord.clinicianReviewStatus).toBe('rejected')
      expect(result.updatedRecord.reconciliationDecision).toBe('reject_imported')
      expect(result.updatedRecord.isSuppressedOrArchived).toBe(true)
    })
  })

  // ============================================================================
  // 7. Healthcare Integration Service & Consent Gating
  // ============================================================================
  describe('Healthcare Integration Service & Consent Gate Guardrail', () => {
    let service: HealthcareIntegrationService

    beforeEach(() => {
      service = new HealthcareIntegrationService()
    })

    it('blocks data exchange when mandatory patient consent is missing or revoked', async () => {
      const res = await service.executeDataExchange({
        systemCode: 'openemr-smart-fhir',
        patientId: 'patient-uuid-1234',
        transactionType: 'outbound_export',
        resourceType: 'PatientClinicalSummary',
        payload: { patientId: 'patient-uuid-1234', data: 'confidential' },
        consentVerified: false, // NOT consented!
      })

      expect(res.success).toBe(false)
      expect(res.transaction.status).toBe('blocked_no_consent')
      expect(res.error).toContain('Mandatory patient consent')
      expect(res.transaction.consentVerified).toBe(false)
    })

    it('permits data exchange when valid consent code is verified', async () => {
      const res = await service.executeDataExchange({
        systemCode: 'openemr-smart-fhir',
        patientId: 'patient-uuid-1234',
        transactionType: 'outbound_export',
        resourceType: 'PatientClinicalSummary',
        payload: { patientId: 'patient-uuid-1234', riskScore: 0.042 },
        consentVerified: true,
        consentCode: REQUIRED_EXCHANGE_CONSENT_CODE,
      })

      expect(res.success).toBe(true)
      expect(res.transaction.status).toBe('success')
      expect(res.transaction.consentVerified).toBe(true)
      expect(res.transaction.payloadHash).toMatch(/^sha256-/)
    })

    it('exports patient clinical summary to valid FHIR R4 Bundle structure', () => {
      const summary = service.exportPatientClinicalSummaryToFHIR(
        {
          id: 'patient-7788',
          fullName: 'Sufia Begum',
          gender: 'Female',
          dateOfBirth: '1968-07-22',
          district: 'Sylhet',
        },
        {
          smoking: { isSmoker: true, packYears: 28 },
          spO2: 96,
          priorTB: false,
          ctScreeningRecommendation: { priority: 'routine', reason: 'Annual follow-up' },
        }
      )

      expect(summary.bundleType).toBe('collection')
      expect(summary.patient.id).toBe('patient-7788')
      expect(summary.observations.length).toBe(3)
      expect(summary.serviceRequests.length).toBe(1)
    })

    it('computes deterministic SHA-256 payload hash for audit tracking', () => {
      const hash1 = computePayloadHash({ patient: '123', result: '99' })
      const hash2 = computePayloadHash({ patient: '123', result: '99' })
      const hash3 = computePayloadHash({ patient: '123', result: '100' })

      expect(hash1).toBe(hash2)
      expect(hash1).not.toBe(hash3)
      expect(hash1.startsWith('sha256-')).toBe(true)
    })
  })

  // ============================================================================
  // 8. Server Actions
  // ============================================================================
  describe('Healthcare Integrations Server Actions', () => {
    it('executes testHealthcareSystemConnectionAction successfully', async () => {
      const res = await testHealthcareSystemConnectionAction('dhis2-dghs-bd')
      expect(res.success).toBe(true)
      expect(res.data?.isConnected).toBe(true)
      expect(res.data?.standard).toBe('rest_json')
    })

    it('executes getRegisteredHealthcareSystemsAction successfully', async () => {
      const res = await getRegisteredHealthcareSystemsAction()
      expect(res.success).toBe(true)
      expect(res.data?.length).toBeGreaterThanOrEqual(6)
    })

    it('handles reconcileDiagnosticRecordAction cleanly', async () => {
      const dummyRecord: StagedDiagnosticRecordItem = {
        id: 'rec-test-action',
        patientId: 'p-1',
        systemId: 'openemr-smart-fhir',
        systemName: 'OpenEMR',
        externalRecordId: 'ext-1',
        recordType: 'laboratory_result',
        testOrExamName: 'Pulse Oximetry',
        statusInSource: 'final',
        reportedAt: new Date().toISOString(),
        clinicianReviewStatus: 'pending_review',
        reconciliationDecision: 'unreviewed',
        isSuppressedOrArchived: false,
      }

      const res = await reconcileDiagnosticRecordAction(dummyRecord, {
        recordId: dummyRecord.id,
        decision: 'accept_imported',
        clinicianNotes: 'Verified in outpatient department review.',
        reviewerId: 'clinician-dr-rahman',
      })

      expect(res.success).toBe(true)
      expect(res.data?.updatedRecord.clinicianReviewStatus).toBe('verified')
    })
  })
})
